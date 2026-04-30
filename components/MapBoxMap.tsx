"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  lazy,
  Suspense,
  Activity,
} from "react";
import mapboxgl from "mapbox-gl";
import DOMPurify from "dompurify";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";
import MapSearch from "./MapSearch";
import type { Place } from "../types";
import { getCategoryIconPaths, DEFAULT_ICON_PATHS } from "../lib/categoryIcons";

// LAZY LOADING komponentów
const PlaceInfoPanel = lazy(() => import("./PlaceInfoPanel"));
const FullscreenGallery = lazy(() => import("./FullscreenGallery"));

interface MapBoxMapProps {
  places: Place[];
  disableGeolocation?: boolean;
  embedded?: boolean;
}

// ========================================
// CZYSTE FUNKCJE POZA KOMPONENTEM
// ========================================

function placesToGeoJSON(places: Place[]) {
  return {
    type: "FeatureCollection" as const,
    features: places
      .filter((p) => p.location?.coordinates)
      .map((p) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: p.location.coordinates,
        },
        properties: {
          placeId: p.id,
          categoryColor: p.Kategorie[0]?.color || "#3388ff",
          categoryId: p.Kategorie[0]?.id ?? 0,
        },
      })),
  };
}

// Wymiary pinu: 40×56px (viewBox), renderowany przy icon-size:1
const PIN_W = 40;
const PIN_H = 56;

/**
 * Buduje kompletny SVG pinu per kategoria — identyczny design jak CategoryPin w legendzie:
 * kolorowe wypełnienie łezki + białe kółko w środku + kolorowa ikona Lucide.
 */
function buildPinSVG(color: string, iconPaths: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W}" height="${PIN_H}" viewBox="0 0 40 56">` +
    // Łezka w kolorze kategorii
    `<path d="M20,2 C10.611,2 3,9.611 3,19 C3,31 20,54 20,54 C20,54 37,31 37,19 C37,9.611 29.389,2 20,2 Z" fill="${color}"/>` +
    // Białe kółko w środku
    `<circle cx="20" cy="19" r="11" fill="white"/>` +
    // Ikona Lucide w kolorze kategorii, skalowana z 24×24, wycentrowana w kółku
    `<g transform="translate(12,11) scale(0.667)" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">` +
    iconPaths +
    `</g>` +
    `</svg>`
  );
}

function loadImageFromSVG(
  map: mapboxgl.Map,
  imageId: string,
  svg: string,
  w: number,
  h: number,
  onDone: () => void,
): void {
  if (map.hasImage(imageId)) {
    onDone();
    return;
  }
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = new Image(w, h);
  img.onload = () => {
    if (!map.hasImage(imageId)) {
      map.addImage(imageId, img, { sdf: false });
    }
    URL.revokeObjectURL(url);
    onDone();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    onDone();
  };
  img.src = url;
}

/**
 * Ładuje jeden kompletny obraz pinu per kategoria ("pin-{id}").
 * Kolor i ikona są wbudowane w SVG — nie potrzeba SDF ani osobnych warstw.
 */
function loadCategoryMarkerSDFs(
  map: mapboxgl.Map,
  categories: Array<{ id: number; color: string }>,
  onLoaded: () => void,
): void {
  const allCategories = [
    { id: 0, color: "#3388ff" },
    ...categories,
  ];
  let remaining = allCategories.length;

  const done = () => {
    remaining--;
    if (remaining === 0) onLoaded();
  };

  allCategories.forEach(({ id, color }) => {
    const paths = id === 0 ? DEFAULT_ICON_PATHS : getCategoryIconPaths(id);
    const svg = buildPinSVG(color, paths);
    loadImageFromSVG(map, `pin-${id}`, svg, PIN_W, PIN_H, done);
  });
}

// ========================================
// KOMPONENT
// ========================================

export default function MapBoxMap({
  places,
  disableGeolocation = false,
  embedded = false,
}: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userLocationRequestedRef = useRef(false);
  const lastFittedPlacesRef = useRef<string>("");

  // GL Layers refs (zastępują markersRef)
  const layersInitializedRef = useRef(false);
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Refy dla stabilnych closures w eventach Mapboxa
  const placesRef = useRef<Place[]>(places);
  const popupDataMapRef = useRef<Map<number, string>>(new Map());
  // Race condition prevention
  const closePanelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPanelOpenRef = useRef(false);
  const isMapAnimatingRef = useRef(false);

  // Panel state
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  // Gallery state
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Map state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [mapLoadingState, setMapLoadingState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // ========================================
  // BASIC UTILITIES
  // ========================================

  const isValidMapboxToken = () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    return Boolean(token && token.startsWith("pk."));
  };

  // ========================================
  // CORE MAP FUNCTIONS
  // ========================================

  const animateToLocation = useCallback(
    (location: [number, number], zoom: number, duration = 1500) => {
      if (mapRef.current) {
        isMapAnimatingRef.current = true;
        mapRef.current.easeTo({
          center: location,
          zoom: zoom,
          duration: duration,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          essential: true,
        });
        // Zdejmij flagę po zakończeniu animacji (z marginesem 100ms)
        setTimeout(() => {
          isMapAnimatingRef.current = false;
        }, duration + 100);
      }
    },
    [],
  );

  const addUserLocationMarker = useCallback(
    (map: mapboxgl.Map, location: [number, number]) => {
      try {
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        }

        if (!map || !map.loaded()) {
          console.warn("⚠️ Map not loaded, skipping marker");
          return;
        }

        if (!document.head.querySelector("#user-location-styles")) {
          const style = document.createElement("style");
          style.id = "user-location-styles";
          style.textContent = `
            .user-location-marker {
              position: relative;
              width: 20px;
              height: 20px;
              cursor: pointer;
            }
            .user-location-marker .marker-dot {
              position: absolute;
              top: 0;
              left: 0;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #4285F4;
              border: 3px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              z-index: 2;
            }
            .user-location-marker .marker-pulse {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: rgba(66, 133, 244, 0.4);
              transform: translate(-50%, -50%);
              animation: user-location-pulse 2s infinite;
              z-index: 1;
            }
            @keyframes user-location-pulse {
              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
            }
          `;
          document.head.appendChild(style);
        }

        const userMarkerElement = document.createElement("div");
        userMarkerElement.className = "user-location-marker";
        userMarkerElement.innerHTML = `
          <div class="marker-dot"></div>
          <div class="marker-pulse"></div>
        `;

        const userPopupHTML = DOMPurify.sanitize(`
          <div>
            <h3>Ihre Position</h3>
            <p>Sie sind hier</p>
          </div>
        `);

        const popup = new mapboxgl.Popup({
          offset: [0, -15],
          closeButton: false,
          className: styles.popup,
        }).setHTML(userPopupHTML);

        const userMarker = new mapboxgl.Marker({ element: userMarkerElement })
          .setLngLat(location)
          .setPopup(popup)
          .addTo(map);

        userMarkerElement.addEventListener("mouseenter", () => {
          if (userMarker.getPopup()) userMarker.togglePopup();
        });

        userMarkerElement.addEventListener("mouseleave", () => {
          setTimeout(() => {
            if (userMarker.getPopup()?.isOpen()) userMarker.togglePopup();
          }, 300);
        });

        userLocationMarkerRef.current = userMarker;
      } catch (error) {
        console.error("❌ Błąd podczas dodawania markera użytkownika:", error);
      }
    },
    [],
  );

  // ========================================
  // PANEL FUNCTIONS
  // ========================================

  const openPanel = useCallback(
    (place: Place) => {
      // Anuluj aktywny timeout zamknięcia — zapobiega race condition
      // gdy nowa pinezka jest klikana zanim 600ms timeout z closePanel dobiegnie końca
      if (closePanelTimeoutRef.current) {
        clearTimeout(closePanelTimeoutRef.current);
        closePanelTimeoutRef.current = null;
      }

      setSelectedPlace(place);
      setIsPanelOpen(true);
      isPanelOpenRef.current = true;

      // Wyłącz interakcje dotykowe mapy gdy panel jest otwarty
      if (mapRef.current) {
        mapRef.current.dragPan.disable();
        mapRef.current.touchZoomRotate.disable();
        mapRef.current.touchPitch.disable();
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPanelVisible(true);

          if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom();
            setTimeout(() => {
              animateToLocation(
                place.location.coordinates,
                Math.max(currentZoom, 12),
                1200,
              );
            }, 300);
          }
        });
      });
    },
    [animateToLocation],
  );

  const closePanel = useCallback(() => {
    isPanelOpenRef.current = false;
    setIsPanelVisible(false);
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);

    // Przywróć interakcje dotykowe mapy
    if (mapRef.current) {
      mapRef.current.dragPan.enable();
      mapRef.current.touchZoomRotate.enable();
      mapRef.current.touchPitch.enable();
    }

    // Zapisz timeout do refa — openPanel może go anulować jeśli nowa pinezka
    // zostanie kliknięta przed upływem 600ms (race condition fix)
    closePanelTimeoutRef.current = setTimeout(() => {
      closePanelTimeoutRef.current = null;
      setIsPanelOpen(false);
    }, 600);
  }, []);

  const handleSearchPlaceSelect = useCallback(
    (place: Place) => {
      openPanel(place);
      setTimeout(() => {
        animateToLocation(place.location.coordinates, 14, 1200);
      }, 100);
    },
    [openPanel, animateToLocation],
  );

  // ========================================
  // GALLERY FUNCTIONS
  // ========================================

  const handleImageClick = useCallback((imagePath: string, index: number) => {
    setCurrentImageIndex(index);
    setSelectedGalleryImage(imagePath);
  }, []);

  const handleNextImage = useCallback(() => {
    const images = selectedPlace?.Galerie?.length
      ? selectedPlace.Galerie
      : selectedPlace?.Galerie_Bilder;
    if (!images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [selectedPlace?.Galerie, selectedPlace?.Galerie_Bilder]);

  const handlePrevImage = useCallback(() => {
    const images = selectedPlace?.Galerie?.length
      ? selectedPlace.Galerie
      : selectedPlace?.Galerie_Bilder;
    if (!images?.length) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  }, [selectedPlace?.Galerie, selectedPlace?.Galerie_Bilder]);

  const closeGalleryOnly = useCallback(() => {
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);
  }, []);

  // ========================================
  // GEOLOCATION
  // ========================================

  const getUserLocation = useCallback(() => {
    userLocationRequestedRef.current = true;

    if (!navigator.geolocation) {
      console.warn("❌ Geolocation wird von diesem Browser nicht unterstützt");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [longitude, latitude];
        setUserLocation(newLocation);

        if (mapRef.current) {
          setTimeout(() => {
            animateToLocation(newLocation, 14, 1800);
          }, 100);
        }
      },
      (error) => {
        console.error("❌ Geolocation-Fehler:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, [animateToLocation]);

  // ========================================
  // POPUP DATA (pre-computed, używane w hover tooltip)
  // ========================================

  const popupDataMap = useMemo<Map<number, string>>(() => {
    const dataMap = new Map<number, string>();
    places.forEach((place) => {
      const safeName = DOMPurify.sanitize(place.Name, { ALLOWED_TAGS: [] });
      const safeAddress = DOMPurify.sanitize(
        [place.Adresse, place.Stadt, place.Land ? `(${place.Land})` : ""]
          .filter(Boolean)
          .join(", "),
        { ALLOWED_TAGS: [] }
      );
      const safePhone = place.Telefon
        ? DOMPurify.sanitize(place.Telefon, { ALLOWED_TAGS: [] })
        : "";

      const phoneHTML = safePhone
        ? `<p class="${styles.popupPhone}"><a href="tel:${safePhone}" class="${styles.popupPhoneLink}">📞 ${safePhone}</a></p>`
        : "";

      const categoryBadgesHTML =
        place.Kategorie.length > 0
          ? `<div class="popup-category-badges">${place.Kategorie.map(
              (cat) =>
                `<span class="popup-category-badge" style="background-color:${DOMPurify.sanitize(cat.color, { ALLOWED_TAGS: [] })}">${DOMPurify.sanitize(cat.name, { ALLOWED_TAGS: [] })}</span>`,
            ).join("")}</div>`
          : "";

      const html = DOMPurify.sanitize(
        `<div class="${styles.modernPopup}">
          ${categoryBadgesHTML}
          <h3 class="${styles.popupTitle}">${safeName}</h3>
          <p class="${styles.popupAddress}">📍 ${safeAddress}</p>
          ${phoneHTML}
        </div>`,
        { ADD_ATTR: ["style", "href"] },
      );

      dataMap.set(place.id, html);
    });
    return dataMap;
  }, [places]);

  // ========================================
  // MAP INITIALIZATION
  // ========================================

  const initializeMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;
    if (layersInitializedRef.current) return;

    if (!isValidMapboxToken()) {
      setMapLoadingState("error");
      return;
    }

    try {
      setMapLoadingState("loading");
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation || [9.0, 47.5],
        zoom: userLocation ? 12 : 6,
        attributionControl: true,
        cooperativeGestures: disableGeolocation,
      });

      map.on("load", () => {
        setMapLoadingState("success");

        // Ustaw język na niemiecki
        try {
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach((layer) => {
              if (
                layer.type === "symbol" &&
                layer.layout &&
                "text-field" in layer.layout
              ) {
                try {
                  map.setLayoutProperty(layer.id, "text-field", [
                    "get",
                    "name_de",
                  ]);
                } catch {
                  // Ignoruj błędy dla konkretnych warstw
                }
              }
            });
          }
        } catch (error) {
          console.error("Error setting German language on map:", error);
        }

        // Ukryj oznaczenia dróg
        try {
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach((layer) => {
              if (
                layer.id.includes("shield") ||
                layer.id.includes("road-number")
              ) {
                map.setLayoutProperty(layer.id, "visibility", "none");
              }
            });
          }
        } catch (error) {
          console.warn("Could not hide road shields:", error);
        }

        map.addControl(new mapboxgl.NavigationControl(), "top-left");

        if (!disableGeolocation) {
          const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
            showUserLocation: true,
          });

          map.addControl(geolocateControl, "top-left");

          geolocateControl.on("geolocate", (e) => {
            userLocationRequestedRef.current = true;
            const { longitude, latitude } = e.coords;
            const location: [number, number] = [longitude, latitude];
            setUserLocation(location);
            setTimeout(() => {
              animateToLocation(location, 14, 1800);
            }, 150);
          });
        }

        // Załaduj piny dla każdej kategorii, następnie zainicjalizuj warstwy i eventy
        const categoryMap = new Map<number, string>();
        placesRef.current.forEach((p) =>
          p.Kategorie.forEach((cat) => categoryMap.set(cat.id, cat.color)),
        );
        const categories = Array.from(categoryMap.entries()).map(([id, color]) => ({ id, color }));
        loadCategoryMarkerSDFs(map, categories, () => {
          initializePlacesLayer(map);
          attachLayerEvents(map);
        });
      });

      map.on("error", (e) => {
        console.error("Błąd mapy:", e);
        setMapLoadingState("error");
      });

      mapRef.current = map;
    } catch (error) {
      console.error("Błąd inicjalizacji mapy:", error);
      setMapLoadingState("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Inicjalizuj tylko raz przy mount

  // ========================================
  // GL LAYERS: initializePlacesLayer
  // ========================================

  const initializePlacesLayer = useCallback(
    (map: mapboxgl.Map) => {
      if (layersInitializedRef.current) return;

      // SOURCE z klastrowaniem
      map.addSource("places-source", {
        type: "geojson",
        data: placesToGeoJSON(placesRef.current),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // LAYER: klastry (circle)
      map.addLayer({
        id: "places-clusters",
        type: "circle",
        source: "places-source",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#51bbd6",
            10,
            "#f1f075",
            30,
            "#f28cb1",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            10,
            30,
            30,
            40,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // LAYER: liczba w klastrze (symbol)
      map.addLayer({
        id: "places-cluster-count",
        type: "symbol",
        source: "places-source",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#fff",
        },
      });

      // LAYER: kompletny pin per kategoria (białe tło + kolorowy stroke + ikona)
      map.addLayer({
        id: "places-unclustered",
        type: "symbol",
        source: "places-source",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": [
            "match",
            ["get", "categoryId"],
            1, "pin-1",
            2, "pin-2",
            3, "pin-3",
            5, "pin-5",
            8, "pin-8",
            "pin-0",
          ],
          "icon-size": 1,
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
        },
        paint: {},
      });

      layersInitializedRef.current = true;

      // fitBounds przy pierwszym renderze
      updatePlacesData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Inicjalizuj tylko raz
  );

  // ========================================
  // GL LAYERS: updatePlacesData (zastępuje updateMarkers)
  // ========================================

  const updatePlacesData = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !layersInitializedRef.current) return;

    const source = map.getSource("places-source") as
      | mapboxgl.GeoJSONSource
      | undefined;
    if (!source) return;

    // Używamy placesRef.current zamiast places z closure — bo ta funkcja
    // może być wywołana z initializePlacesLayer (stała closure bez dostępu do places).
    const currentPlaces = placesRef.current;

    source.setData(
      placesToGeoJSON(currentPlaces) as GeoJSON.FeatureCollection<GeoJSON.Point>,
    );

    // fitBounds tylko gdy zmienił się zestaw miejsc.
    const placesKey = currentPlaces
      .map((p) => p.id)
      .sort()
      .join(",");
    if (currentPlaces.length > 0 && placesKey !== lastFittedPlacesRef.current) {
      lastFittedPlacesRef.current = placesKey;

      const bounds = new mapboxgl.LngLatBounds();
      currentPlaces
        .filter((p) => p.location?.coordinates)
        .forEach((p) => bounds.extend(p.location.coordinates));
      if (userLocation) bounds.extend(userLocation);

      const padding =
        window.innerWidth > 768
          ? { top: 80, bottom: 80, left: 80, right: 80 }
          : { top: 50, bottom: 50, left: 20, right: 20 };

      map.fitBounds(bounds, { padding, duration: 1000 });
    }
  }, [places, userLocation]);

  // ========================================
  // GL LAYERS: attachLayerEvents
  // ========================================

  const attachLayerEvents = useCallback(
    (map: mapboxgl.Map) => {
      // ---- KURSORY ----
      map.on("mouseenter", "places-unclustered", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "places-unclustered", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "places-clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "places-clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      // ---- HOVER TOOLTIP ----
      map.on("mouseenter", "places-unclustered", (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        const placeId = feature.properties?.placeId as number;
        const html = popupDataMapRef.current.get(placeId);
        if (!html) return;

        // Wyczyść debounce (jeśli kursor wrócił szybko)
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }

        // Zamknij poprzedni popup
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
          hoverPopupRef.current = null;
        }

        const geometry = feature.geometry as GeoJSON.Point;
        const coords = geometry.coordinates as [number, number];

        hoverPopupRef.current = new mapboxgl.Popup({
          offset: [0, -36],
          closeButton: false,
          className: styles.popup,
          maxWidth: "320px",
        })
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map);
      });

      map.on("mouseleave", "places-unclustered", () => {
        hoverTimeoutRef.current = setTimeout(() => {
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
            hoverPopupRef.current = null;
          }
          hoverTimeoutRef.current = null;
        }, 300);
      });

      // ---- KLIK na unclustered pin → otwórz panel ----
      map.on("click", "places-unclustered", (e) => {
        if (!e.features?.length) return;
        const placeId = e.features[0].properties?.placeId as number;
        const place = placesRef.current.find((p) => p.id === placeId);
        if (!place) return;

        // Zamknij hover popup
        if (hoverPopupRef.current) {
          hoverPopupRef.current.remove();
          hoverPopupRef.current = null;
        }

        openPanel(place);
        // Krytyczne: zatrzymaj propagację do ogólnego map.on("click")
        e.originalEvent.stopPropagation();
      });

      // ---- KLIK na klaster → zoom in ----
      map.on("click", "places-clusters", (e) => {
        if (!e.features?.length) return;
        const clusterId = e.features[0].properties?.cluster_id as number;
        const source = map.getSource(
          "places-source",
        ) as mapboxgl.GeoJSONSource;
        const geometry = e.features[0].geometry as GeoJSON.Point;
        const coords = geometry.coordinates as [number, number];

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          map.easeTo({ center: coords, zoom });
        });

        e.originalEvent.stopPropagation();
      });

      // ---- KLIK w pustą mapę → zamknij panel ----
      map.on("click", (e) => {
        // Ignoruj kliknięcia podczas programowej animacji mapy
        // (easeTo emituje synthetic click events które zamknęłyby świeżo otwarty panel)
        if (isMapAnimatingRef.current) return;
        // Ignoruj jeśli panel i tak nie jest otwarty
        if (!isPanelOpenRef.current) return;

        const features = map.queryRenderedFeatures(e.point, {
          layers: ["places-unclustered", "places-clusters"],
        });
        if (!features.length) {
          closePanel();
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // Stabilne — używa ref zamiast closures na places/openPanel/closePanel
  );

  // ========================================
  // EFFECTS
  // ========================================

  // Synchronizuj placesRef i popupDataMapRef z aktualnymi wartościami
  useEffect(() => {
    placesRef.current = places;
  }, [places]);

  useEffect(() => {
    popupDataMapRef.current = popupDataMap;
  }, [popupDataMap]);

  // Request user location po załadowaniu mapy
  useEffect(() => {
    if (disableGeolocation) return;
    if (mapLoadingState === "success" && !userLocationRequestedRef.current) {
      const timer = setTimeout(() => {
        getUserLocation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mapLoadingState, getUserLocation, disableGeolocation]);

  // Inicjalizacja mapy
  useEffect(() => {
    initializeMap();

    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closePanelTimeoutRef.current) clearTimeout(closePanelTimeoutRef.current);
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
        hoverPopupRef.current = null;
      }
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layersInitializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Inicjalizuj tylko raz przy mount, cleanup przy unmount

  // Aktualizuj dane GL source gdy places się zmienią (np. filtry)
  useEffect(() => {
    if (!mapRef.current || !layersInitializedRef.current) return;
    if (mapRef.current.isStyleLoaded()) updatePlacesData();
  }, [updatePlacesData]);

  // Dodaj user location marker po każdej zmianie lokalizacji
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const map = mapRef.current;
    if (map.isStyleLoaded()) {
      addUserLocationMarker(map, userLocation);
    } else {
      map.once("idle", () => {
        addUserLocationMarker(map, userLocation);
      });
    }
  }, [userLocation, addUserLocationMarker]);

  // ========================================
  // RENDER
  // ========================================

  if (!isValidMapboxToken()) {
    return (
      <div className={styles.mapContainerWrapper}>
        <div className={styles.errorContainer}>
          <h3>Konfigurationsfehler</h3>
          <p>Mapbox-Token ist nicht konfiguriert oder ungültig.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.mapContainerWrapper}${embedded ? ` ${styles.mapContainerWrapperEmbedded}` : ""}`}
    >
      {mapLoadingState === "error" && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorContainer}>
            <h3>Fehler beim Laden der Karte</h3>
            <p>Die Karte konnte nicht geladen werden.</p>
            <button
              type="button"
              onClick={initializeMap}
              className={styles.retryButton}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      <div ref={containerRef} className={styles.mapContainer} />

      {!embedded && (
        <MapSearch
          places={places}
          onPlaceSelectAction={handleSearchPlaceSelect}
          disabled={mapLoadingState !== "success"}
        />
      )}

      <Activity mode={isPanelOpen ? "visible" : "hidden"}>
        <Suspense
          fallback={
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}>Panel wird geladen...</div>
            </div>
          }
        >
          <PlaceInfoPanel
            place={selectedPlace}
            isOpen={isPanelOpen}
            isVisible={isPanelVisible}
            onCloseAction={closePanel}
            onImageClickAction={handleImageClick}
          />
        </Suspense>
      </Activity>

      {selectedGalleryImage && (selectedPlace?.Galerie?.length || selectedPlace?.Galerie_Bilder?.length) && (
        <Suspense
          fallback={
            <div className={styles.loadingOverlayGallery}>
              <div className={styles.loadingSpinner}>
                Galerie wird geladen...
              </div>
            </div>
          }
        >
          <FullscreenGallery
            place={selectedPlace}
            currentIndex={currentImageIndex}
            isOpen={!!selectedGalleryImage}
            onCloseAction={closeGalleryOnly}
            onNextAction={handleNextImage}
            onPrevAction={handlePrevImage}
          />
        </Suspense>
      )}
    </div>
  );
}

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
import MapSearch from "./MapSearch"; // ✅ IMPORT
import type { Place } from "../types";

// LAZY LOADING komponentów
const PlaceInfoPanel = lazy(() => import("./PlaceInfoPanel"));
const FullscreenGallery = lazy(() => import("./FullscreenGallery"));

interface MapBoxMapProps {
  places: Place[];
}

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userLocationRequestedRef = useRef(false);

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
    null
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
        mapRef.current.easeTo({
          center: location,
          zoom: zoom,
          duration: duration,
          easing: (t) => 1 - Math.pow(1 - t, 3),
          essential: true,
        });
      }
    },
    []
  );

  const addUserLocationMarker = useCallback(
    (map: mapboxgl.Map, location: [number, number]) => {
      console.log("🎯 addUserLocationMarker called with location:", location);
      try {
        if (userLocationMarkerRef.current) {
          console.log("🗑️ Removing old user location marker");
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        }

        if (!map || !map.loaded()) {
          console.warn("⚠️ Map not loaded, skipping marker");
          return;
        }
        console.log("✅ Map loaded, adding user marker...");

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

        // ✅ XSS PROTECTION: Sanityzacja HTML (choć to statyczny tekst)
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
        console.log("✅ User location marker added successfully!");
      } catch (error) {
        console.error("❌ Błąd podczas dodawania markera użytkownika:", error);
      }
    },
    [] // Empty deps is OK - this function doesn't depend on external state
  );

  // ========================================
  // PANEL FUNCTIONS
  // ========================================

  const openPanel = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      setIsPanelOpen(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPanelVisible(true);

          if (mapRef.current) {
            const currentZoom = mapRef.current.getZoom();
            setTimeout(() => {
              animateToLocation(
                [place.Lange, place.Breite],
                Math.max(currentZoom, 12),
                1200
              );
            }, 300);
          }
        });
      });
    },
    [animateToLocation]
  );

  const closePanel = useCallback(() => {
    setIsPanelVisible(false);
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);

    setTimeout(() => {
      setIsPanelOpen(false);
    }, 600);
  }, []);

  // ✅ POPRAWIONY HANDLER DLA WYSZUKIWARKI
  const handleSearchPlaceSelect = useCallback(
    (place: Place) => {
      // Najpierw otwórz panel
      openPanel(place);

      // Następnie animuj do miejsca (po krótkim opóźnieniu)
      setTimeout(() => {
        animateToLocation([place.Lange, place.Breite], 14, 1200);
      }, 100);
    },
    [openPanel, animateToLocation]
  );

  // ========================================
  // GALLERY FUNCTIONS
  // ========================================

  const handleImageClick = useCallback((imagePath: string, index: number) => {
    setCurrentImageIndex(index);
    setSelectedGalleryImage(imagePath);
  }, []);

  const handleNextImage = useCallback(() => {
    if (!selectedPlace?.Galerie_Bilder) return;
    setCurrentImageIndex(
      (prev) => (prev + 1) % selectedPlace.Galerie_Bilder!.length
    );
  }, [selectedPlace?.Galerie_Bilder]);

  const handlePrevImage = useCallback(() => {
    if (!selectedPlace?.Galerie_Bilder) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedPlace.Galerie_Bilder!.length - 1 : prev - 1
    );
  }, [selectedPlace?.Galerie_Bilder]);

  const closeGalleryOnly = useCallback(() => {
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);
  }, []);

  // ========================================
  // GEOLOCATION
  // ========================================

  const getUserLocation = useCallback(() => {
    console.log("🔍 getUserLocation called, mapLoadingState:", mapLoadingState);
    userLocationRequestedRef.current = true;

    if (!navigator.geolocation) {
      console.warn("❌ Geolocation wird von diesem Browser nicht unterstützt");
      return;
    }

    console.log("📍 Requesting geolocation permission...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [longitude, latitude];
        console.log("✅ Location received:", newLocation);
        setUserLocation(newLocation);

        if (mapRef.current) {
          console.log("🗺️ Map exists, animating to location...");
          // Small delay to ensure smooth animation after location received
          setTimeout(() => {
            animateToLocation(newLocation, 14, 1800);
          }, 100);
        } else {
          console.warn("⚠️ Map not ready yet, location saved but not animated");
        }
      },
      (error) => {
        console.error("❌ Geolocation-Fehler:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn(
              "🚫 Benutzer hat den Zugriff auf die Position verweigert"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn("📍 Positionsinformationen sind nicht verfügbar");
            break;
          case error.TIMEOUT:
            console.warn("⏱️ Zeitüberschreitung beim Abrufen der Position");
            break;
          default:
            console.warn(
              "❓ Ein unbekannter Fehler beim Abrufen der Position ist aufgetreten"
            );
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [mapLoadingState, animateToLocation]); // ✅ Include dependencies for React 19

  // ========================================
  // MAP INITIALIZATION
  // ========================================

  const initializeMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    if (!isValidMapboxToken()) {
      setMapLoadingState("error");
      return;
    }

    try {
      setMapLoadingState("loading");
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        // ✅ Streets v12 - supports MapboxLanguage plugin for German labels
        // Note: "standard" style does NOT support language changes via API
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation || [9.0, 47.5],
        zoom: userLocation ? 12 : 6,
        attributionControl: false,
      });

      map.on("load", () => {
        setMapLoadingState("success");

        // ✅ Manual German language change for all symbol layers
        // This works with streets-v12 style by changing {name} to {name_de}
        try {
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach((layer) => {
              if (layer.type === "symbol" && layer.layout && "text-field" in layer.layout) {
                try {
                  // Change text-field from {name} or {name_en} to {name_de}
                  map.setLayoutProperty(layer.id, "text-field", ["get", "name_de"]);
                } catch (layerError) {
                  console.warn(`Could not set German language for layer ${layer.id}:`, layerError);
                }
              }
            });
          }
        } catch (error) {
          console.error("Error setting German language on map:", error);
        }

        map.addControl(new mapboxgl.NavigationControl(), "top-left");

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

          // ✅ Marker będzie dodany przez osobny useEffect reagujący na userLocation
          // addUserLocationMarker(map, location); - PRZENIESIONE DO useEffect

          setTimeout(() => {
            animateToLocation(location, 14, 1800);
          }, 150);
        });

        // ✅ Usunięto - marker jest teraz dodawany przez osobny useEffect
        // if (userLocation) {
        //   addUserLocationMarker(map, userLocation);
        // }
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
    // ✅ REACT 19.2: Closure ma dostęp do początkowej wartości userLocation
    // oraz do stabilnych referencji addUserLocationMarker i animateToLocation.
    // Mapa jest inicjalizowana tylko raz - kolejne zmiany userLocation
    // są obsługiwane przez geolocateControl.on("geolocate") i updateMarkers useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Inicjalizuj tylko raz przy mount

  // ========================================
  // MARKERS MANAGEMENT
  // ========================================

  // ✅ REACT 19.2: useMemo dla popup contents - generuj HTML tylko gdy places się zmienią
  const popupContents = useMemo(() => {
    return places.map((place) => {
      // ✅ XSS PROTECTION: Escape user input before building HTML
      const safeName = DOMPurify.sanitize(place.Name, { ALLOWED_TAGS: [] });
      const safeAddress = DOMPurify.sanitize(place.Adresse, {
        ALLOWED_TAGS: [],
      });
      const safePhone = place.Telefon
        ? DOMPurify.sanitize(place.Telefon, { ALLOWED_TAGS: [] })
        : "";
      const safeDescription = place.Vollbeschreibung
        ? DOMPurify.sanitize(
            place.Vollbeschreibung.replace(/<[^>]*>/g, "").substring(0, 100),
            { ALLOWED_TAGS: [] }
          )
        : "";

      const phoneHTML = safePhone
        ? `<p class="${styles.popupPhone}"><a href="tel:${safePhone}" class="${styles.popupPhoneLink}">📞 ${safePhone}</a></p>`
        : "";

      const popupContent = `
        <div class="${styles.modernPopup}">
          <h3 class="${styles.popupTitle}">${safeName}</h3>
          <p class="${styles.popupAddress}">📍 ${safeAddress}</p>
          ${phoneHTML}
          ${
            safeDescription
              ? `<p class="${styles.popupDescription}">${safeDescription}...</p>`
              : ""
          }
        </div>
      `;

      // ✅ XSS PROTECTION: Final sanitization of complete HTML
      const safePopupContent = DOMPurify.sanitize(popupContent);

      return {
        placeId: place.id,
        color: place.Kategorie[0]?.color || "#3388ff",
        content: safePopupContent,
      };
    });
  }, [places]); // ✅ Tylko gdy places się zmienią

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    try {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      places.forEach((place, index) => {
        if (!place.Breite || !place.Lange) return;

        // ✅ REACT 19.2: Użyj pre-computed popup content z useMemo
        const popupData = popupContents[index];

        const popup = new mapboxgl.Popup({
          offset: [0, -20],
          closeButton: false,
          className: styles.popup,
        }).setHTML(popupData.content);

        const marker = new mapboxgl.Marker({
          color: popupData.color,
          scale: 0.8,
        })
          .setLngLat([place.Lange, place.Breite])
          .setPopup(popup)
          .addTo(map);

        const markerElement = marker.getElement();
        markerElement.style.cursor = "pointer";

        let popupTimeout: NodeJS.Timeout;
        markerElement.addEventListener("mouseenter", () => {
          clearTimeout(popupTimeout);
          marker.togglePopup();
        });

        markerElement.addEventListener("mouseleave", () => {
          popupTimeout = setTimeout(() => {
            if (marker.getPopup()?.isOpen()) marker.togglePopup();
          }, 300);
        });

        markerElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (marker.getPopup()?.isOpen()) marker.togglePopup();
          openPanel(place);
        });

        // Add touch support
        markerElement.style.touchAction = "manipulation";
        markerElement.style.setProperty(
          "-webkit-tap-highlight-color",
          "transparent"
        );

        markersRef.current.push(marker);
      });

      // ✅ Dopasuj widok mapy aby pokazać wszystkie markery
      if (places.length > 0 && !isPanelOpen) {
        const bounds = new mapboxgl.LngLatBounds();
        places.forEach((p) => {
          if (p.Breite && p.Lange) {
            bounds.extend([p.Lange, p.Breite]);
          }
        });
        if (userLocation) bounds.extend(userLocation);

        // ✅ Responsive padding - więcej na desktop, mniej na mobile
        const padding = window.innerWidth > 768
          ? { top: 80, bottom: 80, left: 80, right: 80 }
          : { top: 50, bottom: 50, left: 20, right: 20 };

        map.fitBounds(bounds, {
          padding,
          duration: 1000, // Płynna animacja 1s
          maxZoom: 12 // Nie zbliżaj zbyt mocno
        });
      }
    } catch (error) {
      console.error("Błąd aktualizacji markerów:", error);
    }
  }, [places, popupContents, isPanelOpen, userLocation, openPanel]);

  // ========================================
  // EFFECTS
  // ========================================

  // ✅ Request user location automatically after map loads (React 19 compatible)
  useEffect(() => {
    if (mapLoadingState === "success" && !userLocationRequestedRef.current) {
      // Wait to ensure map is fully ready and loaded
      const timer = setTimeout(() => {
        getUserLocation();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [mapLoadingState, getUserLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // ✅ REACT 19.2: initializeMap ma pustą deps array, więc jest stabilne.
    // Ten Effect uruchamia się tylko raz przy mount i sprząta przy unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Inicjalizuj tylko raz przy mount, cleanup przy unmount

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // ✅ POPRAWKA: Użyj isStyleLoaded() zamiast loaded()
    // isStyleLoaded() jest bardziej niezawodne dla dodawania markerów
    if (map.isStyleLoaded()) {
      updateMarkers();
    } else {
      // ✅ Użyj 'idle' zamiast 'load' - bardziej niezawodne
      const handleIdle = () => {
        updateMarkers();
        map.off("idle", handleIdle); // Usuń listener po pierwszym wywołaniu
      };
      map.on("idle", handleIdle);

      return () => {
        map.off("idle", handleIdle); // Cleanup
      };
    }
  }, [updateMarkers]);

  // ✅ REACT 19.2: Dodaj user location marker po każdej zmianie lokalizacji
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

  // ✅ REACT 19.2: Usunięto ten useEffect - Activity zachowuje stan automatycznie
  // useEffect(() => {
  //   if (!isPanelOpen && selectedPlace) {
  //     setSelectedPlace(null);
  //   }
  // }, [isPanelOpen, selectedPlace]);

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
    <div className={styles.mapContainerWrapper}>
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

      {/* ✅ WYSZUKIWARKA Z POPRAWNYM HANDLEREM */}
      <MapSearch
        places={places}
        onPlaceSelectAction={handleSearchPlaceSelect}
        disabled={mapLoadingState !== "success"}
      />

      {/* ✅ REACT 19.2: Użyj Activity zamiast warunkowego renderowania */}
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

      {selectedGalleryImage && selectedPlace?.Galerie_Bilder && (
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

// components/MapBoxMap.tsx - POPRAWIONY z pulsującym markerem
"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  lazy,
  Suspense,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";
import type { Place } from "../types";

// ✅ LAZY LOADING komponentów
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
  const [locationError, setLocationError] = useState<string | null>(null);
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
      try {
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        }

        if (!map || !map.loaded()) return;

        // ✅ DODAJ STYLE CSS dla pulsującego markera
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

        // ✅ UTWÓRZ pulsujący marker element
        const userMarkerElement = document.createElement("div");
        userMarkerElement.className = "user-location-marker";
        userMarkerElement.innerHTML = `
          <div class="marker-dot"></div>
          <div class="marker-pulse"></div>
        `;

        const popup = new mapboxgl.Popup({
          offset: [0, -15],
          closeButton: false,
          className: styles.popup,
        }).setHTML(`
          <div>
            <h3>Ihre Position</h3>
            <p>Sie sind hier</p>
          </div>
        `);

        const userMarker = new mapboxgl.Marker({ element: userMarkerElement })
          .setLngLat(location)
          .setPopup(popup)
          .addTo(map);

        // ✅ HOVER events dla popup
        userMarkerElement.addEventListener("mouseenter", () => {
          if (userMarker.getPopup()) userMarker.togglePopup();
        });

        userMarkerElement.addEventListener("mouseleave", () => {
          setTimeout(() => {
            if (userMarker.getPopup()?.isOpen()) userMarker.togglePopup();
          }, 300);
        });

        userLocationMarkerRef.current = userMarker;

        console.log("✅ PULSUJĄCY MARKER DODANY!", location); // DEBUG
      } catch (error) {
        console.warn("Błąd podczas dodawania markera użytkownika:", error);
      }
    },
    []
  );

  // ========================================
  // PANEL FUNCTIONS
  // ========================================

  const openPanel = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      setIsPanelOpen(true);

      // Animate panel
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsPanelVisible(true);

          // Animate map to place location
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
      setSelectedPlace(null); // ✅ PRZYWRÓCONE: resetuj place po animacji

      // Optional: return to user location
      if (mapRef.current && userLocation) {
        animateToLocation(userLocation, 14, 1800);
      }
    }, 600);
  }, [userLocation, animateToLocation]);

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

  // ✅ NOWA funkcja - zamyka TYLKO galerię, nie panel
  const closeGalleryOnly = useCallback(() => {
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);
    // NIE ZAMYKAJ panelu!
  }, []);

  // ========================================
  // GEOLOCATION
  // ========================================

  const getUserLocation = useCallback(() => {
    userLocationRequestedRef.current = true;

    if (!navigator.geolocation) {
      setLocationError("Geolocation wird von diesem Browser nicht unterstützt");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [longitude, latitude];
        setUserLocation(newLocation);
        setLocationError(null);

        console.log("📍 LOKALIZACJA ZNALEZIONA:", newLocation); // DEBUG

        if (mapRef.current) {
          setTimeout(() => {
            animateToLocation(newLocation, 14, 1800);
            addUserLocationMarker(mapRef.current!, newLocation); // ✅ DODAJ MARKER!
          }, 100);
        }
      },
      (error) => {
        console.error("Geolocation-Fehler:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Benutzer hat den Zugriff auf die Position verweigert"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Positionsinformationen sind nicht verfügbar");
            break;
          case error.TIMEOUT:
            setLocationError("Zeitüberschreitung beim Abrufen der Position");
            break;
          default:
            setLocationError(
              "Ein unbekannter Fehler beim Abrufen der Position ist aufgetreten"
            );
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [animateToLocation, addUserLocationMarker]);

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
        style: "mapbox://styles/mapbox/streets-v12",
        center: userLocation || [9.0, 47.5],
        zoom: userLocation ? 12 : 6,
        attributionControl: false,
      });

      map.on("load", () => {
        setMapLoadingState("success");

        // Add controls
        map.addControl(new mapboxgl.NavigationControl(), "top-left");

        const geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
          showUserLocation: true,
        });

        map.addControl(geolocateControl, "top-left");

        // ✅ WAŻNE: Event listener dla przycisku geolokalizacji
        geolocateControl.on("geolocate", (e) => {
          userLocationRequestedRef.current = true;
          const { longitude, latitude } = e.coords;
          const location: [number, number] = [longitude, latitude];
          setUserLocation(location);

          console.log("🎯 GEOLOCATE EVENT:", location); // DEBUG

          // ✅ DODAJ PULSUJĄCY MARKER natychmiast
          addUserLocationMarker(map, location);

          setTimeout(() => {
            animateToLocation(location, 14, 1800);
          }, 150);
        });

        // ✅ JEŚLI już mamy lokalizację, dodaj marker
        if (userLocation) {
          console.log(
            "🔄 DODANIE MARKERA dla istniejącej lokalizacji:",
            userLocation
          );
          addUserLocationMarker(map, userLocation);
        }
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
  }, [userLocation, addUserLocationMarker, animateToLocation]);

  // ========================================
  // MARKERS MANAGEMENT
  // ========================================

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      places.forEach((place) => {
        if (!place.Breite || !place.Lange) return;

        const color = place.Kategorie[0]?.color || "#3388ff";

        const popupContent = `
          <div>
            <h3>${place.Name}</h3>
            <p style="font-style: italic; color: #666;">${place.Adresse}</p>
            ${
              place.Vollbeschreibung
                ? `<p>${place.Vollbeschreibung.replace(
                    /<[^>]*>/g,
                    ""
                  ).substring(0, 100)}...</p>`
                : ""
            }
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: [0, -20],
          closeButton: false,
          className: styles.popup,
        }).setHTML(popupContent);

        const marker = new mapboxgl.Marker({ color, scale: 0.8 })
          .setLngLat([place.Lange, place.Breite])
          .setPopup(popup)
          .addTo(map);

        const markerElement = marker.getElement();
        markerElement.style.cursor = "pointer";

        // Hover events
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

        // Click event - open panel
        markerElement.addEventListener("click", (e) => {
          e.stopPropagation();
          if (marker.getPopup()?.isOpen()) marker.togglePopup();
          openPanel(place);
        });

        markersRef.current.push(marker);
      });

      // Fit bounds if no user location requested
      if (
        places.length > 0 &&
        !isPanelOpen &&
        !userLocationRequestedRef.current
      ) {
        const bounds = new mapboxgl.LngLatBounds();
        places.forEach((p) => bounds.extend([p.Lange, p.Breite]));
        if (userLocation) bounds.extend(userLocation);
        map.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Błąd aktualizacji markerów:", error);
    }
  }, [places, isPanelOpen, userLocation, openPanel]);

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      // Cleanup
      markersRef.current.forEach((marker) => marker.remove());
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    if (map.loaded()) {
      updateMarkers();
    } else {
      map.on("load", updateMarkers);
    }
  }, [updateMarkers]);

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
      {/* Loading state */}
      {mapLoadingState === "loading" && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>Karte wird geladen...</div>
        </div>
      )}

      {/* Error state */}
      {mapLoadingState === "error" && (
        <div className={styles.errorOverlay}>
          <div className={styles.errorContainer}>
            <h3>Fehler beim Laden der Karte</h3>
            <p>Die Karte konnte nicht geladen werden.</p>
            <button onClick={initializeMap} className={styles.retryButton}>
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Map */}
      <div ref={containerRef} className={styles.mapContainer} />

      {/* Location error */}
      {locationError && (
        <div className={styles.locationError}>
          <p>{locationError}</p>
          <button onClick={getUserLocation} className={styles.retryButton}>
            Erneut versuchen
          </button>
        </div>
      )}

      {/* ✅ ZAWSZE RENDERUJ panel - gładkie animacje */}
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

      {/* ✅ LAZY LOADING: Fullscreen Gallery */}
      {selectedGalleryImage && selectedPlace?.Galerie_Bilder && (
        <Suspense
          fallback={
            <div className={styles.loadingOverlay} style={{ zIndex: 12001 }}>
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

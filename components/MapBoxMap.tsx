// components/MapBoxMap.tsx
"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";
import Image from "next/image";
import { AudioPlayer, ImageGallery, PlaceImage } from "./MediaComponents";
import type { Place } from "../types";
import { getOptimizedImagePath } from "../lib/supabase";

interface MapBoxMapProps {
  places: Place[];
}

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const userLocationRequestedRef = useRef(false);
  const isMobile = useRef(false);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapLoadingState, setMapLoadingState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Walidacja Mapbox token
  const isValidMapboxToken = () => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    return Boolean(token && token.startsWith("pk."));
  };

  // ✅ UPROSZCZONA funkcja resizeMap - nie potrzebuje już synchronizacji z panelem
  const resizeMap = useCallback(() => {
    if (mapRef.current) {
      const resize = () => {
        try {
          mapRef.current?.resize();
        } catch (error) {
          console.warn("Błąd podczas aktualizacji rozmiaru mapy:", error);
        }
      };

      resize();
      setTimeout(resize, 50);
    }
  }, []);

  // Sprawdź czy urządzenie jest mobilne
  useEffect(() => {
    const checkIfMobile = () => {
      isMobile.current = window.matchMedia("(max-width: 768px)").matches;
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Animacja do lokalizacji z płynnym wygładzaniem
  const animateToLocation = useCallback(
    (location: [number, number], zoom: number, duration = 1500) => {
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: location,
          zoom: zoom,
          duration: duration,
          easing: (t) => {
            return 1 - Math.pow(1 - t, 3);
          },
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

        if (!map || !map.loaded()) {
          console.warn("Mapa nie jest gotowa do dodania markera użytkownika");
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

        const popup = new mapboxgl.Popup({
          offset: [0, -15],
          closeButton: false,
          className: styles.popup,
        }).setHTML(`
          <div class="${styles.popupContent}">
            <h3>Ihre Position</h3>
            <p>Sie sind hier</p>
          </div>
        `);

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
        console.warn("Błąd podczas dodawania markera użytkownika:", error);
      }
    },
    []
  );

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

        if (mapRef.current) {
          setTimeout(() => {
            animateToLocation(newLocation, 14, isMobile.current ? 2000 : 1800);
            addUserLocationMarker(mapRef.current!, newLocation);
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
  }, [addUserLocationMarker, animateToLocation]);

  const initializeMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    if (!isValidMapboxToken()) {
      setMapLoadingState("error");
      console.error("Nieprawidłowy lub brakujący token Mapbox");
      return;
    }

    try {
      setMapLoadingState("loading");
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
      const initialCenter: [number, number] = userLocation || [9.0, 47.5];
      const initialZoom = userLocation ? 12 : 6;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false,
        locale: {
          "GeolocateControl.FindMyLocation": "Meine Position finden",
          "GeolocateControl.LocationNotAvailable": "Position nicht verfügbar",
          "NavigationControl.ZoomIn": "Vergrößern",
          "NavigationControl.ZoomOut": "Verkleinern",
          "NavigationControl.ResetBearing": "Kompass zurücksetzen",
        },
      });

      map.on("load", () => {
        try {
          setMapLoadingState("success");
          map.addControl(new mapboxgl.NavigationControl(), "top-left");

          const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
            showUserLocation: true,
          });

          map.addControl(geolocateControl, "top-left");
          map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            "bottom-right"
          );

          geolocateControl.on("geolocate", (e) => {
            userLocationRequestedRef.current = true;
            const { longitude, latitude } = e.coords;
            setUserLocation([longitude, latitude]);
            addUserLocationMarker(map, [longitude, latitude]);

            const duration = isMobile.current ? 2000 : 1800;
            setTimeout(() => {
              animateToLocation([longitude, latitude], 14, duration);
            }, 150);
          });

          if (userLocation) {
            addUserLocationMarker(map, userLocation);
          }
        } catch (error) {
          console.warn("Błąd podczas dodawania kontrolek mapy:", error);
          setMapLoadingState("error");
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

  useEffect(() => {
    if (!selectedGalleryImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedGalleryImage(null);
      }
      if (e.key === "ArrowRight") {
        handleNextImage();
      }
      if (e.key === "ArrowLeft") {
        handlePrevImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedGalleryImage,
    currentImageIndex,
    handleNextImage,
    handlePrevImage,
  ]);

  // ✅ UPROSZCZONA funkcja openPanel
  const openPanel = useCallback(
    (place: Place) => {
      setSelectedPlace(place);
      setIsPanelOpen(true);
      setRender(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);

          // Animacja do miejsca (bez resize mapy)
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

  // ✅ UPROSZCZONA funkcja closePanel
  const closePanel = useCallback(() => {
    setVisible(false);
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);

    // Panel nie wpływa na szerokość mapy, więc nie trzeba resizeować
    setTimeout(() => {
      setIsPanelOpen(false);

      // Opcjonalnie: animacja powrotu do lokalizacji użytkownika
      if (mapRef.current && userLocation) {
        const duration = isMobile.current ? 2000 : 1800;
        animateToLocation(userLocation, 14, duration);
      }
    }, 600); // Poczekaj na animację panelu
  }, [userLocation, animateToLocation]);

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    try {
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn("Błąd usuwania markera:", error);
          }
        });
        markersRef.current = [];
      }

      places.forEach((place) => {
        if (
          !place.Breite ||
          !place.Lange ||
          Math.abs(place.Breite) > 90 ||
          Math.abs(place.Lange) > 180
        ) {
          console.error(`Nieprawidłowe współrzędne dla miejsca ${place.id}`);
          return;
        }

        try {
          const color = place.Kategorie[0]?.color || "#3388ff";
          const popupContent = `
            <div class="${styles.popupContent}">
              <h3>${place.Name}</h3>
              <p class="${styles.address}">${place.Adresse}</p>
              ${
                place.Vollbeschreibung
                  ? `<p class="${
                      styles.description
                    }">${place.Vollbeschreibung.replace(
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

          let popupTimeout: NodeJS.Timeout;
          markerElement.addEventListener("mouseenter", () => {
            clearTimeout(popupTimeout);
            if (marker.getPopup()) marker.togglePopup();
          });

          markerElement.addEventListener("mouseleave", () => {
            popupTimeout = setTimeout(() => {
              if (marker.getPopup()?.isOpen()) marker.togglePopup();
            }, 300);
          });

          markerElement.addEventListener("click", (e) => {
            e.stopPropagation();
            if (marker.getPopup()?.isOpen()) marker.togglePopup();
            openPanel(place);
          });

          markersRef.current.push(marker);
        } catch (error) {
          console.warn(
            `Błąd tworzenia markera dla miejsca ${place.id}:`,
            error
          );
        }
      });

      if (
        places.length > 0 &&
        !isPanelOpen &&
        !userLocationRequestedRef.current
      ) {
        try {
          const bounds = new mapboxgl.LngLatBounds();
          places.forEach((p) => bounds.extend([p.Lange, p.Breite]));
          if (userLocation) bounds.extend(userLocation);
          map.fitBounds(bounds, { padding: 50 });
        } catch (error) {
          console.warn("Błąd dopasowania granic:", error);
        }
      }
    } catch (error) {
      console.error("Błąd aktualizacji markerów:", error);
    }
  }, [places, isPanelOpen, userLocation, openPanel]);

  // ✅ UPROSZCZONY click outside handler
  useEffect(() => {
    if (!render || !visible) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.fullscreenModal}`)) return;
      if (panelRef.current?.contains(target)) return;
      if (target.closest(".mapboxgl-marker")) return;
      if (target.closest(".mapboxgl-ctrl")) return;

      // ✅ DODANE: Kliknięcie w backdrop zamyka panel
      if (target.classList.contains(styles.panelBackdrop)) {
        closePanel();
        return;
      }

      closePanel();
    };

    document.addEventListener("click", handler);
    document.addEventListener("touchend", handler);

    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchend", handler);
    };
  }, [render, visible, closePanel]);

  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "transform" && !visible) {
      setRender(false);
      setSelectedPlace(null);
    }
  };

  // Window resize handler z debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resizeMap();
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [resizeMap]);

  // Pobierz lokalizację użytkownika przy pierwszym załadowaniu
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      // Czyszczenie markerów
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn("Błąd usuwania markera:", error);
          }
        });
        markersRef.current = [];
      }

      // Czyszczenie markera użytkownika
      if (userLocationMarkerRef.current) {
        try {
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        } catch (error) {
          console.warn("Błąd usuwania markera użytkownika:", error);
        }
      }

      // Czyszczenie mapy
      if (mapRef.current) {
        try {
          const map = mapRef.current;
          if (map.loaded()) {
            map.remove();
          }
        } catch (error) {
          console.warn("Błąd usuwania mapy:", error);
        } finally {
          mapRef.current = null;
        }
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

  // Error boundary fallback
  if (!isValidMapboxToken()) {
    return (
      <div className={styles.mapContainerWrapper}>
        <div className={styles.errorContainer}>
          <h3>Konfigurationsfehler</h3>
          <p>Mapbox-Token ist nicht konfiguriert oder ungültig.</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Seite neu laden
          </button>
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

      {/* ✅ MAPA ZAWSZE PEŁNA SZEROKOŚĆ - usuń mapWithPanel class */}
      <div ref={containerRef} className={styles.mapContainer} />

      {/* Location error */}
      {locationError && (
        <div className={styles.locationError}>
          <p>Geolocation-Fehler: {locationError}</p>
          <button onClick={getUserLocation} className={styles.retryButton}>
            Erneut versuchen
          </button>
        </div>
      )}

      {/* ✅ OPCJONALNY BACKDROP */}
      {isPanelOpen && (
        <div
          className={`${styles.panelBackdrop} ${visible ? styles.visible : ""}`}
          onClick={closePanel}
        />
      )}

      {/* ✅ PANEL JAKO OVERLAY */}
      {render && (
        <div
          ref={panelRef}
          className={`${styles.infoPanel} ${visible ? styles.open : ""}`}
          onTransitionEnd={onTransitionEnd}
        >
          <div className={styles.panelContent}>
            {selectedPlace ? (
              <>
                <div className={styles.imageAudioContainer}>
                  {selectedPlace.Hauptbild && (
                    <div className={styles.mainImageSection}>
                      <PlaceImage
                        placeId={selectedPlace.id}
                        filename={selectedPlace.Hauptbild}
                        alt={selectedPlace.Name}
                        type="main"
                        className={styles.mainImage}
                      />
                    </div>
                  )}

                  {selectedPlace.Audio_Datei && (
                    <div className={styles.audioSection}>
                      <AudioPlayer
                        placeId={selectedPlace.id}
                        filename={selectedPlace.Audio_Datei}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.placeNameSection}>
                  <h2 className={styles.placeName}>{selectedPlace.Name}</h2>
                  <p className={styles.placeAddress}>{selectedPlace.Adresse}</p>
                </div>

                {selectedPlace.Vollbeschreibung && (
                  <div className={styles.infoSection}>
                    <div
                      className={styles.description}
                      dangerouslySetInnerHTML={{
                        __html: selectedPlace.Vollbeschreibung,
                      }}
                    />
                  </div>
                )}

                {selectedPlace.Link_URL && (
                  <div className={styles.infoSection}>
                    <a
                      href={selectedPlace.Link_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      {selectedPlace.Link_Text || "Website besuchen"}
                    </a>
                  </div>
                )}

                {selectedPlace.Galerie_Bilder &&
                  selectedPlace.Galerie_Bilder.length > 0 && (
                    <div className={styles.infoSection}>
                      <h4>Bildergalerie</h4>
                      <ImageGallery
                        placeId={selectedPlace.id}
                        images={selectedPlace.Galerie_Bilder}
                        onImageClickAction={(imagePath) => {
                          const index =
                            selectedPlace.Galerie_Bilder?.findIndex((img) =>
                              imagePath.includes(img)
                            ) ?? 0;
                          setCurrentImageIndex(index);
                          setSelectedGalleryImage(imagePath);
                        }}
                      />
                    </div>
                  )}
              </>
            ) : (
              <p>
                Wählen Sie einen Punkt auf der Karte aus, um Details zu sehen.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen gallery modal */}
      {selectedGalleryImage &&
        selectedPlace &&
        selectedPlace.Galerie_Bilder && (
          <div
            className={styles.fullscreenModal}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedGalleryImage(null);
              }
            }}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeButton}
                onClick={() => setSelectedGalleryImage(null)}
                aria-label="Galerie schließen"
              >
                ×
              </button>

              <div className={styles.sliderContainer}>
                <button
                  className={styles.navButtonPrev}
                  onClick={handlePrevImage}
                  aria-label="Vorheriges Bild"
                  disabled={
                    !selectedPlace.Galerie_Bilder ||
                    selectedPlace.Galerie_Bilder.length <= 1
                  }
                >
                  ‹
                </button>

                <Image
                  src={getOptimizedImagePath(
                    selectedPlace.id,
                    selectedPlace.Galerie_Bilder[currentImageIndex] || "",
                    "gallery"
                  )}
                  alt={`Galeriebild ${currentImageIndex + 1} von ${
                    selectedPlace.Name
                  }`}
                  width={1200}
                  height={800}
                  style={{ objectFit: "contain" }}
                  className={styles.modalImage}
                  priority
                />

                <button
                  className={styles.navButtonNext}
                  onClick={handleNextImage}
                  aria-label="Nächstes Bild"
                  disabled={
                    !selectedPlace.Galerie_Bilder ||
                    selectedPlace.Galerie_Bilder.length <= 1
                  }
                >
                  ›
                </button>
              </div>

              {selectedPlace.Galerie_Bilder &&
                selectedPlace.Galerie_Bilder.length > 1 && (
                  <div className={styles.imageCounter}>
                    {currentImageIndex + 1} /{" "}
                    {selectedPlace.Galerie_Bilder.length}
                  </div>
                )}
            </div>
          </div>
        )}
    </div>
  );
}

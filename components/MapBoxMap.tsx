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

// Funkcja do obliczania odległości między dwoma punktami w kilometrach
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Promień Ziemi w kilometrach
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);

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
  const [initialLocationSet, setInitialLocationSet] = useState(false);

  // Promień wyszukiwania w kilometrach - można dostosować
  const [searchRadius, setSearchRadius] = useState(10); // 10 km domyślnie
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);

  // Funkcja do filtrowania miejsc w pobliżu użytkownika
  const filterNearbyPlaces = useCallback(() => {
    if (!userLocation) {
      setNearbyPlaces([]);
      return;
    }

    const [userLng, userLat] = userLocation;
    const filtered = places.filter((place) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        place.Breite,
        place.Lange
      );
      return distance <= searchRadius;
    });

    setNearbyPlaces(filtered);
  }, [userLocation, places, searchRadius]);

  // Funkcja do aktualizacji promienia wyszukiwania
  const updateSearchRadius = useCallback((newRadius: number) => {
    setSearchRadius(newRadius);
  }, []);

  // Funktion zum Abrufen der Benutzerposition
  const getUserLocation = useCallback(() => {
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

        // Wenn die Karte bereits existiert und es ist die erste Lokalisierung
        if (mapRef.current && !initialLocationSet) {
          mapRef.current.easeTo({
            center: newLocation,
            zoom: 14, // Zwiększamy zoom dla lepszego widoku lokalnego
            duration: 1000,
          });
          setInitialLocationSet(true);
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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 Minuten Cache
      }
    );
  }, [initialLocationSet]);

  // Aktualizacja miejsc w pobliżu po zmianie lokalizacji użytkownika
  useEffect(() => {
    filterNearbyPlaces();
  }, [filterNearbyPlaces]);

  // Funktion zum Hinzufügen des Benutzerposition-Markers
  const addUserLocationMarker = useCallback(
    (map: mapboxgl.Map, location: [number, number]) => {
      try {
        // Vorherigen Marker entfernen, falls vorhanden
        if (userLocationMarkerRef.current) {
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        }

        // Überprüfen, ob die Karte verfügbar und geladen ist
        if (!map || !map.loaded()) {
          console.warn(
            "Karte nicht bereit für das Hinzufügen des Benutzerposition-Markers"
          );
          return;
        }

        // Styles für den Marker-Punkt und Pulsierung direkt hinzufügen
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
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(2.5);
              opacity: 0;
            }
          }
        `;
          document.head.appendChild(style);
        }

        // Benutzerdefiniertes Element für den Benutzerposition-Marker erstellen
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
          <p>Suchradius: ${searchRadius} km</p>
        </div>
      `);

        const userMarker = new mapboxgl.Marker({
          element: userMarkerElement,
        })
          .setLngLat(location)
          .setPopup(popup)
          .addTo(map);

        // Interaktionen hinzufügen
        userMarkerElement.addEventListener("mouseenter", () => {
          if (userMarker.getPopup()) {
            userMarker.togglePopup();
          }
        });

        userMarkerElement.addEventListener("mouseleave", () => {
          setTimeout(() => {
            if (userMarker.getPopup()?.isOpen()) {
              userMarker.togglePopup();
            }
          }, 300);
        });

        userLocationMarkerRef.current = userMarker;
      } catch (error) {
        console.warn(
          "Fehler beim Hinzufügen des Benutzerposition-Markers:",
          error
        );
      }
    },
    [searchRadius]
  );

  const initializeMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      // Anfangszentrum der Karte - priorität für lokalizację użytkownika
      const initialCenter: [number, number] = userLocation || [19.0, 52.0];
      const initialZoom = userLocation ? 14 : 6; // Wyższy zoom dla lokalizacji użytkownika

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

      // Steuerelemente erst nach dem Laden der Karte hinzufügen
      map.on("load", () => {
        try {
          map.addControl(new mapboxgl.NavigationControl(), "top-left");

          // Geolocation-Steuerelement hinzufügen
          const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
            showUserHeading: true,
            showUserLocation: false, // Wyłączamy domyślny marker, używamy własnego
          });

          map.addControl(geolocateControl, "top-left");

          map.addControl(
            new mapboxgl.AttributionControl({
              compact: true,
            }),
            "bottom-right"
          );

          // Event Listener für Geolocation
          geolocateControl.on("geolocate", (e) => {
            const { longitude, latitude } = e.coords;
            setUserLocation([longitude, latitude]);
            addUserLocationMarker(map, [longitude, latitude]);
          });

          // Wenn wir bereits die Benutzerposition haben, Marker hinzufügen
          if (userLocation) {
            addUserLocationMarker(map, userLocation);
          }
        } catch (error) {
          console.warn(
            "Fehler beim Hinzufügen der Kartensteuerelemente:",
            error
          );
        }
      });

      // Fehlerbehandlung für die Karte
      map.on("error", (e) => {
        console.error("Kartenfehler:", e);
      });

      mapRef.current = map;
    } catch (error) {
      console.error("Fehler beim Initialisieren der Karte:", error);
    }
  }, [userLocation, addUserLocationMarker]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev + 1) % (selectedPlace?.Galerie_Bilder?.length || 1)
    );
  }, [selectedPlace?.Galerie_Bilder]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (selectedPlace?.Galerie_Bilder?.length || 1) - 1 : prev - 1
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

  const openPanel = (place: Place) => {
    setSelectedPlace(place);
    setIsPanelOpen(true);
    setRender(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });

    setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current;
        const currentZoom = map.getZoom();

        map.easeTo({
          center: [place.Lange, place.Breite],
          zoom: Math.max(currentZoom, 15), // Wyższy zoom dla szczegółów
          duration: 800,
          easing: (t) => t * (2 - t),
        });
      }
    }, 100);
  };

  const closePanel = useCallback(() => {
    setVisible(false);
    setIsPanelOpen(false);
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);

    if (mapRef.current && userLocation) {
      const map = mapRef.current;

      // Powrót do widoku skupionego na użytkowniku
      map.easeTo({
        center: userLocation,
        zoom: 14,
        duration: 800,
        easing: (t) => t * (2 - t),
      });
    }
  }, [userLocation]);

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    try {
      // Vorherige Marker entfernen
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn("Fehler beim Entfernen des Markers:", error);
          }
        });
        markersRef.current = [];
      }

      // Używamy nearbyPlaces zamiast wszystkich places
      nearbyPlaces.forEach((place) => {
        if (
          !place.Breite ||
          !place.Lange ||
          Math.abs(place.Breite) > 90 ||
          Math.abs(place.Lange) > 180
        ) {
          console.error(`Ungültige Koordinaten für Ort ${place.id}`);
          return;
        }

        try {
          const color = place.Kategorie[0]?.color || "#3388ff";

          // Obliczanie odległości od użytkownika dla popup
          let distanceText = "";
          if (userLocation) {
            const [userLng, userLat] = userLocation;
            const distance = calculateDistance(
              userLat,
              userLng,
              place.Breite,
              place.Lange
            );
            distanceText = `<p class="${
              styles.distance
            }">Entfernung: ${distance.toFixed(1)} km</p>`;
          }

          const popupContent = `
            <div class="${styles.popupContent}">
              <h3>${place.Name}</h3>
              <p class="${styles.address}">${place.Adresse}</p>
              ${distanceText}
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

          const marker = new mapboxgl.Marker({
            color: color,
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
            if (marker.getPopup()) {
              marker.togglePopup();
            }
          });

          markerElement.addEventListener("mouseleave", () => {
            popupTimeout = setTimeout(() => {
              if (marker.getPopup()?.isOpen()) {
                marker.togglePopup();
              }
            }, 300);
          });

          markerElement.addEventListener("click", (e) => {
            e.stopPropagation();
            if (marker.getPopup()?.isOpen()) {
              marker.togglePopup();
            }
            openPanel(place);
          });

          markersRef.current.push(marker);
        } catch (error) {
          console.warn(
            `Fehler beim Erstellen des Markers für Ort ${place.id}:`,
            error
          );
        }
      });

      // Dostosowanie widoku do miejsc w pobliżu i pozycji użytkownika
      if (nearbyPlaces.length > 0 && !isPanelOpen && userLocation) {
        try {
          const bounds = new mapboxgl.LngLatBounds();

          // Dodaj pozycję użytkownika do granic
          bounds.extend(userLocation);

          // Dodaj miejsca w pobliżu
          nearbyPlaces.forEach((p) => bounds.extend([p.Lange, p.Breite]));

          map.fitBounds(bounds, {
            padding: 100,
            maxZoom: 16, // Ograniczamy maksymalny zoom
            duration: 1000,
          });
        } catch (error) {
          console.warn("Fehler beim Anpassen der Grenzen:", error);
        }
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Marker:", error);
    }
  }, [nearbyPlaces, isPanelOpen, userLocation]);

  useEffect(() => {
    if (!render || !visible) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.fullscreenModal}`)) return;
      if (panelRef.current?.contains(target)) return;
      if (target.closest(".mapboxgl-marker")) return;
      if (target.closest(".mapboxgl-ctrl")) return;
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

  // Benutzerposition beim ersten Laden abrufen
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  useEffect(() => {
    initializeMap();

    return () => {
      // Cleanup markers
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn("Fehler beim Entfernen des Markers:", error);
          }
        });
        markersRef.current = [];
      }

      // Cleanup user location marker
      if (userLocationMarkerRef.current) {
        try {
          userLocationMarkerRef.current.remove();
          userLocationMarkerRef.current = null;
        } catch (error) {
          console.warn(
            "Fehler beim Entfernen des Benutzerposition-Markers:",
            error
          );
        }
      }

      // Cleanup map
      if (mapRef.current) {
        try {
          const map = mapRef.current;
          // Überprüfen, ob die Karte vollständig geladen ist, bevor sie entfernt wird
          if (map.loaded()) {
            map.remove();
          }
        } catch (error) {
          console.warn("Fehler beim Entfernen der Karte:", error);
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

  return (
    <div className={styles.mapContainerWrapper}>
      {/* Kontrolka promienia wyszukiwania */}
      {userLocation && (
        <div className={styles.radiusControl}>
          <label htmlFor="radius-slider">Suchradius: {searchRadius} km</label>
          <input
            id="radius-slider"
            type="range"
            min="1"
            max="50"
            value={searchRadius}
            onChange={(e) => updateSearchRadius(Number(e.target.value))}
            className={styles.radiusSlider}
          />
          <div className={styles.nearbyCount}>
            Gefundene Orte: {nearbyPlaces.length}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`${styles.mapContainer} ${
          isPanelOpen ? styles.mapWithPanel : ""
        }`}
      />

      {locationError && (
        <div className={styles.locationError}>
          <p>Geolocation-Fehler: {locationError}</p>
          <button onClick={getUserLocation} className={styles.retryButton}>
            Erneut versuchen
          </button>
        </div>
      )}

      {!userLocation && !locationError && (
        <div className={styles.locationPrompt}>
          <p>
            Bitte erlauben Sie den Zugriff auf Ihre Position, um Orte in der
            Nähe zu finden.
          </p>
        </div>
      )}

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
                  {userLocation && (
                    <p className={styles.placeDistance}>
                      Entfernung:{" "}
                      {calculateDistance(
                        userLocation[1],
                        userLocation[0],
                        selectedPlace.Breite,
                        selectedPlace.Lange
                      ).toFixed(1)}{" "}
                      km
                    </p>
                  )}
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

      {selectedGalleryImage && selectedPlace && (
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
            >
              ×
            </button>

            <div className={styles.sliderContainer}>
              <button
                className={styles.navButtonPrev}
                onClick={handlePrevImage}
              >
                ‹
              </button>

              <Image
                src={getOptimizedImagePath(
                  selectedPlace.id,
                  selectedPlace.Galerie_Bilder?.[currentImageIndex] || "",
                  "gallery"
                )}
                alt="Vergrößertes Bild"
                width={1200}
                height={800}
                style={{ objectFit: "contain" }}
                className={styles.modalImage}
              />

              <button
                className={styles.navButtonNext}
                onClick={handleNextImage}
              >
                ›
              </button>
            </div>

            <div className={styles.imageCounter}>
              {currentImageIndex + 1} /{" "}
              {selectedPlace.Galerie_Bilder?.length || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

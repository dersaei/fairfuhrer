// components/MapBoxMap.tsx (wersja z wykorzystaniem komponentów pomocniczych)
"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";
import {
  AudioPlayer,
  ImageGallery,
  PlaceImage,
  EmbeddedMap,
} from "./MediaComponents";
import type { Place } from "../types";

interface MapBoxMapProps {
  places: Place[];
}

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);

  const initializeMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [19.0, 52.0],
      zoom: 6,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
      }),
      "bottom-right"
    );

    mapRef.current = map;
  }, []);

  const openPanel = (place: Place) => {
    setSelectedPlace(place);
    setIsPanelOpen(true);
    setRender(true);

    // Podwójny RAF dla płynnej animacji
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    });

    // Przesuń mapę z opóźnieniem
    setTimeout(() => {
      if (mapRef.current) {
        const map = mapRef.current;
        const currentZoom = map.getZoom();

        map.easeTo({
          center: [place.longitude, place.latitude],
          zoom: Math.max(currentZoom, 12),
          duration: 800,
          easing: (t) => t * (2 - t),
        });
      }
    }, 100);
  };

  const closePanel = useCallback(() => {
    setVisible(false);
    setIsPanelOpen(false);

    // Powrót do pierwotnego widoku mapy
    if (mapRef.current && places.length > 0) {
      const map = mapRef.current;
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.longitude, p.latitude]));

      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
        duration: 800,
        easing: (t) => t * (2 - t),
      });
    }
  }, [places]);

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    // Usuń stare markery
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    places.forEach((place) => {
      if (
        !place.latitude ||
        !place.longitude ||
        Math.abs(place.latitude) > 90 ||
        Math.abs(place.longitude) > 180
      ) {
        console.error(`Nieprawidłowe współrzędne dla miejsca ${place.id}`);
        return;
      }

      const color = place.categories[0]?.color || "#3388ff";

      // Popup dla tooltip
      const popupContent = `
        <div class="${styles.popupContent}">
          <h3>${place.nazwa}</h3>
          <p class="${styles.address}">${place.adres}</p>
          ${
            place.vollbeschreibung
              ? `<p class="${styles.description}">${place.vollbeschreibung
                  .replace(/<[^>]*>/g, "")
                  .substring(0, 100)}...</p>`
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
        .setLngLat([place.longitude, place.latitude])
        .setPopup(popup)
        .addTo(map);

      const markerElement = marker.getElement();
      markerElement.style.cursor = "pointer";

      let popupTimeout: NodeJS.Timeout;

      // Tooltip na hover
      markerElement.addEventListener("mouseenter", () => {
        clearTimeout(popupTimeout);
        marker.togglePopup();
      });

      markerElement.addEventListener("mouseleave", () => {
        popupTimeout = setTimeout(() => {
          if (marker.getPopup()?.isOpen()) {
            marker.togglePopup();
          }
        }, 300);
      });

      // Panel na kliknięcie
      markerElement.addEventListener("click", (e) => {
        e.stopPropagation();
        if (marker.getPopup()?.isOpen()) {
          marker.togglePopup();
        }
        openPanel(place);
      });

      markersRef.current.push(marker);
    });

    if (places.length > 0 && !isPanelOpen) {
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.longitude, p.latitude]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [places, isPanelOpen]);

  // Obsługa kliknięcia poza panelem
  useEffect(() => {
    if (!render || !visible) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
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

  // Obsługa końca animacji
  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName === "transform" && !visible) {
      setRender(false);
      setSelectedPlace(null);
    }
  };

  useEffect(() => {
    initializeMap();
    const currentMap = mapRef.current;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      if (currentMap) {
        currentMap.remove();
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
      <div
        ref={containerRef}
        className={`${styles.mapContainer} ${
          isPanelOpen ? styles.mapWithPanel : ""
        }`}
      />

      {render && (
        <div
          ref={panelRef}
          className={`${styles.infoPanel} ${visible ? styles.open : ""}`}
          onTransitionEnd={onTransitionEnd}
        >
          <div className={styles.panelHeader}>
            <h3>{selectedPlace?.nazwa || "Informacje"}</h3>
            <button
              className={styles.closeButton}
              onClick={closePanel}
              aria-label="Zamknij panel"
            >
              ×
            </button>
          </div>

          <div className={styles.panelContent}>
            {selectedPlace ? (
              <>
                {/* Główne zdjęcie */}
                {selectedPlace.hauptbild && (
                  <div className={styles.mainImageSection}>
                    <PlaceImage
                      placeId={selectedPlace.id}
                      filename={selectedPlace.hauptbild}
                      alt={selectedPlace.nazwa}
                      type="main"
                      className={styles.mainImage}
                    />
                  </div>
                )}

                {/* Audio */}
                {selectedPlace.audioDatei && (
                  <div className={styles.audioSection}>
                    <AudioPlayer
                      placeId={selectedPlace.id}
                      filename={selectedPlace.audioDatei}
                    />
                  </div>
                )}

                {/* Nazwa miejsca */}
                <div className={styles.placeNameSection}>
                  <h2 className={styles.placeName}>{selectedPlace.nazwa}</h2>
                </div>

                {/* Adres */}
                <div className={styles.infoSection}>
                  <h4>Adres</h4>
                  <p>{selectedPlace.adres}</p>
                </div>

                {/* Pełny opis */}
                {selectedPlace.vollbeschreibung && (
                  <div className={styles.infoSection}>
                    <h4>Opis</h4>
                    <div
                      className={styles.description}
                      dangerouslySetInnerHTML={{
                        __html: selectedPlace.vollbeschreibung,
                      }}
                    />
                  </div>
                )}

                {/* Galeria zdjęć */}
                {selectedPlace.galerieBilder &&
                  selectedPlace.galerieBilder.length > 0 && (
                    <div className={styles.infoSection}>
                      <h4>Galeria</h4>
                      <ImageGallery
                        placeId={selectedPlace.id}
                        images={selectedPlace.galerieBilder}
                      />
                    </div>
                  )}

                {/* Mapa iframe */}
                {selectedPlace.karteEinbetten && (
                  <div className={styles.infoSection}>
                    <h4>Mapa</h4>
                    <EmbeddedMap embedCode={selectedPlace.karteEinbetten} />
                  </div>
                )}

                {/* Link */}
                {selectedPlace.linkUrl && (
                  <div className={styles.infoSection}>
                    <a
                      href={selectedPlace.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      {selectedPlace.linkText || "Więcej informacji"}
                    </a>
                  </div>
                )}

                {/* Kategorie */}
                {selectedPlace.categories.length > 0 && (
                  <div className={styles.infoSection}>
                    <h4>Kategorie</h4>
                    <div className={styles.categories}>
                      {selectedPlace.categories.map((category) => (
                        <span
                          key={category.id}
                          className={styles.categoryTag}
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>Wybierz punkt na mapie, aby zobaczyć szczegóły.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

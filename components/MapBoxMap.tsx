"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";
import Image from "next/image";
import {
  AudioPlayer,
  ImageGallery,
  PlaceImage,
  EmbeddedMap,
} from "./MediaComponents";
import type { Place } from "../types";
import { getImageUrl } from "../lib/supabase";

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
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    map.addControl(
      new mapboxgl.AttributionControl({
        compact: true,
      }),
      "bottom-right"
    );

    mapRef.current = map;
  }, []);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(
      (prev) => (prev + 1) % (selectedPlace?.galerieBilder?.length || 1)
    );
  }, [selectedPlace?.galerieBilder]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (selectedPlace?.galerieBilder?.length || 1) - 1 : prev - 1
    );
  }, [selectedPlace?.galerieBilder]);

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
    setSelectedGalleryImage(null);
    setCurrentImageIndex(0);

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
          <div className={styles.panelContent}>
            {selectedPlace ? (
              <>
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

                {selectedPlace.audioDatei && (
                  <div className={styles.audioSection}>
                    <AudioPlayer
                      placeId={selectedPlace.id}
                      filename={selectedPlace.audioDatei}
                    />
                  </div>
                )}

                <div className={styles.placeNameSection}>
                  <h2 className={styles.placeName}>{selectedPlace.nazwa}</h2>
                </div>

                {selectedPlace.vollbeschreibung && (
                  <div className={styles.infoSection}>
                    <div
                      className={styles.description}
                      dangerouslySetInnerHTML={{
                        __html: selectedPlace.vollbeschreibung,
                      }}
                    />
                  </div>
                )}

                {selectedPlace.linkUrl && (
                  <div className={styles.infoSection}>
                    <a
                      href={selectedPlace.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.externalLink}
                    >
                      {selectedPlace.linkText || "Website besuchen"}
                    </a>
                  </div>
                )}

                {selectedPlace.galerieBilder &&
                  selectedPlace.galerieBilder.length > 0 && (
                    <div className={styles.infoSection}>
                      <h4>Spot-Bildergalerie</h4>
                      <ImageGallery
                        placeId={selectedPlace.id}
                        images={selectedPlace.galerieBilder}
                        onImageClickAction={(imageUrl) => {
                          const index =
                            selectedPlace.galerieBilder?.findIndex((img) =>
                              imageUrl.includes(img)
                            ) ?? 0;
                          setCurrentImageIndex(index);
                          setSelectedGalleryImage(imageUrl);
                        }}
                      />
                    </div>
                  )}

                {selectedPlace.karteEinbetten && (
                  <div className={styles.infoSection}>
                    <EmbeddedMap embedCode={selectedPlace.karteEinbetten} />
                  </div>
                )}

                <div className={styles.infoSection}>
                  <p>{selectedPlace.adres}</p>
                </div>
              </>
            ) : (
              <p>Wybierz punkt na mapie, aby zobaczyć szczegóły.</p>
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
                src={getImageUrl(
                  selectedPlace.id,
                  selectedPlace.galerieBilder?.[currentImageIndex] || "",
                  "gallery"
                )}
                alt="Powiększone zdjęcie"
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
              {selectedPlace.galerieBilder?.length || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

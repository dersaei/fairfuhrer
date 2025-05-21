// components/MapBoxMap.tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";

export interface Place {
  id: number;
  nazwa: string;
  adres: string;
  kurzbeschreibung: string;
  latitude: number;
  longitude: number;
  categories: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

interface MapBoxMapProps {
  places: Place[];
}

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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
      const popupContent = `
        <div class="${styles.popupContent}">
          <h3>${place.nazwa}</h3>
          <p class="${styles.address}">${place.adres}</p>
          <p class="${styles.description}">${place.kurzbeschreibung}</p>
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

      markersRef.current.push(marker);
    });

    if (places.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.longitude, p.latitude]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [places]);

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

  // W komponencie MapBoxMap.tsx
  return (
    <div className={styles.mapContainerWrapper}>
      <div ref={containerRef} className={styles.mapContainer} />
    </div>
  );
}

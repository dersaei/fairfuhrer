// components/MapBoxMap.tsx
"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapBoxMap.module.css";

export interface Place {
  id: number;
  nazwa: string;
  adres: string;
  link: string;
  latitude: number;
  longitude: number;
}

interface MapBoxMapProps {
  places: Place[];
}

const MapBoxMap: React.FC<MapBoxMapProps> = ({ places }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Inicjalizacja mapy – tylko raz
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: places.length
        ? [places[0].longitude, places[0].latitude]
        : [9.5, 47.65],
      zoom: places.length ? 12 : 10,
    });
    mapRef.current = map;
    map.on("load", () => map.resize());
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [places]);

  // Dodawanie markerów + tooltipów
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // przed wstawieniem nowych markerów usuń stare
    document.querySelectorAll(".mapboxgl-marker").forEach((el) => el.remove());

    places.forEach((place) => {
      const { latitude: lat, longitude: lng, nazwa, adres, link } = place;

      // 1) Stwórz popup (tooltip)
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(
        `<div style="font-size:14px;line-height:1.3;">
           <strong>${nazwa}</strong><br/>
           ${adres}<br/>
           <a href="${link}" target="_blank" style="color:#007cbf;">Więcej informacji</a>
         </div>`
      );

      // 2) Stwórz domyślny marker Mapbox
      const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

      const el = marker.getElement();
      el.style.cursor = "pointer";

      let closeTimer: ReturnType<typeof setTimeout>;

      // 3) Pokaż popup na hoverze markera
      el.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        popup.addTo(map);
      });

      // 4) Zaplanuj zamknięcie popupu po opuszczeniu markera
      el.addEventListener("mouseleave", () => {
        closeTimer = setTimeout(() => popup.remove(), 300);
      });

      // 5) Utrzymaj popup, gdy kursor jest nad nim
      popup.on("open", () => {
        const popupEl = popup.getElement();
        if (!popupEl) return;
        popupEl.addEventListener("mouseenter", () => clearTimeout(closeTimer));
        popupEl.addEventListener("mouseleave", () => popup.remove());
      });
    });

    // 6) Dopasuj widok do wszystkich markerów
    if (places.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.longitude, p.latitude]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  }, [places]);

  return <div ref={containerRef} className={styles.mapContainer} />;
};

export default MapBoxMap;

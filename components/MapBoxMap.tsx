// components/MapBoxMap.tsx
"use client";

import { useRef, useEffect } from "react";
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
}

interface MapBoxMapProps {
  places: Place[];
}

export default function MapBoxMap({ places }: MapBoxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Inicjalizacja mapy
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

    map.on("load", () => map.resize());
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [places]);

  // Dodawanie markerów z popupami
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];
    let closePopupTimer: NodeJS.Timeout;

    places.forEach((place) => {
      const {
        latitude: lat,
        longitude: lng,
        nazwa,
        adres,
        kurzbeschreibung,
      } = place;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false,
      })
        .setLngLat([lng, lat])
        .setHTML(
          `<div style="font-size:14px;line-height:1.3;">
            <strong>${nazwa}</strong><br/>
            <em>${adres}</em><br/><br/>
            ${kurzbeschreibung}
          </div>`
        );

      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      const markerElement = marker.getElement();
      markerElement.style.cursor = "pointer";

      // Event listeners dla markera
      markerElement.addEventListener("mouseenter", () => {
        clearTimeout(closePopupTimer);
        marker.togglePopup();
      });

      markerElement.addEventListener("mouseleave", () => {
        closePopupTimer = setTimeout(() => {
          if (marker.getPopup()!.isOpen()) {
            // Asercja typu tutaj
            marker.togglePopup();
          }
        }, 300);
      });

      // Event listeners dla popupa
      const popupElement = popup.getElement();
      if (popupElement) {
        popupElement.addEventListener("mouseenter", () => {
          clearTimeout(closePopupTimer);
        });

        popupElement.addEventListener("mouseleave", () => {
          closePopupTimer = setTimeout(() => {
            if (marker.getPopup()!.isOpen()) {
              // Asercja typu tutaj
              marker.togglePopup();
            }
          }, 300);
        });
      }

      markers.push(marker);
    });

    // Dopasowanie widoku
    if (places.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.longitude, p.latitude]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [places]);

  return <div ref={containerRef} className={styles.mapContainer} />;
}

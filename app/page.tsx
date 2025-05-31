"use client";

import React, { useRef, useEffect, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import type { StyleSpecification } from "mapbox-gl";
import styles from "./page.module.css";

// Typ dla naszego stylu atmosfery
interface AtmosphereStyle extends StyleSpecification {
  center: [number, number];
  zoom: number;
  bearing: number;
  pitch: number;
}

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const [atmosphereStyle, setAtmosphereStyle] =
    useState<AtmosphereStyle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  // Załaduj styl atmosphere z public/styles/
  useEffect(() => {
    const loadAtmosphereStyle = async () => {
      try {
        const response = await fetch("/styles/atmosphere.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const style = (await response.json()) as AtmosphereStyle;
        setAtmosphereStyle(style);
      } catch (error) {
        console.error("Błąd podczas ładowania stylu atmosphere:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAtmosphereStyle();
  }, []);

  // Efekt dla ręcznej aktualizacji widoku (po załadowaniu stylu)
  useEffect(() => {
    if (mapRef.current && atmosphereStyle) {
      const map = mapRef.current.getMap();

      // Wymuś aktualizację parametrów kamery
      map.jumpTo({
        center: atmosphereStyle.center,
        zoom: atmosphereStyle.zoom,
        bearing: atmosphereStyle.bearing,
        pitch: atmosphereStyle.pitch,
      });

      // Dodaj opóźnienie dla pewności
      setTimeout(() => {
        map.triggerRepaint();
      }, 100);
    }
  }, [atmosphereStyle]);

  // Funkcja obsługi kliknięcia
  const handleMapClick = () => {
    router.push("/karte");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div>Ładowanie mapy...</div>
      </div>
    );
  }

  // Error state
  if (!atmosphereStyle) {
    return (
      <div className={styles.loadingContainer}>
        <div>Błąd podczas ładowania stylu mapy</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Mapa jako tło */}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={atmosphereStyle}
        projection="globe"
        interactive={false}
        cursor="pointer"
        onClick={handleMapClick}
        initialViewState={{
          longitude: atmosphereStyle.center[0],
          latitude: atmosphereStyle.center[1],
          zoom: atmosphereStyle.zoom,
          bearing: atmosphereStyle.bearing,
          pitch: atmosphereStyle.pitch,
        }}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Napis po lewej stronie */}
      <div className={styles.leftText}>
        Dein
        <br />
        Fair-Führer
        <br />
        für Geschichte und gute
        <br />
        Geschichten
      </div>

      {/* Przycisk Play na środku globu */}
      <div onClick={handleMapClick} className={styles.playButtonContainer}>
        {/* Ikona Play */}
        <div className={styles.playButton}>
          {/* Trójkąt Play */}
          <div className={styles.playTriangle} />
        </div>

        {/* Tekst "Zur Karte" */}
        <div className={styles.mapText}>Zur Karte</div>
      </div>
    </div>
  );
}

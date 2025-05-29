"use client";

import React, { useRef, useEffect, useState } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import type { StyleSpecification } from "mapbox-gl";

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

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "calc(100vh - 90px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        }}
      >
        <div>Karte wird geladen ...</div>
      </div>
    );
  }

  // Error state
  if (!atmosphereStyle) {
    return (
      <div
        style={{
          width: "100vw",
          height: "calc(100vh - 90px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        }}
      >
        <div>Fehler beim Laden des Kartenstils</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "calc(100vh - 90px)" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={atmosphereStyle}
        projection="globe"
        interactive={false}
        cursor="pointer"
        onClick={() => router.push("/karte")}
        initialViewState={{
          longitude: atmosphereStyle.center[0],
          latitude: atmosphereStyle.center[1],
          zoom: atmosphereStyle.zoom,
          bearing: atmosphereStyle.bearing,
          pitch: atmosphereStyle.pitch,
        }}
      />
    </div>
  );
}

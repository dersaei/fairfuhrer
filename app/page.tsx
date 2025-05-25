"use client";

import React, { useRef, useEffect } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import atmosphereStyle from "../styles/atmosphere.json";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import type { StyleSpecification } from "mapbox-gl";

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  // Dodaj efekt dla ręcznej aktualizacji widoku
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();

      // Wymuś aktualizację parametrów kamery
      map.jumpTo({
        center: atmosphereStyle.center as [number, number],
        zoom: atmosphereStyle.zoom,
        bearing: atmosphereStyle.bearing,
        pitch: atmosphereStyle.pitch,
      });

      // Dodaj opóźnienie dla pewności
      setTimeout(() => {
        map.triggerRepaint();
      }, 100);
    }
  }, []);

  return (
    <div style={{ width: "100vw", height: "calc(100vh - 90px)" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={atmosphereStyle as unknown as StyleSpecification}
        projection="globe"
        interactive={false}
        cursor="pointer"
        onClick={() => router.push("/karte")}
        // Dodaj fallbackowe wartości
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

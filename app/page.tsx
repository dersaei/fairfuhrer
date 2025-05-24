"use client";

import React, { useRef, useEffect } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 1.2,
    pitch: 0,
    bearing: 0,
  };

  useEffect(() => {
    const map = mapRef.current?.getMap();

    if (!map) return;

    map.on("load", () => {
      map.dragRotate.disable();
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();

      map.setFog({
        "space-color": "rgb(0, 0, 0)",
        "star-intensity": 0.5,
      });

      const animate = () => {
        if (!mapRef.current) return;
        const center = map.getCenter();
        center.lng -= 0.2;
        map.easeTo({ center, duration: 1000, easing: (t: number) => t });
      };
      map.on("moveend", animate);
      animate();
    });

    // Sprzątanie po odmontowaniu
    return () => {
      if (mapRef.current && mapRef.current.getMap()) {
        mapRef.current.getMap().remove();
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        projection="globe"
        style={{ width: "100%", height: "100%" }}
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        keyboard={false}
        onClick={() => router.push("/karte")}
      >
        <Marker longitude={10} latitude={50} anchor="bottom">
          <div
            onClick={(e) => {
              e.stopPropagation();
              router.push("/inny");
            }}
            style={{
              background: "#f00",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          />
        </Marker>
      </Map>
    </div>
  );
}

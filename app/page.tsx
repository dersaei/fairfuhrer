// app/page.tsx
"use client";

import React, { useRef, useEffect } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  const initialViewState = {
    longitude: 15,
    latitude: 50,
    zoom: 1.3,
    pitch: 0,
    bearing: 0,
  };

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const onLoad = () => {
      // Blokada interakcji
      map.dragRotate.disable();
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();

      // Ustaw język niemiecki bezpośrednio na warstwach
      setTimeout(() => {
        const layers = map.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            if (
              layer.type === "symbol" &&
              layer.layout &&
              layer.layout["text-field"]
            ) {
              try {
                // Spróbuj ustawić niemieckie nazwy
                map.setLayoutProperty(layer.id, "text-field", [
                  "coalesce",
                  ["get", "name_de"],
                  ["get", "name:de"],
                  ["get", "name_en"],
                  ["get", "name"],
                ]);
              } catch (error) {
                console.log(
                  `Nie można ustawić języka dla warstwy ${layer.id}:`,
                  error
                );
              }
            }
          });
        }
      }, 500);

      // Alternatywnie: użyj konfiguracji basemap dla Standard style
      try {
        map.setConfigProperty("basemap", "localizeLabels", true);
        map.setConfigProperty("basemap", "language", "de");
      } catch (error) {
        console.log("Nie można ustawić konfiguracji basemap:", error);
      }

      // Dodaj efekt kosmosu
      map.setFog({
        range: [-1, 1.5],
        "horizon-blend": 0.05,
        color: "rgb(160, 180, 200)",
        "high-color": "rgb(50, 80, 150)",
        "space-color": "rgb(5, 5, 15)",
        "star-intensity": 1,
      });

      // Animacja obrotu globu
      const spin = () => {
        const center = map.getCenter();
        map.easeTo({
          center: [center.lng - 0.2, center.lat],
          duration: 1000,
          easing: (t: number) => t,
        });
      };
      map.on("moveend", spin);
      spin();
    };

    map.on("load", onLoad);
    return () => {
      map.off("load", onLoad);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        projection="globe"
        style={{ width: "100%", height: "100%" }}
        dragPan={false}
        scrollZoom={false}
        doubleClickZoom={false}
        keyboard={false}
        cursor="pointer"
        onClick={() => router.push("/karte")}
      />
    </div>
  );
}

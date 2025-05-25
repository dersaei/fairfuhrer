"use client";

import React, { useRef } from "react";
import Map, { type MapRef } from "react-map-gl/mapbox"; // ← here
import atmosphereStyle from "../styles/atmosphere.json"; // your JSON style
import "mapbox-gl/dist/mapbox-gl.css";
import { useRouter } from "next/navigation";
import type { StyleSpecification } from "mapbox-gl";

export default function HomePage() {
  const router = useRouter();
  const mapRef = useRef<MapRef>(null);
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  return (
    <div style={{ width: "100vw", height: "calc(100vh - 90px)" }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={atmosphereStyle as unknown as StyleSpecification} // ← pass your JSON here
        projection="globe"
        interactive={false} // disables all gestures
        cursor="pointer"
        onClick={() => router.push("/karte")} // navigate on click
      />
    </div>
  );
}

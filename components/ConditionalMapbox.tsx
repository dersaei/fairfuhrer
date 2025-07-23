// fairfuhrer/app/components/ConditionalMapbox.tsx
"use client";

import React from "react";
import { useCookies } from "../context/CookieContext";

interface ConditionalMapboxProps {
  children: React.ReactNode;
}

export function ConditionalMapbox({ children }: ConditionalMapboxProps) {
  const { hasConsented } = useCookies();

  // Mapbox is necessary, so we render it once user has given any consent
  // But we wait for consent to avoid GDPR issues
  if (!hasConsented) {
    return (
      <div
        style={{
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          textAlign: "center" as const,
          color: "#666",
        }}
      >
        <p>
          Karte wird geladen, nachdem Sie den Cookie-Einstellungen zugestimmt
          haben.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

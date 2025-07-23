// fairfuhrer/app/components/ConditionalMuxVideo.tsx
"use client";

import React from "react";
import { useCookies } from "../context/CookieContext";

interface ConditionalMuxVideoProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// 🔧 POPRAWIONY PRZYCISK - OTWIERA COOKIE BANNER
function CookieSettingsButton() {
  const { showSettings } = useCookies(); // ✅ DODANE showSettings

  return (
    <button
      onClick={showSettings} // ✅ ZMIENIONE z handleReload na showSettings
      style={{
        marginTop: "10px",
        padding: "8px 16px",
        backgroundColor: "#0066cc",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Cookie-Einstellungen ändern
    </button>
  );
}

export function ConditionalMuxVideo({
  children,
  fallback,
}: ConditionalMuxVideoProps) {
  const { preferences, hasConsented } = useCookies();

  // Don't render anything if user hasn't consented yet
  if (!hasConsented) {
    return (
      fallback || (
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
            Video wird geladen, nachdem Sie den Cookie-Einstellungen zugestimmt
            haben.
          </p>
        </div>
      )
    );
  }

  // Only render Mux video if functional cookies are accepted
  if (preferences.functional) {
    return <>{children}</>;
  }

  return (
    fallback || (
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
          Für die Videowiedergabe müssen funktionale Cookies aktiviert werden.
        </p>
        <CookieSettingsButton />
      </div>
    )
  );
}

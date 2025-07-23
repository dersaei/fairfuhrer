// fairfuhrer/app/components/ConditionalPayPal.tsx
"use client";

import React from "react";
import { useCookies } from "../context/CookieContext";

interface ConditionalPayPalProps {
  children: React.ReactNode;
}

export function ConditionalPayPal({ children }: ConditionalPayPalProps) {
  const { hasConsented } = useCookies();

  // PayPal is necessary, so we render it once user has given any consent
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
          PayPal wird geladen, nachdem Sie den Cookie-Einstellungen zugestimmt
          haben.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

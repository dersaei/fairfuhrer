// fairfuhrer/app/components/HotjarTag.tsx
"use client";

import { useEffect } from "react";
import Hotjar from "@hotjar/browser";
import { useCookies } from "../context/CookieContext";

interface HotjarTagProps {
  siteId: number;
  hotjarVersion?: number;
}

export default function HotjarTag({
  siteId,
  hotjarVersion = 6,
}: HotjarTagProps) {
  const { preferences, hasConsented } = useCookies();

  useEffect(() => {
    // Sprawdź czy siteId jest prawidłowe
    if (!siteId || isNaN(siteId)) {
      console.warn("Hotjar: Invalid site ID provided");
      return;
    }

    // Uruchom Hotjar tylko jeśli użytkownik wyraził zgodę na cookies analityczne
    if (hasConsented && preferences.analytics) {
      try {
        Hotjar.init(siteId, hotjarVersion);
        console.log("Hotjar initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Hotjar:", error);
      }
    }
  }, [siteId, hotjarVersion, hasConsented, preferences.analytics]);

  // Obsługuj zmiany preferencji cookies w czasie rzeczywistym
  useEffect(() => {
    // Sprawdź czy siteId jest prawidłowe
    if (!siteId || isNaN(siteId)) {
      return;
    }

    if (hasConsented) {
      if (preferences.analytics) {
        // Jeśli analityczne cookies zostały włączone
        try {
          Hotjar.init(siteId, hotjarVersion);
          console.log("Hotjar enabled via consent update");
        } catch (error) {
          console.error("Failed to enable Hotjar:", error);
        }
      } else {
        // Jeśli analityczne cookies zostały wyłączone
        // Hotjar nie ma built-in metody do wyłączania, ale możemy wyczyścić dane
        try {
          // Wyczyść lokalne dane Hotjar
          if (typeof window !== "undefined") {
            const hotjarCookies = document.cookie
              .split(";")
              .filter((cookie) => cookie.trim().startsWith("_hj"));

            hotjarCookies.forEach((cookie) => {
              const cookieName = cookie.split("=")[0].trim();
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            });
          }
          console.log("Hotjar disabled and cookies cleared");
        } catch (error) {
          console.error("Failed to clear Hotjar data:", error);
        }
      }
    }
  }, [preferences.analytics, hasConsented, siteId, hotjarVersion]);

  // Komponent nie renderuje nic - tylko zarządza skryptem
  return null;
}

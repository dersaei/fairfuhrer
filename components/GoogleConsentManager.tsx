// fairfuhrer/components/GoogleConsentManager.tsx
"use client";

import { useEffect } from "react";
import { useCookies } from "../context/CookieContext";

export default function GoogleConsentManager() {
  const { preferences, hasConsented } = useCookies();

  // Aktualizuj consent gdy preferencje się zmienią
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.gtag === "function" &&
      hasConsented
    ) {
      const consentData = {
        analytics_storage: preferences.analytics ? "granted" : "denied",
        ad_storage: preferences.analytics ? "granted" : "denied",
        functionality_storage: preferences.functional ? "granted" : "denied",
        personalization_storage: preferences.functional ? "granted" : "denied",
      };

      window.gtag("consent", "update", consentData);

      console.log("🔄 Google Tag consent updated:", consentData);

      // Wyślij custom event po aktualizacji consent
      window.gtag("event", "consent_update", {
        consent_analytics: preferences.analytics,
        consent_functional: preferences.functional,
        event_category: "consent",
        event_label: "preferences_updated",
      });

      // Jeśli analytics zostało włączone, wyślij page_view
      if (preferences.analytics) {
        window.gtag("event", "page_view", {
          page_title: document.title,
          page_location: window.location.href,
          page_path: window.location.pathname,
          consent_granted: true,
        });

        console.log("📊 Page view sent after analytics consent");
      }
    }
  }, [preferences, hasConsented]);

  // Ten komponent nie renderuje nic - tylko zarządza consent
  return null;
}

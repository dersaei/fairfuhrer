"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Global types dla Google Tag i Hotjar
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    hj: (...args: unknown[]) => void;
    _hjSettings: { hjid: number; hjsv: number };
  }
}

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  showBanner: boolean;
  updatePreferences: (preferences: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showSettings: () => void;
  hideBanner: () => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true for Mapbox and PayPal
  functional: false, // Mux - user choice
  analytics: false, // Google Analytics + Hotjar - user choice
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const STORAGE_KEY = "cookie-preferences";
const CONSENT_KEY = "cookie-consent-given";

export function CookieProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consentGiven = localStorage.getItem(CONSENT_KEY);
    const savedPreferences = localStorage.getItem(STORAGE_KEY);

    if (consentGiven && savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
      setHasConsented(true);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    localStorage.setItem(CONSENT_KEY, "true");
    setPreferences(newPreferences);
    setHasConsented(true);

    // Wyślij consent update do Google Tag
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: newPreferences.analytics ? "granted" : "denied",
        ad_storage: newPreferences.analytics ? "granted" : "denied",
        functionality_storage: newPreferences.functional ? "granted" : "denied",
        personalization_storage: newPreferences.functional
          ? "granted"
          : "denied",
      });

      // Wyślij custom event do dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "consent_update",
        consent_analytics: newPreferences.analytics,
        consent_functional: newPreferences.functional,
        consent_necessary: newPreferences.necessary,
        // Dodaj informację o Hotjar
        hotjar_enabled: newPreferences.analytics,
      });

      console.log("Consent updated:", newPreferences);
    }
  };

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    savePreferences(updated);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const showSettings = () => {
    setShowBanner(true);
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsented,
        showBanner,
        updatePreferences,
        acceptAll,
        rejectAll,
        showSettings,
        hideBanner,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookies must be used within a CookieProvider");
  }
  return context;
}

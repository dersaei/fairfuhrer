"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

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

  /* eslint-disable react-hooks/set-state-in-effect */
  // Loading consent state from localStorage on mount
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
  /* eslint-enable react-hooks/set-state-in-effect */

  // ✅ Funkcja do analytics tracking - zwykła funkcja, nie hook
  const trackPreferencesChange = (prefs: CookiePreferences) => {
    console.log("🍪 Tracking cookie preferences change:", prefs);

    // Wyślij event do dataLayer dla Next.js GA4
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      const eventData = {
        event: "consent_preferences_saved",
        consent_analytics: prefs.analytics,
        consent_functional: prefs.functional,
        consent_necessary: prefs.necessary,
        hotjar_enabled: prefs.analytics,
        timestamp: new Date().toISOString(),
        integration: "nextjs_third_parties",
      };

      console.log(
        "📈 Pushing consent event to dataLayer (Next.js):",
        eventData
      );
      window.dataLayer.push(eventData);
    }

    // Wymuś aktualizację consent dla Next.js GA
    setTimeout(() => {
      if (
        typeof window !== "undefined" &&
        typeof window.gtag === "function"
      ) {
        const consentData = {
          analytics_storage: prefs.analytics ? "granted" : "denied",
          ad_storage: prefs.analytics ? "granted" : "denied",
          functionality_storage: prefs.functional ? "granted" : "denied",
          personalization_storage: prefs.functional ? "granted" : "denied",
        };

        window.gtag("consent", "update", consentData);
        console.log("🔄 Manual consent update for Next.js GA:", consentData);

        // Wyślij test event jeśli analytics są włączone
        if (prefs.analytics) {
          window.gtag("event", "manual_consent_granted", {
            event_category: "consent",
            event_label: "nextjs_manual_update",
            value: 1,
            timestamp: new Date().toISOString(),
          });
          console.log("✅ Manual test event sent after consent update");
        }
      } else {
        console.warn("⚠️ window.gtag not available after 1 second delay");
      }
    }, 1000);
  };

  // ✅ REACT 19.2: useCallback dla stabilnej referencji funkcji
  const savePreferences = useCallback(
    (newPreferences: CookiePreferences) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      localStorage.setItem(CONSENT_KEY, "true");
      setPreferences(newPreferences);
      setHasConsented(true);

      // Użyj zwykłej funkcji dla analytics tracking
      trackPreferencesChange(newPreferences);
    },
    [] // Pusta deps - trackPreferencesChange to zwykła funkcja, nie hook
  );

  // ✅ REACT 19.2: useCallback dla wszystkich funkcji w context
  const updatePreferences = useCallback(
    (newPreferences: Partial<CookiePreferences>) => {
      const updated = { ...preferences, ...newPreferences };
      savePreferences(updated);
    },
    [preferences, savePreferences]
  );

  const acceptAll = useCallback(() => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  }, [savePreferences]);

  const rejectAll = useCallback(() => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  }, [savePreferences]);

  const showSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  const hideBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  // ✅ REACT 19.2: useMemo dla context value - zapobiega niepotrzebnym re-renderom
  const contextValue = useMemo(
    () => ({
      preferences,
      hasConsented,
      showBanner,
      updatePreferences,
      acceptAll,
      rejectAll,
      showSettings,
      hideBanner,
    }),
    [
      preferences,
      hasConsented,
      showBanner,
      updatePreferences,
      acceptAll,
      rejectAll,
      showSettings,
      hideBanner,
    ]
  );

  return (
    <CookieContext.Provider value={contextValue}>
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

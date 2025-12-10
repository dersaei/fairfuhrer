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
import { saveCookiePreferences } from "@/app/actions/cookies";

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

/**
 * Type guard to validate CookiePreferences object
 */
function isValidCookiePreferences(obj: unknown): obj is CookiePreferences {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "necessary" in obj &&
    "functional" in obj &&
    "analytics" in obj &&
    typeof (obj as CookiePreferences).necessary === "boolean" &&
    typeof (obj as CookiePreferences).functional === "boolean" &&
    typeof (obj as CookiePreferences).analytics === "boolean"
  );
}

export function CookieProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Loading consent state from localStorage/cookies on mount with validation
  useEffect(() => {
    try {
      // First try to read from cookies (priority)
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("cookie-preferences="))
        ?.split("=")[1];

      let parsedPreferences: CookiePreferences | null = null;

      if (cookieValue) {
        try {
          const decoded = decodeURIComponent(cookieValue);
          const parsed = JSON.parse(decoded);
          if (isValidCookiePreferences(parsed)) {
            parsedPreferences = parsed;
          }
        } catch (error) {
          console.error("Failed to parse cookie preferences:", error);
        }
      }

      // Fallback to localStorage if cookies don't have valid data
      if (!parsedPreferences) {
        const savedPreferences = localStorage.getItem(STORAGE_KEY);
        if (savedPreferences) {
          try {
            const parsed = JSON.parse(savedPreferences);
            if (isValidCookiePreferences(parsed)) {
              parsedPreferences = parsed;
            } else {
              console.warn("Invalid preferences format in localStorage");
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch (error) {
            console.error("Failed to parse localStorage preferences:", error);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }

      // Check if user has given consent
      const consentGiven =
        document.cookie.includes("cookie-consent-given=true") ||
        localStorage.getItem(CONSENT_KEY) === "true";

      if (consentGiven && parsedPreferences) {
        setPreferences(parsedPreferences);
        setHasConsented(true);
        setShowBanner(false);
      } else {
        setShowBanner(true);
      }
    } catch (error) {
      console.error("Error loading cookie preferences:", error);
      setShowBanner(true);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ✅ Storage event listener - sync preferences across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Only handle changes to our specific keys
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (isValidCookiePreferences(parsed)) {
            setPreferences(parsed);
            console.log("🔄 Cookie preferences synced from another tab");
          }
        } catch (error) {
          console.error("Failed to parse preferences from storage event:", error);
        }
      } else if (e.key === CONSENT_KEY) {
        const newConsentValue = e.newValue === "true";
        setHasConsented(newConsentValue);
        console.log(`🔄 Consent status synced from another tab: ${newConsentValue}`);
      }
    };

    // Listen for storage events from other tabs
    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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

    // ✅ Adaptive gtag availability check - polls with exponential backoff
    const sendConsentToGtag = (prefs: CookiePreferences) => {
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
    };

    // Adaptive polling: check multiple times with increasing delays
    const checkGtagAvailability = (
      attempt = 0,
      maxAttempts = 5,
      delay = 100
    ) => {
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        // gtag is available - send consent immediately
        sendConsentToGtag(prefs);
      } else if (attempt < maxAttempts) {
        // gtag not yet available - retry with exponential backoff
        setTimeout(() => {
          checkGtagAvailability(attempt + 1, maxAttempts, delay * 2);
        }, delay);
      } else {
        // Max attempts reached
        console.warn(
          "⚠️ window.gtag not available after multiple checks. GA may not be loaded."
        );
      }
    };

    // Start checking for gtag availability
    checkGtagAvailability();
  };

  // ✅ REACT 19.2: useCallback dla stabilnej referencji funkcji
  const savePreferences = useCallback(
    async (newPreferences: CookiePreferences) => {
      // Save to both localStorage (for immediate access) and server-side cookies (for security)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      localStorage.setItem(CONSENT_KEY, "true");

      // Save to server-side cookies via Server Action
      try {
        await saveCookiePreferences(newPreferences);
        console.log("✅ Preferences saved to server-side cookies");
      } catch (error) {
        console.error("Failed to save preferences to server:", error);
        // Continue even if server-side save fails - localStorage is still available
      }

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

// app/_components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCookies } from "../../context/CookieContext";

interface AnalyticsTrackerProps {
  gaId: string;
}

/**
 * Analytics tracker for SPA navigation
 * Tracks pageviews when users navigate between pages using client-side routing
 *
 * This is necessary because Google Analytics only tracks the initial page load by default.
 * For client-side navigation (SPA), we need to manually send pageview events.
 */
export function AnalyticsTracker({ gaId }: AnalyticsTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { preferences, hasConsented } = useCookies();

  useEffect(() => {
    if (!hasConsented || !preferences.analytics) {
      return;
    }

    if (!window.gtag) {
      return;
    }

    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Use event "page_view" for SPA navigation — gtag("config") reinitialises the
    // GA session and can cause duplicate sessions / broken conversion attribution.
    window.gtag("event", "page_view", {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
      send_to: gaId,
    });
  }, [pathname, searchParams, hasConsented, preferences.analytics, gaId]);

  return null;
}

// app/_components/analytics-tracker.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useCookies } from "../../context/CookieContext";

/**
 * Analytics tracker for SPA navigation
 * Tracks pageviews when users navigate between pages using client-side routing
 *
 * This is necessary because Google Analytics only tracks the initial page load by default.
 * For client-side navigation (SPA), we need to manually send pageview events.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { preferences, hasConsented } = useCookies();

  useEffect(() => {
    // Only track if user has consented to analytics
    if (!hasConsented || !preferences.analytics) {
      return;
    }

    // Wait for gtag to be available
    if (typeof window === "undefined" || !window.gtag) {
      return;
    }

    // Construct full URL with search params
    const url =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Send pageview to Google Analytics
    window.gtag(
      "config",
      process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || "G-RZ7CM3J072",
      {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
      }
    );

    console.log(`📄 Pageview tracked: ${url}`);
  }, [pathname, searchParams, hasConsented, preferences.analytics]);

  // This component doesn't render anything
  return null;
}

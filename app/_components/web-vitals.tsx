// app/_components/web-vitals.tsx
"use client";

import { useRef } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { useCookies } from "../../context/CookieContext";

/**
 * Web Vitals monitoring component for tracking Core Web Vitals
 * Sends metrics to Google Analytics when user has consented to analytics cookies
 *
 * Tracked metrics:
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - CLS (Cumulative Layout Shift)
 * - INP (Interaction to Next Paint)
 */
export function WebVitals() {
  const { preferences, hasConsented } = useCookies();

  // useReportWebVitals registers the callback once and doesn't update it on re-renders.
  // Use a ref so the callback always reads the latest consent state without stale closure.
  const consentRef = useRef({ hasConsented, analytics: preferences.analytics });
  consentRef.current = { hasConsented, analytics: preferences.analytics };

  useReportWebVitals((metric) => {
    if (!consentRef.current.hasConsented || !consentRef.current.analytics) {
      return;
    }

    if (window.gtag) {
      window.gtag("event", metric.name, {
        // CLS values are typically very small decimals, so multiply by 1000
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
        metric_delta: metric.delta,
        metric_rating: metric.rating,
      });
    }
  });

  return null;
}

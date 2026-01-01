// app/_components/web-vitals.tsx
"use client";

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
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - INP (Interaction to Next Paint)
 */
export function WebVitals() {
  const { preferences, hasConsented } = useCookies();

  useReportWebVitals((metric) => {
    // Only send metrics if user has consented to analytics cookies
    if (!hasConsented || !preferences.analytics) {
      return;
    }

    // Send to Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", metric.name, {
        // CLS values are typically very small decimals, so multiply by 1000
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id, // Unique ID for this page load
        non_interaction: true, // Don't affect bounce rate
        metric_delta: metric.delta,
        metric_rating: metric.rating,
      });

      console.log(
        `📊 Web Vital sent: ${metric.name} = ${metric.value} (${metric.rating})`
      );
    }
  });

  // This component doesn't render anything
  return null;
}

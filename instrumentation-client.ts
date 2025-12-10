// instrumentation-client.ts
// This file runs BEFORE your application's frontend code starts executing
// Ideal for global analytics initialization and error tracking setup

/**
 * Global instrumentation for client-side analytics and error tracking
 * Runs before React hydration
 */
export function register() {
  if (typeof window === "undefined") {
    return; // Only run on client-side
  }

  console.log("🔧 Client instrumentation initialized");

  // Global error tracking - catches errors before React Error Boundary
  window.addEventListener("error", (event) => {
    console.error("🚨 Global error caught:", event.error);

    // Send to Google Analytics if available
    if (typeof window.gtag === "function") {
      window.gtag("event", "exception", {
        description: event.error?.message || event.message || "Unknown error",
        fatal: false,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("🚨 Unhandled promise rejection:", event.reason);

    // Send to Google Analytics if available
    if (typeof window.gtag === "function") {
      window.gtag("event", "exception", {
        description:
          event.reason?.message ||
          String(event.reason) ||
          "Unhandled promise rejection",
        fatal: false,
        stack: event.reason?.stack,
        promise_rejection: true,
      });
    }
  });

  // Performance monitoring - track if page is slow to load
  if ("performance" in window && "PerformanceObserver" in window) {
    try {
      // Monitor long tasks (tasks taking >50ms)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);

            if (typeof window.gtag === "function") {
              window.gtag("event", "long_task", {
                event_category: "performance",
                event_label: entry.name,
                value: Math.round(entry.duration),
                non_interaction: true,
              });
            }
          }
        }
      });

      // Start observing
      if (PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      }
    } catch (error) {
      console.error("Failed to initialize performance observer:", error);
    }
  }

  console.log("✅ Global error tracking and performance monitoring initialized");
}

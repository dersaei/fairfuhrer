// instrumentation-client.ts
// This file runs BEFORE your application's frontend code starts executing
// Ideal for global analytics initialization and error tracking setup

/**
 * Global instrumentation for client-side analytics and error tracking
 * Runs before React hydration
 */
export function register() {
  // Global error tracking - catches errors before React Error Boundary
  window.addEventListener("error", (event) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "exception", {
        description: event.error?.message || event.message || "Unknown error",
        fatal: false,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "exception", {
        description:
          event.reason?.message ||
          String(event.reason) ||
          "Unhandled promise rejection",
        fatal: false,
        promise_rejection: true,
      });
    }
  });

  // Performance monitoring - track long tasks (>50ms by spec definition)
  if ("PerformanceObserver" in window) {
    try {
      if (PerformanceObserver.supportedEntryTypes?.includes("longtask")) {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (typeof window.gtag === "function") {
              window.gtag("event", "long_task", {
                event_category: "performance",
                event_label: entry.name,
                value: Math.round(entry.duration),
                non_interaction: true,
              });
            }
          }
        });

        longTaskObserver.observe({ entryTypes: ["longtask"] });
      }
    } catch (error) {
      console.error("Failed to initialize performance observer:", error);
    }
  }
}

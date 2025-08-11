// fairfuhrer/components/DebugAnalytics.tsx
// UWAGA: To jest komponent TYLKO do testowania - usuń po naprawieniu!
"use client";

import { useCookies } from "../context/CookieContext";

export default function DebugAnalytics() {
  const { preferences } = useCookies();

  const testGoogleAnalytics = () => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      console.log("🧪 Testing Google Analytics...");

      // Test event
      window.gtag("event", "debug_test", {
        event_category: "debug",
        event_label: "manual_test",
        value: Math.floor(Math.random() * 100),
        debug_timestamp: new Date().toISOString(),
      });

      // Test page_view
      window.gtag("event", "page_view", {
        page_title: "Debug Test Page",
        page_location: window.location.href,
        custom_parameter: "debug_mode",
      });

      console.log("✅ Test events sent!");
      alert("Test events sent! Check console and Google Analytics Real-time.");
    } else {
      console.error("❌ Google Analytics not loaded!");
      alert("ERROR: Google Analytics not loaded!");
    }
  };

  const checkDataLayer = () => {
    console.log("🔍 DataLayer status:");
    console.log("- dataLayer exists:", !!window.dataLayer);
    console.log("- gtag function exists:", typeof window.gtag);
    console.log("- dataLayer length:", window.dataLayer?.length);
    console.log("- Last 5 entries:", window.dataLayer?.slice(-5));
    console.log("- Current preferences:", preferences);
  };

  // Tylko w development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        background: "#000",
        color: "#fff",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "12px",
        fontFamily: "monospace",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
        🔧 Analytics Debug
      </div>
      <div style={{ marginBottom: "5px" }}>
        Analytics: {preferences.analytics ? "✅ ON" : "❌ OFF"}
      </div>
      <div style={{ marginBottom: "5px" }}>
        GTAG:{" "}
        {typeof window !== "undefined" && typeof window.gtag === "function"
          ? "✅"
          : "❌"}
      </div>
      <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
        <button
          onClick={testGoogleAnalytics}
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Test GA
        </button>
        <button
          onClick={checkDataLayer}
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          Check
        </button>
      </div>
    </div>
  );
}

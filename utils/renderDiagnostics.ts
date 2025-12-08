// utils/renderDiagnostics.ts - Next.js 16.0.7 + React 19.2.1
// ✅ Server-only protection - this file logs sensitive environment variables
import "server-only";

export function logRenderEnvironment() {
  if (typeof window === "undefined") {
    // Server-side logging (w API routes i podczas build)
    console.log("=== RENDER ENVIRONMENT CHECK ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("PayPal Mode:", process.env.PAYPAL_MODE);
    console.log("PayPal Client ID present:", !!process.env.PAYPAL_CLIENT_ID);
    console.log(
      "PayPal Client Secret present:",
      !!process.env.PAYPAL_CLIENT_SECRET
    );
    console.log("PayPal Webhook ID present:", !!process.env.PAYPAL_WEBHOOK_ID);
    console.log("Directus URL:", process.env.DIRECTUS_URL);
    console.log("Return URL:", process.env.PAYPAL_RETURN_URL);
    console.log("Cancel URL:", process.env.PAYPAL_CANCEL_URL);
    console.log("Current time:", new Date().toISOString());
    console.log("=== END ENVIRONMENT CHECK ===");
  } else {
    // Client-side logging (w przeglądarce)
    console.log("=== CLIENT ENVIRONMENT CHECK ===");
    console.log(
      "Public PayPal Client ID present:",
      !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    );
    console.log("Current URL:", window.location.href);
    console.log("User Agent:", navigator.userAgent);
    console.log("=== END CLIENT CHECK ===");
  }
}

// ✅ HELPER: Funkcja do sprawdzenia czy wszystko OK
export function validateRenderConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Sprawdź server-side ENV
  if (typeof window === "undefined") {
    if (!process.env.PAYPAL_CLIENT_ID) errors.push("PAYPAL_CLIENT_ID missing");
    if (!process.env.PAYPAL_CLIENT_SECRET)
      errors.push("PAYPAL_CLIENT_SECRET missing");
    if (!process.env.PAYPAL_MODE) errors.push("PAYPAL_MODE missing");
    if (!process.env.PAYPAL_WEBHOOK_ID)
      errors.push("PAYPAL_WEBHOOK_ID missing");
    if (!process.env.DIRECTUS_URL) errors.push("DIRECTUS_URL missing");

    // Sprawdź URLs
    if (process.env.PAYPAL_RETURN_URL?.includes("localhost")) {
      errors.push("PAYPAL_RETURN_URL still uses localhost");
    }
    if (process.env.PAYPAL_CANCEL_URL?.includes("localhost")) {
      errors.push("PAYPAL_CANCEL_URL still uses localhost");
    }
  } else {
    // Sprawdź client-side ENV
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      errors.push("NEXT_PUBLIC_PAYPAL_CLIENT_ID missing");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

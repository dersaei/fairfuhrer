// lib/paypal.ts - Next.js 15 kompatybilny
import type { PayPalConfig } from "@/types";

// Helper function do sprawdzania czy jesteśmy server-side
function isServerSide(): boolean {
  return typeof window === "undefined";
}

// Funkcja do bezpiecznego pobierania env vars
function getEnvVar(name: string): string {
  if (!isServerSide()) {
    // W browser zwracamy puste stringi - nie kraszujemy
    return "";
  }
  return process.env[name] || "";
}

// Walidacja zmiennych środowiskowych TYLKO server-side
if (isServerSide()) {
  const requiredEnvVars = {
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    PAYPAL_MODE: process.env.PAYPAL_MODE,
    PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
  };

  // Sprawdź czy wszystkie zmienne są ustawione
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      console.error(`Missing environment variable: ${key}`);
      console.error(
        "Available env vars:",
        Object.keys(process.env).filter((k) => k.startsWith("PAYPAL"))
      );
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// Konfiguracja PayPal - zabezpieczona przed browser
export const paypalConfig: PayPalConfig = {
  client_id: getEnvVar("PAYPAL_CLIENT_ID"),
  client_secret: getEnvVar("PAYPAL_CLIENT_SECRET"),
  mode: (getEnvVar("PAYPAL_MODE") as "sandbox" | "production") || "sandbox",
  webhook_id: getEnvVar("PAYPAL_WEBHOOK_ID"),
  currency: getEnvVar("PAYPAL_CURRENCY") || "EUR",
  min_amount: parseInt(getEnvVar("PAYPAL_MIN_AMOUNT") || "100"),
  max_amount: parseInt(getEnvVar("PAYPAL_MAX_AMOUNT") || "1000000"),
  return_url:
    getEnvVar("PAYPAL_RETURN_URL") ||
    "http://localhost:3000/sparschwein/success",
  cancel_url:
    getEnvVar("PAYPAL_CANCEL_URL") ||
    "http://localhost:3000/sparschwein/cancel",
};

// PayPal Script Options (dla React komponentów) - BEZ server SDK
export function getPayPalScriptOptions() {
  return {
    clientId: paypalConfig.client_id,
    currency: paypalConfig.currency,
    intent: "capture",
    locale: "de_DE", // Niemiecka lokalizacja
  };
}

// Helper functions
export function formatAmount(amountInCents: number): string {
  return (amountInCents / 100).toFixed(2);
}

export function parseAmount(amountString: string): number {
  const amount = parseFloat(amountString);
  return Math.round(amount * 100);
}

export function isValidAmount(amountInCents: number): boolean {
  return (
    amountInCents >= paypalConfig.min_amount &&
    amountInCents <= paypalConfig.max_amount
  );
}

// Funkcja do tworzenia PayPal order request body
export function createOrderRequestBody(amountInCents: number) {
  return {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: paypalConfig.currency,
          value: formatAmount(amountInCents),
        },
        description: "Spende für FairFührer",
      },
    ],
    application_context: {
      brand_name: "FairFührer",
      locale: "de-DE",
      landing_page: "BILLING",
      shipping_preference: "NO_SHIPPING",
      user_action: "PAY_NOW",
      return_url: paypalConfig.return_url,
      cancel_url: paypalConfig.cancel_url,
    },
  };
}

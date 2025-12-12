// lib/paypal.ts - Next.js 16.0.7 + React 19.2.1 compatible
// ✅ Server-only protection - prevents accidental client-side imports
import "server-only";

import type { PayPalConfig } from "@/types";

// ========================================
// Environment Variable Validation
// ========================================

const requiredEnvVars = {
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE: process.env.PAYPAL_MODE,
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID,
};

// Validate all required environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`❌ Missing environment variable: ${key}`);
    console.error(
      "Available PayPal env vars:",
      Object.keys(process.env).filter((k) => k.startsWith("PAYPAL"))
    );
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// ========================================
// PayPal Configuration
// ========================================

export const paypalConfig: PayPalConfig = {
  client_id: process.env.PAYPAL_CLIENT_ID!,
  client_secret: process.env.PAYPAL_CLIENT_SECRET!,
  mode: (process.env.PAYPAL_MODE as "sandbox" | "production") || "sandbox",
  webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
  currency: process.env.PAYPAL_CURRENCY || "EUR",
  min_amount: parseInt(process.env.PAYPAL_MIN_AMOUNT || "100"),
  max_amount: parseInt(process.env.PAYPAL_MAX_AMOUNT || "1000000"),
  return_url:
    process.env.PAYPAL_RETURN_URL ||
    "http://localhost:3000/sparschwein/success",
  cancel_url:
    process.env.PAYPAL_CANCEL_URL ||
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

// components/PayPalProvider.tsx - Z TYMCZASOWĄ DIAGNOSTYKĄ
"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useEffect } from "react";
import type { ReactNode } from "react";

// ✅ TYMCZASOWO: Import diagnostyki
import {
  logRenderEnvironment,
  validateRenderConfig,
} from "@/utils/renderDiagnostics";

interface PayPalProviderProps {
  children: ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  // ✅ BARDZO PODSTAWOWA konfiguracja - tylko to co konieczne
  const scriptOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "EUR",
    intent: "capture" as const,
    disableFunding: ["card", "p24"],
    locale: "de_DE",
  };

  // ✅ TYMCZASOWO: Uruchom client-side diagnostykę
  useEffect(() => {
    console.log("🔍 === CLIENT-SIDE DIAGNOSTICS START ===");
    logRenderEnvironment();

    const validation = validateRenderConfig();
    if (!validation.isValid) {
      console.error("❌ Client-side configuration errors:", validation.errors);
    } else {
      console.log("✅ Client-side configuration looks good!");
    }
    console.log("🔍 === CLIENT-SIDE DIAGNOSTICS END ===");
  }, []); // Uruchom tylko raz po mount

  if (!scriptOptions.clientId) {
    console.warn(
      "❌ PayPal Client ID not found - PayPal functionality will be disabled"
    );

    // ✅ TYMCZASOWO: Dodatkowa diagnostyka przy braku Client ID
    console.log("🔍 === MISSING CLIENT ID DIAGNOSTICS ===");
    console.log("Available env vars starting with NEXT_PUBLIC_:");
    Object.keys(process.env)
      .filter((key) => key.startsWith("NEXT_PUBLIC_"))
      .forEach((key) => {
        console.log(`${key}: ${process.env[key] ? "present" : "missing"}`);
      });
    console.log("🔍 === END MISSING CLIENT ID DIAGNOSTICS ===");

    return <>{children}</>;
  }

  // ✅ TYMCZASOWO: Rozszerzone logowanie konfiguracji
  console.log("🔍 PayPal Provider - Configuration check:", {
    clientIdPresent: !!scriptOptions.clientId,
    clientIdLength: scriptOptions.clientId.length,
    clientIdStart: scriptOptions.clientId.substring(0, 4),
    clientIdEnd: scriptOptions.clientId.substring(
      scriptOptions.clientId.length - 4
    ),
    currency: scriptOptions.currency,
    intent: scriptOptions.intent,
    locale: scriptOptions.locale,
    disabledFunding: scriptOptions.disableFunding,
    currentUrl:
      typeof window !== "undefined" ? window.location.href : "server-side",
    timestamp: new Date().toISOString(),
  });

  return (
    <PayPalScriptProvider options={scriptOptions} deferLoading={false}>
      {children}
    </PayPalScriptProvider>
  );
}

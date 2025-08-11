// components/PayPalProvider.tsx - CZYSTY KOD BEZ DIAGNOSTYKI
"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { ReactNode } from "react";

interface PayPalProviderProps {
  children: ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  const scriptOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "EUR",
    intent: "capture" as const,
    disableFunding: ["card", "p24"],
    locale: "de_DE",
  };

  if (!scriptOptions.clientId) {
    console.warn("PayPal Client ID not found - PayPal functionality disabled");
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider options={scriptOptions} deferLoading={false}>
      {children}
    </PayPalScriptProvider>
  );
}

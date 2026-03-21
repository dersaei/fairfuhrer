// components/PayPalProvider.tsx
"use client";

import { PayPalProvider as PayPalSDKProvider } from "@paypal/react-paypal-js/sdk-v6";
import type { ReactNode } from "react";

interface PayPalProviderProps {
  children: ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  if (!clientId) {
    console.warn("PayPal Client ID not found - PayPal functionality disabled");
    return <>{children}</>;
  }

  return (
    <PayPalSDKProvider
      clientId={clientId}
      components={["paypal-payments"]}
      pageType="checkout"
      locale="de-DE"
    >
      {children}
    </PayPalSDKProvider>
  );
}

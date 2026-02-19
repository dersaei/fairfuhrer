// components/PayPalButtons.tsx
"use client";

import { PayPalButtons as PayPalButtonsSDK } from "@paypal/react-paypal-js";
import { useState } from "react";
import type { PayPalDonation } from "@/types";
import styles from "./PayPalButtons.module.css";

interface DonorData {
  email?: string;
  name?: string;
  message?: string;
}

interface PayPalButtonsProps {
  amount: number; // w centach
  donorData?: DonorData;
  onApprove?: () => boolean; // return false to cancel
  onSuccess?: (donation: PayPalDonation) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PayPalButtons({
  amount,
  donorData,
  onApprove,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  // Przechowuj orderId żeby cancel-order mógł go użyć
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  return (
    <div className={styles.paypalButtonsContainer}>
      {disabled && (
        <div className={styles.processingOverlay}>
          <div className={styles.spinner}></div>
          <span>Zahlung wird verarbeitet...</span>
        </div>
      )}

      <PayPalButtonsSDK
        disabled={disabled || isProcessing}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "donate",
          tagline: false,
          height: 45,
        }}
        forceReRender={[amount]}
        createOrder={async () => {
          try {
            if (onApprove && !onApprove()) {
              throw new Error("Validation failed");
            }

            setIsProcessing(true);

            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount,
                currency: "EUR",
                donor_email: donorData?.email,
                donor_name: donorData?.name,
                donor_message: donorData?.message,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to create order");
            }

            const data = await response.json();
            setCurrentOrderId(data.order_id);
            return data.order_id;
          } catch (error) {
            setIsProcessing(false);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            onError?.(errorMessage);
            throw error;
          }
        }}
        onApprove={async (data) => {
          try {
            const response = await fetch("/api/paypal/capture-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: data.orderID }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to capture payment");
            }

            const captureData = await response.json();

            const donation: PayPalDonation = {
              id: `temp_${Date.now()}`,
              amount,
              currency: "EUR",
              paypal_order_id: data.orderID,
              paypal_payment_id: captureData.payment_id,
              donor_email: donorData?.email,
              donor_name: donorData?.name,
              donor_message: donorData?.message,
              status: "completed",
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              webhook_verified: false,
            };

            setIsProcessing(false);
            setCurrentOrderId(null);
            onSuccess?.(donation);
          } catch (error) {
            setIsProcessing(false);
            const errorMessage =
              error instanceof Error ? error.message : "Payment capture failed";
            onError?.(errorMessage);
          }
        }}
        onCancel={() => {
          setIsProcessing(false);

          // Aktualizuj status w Directus — używaj order_id, nie amount
          if (currentOrderId) {
            fetch("/api/paypal/cancel-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: currentOrderId }),
            }).catch((error) => {
              console.error("Failed to update cancelled status:", error);
            });
            setCurrentOrderId(null);
          }

          onCancel?.();
        }}
        onError={(error) => {
          setIsProcessing(false);
          console.error("PayPal error:", error);
          const errorMessage =
            typeof error === "string" ? error : "PayPal error occurred";
          onError?.(errorMessage);
        }}
      />
    </div>
  );
}

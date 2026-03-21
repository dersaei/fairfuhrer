// components/PayPalButtons.tsx
"use client";

import {
  PayPalOneTimePaymentButton,
  type OnApproveDataOneTimePayments,
  type OnErrorData,
} from "@paypal/react-paypal-js/sdk-v6";
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
  onSuccess?: (donation: PayPalDonation) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PayPalButtons({
  amount,
  donorData,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  return (
    <div className={styles.paypalButtonsContainer}>
      {(disabled || isProcessing) && (
        <div className={styles.processingOverlay}>
          <div className={styles.spinner}></div>
          <span>Zahlung wird verarbeitet...</span>
        </div>
      )}

      <PayPalOneTimePaymentButton
        disabled={disabled || isProcessing}
        type="donate"
        presentationMode="auto"
        createOrder={async () => {
          try {
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
            return { orderId: data.order_id };
          } catch (error) {
            setIsProcessing(false);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            onError?.(errorMessage);
            throw error;
          }
        }}
        onApprove={async ({ orderId }: OnApproveDataOneTimePayments) => {
          try {
            const response = await fetch("/api/paypal/capture-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order_id: orderId }),
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
              paypal_order_id: orderId,
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
        onError={(data: OnErrorData) => {
          setIsProcessing(false);
          console.error("PayPal error:", data);
          onError?.("PayPal error occurred");
        }}
      />
    </div>
  );
}

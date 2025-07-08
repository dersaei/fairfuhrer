// components/PayPalButtons.tsx - PRZYWRÓCONA WERSJA Z DONOR DATA
"use client";

import { PayPalButtons as PayPalButtonsSDK } from "@paypal/react-paypal-js";
import { useState } from "react";
import type { PayPalDonation } from "@/types";
import styles from "./PayPalButtons.module.css";

// ✅ PRZYWRÓCONO DonorData interface
interface DonorData {
  email?: string;
  name?: string;
  message?: string;
}

interface PayPalButtonsProps {
  amount: number; // WAŻNE: już w centach!
  donorData?: DonorData; // ✅ PRZYWRÓCONO
  onApprove?: () => boolean; // return false to cancel
  onSuccess?: (donation: PayPalDonation) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export function PayPalButtons({
  amount,
  donorData, // ✅ PRZYWRÓCONO
  onApprove,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
}: PayPalButtonsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

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
        // ✅ POPRAWKA: Użyj fundingSource (pojedyncza liczba) lub forceReRender
        forceReRender={[`paypal-card-${amount}`]} // Force re-render when amount changes
        createOrder={async () => {
          try {
            // Validate before proceeding
            if (onApprove && !onApprove()) {
              throw new Error("Validation failed");
            }

            setIsProcessing(true);

            // ✅ PRZYWRÓCONO: Wysyłaj donor data z formularza
            const response = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                amount, // Już w centach!
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

            // Debug log
            console.log("PayPal order created:", {
              amount_in_cents: amount,
              amount_in_eur: amount / 100,
              order_id: data.order_id,
            });

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
            // Call our API to capture payment
            const response = await fetch("/api/paypal/capture-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: data.orderID,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to capture payment");
            }

            const captureData = await response.json();

            // Success - create donation object for callback
            const donation: PayPalDonation = {
              id: `temp_${Date.now()}`, // Temporary ID
              amount, // W centach
              currency: "EUR",
              paypal_order_id: data.orderID,
              paypal_payment_id: captureData.payment_id,
              // ✅ PRZYWRÓCONO: Dane z naszego formularza
              donor_email: donorData?.email,
              donor_name: donorData?.name,
              donor_message: donorData?.message,
              status: "completed",
              created_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              webhook_verified: false,
            };

            setIsProcessing(false);
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
          console.log("PayPal payment cancelled by user");

          // ✅ POPRAWKA: Aktualizuj status w Directus na cancelled
          // Znajdź ostatnie zamówienie i zaktualizuj status
          fetch("/api/paypal/cancel-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              // Tutaj możemy wysłać amount żeby znaleźć pending order
              amount,
              timestamp: Date.now(),
            }),
          }).catch((error) => {
            console.error("Failed to update cancelled status:", error);
          });

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

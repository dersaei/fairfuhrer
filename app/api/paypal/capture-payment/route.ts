// app/api/paypal/capture-payment/route.ts
// ✅ Server-only protection
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypalServer";
import {
  getPayPalDonationByOrderId,
  updatePayPalDonationStatus,
} from "@/lib/directus";
import { isValidPayPalId } from "@/utils/paypalTypeGuards";
import type { PayPalCaptureRequest } from "@/types";

export async function POST(request: NextRequest) {
  // Parse once — NextRequest body stream can only be consumed once
  let orderId: string | undefined;

  try {
    const body: PayPalCaptureRequest = await request.json();
    orderId = body.order_id;

    // Walidacja
    if (!isValidPayPalId(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Sprawdź czy donacja istnieje w naszej bazie
    const donation = await getPayPalDonationByOrderId(orderId);
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Sprawdź czy już nie została przetworzona
    if (donation.status === "completed") {
      return NextResponse.json({
        payment_id: donation.paypal_payment_id,
        status: "completed",
        message: "Payment already processed",
      });
    }

    // Wykonaj capture w PayPal używając nowego SDK
    const capture = await capturePayPalOrder(orderId);

    // Pobierz dane z capture response
    const captureResult = capture.result;
    const purchaseUnits = captureResult.purchaseUnits;
    const purchaseUnit = purchaseUnits?.[0];
    const payments = purchaseUnit?.payments;
    const captures = payments?.captures;
    const captureDetails = captures?.[0];

    if (!captureDetails || !captureDetails.id) {
      throw new Error("No capture details found");
    }

    // Bezpieczne parsowanie kwot
    const captureId = captureDetails.id;
    const captureStatus = captureDetails.status;
    const captureAmount = captureDetails.amount;
    const sellerBreakdown = captureDetails.sellerReceivableBreakdown;
    const paypalFee = sellerBreakdown?.paypalFee;
    const netAmount = sellerBreakdown?.netAmount;

    // Przygotuj dane do aktualizacji
    const updateData = {
      paypal_payment_id: captureId,
      status:
        captureStatus === "COMPLETED"
          ? ("completed" as const)
          : ("processing" as const),
      completed_at:
        captureStatus === "COMPLETED" ? new Date().toISOString() : undefined,
      fees_amount: paypalFee?.value
        ? Math.round(parseFloat(paypalFee.value) * 100)
        : undefined,
      net_amount: netAmount?.value
        ? Math.round(parseFloat(netAmount.value) * 100)
        : undefined,
    };

    // Aktualizuj donację w Directus
    const updatedDonation = await updatePayPalDonationStatus(
      donation.id,
      updateData
    );

    if (!updatedDonation) {
      throw new Error("Failed to update donation status");
    }

    // Zwróć odpowiedź
    return NextResponse.json({
      payment_id: captureId,
      status: captureStatus,
      amount: captureAmount
        ? {
            value: captureAmount.value,
            currency_code: captureAmount.currencyCode,
          }
        : undefined,
      fees: paypalFee,
      net_amount: netAmount,
    });
  } catch (error) {
    console.error("PayPal capture payment error:", error);

    // Aktualizuj status na failed jeśli to możliwe (orderId już sparsowany)
    if (orderId) {
      try {
        const donation = await getPayPalDonationByOrderId(orderId);
        if (donation && donation.status !== "failed") {
          await updatePayPalDonationStatus(donation.id, {
            status: "failed",
            failed_at: new Date().toISOString(),
          });
        }
      } catch (updateError) {
        console.error(
          "Failed to update donation status to failed:",
          updateError
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to capture PayPal payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

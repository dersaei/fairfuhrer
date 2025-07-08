// app/api/paypal/capture-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPayPalClient, getOrdersCaptureRequest } from "@/lib/paypalServer";
import {
  getPayPalDonationByOrderId,
  updatePayPalDonationStatus,
} from "@/lib/directus";
import { isValidPayPalId } from "@/utils/paypalTypeGuards";
import type { PayPalCaptureRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: PayPalCaptureRequest = await request.json();

    // Walidacja
    if (!isValidPayPalId(body.order_id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Sprawdź czy donacja istnieje w naszej bazie
    const donation = await getPayPalDonationByOrderId(body.order_id);
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

    // Utwórz PayPal capture request
    const OrdersCaptureRequest = await getOrdersCaptureRequest();
    const captureRequest = new OrdersCaptureRequest(body.order_id);
    captureRequest.requestBody({});

    // Wykonaj capture w PayPal
    const paypalClient = await getPayPalClient();
    const capture = (await paypalClient.execute(captureRequest)) as unknown;

    // Type guard dla PayPal response
    if (!capture || typeof capture !== "object") {
      throw new Error("Invalid PayPal capture response");
    }

    const captureResponse = capture as {
      result: Record<string, unknown>;
      statusCode: number;
    };

    if (!captureResponse.result) {
      throw new Error("PayPal capture failed");
    }

    // Pobierz dane z capture response
    const captureResult = captureResponse.result;
    const purchaseUnits = captureResult.purchase_units as
      | Array<Record<string, unknown>>
      | undefined;
    const purchaseUnit = purchaseUnits?.[0];
    const payments = purchaseUnit?.payments as
      | Record<string, unknown>
      | undefined;
    const captures = payments?.captures as
      | Array<Record<string, unknown>>
      | undefined;
    const captureDetails = captures?.[0];

    if (!captureDetails || typeof captureDetails.id !== "string") {
      throw new Error("No capture details found");
    }

    // Bezpieczne parsowanie kwot
    const captureId = captureDetails.id as string;
    const captureStatus = captureDetails.status as string;
    const captureAmount = captureDetails.amount as
      | { currency_code: string; value: string }
      | undefined;
    const sellerBreakdown = captureDetails.seller_receivable_breakdown as
      | Record<string, unknown>
      | undefined;
    const paypalFee = sellerBreakdown?.paypal_fee as
      | { value: string }
      | undefined;
    const netAmount = sellerBreakdown?.net_amount as
      | { value: string }
      | undefined;

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
            currency_code: captureAmount.currency_code,
          }
        : undefined,
      fees: paypalFee,
      net_amount: netAmount,
    });
  } catch (error) {
    console.error("PayPal capture payment error:", error);

    // Aktualizuj status na failed jeśli to możliwe
    const requestBody = await request.json().catch(() => null);
    if (requestBody?.order_id) {
      try {
        const donation = await getPayPalDonationByOrderId(requestBody.order_id);
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

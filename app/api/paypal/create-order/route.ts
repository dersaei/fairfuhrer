// app/api/paypal/create-order/route.ts
// ✅ Server-only protection (API Routes are server-only by default, but explicit import for consistency)
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { paypalConfig } from "@/lib/paypal";
import { createPayPalOrder } from "@/lib/paypalServer";
import { createPayPalDonation } from "@/lib/directus";
import {
  isValidPayPalAmount, // Sprawdza centy
} from "@/utils/paypalTypeGuards";
import type { PayPalDonation } from "@/types";

// ✅ POPRAWKA: Obsługuj zarówno stare jak i nowe requesty (backward compatibility)
interface PayPalCreateOrderRequest {
  amount: number; // W centach!
  currency: string;
  // Opcjonalne pola dla backward compatibility
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
}

// ✅ POPRAWKA: Dodaj walidację currency i donor data
function validateCreateOrderRequest(body: PayPalCreateOrderRequest): {
  isValid: boolean;
  error?: string;
} {
  if (!isValidPayPalAmount(body.amount)) {
    return {
      isValid: false,
      error:
        "Invalid amount - must be between 100 and 1,000,000 cents (1-10,000 EUR)",
    };
  }

  if (body.currency && body.currency !== "EUR") {
    return {
      isValid: false,
      error: "Only EUR currency is supported",
    };
  }

  if (
    body.donor_email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.donor_email)
  ) {
    return {
      isValid: false,
      error: "Invalid email format",
    };
  }

  if (body.donor_message && body.donor_message.length > 500) {
    return {
      isValid: false,
      error: "Message too long (max 500 characters)",
    };
  }

  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: PayPalCreateOrderRequest = await request.json();

    // ✅ POPRAWKA: Użyj nowej funkcji walidacji
    const requestValidation = validateCreateOrderRequest(body);
    if (!requestValidation.isValid) {
      console.error("Validation failed:", requestValidation.error);
      return NextResponse.json(
        {
          error: requestValidation.error,
          received_amount: body.amount,
        },
        { status: 400 }
      );
    }

    // Log debug info
    console.log("Creating PayPal order:", {
      amount_cents: body.amount,
      amount_eur: body.amount / 100,
      currency: body.currency,
    });

    // ✅ POPRAWKA: Użyj amount bezpośrednio (już w centach)
    const amountInCents = body.amount;

    // Wykonaj request do PayPal używając nowego SDK
    const order = await createPayPalOrder(
      amountInCents,
      body.currency || paypalConfig.currency
    );

    // Pobierz dane z response
    const orderId = order.result.id;
    const orderStatus = order.result.status;
    const orderLinks = order.result.links;

    if (!orderId) {
      throw new Error("PayPal order ID is missing from response");
    }

    // Utwórz donację w Directus (z opcjonalnymi donor data jeśli są)
    const donationData: Omit<PayPalDonation, "id"> = {
      amount: amountInCents, // W centach
      currency: body.currency || paypalConfig.currency,
      paypal_order_id: orderId,
      // ✅ Opcjonalne donor data (będą undefined jeśli nie przesłane)
      donor_email: body.donor_email,
      donor_name: body.donor_name,
      donor_message: body.donor_message,
      status: "pending",
      created_at: new Date().toISOString(),
      webhook_verified: false,
    };

    const donation = await createPayPalDonation(donationData);

    if (!donation) {
      throw new Error("Failed to create donation record");
    }

    // Znajdź approval URL
    const approvalUrl =
      orderLinks?.find(
        (link: { rel: string; href: string }) => link.rel === "approve"
      )?.href || "";

    // Log success
    console.log("PayPal order created successfully:", {
      order_id: orderId,
      donation_id: donation.id,
      amount_cents: amountInCents,
      amount_eur: amountInCents / 100,
    });

    // Zwróć odpowiedź
    return NextResponse.json({
      order_id: orderId,
      status: orderStatus,
      approval_url: approvalUrl,
      donation_id: donation.id,
    });
  } catch (error) {
    console.error("PayPal create order error:", error);

    return NextResponse.json(
      {
        error: "Failed to create PayPal order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

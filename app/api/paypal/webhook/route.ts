// app/api/paypal/webhook/route.ts - Next.js 16.0.7 + React 19.2.1
// ✅ Server-only protection
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import {
  getPayPalDonationByOrderId,
  updatePayPalDonationStatus,
  logWebhookEvent,
} from "@/lib/directus";
import { isValidPayPalWebhookEvent } from "@/utils/paypalTypeGuards";
import type {
  PayPalWebhookEvent,
  WebhookProcessingResult,
  WebhookAction,
  WebhookLog,
} from "@/types";

// PayPal Webhook Signature Verification via REST API
// https://developer.paypal.com/api/rest/webhooks/rest/#link-verifywebhooksignature
async function verifyPayPalWebhookSignature(
  rawBody: string,
  headers: Record<string, string>
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured — cannot verify webhook");
    return false;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("PayPal credentials not configured");
    return false;
  }

  const mode = process.env.PAYPAL_MODE === "production" ? "live" : "sandbox";
  const baseUrl =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  try {
    // Pobierz access token
    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      console.error("Failed to get PayPal access token for webhook verification");
      return false;
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token as string;

    // Zweryfikuj sygnaturę
    const verifyResponse = await fetch(
      `${baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          client_id: clientId,
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody),
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
        }),
      }
    );

    if (!verifyResponse.ok) {
      console.error("PayPal webhook verification API returned error:", verifyResponse.status);
      return false;
    }

    const verifyData = await verifyResponse.json();
    return verifyData.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const receivedAt = new Date().toISOString();
  let webhookEvent: PayPalWebhookEvent | null = null;

  try {
    // Odczytaj raw body raz (potrzebne zarówno do weryfikacji jak i parsowania)
    const rawBody = await request.text();

    // Zbierz headers PayPal potrzebne do weryfikacji
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // ✅ SECURITY: Zweryfikuj podpis webhooka przed przetworzeniem
    const isVerified = await verifyPayPalWebhookSignature(rawBody, headers);
    if (!isVerified) {
      console.error("PayPal webhook signature verification failed — rejecting request");
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const body = JSON.parse(rawBody);

    // Walidacja webhook event
    if (!isValidPayPalWebhookEvent(body)) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    webhookEvent = body;

    // Przygotuj log entry
    const webhookLogData: Omit<WebhookLog, "id"> = {
      webhook_id: webhookEvent.id,
      event_type: webhookEvent.event_type,
      resource_id: webhookEvent.resource.id,
      verification_status: "SUCCESS",
      processing_result: {} as WebhookProcessingResult, // Wypełni się później
      raw_payload: rawBody,
      headers,
      received_at: receivedAt,
      processed_at: undefined, // Wypełni się później
    };

    // Przetwórz webhook event
    const processingResult = await processWebhookEvent(webhookEvent);

    // Zaktualizuj log z rezultatem
    webhookLogData.processing_result = processingResult;
    webhookLogData.processed_at = new Date().toISOString();

    // Zapisz log do Directus
    await logWebhookEvent(webhookLogData);

    // Zwróć odpowiedź
    return NextResponse.json({
      received: true,
      event_id: webhookEvent.id,
      action_taken: processingResult.action_taken,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Log błędu
    if (webhookEvent) {
      try {
        const errorLogData: Omit<WebhookLog, "id"> = {
          webhook_id: webhookEvent.id,
          event_type: webhookEvent.event_type,
          resource_id: webhookEvent.resource.id,
          verification_status: "SUCCESS",
          processing_result: {
            success: false,
            action_taken: "error_processing",
            error_message:
              error instanceof Error ? error.message : "Unknown error",
            processed_at: new Date().toISOString(),
          },
          raw_payload: JSON.stringify(webhookEvent),
          headers: {},
          received_at: receivedAt,
          processed_at: new Date().toISOString(),
        };

        await logWebhookEvent(errorLogData);
      } catch (logError) {
        console.error("Failed to log webhook error:", logError);
      }
    }

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper function do przetwarzania webhook events
async function processWebhookEvent(
  event: PayPalWebhookEvent
): Promise<WebhookProcessingResult> {
  const resourceId = event.resource.id;
  let action: WebhookAction = "no_action_needed";
  let donationId: string | undefined;

  try {
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        // Płatność zakończona - aktualizuj status donacji
        const donation = await getPayPalDonationByOrderId(resourceId);
        if (donation) {
          await updatePayPalDonationStatus(donation.id, {
            status: "completed",
            completed_at: new Date().toISOString(),
            webhook_verified: true,
          });
          action = "donation_completed";
          donationId = donation.id;
        }
        break;
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REVERSED": {
        // Płatność odrzucona/cofnięta
        const donation = await getPayPalDonationByOrderId(resourceId);
        if (donation) {
          await updatePayPalDonationStatus(donation.id, {
            status: "failed",
            failed_at: new Date().toISOString(),
            webhook_verified: true,
          });
          action = "donation_failed";
          donationId = donation.id;
        }
        break;
      }

      case "PAYMENT.CAPTURE.REFUNDED": {
        // Płatność zwrócona
        const donation = await getPayPalDonationByOrderId(resourceId);
        if (donation) {
          const refundAmount = event.resource.amount?.value
            ? Math.round(parseFloat(event.resource.amount.value) * 100)
            : undefined;

          await updatePayPalDonationStatus(donation.id, {
            status: "refunded",
            refunded_amount: refundAmount,
            webhook_verified: true,
          });
          action = "donation_refunded";
          donationId = donation.id;
        }
        break;
      }

      case "CHECKOUT.ORDER.CANCELLED": {
        // Zamówienie anulowane
        const donation = await getPayPalDonationByOrderId(resourceId);
        if (donation) {
          await updatePayPalDonationStatus(donation.id, {
            status: "cancelled",
            failed_at: new Date().toISOString(),
            webhook_verified: true,
          });
          action = "donation_cancelled";
          donationId = donation.id;
        }
        break;
      }

      default: {
        // Nieobsługiwany typ eventu - tylko logujemy
        action = "no_action_needed";
        break;
      }
    }

    return {
      success: true,
      donation_id: donationId,
      action_taken: action,
      processed_at: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      action_taken: "error_processing",
      error_message: error instanceof Error ? error.message : "Unknown error",
      processed_at: new Date().toISOString(),
    };
  }
}

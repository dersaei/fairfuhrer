// app/api/paypal/webhook/route.ts - Bez importu PayPal SDK
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

export async function POST(request: NextRequest) {
  const receivedAt = new Date().toISOString();
  let webhookEvent: PayPalWebhookEvent | null = null;

  try {
    // Parse webhook payload
    const body = await request.json();

    // Walidacja webhook event
    if (!isValidPayPalWebhookEvent(body)) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    webhookEvent = body;

    // Pobierz headers dla logowania
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Przygotuj log entry
    const webhookLogData: Omit<WebhookLog, "id"> = {
      webhook_id: webhookEvent.id,
      event_type: webhookEvent.event_type,
      resource_id: webhookEvent.resource.id,
      verification_status: "NOT_VERIFIED",
      processing_result: {} as WebhookProcessingResult, // Wypełni się później
      raw_payload: JSON.stringify(body),
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
          verification_status: "NOT_VERIFIED",
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

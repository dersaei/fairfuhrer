import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { paypalConfig } from "@/lib/paypal";

const PAYPAL_BASE =
  paypalConfig.mode === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function verifyWebhookSignature(
  rawBody: string,
  headers: Record<string, string>
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_SUBSCRIPTION_WEBHOOK_ID;
  if (!webhookId) {
    console.error("PAYPAL_SUBSCRIPTION_WEBHOOK_ID not configured");
    return false;
  }

  const credentials = Buffer.from(
    `${paypalConfig.client_id}:${paypalConfig.client_secret}`
  ).toString("base64");

  try {
    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    if (!tokenRes.ok) return false;
    const { access_token } = await tokenRes.json();

    const verifyRes = await fetch(
      `${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: headers["paypal-auth-algo"],
          cert_url: headers["paypal-cert-url"],
          client_id: paypalConfig.client_id,
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody),
          transmission_id: headers["paypal-transmission-id"],
          transmission_sig: headers["paypal-transmission-sig"],
          transmission_time: headers["paypal-transmission-time"],
        }),
      }
    );
    if (!verifyRes.ok) return false;
    const { verification_status } = await verifyRes.json();
    return verification_status === "SUCCESS";
  } catch (err) {
    console.error("Subscription webhook verification error:", err);
    return false;
  }
}

async function updatePremiumUntil(subscriberEmail: string, months = 13) {
  const premiumUntil = new Date();
  premiumUntil.setMonth(premiumUntil.getMonth() + months);

  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const authUserId = users?.users.find((u) => u.email === subscriberEmail)?.id;

  if (!authUserId) {
    console.error(`subscription-webhook: user not found for email ${subscriberEmail}`);
    return false;
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ premium_until: premiumUntil.toISOString() })
    .eq("id", authUserId);

  if (error) {
    console.error("subscription-webhook: failed to update premium_until:", error);
    return false;
  }

  return true;
}

async function revokePremium(subscriberEmail: string) {
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const authUserId = users?.users.find((u) => u.email === subscriberEmail)?.id;

  if (!authUserId) return false;

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ premium_until: null })
    .eq("id", authUserId);

  return !error;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const isVerified = await verifyWebhookSignature(rawBody, headers);
  if (!isVerified) {
    console.error("subscription-webhook: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event_type: string; resource: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const subscriberEmail =
    (event.resource?.subscriber as { email_address?: string } | undefined)?.email_address ?? "";

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
    case "BILLING.SUBSCRIPTION.RENEWED":
    case "PAYMENT.SALE.COMPLETED": {
      if (subscriberEmail) {
        await updatePremiumUntil(subscriberEmail);
      }
      break;
    }
    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED":
    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      if (subscriberEmail) {
        await revokePremium(subscriberEmail);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

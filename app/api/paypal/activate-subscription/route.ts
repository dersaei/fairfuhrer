import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { paypalConfig } from "@/lib/paypal";

const PAYPAL_BASE =
  paypalConfig.mode === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${paypalConfig.client_id}:${paypalConfig.client_secret}`
  ).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Failed to get PayPal access token");
  const data = await res.json();
  return data.access_token as string;
}

// GET /api/paypal/activate-subscription?subscription_id=I-xxx
export async function GET(request: NextRequest) {
  try {
    const subscriptionId = request.nextUrl.searchParams.get("subscription_id");
    if (!subscriptionId) {
      return NextResponse.json({ error: "subscription_id required" }, { status: 400 });
    }

    // Sprawdź tożsamość zalogowanego użytkownika
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pobierz status subskrypcji z PayPal
    const accessToken = await getAccessToken();
    const subRes = await fetch(
      `${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!subRes.ok) {
      console.error("activate-subscription: PayPal fetch failed", await subRes.text());
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 502 });
    }

    const subscription = await subRes.json();
    const status: string = subscription.status;

    // Akceptujemy ACTIVE lub APPROVED (sandbox może zwrócić APPROVED przed pierwszą płatnością)
    if (status !== "ACTIVE" && status !== "APPROVED") {
      return NextResponse.json(
        { error: "Subscription not active", status },
        { status: 402 }
      );
    }

    // WŁAŚCICIELSTWO: sam fakt, że subskrypcja jest aktywna, nie znaczy, że
    // należy do TEGO usera. Bez tej weryfikacji zalogowany user A, który zdobędzie
    // cudze subscription_id, aktywowałby sobie premium na cudzej płatności.
    // 1) e-mail subskrybenta z PayPala musi zgadzać się z e-mailem sesji.
    const subscriberEmail: string | undefined =
      subscription.subscriber?.email_address;
    const emailMatches =
      !!subscriberEmail &&
      !!user.email &&
      subscriberEmail.toLowerCase() === user.email.toLowerCase();

    // 2) subscription_id nie może być już przypisane do innego partnera.
    const { data: existingOwner } = await supabaseAdmin
      .from("partner_profiles")
      .select("id")
      .eq("paypal_subscription_id", subscriptionId)
      .maybeSingle();
    const claimedByOther = !!existingOwner && existingOwner.id !== user.id;

    if (!emailMatches || claimedByOther) {
      console.error(
        "activate-subscription: ownership check failed",
        { userId: user.id, emailMatches, claimedByOther }
      );
      return NextResponse.json(
        { error: "Subscription does not belong to this account" },
        { status: 403 }
      );
    }

    // Zapisz subscription_id w partner_profiles i ustaw premium_until
    const premiumUntil = new Date();
    premiumUntil.setMonth(premiumUntil.getMonth() + 13);

    const [profileUpdate, partnerUpdate] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .update({ premium_until: premiumUntil.toISOString() })
        .eq("id", user.id),
      supabaseAdmin
        .from("partner_profiles")
        .update({
          premium_until: premiumUntil.toISOString(),
          paypal_subscription_id: subscriptionId,
        })
        .eq("id", user.id),
    ]);

    if (profileUpdate.error) {
      console.error("activate-subscription: profile update error", profileUpdate.error);
      return NextResponse.json({ error: "Failed to activate premium" }, { status: 500 });
    }
    if (partnerUpdate.error) {
      console.error("activate-subscription: partner update error", partnerUpdate.error);
    }

    return NextResponse.json({
      success: true,
      premium_until: premiumUntil.toISOString(),
      subscription_status: status,
    });
  } catch (err) {
    console.error("activate-subscription error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

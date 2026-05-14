import "server-only";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { paypalConfig } from "@/lib/paypal";

const PAYPAL_BASE =
  paypalConfig.mode === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

// Plany netto — dla eu_reverse_charge i third_country (bez DE VAT)
const PLAN_IDS_NETTO: Record<string, string> = {
  nonprofit: process.env.PAYPAL_PLAN_ID_NONPROFIT ?? "",
  micro: process.env.PAYPAL_PLAN_ID_MICRO ?? "",
  small: process.env.PAYPAL_PLAN_ID_SMALL ?? "",
  medium: process.env.PAYPAL_PLAN_ID_MEDIUM ?? "",
};

// Plany brutto — dla de i eu_no_vat (cena zawiera 19% MwSt.)
const PLAN_IDS_BRUTTO: Record<string, string> = {
  nonprofit: process.env.PAYPAL_PLAN_ID_NONPROFIT_BRUTTO ?? "",
  micro: process.env.PAYPAL_PLAN_ID_MICRO_BRUTTO ?? "",
  small: process.env.PAYPAL_PLAN_ID_SMALL_BRUTTO ?? "",
  medium: process.env.PAYPAL_PLAN_ID_MEDIUM_BRUTTO ?? "",
};

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

export async function POST() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [{ data: profile }, { data: partnerProfile }] = await Promise.all([
      supabase.from("profiles").select("role, company_size").eq("id", user.id).single(),
      supabase.from("partner_profiles").select("tax_bucket").eq("id", user.id).single(),
    ]);

    if (!profile || profile.role !== "partner") {
      return NextResponse.json({ error: "Partner account required" }, { status: 403 });
    }

    const companySize = profile.company_size as string | null;
    if (!companySize) {
      return NextResponse.json(
        { error: "company_size not set or plan not configured" },
        { status: 400 }
      );
    }

    const taxBucket = partnerProfile?.tax_bucket ?? "de";
    const useBrutto = taxBucket === "de" || taxBucket === "eu_no_vat";
    const planMap = useBrutto ? PLAN_IDS_BRUTTO : PLAN_IDS_NETTO;
    const planId = planMap[companySize];

    if (!planId) {
      return NextResponse.json(
        { error: "company_size not set or plan not configured" },
        { status: 400 }
      );
    }
    const accessToken = await getAccessToken();

    const res = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "PayPal-Request-Id": `${user.id}-${Date.now()}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          email_address: user.email,
        },
        application_context: {
          brand_name: "Fairführer",
          locale: "de-DE",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${process.env.SITE_URL}/konto/partner/premium?success=true`,
          cancel_url: `${process.env.SITE_URL}/konto/partner/premium?cancelled=true`,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("PayPal create subscription error:", err);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 }
      );
    }

    const subscription = await res.json();
    const approveLink = subscription.links?.find(
      (l: { rel: string; href: string }) => l.rel === "approve"
    )?.href;

    return NextResponse.json({
      subscription_id: subscription.id,
      approve_url: approveLink,
    });
  } catch (error) {
    console.error("create-subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// app/api/paypal/cancel-order/route.ts - Next.js 16.0.7 + React 19.2.1
// ✅ Server-only protection
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { updatePayPalDonationStatus } from "@/lib/directus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, timestamp } = body;

    console.log("Searching for cancelled order:", { amount, timestamp });

    // ✅ Znajdź najnowsze pending zamówienie z tym amount z ostatnich 10 minut
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const response = await fetch(
      `${process.env.DIRECTUS_URL}/items/paypal_donations?` +
        `filter[status][_eq]=pending&` +
        `filter[amount][_eq]=${amount}&` +
        `filter[created_at][_gte]=${tenMinutesAgo}&` +
        `sort=-created_at&limit=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pending donations");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      const donation = data.data[0];

      // Aktualizuj status na cancelled
      await updatePayPalDonationStatus(donation.id, {
        status: "cancelled",
        failed_at: new Date().toISOString(),
      });

      console.log("Updated donation status to cancelled:", donation.id);

      return NextResponse.json({
        success: true,
        donation_id: donation.id,
        message: "Status updated to cancelled",
      });
    } else {
      console.log("No pending donation found to cancel");
      return NextResponse.json({
        success: false,
        message: "No pending donation found",
      });
    }
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

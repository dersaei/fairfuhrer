// app/api/paypal/cancel-order/route.ts
// ✅ Server-only protection
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import {
  getPayPalDonationByOrderId,
  updatePayPalDonationStatus,
} from "@/lib/directus";
import { isValidPayPalId } from "@/utils/paypalTypeGuards";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;

    // Walidacja — wymagamy konkretnego order_id zamiast wyszukiwania po kwocie
    if (!isValidPayPalId(order_id)) {
      return NextResponse.json(
        { error: "Invalid or missing order_id" },
        { status: 400 }
      );
    }

    // Znajdź donację po order_id (nie po kwocie)
    const donation = await getPayPalDonationByOrderId(order_id);

    if (!donation) {
      // Zwracamy 200 zamiast 404 — nie ujawniamy czy order_id istnieje
      return NextResponse.json({
        success: false,
        message: "No pending donation found",
      });
    }

    // Anuluj tylko jeśli nadal w statusie pending/processing
    if (donation.status !== "pending" && donation.status !== "processing") {
      return NextResponse.json({
        success: false,
        message: "Donation is not in a cancellable state",
      });
    }

    await updatePayPalDonationStatus(donation.id, {
      status: "cancelled",
      failed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      donation_id: donation.id,
      message: "Status updated to cancelled",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}

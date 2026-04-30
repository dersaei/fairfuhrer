import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const vatId = (body.vat_id as string)?.trim();

    if (!vatId) {
      return NextResponse.json({ error: "vat_id is required" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "partner") {
      return NextResponse.json({ error: "Partner account required" }, { status: 403 });
    }

    const { error } = await supabase
      .from("partner_profiles")
      .update({ vat_eu: vatId })
      .eq("id", user.id);

    if (error) {
      console.error("set-vat-id error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("set-vat-id error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

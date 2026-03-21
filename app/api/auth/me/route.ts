import "server-only";

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    let partnerProfile = null;
    if (profile?.role === "partner") {
      const { data } = await supabase
        .from("partner_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      partnerProfile = data;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        profile: profile ?? null,
        partnerProfile,
      },
    });
  } catch (error) {
    console.error("Auth ME error:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

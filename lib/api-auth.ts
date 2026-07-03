import "server-only";

import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";

// ─────────────────────────────────────────────────────────────────────────────
// Wspolny helper autoryzacji dla API route handlers.
//
// Obsluguje DWA modele auth zeby ten sam endpoint dzialal dla web i mobile:
//   1. Bearer token w headerze `Authorization: Bearer <token>` — mobile
//      (Supabase session access_token wyciagniety z SDK w apce).
//   2. Cookies (fallback) — web app SSR z @supabase/ssr.
//
// Dla web nic sie nie zmienia (nadal cookies), dla mobile dodajemy Bearer.
// Zeby zweryfikowac Bearer JWT uzywamy `supabaseAdmin.auth.getUser(token)`
// — service role klient wie jak walidowac dowolny JWT.
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  // 1. Sprobuj Bearer token z headera (mobile)
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);
      if (!error && user) return user;
    } catch {
      // Ignoruj — spadamy do cookies fallback
    }
  }

  // 2. Fallback: cookies (web SSR)
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

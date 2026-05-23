import "server-only";

import { NextRequest, NextResponse } from "next/server";

/**
 * Brücke vom Web zur mobilen App.
 *
 * Supabase verschickt Reset-Mails mit Links auf https://...
 * weil Mail-Clients keine fairfuhrer://-Links erlauben. Dieser Endpoint nimmt
 * das ?token_hash=... entgegen und leitet es UNGENUTZT an den Deep Link der
 * App weiter. Erst die App verbraucht den Einmal-Token via supabase.auth
 * .verifyOtp(). Hier wird der Token NICHT verifiziert – sonst wäre er nach
 * dem Redirect bereits verbrannt.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "recovery";

  if (!token_hash) {
    return NextResponse.redirect(
      `${(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")}/login?error=auth_callback_failed`
    );
  }

  const deepLink = `fairfuhrer://auth/callback?token_hash=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}`;
  return NextResponse.redirect(deepLink);
}

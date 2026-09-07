import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  // Wylogowanie kasuje ciasteczka sesji — odświeżanie jej tuż przedtem mogłoby
  // je przywrócić w nagłówkach odpowiedzi.
  if (request.nextUrl.pathname === "/api/auth/logout") {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Odświeżenie sesji — nie usuwać tego wywołania
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  const { pathname } = request.nextUrl;

  // Chronione trasy: redirect do /login jeśli niezalogowany
  if (pathname.startsWith("/konto") && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Strony auth: redirect do /konto jeśli już zalogowany.
  //
  // `getClaims()` weryfikuje podpis tokenu lokalnie i nie wie, że konto zostało
  // usunięte albo zablokowane — token pozostaje poprawny aż do wygaśnięcia.
  // Bez potwierdzenia u źródła powstaje pętla: proxy odsyła z /login na /konto,
  // a chroniony layout pyta Supabase przez getUser(), dostaje null i odsyła
  // z powrotem. Przy nawigacji klienckiej objawia się to pustą treścią zamiast
  // czytelnego błędu.
  //
  // getUser() to dodatkowe żądanie do Supabase, ale wykonywane wyłącznie przy
  // wejściu na /login lub /register z istniejącym ciasteczkiem sesji — nie na
  // każdym żądaniu objętym matcherem.
  const authPaths = ["/login", "/register"];
  if (authPaths.some((p) => pathname.startsWith(p)) && user) {
    const {
      data: { user: verifiedUser },
    } = await supabase.auth.getUser();

    if (verifiedUser) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/konto";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-icon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

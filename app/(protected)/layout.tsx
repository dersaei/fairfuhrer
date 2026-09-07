import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Przez endpoint, nie wprost na /login. Ciasteczko sesji może być wciąż
    // kryptograficznie ważne (usunięte lub zablokowane konto), a proxy.ts
    // sprawdza je przez getClaims() bez pytania Supabase — odesłałby stąd
    // z powrotem na /konto i powstałaby pętla przekierowań.
    redirect("/api/auth/logout?next=/login");
  }

  return <>{children}</>;
}

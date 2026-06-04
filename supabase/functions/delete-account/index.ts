import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase wstrzykuje te JSON-y automatycznie (nowy system kluczy).
// Bierzemy pierwszy klucz każdego typu — odporne na nazwę wpisu w JSON-ie.
const PUBLISHABLE_KEYS = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')!);
const SECRET_KEYS = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')!);
const PUBLISHABLE_KEY = Object.values(PUBLISHABLE_KEYS)[0] as string;
const SECRET_KEY = Object.values(SECRET_KEYS)[0] as string;

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  // Klient z tokenem użytkownika — do zidentyfikowania kto wywołuje
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    PUBLISHABLE_KEY,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) return new Response('Unauthorized', { status: 401 });

  // Klient admin — omija RLS, do usunięcia konta i profilu
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Usuń profil ręcznie (zabezpieczenie gdyby nie było ON DELETE CASCADE)
  await supabaseAdmin.from('profiles').delete().eq('id', user.id);

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) return new Response(error.message, { status: 500 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

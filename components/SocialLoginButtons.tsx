"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./SocialLoginButtons.module.css";

type Provider = "google" | "apple";

/**
 * OAuth-Buttons (Web) für Google und Apple. Beide starten den PKCE-Flow:
 * Browser -> Provider-Consent -> /callback (exchangeCodeForSession).
 * Registrierung und Anmeldung sind bei OAuth derselbe Vorgang.
 *
 * Apple steht zuerst (App Store Review Guidelines schreiben vor, dass Sign in
 * with Apple mindestens gleichwertig zu anderen Social Logins angezeigt wird –
 * konsistenter UX auch im Web).
 */
export default function SocialLoginButtons({
  redirectTo = "/konto",
}: {
  /** Pfad, zu dem nach erfolgreicher Anmeldung weitergeleitet wird. */
  redirectTo?: string;
}) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: Provider) {
    setLoadingProvider(provider);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // /callback liegt in der Route-Gruppe (auth), die nicht Teil der URL ist.
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    // Bei Erfolg leitet signInWithOAuth den Browser selbst weiter,
    // der Code unterhalb wird dann nicht mehr erreicht.
    if (error) {
      const label = provider === "apple" ? "Apple" : "Google";
      setError(`Anmeldung mit ${label} fehlgeschlagen. Bitte erneut versuchen.`);
      setLoadingProvider(null);
    }
  }

  const isLoading = loadingProvider !== null;

  return (
    <div className={styles.wrapper}>
      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        className={styles.appleButton}
        onClick={() => handleOAuth("apple")}
        disabled={isLoading}
      >
        <AppleIcon />
        {loadingProvider === "apple" ? "Weiterleitung…" : "Mit Apple fortfahren"}
      </button>

      <button
        type="button"
        className={styles.googleButton}
        onClick={() => handleOAuth("google")}
        disabled={isLoading}
      >
        <GoogleIcon />
        {loadingProvider === "google" ? "Weiterleitung…" : "Mit Google fortfahren"}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.04 13.84c-.23.53-.5 1.03-.81 1.48-.43.62-.78 1.05-1.05 1.29-.41.38-.86.58-1.34.59-.34 0-.76-.1-1.24-.29-.49-.2-.94-.29-1.35-.29-.43 0-.89.1-1.39.29-.5.2-.9.3-1.21.31-.46.02-.92-.18-1.37-.6-.29-.26-.66-.7-1.1-1.34-.48-.68-.87-1.46-1.18-2.36-.33-.97-.5-1.91-.5-2.82 0-1.04.22-1.94.67-2.69.36-.6.83-1.08 1.43-1.43.59-.35 1.23-.53 1.92-.54.36 0 .84.11 1.43.33.59.22.97.34 1.14.34.13 0 .55-.13 1.27-.4.68-.25 1.25-.35 1.71-.31 1.25.1 2.2.6 2.82 1.5-1.12.68-1.67 1.63-1.66 2.85.01.95.36 1.74 1.04 2.37.31.29.65.52 1.03.68-.08.24-.17.47-.26.69ZM11.62 1.27c0 .77-.28 1.5-.85 2.16-.68.79-1.51 1.25-2.41 1.18-.01-.09-.02-.19-.02-.29 0-.74.32-1.54.9-2.18.29-.32.65-.59 1.1-.81.44-.21.86-.33 1.26-.35.01.1.02.2.02.3Z"
      />
    </svg>
  );
}

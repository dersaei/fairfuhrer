"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithEmail, loginWithMagicLink } from "@/app/actions/auth";
import type { FormErrors } from "@/types/auth";
import TurnstileWidget from "@/components/TurnstileWidget";
// Social loginy (Apple/Google) sind in 1.0.3 vorübergehend deaktiviert —
// Konsistenz mit Mobile (siehe project_social_loginy_zawieszone). Komponente
// und Supabase-Provider bleiben, damit eine Wiederaktivierung leicht ist.
// import SocialLoginButtons from "@/components/SocialLoginButtons";
import styles from "./login.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/konto";
  const callbackError = searchParams.get("error");

  const [tab, setTab] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>(
    callbackError === "auth_callback_failed"
      ? { general: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut." }
      : {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!turnstileToken) {
      setErrors({ general: "Bitte bestätigen Sie, dass Sie kein Roboter sind" });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("turnstileToken", turnstileToken);

    const result = await loginWithEmail(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ general: result.error });
      return;
    }

    router.push(redirectTo);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!turnstileToken) {
      setErrors({ general: "Bitte bestätigen Sie, dass Sie kein Roboter sind" });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("turnstileToken", turnstileToken);

    const result = await loginWithMagicLink(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ general: result.error });
      return;
    }

    setMagicSent(true);
  }


  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Anmelden</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "password" ? styles.tabActive : ""}`}
          onClick={() => setTab("password")}
          type="button"
        >
          Passwort
        </button>
        <button
          className={`${styles.tab} ${tab === "magic" ? styles.tabActive : ""}`}
          onClick={() => setTab("magic")}
          type="button"
        >
          Magic Link
        </button>
      </div>

      {errors.general && (
        <p className={styles.errorMessage}>{errors.general}</p>
      )}

      {tab === "password" && (
        <form onSubmit={handlePasswordLogin} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Passwort
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className={styles.forgotRow}>
            <Link href="/passwort-vergessen" className={styles.link}>
              Passwort vergessen?
            </Link>
          </div>
          <TurnstileWidget
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
          />
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !turnstileToken}
          >
            {isSubmitting ? "Wird angemeldet…" : "Anmelden"}
          </button>
        </form>
      )}

      {tab === "magic" && (
        <>
          {magicSent ? (
            <p className={styles.successMessage}>
              Wir haben Ihnen einen Magic Link an <strong>{email}</strong>{" "}
              gesendet.
              <br />
              <br /> Bitte prüfen Sie Ihr Postfach.
            </p>
          ) : (
            <form onSubmit={handleMagicLink} className={styles.form} noValidate>
              <p className={styles.magicDescription}>
                Kein Passwort nötig. Geben Sie Ihre E-Mail-Adresse ein und wir
                senden Ihnen einen einmaligen Link — ein Klick darauf und Sie
                sind sofort eingeloggt.
              </p>
              <div className={styles.field}>
                <label htmlFor="email-magic" className={styles.label}>
                  E-Mail
                </label>
                <input
                  id="email-magic"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <TurnstileWidget
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={handleTurnstileVerify}
                onExpire={handleTurnstileExpire}
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting || !turnstileToken}
              >
                {isSubmitting ? "Wird gesendet…" : "Magic Link senden"}
              </button>
            </form>
          )}
        </>
      )}

      <p className={styles.registerLink}>
        Noch kein Konto?{" "}
        <Link href="/register" className={styles.link}>
          Jetzt registrieren
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

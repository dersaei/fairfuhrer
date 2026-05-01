"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { registerConsumer } from "@/app/actions/auth";
import type { FormErrors } from "@/types/auth";
import TurnstileWidget from "@/components/TurnstileWidget";
import styles from "./consumer.module.css";

function validatePassword(password: string): string | null {
  if (password.length < 8)
    return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  if (!/[A-Z]/.test(password))
    return "Das Passwort muss mindestens einen Großbuchstaben enthalten.";
  if (!/[a-z]/.test(password))
    return "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.";
  if (!/[0-9]/.test(password))
    return "Das Passwort muss mindestens eine Ziffer enthalten.";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Das Passwort muss mindestens ein Sonderzeichen enthalten.";
  return null;
}

export default function RegisterConsumerPage() {
  const [fields, setFields] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    if (!fields.username) newErrors.username = "Pflichtfeld";
    if (!fields.email) newErrors.email = "Pflichtfeld";
    if (!fields.password) {
      newErrors.password = "Pflichtfeld";
    } else {
      const pwError = validatePassword(fields.password);
      if (pwError) newErrors.password = pwError;
    }
    if (fields.password !== fields.confirmPassword)
      newErrors.confirmPassword = "Passwörter stimmen nicht überein.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!turnstileToken) {
      setErrors({
        general: "Bitte bestätigen Sie, dass Sie kein Roboter sind",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.set(k, v));
    formData.set("turnstileToken", turnstileToken);

    const result = await registerConsumer(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ general: result.error });
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successBox}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#27ae60"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.7A16 16 0 0 0 16 16.73l1.41-1.41a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 24 16.92z" />
          </svg>
          <h2 className={styles.successTitle}>Fast geschafft!</h2>
          <p className={styles.successText}>
            Wir haben eine Bestätigungs-E-Mail an{" "}
            <strong>{fields.email}</strong> gesendet.
          </p>
          <p className={styles.successText}>
            Bitte klicken Sie auf den Link in der E-Mail, um Ihr Konto zu
            aktivieren. Danach können Sie sich anmelden.
          </p>
          <p className={styles.successHint}>
            Keine E-Mail erhalten? Bitte prüfen Sie Ihren Spam-Ordner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Link href="/register" className={styles.back}>
        ← Zurück
      </Link>
      <h1 className={styles.title}>Werde Teil der Fairführer-Community</h1>

      {errors.general && (
        <p className={styles.errorMessage}>{errors.general}</p>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="username" className={styles.label}>
            Benutzername *
          </label>
          <input
            id="username"
            type="text"
            className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
            value={fields.username}
            onChange={set("username")}
            autoComplete="username"
          />
          <span className={styles.hint}>
            Ihr öffentlich sichtbarer Name in der Community.
          </span>
          {errors.username && (
            <span className={styles.fieldError}>{errors.username}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            E-Mail *
          </label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={fields.email}
            onChange={set("email")}
            autoComplete="email"
          />
          {errors.email && (
            <span className={styles.fieldError}>{errors.email}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Passwort *
          </label>
          <input
            id="password"
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            value={fields.password}
            onChange={set("password")}
            autoComplete="new-password"
          />
          <span className={styles.hint}>
            Mind. 8 Zeichen, ein Großbuchstabe, ein Kleinbuchstabe, eine Ziffer
            und ein Sonderzeichen.
          </span>
          {errors.password && (
            <span className={styles.fieldError}>{errors.password}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Passwort bestätigen *
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
            value={fields.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <span className={styles.fieldError}>{errors.confirmPassword}</span>
          )}
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
          {isSubmitting ? "Wird registriert…" : "Konto erstellen"}
        </button>
      </form>

      <p className={styles.loginLink}>
        Bereits registriert?{" "}
        <Link href="/login" className={styles.link}>
          Anmelden
        </Link>
      </p>
    </div>
  );
}

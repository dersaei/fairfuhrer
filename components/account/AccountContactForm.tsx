"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { AccountContactFormContent } from "@/types";
import styles from "./AccountContactForm.module.css";

// Fallback-Texte, falls Directus nichts liefert
const DEFAULTS = {
  title: "Kontakt aufnehmen",
  lead_text:
    "Du hast eine Frage oder ein Anliegen? Schreib uns direkt — wir antworten in der Regel innerhalb von 1–2 Werktagen.",
  label_absender: "Absender",
  label_betreff: "Betreff",
  label_nachricht: "Nachricht",
  button_text: "Nachricht senden",
  button_sending_text: "Wird gesendet…",
  success_message:
    "Vielen Dank für Ihre Nachricht! Wir melden uns so schnell wie möglich bei Ihnen",
  error_message: "Ein Fehler ist aufgetreten.",
  validation_message: "Bitte füllen Sie alle Felder aus.",
} as const;

export default function AccountContactForm({
  noBorderTop,
  content,
}: {
  noBorderTop?: boolean;
  content?: AccountContactFormContent | null;
} = {}) {
  const { user } = useAuth();

  const t = {
    title: content?.title || DEFAULTS.title,
    lead_text: content?.lead_text || DEFAULTS.lead_text,
    label_absender: content?.label_absender || DEFAULTS.label_absender,
    label_betreff: content?.label_betreff || DEFAULTS.label_betreff,
    label_nachricht: content?.label_nachricht || DEFAULTS.label_nachricht,
    button_text: content?.button_text || DEFAULTS.button_text,
    button_sending_text:
      content?.button_sending_text || DEFAULTS.button_sending_text,
    success_message: content?.success_message || DEFAULTS.success_message,
    error_message: content?.error_message || DEFAULTS.error_message,
    validation_message:
      content?.validation_message || DEFAULTS.validation_message,
  };

  const isPartner = user?.profile?.role === "partner";
  const displayEmail = isPartner
    ? (user?.partnerProfile?.business_email ?? user?.email ?? "")
    : (user?.email ?? "");
  const username = user?.profile?.username ?? null;
  const displayName = isPartner
    ? (user?.partnerProfile?.company_name ??
      [user?.profile?.first_name, user?.profile?.last_name]
        .filter(Boolean)
        .join(" ") ??
      "")
    : (username ??
      [user?.profile?.first_name, user?.profile?.last_name]
        .filter(Boolean)
        .join(" "));

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg(t.validation_message);
      return;
    }
    setErrorMsg(undefined);
    setStatus("submitting");

    try {
      const res = await fetch("/api/account-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          user_id: user?.id ?? null,
          email: displayEmail,
          name: displayName || null,
          username: isPartner ? null : (username ?? null),
          account_type: user?.profile?.role ?? null,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setSubject("");
        setMessage("");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? t.error_message);
        setStatus("error");
      }
    } catch {
      setErrorMsg(t.error_message);
      setStatus("error");
    }
  }

  const sectionClass = noBorderTop
    ? `${styles.section} ${styles.sectionNoBorder}`
    : styles.section;

  if (status === "success") {
    return (
      <div className={sectionClass}>
        <div className={styles.successBox}>
          <p className={styles.successText}>{t.success_message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      <h4 className={styles.title}>{t.title}</h4>
      <p className={styles.lead}>{t.lead_text}</p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {status === "error" && errorMsg && (
          <p className={styles.errorMsg}>{errorMsg}</p>
        )}

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{t.label_absender}</span>
          <span className={styles.infoValue}>
            {displayName ? `${displayName} (${displayEmail})` : displayEmail}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="ac-subject" className={styles.label}>
            {t.label_betreff}
          </label>
          <input
            id="ac-subject"
            type="text"
            className={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={status === "submitting"}
            autoComplete="off"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="ac-message" className={styles.label}>
            {t.label_nachricht}
          </label>
          <textarea
            id="ac-message"
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            disabled={status === "submitting"}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? t.button_sending_text : t.button_text}
        </button>
      </form>
    </div>
  );
}

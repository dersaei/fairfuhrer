"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./AccountContactForm.module.css";

export default function AccountContactForm() {
  const { user } = useAuth();

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
      setErrorMsg("Bitte füllen Sie alle Felder aus.");
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
        setErrorMsg(data.error ?? "Ein Fehler ist aufgetreten.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.section}>
        <div className={styles.successBox}>
          <p className={styles.successText}>
            Vielen Dank für Ihre Nachricht! Wir melden uns so schnell wie
            möglich bei Ihnen
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h4 className={styles.title}>Kontakt aufnehmen</h4>
      <p className={styles.lead}>
        Sie haben eine Frage oder ein Anliegen? Schreiben Sie uns direkt — wir
        antworten in der Regel innerhalb von 1–2 Werktagen.
      </p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {status === "error" && errorMsg && (
          <p className={styles.errorMsg}>{errorMsg}</p>
        )}

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Absender</span>
          <span className={styles.infoValue}>
            {displayName ? `${displayName} (${displayEmail})` : displayEmail}
          </span>
        </div>

        <div className={styles.field}>
          <label htmlFor="ac-subject" className={styles.label}>
            Betreff
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
            Nachricht
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
          {status === "submitting" ? "Wird gesendet…" : "Nachricht senden"}
        </button>
      </form>
    </div>
  );
}

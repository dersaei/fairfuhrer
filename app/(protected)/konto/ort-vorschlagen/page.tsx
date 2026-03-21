"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./ort-vorschlagen.module.css";

export default function OrtVorschlagenPage() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  const [fields, setFields] = useState({
    name: "",
    address: "",
    description: "",
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("profiles")
      .select("premium_until")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.premium_until) {
          setIsPremium(new Date(data.premium_until) > new Date());
        }
        setPremiumChecked(true);
      });
  }, [user]);

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (
      !fields.name.trim() ||
      !fields.address.trim() ||
      !fields.description.trim()
    ) {
      setError("Bitte füllen Sie alle Felder aus.");
      return;
    }

    setIsSubmitting(true);
    const firstName = user?.profile?.first_name ?? null;
    const lastName = user?.profile?.last_name ?? null;
    try {
      const res = await fetch("/api/ort-vorschlagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          address: fields.address.trim(),
          description: fields.description.trim(),
          submitted_by: user?.email ?? null,
          submitted_by_first_name: firstName,
          submitted_by_last_name: lastName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ein Fehler ist aufgetreten.");
      } else {
        setSuccess(true);
        setFields({ name: "", address: "", description: "" });
      }
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!premiumChecked) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>
        Kennen Sie einen fairen Ort, der auf unsere Karte gehört? Füllen Sie das
        folgende Formular aus und erzählen Sie uns davon!
      </h3>

      {!isPremium && (
        <p className={styles.premiumInfo}>
          Das Einreichen von Ortsvorschlägen ist ausschließlich für
          Premium-Mitglieder verfügbar. Mit einem Premium-Konto kannst du aktiv
          zur Fairführer-Community beitragen und neue Orte vorschlagen, die nach
          Prüfung durch unser Team auf der Karte erscheinen.
        </p>
      )}

      {success ? (
        <div className={styles.successBox}>
          <p className={styles.successText}>
            Vielen Dank für Ihren Vorschlag! Wir prüfen ihn und melden uns, wenn
            er auf der Karte erscheint.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`${styles.form} ${!isPremium ? styles.formDisabled : ""}`}
          noValidate
        >
          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Name des Ortes
              {!isPremium && <span className={styles.premiumBadge}>Premium</span>}
            </label>
            <input
              id="name"
              type="text"
              className={styles.input}
              value={fields.name}
              onChange={set("name")}
              autoComplete="off"
              disabled={!isPremium}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="address" className={styles.label}>
              Adresse
              {!isPremium && <span className={styles.premiumBadge}>Premium</span>}
            </label>
            <input
              id="address"
              type="text"
              className={styles.input}
              value={fields.address}
              onChange={set("address")}
              autoComplete="off"
              disabled={!isPremium}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Warum sollte dieser Ort in unserem Reiseführer stehen?
              {!isPremium && <span className={styles.premiumBadge}>Premium</span>}
            </label>
            <textarea
              id="description"
              className={styles.textarea}
              value={fields.description}
              onChange={set("description")}
              rows={5}
              disabled={!isPremium}
            />
          </div>

          {isPremium && (
            <p className={styles.hint}>
              Ihr Vorschlag wird zusammen mit Ihrer E-Mail-Adresse übermittelt.
              {user?.profile?.first_name || user?.profile?.last_name
                ? " Vor- und Nachname werden ebenfalls gesendet, da sie in Ihrem Profil hinterlegt sind."
                : " Vor- und Nachname werden nicht gesendet, da sie in Ihrem Profil nicht hinterlegt sind."}
            </p>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting || !isPremium}
          >
            {isSubmitting ? "Wird gesendet…" : "Vorschlag einreichen"}
            {!isPremium && <span className={styles.premiumBadge}>Premium</span>}
          </button>
        </form>
      )}

    </div>
  );
}

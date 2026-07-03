"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { OrtVorschlagenContent } from "@/types";
import styles from "./ort-vorschlagen.module.css";

// Fallback-Texte, falls Directus nichts liefert
const DEFAULTS = {
  intro:
    "Kennen Sie einen fairen Ort, der auf unsere Karte gehört? Füllen Sie das folgende Formular aus und erzählen Sie uns davon!",
  premium_info:
    "Das Einreichen von Ortsvorschlägen ist ausschließlich für Premium-Mitglieder verfügbar. Mit einem Premium-Konto kannst du aktiv zur Fairführer-Community beitragen und neue Orte vorschlagen, die nach Prüfung durch unser Team auf der Karte erscheinen.",
  premium_badge: "Premium",
  label_name: "Name des Ortes",
  label_adresse: "Adresse",
  label_beschreibung: "Warum sollte dieser Ort in unserem Reiseführer stehen?",
  button_text: "Vorschlag einreichen",
  button_sending_text: "Wird gesendet…",
  hint_intro: "Ihr Vorschlag wird zusammen mit Ihrer E-Mail-Adresse übermittelt.",
  hint_with_name:
    "Vor- und Nachname werden ebenfalls gesendet, da sie in Ihrem Profil hinterlegt sind.",
  hint_without_name:
    "Vor- und Nachname werden nicht gesendet, da sie in Ihrem Profil nicht hinterlegt sind.",
  success_message:
    "Vielen Dank für Ihren Vorschlag! Wir prüfen ihn und melden uns, wenn er auf der Karte erscheint.",
  error_message: "Ein Fehler ist aufgetreten.",
  validation_message: "Bitte füllen Sie alle Felder aus.",
} as const;

export default function OrtVorschlagenForm({
  content,
}: {
  content?: OrtVorschlagenContent | null;
}) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  const [fields, setFields] = useState({
    name: "",
    address: "",
    description: "",
    kategorie_id: "" as string,
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = {
    intro: content?.intro || DEFAULTS.intro,
    premium_info: content?.premium_info || DEFAULTS.premium_info,
    premium_badge: content?.premium_badge || DEFAULTS.premium_badge,
    label_name: content?.label_name || DEFAULTS.label_name,
    label_adresse: content?.label_adresse || DEFAULTS.label_adresse,
    label_beschreibung:
      content?.label_beschreibung || DEFAULTS.label_beschreibung,
    button_text: content?.button_text || DEFAULTS.button_text,
    button_sending_text:
      content?.button_sending_text || DEFAULTS.button_sending_text,
    hint_intro: content?.hint_intro || DEFAULTS.hint_intro,
    hint_with_name: content?.hint_with_name || DEFAULTS.hint_with_name,
    hint_without_name:
      content?.hint_without_name || DEFAULTS.hint_without_name,
    success_message: content?.success_message || DEFAULTS.success_message,
    error_message: content?.error_message || DEFAULTS.error_message,
    validation_message:
      content?.validation_message || DEFAULTS.validation_message,
  };

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
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  // Kategorie komercyjne — Sehenswertes (id=1) idzie osobno przez Redaktion.
  const KATEGORIEN_KOMMERZIELL = [
    { id: 2, name: "Essen & Übernachten" },
    { id: 3, name: "Einkaufen" },
    { id: 5, name: "Engagement" },
    { id: 8, name: "Unternehmen" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);

    if (
      !fields.name.trim() ||
      !fields.address.trim() ||
      !fields.description.trim() ||
      !fields.kategorie_id
    ) {
      setError(t.validation_message);
      return;
    }

    setIsSubmitting(true);
    const firstName = user?.profile?.first_name ?? null;
    const lastName = user?.profile?.last_name ?? null;
    const username = user?.profile?.username ?? null;
    try {
      const res = await fetch("/api/ort-vorschlagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name.trim(),
          address: fields.address.trim(),
          description: fields.description.trim(),
          kategorie_id: Number(fields.kategorie_id),
          submitted_by: user?.email ?? null,
          submitted_by_username: username,
          submitted_by_first_name: firstName,
          submitted_by_last_name: lastName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.error_message);
      } else {
        setSuccess(true);
        setFields({ name: "", address: "", description: "", kategorie_id: "" });
      }
    } catch {
      setError(t.error_message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!premiumChecked) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>{t.intro}</h3>

      {!isPremium && <p className={styles.premiumInfo}>{t.premium_info}</p>}

      {success ? (
        <div className={styles.successBox}>
          <p className={styles.successText}>{t.success_message}</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`${styles.form} ${!isPremium ? styles.formDisabled : ""}`}
          noValidate
        >
          {error && <p className={styles.errorMessage}>{error}</p>}

          <div className={styles.field}>
            <label htmlFor="kategorie_id" className={styles.label}>
              Kategorie
              {!isPremium && (
                <span className={styles.premiumBadge}>{t.premium_badge}</span>
              )}
            </label>
            <select
              id="kategorie_id"
              className={styles.input}
              value={fields.kategorie_id}
              onChange={set("kategorie_id")}
              disabled={!isPremium}
            >
              <option value="">Bitte wählen…</option>
              {KATEGORIEN_KOMMERZIELL.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              {t.label_name}
              {!isPremium && (
                <span className={styles.premiumBadge}>{t.premium_badge}</span>
              )}
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
              {t.label_adresse}
              {!isPremium && (
                <span className={styles.premiumBadge}>{t.premium_badge}</span>
              )}
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
              {t.label_beschreibung}
              {!isPremium && (
                <span className={styles.premiumBadge}>{t.premium_badge}</span>
              )}
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
              {t.hint_intro}{" "}
              {user?.profile?.first_name || user?.profile?.last_name
                ? t.hint_with_name
                : t.hint_without_name}
            </p>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={isSubmitting || !isPremium}
          >
            {isSubmitting ? t.button_sending_text : t.button_text}
            {!isPremium && (
              <span className={styles.premiumBadge}>{t.premium_badge}</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

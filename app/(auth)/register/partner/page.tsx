"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerPartner } from "@/app/actions/auth";
import type { FormErrors } from "@/types/auth";
import styles from "./partner.module.css";
import { COUNTRIES } from "@/lib/countries";

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  if (!/[A-Z]/.test(password)) return "Das Passwort muss mindestens einen Großbuchstaben enthalten.";
  if (!/[a-z]/.test(password)) return "Das Passwort muss mindestens einen Kleinbuchstaben enthalten.";
  if (!/[0-9]/.test(password)) return "Das Passwort muss mindestens eine Ziffer enthalten.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Das Passwort muss mindestens ein Sonderzeichen enthalten.";
  return null;
}

export default function RegisterPartnerPage() {
  const router = useRouter();
  const [fields, setFields] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "DE",
    contactEmail: "",
    // unused but kept for server action compatibility
    countryOfRegistration: "DE",
    phone: "",
    businessEmail: "",
    taxId: "",
    websiteUrl: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(key: keyof typeof fields) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};

    // Unternehmensdaten
    if (!fields.companyName) newErrors.companyName = "Pflichtfeld";
    if (!fields.street) newErrors.street = "Pflichtfeld";
    if (!fields.postalCode) newErrors.postalCode = "Pflichtfeld";
    if (!fields.city) newErrors.city = "Pflichtfeld";

    // Kontaktdaten
    if (!fields.firstName) newErrors.firstName = "Pflichtfeld";
    if (!fields.lastName) newErrors.lastName = "Pflichtfeld";
    if (!fields.contactEmail) newErrors.contactEmail = "Pflichtfeld";

    // Zugangsdaten
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

    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.set(k, v));
    // map contactEmail → businessEmail for server action
    formData.set("businessEmail", fields.contactEmail);

    const result = await registerPartner(formData);
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ general: result.error });
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(result.redirectTo ?? "/konto/profil?complete=1"), 2000);
  }

  if (success) {
    return (
      <div className={styles.card}>
        <p className={styles.successMessage}>
          Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.
          Sie werden zu Ihrem Profil weitergeleitet…
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Link href="/register" className={styles.back}>
        ← Zurück
      </Link>
      <h1 className={styles.title}>Als Partner registrieren</h1>

      {errors.general && (
        <p className={styles.errorMessage}>{errors.general}</p>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ── 1. Unternehmensdaten ── */}
        <h2 className={styles.sectionTitle}>Unternehmensdaten</h2>

        <div className={styles.field}>
          <label htmlFor="companyName" className={styles.label}>Unternehmensname *</label>
          <input id="companyName" type="text"
            className={`${styles.input} ${errors.companyName ? styles.inputError : ""}`}
            value={fields.companyName} onChange={set("companyName")} autoComplete="organization" />
          {errors.companyName && <span className={styles.fieldError}>{errors.companyName}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="street" className={styles.label}>Straße und Hausnummer *</label>
          <input id="street" type="text"
            className={`${styles.input} ${errors.street ? styles.inputError : ""}`}
            value={fields.street} onChange={set("street")} autoComplete="street-address" />
          {errors.street && <span className={styles.fieldError}>{errors.street}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="postalCode" className={styles.label}>PLZ *</label>
            <input id="postalCode" type="text"
              className={`${styles.input} ${errors.postalCode ? styles.inputError : ""}`}
              value={fields.postalCode} onChange={set("postalCode")} autoComplete="postal-code" />
            {errors.postalCode && <span className={styles.fieldError}>{errors.postalCode}</span>}
          </div>
          <div className={styles.field}>
            <label htmlFor="city" className={styles.label}>Stadt *</label>
            <input id="city" type="text"
              className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
              value={fields.city} onChange={set("city")} autoComplete="address-level2" />
            {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="country" className={styles.label}>Land *</label>
          <select id="country" className={styles.select} value={fields.country} onChange={set("country")}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <span className={styles.hint}>Bitte aus der Liste wählen.</span>
        </div>

        {/* ── 2. Kontaktdaten ── */}
        <h2 className={styles.sectionTitle}>Kontaktdaten</h2>

        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.label}>Vorname *</label>
          <input id="firstName" type="text"
            className={`${styles.input} ${errors.firstName ? styles.inputError : ""}`}
            value={fields.firstName} onChange={set("firstName")} autoComplete="given-name" />
          {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="lastName" className={styles.label}>Nachname *</label>
          <input id="lastName" type="text"
            className={`${styles.input} ${errors.lastName ? styles.inputError : ""}`}
            value={fields.lastName} onChange={set("lastName")} autoComplete="family-name" />
          {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="contactEmail" className={styles.label}>E-Mail-Adresse *</label>
          <input id="contactEmail" type="email"
            className={`${styles.input} ${errors.contactEmail ? styles.inputError : ""}`}
            value={fields.contactEmail} onChange={set("contactEmail")} autoComplete="email" />
          <span className={styles.hint}>
            Ihre persönliche Kontakt-E-Mail — nur wir nehmen darüber Kontakt mit Ihnen auf, sie ist nicht öffentlich sichtbar.
          </span>
          {errors.contactEmail && <span className={styles.fieldError}>{errors.contactEmail}</span>}
        </div>

        {/* ── 3. Zugangsdaten ── */}
        <h2 className={styles.sectionTitle}>Zugangsdaten</h2>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>Anmelde-E-Mail *</label>
          <input id="email" type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
            value={fields.email} onChange={set("email")} autoComplete="email" />
          <span className={styles.hint}>
            Diese Adresse dient ausschließlich zum Einloggen und ist nicht öffentlich sichtbar.
          </span>
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>Passwort *</label>
          <input id="password" type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
            value={fields.password} onChange={set("password")} autoComplete="new-password" />
          <span className={styles.hint}>
            Mind. 8 Zeichen, ein Großbuchstabe, ein Kleinbuchstabe, eine Ziffer und ein Sonderzeichen.
          </span>
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword" className={styles.label}>Passwort bestätigen *</label>
          <input id="confirmPassword" type="password"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
            value={fields.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
          {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Wird registriert…" : "Partnerkonto erstellen"}
        </button>
      </form>

      <p className={styles.loginLink}>
        Bereits registriert?{" "}
        <Link href="/login" className={styles.link}>Anmelden</Link>
      </p>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { updateConsumerProfile, updatePartnerProfile } from "@/app/actions/auth";
import type { FormErrors, PartnerProfile, Profile } from "@/types/auth";
import styles from "./PartnerProfileForm.module.css";

const COUNTRIES = [
  { code: "DE", label: "Deutschland" },
  { code: "AT", label: "Österreich" },
  { code: "CH", label: "Schweiz" },
  { code: "LI", label: "Liechtenstein" },
  { code: "LU", label: "Luxemburg" },
  { code: "BE", label: "Belgien" },
  { code: "NL", label: "Niederlande" },
  { code: "FR", label: "Frankreich" },
  { code: "IT", label: "Italien" },
  { code: "ES", label: "Spanien" },
  { code: "PL", label: "Polen" },
  { code: "CZ", label: "Tschechien" },
  { code: "OTHER", label: "Sonstiges" },
];

interface Props {
  profile: Profile;
  partnerProfile: PartnerProfile | null;
}

export default function PartnerProfileForm({ profile, partnerProfile }: Props) {
  const [base, setBase] = useState({
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
  });

  const [fields, setFields] = useState({
    companyName: partnerProfile?.company_name ?? "",
    street: partnerProfile?.street ?? "",
    city: partnerProfile?.city ?? "",
    postalCode: partnerProfile?.postal_code ?? "",
    country: partnerProfile?.country ?? "DE",
    countryOfRegistration: partnerProfile?.country_of_registration ?? "DE",
    websiteUrl: partnerProfile?.website_url ?? "",
    phoneNumber: partnerProfile?.phone_number ?? "",
    businessEmail: partnerProfile?.business_email ?? "",
    contactPersonName: partnerProfile?.contact_person_name ?? "",
    taxId: partnerProfile?.tax_id ?? "",
    instagramUrl: partnerProfile?.instagram_url ?? "",
    facebookUrl: partnerProfile?.facebook_url ?? "",
    tiktokUrl: partnerProfile?.tiktok_url ?? "",
    youtubeUrl: partnerProfile?.youtube_url ?? "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [galleryPaths] = useState<string[]>(partnerProfile?.gallery_paths ?? []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setField(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setIsSubmitting(true);

    const [baseResult, partnerResult] = await Promise.all([
      updateConsumerProfile({
        first_name: base.firstName.trim() || null,
        last_name: base.lastName.trim() || null,
      }),
      updatePartnerProfile({
        company_name: fields.companyName || null,
        street: fields.street || null,
        city: fields.city || null,
        postal_code: fields.postalCode || null,
        country: fields.country || null,
        country_of_registration: fields.countryOfRegistration || null,
        website_url: fields.websiteUrl || null,
        phone_number: fields.phoneNumber || null,
        business_email: fields.businessEmail || null,
        contact_person_name: fields.contactPersonName || null,
        tax_id: fields.taxId || null,
        instagram_url: fields.instagramUrl || null,
        facebook_url: fields.facebookUrl || null,
        tiktok_url: fields.tiktokUrl || null,
        youtube_url: fields.youtubeUrl || null,
      }),
    ]);

    setIsSubmitting(false);

    if (!baseResult.success || !partnerResult.success) {
      setErrors({ general: baseResult.error ?? partnerResult.error });
      return;
    }

    setSuccess(true);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.set("file", file);

    const res = await fetch("/api/auth/gallery", { method: "POST", body: formData });
    const data = await res.json();

    setIsUploading(false);

    if (!res.ok) {
      setUploadError(data.error ?? "Upload fehlgeschlagen.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className={styles.wrapper} noValidate>
      {errors.general && <p className={styles.errorMessage}>{errors.general}</p>}
      {success && <p className={styles.successMessage}>Profil erfolgreich gespeichert.</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Persönliche Daten</h2>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="firstName" className={styles.label}>Vorname</label>
            <input id="firstName" type="text" className={styles.input}
              value={base.firstName} onChange={(e) => setBase((p) => ({ ...p, firstName: e.target.value }))}
              autoComplete="given-name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="lastName" className={styles.label}>Nachname</label>
            <input id="lastName" type="text" className={styles.input}
              value={base.lastName} onChange={(e) => setBase((p) => ({ ...p, lastName: e.target.value }))}
              autoComplete="family-name" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Unternehmen</h2>
        <div className={styles.field}>
          <label htmlFor="companyName" className={styles.label}>Unternehmensname</label>
          <input id="companyName" type="text" className={styles.input}
            value={fields.companyName} onChange={setField("companyName")} autoComplete="organization" />
        </div>
        <div className={styles.field}>
          <label htmlFor="street" className={styles.label}>Straße und Hausnummer</label>
          <input id="street" type="text" className={styles.input}
            value={fields.street} onChange={setField("street")} autoComplete="street-address" />
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="postalCode" className={styles.label}>PLZ</label>
            <input id="postalCode" type="text" className={styles.input}
              value={fields.postalCode} onChange={setField("postalCode")} autoComplete="postal-code" />
          </div>
          <div className={styles.field}>
            <label htmlFor="city" className={styles.label}>Stadt</label>
            <input id="city" type="text" className={styles.input}
              value={fields.city} onChange={setField("city")} autoComplete="address-level2" />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="country" className={styles.label}>Land</label>
            <select id="country" className={styles.select} value={fields.country} onChange={setField("country")}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="countryOfRegistration" className={styles.label}>Registrierungsland</label>
            <select id="countryOfRegistration" className={styles.select}
              value={fields.countryOfRegistration} onChange={setField("countryOfRegistration")}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="phoneNumber" className={styles.label}>Telefon</label>
            <input id="phoneNumber" type="tel" className={styles.input}
              value={fields.phoneNumber} onChange={setField("phoneNumber")} autoComplete="tel" />
          </div>
          <div className={styles.field}>
            <label htmlFor="businessEmail" className={styles.label}>Geschäftliche E-Mail</label>
            <input id="businessEmail" type="email" className={styles.input}
              value={fields.businessEmail} onChange={setField("businessEmail")} autoComplete="email" />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="contactPersonName" className={styles.label}>Ansprechpartner</label>
            <input id="contactPersonName" type="text" className={styles.input}
              value={fields.contactPersonName} onChange={setField("contactPersonName")} />
          </div>
          <div className={styles.field}>
            <label htmlFor="taxId" className={styles.label}>Steuernummer / USt-IdNr.</label>
            <input id="taxId" type="text" className={styles.input}
              value={fields.taxId} onChange={setField("taxId")} />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor="websiteUrl" className={styles.label}>Website</label>
          <input id="websiteUrl" type="url" className={styles.input}
            value={fields.websiteUrl} onChange={setField("websiteUrl")} autoComplete="url" placeholder="https://" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Social Media</h2>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="instagramUrl" className={styles.label}>Instagram</label>
            <input id="instagramUrl" type="url" className={styles.input}
              value={fields.instagramUrl} onChange={setField("instagramUrl")} placeholder="https://instagram.com/..." />
          </div>
          <div className={styles.field}>
            <label htmlFor="facebookUrl" className={styles.label}>Facebook</label>
            <input id="facebookUrl" type="url" className={styles.input}
              value={fields.facebookUrl} onChange={setField("facebookUrl")} placeholder="https://facebook.com/..." />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="tiktokUrl" className={styles.label}>TikTok</label>
            <input id="tiktokUrl" type="url" className={styles.input}
              value={fields.tiktokUrl} onChange={setField("tiktokUrl")} placeholder="https://tiktok.com/@..." />
          </div>
          <div className={styles.field}>
            <label htmlFor="youtubeUrl" className={styles.label}>YouTube</label>
            <input id="youtubeUrl" type="url" className={styles.input}
              value={fields.youtubeUrl} onChange={setField("youtubeUrl")} placeholder="https://youtube.com/@..." />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Galerie</h2>
        {uploadError && <p className={styles.errorMessage}>{uploadError}</p>}
        <div className={styles.gallery}>
          {galleryPaths.map((path) => (
            <div key={path} className={styles.galleryItem}>
              <span className={styles.galleryPath}>{path.split("/").pop()}</span>
            </div>
          ))}
        </div>
        <label className={styles.uploadButton}>
          {isUploading ? "Wird hochgeladen…" : "Bild hinzufügen"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={styles.fileInput}
            onChange={handleGalleryUpload}
            disabled={isUploading}
          />
        </label>
        <p className={styles.uploadHint}>JPEG, PNG, WebP oder GIF — max. 10 MB</p>
      </section>

      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
        {isSubmitting ? "Wird gespeichert…" : "Profil speichern"}
      </button>
    </form>
  );
}

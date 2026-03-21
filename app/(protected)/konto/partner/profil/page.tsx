"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getCountryLabel } from "@/lib/countries";
import styles from "@/app/(protected)/konto/profil/profil.module.css";

export default function PartnerProfilPage() {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile;
  const partner = user?.partnerProfile;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUrl = profile?.avatar_url ?? null;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadError(null);
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: `${data.publicUrl}?t=${Date.now()}` })
        .eq("id", user.id);
      if (updateErr) throw updateErr;
      await refreshUser();
    } catch (err) {
      console.error(err);
      setUploadError("Beim Hochladen ist ein Fehler aufgetreten.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!user) return;
    setUploadError(null);
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: files } = await supabase.storage.from("avatars").list(user.id);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(paths);
      }
      await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
      await refreshUser();
    } catch (err) {
      console.error(err);
      setUploadError("Beim Löschen ist ein Fehler aufgetreten.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Profilbild */}
      <div className={styles.avatarSection}>
        <p className={styles.avatarTitle}>Profilbild</p>
        <p className={styles.avatarText}>
          Laden Sie ein Bild hoch (JPG, PNG, WebP — max. 2 MB). Es erscheint
          im Header der Seite, wenn Sie eingeloggt sind.
        </p>
        <div className={styles.avatarActions}>
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Wird hochgeladen…" : avatarUrl ? "Bild ändern" : "Bild hochladen"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
              disabled={uploading}
            >
              Entfernen
            </button>
          )}
        </div>
        {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-label="Profilbild hochladen"
        />
      </div>

      {/* Unternehmensdaten */}
      <div className={styles.fields}>
        <div className={styles.sectionLabel}>Unternehmensdaten</div>
        <div className={styles.field}>
          <span className={styles.label}>Unternehmensname</span>
          <span className={styles.value}>{partner?.company_name || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Straße und Hausnummer</span>
          <span className={styles.value}>{partner?.street || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>PLZ</span>
          <span className={styles.value}>{partner?.postal_code || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Stadt</span>
          <span className={styles.value}>{partner?.city || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Land</span>
          <span className={styles.value}>{getCountryLabel(partner?.country)}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Website</span>
          <span className={styles.value}>{partner?.website_url || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Telefon (Unternehmen)</span>
          <span className={styles.value}>{partner?.phone_number_2 || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Steuernummer / UID</span>
          <span className={styles.value}>{partner?.tax_id || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>USt-IdNr. / VAT-EU</span>
          <span className={styles.value}>{partner?.vat_eu || "—"}</span>
        </div>
      </div>

      {/* Social Media */}
      <div className={styles.fields}>
        <div className={styles.sectionLabel}>Social Media</div>
        <div className={styles.field}>
          <span className={styles.label}>Instagram</span>
          <span className={styles.value}>{partner?.instagram_url || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Facebook</span>
          <span className={styles.value}>{partner?.facebook_url || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>TikTok</span>
          <span className={styles.value}>{partner?.tiktok_url || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>YouTube</span>
          <span className={styles.value}>{partner?.youtube_url || "—"}</span>
        </div>
      </div>

      {/* Kontaktdaten */}
      <div className={styles.fields}>
        <div className={styles.sectionLabel}>Kontaktdaten</div>
        <div className={styles.field}>
          <span className={styles.label}>Vorname</span>
          <span className={styles.value}>{profile?.first_name || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Nachname</span>
          <span className={styles.value}>{profile?.last_name || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Kontakt-E-Mail</span>
          <span className={styles.value}>{partner?.business_email || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Telefon</span>
          <span className={styles.value}>{partner?.phone_number || "—"}</span>
        </div>
      </div>

      {/* Zugangsdaten */}
      <div className={styles.fields}>
        <div className={styles.sectionLabel}>Zugangsdaten</div>
        <div className={styles.field}>
          <span className={styles.label}>Anmelde-E-Mail</span>
          <span className={styles.value}>{user?.email || "—"}</span>
        </div>
      </div>
    </div>
  );
}

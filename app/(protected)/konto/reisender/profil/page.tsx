"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
// Community-Feature auf Eis gelegt (2026-07-04): Frank hat entschieden, das
// Community-Feature vorerst nicht umzusetzen (Aufwand/Kosten Rechtsberatung).
// Komponente + DB-Felder (profiles.bio, is_public) bleiben erhalten, nur aus
// der UI genommen. Zum Reaktivieren: Import + <CommunityProfilSection/> unten
// wieder einkommentieren. Siehe auch Partner-Profil (gleiche Stelle).
// import CommunityProfilSection from "@/components/auth/CommunityProfilSection";
import styles from "../../profil/profil.module.css";

export default function ReisenderProfilPage() {
  const { user, refreshUser, logout } = useAuth();
  const profile = user?.profile;

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
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

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setUploadError(null);
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      const { data: files } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from("avatars").remove(paths);
      }

      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

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

      {/* Community-Feature auf Eis gelegt (2026-07-04) — s. Import oben. */}
      {/* <CommunityProfilSection /> */}

      <div className={styles.fields}>
        <div className={styles.field}>
          <span className={styles.label}>Benutzername</span>
          <span className={styles.value}>{profile?.username || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>E-Mail-Adresse</span>
          <span className={styles.value}>{user?.email || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Vorname</span>
          <span className={styles.value}>{profile?.first_name || "—"}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Nachname</span>
          <span className={styles.value}>{profile?.last_name || "—"}</span>
        </div>
      </div>

      <div className={styles.signOutSection}>
        <button
          type="button"
          className={styles.signOutButton}
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Wird abgemeldet…" : "Abmelden"}
        </button>
      </div>
    </div>
  );
}

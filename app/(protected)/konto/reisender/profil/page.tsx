"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
// Community-Feature auf Eis gelegt (2026-07-04): Frank hat entschieden, das
// Community-Feature vorerst nicht umzusetzen (Aufwand/Kosten Rechtsberatung).
// Komponente + DB-Felder (profiles.bio, is_public) bleiben erhalten, nur aus
// der UI genommen. Zum Reaktivieren: Import + <CommunityProfilSection/> unten
// wieder einkommentieren. Siehe auch Partner-Profil (gleiche Stelle).
// import CommunityProfilSection from "@/components/auth/CommunityProfilSection";
import styles from "../../profil/profil.module.css";

export default function ReisenderProfilPage() {
  const { user, logout } = useAuth();

  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* Community-Feature auf Eis gelegt (2026-07-04) — s. Import oben. */}
      {/* <CommunityProfilSection /> */}

      <div className={styles.fields}>
        <div className={styles.field}>
          <span className={styles.label}>E-Mail-Adresse</span>
          <span className={styles.value}>{user?.email || "—"}</span>
        </div>
      </div>

      <section className={styles.infoSection}>
        <p className={styles.sectionLabel}>Konto und mobile App</p>
        <p className={styles.infoText}>
          Dein Konto ist vor allem dann nützlich, wenn du in unserer mobilen App
          ein Abo abschließt: Es synchronisiert deine Inhalte über alle deine
          Geräte hinweg und schaltet die Audiopins der Kategorie „Sehenswertes"
          frei.
        </p>
      </section>

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

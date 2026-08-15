"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./profil.module.css";

export default function ProfilPage() {
  const { user } = useAuth();
  const profile = user?.profile;

  return (
    <div className={styles.wrapper}>
      {/* Felder */}
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
    </div>
  );
}

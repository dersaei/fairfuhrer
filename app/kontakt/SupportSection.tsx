// app/kontakt/SupportSection.tsx
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import styles from "./SupportSection.module.css";

export default function SupportSection() {
  return (
    <div className={styles.supportSection}>
      <div className={styles.supportContent}>
        <div className={styles.iconContainer}>
          <Heart size={32} className={styles.heartIcon} />
          <Sparkles size={20} className={styles.sparkleIcon} />
        </div>

        <h2 className={styles.supportTitle}>Unterstützen Sie unsere Mission</h2>

        <p className={styles.supportText}>
          Helfen Sie uns dabei, ein Netzwerk fairer Geschäfte aufzubauen. Jede
          Spende trägt dazu bei, mehr nachhaltige und innovative Unternehmen in
          unserer Region zu vernetzen.
        </p>

        <Link href="/sparschwein" className={styles.supportButton}>
          <Heart size={20} />
          Jetzt unterstützen
        </Link>
      </div>
    </div>
  );
}

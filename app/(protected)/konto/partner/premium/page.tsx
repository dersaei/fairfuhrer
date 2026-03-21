"use client";

import styles from "@/app/(protected)/konto/reisender/premium/premium.module.css";

export default function PartnerPremiumPage() {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>Premium-Partnerschaft</h3>

      <p className={styles.lead}>
        Mit einem Premium-Partner-Konto erhältst du Zugang zu erweiterten
        Funktionen für deinen Audiopin und präsentierst dein Unternehmen noch
        wirkungsvoller auf der Fairführer-Karte.
      </p>

      <div className={styles.featureList}>
        <h4 className={styles.featureTitle}>Das bekommst du mit Premium:</h4>
        <ul className={styles.features}>
          <li>Sofortige Veröffentlichung deines Audiopins ohne Wartezeit</li>
          <li>Bearbeitung deines Audiopins jederzeit möglich</li>
          <li>Telefonnummer mit Anruf-Button auf deinem Pin</li>
          <li>Link zu deiner Website</li>
          <li>Bildergalerie mit bis zu 6 Fotos</li>
        </ul>
      </div>

      <div className={styles.pricingBox}>
        <h4 className={styles.pricingTitle}>Preise</h4>
        <p className={styles.pricingText}>
          Wir arbeiten derzeit an unserem Premium-Modell mit jährlicher
          Abonnement-Option. Bald kannst du hier dein Premium-Konto erwerben
          und alle Vorteile für Partner freischalten.
        </p>
        <p className={styles.comingSoon}>Demnächst verfügbar</p>
      </div>
    </div>
  );
}

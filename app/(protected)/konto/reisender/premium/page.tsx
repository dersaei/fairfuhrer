"use client";

import styles from "./premium.module.css";

export default function PremiumPage() {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>Premium-Mitgliedschaft</h3>

      <p className={styles.lead}>
        Mit einem Premium-Konto unterstützt du Fairführer und erhältst Zugang
        zu exklusiven Funktionen, die das Entdecken fairer Orte noch besser
        machen.
      </p>

      <div className={styles.featureList}>
        <h4 className={styles.featureTitle}>Das bekommst du mit Premium:</h4>
        <ul className={styles.features}>
          <li>100 % der Pins in allen Kategorien</li>
          <li>Offline-Karten für unterwegs ohne Internetverbindung</li>
          <li>Neue Orte vorschlagen und zur Community beitragen</li>
          <li>Zugang zu Community-Funktionen</li>
        </ul>
      </div>

      <div className={styles.pricingBox}>
        <h4 className={styles.pricingTitle}>Preise</h4>
        <p className={styles.pricingText}>
          Wir arbeiten derzeit an unserem Premium-Modell mit flexibler
          Preisgestaltung — du wählst selbst, wie viel du beitragen möchtest.
          Bald kannst du hier dein Premium-Konto erwerben.
        </p>
        <p className={styles.comingSoon}>Demnächst verfügbar</p>
      </div>
    </div>
  );
}

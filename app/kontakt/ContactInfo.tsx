// app/kontakt/ContactInfo.tsx
import styles from "./ContactInfo.module.css";

export default function ContactInfo() {
  return (
    <div className={styles.contactInfo}>
      <h2>Kontaktinformationen</h2>
      <p className={styles.intro}>
        Haben Sie Fragen oder benötigen Sie Hilfe? Kontaktieren Sie uns auf dem
        für Sie passenden Weg.
      </p>

      <div className={styles.contactMethods}>
        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>📧</div>
          <div className={styles.methodContent}>
            <h3>Email</h3>
            <p>frank.gebhard@seenergien.com</p>
            <span className={styles.responseTime}>
              {" "}
              Wir antworten innerhalb von 48 Stunden.
            </span>
          </div>
        </div>

        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>📞</div>
          <div className={styles.methodContent}>
            <h3>Telefon</h3>
            <p>+49 1512 3576161</p>
            <span className={styles.responseTime}>Mo–Do 10:00–18:00</span>
          </div>
        </div>

        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>📍</div>
          <div className={styles.methodContent}>
            <h3>Adresse</h3>
            <p>
              Seenergien GmbH
              <br />
              Hintere Insel 1<br />
              88131 Lindau
              <br />
              Deutschland
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

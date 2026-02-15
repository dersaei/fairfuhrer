// app/kontakt/ContactInfo.tsx
import { Mail, Phone, MapPin } from "lucide-react";
import styles from "./ContactInfo.module.css";

export default function ContactInfo() {
  return (
    <div className={styles.contactInfo}>
      <h2>Kontaktinformationen</h2>
      <p className={styles.intro}>
        <span>Haben Sie Fragen oder benötigen Sie Hilfe?</span> <br />
        <span>Kontaktieren Sie uns auf dem für Sie passenden Weg</span>
      </p>

      <div className={styles.contactMethods}>
        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>
            <Mail size={24} />
          </div>
          <div className={styles.methodContent}>
            <h3>Email</h3>
            <p>info@fairfuehrer.guide</p>
            <span className={styles.responseTime}>
              Wir antworten innerhalb von 48 Stunden.
            </span>
          </div>
        </div>

        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>
            <Phone size={24} />
          </div>
          <div className={styles.methodContent}>
            <h3>Telefon</h3>
            <p>+49 1511 7656692</p>
          </div>
        </div>

        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>
            <MapPin size={24} />
          </div>
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

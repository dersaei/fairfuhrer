// app/kontakt/ContactInfo.tsx
import styles from "./ContactInfo.module.css";

export default function ContactInfo() {
  return (
    <div className={styles.contactInfo}>
      <h2>Informacje kontaktowe</h2>
      <p className={styles.intro}>
        Masz pytania lub potrzebujesz pomocy? Skontaktuj się z nami w dogodny
        dla Ciebie sposób.
      </p>

      <div className={styles.contactMethods}>
        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>📧</div>
          <div className={styles.methodContent}>
            <h3>Email</h3>
            <p>kontakt@twojafirma.pl</p>
            <span className={styles.responseTime}>Odpowiadamy w ciągu 24h</span>
          </div>
        </div>

        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>📞</div>
          <div className={styles.methodContent}>
            <h3>Telefon</h3>
            <p>+48 123 456 789</p>
            <span className={styles.responseTime}>Pn-Pt 9:00-17:00</span>
          </div>
        </div>

        <div className={styles.contactMethod}>
          <div className={styles.methodIcon}>📍</div>
          <div className={styles.methodContent}>
            <h3>Adres</h3>
            <p>
              ul. Przykładowa 123
              <br />
              00-001 Warszawa
            </p>
            <span className={styles.responseTime}>Biuro otwarte Pn-Pt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

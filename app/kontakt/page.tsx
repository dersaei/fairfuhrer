// app/kontakt/page.tsx
import { Metadata } from "next";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";
import styles from "./kontakt.module.css";

export const metadata: Metadata = {
  title: "Kontakt - Twoja Firma",
  description:
    "Skontaktuj się z nami. Jesteśmy tutaj, aby pomóc i odpowiedzieć na wszystkie Twoje pytania.",
};

export default function KontaktPage() {
  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <h1>Skontaktuj się z nami</h1>
          <p>
            Jesteśmy tutaj, aby pomóc i odpowiedzieć na wszystkie Twoje pytania.
          </p>
        </header>

        <div className={styles.contactContent}>
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

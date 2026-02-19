// app/kontakt/page.tsx
import { Metadata } from "next";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";
import SupportSection from "./SupportSection";
import styles from "./kontakt.module.css";
import { getContactInfoContent, getSupportSectionContent } from "@/lib/directus";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Kontaktieren Sie uns auf dem für Sie passenden Weg.",
};

export default async function KontaktPage() {
  const [contactInfoContent, supportSectionContent] = await Promise.all([
    getContactInfoContent(),
    getSupportSectionContent(),
  ]);

  return (
    <div className={styles.contactPage}>
      <div className={styles.contactContent}>
        <ContactInfo content={contactInfoContent} />
        <SupportSection content={supportSectionContent} />
        <ContactForm />
      </div>
    </div>
  );
}

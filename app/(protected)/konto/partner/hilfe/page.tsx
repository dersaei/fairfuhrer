import {
  getHilfeWebItems,
  getAccountContactFormContent,
} from "@/lib/directus";
import AccountContactForm from "@/components/account/AccountContactForm";
import HilfeContactLink from "./HilfeContactLink";
import styles from "./hilfe.module.css";

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default async function PartnerHilfePage() {
  const [items, contactFormContent] = await Promise.all([
    getHilfeWebItems(),
    getAccountContactFormContent(),
  ]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.introRow}>
        <h3 className={styles.intro}>Hilfe & FAQ</h3>
      </div>
      <HilfeContactLink />

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <h4 className={styles.frage}>{item.frage}</h4>
            <div
              className={styles.antwort}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(item.antwort) }}
            />
          </li>
        ))}
      </ul>

      <div className={styles.faqEndLine} />

      <div id="hilfe-kontakt">
        <AccountContactForm noBorderTop content={contactFormContent} />
      </div>
    </div>
  );
}

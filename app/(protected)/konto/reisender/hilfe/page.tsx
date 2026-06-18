import { marked } from "marked";
import {
  getHilfeWebReisenderItems,
  getAccountContactFormContent,
} from "@/lib/directus";
import AccountContactForm from "@/components/account/AccountContactForm";
import HilfeContactLink from "./HilfeContactLink";
import styles from "./hilfe.module.css";

export default async function ReisenderHilfePage() {
  const [items, contactFormContent] = await Promise.all([
    getHilfeWebReisenderItems(),
    getAccountContactFormContent(),
  ]);

  const renderedItems = await Promise.all(
    items.map(async (item) => ({
      ...item,
      html: await marked(item.antwort ?? ""),
    }))
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.introRow}>
        <h3 className={styles.intro}>Hilfe & FAQ</h3>
      </div>
      <HilfeContactLink />

      <ul className={styles.list}>
        {renderedItems.map((item) => (
          <li key={item.id} className={styles.item}>
            <h4 className={styles.frage}>{item.frage}</h4>
            <div
              className={styles.antwort}
              dangerouslySetInnerHTML={{ __html: item.html }}
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

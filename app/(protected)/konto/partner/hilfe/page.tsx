import { getHilfeWebItems } from "@/lib/directus";
import styles from "./hilfe.module.css";

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default async function PartnerHilfePage() {
  const items = await getHilfeWebItems();

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>Hilfe & FAQ</h3>
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
    </div>
  );
}

import { Metadata } from "next";
import { getDatenschutzNew } from "@/lib/directus";
import { marked } from "marked";
import styles from "./datenschutz.module.css";

export const metadata: Metadata = {
  title: "Datenschutz – FairFührer",
  description: "Datenschutzerklärung – Informationen zum Datenschutz bei FairFührer",
};

export default async function DatenschutzPage() {
  const content = await getDatenschutzNew();

  if (!content) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Datenschutzerklärung</h1>
        <p>Der Seiteninhalt ist derzeit nicht verfügbar.</p>
      </div>
    );
  }

  const html = await marked(content.content);

  const dateUpdated = content.date_updated
    ? new Date(content.date_updated).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Datenschutzerklärung</h1>
      {dateUpdated && (
        <p className={styles.updated}>Stand: {dateUpdated}</p>
      )}
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

import { Metadata } from "next";
import { getAgbContent } from "@/lib/directus";
import { marked } from "marked";
import styles from "./agb.module.css";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen – FairFührer",
  description: "AGB der Plattform FairFührer",
};

export default async function AgbPage() {
  const content = await getAgbContent();

  if (!content) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Allgemeine Geschäftsbedingungen</h1>
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
      <h1 className={styles.title}>Allgemeine Geschäftsbedingungen</h1>
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

// app/datenschutz/page.tsx

import { Metadata } from "next";
import { getDatenschutzContent } from "@/lib/directus";
import { DatenschutzContent } from "@/types";
import styles from "./datenschutz.module.css";

// Generowanie metadanych dla SEO
export async function generateMetadata(): Promise<Metadata> {
  const content = await getDatenschutzContent();

  return {
    title: content?.title || "Datenschutz",
    description: "Datenschutzerklärung - Informationen zum Datenschutz",
  };
}

export default async function DatenschutzPage() {
  const content: DatenschutzContent | null = await getDatenschutzContent();

  if (!content) {
    return (
      <div className={styles.container}>
        <h1>Datenschutz</h1>
        <p>Treść strony jest obecnie niedostępna.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Tytuł strony */}
      <h1 className={styles.title}>{content.title}</h1>

      {/* Główna treść z WYSIWYG */}
      <div className={styles.content}>
        <div dangerouslySetInnerHTML={{ __html: content.content }} />
      </div>
    </div>
  );
}

// app/impressum/page.tsx

import { Metadata } from "next";
import { getImpressumContent } from "@/lib/directus";
import { ImpressumContent } from "@/types";
import styles from "./impressum.module.css";

// Generowanie metadanych dla SEO
export async function generateMetadata(): Promise<Metadata> {
  const content = await getImpressumContent();

  return {
    title: content?.title || "Impressum",
    description: "Impressum - Informacje prawne",
  };
}

export default async function ImpressumPage() {
  const content: ImpressumContent | null = await getImpressumContent();

  if (!content) {
    return (
      <div className={styles.container}>
        <h1>Impressum</h1>
        <p>Treść strony jest obecnie niedostępna.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Tytuł strony */}
      <h1 className={styles.title}>{content.title}</h1>

      {/* Sekcja z podstawowymi informacjami */}
      <div className={styles.infoSection}>
        {/* Adres */}
        <div className={styles.addressSection}>
          <div
            className={styles.addressText}
            dangerouslySetInnerHTML={{
              __html: content.address.replace(/\n/g, "<br>"),
            }}
          />
        </div>

        {/* Email */}
        <div className={styles.emailSection}>
          <a href={`mailto:${content.email}`} className={styles.emailLink}>
            {content.email}
          </a>
        </div>
        <div className={styles.businessInfoTop}>
          <div
            dangerouslySetInnerHTML={{
              __html: content.business_info_top.replace(/\n/g, "<br>"),
            }}
          />
        </div>
        {/* Informacje o firmie na dole */}
        <div className={styles.businessInfoBottom}>
          <div
            dangerouslySetInnerHTML={{
              __html: content.business_info_bottom.replace(/\n/g, "<br>"),
            }}
          />
        </div>
      </div>

      {/* Treść prawna z WYSIWYG */}
      <div className={styles.legalContent}>
        <div dangerouslySetInnerHTML={{ __html: content.legal_content }} />
      </div>
    </div>
  );
}

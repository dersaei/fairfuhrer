// app/impressum/page.tsx

import { Metadata } from "next";
import { getImpressumContent } from "@/lib/directus";
import { ImpressumContent } from "@/types";
import styles from "./impressum.module.css";

// Metadaten für SEO
export async function generateMetadata(): Promise<Metadata> {
  const content = await getImpressumContent();

  return {
    title: content?.title || "Impressum",
    description: "Impressum - Rechtliche Informationen",
  };
}

export default async function ImpressumPage() {
  const content: ImpressumContent | null = await getImpressumContent();

  if (!content) {
    return (
      <div className={styles.container}>
        <h1>Impressum</h1>
        <p>Der Seiteninhalt ist derzeit nicht verfügbar.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Seitentitel */}
      <h1 className={styles.title}>{content.title}</h1>

      {/* Basisinformationen */}
      <div className={styles.infoSection}>
        {/* Adresse */}
        <div className={styles.addressSection}>
          <div
            className={styles.addressText}
            dangerouslySetInnerHTML={{
              __html: content.address.replace(/\n/g, "<br>"),
            }}
          />
        </div>

        {/* E-Mail */}
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
        {/* Unternehmensinfo unten */}
        <div className={styles.businessInfoBottom}>
          <div
            dangerouslySetInnerHTML={{
              __html: content.business_info_bottom.replace(/\n/g, "<br>"),
            }}
          />
        </div>
      </div>

      {/* Rechtlicher Inhalt WYSIWYG */}
      <div className={styles.legalContent}>
        <div dangerouslySetInnerHTML={{ __html: content.legal_content }} />
      </div>

      {/* Technische Umsetzung */}
      {content.webseitenerstellung && (
        <div className={styles.legalContent}>
          <div dangerouslySetInnerHTML={{ __html: content.webseitenerstellung }} />
        </div>
      )}
    </div>
  );
}

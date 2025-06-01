// app/ueber-uns/page.tsx
import { Metadata } from "next";
import type { PageContent } from "../../types";
import styles from "./ueber-uns.module.css";

interface DirectusResponse<T> {
  data: T[];
}

async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const directusUrl = process.env.DIRECTUS_URL;
    if (!directusUrl) {
      throw new Error("DIRECTUS_URL not configured");
    }

    const response = await fetch(
      `${directusUrl}/items/page_content?filter[page_slug][_eq]=${slug}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch page content: ${response.status}`);
    }

    const result: DirectusResponse<PageContent> = await response.json();

    return result.data[0] || null;
  } catch (error) {
    console.error("Error fetching page content:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageContent("ueber-uns");

  return {
    title: pageData?.title || "Über uns - Fair Guide",
    description: "Erfahren Sie mehr über Fair Guide und unser Team.",
  };
}

export default async function UeberUnsPage() {
  const pageData = await getPageContent("ueber-uns");

  if (!pageData) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Seite nicht gefunden</h1>
          <p>Die angeforderte Seite konnte nicht geladen werden.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>{pageData.title}</h1>
        </header>

        <section className={styles.introSection}>
          <div
            className={styles.introText}
            dangerouslySetInnerHTML={{
              __html: pageData.intro_text,
            }}
          />
        </section>
      </div>
    </div>
  );
}

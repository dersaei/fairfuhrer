// app/ueber-uns/page.tsx
import { Metadata } from "next";
import type { PageContent } from "../../types";
import styles from "./ueber-uns.module.css";

// ✅ Cache na 24 godziny - treść strony zmienia się rzadko
export const revalidate = 86400;

interface DirectusResponse<T> {
  data: T[];
}

async function getPageContent(slug: string): Promise<PageContent | null> {
  try {
    const directusUrl = process.env.DIRECTUS_URL;
    if (!directusUrl) {
      throw new Error("DIRECTUS_URL not configured");
    }

    // ✅ Pobierz wszystkie pola
    const response = await fetch(
      `${directusUrl}/items/page_content?filter[page_slug][_eq]=${slug}&fields=*&limit=1`
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

  // Tworzenie tablicy kwadratów z danych Directus
  const squares = [
    {
      title: pageData.square1_title,
      description: pageData.square1_description,
      color: pageData.square1_color || "#ff6b6b",
    },
    {
      title: pageData.square2_title,
      description: pageData.square2_description,
      color: pageData.square2_color || "#4ecdc4",
    },
    {
      title: pageData.square3_title,
      description: pageData.square3_description,
      color: pageData.square3_color || "#45b7d1",
    },
    {
      title: pageData.square4_title,
      description: pageData.square4_description,
      color: pageData.square4_color || "#f9ca24",
    },
    {
      title: pageData.square5_title,
      description: pageData.square5_description,
      color: pageData.square5_color || "#6c5ce7",
    },
    {
      title: pageData.square6_title,
      description: pageData.square6_description,
      color: pageData.square6_color || "#a29bfe",
    },
    {
      title: pageData.square7_title,
      description: pageData.square7_description,
      color: pageData.square7_color || "#fd79a8",
    },
  ].filter((square) => square.title && square.description); // Pokazuj tylko wypełnione kwadraty

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section className={styles.sekcja1}>
          <header className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{pageData.title}</h1>
          </header>

          <div className={styles.introSection}>
            <div
              className={styles.introText}
              dangerouslySetInnerHTML={{
                __html: pageData.intro_text,
              }}
            />
          </div>
        </section>

        {/* SEKCJA KWADRATÓW z Directus */}
        {squares.length > 0 && (
          <section className={styles.categoriesSection}>
            <h2 className={styles.categoriesTitle}>
              {pageData.categories_section_title}
            </h2>
            <p className={styles.categoriesSubtitle}>
              {pageData.categories_section_subtitle}
            </p>

            <div className={styles.categoriesGrid}>
              {squares.map((square, index) => (
                <div
                  key={index}
                  className={styles.categoryCard}
                  style={{ backgroundColor: square.color }}
                >
                  <h3 className={styles.categoryName}>{square.title}</h3>
                  <p className={styles.categoryDescription}>
                    {square.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

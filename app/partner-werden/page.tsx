// app/partner-werden/page.tsx - zmodyfikowana wersja
import { Metadata } from "next";
import Image from "next/image";
import type { PartnerPageContent } from "../../types";
import { getPageAssetPath } from "../../lib/supabase";
import YouTubeEmbed from "../../components/YouTubeEmbed";
import PartnerForm from "../../components/PartnerForm";
import styles from "./partner-werden.module.css";

export const revalidate = 86400;

interface DirectusResponse<T> {
  data: T[];
}

async function getPartnerPageContent(): Promise<PartnerPageContent | null> {
  try {
    const directusUrl = process.env.DIRECTUS_URL;
    if (!directusUrl) {
      throw new Error("DIRECTUS_URL not configured");
    }

    const response = await fetch(
      `${directusUrl}/items/partner_page_content?filter[page_slug][_eq]=partner-werden&fields=*&limit=1`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch partner page content: ${response.status}`
      );
    }

    const result: DirectusResponse<PartnerPageContent> = await response.json();
    return result.data[0] || null;
  } catch (error) {
    console.error("Error fetching partner page content:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Partner werden",
    description:
      "Werden Sie unser Partner und profitieren Sie von unserem Netzwerk.",
  };
}

export default async function PartnerWerdenPage() {
  const pageData = await getPartnerPageContent();

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
      {/* SEKCJA 1 - ZMODYFIKOWANA: Teraz na całą szerokość */}
      <section
        className={styles.section1}
        style={{
          backgroundColor:
            pageData.section1_right_background_color || undefined,
          color: pageData.section1_right_text_color || undefined,
        }}
      >
        {pageData.section1_right_title && (
          <h1
            className={styles.section1Title}
            style={{
              color:
                pageData.section1_right_title_color ||
                pageData.section1_right_text_color ||
                undefined,
            }}
          >
            {pageData.section1_right_title}
          </h1>
        )}
        {pageData.section1_right_text && (
          <div
            className={styles.section1Text}
            dangerouslySetInnerHTML={{ __html: pageData.section1_right_text }}
          />
        )}
        {pageData.section1_right_image && (
          <div className={styles.section1ImageContainer}>
            <Image
              src={getPageAssetPath(pageData.section1_right_image)}
              alt="Partnerschaft"
              width={300}
              height={90}
              className={styles.section1Image}
            />
          </div>
        )}
      </section>

      {/* SEKCJA 2 - USUNIĘTA CAŁKOWICIE */}

      {/* SEKCJA 3 - Tekst + YouTube (bez zmian, ale numeracja przesunięta) */}
      <section
        className={styles.section3}
        style={{
          backgroundColor: pageData.section3_background_color || undefined,
          color: pageData.section3_text_color || undefined,
        }}
      >
        <div className={styles.section3Left}>
          {pageData.section3_left_title && (
            <h2
              className={styles.section3Title}
              style={{
                color:
                  pageData.section3_title_color ||
                  pageData.section3_text_color ||
                  undefined,
              }}
            >
              {pageData.section3_left_title}
            </h2>
          )}
          {pageData.section3_left_text && (
            <div
              className={styles.section3Text}
              dangerouslySetInnerHTML={{ __html: pageData.section3_left_text }}
            />
          )}
        </div>

        <div className={styles.section3Right}>
          {pageData.section3_youtube_url && (
            <YouTubeEmbed
              url={pageData.section3_youtube_url}
              title="Partner werden Video"
              className={styles.youtubeVideo}
            />
          )}
        </div>
      </section>

      {/* SEKCJA 4 - FORMULARZ PARTNERSKI (bez zmian) */}
      <section
        className={styles.section4}
        style={{
          backgroundColor: pageData.section4_background_color || undefined,
          color: pageData.section4_text_color || undefined,
        }}
      >
        {pageData.section4_title && (
          <h2 className={styles.section4Title}>{pageData.section4_title}</h2>
        )}
        {pageData.section4_subtitle && (
          <div
            className={styles.section4Subtitle}
            dangerouslySetInnerHTML={{ __html: pageData.section4_subtitle }}
          />
        )}

        <div className={styles.partnerFormContainer}>
          <PartnerForm />
        </div>
      </section>

      {/* SEKCJA 5 - Końcowa (bez zmian) */}
      {(pageData.section5_title || pageData.section5_text) && (
        <section
          className={styles.section5}
          style={{
            backgroundColor: pageData.section5_background_color || undefined,
            color: pageData.section5_text_color || undefined,
          }}
        >
          {pageData.section5_title && (
            <h2
              className={styles.section5Title}
              style={{
                color:
                  pageData.section5_title_color ||
                  pageData.section5_text_color ||
                  undefined,
              }}
            >
              {pageData.section5_title}
            </h2>
          )}
          {pageData.section5_text && (
            <div
              className={styles.section5Text}
              dangerouslySetInnerHTML={{ __html: pageData.section5_text }}
            />
          )}
          {pageData.section5_image && (
            <div className={styles.section5ImageContainer}>
              <Image
                src={getPageAssetPath(pageData.section5_image)}
                alt="Partner werden"
                width={300}
                height={90}
                className={styles.section5Image}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

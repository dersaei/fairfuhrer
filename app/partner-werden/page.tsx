// app/partner-werden/page.tsx - zaktualizowana wersja z nowym formularzem
import { Metadata } from "next";
import Image from "next/image";
import type { PartnerPageContent } from "../../types";
import { getPageAssetPath } from "../../lib/supabase";
import YouTubeEmbed from "../../components/YouTubeEmbed";
import PartnerForm from "../../components/PartnerForm"; // NOWY FORMULARZ
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
    title: "Partner werden - Fair Guide",
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
      {/* SEKCJA 1 - Grid dwukolumnowy z dynamicznymi kolorami */}
      <section className={styles.section1}>
        <div
          className={styles.section1Left}
          style={{
            backgroundColor:
              pageData.section1_left_background_color || undefined,
            color: pageData.section1_left_text_color || undefined,
          }}
        >
          {pageData.section1_left_title && (
            <h1 className={styles.section1Title}>
              {pageData.section1_left_title}
            </h1>
          )}
          {pageData.section1_left_text && (
            <div
              className={styles.section1Text}
              dangerouslySetInnerHTML={{ __html: pageData.section1_left_text }}
            />
          )}
        </div>

        <div
          className={styles.section1Right}
          style={{
            backgroundColor:
              pageData.section1_right_background_color || undefined,
            color: pageData.section1_right_text_color || undefined,
          }}
        >
          {pageData.section1_right_title && (
            <h2
              className={styles.section1RightTitle}
              style={{
                color:
                  pageData.section1_right_title_color ||
                  pageData.section1_right_text_color ||
                  undefined,
              }}
            >
              {pageData.section1_right_title}
            </h2>
          )}
          {pageData.section1_right_text && (
            <div
              className={styles.section1TextRight}
              dangerouslySetInnerHTML={{ __html: pageData.section1_right_text }}
            />
          )}
          {pageData.section1_right_image && (
            <div className={styles.section1ImageContainer}>
              <Image
                src={getPageAssetPath(pageData.section1_right_image)}
                alt="Partnerschaft"
                width={300}
                height={200}
                className={styles.section1SmallImage}
              />
            </div>
          )}
        </div>
      </section>

      {/* SEKCJA 2 - Tekst na tle obrazu z dynamicznym overlay */}
      {pageData.section2_background_image && (
        <section
          className={styles.section2}
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media-files/assets/pages/${pageData.section2_background_image})`,
          }}
        >
          {/* Dynamiczny overlay */}
          <div
            className={styles.section2Overlay}
            style={{
              backgroundColor:
                pageData.section2_overlay_color || "rgba(0, 0, 0, 0.5)",
              opacity: pageData.section2_overlay_opacity || 0.5,
            }}
          />

          <div
            className={styles.section2Content}
            style={{
              color: pageData.section2_text_color || undefined,
            }}
          >
            {pageData.section2_title && (
              <h2 className={styles.section2Title}>
                {pageData.section2_title}
              </h2>
            )}
            {pageData.section2_text && (
              <div
                className={styles.section2Text}
                dangerouslySetInnerHTML={{ __html: pageData.section2_text }}
              />
            )}
          </div>
        </section>
      )}

      {/* SEKCJA 3 - Tekst + YouTube z dynamicznymi kolorami */}
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

      {/* SEKCJA 4 - NOWY FORMULARZ PARTNERSKI z dynamicznymi kolorami */}
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
          <p className={styles.section4Subtitle}>
            {pageData.section4_subtitle}
          </p>
        )}

        <div className={styles.partnerFormContainer}>
          <PartnerForm />
        </div>
      </section>

      {/* SEKCJA 5 - Końcowa z dynamicznymi kolorami */}
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

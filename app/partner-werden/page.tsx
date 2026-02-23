// app/partner-werden/page.tsx - Z CONDITIONAL MUX VIDEO
import { Metadata } from "next";
import Image from "next/image";
import type { PartnerPageContent } from "../../types";
import { getPageAssetPath } from "../../lib/supabase";
import PartnerForm from "../../components/PartnerForm";
import MuxVideoEmbed from "../../components/MuxVideoEmbed";
import { ConditionalMuxVideo } from "../../components/ConditionalMuxVideo";
import styles from "./partner-werden.module.css";

export const revalidate = 604800; // 7 dni fallback, główna rewalidacja przez Directus Flow

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
      `${directusUrl}/items/partner_page_content?filter[page_slug][_eq]=partner-werden&fields=*&limit=1`,
      { next: { tags: ["partner-werden"] } },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch partner page content: ${response.status}`,
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
      {/* SEKCJA 1 */}
      <section
        className={styles.section1}
        style={{
          backgroundColor: pageData.section1_background_color || undefined,
          color: pageData.section1_text_color || undefined,
        }}
      >
        {pageData.section1_title && (
          <h1
            className={styles.section1Title}
            style={{
              color:
                pageData.section1_title_color ||
                pageData.section1_text_color ||
                undefined,
            }}
          >
            {pageData.section1_title}
          </h1>
        )}
        {pageData.section1_text && (
          <div
            className={styles.section1Text}
            dangerouslySetInnerHTML={{ __html: pageData.section1_text }}
          />
        )}
        {pageData.section1_image && (
          <div className={styles.section1ImageContainer}>
            <Image
              src={getPageAssetPath(pageData.section1_image)}
              alt="Partnerschaft"
              width={300}
              height={90}
              className={styles.section1Image}
            />
          </div>
        )}
      </section>

      {/* SEKCJA 2 - MUX VIDEO OWRAPOWANE W CONDITIONAL MUX VIDEO */}
      <section
        className={styles.section3}
        style={{
          backgroundColor: pageData.section2_background_color || undefined,
          color: pageData.section2_text_color || undefined,
        }}
      >
        <div className={styles.section3Left}>
          {pageData.section2_left_title && (
            <h2
              className={styles.section3Title}
              style={{
                color:
                  pageData.section2_title_color ||
                  pageData.section2_text_color ||
                  undefined,
              }}
            >
              {pageData.section2_left_title}
            </h2>
          )}
          {pageData.section2_left_text && (
            <div
              className={styles.section3Text}
              dangerouslySetInnerHTML={{ __html: pageData.section2_left_text }}
            />
          )}
        </div>

        <div className={styles.section3Right}>
          {pageData.section2_mux_playback_id ? (
            <ConditionalMuxVideo>
              <MuxVideoEmbed
                playbackId={pageData.section2_mux_playback_id}
                poster={pageData.section2_video_poster}
                autoPlay={false}
                muted={false}
                className={styles.muxVideo}
              />
            </ConditionalMuxVideo>
          ) : (
            <div className={styles.noVideo}>
              <p>🎬 Video wird konfiguriert</p>
              <p>Kontaktieren Sie den Administrator</p>
            </div>
          )}
        </div>
      </section>

      {/* SEKCJA 3 - FORMULARZ */}
      <section
        className={styles.section4}
        style={{
          backgroundColor: pageData.section3_background_color || undefined,
        }}
      >
        {pageData.section3_text && (
          <div
            className={styles.section4Subtitle}
            dangerouslySetInnerHTML={{ __html: pageData.section3_text }}
          />
        )}
      </section>

      {/* SEKCJA 4 - FORMULARZ PARTNERSKI */}
      <section
        className={styles.section5}
        style={{
          backgroundColor: pageData.section4_background_color || undefined,
        }}
      >
        <div className={styles.partnerFormContainer}>
          <PartnerForm />
        </div>
      </section>

      {/* SEKCJA 5 - KOŃCOWA */}
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
                fill
                className={styles.section5Image}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

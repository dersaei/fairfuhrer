// app/partner-werden/page.tsx - Z CONDITIONAL MUX VIDEO
import { Metadata } from "next";
import type { PartnerPageContent } from "../../types";
import MuxVideoEmbed from "../../components/MuxVideoEmbed";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
import { ConditionalMuxVideo } from "../../components/ConditionalMuxVideo";
import Link from "next/link";
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
      `${directusUrl}/items/partner_page_content?fields=*&limit=1`,
      { next: { tags: ["partner-werden"] } },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch partner page content: ${response.status}`,
      );
    }

    const result: DirectusResponse<PartnerPageContent> = await response.json();
    return (Array.isArray(result.data) ? result.data[0] : result.data) || null;
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
        {pageData.bild_1 && (
          <div className={styles.section1ImageContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${directusUrl}/assets/${pageData.bild_1}`}
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

      {/* ABSCHNITT 3 - dwukolumnowy: 40% tytuł (lewa) | 60% tekst (prawa) */}
      {(pageData.abschnitt_3_titel || pageData.abschnitt_3_text) && (
        <section className={styles.abschnitt3}>
          <div
            className={styles.abschnitt3Links}
            style={{
              backgroundColor:
                pageData.abschnitt_3_hintergrundfarbe_links || undefined,
            }}
          >
            {pageData.abschnitt_3_titel && (
              <h2
                className={styles.abschnitt3Titel}
                style={{
                  color: pageData.abschnitt_3_titel_farbe || undefined,
                }}
              >
                {pageData.abschnitt_3_titel}
              </h2>
            )}
          </div>
          <div
            className={styles.abschnitt3Rechts}
            style={{
              backgroundColor:
                pageData.abschnitt_3_hintergrundfarbe_rechts || undefined,
            }}
          >
            {pageData.abschnitt_3_text && (
              <div
                className={styles.abschnitt3Text}
                style={{ color: pageData.abschnitt_3_text_farbe || undefined }}
                dangerouslySetInnerHTML={{ __html: pageData.abschnitt_3_text }}
              />
            )}
          </div>
        </section>
      )}

      {/* ABSCHNITT 4 - dwie karty obok siebie */}
      {(pageData.abschnitt_4_text_links ||
        pageData.abschnitt_4_text_rechts) && (
        <section
          className={styles.abschnitt4}
          style={{
            backgroundColor: pageData.abschnitt_4_hintergrundfarbe || undefined,
          }}
        >
          <div className={styles.abschnitt4KarteLinks}>
            {pageData.abschnitt_4_text_links && (
              <div
                className={styles.abschnitt4Text}
                dangerouslySetInnerHTML={{
                  __html: pageData.abschnitt_4_text_links,
                }}
              />
            )}
          </div>
          <div className={styles.abschnitt4KarteRechts}>
            {pageData.abschnitt_4_text_rechts && (
              <div
                className={styles.abschnitt4Text}
                dangerouslySetInnerHTML={{
                  __html: pageData.abschnitt_4_text_rechts,
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* ABSCHNITT 5 - pełna szerokość + tytuł/tekst + 4 karty */}
      {(pageData.abschnitt_5_titel ||
        pageData.abschnitt_5_text ||
        pageData.abschnitt_5_1 ||
        pageData.abschnitt_5_2 ||
        pageData.abschnitt_5_3 ||
        pageData.abschnitt_5_4) && (
        <section
          className={styles.abschnitt5}
          style={{
            backgroundColor: pageData.abschnitt_5_hintergrundfarbe || undefined,
            color: pageData.abschnitt_5_text_farbe || undefined,
          }}
        >
          {pageData.abschnitt_5_titel && (
            <h2
              className={styles.abschnitt5Titel}
              style={{ color: pageData.abschnitt_5_titel_farbe || undefined }}
            >
              {pageData.abschnitt_5_titel}
            </h2>
          )}
          {pageData.abschnitt_5_text && (
            <div
              className={styles.abschnitt5Text}
              dangerouslySetInnerHTML={{ __html: pageData.abschnitt_5_text }}
            />
          )}
          {(pageData.abschnitt_5_1 ||
            pageData.abschnitt_5_2 ||
            pageData.abschnitt_5_3 ||
            pageData.abschnitt_5_4) && (
            <div className={styles.abschnitt5Karten}>
              {[
                pageData.abschnitt_5_1,
                pageData.abschnitt_5_2,
                pageData.abschnitt_5_3,
                pageData.abschnitt_5_4,
              ].map(
                (karte, i) =>
                  karte && (
                    <div
                      key={i}
                      className={styles.abschnitt5Karte}
                      dangerouslySetInnerHTML={{ __html: karte }}
                    />
                  ),
              )}
            </div>
          )}
          {pageData.button_parner_werden && pageData.url_button_partner_werden && (
            <div className={styles.ctaRow}>
              <Link
                href={pageData.url_button_partner_werden}
                className={styles.ctaButton}
                style={{ backgroundColor: pageData.color_button_partner_werden || undefined }}
              >
                {pageData.button_parner_werden}
              </Link>
            </div>
          )}
        </section>
      )}

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
          {pageData.bild_2 && (
            <div className={styles.section5ImageContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${directusUrl}/assets/${pageData.bild_2}`}
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

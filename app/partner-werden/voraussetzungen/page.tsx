// app/partner-werden/voraussetzungen/page.tsx
// Unterseite: Voraussetzungen für eine Partnerschaft + Standard vs Partner Pin + Preise.
// Holt Daten aus derselben Kolekcja `partner_page_content` (felder voraussetzungen_*,
// pin_vergleich_*, kosten_*, cta_button_*).

import { Metadata } from "next";
import Link from "next/link";
import type { PartnerPageContent } from "../../../types";
import styles from "./voraussetzungen.module.css";

export const revalidate = 604800;

interface DirectusResponse<T> {
  data: T[];
}

async function getPartnerPageContent(): Promise<PartnerPageContent | null> {
  try {
    const baseUrl = process.env.DIRECTUS_URL;
    if (!baseUrl) {
      throw new Error("DIRECTUS_URL not configured");
    }

    const response = await fetch(
      `${baseUrl}/items/partner_page_content?fields=*&limit=1`,
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

export const metadata: Metadata = {
  title: "Voraussetzungen für eine Partnerschaft",
  description:
    "Voraussetzungen, Pin-Optionen und Preise für eine Partnerschaft beim Fairführer.",
};

export default async function VoraussetzungenPage() {
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
    <main className={styles.main}>
      {/* Back link to Mitmachen */}
      <div className={styles.backLinkWrapper}>
        <Link href="/partner-werden" className={styles.backLink}>
          ← Zurück zu Mitmachen
        </Link>
      </div>

      {/* SEKCJA 1 — Voraussetzungen (dwukolumnowy: 40% tytuł | 60% tekst) */}
      {(pageData.voraussetzungen_title || pageData.voraussetzungen_text) && (
        <section className={styles.voraussetzungen}>
          <div
            className={styles.voraussetzungenLinks}
            style={{
              backgroundColor:
                pageData.voraussetzungen_left_background || "#000000",
            }}
          >
            {pageData.voraussetzungen_title && (
              <h2
                className={styles.voraussetzungenTitle}
                style={{
                  color: pageData.voraussetzungen_title_color || "#FFFFFF",
                }}
              >
                {pageData.voraussetzungen_title}
              </h2>
            )}
          </div>
          <div
            className={styles.voraussetzungenRechts}
            style={{
              backgroundColor:
                pageData.voraussetzungen_right_background || "#FFFFFF",
            }}
          >
            {pageData.voraussetzungen_text && (
              <div
                className={styles.voraussetzungenText}
                style={{
                  color: pageData.voraussetzungen_text_color || "#000000",
                }}
                dangerouslySetInnerHTML={{
                  __html: pageData.voraussetzungen_text,
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* SEKCJA 2 — Pin-Vergleich (Standard vs Partner Pin) */}
      {(pageData.pin_vergleich_standard_text ||
        pageData.pin_vergleich_partner_text) && (
        <section
          className={styles.pinVergleich}
          style={{
            backgroundColor: pageData.pin_vergleich_background || "#FC6C14",
          }}
        >
          <div className={styles.pinVergleichKarteLinks}>
            {pageData.pin_vergleich_standard_text && (
              <div
                className={styles.pinVergleichText}
                dangerouslySetInnerHTML={{
                  __html: pageData.pin_vergleich_standard_text,
                }}
              />
            )}
          </div>
          <div className={styles.pinVergleichKarteRechts}>
            {pageData.pin_vergleich_partner_text && (
              <div
                className={styles.pinVergleichText}
                dangerouslySetInnerHTML={{
                  __html: pageData.pin_vergleich_partner_text,
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* SEKCJA 3 — Kosten (tytuł + intro + 4 karty cen) */}
      {(pageData.kosten_title ||
        pageData.kosten_intro ||
        pageData.kosten_tier_1 ||
        pageData.kosten_tier_2 ||
        pageData.kosten_tier_3 ||
        pageData.kosten_tier_4) && (
        <section
          className={styles.kosten}
          style={{
            backgroundColor: pageData.kosten_background || "#000000",
            color: pageData.kosten_text_color || "#FFFFFF",
          }}
        >
          {pageData.kosten_title && (
            <h2
              className={styles.kostenTitle}
              style={{ color: pageData.kosten_title_color || "#FFFFFF" }}
            >
              {pageData.kosten_title}
            </h2>
          )}
          {pageData.kosten_intro && (
            <div
              className={styles.kostenIntro}
              dangerouslySetInnerHTML={{ __html: pageData.kosten_intro }}
            />
          )}
          {(pageData.kosten_tier_1 ||
            pageData.kosten_tier_2 ||
            pageData.kosten_tier_3 ||
            pageData.kosten_tier_4) && (
            <div className={styles.kostenKarten}>
              {[
                pageData.kosten_tier_1,
                pageData.kosten_tier_2,
                pageData.kosten_tier_3,
                pageData.kosten_tier_4,
              ].map(
                (karte, i) =>
                  karte && (
                    <div
                      key={i}
                      className={styles.kostenKarte}
                      dangerouslySetInnerHTML={{ __html: karte }}
                    />
                  ),
              )}
            </div>
          )}
          {pageData.cta_button_label && pageData.cta_button_url && (
            <div className={styles.ctaRow}>
              <Link
                href={pageData.cta_button_url}
                className={styles.ctaButton}
                style={{ color: pageData.cta_button_color || "#FFFFFF" }}
              >
                {pageData.cta_button_label}
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

// app/partner-werden/page.tsx
// Mitmachen-Seite (Layout wie Homepage: Bild links, Orange-Box rechts + 3 Buttons).
// Drei detaillierte Sektionen darunter (Reisende, Partner, Redaktion).
// Voraussetzungen + Pin-Vergleich + Preise wurden auf die Unterseite
// /partner-werden/voraussetzungen verschoben.

import { Metadata } from "next";
import Link from "next/link";
import { marked } from "marked";
import type { PartnerPageContent } from "../../types";
import styles from "./partner-werden.module.css";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

export const revalidate = 604800; // 7 dni fallback, główna rewalidacja przez Directus Flow

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
  title: "Mitmachen",
  description:
    "Mitmachen beim Fairführer — als Reisende*r, als Partner*in oder in der Redaktion.",
};

export default async function MitmachenPage() {
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

  // Markdown -> HTML (Tashina's Sektionstexte + Hero-Intro)
  const heroIntroHtml = pageData.mitmachen_hero_intro
    ? await marked(pageData.mitmachen_hero_intro)
    : "";
  const reisendeHtml = pageData.mitmachen_reisende_section_text
    ? await marked(pageData.mitmachen_reisende_section_text)
    : "";
  const partnerHtml = pageData.mitmachen_partner_section_text
    ? await marked(pageData.mitmachen_partner_section_text)
    : "";
  const redaktionHtml = pageData.mitmachen_redaktion_section_text
    ? await marked(pageData.mitmachen_redaktion_section_text)
    : "";

  const heroBg = pageData.mitmachen_hero_background_color || "#FC6C14";
  const heroTextColor = pageData.mitmachen_hero_text_color || "#FFFFFF";
  const heroImageSrc = pageData.mitmachen_hero_image
    ? `${directusUrl}/assets/${pageData.mitmachen_hero_image}`
    : null;

  return (
    <main className={styles.main}>
      {/* HERO — Layout wie Homepage: Bild links, Orange-Box rechts mit 3 Buttons */}
      <section className={styles.heroContainer}>
        <div className={styles.heroImageSide}>
          {heroImageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageSrc}
              alt="Mitmachen"
              className={styles.heroImage}
            />
          ) : (
            <div className={styles.heroImagePlaceholder}>
              <p>Bild fehlt — bitte im Directus hochladen.</p>
            </div>
          )}
        </div>

        <div
          className={styles.heroTextSide}
          style={{ backgroundColor: heroBg, color: heroTextColor }}
        >
          {pageData.mitmachen_hero_eyebrow && (
            <p className={styles.heroEyebrow} style={{ color: heroTextColor }}>
              {pageData.mitmachen_hero_eyebrow}
            </p>
          )}
          {pageData.mitmachen_hero_headline && (
            <h1 className={styles.heroHeadline} style={{ color: heroTextColor }}>
              {pageData.mitmachen_hero_headline}
            </h1>
          )}
          {heroIntroHtml && (
            <div
              className={styles.heroIntro}
              style={{ color: heroTextColor }}
              dangerouslySetInnerHTML={{ __html: heroIntroHtml }}
            />
          )}

          {/* 3 buttons */}
          <div className={styles.heroButtons}>
            {pageData.mitmachen_button_1_label && pageData.mitmachen_button_1_url && (
              <Link
                href={pageData.mitmachen_button_1_url}
                className={styles.heroButton}
              >
                {pageData.mitmachen_button_1_label}
              </Link>
            )}
            {pageData.mitmachen_button_2_label && pageData.mitmachen_button_2_url && (
              <Link
                href={pageData.mitmachen_button_2_url}
                className={styles.heroButton}
              >
                {pageData.mitmachen_button_2_label}
              </Link>
            )}
            {pageData.mitmachen_button_3_label && pageData.mitmachen_button_3_url && (
              <Link
                href={pageData.mitmachen_button_3_url}
                className={styles.heroButton}
              >
                {pageData.mitmachen_button_3_label}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SEKTION REISENDE */}
      {(pageData.mitmachen_reisende_section_title || reisendeHtml) && (
        <section
          className={styles.sectionRole}
          id="reisende"
        >
          <div className={styles.sectionInner}>
            {pageData.mitmachen_reisende_section_title && (
              <h2 className={styles.sectionTitle}>
                {pageData.mitmachen_reisende_section_title}
              </h2>
            )}
            {reisendeHtml && (
              <div
                className={styles.sectionText}
                dangerouslySetInnerHTML={{ __html: reisendeHtml }}
              />
            )}
            {pageData.mitmachen_button_1_label && pageData.mitmachen_button_1_url && (
              <Link
                href={pageData.mitmachen_button_1_url}
                className={styles.sectionCta}
              >
                {pageData.mitmachen_button_1_label}
              </Link>
            )}
            {pageData.mitmachen_reisende_link_label &&
              pageData.mitmachen_reisende_link_url && (
                <Link
                  href={pageData.mitmachen_reisende_link_url}
                  className={styles.sectionSecondaryLink}
                >
                  {pageData.mitmachen_reisende_link_label} →
                </Link>
              )}
          </div>
        </section>
      )}

      {/* SEKTION PARTNER */}
      {(pageData.mitmachen_partner_section_title || partnerHtml) && (
        <section
          className={`${styles.sectionRole} ${styles.sectionRoleAlt}`}
          id="partner"
        >
          <div className={styles.sectionInner}>
            {pageData.mitmachen_partner_section_title && (
              <h2 className={styles.sectionTitle}>
                {pageData.mitmachen_partner_section_title}
              </h2>
            )}
            {partnerHtml && (
              <div
                className={styles.sectionText}
                dangerouslySetInnerHTML={{ __html: partnerHtml }}
              />
            )}
            {pageData.mitmachen_button_2_label && pageData.mitmachen_button_2_url && (
              <Link
                href={pageData.mitmachen_button_2_url}
                className={styles.sectionCta}
              >
                {pageData.mitmachen_button_2_label}
              </Link>
            )}
            {pageData.mitmachen_partner_link_label &&
              pageData.mitmachen_partner_link_url && (
                <Link
                  href={pageData.mitmachen_partner_link_url}
                  className={styles.sectionSecondaryLink}
                >
                  {pageData.mitmachen_partner_link_label} →
                </Link>
              )}
          </div>
        </section>
      )}

      {/* SEKTION REDAKTION */}
      {(pageData.mitmachen_redaktion_section_title || redaktionHtml) && (
        <section
          className={styles.sectionRole}
          id="redaktion"
        >
          <div className={styles.sectionInner}>
            {pageData.mitmachen_redaktion_section_title && (
              <h2 className={styles.sectionTitle}>
                {pageData.mitmachen_redaktion_section_title}
              </h2>
            )}
            {redaktionHtml && (
              <div
                className={styles.sectionText}
                dangerouslySetInnerHTML={{ __html: redaktionHtml }}
              />
            )}
            {pageData.mitmachen_button_3_label && pageData.mitmachen_button_3_url && (
              <Link
                href={pageData.mitmachen_button_3_url}
                className={styles.sectionCta}
              >
                {pageData.mitmachen_button_3_label}
              </Link>
            )}
            {pageData.mitmachen_redaktion_link_label &&
              pageData.mitmachen_redaktion_link_url && (
                <Link
                  href={pageData.mitmachen_redaktion_link_url}
                  className={styles.sectionSecondaryLink}
                >
                  {pageData.mitmachen_redaktion_link_label} →
                </Link>
              )}
          </div>
        </section>
      )}
    </main>
  );
}

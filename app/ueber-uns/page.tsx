// app/ueber-uns/page.tsx
// Seite "Über uns" — Die Geschichte hinter dem Fairführer.
// Inhalt aus Directus (ueber_uns_content + prozess_items + werte_items).
// Farben + Schriftgrößen pro Element aus Directus (Fallbacks = Mockup-Werte).

import React from "react";
import { Metadata } from "next";
import { Fragment } from "react";
import { marked } from "marked";
import { getUeberUnsContent } from "@/lib/directus";
import LucideIcon from "@/components/LucideIcon";
import { ArrowRight } from "lucide-react";
import styles from "./ueber-uns.module.css";

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Über uns",
  description:
    "Die Geschichte hinter dem Fairführer — von der ersten Idee zum digitalen Audioguide für faire und nachhaltige Orte.",
};

export default async function UeberUnsPage() {
  const data = await getUeberUnsContent();

  if (!data) {
    return (
      <main className={styles.main}>
        <div className={styles.errorMessage}>
          <h1>Seite nicht gefunden</h1>
          <p>Die angeforderte Seite konnte nicht geladen werden.</p>
        </div>
      </main>
    );
  }

  const md = async (v?: string) => (v ? await marked(v) : "");
  const [
    heroIntroHtml,
    seenergienHtml,
    audioguideHtml,
    handarbeitHtml,
    wachstHtml,
  ] = await Promise.all([
    md(data.hero_intro),
    md(data.seenergien_text),
    md(data.audioguide_text),
    md(data.handarbeit_text),
    md(data.wachst_text),
  ]);
  const werteHtml = await Promise.all(
    (data.werte_items ?? []).map((w) => md(w.text)),
  );

  const c = (val?: string) =>
    val ? (val.startsWith("#") ? val : `#${val}`) : undefined;

  const asset = (id?: string) => (id ? `${directusUrl}/assets/${id}` : null);

  // Stil pro Element: Farbe (mit Fallback) + optionale Schriftgröße.
  const st = (
    color?: string,
    fallback?: string,
    fontSize?: string,
  ): React.CSSProperties => ({
    ...(c(color) || fallback ? { color: c(color) || fallback } : {}),
    ...(fontSize ? { fontSize } : {}),
  });

  // Hintergrund einer Sektion (nur setzen, wenn Wert vorhanden — sonst CSS-Default).
  const bg = (val?: string): React.CSSProperties | undefined =>
    c(val) ? { backgroundColor: c(val) } : undefined;

  const media = (id: string | undefined, alt: string) =>
    asset(id) ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={asset(id) as string} alt={alt} className={styles.sectionImage} />
    ) : (
      <div className={styles.imagePlaceholder}>
        <span>Bild fehlt — bitte im Directus hochladen.</span>
      </div>
    );

  const prozess = data.prozess_items ?? [];
  const werte = data.werte_items ?? [];

  return (
    <main className={styles.main}>
      {/* 1 — HERO */}
      <section className={styles.hero} style={bg(data.hero_background_color)}>
        {asset(data.hero_image) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset(data.hero_image) as string}
            alt=""
            className={styles.heroImage}
          />
        )}
        <div className={styles.heroInner}>
          {data.hero_title && (
            <h1
              className={styles.heroTitle}
              style={st(
                data.hero_title_color,
                "#3e6b4f",
                data.hero_title_font_size,
              )}
            >
              {data.hero_title}
            </h1>
          )}
          {heroIntroHtml && (
            <div
              className={`${styles.heroIntro} ${styles.heroPanel}`}
              style={st(
                data.hero_intro_color,
                "#18222f",
                data.hero_intro_font_size,
              )}
              dangerouslySetInnerHTML={{ __html: heroIntroHtml }}
            />
          )}
        </div>
      </section>

      {/* 2 — SEENERGIEN */}
      {(seenergienHtml || data.seenergien_image || data.seenergien_logo) && (
        <section
          className={styles.seenergien}
          style={bg(data.seenergien_background_color)}
        >
          <div className={styles.seenergienInner}>
            <div className={styles.seenergienText}>
              {seenergienHtml && (
                <div
                  style={st(
                    data.seenergien_text_color,
                    "#18222f",
                    data.seenergien_text_font_size,
                  )}
                  dangerouslySetInnerHTML={{ __html: seenergienHtml }}
                />
              )}
            </div>
            <div className={styles.seenergienLogo}>
              {asset(data.seenergien_logo) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset(data.seenergien_logo) as string}
                  alt="Seenergien"
                  className={styles.seenergienLogoImg}
                />
              )}
              {data.seenergien_caption && (
                <span
                  className={styles.seenergienCaption}
                  style={st(
                    data.seenergien_caption_color,
                    "#555555",
                    data.seenergien_caption_font_size,
                  )}
                >
                  {data.seenergien_caption}
                </span>
              )}
            </div>
            <div className={styles.seenergienMedia}>
              {media(data.seenergien_image, "Seenergien")}
            </div>
          </div>
        </section>
      )}

      {/* 3 — AUDIOGUIDE (Bild links | Text rechts) */}
      {(audioguideHtml || data.audioguide_title) && (
        <section className={styles.split}>
          <div className={styles.splitMedia}>
            {media(data.audioguide_image, "Audioguide")}
          </div>
          <div className={styles.splitText}>
            {data.audioguide_title && (
              <h2
                className={styles.sectionTitle}
                style={st(
                  data.audioguide_title_color,
                  "#3e6b4f",
                  data.audioguide_title_font_size,
                )}
              >
                {data.audioguide_title}
              </h2>
            )}
            {audioguideHtml && (
              <div
                className={styles.prose}
                style={st(
                  data.audioguide_text_color,
                  "#18222f",
                  data.audioguide_text_font_size,
                )}
                dangerouslySetInnerHTML={{ __html: audioguideHtml }}
              />
            )}
          </div>
        </section>
      )}

      {/* 4 — HANDARBEIT (Text links | Bild rechts) */}
      {(handarbeitHtml || data.handarbeit_image) && (
        <section className={`${styles.split} ${styles.splitReverse}`}>
          <div className={styles.splitMedia}>
            {media(data.handarbeit_image, "Team")}
          </div>
          <div className={styles.splitText}>
            {handarbeitHtml && (
              <div
                className={styles.prose}
                style={st(
                  data.handarbeit_text_color,
                  "#18222f",
                  data.handarbeit_text_font_size,
                )}
                dangerouslySetInnerHTML={{ __html: handarbeitHtml }}
              />
            )}
          </div>
        </section>
      )}

      {/* 5 — WÄCHST + PROZESS (Bild links | Text+Prozess rechts) */}
      {(wachstHtml || data.wachst_title || prozess.length > 0) && (
        <section className={styles.split}>
          <div className={styles.splitMedia}>
            {media(data.wachst_image, "Fairführer")}
          </div>
          <div className={styles.splitText}>
            {data.wachst_title && (
              <h2
                className={styles.sectionTitle}
                style={st(
                  data.wachst_title_color,
                  "#3e6b4f",
                  data.wachst_title_font_size,
                )}
              >
                {data.wachst_title}
              </h2>
            )}
            {wachstHtml && (
              <div
                className={styles.prose}
                style={st(
                  data.wachst_text_color,
                  "#18222f",
                  data.wachst_text_font_size,
                )}
                dangerouslySetInnerHTML={{ __html: wachstHtml }}
              />
            )}
            {prozess.length > 0 && (
              <div className={styles.prozess}>
                {prozess.map((step, i) => (
                  <Fragment key={step.id}>
                    <div className={styles.prozessStep}>
                      <div className={styles.prozessIcon}>
                        <LucideIcon name={step.icon} size={32} />
                      </div>
                      {step.label && (
                        <span
                          className={styles.prozessLabel}
                          style={st(
                            data.prozess_label_color,
                            "#18222f",
                            data.prozess_label_font_size,
                          )}
                        >
                          {step.label}
                        </span>
                      )}
                    </div>
                    {i < prozess.length - 1 && (
                      <ArrowRight
                        className={styles.prozessArrow}
                        size={24}
                        aria-hidden
                      />
                    )}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6 — WERTE (Titel + 3 Spalten) */}
      {(data.werte_title || werte.length > 0) && (
        <section className={styles.werte} style={bg(data.werte_background_color)}>
          {data.werte_title && (
            <h2
              className={styles.werteTitle}
              style={st(
                data.werte_title_color,
                "#3e6b4f",
                data.werte_title_font_size,
              )}
            >
              {data.werte_title}
            </h2>
          )}
          {werte.length > 0 && (
            <div className={styles.werteGrid}>
              {werte.map((w, i) => (
                <div key={w.id} className={styles.werteCard}>
                  <div className={styles.werteIcon}>
                    <LucideIcon name={w.icon} size={40} />
                  </div>
                  {w.title && (
                    <h3
                      className={styles.werteCardTitle}
                      style={st(
                        data.werte_card_title_color,
                        "#fc6c14",
                        data.werte_card_title_font_size,
                      )}
                    >
                      {w.title}
                    </h3>
                  )}
                  {werteHtml[i] && (
                    <div
                      className={styles.werteCardText}
                      style={st(
                        data.werte_card_text_color,
                        "#444444",
                        data.werte_card_text_font_size,
                      )}
                      dangerouslySetInnerHTML={{ __html: werteHtml[i] }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </main>
  );
}

// app/kontakt/ContactInfo.tsx
import { ContactInfoContent } from "@/types";
import styles from "./ContactInfo.module.css";

// ---------------------------------------------------------------------------
// Markdown parser — obsługuje bloki "## Nagłówek\nTekst" oddzielone pustą linią
// ---------------------------------------------------------------------------
interface FeatureBlock {
  heading: string | null;
  body: string;
}

function parseFeatureBlocks(markdown: string): FeatureBlock[] {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      if (lines[0].startsWith("## ")) {
        return {
          heading: lines[0].slice(3).trim(),
          body: lines.slice(1).join(" ").trim(),
        };
      }
      return { heading: null, body: lines.join(" ").trim() };
    });
}

// ---------------------------------------------------------------------------
// Domyślna treść (fallback gdy brak rekordu w Directus)
// ---------------------------------------------------------------------------
const DEFAULTS = {
  background_color: "#fc6c14",
  title: "Über uns",
  title_color: "black",
  title_font_size: "4rem",
  title_text_shadow: "1px 2px 2px white",
  intro_features: `## Lokale Entdeckung
Wir helfen Menschen dabei, versteckte Schätze in ihrer Umgebung zu entdecken.

## Gemeinschaft stärken
Unser Netzwerk verbindet gleichgesinnte Menschen und faire Unternehmen.

## Faire Praktiken
Wir fördern Transparenz und Fairness in der Geschäftswelt.`,
  features_h2_color: "white",
  features_h2_font_size: "1.5rem",
  features_h2_text_shadow: "1px 2px 2px black",
  features_p_color: "white",
  features_p_font_size: "1.125rem",
};

// ---------------------------------------------------------------------------
// Komponent
// ---------------------------------------------------------------------------
export default function ContactInfo({
  content,
}: {
  content: ContactInfoContent | null;
}) {
  const bg = content?.background_color ?? DEFAULTS.background_color;
  const title = content?.title ?? DEFAULTS.title;
  const titleColor = content?.title_color ?? DEFAULTS.title_color;
  const titleFontSize = content?.title_font_size ?? DEFAULTS.title_font_size;
  const titleTextShadow =
    content?.title_text_shadow ?? DEFAULTS.title_text_shadow;
  const featuresH2Color =
    content?.features_h2_color ?? DEFAULTS.features_h2_color;
  const featuresH2FontSize =
    content?.features_h2_font_size ?? DEFAULTS.features_h2_font_size;
  const featuresH2TextShadowRaw =
    content?.features_h2_text_shadow ?? DEFAULTS.features_h2_text_shadow;
  const featuresH2TextShadow = featuresH2TextShadowRaw
    .replace(/^text-shadow\s*:\s*/i, "")
    .trim();
  const featuresPColor = content?.features_p_color ?? DEFAULTS.features_p_color;
  const featuresPFontSize =
    content?.features_p_font_size ?? DEFAULTS.features_p_font_size;

  const featuresMarkdown = content?.intro_features ?? DEFAULTS.intro_features;
  const featureBlocks = featuresMarkdown
    ? parseFeatureBlocks(featuresMarkdown)
    : [];

  return (
    <div className={styles.contactInfo} style={{ background: bg }}>
      <h1
        style={{
          color: titleColor,
          fontSize: titleFontSize,
          textShadow: titleTextShadow,
        }}
      >
        {title}
      </h1>

      {featureBlocks.length > 0 && (
        <div className={styles.featureCards}>
          {featureBlocks.map((block, i) => (
            <div key={i} className={styles.featureCard}>
              {block.heading && (
                <h2
                  style={{
                    color: featuresH2Color,
                    fontSize: featuresH2FontSize,
                    textShadow: featuresH2TextShadow || undefined,
                  }}
                >
                  {block.heading}
                </h2>
              )}
              {block.body && (
                <p
                  style={{ color: featuresPColor, fontSize: featuresPFontSize }}
                >
                  {block.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

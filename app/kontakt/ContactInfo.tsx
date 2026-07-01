// app/kontakt/ContactInfo.tsx
import { marked } from "marked";
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
// Komponent
// ---------------------------------------------------------------------------
export default async function ContactInfo({
  content,
}: {
  content: ContactInfoContent | null;
}) {
  const featureBlocks = content?.intro_features
    ? parseFeatureBlocks(content.intro_features)
    : [];

  // Seenergien-Text (Markdown -> HTML). Verschoben von der alten Mitmachen-Seite.
  const seenergienHtml = content?.seenergien_text
    ? await marked(content.seenergien_text)
    : "";

  return (
    <div
      className={styles.contactInfo}
      style={{ background: content?.background_color ?? undefined }}
    >
      <h1
        style={{
          color: content?.title_color ?? undefined,
          fontSize: content?.title_font_size ?? undefined,
        }}
      >
        {content?.title}
      </h1>

      {featureBlocks.length > 0 && (
        <div className={styles.featureCards}>
          {featureBlocks.map((block, i) => (
            <div key={i} className={styles.featureCard}>
              {block.heading && (
                <h2
                  style={{
                    color: content?.features_h2_color ?? undefined,
                    fontSize: content?.features_h2_font_size ?? undefined,
                  }}
                >
                  {block.heading}
                </h2>
              )}
              {block.body && (
                <p
                  style={{
                    color: content?.features_p_color ?? undefined,
                    fontSize: content?.features_p_font_size ?? undefined,
                  }}
                >
                  {block.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Seenergien-Sektion (verschoben von der alten Mitmachen-Seite) */}
      {(content?.seenergien_title || seenergienHtml) && (
        <div className={styles.seenergienSection}>
          {content?.seenergien_title && (
            <h2 className={styles.seenergienTitle}>{content.seenergien_title}</h2>
          )}
          {seenergienHtml && (
            <div
              className={styles.seenergienText}
              dangerouslySetInnerHTML={{ __html: seenergienHtml }}
            />
          )}
        </div>
      )}
    </div>
  );
}

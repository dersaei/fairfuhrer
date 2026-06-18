import { getCurrentUser } from "@/app/actions/auth";
import {
  getPremiumPageContent,
  getPremiumComparisonFeatures,
} from "@/lib/directus";
import styles from "./premium.module.css";

// Prosty markdown: **fett** i *kursiv* — spójnie ze stroną Hilfe
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

export default async function PremiumPage() {
  const [user, content, features] = await Promise.all([
    getCurrentUser(),
    getPremiumPageContent(),
    getPremiumComparisonFeatures(),
  ]);

  const premiumUntil = user?.profile?.premium_until
    ? new Date(user.profile.premium_until)
    : null;
  const isPro = premiumUntil ? premiumUntil > new Date() : false;

  const steps = content?.app_box_steps ?? [];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>{content?.title ?? "Fairführer+"}</h3>

      {isPro ? (
        <div className={styles.proActiveBox}>
          <p className={styles.proActiveIcon}>★</p>
          <p className={styles.proActiveTitle}>
            {content?.pro_active_title ?? "Fairführer+ aktiv"}
          </p>
          <p className={styles.proActiveDate}>
            {content?.pro_active_date_label ?? "Gültig bis:"}{" "}
            <strong>
              {premiumUntil!.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </p>
          {content?.pro_active_hint && (
            <p
              className={styles.proActiveHint}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(content.pro_active_hint),
              }}
            />
          )}
        </div>
      ) : (
        content?.lead_text && (
          <p
            className={styles.lead}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content.lead_text),
            }}
          />
        )
      )}

      {features.length > 0 && (
        <div className={styles.comparisonBlock}>
          <h4 className={styles.sectionTitle}>
            {content?.comparison_title ?? "Kostenlos vs. Premium"}
          </h4>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thFeature}>
                  {content?.comparison_th_feature ?? "Funktion"}
                </th>
                <th className={styles.thFree}>
                  {content?.comparison_th_free ?? "Kostenlos"}
                </th>
                <th className={styles.thPro}>
                  {content?.comparison_th_pro ?? "Fairführer+"}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id}>
                  <td>{feature.feature}</td>
                  <td className={feature.free ? styles.check : styles.cross}>
                    {feature.free ? "✓" : "—"}
                  </td>
                  <td className={feature.pro ? styles.check : styles.cross}>
                    {feature.pro ? "✓" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isPro && content && (
        <div className={styles.appBox}>
          <h4 className={styles.sectionTitle}>
            {content.app_box_title ?? "So kaufst du Fairführer+"}
          </h4>
          {content.app_box_text && (
            <p
              className={styles.appText}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(content.app_box_text),
              }}
            />
          )}
          {steps.length > 0 && (
            <ol className={styles.steps}>
              {steps.map((item, index) => (
                <li key={index}>{item.step}</li>
              ))}
            </ol>
          )}
          {content.app_box_note && (
            <p
              className={styles.note}
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(content.app_box_note),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

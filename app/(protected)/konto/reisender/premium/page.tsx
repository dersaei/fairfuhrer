import { getCurrentUser } from "@/app/actions/auth";
import AccountContactForm from "@/components/account/AccountContactForm";
import styles from "./premium.module.css";

export default async function PremiumPage() {
  const user = await getCurrentUser();
  const premiumUntil = user?.profile?.premium_until
    ? new Date(user.profile.premium_until)
    : null;
  const isPro = premiumUntil ? premiumUntil > new Date() : false;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>Fairführer+</h3>

      {isPro ? (
        <div className={styles.proActiveBox}>
          <p className={styles.proActiveIcon}>★</p>
          <p className={styles.proActiveTitle}>Fairführer+ aktiv</p>
          <p className={styles.proActiveDate}>
            Gültig bis:{" "}
            <strong>
              {premiumUntil!.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </strong>
          </p>
          <p className={styles.proActiveHint}>
            Dein Abonnement wird über den App Store (iOS) oder Google Play
            (Android) verwaltet. Um dein Abo zu kündigen oder zu ändern, öffne
            die Fairführer-App und gehe zu{" "}
            <strong>Profil → Premium → Abonnement verwalten</strong>.
          </p>
        </div>
      ) : (
        <p className={styles.lead}>
          Mit <strong>Fairführer+</strong> unterstützt du die Community und
          erhältst Zugang zu allen Pins und exklusiven Funktionen — in der
          mobilen App für iOS und Android.
        </p>
      )}

      <div className={styles.comparisonBlock}>
        <h4 className={styles.sectionTitle}>Kostenlos vs. Premium</h4>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thFeature}>Funktion</th>
              <th className={styles.thFree}>Kostenlos</th>
              <th className={styles.thPro}>Fairführer+</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Alle Kategorien auf der Karte</td>
              <td className={styles.check}>✓</td>
              <td className={styles.check}>✓</td>
            </tr>
            <tr>
              <td>20&nbsp;% der Sehenswertes-Pins</td>
              <td className={styles.check}>✓</td>
              <td className={styles.check}>✓</td>
            </tr>
            <tr>
              <td>100&nbsp;% der Sehenswertes-Pins</td>
              <td className={styles.cross}>—</td>
              <td className={styles.check}>✓</td>
            </tr>
            <tr>
              <td>Offline-Karten</td>
              <td className={styles.cross}>—</td>
              <td className={styles.check}>✓</td>
            </tr>
            <tr>
              <td>Orte vorschlagen</td>
              <td className={styles.cross}>—</td>
              <td className={styles.check}>✓</td>
            </tr>
            <tr>
              <td>Community-Funktionen</td>
              <td className={styles.cross}>—</td>
              <td className={styles.check}>✓</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!isPro && (
        <div className={styles.appBox}>
          <h4 className={styles.sectionTitle}>So kaufst du Fairführer+</h4>
          <p className={styles.appText}>
            Das Premium-Abo wird ausschließlich über die{" "}
            <strong>Fairführer-App</strong> erworben — direkt im App Store (iOS)
            oder Google Play (Android). Die App befindet sich derzeit in der
            finalen Entwicklungsphase und wird bald verfügbar sein.
          </p>
          <ol className={styles.steps}>
            <li>Lade die Fairführer-App herunter (demnächst verfügbar)</li>
            <li>Melde dich mit deinen bestehenden Zugangsdaten an</li>
            <li>Wechsle in der App zum Bereich „Premium"</li>
            <li>Wähle dein Abo und schließe den Kauf ab</li>
          </ol>
          <p className={styles.note}>
            Nach dem Kauf wird dein Konto automatisch auf allen Geräten und im
            Web freigeschaltet.
          </p>
        </div>
      )}
      <AccountContactForm />
    </div>
  );
}

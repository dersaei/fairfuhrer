"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  MapPin,
  Users,
  Sparkles,
  Shield,
  Copy,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import styles from "./sparschwein.module.css";

export default function SparschweinsPage() {
  const [isClient, setIsClient] = useState(false);
  const [copiedField, setCopiedField] = useState<string>("");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const bankDetails = {
    name: "Seenergien GmbH",
    iban: "DE51 7336 9821 0007 0433 41",
    bank: "Bodenseebank",
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    });
  };

  if (!isClient) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Lädt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}></div>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Sparkles size={16} />
            Unterstützen Sie faire Geschäfte
          </div>

          <h1 className={styles.title}>
            Gemeinsam für eine{" "}
            <span className={styles.titleGradient}>fairere Zukunft</span>
          </h1>

          <p className={styles.subtitle}>
            Wenn Ihnen gefällt, was wir tun, und Sie auch faire Geschäfte
            unterstützen möchten, helfen Sie uns dabei, ein Netzwerk aufzubauen,
            das Orte und Menschen verbindet, die mehr erleben wollen.
          </p>

          {/* Feature Cards */}
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div
                className={`${styles.featureIcon} ${styles.featureIconEmerald}`}
              >
                <MapPin size={24} />
              </div>
              <h3 className={styles.featureCardTitle}>Lokale Entdeckung</h3>
              <p className={styles.featureCardDescription}>
                Wir helfen Menschen dabei, versteckte Schätze in ihrer Umgebung
                zu entdecken.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div
                className={`${styles.featureIcon} ${styles.featureIconBlue}`}
              >
                <Users size={24} />
              </div>
              <h3 className={styles.featureCardTitle}>Gemeinschaft stärken</h3>
              <p className={styles.featureCardDescription}>
                Unser Netzwerk verbindet gleichgesinnte Menschen und faire
                Unternehmen.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div
                className={`${styles.featureIcon} ${styles.featureIconPurple}`}
              >
                <Shield size={24} />
              </div>
              <h3 className={styles.featureCardTitle}>Faire Praktiken</h3>
              <p className={styles.featureCardDescription}>
                Wir fördern Transparenz und Fairness in der Geschäftswelt.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Form */}
      <div className={styles.donationForm}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.formIcon}>
              <Heart size={32} />
            </div>
            <h2 className={styles.formTitle}>Werden Sie Teil der Bewegung</h2>
            <p className={styles.formSubtitle}>
              Jede Spende hilft uns dabei, mehr faire Geschäfte zu vernetzen
            </p>
          </div>

          {/* Bank Details Section */}
          <div className={styles.bankDetailsContainer}>
            <div className={styles.bankDetailsHeader}>
              <div className={styles.bankDetailsIcon}>
                <CreditCard size={24} />
              </div>
              <h3 className={styles.bankDetailsTitle}>
                Bankverbindung für Ihre Spende
              </h3>
            </div>

            <div className={styles.bankDetailsGrid}>
              <div className={styles.bankDetailItem}>
                <label className={styles.bankDetailLabel}>
                  Name des Kontoinhabers:
                </label>
                <div className={styles.bankDetailValue}>
                  <span>{bankDetails.name}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.name, "name")}
                    className={styles.copyButton}
                    title="Kopieren"
                  >
                    {copiedField === "name" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.bankDetailItem}>
                <label className={styles.bankDetailLabel}>IBAN:</label>
                <div className={styles.bankDetailValue}>
                  <span className={styles.iban}>{bankDetails.iban}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.iban, "iban")}
                    className={styles.copyButton}
                    title="Kopieren"
                  >
                    {copiedField === "iban" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.bankDetailItem}>
                <label className={styles.bankDetailLabel}>Bank:</label>
                <div className={styles.bankDetailValue}>
                  <span>{bankDetails.bank}</span>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bank, "bank")}
                    className={styles.copyButton}
                    title="Kopieren"
                  >
                    {copiedField === "bank" ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.transferInstructions}>
              <p className={styles.instructionsTitle}>Verwendungszweck:</p>
              <p className={styles.instructionsText}>Spende FairFührer</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={styles.trustIndicators}>
          <p className={styles.trustMessage}>
            Ihre Spende wird per Banküberweisung verarbeitet
          </p>
          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <Heart size={12} />
              <span>100% für den guten Zweck</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

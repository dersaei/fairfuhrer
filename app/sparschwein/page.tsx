// app/sparschwein/page.tsx - Z CONDITIONAL PAYPAL
"use client";

import { useState } from "react";
import {
  Heart,
  MapPin,
  Users,
  Sparkles,
  Shield,
  Copy,
  CheckCircle,
  CreditCard,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PayPalDonationForm } from "@/components/PayPalDonationForm";
// ✅ DODAJ IMPORT CONDITIONAL PAYPAL
import { ConditionalPayPal } from "@/components/ConditionalPayPal";
import type { PayPalDonation } from "@/types";
import styles from "./sparschwein.module.css";

export default function SparschweinsPage() {
  const [copiedField, setCopiedField] = useState<string>("");
  const [donationSuccess, setDonationSuccess] = useState<PayPalDonation | null>(
    null
  );
  const [donationError, setDonationError] = useState<string>("");

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

  const handleDonationSuccess = (donation: PayPalDonation) => {
    setDonationSuccess(donation);
    setDonationError("");

    setTimeout(() => {
      document.getElementById("donation-result")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleDonationError = (error: string) => {
    setDonationError(error);
    setDonationSuccess(null);

    setTimeout(() => {
      document.getElementById("donation-result")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  return (
    <div className={styles.container}>
      {/* Hero Section (bez zmian) */}
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
            Herzlichen Dank für Deinen / Ihren Beitrag zur Deckung unserer
            Kosten für: Softwareentwicklung Lizenzen, Hosting, Updates Redaktion
            und IT. Wir hoffen auf diesem Weg unser Projekt mit Eurer / Ihrer
            Unterstützung in die Zukunft zu führen &#8211; Danke schön!
          </p>

          {/* Feature Cards (bez zmian) */}
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

      {/* Success/Error Messages (bez zmian) */}
      {(donationSuccess || donationError) && (
        <div id="donation-result" className={styles.donationResult}>
          {donationSuccess && (
            <div className={styles.successMessage}>
              <CheckCircle2 size={24} />
              <div>
                <h3>Vielen Dank für Ihre Spende!</h3>
                <p>
                  Ihre Spende von {(donationSuccess.amount / 100).toFixed(2)}{" "}
                  EUR wurde erfolgreich verarbeitet.
                </p>
                {donationSuccess.donor_name && (
                  <p>Liebe/r {donationSuccess.donor_name}, herzlichen Dank!</p>
                )}
              </div>
            </div>
          )}

          {donationError && (
            <div className={styles.errorMessage}>
              <AlertCircle size={24} />
              <div>
                <h3>Fehler bei der Zahlung</h3>
                <p>{donationError}</p>
                <p>
                  Bitte versuchen Sie es erneut oder nutzen Sie die
                  Banküberweisung.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ PAYPAL DONATION SECTION - OWRAP W CONDITIONAL PAYPAL */}
      <div className={styles.donationForm}>
        <div className={styles.paypalSection}>
          <ConditionalPayPal>
            <PayPalDonationForm
              onSuccess={handleDonationSuccess}
              onError={handleDonationError}
              className={styles.paypalForm}
            />
          </ConditionalPayPal>
        </div>

        {/* Divider (bez zmian) */}
        <div className={styles.divider}>
          <span>oder</span>
        </div>

        {/* Bank Transfer Section (bez zmian) */}
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <div className={styles.formIcon}>
              <Heart size={32} />
            </div>
            <h2 className={styles.formTitle}>Spende per Banküberweisung</h2>
            <p className={styles.formSubtitle}>
              Traditionelle Überweisung auf unser Konto
            </p>
          </div>

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

        {/* Trust Indicators (bez zmian) */}
        <div className={styles.trustIndicators}>
          <p className={styles.trustMessage}>
            Beide Zahlungsmethoden sind sicher und werden vertraulich behandelt
          </p>
          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <Heart size={12} />
              <span>100% für den guten Zweck</span>
            </div>
            <div className={styles.trustItem}>
              <Shield size={12} />
              <span>Sicher & verschlüsselt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

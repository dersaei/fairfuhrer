// app/kontakt/SupportSection.tsx
"use client";

import { useState } from "react";
import { Heart, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { PayPalDonationForm } from "@/components/PayPalDonationForm";
import { ConditionalPayPal } from "@/components/ConditionalPayPal";
import type { PayPalDonation, SupportSectionContent } from "@/types";
import styles from "./SupportSection.module.css";

interface SupportSectionProps {
  content: SupportSectionContent | null;
}

export default function SupportSection({ content }: SupportSectionProps) {
  const [donationSuccess, setDonationSuccess] = useState<PayPalDonation | null>(null);
  const [donationError, setDonationError] = useState<string>("");

  const handleDonationSuccess = (donation: PayPalDonation) => {
    setDonationSuccess(donation);
    setDonationError("");
    setTimeout(() => {
      document.getElementById("support-donation-result")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleDonationError = (error: string) => {
    setDonationError(error);
    setDonationSuccess(null);
    setTimeout(() => {
      document.getElementById("support-donation-result")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const sectionStyle = content?.background_color
    ? { backgroundColor: content.background_color }
    : undefined;

  const titleStyle: React.CSSProperties = {
    ...(content?.title_color ? { color: content.title_color } : {}),
    ...(content?.title_font_size ? { fontSize: content.title_font_size } : {}),
  };

  const textStyle: React.CSSProperties = {
    ...(content?.text_color ? { color: content.text_color } : {}),
    ...(content?.text_font_size ? { fontSize: content.text_font_size } : {}),
  };

  const secondTextStyle: React.CSSProperties = {
    ...(content?.second_text_color ? { color: content.second_text_color } : {}),
    ...(content?.second_text_font_size ? { fontSize: content.second_text_font_size } : {}),
  };

  return (
    <div className={styles.supportSection} style={sectionStyle}>
      <div className={styles.supportContent}>
        {content?.title && (
          <h2 className={styles.supportTitle} style={titleStyle}>
            {content.title}
          </h2>
        )}

        {content?.text && (
          <p className={styles.supportText} style={textStyle}>
            {content.text}
          </p>
        )}

        {content?.second_text && (
          <p className={styles.supportSecondText} style={secondTextStyle}>
            {content.second_text}
          </p>
        )}

        {(donationSuccess || donationError) && (
          <div id="support-donation-result" className={styles.donationResult}>
            {donationSuccess && (
              <div className={styles.successMessage}>
                <CheckCircle2 size={24} />
                <div>
                  <h3>Vielen Dank für Ihre Spende!</h3>
                  <p>
                    Ihre Spende von{" "}
                    {(donationSuccess.amount / 100).toFixed(2)} EUR wurde
                    erfolgreich verarbeitet.
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

        <div className={styles.paypalWrapper}>
          <ConditionalPayPal>
            <PayPalDonationForm
              onSuccess={handleDonationSuccess}
              onError={handleDonationError}
            />
          </ConditionalPayPal>
        </div>

        <div className={styles.trustIndicators}>
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
  );
}

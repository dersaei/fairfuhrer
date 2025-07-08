// components/PayPalDonationForm.tsx - PRZYWRÓCONA WERSJA Z OPCJONALNYMI POLAMI
"use client";

import { useState, useMemo } from "react";
import { Euro, Heart, CreditCard } from "lucide-react";
import { PayPalButtons } from "./PayPalButtons";
import { isValidEURAmount, convertEURToCents } from "@/utils/paypalTypeGuards";
import type {
  PayPalDonationFormData,
  PayPalDonationFormErrors,
  PayPalDonation,
} from "@/types";
import styles from "./PayPalDonationForm.module.css";

interface PayPalDonationFormProps {
  onSuccess?: (donation: PayPalDonation) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function PayPalDonationForm({
  onSuccess,
  onError,
  className = "",
}: PayPalDonationFormProps) {
  const [formData, setFormData] = useState<PayPalDonationFormData>({
    amount: 0, // ✅ Zmiana: 0 zamiast 10 (będzie pokazany placeholder)
    donor_email: "",
    donor_name: "",
    donor_message: "",
  });

  const [errors, setErrors] = useState<PayPalDonationFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: PayPalDonationFormErrors = {};

    // ✅ POPRAWKA: Sprawdź czy amount > 0 (bo teraz default to 0)
    if (formData.amount <= 0 || !isValidEURAmount(formData.amount)) {
      newErrors.amount =
        "Bitte geben Sie einen Betrag zwischen 1 und 10.000 EUR ein";
    }

    if (
      formData.donor_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.donor_email)
    ) {
      newErrors.donor_email = "Bitte geben Sie eine gültige E-Mail-Adresse ein";
    }

    if (formData.donor_message && formData.donor_message.length > 500) {
      newErrors.donor_message =
        "Die Nachricht darf maximal 500 Zeichen lang sein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return false;
    }
    setIsSubmitting(true);
    return true;
  };

  // Handle success
  const handleSuccess = (donation: PayPalDonation) => {
    setIsSubmitting(false);
    onSuccess?.(donation);
  };

  // Handle error
  const handleError = (error: string) => {
    setIsSubmitting(false);
    setErrors({ general: error });
    onError?.(error);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsSubmitting(false);
    setErrors({}); // Wyczyść błędy

    // ✅ POPRAWKA: Pokaż informację o anulowaniu
    setErrors({
      general: "Zahlung wurde abgebrochen. Sie können es erneut versuchen.",
    });

    console.log("Payment cancelled - resetting form");
  };

  // ✅ POPRAWKA: Konwersja tylko gdy amount > 0
  const amountInCents = useMemo(() => {
    if (formData.amount <= 0) return null;
    // Zabezpieczenie przed floating point errors
    const eurAmount = Math.round(formData.amount * 100) / 100;
    return convertEURToCents(eurAmount);
  }, [formData.amount]);

  return (
    <div className={`${styles.paypalDonationForm} ${className}`}>
      {/* Header */}
      <div className={styles.formHeader}>
        <div className={styles.formIcon}>
          <Heart size={32} />
        </div>
        <h3 className={styles.formTitle}>PayPal Spende</h3>
        <p className={styles.formSubtitle}>Schnell und sicher mit PayPal</p>
      </div>

      {/* Amount Section */}
      <div className={styles.amountSection}>
        <label className={styles.amountLabel}>
          <Euro size={16} />
          Spendenbetrag (EUR)
        </label>

        {/* Custom Amount Input */}
        <div className={styles.customAmount}>
          <input
            type="number"
            min="1"
            max="10000"
            step="0.01"
            value={formData.amount === 0 ? "" : formData.amount} // ✅ Pokaż pusty gdy 0
            onChange={(e) => {
              const value = e.target.value;
              setFormData((prev) => ({
                ...prev,
                amount: value === "" ? 0 : parseFloat(value) || 0,
              }));
            }}
            className={`${styles.amountInput} ${
              errors.amount ? styles.error : ""
            }`}
            placeholder="z.B. 25.50"
          />
          <span className={styles.currencyLabel}>EUR</span>
        </div>

        {errors.amount && (
          <div className={styles.errorMessage}>{errors.amount}</div>
        )}
      </div>

      {/* ✅ PRZYWRÓCONE: Optional Information */}
      <div className={styles.optionalSection}>
        <div className={styles.optionalHeader}>
          <h4 className={styles.optionalTitle}>Ihre Kontaktdaten (optional)</h4>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="donor_name">Name (optional)</label>
          <input
            id="donor_name"
            type="text"
            value={formData.donor_name || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                donor_name: e.target.value,
              }))
            }
            className={styles.formInput}
            placeholder="Ihr vollständiger Name"
            maxLength={255}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="donor_email">E-Mail (optional)</label>
          <input
            id="donor_email"
            type="email"
            value={formData.donor_email || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                donor_email: e.target.value,
              }))
            }
            className={`${styles.formInput} ${
              errors.donor_email ? styles.error : ""
            }`}
            placeholder="ihre@email.de"
            maxLength={254}
          />
          {errors.donor_email && (
            <div className={styles.errorMessage}>{errors.donor_email}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="donor_message">Nachricht (optional)</label>
          <textarea
            id="donor_message"
            value={formData.donor_message || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                donor_message: e.target.value,
              }))
            }
            className={`${styles.formTextarea} ${
              errors.donor_message ? styles.error : ""
            }`}
            placeholder="Eine kurze Nachricht oder Verwendungszweck..."
            maxLength={500}
            rows={3}
          />
          <div className={styles.charCount}>
            {(formData.donor_message || "").length}/500
          </div>
          {errors.donor_message && (
            <div className={styles.errorMessage}>{errors.donor_message}</div>
          )}
        </div>
      </div>

      {/* PayPal Buttons */}
      <div className={styles.paypalButtonsSection}>
        <div className={styles.paymentInfo}>
          <CreditCard size={16} />
          <span>Sicher mit PayPal bezahlen</span>
        </div>

        {amountInCents && amountInCents > 0 ? (
          <PayPalButtons
            amount={amountInCents} // Już w centach!
            donorData={{
              email: formData.donor_email || undefined,
              name: formData.donor_name || undefined,
              message: formData.donor_message || undefined,
            }}
            onApprove={handleSubmit}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
            disabled={isSubmitting}
          />
        ) : (
          <div className={styles.invalidAmountMessage}>
            Bitte geben Sie einen gültigen Betrag ein (1-10.000 EUR)
          </div>
        )}

        {errors.general && (
          <div className={`${styles.errorMessage} ${styles.generalError}`}>
            {errors.general}
          </div>
        )}
      </div>

      {/* Security Info */}
      <div className={styles.securityInfo}>
        <p>
          <strong>Datenschutz:</strong> Ihre Kontaktdaten werden nur für die
          Spendenquittung verwendet. Die Zahlung erfolgt sicher über PayPal.
        </p>
      </div>
    </div>
  );
}

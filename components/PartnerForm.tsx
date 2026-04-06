// components/PartnerForm.tsx - uproszczona wersja bez obrazów i audio

"use client";

import { useState, useCallback, ChangeEvent, FormEvent } from "react";

import type {
  PartnerFormData,
  PartnerFormErrors,
  CertificationStatusOption,
  CompanySizeOption,
  CategoryOption,
} from "../types";

import TurnstileWidget from "./TurnstileWidget";
import styles from "./PartnerForm.module.css";

// Cele zrównoważonego rozwoju bez zmian

const SUSTAINABILITY_GOALS = [
  { id: 1, name: "Keine Armut" },

  { id: 2, name: "Kein Hunger" },

  { id: 3, name: "Gesundheit und Wohlergehen" },

  { id: 4, name: "Hochwertige Bildung" },

  { id: 5, name: "Geschlechtergleichstellung" },

  { id: 6, name: "Sauberes Wasser und Sanitäreinrichtungen" },

  { id: 7, name: "Bezahlbare und saubere Energie" },

  { id: 8, name: "Menschenwürdige Arbeit und Wirtschaftswachstum" },

  { id: 9, name: "Industrie, Innovation und Infrastruktur" },

  { id: 10, name: "Weniger Ungleichheiten" },

  { id: 11, name: "Nachhaltige Städte und Gemeinden" },

  { id: 12, name: "Nachhaltige/r Konsum und Produktion" },

  { id: 13, name: "Maßnahmen zum Klimaschutz" },

  { id: 14, name: "Leben unter Wasser" },

  { id: 15, name: "Leben an Land" },

  { id: 16, name: "Frieden, Gerechtigkeit und starke Institutionen" },

  { id: 17, name: "Partnerschaften zur Erreichung der Ziele" },
];

const CERTIFICATION_STATUS_OPTIONS: CertificationStatusOption[] = [
  {
    value: "A",

    label: "Option A",

    description:
      "Das Unternehmen verfügt über ein anerkanntes regionales oder überregionales Zertifikat im Bereich Nachhaltigkeit, Regionalität oder soziale Verantwortung.",
  },

  {
    value: "B",

    label: "Option B",

    description:
      "Es verfolgt mindestens drei der 17 Ziele wie Nachhaltigkeit, faire Lieferketten oder Regionalität und beabsichtigt, innerhalb von sechs Monaten eine entsprechende Zertifizierung anzustreben.",
  },

  {
    value: "C",

    label: "Option C",

    description:
      "Es ist ein Kleinstbetrieb mit weniger als fünf Mitarbeitenden, der von unserem Team oder unseren regionalen Partnerinnen und Partnern empfohlen wird.",
  },
];

const COMPANY_SIZE_OPTIONS: CompanySizeOption[] = [
  { value: "ngo", label: "NGOs und gemeinnützige Organisationen" },

  { value: "micro", label: "Kleinstunternehmen (bis 5 Mitarbeitende)" },

  { value: "small", label: "Kleine Unternehmen (bis 50 Mitarbeitende)" },

  { value: "medium", label: "Mittlere Unternehmen (bis 500 Mitarbeitende)" },
];

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "Kultur & Natur", label: "Kultur & Natur", color: "#E45858" },

  { value: "Tourismus", label: "Tourismus", color: "#6477E3" },

  { value: "Einkaufen", label: "Einkaufen", color: "#F0873D" },

  { value: "Umwelt", label: "Umwelt", color: "#42D742" },

  { value: "Bildung", label: "Bildung", color: "#27B9B7" },

  { value: "Wirtschaft", label: "Wirtschaft", color: "#E0D12E" },
];

export default function PartnerForm() {
  const [formData, setFormData] = useState<PartnerFormData>({
    firstName: "",

    lastName: "",

    email: "",

    phone: "",

    // NOWE POLA - opcjonalne

    billingAddress: "",

    vatNumber: "",

    placeName: "",

    address: "",

    kategorie: "",

    // USUNIĘTE: mainImage, additionalImages, textContent, audioFile

    websiteUrl: "",

    message: "",

    certificate: "",

    sustainabilityGoals: [],

    certificationStatus: "",

    companySize: "",
  });

  const [errors, setErrors] = useState<PartnerFormErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  // USUNIĘTE: refs dla file inputs

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;

    return phoneRegex.test(phone);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;

    try {
      new URL(url);

      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PartnerFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Vorname ist erforderlich";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Nachname ist erforderlich";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-Mail-Adresse ist erforderlich";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ungültiges E-Mail-Format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefonnummer ist erforderlich";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Ungültiges Telefonnummer-Format";
    }

    if (!formData.placeName.trim()) {
      newErrors.placeName = "Name des Pins ist erforderlich";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Adresse ist erforderlich";
    }

    if (!formData.kategorie) {
      newErrors.kategorie = "Kategorie ist erforderlich";
    }

    if (formData.websiteUrl && !validateUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "Ungültiges Website-Adressformat";
    }

    console.log("Validation results:", {
      hasErrors: Object.keys(newErrors).length > 0,

      errors: newErrors,
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));

    if (errors[name as keyof PartnerFormErrors]) {
      setErrors((prev) => ({
        ...prev,

        [name]: undefined,
      }));
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,

      kategorie: value,
    }));

    if (errors.kategorie) {
      setErrors((prev) => ({
        ...prev,

        kategorie: undefined,
      }));
    }
  };

  const handleCertificationStatusChange = (value: "A" | "B" | "C") => {
    setFormData((prev) => ({
      ...prev,

      certificationStatus: value,
    }));

    if (errors.certificationStatus) {
      setErrors((prev) => ({
        ...prev,

        certificationStatus: undefined,
      }));
    }
  };

  const handleCompanySizeChange = (
    value: "micro" | "small" | "medium" | "ngo"
  ) => {
    setFormData((prev) => ({
      ...prev,

      companySize: value,
    }));

    if (errors.companySize) {
      setErrors((prev) => ({
        ...prev,

        companySize: undefined,
      }));
    }
  };

  const handleSustainabilityGoalChange = (goalId: number, checked: boolean) => {
    setFormData((prev) => {
      const newGoals = checked
        ? [...prev.sustainabilityGoals, goalId]
        : prev.sustainabilityGoals.filter((id) => id !== goalId);

      return {
        ...prev,

        sustainabilityGoals: newGoals,
      };
    });

    if (errors.sustainabilityGoals && checked) {
      setErrors((prev) => ({
        ...prev,

        sustainabilityGoals: undefined,
      }));
    }
  };

  // USUNIĘTE: funkcje obsługi plików

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed, errors:", errors);

      return;
    }

    if (!turnstileToken) {
      setErrors({ general: "Bitte bestätigen Sie, dass Sie kein Roboter sind" });
      return;
    }

    setIsSubmitting(true);

    setErrors({});

    try {
      const submitFormData = new FormData();

      // Dodaj podstawowe dane

      submitFormData.append("firstName", formData.firstName);

      submitFormData.append("lastName", formData.lastName);

      submitFormData.append("email", formData.email);

      submitFormData.append("phone", formData.phone);

      // NOWE POLA - opcjonalne

      submitFormData.append("billingAddress", formData.billingAddress);

      submitFormData.append("vatNumber", formData.vatNumber);

      submitFormData.append("placeName", formData.placeName);

      submitFormData.append("address", formData.address);

      submitFormData.append("kategorie", formData.kategorie);

      // USUNIĘTE: textContent

      submitFormData.append("websiteUrl", formData.websiteUrl);

      submitFormData.append("message", formData.message);

      // Pola Teilnahmebedingungen

      submitFormData.append("certificate", formData.certificate);

      submitFormData.append(
        "sustainabilityGoals",

        JSON.stringify(formData.sustainabilityGoals)
      );

      // Pola radio

      submitFormData.append(
        "certificationStatus",

        formData.certificationStatus
      );

      submitFormData.append("companySize", formData.companySize);

      submitFormData.append("turnstileToken", turnstileToken);

      // Wyślij do API

      const response = await fetch("/api/partner-application", {
        method: "POST",

        body: submitFormData,

        signal: AbortSignal.timeout(30000),
      });

      let result;

      try {
        result = await response.json();
      } catch {
        if (response.ok) {
          result = { success: true };
        } else {
          throw new Error("Nieprawidłowa odpowiedź serwera");
        }
      }

      if (!response.ok) {
        throw new Error(result?.error || `Błąd serwera: ${response.status}`);
      }

      setSubmitSuccess(true);

      // Reset formularza

      setFormData({
        firstName: "",

        lastName: "",

        email: "",

        phone: "",

        // NOWE POLA - opcjonalne

        billingAddress: "",

        vatNumber: "",

        placeName: "",

        address: "",

        kategorie: "",

        // USUNIĘTE: mainImage, additionalImages, textContent, audioFile

        websiteUrl: "",

        message: "",

        certificate: "",

        sustainabilityGoals: [],

        certificationStatus: "",

        companySize: "",
      });

      // USUNIĘTE: reset file inputs
    } catch (error) {
      console.error("Błąd wysyłania formularza:", error);

      if (error instanceof Error) {
        if (error.name === "TimeoutError") {
          setErrors({
            general: "Przekroczono limit czasu. Spróbuj ponownie.",
          });
        } else if (error.message.includes("NetworkError")) {
          setErrors({
            general: "Błąd połączenia. Sprawdź internet i spróbuj ponownie.",
          });
        } else {
          setErrors({
            general: error.message,
          });
        }
      } else {
        setErrors({
          general: "Nieoczekiwany błąd. Spróbuj ponownie.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className={styles.successMessage}>
        <h3>Vielen Dank für Ihre Bewerbung!</h3>

        <p>
          Ihre Bewerbung wurde erfolgreich gesendet. Wir werden uns innerhalb
          von 2-3 Werktagen bei Ihnen melden.
        </p>

        <button
          type="button"
          onClick={() => setSubmitSuccess(false)}
          className={styles.newApplicationButton}
        >
          Neue Bewerbung senden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h3>Partner-Bewerbungsformular</h3>

        <p>
          Füllen Sie alle Pflichtfelder aus, die mit einem Sternchen (*)
          gekennzeichnet sind
        </p>
      </div>

      {errors.general && (
        <div className={styles.errorGeneral}>{errors.general}</div>
      )}

      {/* 1. ANSPRECHPARTNER */}

      <section className={styles.section}>
        <h4>Ansprechpartner</h4>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="firstName">Vorname *</label>

            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={errors.firstName ? styles.inputError : ""}
              maxLength={50}
              autoComplete="given-name"
            />

            {errors.firstName && (
              <span className={styles.error}>{errors.firstName}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="lastName">Nachname *</label>

            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={errors.lastName ? styles.inputError : ""}
              maxLength={50}
              autoComplete="family-name"
            />

            {errors.lastName && (
              <span className={styles.error}>{errors.lastName}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="email">E-Mail-Adresse *</label>

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? styles.inputError : ""}
              maxLength={100}
              autoComplete="email"
            />

            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Telefonnummer *</label>

            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={errors.phone ? styles.inputError : ""}
              placeholder="+49 123 456 789"
              maxLength={20}
              autoComplete="tel"
            />

            {errors.phone && (
              <span className={styles.error}>{errors.phone}</span>
            )}
          </div>
        </div>

        {/* NOWE POLA - opcjonalne dane firmowe */}

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="billingAddress">Rechnungsadresse</label>

            <input
              type="text"
              id="billingAddress"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleInputChange}
              className={errors.billingAddress ? styles.inputError : ""}
              placeholder="Straße, Hausnummer, PLZ, Stadt, Land"
              maxLength={200}
              autoComplete="billing street-address"
            />

            {errors.billingAddress && (
              <span className={styles.error}>{errors.billingAddress}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="vatNumber">USt-IdNr (VAT-EU)</label>

            <input
              type="text"
              id="vatNumber"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleInputChange}
              className={errors.vatNumber ? styles.inputError : ""}
              placeholder="z. B. AT123456789"
              maxLength={20}
            />

            {errors.vatNumber && (
              <span className={styles.error}>{errors.vatNumber}</span>
            )}
          </div>
        </div>
      </section>

      {/* 2. INFORMATIONEN DES PINS - z przeniesionymi polami Website i Message */}

      <section className={styles.section}>
        <h4>Informationen zum Pin</h4>

        <div className={styles.field}>
          <label htmlFor="placeName">Titel des Pins *</label>

          <input
            type="text"
            id="placeName"
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            className={errors.placeName ? styles.inputError : ""}
            maxLength={100}
          />

          {errors.placeName && (
            <span className={styles.error}>{errors.placeName}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="address">Adresse *</label>

          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={errors.address ? styles.inputError : ""}
            placeholder="Straße, Hausnummer, PLZ, Stadt, Land"
            maxLength={200}
            autoComplete="street-address"
          />

          {errors.address && (
            <span className={styles.error}>{errors.address}</span>
          )}
        </div>

        {/* POLE KATEGORII */}

        <div className={styles.field}>
          <div className={styles.radioGroupLabel}>Kategorie *</div>

          <p className={styles.radioGroupSubtitle}>
            Wählen Sie die Kategorie, in der Sie Ihren PIN platzieren möchten:
          </p>

          <div className={styles.radioGroup}>
            {CATEGORY_OPTIONS.map((category) => (
              <div
                key={category.value}
                className={`${styles.radioItem} ${styles.categoryRadioItem}`}
                style={
                  { "--category-color": category.color } as React.CSSProperties
                }
                onClick={() => handleCategoryChange(category.value)}
              >
                <div
                  className={`${styles.radioWrapper} ${styles.categoryRadioWrapper}`}
                >
                  <input
                    type="radio"
                    id={`category-${category.value}`}
                    name="kategorie"
                    value={category.value}
                    checked={formData.kategorie === category.value}
                    onChange={() => handleCategoryChange(category.value)}
                    className={`${styles.radio} ${styles.categoryRadio}`}
                    tabIndex={-1}
                  />
                </div>

                <div className={styles.radioContent}>
                  <label
                    htmlFor={`category-${category.value}`}
                    className={`${styles.radioLabel} ${styles.categoryRadioLabel}`}
                    onClick={(e) => e.preventDefault()}
                  >
                    <strong>{category.label}</strong>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {errors.kategorie && (
            <span className={styles.error}>{errors.kategorie}</span>
          )}
        </div>

        {/* PRZENIESIONE POLA z sekcji AUDIOAUFNAHME */}

        <div className={styles.field}>
          <label htmlFor="websiteUrl">Website-Adresse</label>

          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={handleInputChange}
            className={errors.websiteUrl ? styles.inputError : ""}
            placeholder="https://www.beispiel.com"
            maxLength={200}
            autoComplete="url"
          />

          {errors.websiteUrl && (
            <span className={styles.error}>{errors.websiteUrl}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="message">Zusätzliche Nachricht</label>

          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            placeholder="Zusätzliche Informationen, Fragen, Anmerkungen..."
            maxLength={1000}
          />

          <div className={styles.charCounter}>
            {formData.message.length}/1000 Zeichen
          </div>
        </div>
      </section>

      {/* USUNIĘTE SEKCJE: BILDER, TEXT DES PINS, AUDIOAUFNAHME */}

      {/* 3. TEILNAHMEBEDINGUNGEN */}

      <section className={styles.section}>
        <h4>Teilnahmebedingungen</h4>

        <div className={styles.field}>
          <label htmlFor="certificate">
            Bitte geben Sie an, über welche Zertifikate Sie verfügen, oder wie
            sie Ihre Nachhaltigkeit (Option B) begründen.
          </label>

          <textarea
            id="certificate"
            name="certificate"
            value={formData.certificate}
            onChange={handleInputChange}
            rows={3}
            className={errors.certificate ? styles.inputError : ""}
            placeholder="Geben Sie mehrere Zertifikate durch Kommas oder neue Zeilen getrennt ein."
            maxLength={500}
          />

          <div className={styles.charCounter}>
            {formData.certificate.length}/500 Zeichen
          </div>

          {errors.certificate && (
            <span className={styles.error}>{errors.certificate}</span>
          )}
        </div>

        {/* Status certyfikacji */}

        <div className={styles.field}>
          <div className={styles.radioGroupLabel}>
            Erfüllte Teilnahmebedingungen
          </div>

          <p className={styles.radioGroupSubtitle}>
            Bitte wählen Sie eine Option aus:
          </p>

          <div className={styles.radioGroup}>
            {CERTIFICATION_STATUS_OPTIONS.map((option) => (
              <div key={option.value} className={styles.radioItem}>
                <div className={styles.radioWrapper}>
                  <input
                    type="radio"
                    id={`cert-${option.value}`}
                    name="certificationStatus"
                    value={option.value}
                    checked={formData.certificationStatus === option.value}
                    onChange={() =>
                      handleCertificationStatusChange(option.value)
                    }
                    className={styles.radio}
                  />
                </div>

                <div className={styles.radioContent}>
                  <label
                    htmlFor={`cert-${option.value}`}
                    className={styles.radioLabel}
                  >
                    <strong>{option.label}</strong>
                  </label>

                  <p className={styles.radioDescription}>
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {errors.certificationStatus && (
            <span className={styles.error}>{errors.certificationStatus}</span>
          )}
        </div>

        {/* Cele zrównoważonego rozwoju */}

        <div className={styles.field}>
          <div className={styles.checkboxGroupLabel}>
            Die 17 globalen Nachhaltigkeitsziele
          </div>

          <p className={styles.checkboxGroupSubtitle}>
            Markieren Sie, welche der 17 Ziele verfolgen Sie oder streben Sie
            an.{" "}
            <a
              href="https://17ziele.de"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(252, 108, 20, 1)",

                textDecoration: "underline",

                fontWeight: "500",
              }}
            >
              Hier erfahren Sie mehr über die 17 Ziele.
            </a>
          </p>

          <div className={styles.checkboxGrid}>
            {SUSTAINABILITY_GOALS.map((goal) => (
              <div key={goal.id} className={styles.checkboxItem}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    id={`goal-${goal.id}`}
                    checked={formData.sustainabilityGoals.includes(goal.id)}
                    onChange={(e) => {
                      handleSustainabilityGoalChange(goal.id, e.target.checked);
                    }}
                    className={styles.checkbox}
                  />
                </div>

                <span className={styles.checkboxNumber}>{goal.id}</span>

                <label
                  htmlFor={`goal-${goal.id}`}
                  className={styles.checkboxLabel}
                >
                  {goal.name}
                </label>
              </div>
            ))}
          </div>

          {errors.sustainabilityGoals && (
            <span className={styles.error}>{errors.sustainabilityGoals}</span>
          )}
        </div>

        {/* Wielkość firmy */}

        <div className={styles.field}>
          <div className={styles.radioGroupLabel}>Unternehmensgröße</div>

          <p className={styles.radioGroupSubtitle}>
            Bitte wählen Sie die passende Kategorie für Ihr Unternehmen:
          </p>

          <div className={styles.radioGroup}>
            {COMPANY_SIZE_OPTIONS.map((option) => (
              <div key={option.value} className={styles.radioItem}>
                <div className={styles.radioWrapper}>
                  <input
                    type="radio"
                    id={`size-${option.value}`}
                    name="companySize"
                    value={option.value}
                    checked={formData.companySize === option.value}
                    onChange={() => handleCompanySizeChange(option.value)}
                    className={styles.radio}
                  />
                </div>

                <div className={styles.radioContent}>
                  <label
                    htmlFor={`size-${option.value}`}
                    className={styles.radioLabel}
                  >
                    <strong>{option.label}</strong>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {errors.companySize && (
            <span className={styles.error}>{errors.companySize}</span>
          )}
        </div>
      </section>

      <div className={styles.submitSection}>
        <TurnstileWidget
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onVerify={handleTurnstileVerify}
          onExpire={handleTurnstileExpire}
        />

        <button
          type="submit"
          disabled={isSubmitting || !turnstileToken}
          className={styles.submitButton}
        >
          {isSubmitting ? "Wird gesendet..." : "Bewerbung senden"}
        </button>
      </div>
    </form>
  );
}

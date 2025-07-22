// components/PartnerForm.tsx - kompletna wersja BEZ pól współrzędnych
"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import type {
  PartnerFormData,
  PartnerFormErrors,
  CertificationStatusOption,
  CompanySizeOption,
} from "../types";
import styles from "./PartnerForm.module.css";

// POPRAWIONE LIMITY
const MAX_MAIN_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_ADDITIONAL_IMAGE_SIZE = 500 * 1024; // 500KB
const MAX_AUDIO_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3"];

// 17 globalnych celów zrównoważonego rozwoju (SDGs)
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

// OPCJE dla statusu certyfikacji
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
      "Es verfolgt nachweislich Ziele wie Nachhaltigkeit, faire Lieferketten oder Regionalität und beabsichtigt, innerhalb von sechs Monaten eine entsprechende Zertifizierung anzustreben.",
  },
  {
    value: "C",
    label: "Option C",
    description:
      "Es ist ein Kleinstbetrieb mit weniger als fünf Mitarbeitenden, der von unserem Team oder unseren regionalen Partnerinnen und Partnern empfohlen wird.",
  },
];

// OPCJE dla wielkości firmy
const COMPANY_SIZE_OPTIONS: CompanySizeOption[] = [
  {
    value: "ngo",
    label: "NGOs und gemeinnützige Organisationen",
    price: "Freiwillige Selbsteinstufung",
  },
  {
    value: "micro",
    label: "Kleinstunternehmen (bis 5 Mitarbeitende)",
    price: "50 € / SFr",
  },
  {
    value: "small",
    label: "Kleine Unternehmen (bis 50 Mitarbeitende)",
    price: "200 € / SFr",
  },
  {
    value: "medium",
    label: "Mittlere Unternehmen (bis 500 Mitarbeitende)",
    price: "300 € SFr",
  },
];

export default function PartnerForm() {
  const [formData, setFormData] = useState<PartnerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    placeName: "",
    address: "",
    mainImage: null,
    additionalImages: [],
    textContent: "",
    audioFile: null,
    websiteUrl: "",
    message: "",
    // ISTNIEJĄCE POLA
    certificate: "",
    sustainabilityGoals: [],
    // NOWE POLA
    certificationStatus: "",
    companySize: "",
  });

  const [errors, setErrors] = useState<PartnerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Refs dla file inputs
  const mainImageRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
    return phoneRegex.test(phone);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Opcjonalne pole
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PartnerFormErrors = {};

    // Sprawdzenie wymaganych pól
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

    // Sprawdzenie URL (jeśli podany)
    if (formData.websiteUrl && !validateUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "Ungültiges Website-Adressformat";
    }

    console.log("Validation results:", {
      hasErrors: Object.keys(newErrors).length > 0,
      errors: newErrors,
      sustainabilityGoalsCount: formData.sustainabilityGoals.length,
      sustainabilityGoals: formData.sustainabilityGoals,
      certificationStatus: formData.certificationStatus,
      companySize: formData.companySize,
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

    // Usuń błąd dla tego pola
    if (errors[name as keyof PartnerFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // FUNKCJE dla radio buttons
  const handleCertificationStatusChange = (value: "A" | "B" | "C") => {
    setFormData((prev) => ({
      ...prev,
      certificationStatus: value,
    }));

    // Usuń błąd
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

    // Usuń błąd
    if (errors.companySize) {
      setErrors((prev) => ({
        ...prev,
        companySize: undefined,
      }));
    }
  };

  // FUNKCJA do obsługi checkboxów dla celów zrównoważonego rozwoju
  const handleSustainabilityGoalChange = (goalId: number, checked: boolean) => {
    console.log(`Sustainability goal ${goalId} changed to ${checked}`);

    setFormData((prev) => {
      const newGoals = checked
        ? [...prev.sustainabilityGoals, goalId]
        : prev.sustainabilityGoals.filter((id) => id !== goalId);

      console.log("Updated sustainabilityGoals:", newGoals);
      console.log(
        "Updated sustainabilityGoals type check:",
        newGoals.map((id) => typeof id)
      );

      return {
        ...prev,
        sustainabilityGoals: newGoals,
      };
    });

    // Usuń błąd jeśli wybrano przynajmniej jeden cel
    if (errors.sustainabilityGoals && checked) {
      setErrors((prev) => ({
        ...prev,
        sustainabilityGoals: undefined,
      }));
    }
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        mainImage: "Erlaubte Formate: JPEG, PNG, WebP",
      }));
      return;
    }

    if (file.size > MAX_MAIN_IMAGE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        mainImage: "Datei ist zu groß (maximal 500KB)",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      mainImage: file,
    }));

    setErrors((prev) => ({
      ...prev,
      mainImage: undefined,
    }));
  };

  const handleAdditionalImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 6) {
      setErrors((prev) => ({
        ...prev,
        additionalImages: "Maximal 6 zusätzliche Bilder",
      }));
      return;
    }

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          additionalImages: "Erlaubte Formate: JPEG, PNG, WebP",
        }));
        return;
      }

      if (file.size > MAX_ADDITIONAL_IMAGE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          additionalImages: "Jede Datei kann maximal 500KB haben",
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      additionalImages: files,
    }));

    setErrors((prev) => ({
      ...prev,
      additionalImages: undefined,
    }));
  };

  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        audioFile: "Erlaubtes Format: MP3",
      }));
      return;
    }

    if (file.size > MAX_AUDIO_SIZE) {
      setErrors((prev) => ({
        ...prev,
        audioFile: "Datei ist zu groß (maximal 2MB)",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      audioFile: file,
    }));

    setErrors((prev) => ({
      ...prev,
      audioFile: undefined,
    }));
  };

  const clearMainImage = () => {
    setFormData((prev) => ({ ...prev, mainImage: null }));
    if (mainImageRef.current) {
      mainImageRef.current.value = "";
    }
  };

  const clearAdditionalImages = () => {
    setFormData((prev) => ({ ...prev, additionalImages: [] }));
    if (additionalImagesRef.current) {
      additionalImagesRef.current.value = "";
    }
  };

  const clearAudioFile = () => {
    setFormData((prev) => ({ ...prev, audioFile: null }));
    if (audioFileRef.current) {
      audioFileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    console.log("Form data before validation:", {
      sustainabilityGoals: formData.sustainabilityGoals,
      sustainabilityGoalsLength: formData.sustainabilityGoals.length,
      sustainabilityGoalsTypes: formData.sustainabilityGoals.map(
        (id) => typeof id
      ),
      certificationStatus: formData.certificationStatus,
      companySize: formData.companySize,
    });

    if (!validateForm()) {
      console.log("Form validation failed, errors:", errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Przygotuj FormData do wysłania
      const submitFormData = new FormData();

      // Dodaj podstawowe dane (BEZ WSPÓŁRZĘDNYCH)
      submitFormData.append("firstName", formData.firstName);
      submitFormData.append("lastName", formData.lastName);
      submitFormData.append("email", formData.email);
      submitFormData.append("phone", formData.phone);
      submitFormData.append("placeName", formData.placeName);
      submitFormData.append("address", formData.address);
      // USUNIĘTE: latitude i longitude

      submitFormData.append("textContent", formData.textContent);
      submitFormData.append("websiteUrl", formData.websiteUrl);
      submitFormData.append("message", formData.message);

      // ISTNIEJĄCE POLA z debugowaniem
      submitFormData.append("certificate", formData.certificate);

      console.log(
        "sustainabilityGoals being sent:",
        formData.sustainabilityGoals
      );
      console.log(
        "sustainabilityGoals JSON string:",
        JSON.stringify(formData.sustainabilityGoals)
      );

      submitFormData.append(
        "sustainabilityGoals",
        JSON.stringify(formData.sustainabilityGoals)
      );

      // NOWE POLA
      submitFormData.append(
        "certificationStatus",
        formData.certificationStatus
      );
      submitFormData.append("companySize", formData.companySize);

      // Sprawdź co faktycznie jest w FormData
      console.log("FormData entries:");
      for (const [key, value] of submitFormData.entries()) {
        if (
          key === "sustainabilityGoals" ||
          key === "certificationStatus" ||
          key === "companySize"
        ) {
          console.log(`${key}:`, value, typeof value);
        }
      }

      // Dodaj pliki
      if (formData.mainImage) {
        submitFormData.append("mainImage", formData.mainImage);
      }

      formData.additionalImages.forEach((file, index) => {
        submitFormData.append(`additionalImage${index}`, file);
      });

      if (formData.audioFile) {
        submitFormData.append("audioFile", formData.audioFile);
      }

      // Wyślij do API z timeout
      const response = await fetch("/api/partner-application", {
        method: "POST",
        body: submitFormData,
        signal: AbortSignal.timeout(30000), // 30 sekund timeout
      });

      let result;
      try {
        result = await response.json();
      } catch {
        // Jeśli nie można sparsować JSON, może to być sukces bez treści
        if (response.ok) {
          result = { success: true };
        } else {
          throw new Error("Nieprawidłowa odpowiedź serwera");
        }
      }

      console.log("Server response:", {
        status: response.status,
        ok: response.ok,
        result: result,
      });

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
        placeName: "",
        address: "",
        // USUNIĘTE: latitude: "", longitude: "",
        mainImage: null,
        additionalImages: [],
        textContent: "",
        audioFile: null,
        websiteUrl: "",
        message: "",
        certificate: "",
        sustainabilityGoals: [],
        // NOWE POLA
        certificationStatus: "",
        companySize: "",
      });

      // Reset file inputs
      if (mainImageRef.current) mainImageRef.current.value = "";
      if (additionalImagesRef.current) additionalImagesRef.current.value = "";
      if (audioFileRef.current) audioFileRef.current.value = "";
    } catch (error) {
      console.error("Błąd wysyłania formularza:", error);

      // Różne typy błędów
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
            />
            {errors.phone && (
              <span className={styles.error}>{errors.phone}</span>
            )}
          </div>
        </div>
      </section>

      {/* 2. INFORMATIONEN DES PINS - BEZ WSPÓŁRZĘDNYCH */}
      <section className={styles.section}>
        <h4>Informationen des Pins</h4>

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
          />
          {errors.address && (
            <span className={styles.error}>{errors.address}</span>
          )}
        </div>

        {/* USUNIĘTA SEKCJA Z WSPÓŁRZĘDNYMI I PORADĄ */}
      </section>

      {/* 3. BILDER */}
      <section className={styles.section}>
        <h4>Bilder</h4>

        <div className={styles.field}>
          <label htmlFor="mainImage">Hauptbild (max. 500KB)</label>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="mainImage"
              ref={mainImageRef}
              onChange={handleMainImageChange}
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className={styles.hiddenFileInput}
            />

            <button
              type="button"
              onClick={() => mainImageRef.current?.click()}
              className={`${styles.customFileButton} ${
                errors.mainImage ? styles.customFileButtonError : ""
              }`}
            >
              <span className={styles.fileIcon}>📷</span>
              {formData.mainImage
                ? formData.mainImage.name
                : "Hauptbild auswählen"}
            </button>

            {formData.mainImage && (
              <div className={styles.selectedFile}>
                <span>✅ Datei ausgewählt: {formData.mainImage.name}</span>
                <button
                  type="button"
                  onClick={clearMainImage}
                  className={styles.clearFileButton}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {errors.mainImage && (
            <span className={styles.error}>{errors.mainImage}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="additionalImages">
            Zusätzliche Bilder (max. 6, je max. 500KB)
          </label>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="additionalImages"
              ref={additionalImagesRef}
              onChange={handleAdditionalImagesChange}
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className={styles.hiddenFileInput}
            />

            <button
              type="button"
              onClick={() => additionalImagesRef.current?.click()}
              className={`${styles.customFileButton} ${
                errors.additionalImages ? styles.customFileButtonError : ""
              }`}
            >
              <span className={styles.fileIcon}>🖼️</span>
              {formData.additionalImages.length > 0
                ? `${formData.additionalImages.length} Bilder ausgewählt`
                : "Zusätzliche Bilder auswählen (optional)"}
            </button>

            {formData.additionalImages.length > 0 && (
              <div className={styles.selectedFile}>
                <span>
                  ✅ {formData.additionalImages.length} Dateien ausgewählt
                </span>
                <button
                  type="button"
                  onClick={clearAdditionalImages}
                  className={styles.clearFileButton}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {errors.additionalImages && (
            <span className={styles.error}>{errors.additionalImages}</span>
          )}
        </div>
      </section>

      {/* 4. BESCHREIBUNG DES PINS */}
      <section className={styles.section}>
        <h4>Text des Pins</h4>

        <div className={styles.field}>
          <label htmlFor="textContent">Beschreiben Sie Ihren Pin</label>
          <textarea
            id="textContent"
            name="textContent"
            value={formData.textContent}
            onChange={handleInputChange}
            rows={6}
            className={errors.textContent ? styles.inputError : ""}
            placeholder="Beschreiben Sie Ihren Pin, seine Geschichte, Attraktionen, was ihn besonders macht..."
            maxLength={2000}
          />
          <div className={styles.charCounter}>
            {formData.textContent.length}/2000 Zeichen
          </div>
          {errors.textContent && (
            <span className={styles.error}>{errors.textContent}</span>
          )}
        </div>
      </section>

      {/* 5. AUDIOAUFNAHME */}
      <section className={styles.section}>
        <h4>Audioaufnahme</h4>

        <div className={styles.field}>
          <label htmlFor="audioFile">Audio-Datei (MP3, max. 2MB)</label>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="audioFile"
              ref={audioFileRef}
              onChange={handleAudioFileChange}
              accept={ALLOWED_AUDIO_TYPES.join(",")}
              className={styles.hiddenFileInput}
            />

            <button
              type="button"
              onClick={() => audioFileRef.current?.click()}
              className={`${styles.customFileButton} ${
                errors.audioFile ? styles.customFileButtonError : ""
              }`}
            >
              <span className={styles.fileIcon}>🎵</span>
              {formData.audioFile
                ? formData.audioFile.name
                : "Audio-Datei auswählen (optional)"}
            </button>

            {formData.audioFile && (
              <div className={styles.selectedFile}>
                <span>✅ Datei ausgewählt: {formData.audioFile.name}</span>
                <button
                  type="button"
                  onClick={clearAudioFile}
                  className={styles.clearFileButton}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          {errors.audioFile && (
            <span className={styles.error}>{errors.audioFile}</span>
          )}
        </div>

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

      {/* 6. TEILNAHMEBEDINGUNGEN */}
      <section className={styles.section}>
        <h4>Teilnahmebedingungen</h4>

        <div className={styles.field}>
          <label htmlFor="certificate">
            Bitte geben Sie an, über welche Zertifikate Sie verfügen.
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

        {/* POLE 1 - Status certyfikacji */}
        <div className={styles.field}>
          <label className={styles.radioGroupLabel}>
            Erfüllte Teilnahmebedingungen
          </label>
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

        <div className={styles.field}>
          <label className={styles.checkboxGroupLabel}>
            Die 17 globalen Nachhaltigkeitsziele
          </label>
          <p className={styles.checkboxGroupSubtitle}>
            Markieren Sie, welche davon Ihre Tätigkeit bereits erfüllt oder sich
            darauf vorbereitet, in naher Zukunft zu erfüllen.
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
                      console.log(
                        `Checkbox ${goal.id} clicked, checked: ${e.target.checked}`
                      );
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

        {/* POLE 2 - Wielkość firmy */}
        <div className={styles.field}>
          <label className={styles.radioGroupLabel}>Unternehmensgröße</label>
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
                  <p className={styles.radioPrice}>{option.price}</p>
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
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "Wird gesendet..." : "Bewerbung senden"}
        </button>
      </div>
    </form>
  );
}

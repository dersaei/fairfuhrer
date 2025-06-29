// components/PartnerForm.tsx - z poprawionymi limitami
"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import type { PartnerFormData, PartnerFormErrors } from "../types";
import styles from "./PartnerForm.module.css";

// POPRAWIONE LIMITY
const MAX_MAIN_IMAGE_SIZE = 500 * 1024; // 500KB (było 500MB)
const MAX_ADDITIONAL_IMAGE_SIZE = 500 * 1024; // 500KB (było 500MB)
const MAX_AUDIO_SIZE = 1 * 1024 * 1024; // 1MB (było 1GB)
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3"];

export default function PartnerForm() {
  const [formData, setFormData] = useState<PartnerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    placeName: "",
    address: "",
    latitude: "",
    longitude: "",
    mainImage: null,
    additionalImages: [],
    textContent: "",
    audioFile: null,
    websiteUrl: "",
    message: "",
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

  const validateCoordinate = (coord: string, type: "lat" | "lng"): boolean => {
    const num = parseFloat(coord);
    if (isNaN(num)) return false;

    if (type === "lat") {
      return num >= -90 && num <= 90;
    } else {
      return num >= -180 && num <= 180;
    }
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
      newErrors.placeName = "Ortsname ist erforderlich";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Adresse ist erforderlich";
    }

    if (!formData.latitude.trim()) {
      newErrors.latitude = "Breitengrad ist erforderlich";
    } else if (!validateCoordinate(formData.latitude, "lat")) {
      newErrors.latitude = "Ungültiger Breitengrad (-90 bis 90)";
    }

    if (!formData.longitude.trim()) {
      newErrors.longitude = "Längengrad ist erforderlich";
    } else if (!validateCoordinate(formData.longitude, "lng")) {
      newErrors.longitude = "Ungültiger Längengrad (-180 bis 180)";
    }

    if (!formData.mainImage) {
      newErrors.mainImage = "Hauptbild ist erforderlich";
    }

    // Sprawdzenie zawartości tekstowej (TERAZ WYMAGANE)
    if (!formData.textContent.trim()) {
      newErrors.textContent = "Ortsbeschreibung ist erforderlich";
    }

    // Sprawdzenie URL (jeśli podany)
    if (formData.websiteUrl && !validateUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = "Ungültiges Website-Adressformat";
    }

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

    if (files.length > 3) {
      setErrors((prev) => ({
        ...prev,
        additionalImages: "Maximal 3 zusätzliche Bilder",
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
        audioFile: "Datei ist zu groß (maximal 1MB)",
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

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Przygotuj FormData do wysłania
      const submitFormData = new FormData();

      // Dodaj podstawowe dane
      submitFormData.append("firstName", formData.firstName);
      submitFormData.append("lastName", formData.lastName);
      submitFormData.append("email", formData.email);
      submitFormData.append("phone", formData.phone);
      submitFormData.append("placeName", formData.placeName);
      submitFormData.append("address", formData.address);
      submitFormData.append("latitude", formData.latitude);
      submitFormData.append("longitude", formData.longitude);
      submitFormData.append("textContent", formData.textContent);
      submitFormData.append("websiteUrl", formData.websiteUrl);
      submitFormData.append("message", formData.message);

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

      // Wyślij do API
      const response = await fetch("/api/partner-application", {
        method: "POST",
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Ein Fehler ist beim Senden aufgetreten"
        );
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
        latitude: "",
        longitude: "",
        mainImage: null,
        additionalImages: [],
        textContent: "",
        audioFile: null,
        websiteUrl: "",
        message: "",
      });

      // Reset file inputs
      if (mainImageRef.current) mainImageRef.current.value = "";
      if (additionalImagesRef.current) additionalImagesRef.current.value = "";
      if (audioFileRef.current) audioFileRef.current.value = "";
    } catch (error) {
      console.error("Błąd wysyłania formularza:", error);
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Ein Fehler ist beim Senden des Formulars aufgetreten. Bitte versuchen Sie es erneut.",
      });
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

      {/* Dane osobowe */}
      <section className={styles.section}>
        <h4>Persönliche Daten</h4>

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

      {/* Dane miejsca */}
      <section className={styles.section}>
        <h4>Informationen zum Ort</h4>

        <div className={styles.field}>
          <label htmlFor="placeName">Ortsname *</label>
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
          <label htmlFor="address">Physische Adresse *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={errors.address ? styles.inputError : ""}
            placeholder="Straße, Hausnummer, PLZ, Stadt"
            maxLength={200}
          />
          {errors.address && (
            <span className={styles.error}>{errors.address}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="latitude">Breitengrad *</label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className={errors.latitude ? styles.inputError : ""}
              placeholder="z.B. 52.5200"
              step="any"
            />
            {errors.latitude && (
              <span className={styles.error}>{errors.latitude}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="longitude">Längengrad *</label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className={errors.longitude ? styles.inputError : ""}
              placeholder="z.B. 13.4050"
              step="any"
            />
            {errors.longitude && (
              <span className={styles.error}>{errors.longitude}</span>
            )}
          </div>
        </div>

        <div className={styles.coordinatesHelp}>
          💡 Tipp: Die Koordinaten finden Sie in Google Maps, indem Sie mit der
          rechten Maustaste auf den Standort klicken.
        </div>
      </section>

      {/* Zdjęcia - CUSTOM FILE INPUTS z poprawionymi limitami */}
      <section className={styles.section}>
        <h4>Bilder</h4>

        <div className={styles.field}>
          <label htmlFor="mainImage">Hauptbild * (max. 500KB)</label>
          <div className={styles.fileInputWrapper}>
            {/* Ukryty domyślny input */}
            <input
              type="file"
              id="mainImage"
              ref={mainImageRef}
              onChange={handleMainImageChange}
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className={styles.hiddenFileInput}
            />

            {/* Custom przycisk */}
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
            Zusätzliche Bilder (max. 3, je max. 500KB)
          </label>
          <div className={styles.fileInputWrapper}>
            {/* Ukryty domyślny input */}
            <input
              type="file"
              id="additionalImages"
              ref={additionalImagesRef}
              onChange={handleAdditionalImagesChange}
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple
              className={styles.hiddenFileInput}
            />

            {/* Custom przycisk */}
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

      {/* Zawartość tekstowa */}
      <section className={styles.section}>
        <h4>Ortsbeschreibung *</h4>

        <div className={styles.field}>
          <label htmlFor="textContent">Beschreiben Sie Ihren Ort</label>
          <textarea
            id="textContent"
            name="textContent"
            value={formData.textContent}
            onChange={handleInputChange}
            rows={6}
            className={errors.textContent ? styles.inputError : ""}
            placeholder="Beschreiben Sie Ihren Ort, seine Geschichte, Attraktionen, was ihn besonders macht..."
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

      {/* Opcjonalne pliki - CUSTOM AUDIO INPUT z poprawionym limitem */}
      <section className={styles.section}>
        <h4>Zusätzliche Materialien (optional)</h4>

        <div className={styles.field}>
          <label htmlFor="audioFile">Audio-Datei (MP3, max. 1MB)</label>
          <div className={styles.fileInputWrapper}>
            {/* Ukryty domyślny input */}
            <input
              type="file"
              id="audioFile"
              ref={audioFileRef}
              onChange={handleAudioFileChange}
              accept={ALLOWED_AUDIO_TYPES.join(",")}
              className={styles.hiddenFileInput}
            />

            {/* Custom przycisk */}
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

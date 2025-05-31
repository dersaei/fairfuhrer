"use client";

import { useState, FormEvent } from "react";
import styles from "./ContactForm.module.css";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Prosta walidacja
      if (
        !formData.name ||
        !formData.email ||
        !formData.subject ||
        !formData.message
      ) {
        alert("Wszystkie pola są wymagane");
        return;
      }

      if (!formData.email.includes("@")) {
        alert("Podaj prawidłowy adres email");
        return;
      }

      // POPRAWKA: Używamy zmiennej środowiskowej z NEXT_PUBLIC_
      const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;

      if (!directusUrl) {
        console.error("Brak NEXT_PUBLIC_DIRECTUS_URL");
        setSubmitStatus("error");
        return;
      }

      // Wysłanie bezpośrednio do Directus
      const response = await fetch(`${directusUrl}/items/contact_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          created_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        console.error("Response error:", response.status, response.statusText);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Błąd wysyłania:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.contactForm}>
      <h2>Wyślij wiadomość</h2>

      {submitStatus === "success" && (
        <div className={styles.successMessage}>
          ✅ Wiadomość wysłana! Odpowiemy wkrótce.
        </div>
      )}

      {submitStatus === "error" && (
        <div className={styles.errorMessage}>
          ❌ Wystąpił błąd. Spróbuj ponownie lub napisz bezpośrednio na email.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Imię i nazwisko</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="subject">Temat</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="message">Wiadomość</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Opisz szczegóły swojego zapytania..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
        </button>
      </form>
    </div>
  );
}

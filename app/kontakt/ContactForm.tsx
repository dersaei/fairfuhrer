"use client";

import { useState, FormEvent } from "react";
import { Mail } from "lucide-react";
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
        alert("Alle Felder sind erforderlich");
        return;
      }

      if (!formData.email.includes("@")) {
        alert("Bitte geben Sie eine gültige E-Mail-Adresse ein");
        return;
      }

      // POPRAWKA: Używamy lokalnego API route zamiast bezpośredniego Directus
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
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
      console.error("Fehler beim Senden:", error);
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
      <div className={styles.headerContainer}>
        <Mail size={48} className={styles.headerIcon} />
        <h2>Senden Sie uns eine Nachricht</h2>
      </div>

      {submitStatus === "success" && (
        <div className={styles.successMessage}>
          ✅ Nachricht gesendet! Wir antworten Ihnen in Kürze!
        </div>
      )}

      {submitStatus === "error" && (
        <div className={styles.errorMessage}>
          ❌ Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder
          schreiben Sie direkt an unsere E-Mail-Adresse.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Name"
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Email"
          />
        </div>

        <div className={styles.formGroup}>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Betreff"
          />
        </div>

        <div className={styles.formGroup}>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            placeholder="Beschreiben Sie Ihr Anliegen im Detail ..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? "Wird gesendet ..." : "Nachricht senden"}
        </button>
      </form>
    </div>
  );
}

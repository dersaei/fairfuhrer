"use client";

import { useState, useCallback } from "react";
import { Mail, AtSign, Phone, MapPin } from "lucide-react";
import { ContactFormContent } from "@/types";
import TurnstileWidget from "@/components/TurnstileWidget";
import styles from "./ContactForm.module.css";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactForm({
  content,
}: {
  content: ContactFormContent | null;
}) {
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

      if (!turnstileToken) {
        alert("Bitte bestätigen Sie, dass Sie kein Roboter sind");
        return;
      }

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
          turnstileToken,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const adresseLines = content?.adresse?.split("\n") ?? [];

  return (
    <div
      className={styles.contactForm}
      style={{ background: content?.background_color ?? undefined }}
    >
      <div className={styles.headerContainer}>
        <Mail size={48} className={styles.headerIcon} />
        <h2
          style={{
            color: content?.title_color ?? undefined,
            fontSize: content?.title_font_size ?? undefined,
          }}
        >
          {content?.title}
        </h2>
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
            autoComplete="name"
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
            autoComplete="email"
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
          disabled={isSubmitting || !turnstileToken}
          className={styles.submitButton}
        >
          {isSubmitting ? "Wird gesendet ..." : "Nachricht senden"}
        </button>
        <div className={styles.formTurnstile}>
          <TurnstileWidget
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onVerify={handleTurnstileVerify}
            onExpire={handleTurnstileExpire}
          />
        </div>
      </form>

      <div className={styles.contactMethods}>
        {content?.email && (
          <div className={styles.contactMethod}>
            <div className={styles.methodIcon}>
              <AtSign size={24} />
            </div>
            <div className={styles.methodContent}>
              <h3>E-mail</h3>
              <p
                style={{
                  fontSize: content.contact_fields_font_size ?? undefined,
                  color: content.contact_fields_color ?? undefined,
                }}
              >
                {content.email}
              </p>
              {content.email_description && (
                <span
                  className={styles.responseTime}
                  style={{
                    fontSize: content.email_description_font_size ?? undefined,
                    color: content.email_description_color ?? undefined,
                  }}
                >
                  {content.email_description}
                </span>
              )}
            </div>
          </div>
        )}

        {content?.telefon && (
          <div className={styles.contactMethod}>
            <div className={styles.methodIcon}>
              <Phone size={24} />
            </div>
            <div className={styles.methodContent}>
              <h3>Telefon</h3>
              <p
                style={{
                  fontSize: content.contact_fields_font_size ?? undefined,
                  color: content.contact_fields_color ?? undefined,
                }}
              >
                {content.telefon}
              </p>
            </div>
          </div>
        )}

        {adresseLines.length > 0 && (
          <div className={styles.contactMethod}>
            <div className={styles.methodIcon}>
              <MapPin size={24} />
            </div>
            <div className={styles.methodContent}>
              <h3>Adresse</h3>
              <p
                style={{
                  fontSize: content?.contact_fields_font_size ?? undefined,
                  color: content?.contact_fields_color ?? undefined,
                }}
              >
                {adresseLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < adresseLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

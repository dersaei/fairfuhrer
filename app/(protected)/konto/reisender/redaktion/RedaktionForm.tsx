"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { RedaktionPageContent } from "@/types";
import styles from "./redaktion.module.css";

// Upload pliku przez /api/directus-upload (server-side, uses DIRECTUS_TOKEN).
async function uploadToDirectus(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/directus-upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload fehlgeschlagen.");
  const data = await res.json();
  return data.id as string;
}

// Mapbox geocoding — reuse tego samego wzorca co Partner audiopin.
interface GeocodingSuggestion {
  place_name: string;
  center: [number, number];
  context?: { id: string; text: string }[];
  text: string;
  address?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

async function fetchGeo(
  q: string,
  setSuggestions: (s: GeocodingSuggestion[]) => void,
  setLoading: (b: boolean) => void,
) {
  if (q.trim().length < 3 || !MAPBOX_TOKEN) {
    setSuggestions([]);
    return;
  }
  setLoading(true);
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      q,
    )}.json?language=de&limit=5&types=address,poi&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    const json = await res.json();
    setSuggestions(json.features ?? []);
  } catch {
    setSuggestions([]);
  } finally {
    setLoading(false);
  }
}

// Fallback-Texte, jesli Directus nie zwraca contentu.
const DEFAULTS = {
  title: "Redaktion",
  subtitle:
    "Kennst du eine besondere Sehenswürdigkeit, die auf unsere Karte gehört? Als Teil unserer Redaktion kannst du selbst einen vollständigen Audiopin für die Kategorie **Sehenswertes** erstellen — kostenlos und unbegrenzt.",
  label_name: "Name des Ortes",
  label_adresse: "Straße & Hausnummer",
  label_stadt: "Stadt",
  label_land: "Land",
  label_beschreibung: "Beschreibung",
  label_titelbild: "Titelbild",
  label_audio: "Audiodatei",
  label_galerie: "Galerie (max. 6 Bilder)",
  hint_moderation:
    "Alle eingereichten Pins werden vor der Veröffentlichung von unserem Team geprüft.",
  button_text: "Einreichen",
  button_sending_text: "Wird gesendet…",
  success_message:
    "Vielen Dank! Dein Pin wurde eingereicht und wird nun redaktionell geprüft.",
  error_message: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
};

export default function RedaktionForm({
  content,
}: {
  content?: RedaktionPageContent | null;
}) {
  const { user } = useAuth();
  const t = {
    title: content?.title || DEFAULTS.title,
    subtitle: content?.subtitle || DEFAULTS.subtitle,
    label_name: content?.label_name || DEFAULTS.label_name,
    label_adresse: content?.label_adresse || DEFAULTS.label_adresse,
    label_stadt: content?.label_stadt || DEFAULTS.label_stadt,
    label_land: content?.label_land || DEFAULTS.label_land,
    label_beschreibung: content?.label_beschreibung || DEFAULTS.label_beschreibung,
    label_titelbild: content?.label_titelbild || DEFAULTS.label_titelbild,
    label_audio: content?.label_audio || DEFAULTS.label_audio,
    label_galerie: content?.label_galerie || DEFAULTS.label_galerie,
    hint_moderation: content?.hint_moderation || DEFAULTS.hint_moderation,
    button_text: content?.button_text || DEFAULTS.button_text,
    button_sending_text: content?.button_sending_text || DEFAULTS.button_sending_text,
    success_message: content?.success_message || DEFAULTS.success_message,
    error_message: content?.error_message || DEFAULTS.error_message,
  };

  // Form fields
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [stadt, setStadt] = useState("");
  const [land, setLand] = useState("");
  const [vollbeschreibung, setVollbeschreibung] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // Mapbox autocomplete
  const [geoQuery, setGeoQuery] = useState("");
  const [geoSuggestions, setGeoSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Uploads
  const [titelbildId, setTitelbildId] = useState<string | null>(null);
  const [titelbildPreview, setTitelbildPreview] = useState<string | null>(null);
  const [titelbildUploading, setTitelbildUploading] = useState(false);
  const [titelbildError, setTitelbildError] = useState<string | null>(null);
  const titelbildRef = useRef<HTMLInputElement>(null);

  const [audioId, setAudioId] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  const [galerieIds, setGalerieIds] = useState<string[]>([]);
  const [galeriePreviews, setGaleriePreviews] = useState<string[]>([]);
  const [galerieUploading, setGalerieUploading] = useState(false);
  const [galerieError, setGalerieError] = useState<string | null>(null);
  const galerieRef = useRef<HTMLInputElement>(null);

  // Submit state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Mapbox handlers ──
  function handleGeoQueryChange(value: string) {
    setGeoQuery(value);
    setAdresse(value);
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(
      () => fetchGeo(value, setGeoSuggestions, setGeoLoading),
      300,
    );
  }

  function selectGeoSuggestion(s: GeocodingSuggestion) {
    const [lng, lat] = s.center;
    const plzContext = s.context?.find((c) => c.id.startsWith("postcode."));
    const cityContext = s.context?.find((c) => c.id.startsWith("place."));
    const countryContext = s.context?.find((c) => c.id.startsWith("country."));
    const streetPart = s.address ? `${s.text} ${s.address}` : s.text;
    const adressPart = plzContext ? `${streetPart}, ${plzContext.text}` : streetPart;
    setAdresse(adressPart);
    setGeoQuery(s.place_name);
    setCoordinates({ lat, lng });
    if (cityContext) setStadt(cityContext.text);
    if (countryContext) setLand(countryContext.text);
    setGeoSuggestions([]);
  }

  // ── Upload handlers ──
  async function handleTitelbildUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTitelbildError(null);
    setTitelbildUploading(true);
    try {
      const id = await uploadToDirectus(file);
      setTitelbildId(id);
      setTitelbildPreview(URL.createObjectURL(file));
    } catch {
      setTitelbildError("Fehler beim Hochladen.");
    } finally {
      setTitelbildUploading(false);
      if (titelbildRef.current) titelbildRef.current.value = "";
    }
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError(null);
    setAudioUploading(true);
    try {
      const id = await uploadToDirectus(file);
      setAudioId(id);
      setAudioPreview(URL.createObjectURL(file));
    } catch {
      setAudioError("Fehler beim Hochladen.");
    } finally {
      setAudioUploading(false);
      if (audioRef.current) audioRef.current.value = "";
    }
  }

  async function handleGalerieUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 6 - galerieIds.length;
    if (remaining <= 0) {
      setGalerieError("Maximal 6 Bilder erlaubt.");
      return;
    }
    setGalerieError(null);
    setGalerieUploading(true);
    try {
      const newIds: string[] = [];
      const newPreviews: string[] = [];
      for (const file of files.slice(0, remaining)) {
        newIds.push(await uploadToDirectus(file));
        newPreviews.push(URL.createObjectURL(file));
      }
      setGalerieIds((p) => [...p, ...newIds]);
      setGaleriePreviews((p) => [...p, ...newPreviews]);
    } catch {
      setGalerieError("Fehler beim Hochladen.");
    } finally {
      setGalerieUploading(false);
      if (galerieRef.current) galerieRef.current.value = "";
    }
  }

  function removeGalerieItem(idx: number) {
    setGalerieIds((p) => p.filter((_, i) => i !== idx));
    setGaleriePreviews((p) => p.filter((_, i) => i !== idx));
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name ist erforderlich.";
    if (!adresse.trim()) errors.adresse = "Adresse ist erforderlich.";
    if (!stadt.trim()) errors.stadt = "Stadt ist erforderlich.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/redaktion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name.trim(),
          Adresse: adresse.trim(),
          Stadt: stadt.trim(),
          Land: land.trim() || null,
          Breite: coordinates?.lat ?? null,
          Lange: coordinates?.lng ?? null,
          Vollbeschreibung: vollbeschreibung.trim() || null,
          Titelbild: titelbildId ?? null,
          Audio: audioId ?? null,
          Galerie: galerieIds.length > 0 ? galerieIds : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? t.error_message);
        setIsSubmitting(false);
        return;
      }
      setSuccess(true);
      // Reset form
      setName("");
      setAdresse("");
      setStadt("");
      setLand("");
      setVollbeschreibung("");
      setCoordinates(null);
      setGeoQuery("");
      setTitelbildId(null);
      setTitelbildPreview(null);
      setAudioId(null);
      setAudioPreview(null);
      setGalerieIds([]);
      setGaleriePreviews([]);
    } catch {
      setSubmitError(t.error_message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) return null;

  if (success) {
    return (
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{t.title}</h1>
        <div className={styles.successBox}>
          <p className={styles.successText}>{t.success_message}</p>
          <button
            type="button"
            className={styles.newPinBtn}
            onClick={() => setSuccess(false)}
          >
            Neuen Pin einreichen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t.title}</h1>
      <div
        className={styles.subtitle}
        // Markdown z Directus renderowany prosto — same paragrafy + bold.
        // Uzywamy dangerouslySetInnerHTML tylko dla contentu z Directus (trusted).
        dangerouslySetInnerHTML={{
          __html: t.subtitle
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n{2,}/g, "</p><p>")
            .replace(/^/, "<p>")
            .replace(/$/, "</p>"),
        }}
      />

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {submitError && <p className={styles.errorMessage}>{submitError}</p>}

        {/* Name — na gorze, poniewaz to najwazniejsze pole. */}
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            {t.label_name}
          </label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />
          {fieldErrors.name && (
            <p className={styles.fieldError}>{fieldErrors.name}</p>
          )}
        </div>

        {/* Adresse — Mapbox autocomplete */}
        <div className={styles.field}>
          <label htmlFor="geoQuery" className={styles.label}>
            {t.label_adresse}
          </label>
          <input
            id="geoQuery"
            type="text"
            className={styles.input}
            value={geoQuery}
            onChange={(e) => handleGeoQueryChange(e.target.value)}
            autoComplete="off"
          />
          {geoLoading && <p className={styles.hint}>Suche…</p>}
          {geoSuggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {geoSuggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={styles.suggestionBtn}
                    onClick={() => selectGeoSuggestion(s)}
                  >
                    {s.place_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {fieldErrors.adresse && (
            <p className={styles.fieldError}>{fieldErrors.adresse}</p>
          )}
        </div>

        {/* Stadt + Land — pod-pola */}
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label htmlFor="stadt" className={styles.label}>
              {t.label_stadt}
            </label>
            <input
              id="stadt"
              type="text"
              className={styles.input}
              value={stadt}
              onChange={(e) => setStadt(e.target.value)}
              autoComplete="off"
            />
            {fieldErrors.stadt && (
              <p className={styles.fieldError}>{fieldErrors.stadt}</p>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="land" className={styles.label}>
              {t.label_land}
            </label>
            <input
              id="land"
              type="text"
              className={styles.input}
              value={land}
              onChange={(e) => setLand(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Beschreibung */}
        <div className={styles.field}>
          <label htmlFor="vollbeschreibung" className={styles.label}>
            {t.label_beschreibung}
          </label>
          <textarea
            id="vollbeschreibung"
            className={styles.textarea}
            value={vollbeschreibung}
            onChange={(e) => setVollbeschreibung(e.target.value)}
            rows={5}
          />
        </div>

        {/* Titelbild */}
        <div className={styles.field}>
          <label className={styles.label}>{t.label_titelbild}</label>
          {titelbildPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={titelbildPreview}
              alt="Titelbild"
              className={styles.imagePreview}
            />
          ) : (
            <p className={styles.hint}>Noch kein Bild hochgeladen.</p>
          )}
          <input
            ref={titelbildRef}
            type="file"
            accept="image/*"
            onChange={handleTitelbildUpload}
            className={styles.fileInput}
          />
          {titelbildUploading && <p className={styles.hint}>Wird hochgeladen…</p>}
          {titelbildError && (
            <p className={styles.fieldError}>{titelbildError}</p>
          )}
        </div>

        {/* Audio */}
        <div className={styles.field}>
          <label className={styles.label}>{t.label_audio}</label>
          {audioPreview ? (
            <audio src={audioPreview} controls className={styles.audioPreview} />
          ) : (
            <p className={styles.hint}>Noch keine Datei hochgeladen.</p>
          )}
          <input
            ref={audioRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className={styles.fileInput}
          />
          {audioUploading && <p className={styles.hint}>Wird hochgeladen…</p>}
          {audioError && <p className={styles.fieldError}>{audioError}</p>}
        </div>

        {/* Galerie */}
        <div className={styles.field}>
          <label className={styles.label}>{t.label_galerie}</label>
          {galeriePreviews.length > 0 && (
            <div className={styles.galleryGrid}>
              {galeriePreviews.map((preview, i) => (
                <div key={i} className={styles.galleryItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={`Galerie ${i + 1}`}
                    className={styles.galleryImg}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeGalerieItem(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {galerieIds.length < 6 && (
            <input
              ref={galerieRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalerieUpload}
              className={styles.fileInput}
            />
          )}
          {galerieUploading && <p className={styles.hint}>Wird hochgeladen…</p>}
          {galerieError && <p className={styles.fieldError}>{galerieError}</p>}
        </div>

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? t.button_sending_text : t.button_text}
        </button>

        <p className={styles.hintCentered}>{t.hint_moderation}</p>
      </form>
    </div>
  );
}

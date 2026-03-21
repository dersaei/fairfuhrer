"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import styles from "./audiopin.module.css";

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

const KATEGORIEN = [
  { id: 1, name: "Erlebnisse" },
  { id: 2, name: "Gastronomie & Übernachten" },
  { id: 3, name: "Einkaufen" },
  { id: 5, name: "Engagement" },
  { id: 8, name: "Unternehmen" },
];

const ZERTIFIZIERUNGEN = [
  { id: "0b65943d-f041-4ba4-8977-f1130182b165", name: "Bioland" },
  { id: "316f5bd4-1161-4987-975e-0ceb58fb260c", name: "Unverpackt Verband" },
  { id: "3a2f6b5e-5573-4268-a730-9de111f0c2b1", name: "Fairtrade" },
  { id: "434a2b04-3a73-49c0-8ed0-2fb76ce5da40", name: "Fairbusiness" },
  { id: "613717b2-ba00-45b8-9f3d-bbd834b0497a", name: "Naturland fair" },
  { id: "85cc8c45-bbfd-4324-af38-4b6ae5789588", name: "Cradle to Cradle" },
  { id: "875901cf-245d-4892-aa92-752a60d7fc21", name: "GWÖ" },
  { id: "d454e097-1a75-481a-939e-8e2b85359561", name: "Demeter" },
  { id: "df8d53d4-03a7-472e-9275-4709c87354e0", name: "Bürgerkarte" },
];

interface GeocodingSuggestion {
  place_name: string;
  center: [number, number];
  context?: { id: string; text: string }[];
  text: string;
  address?: string;
}

export default function AudiopinPage() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  // Adres i lokalizacja
  const [adresse, setAdresse] = useState("");
  const [stadt, setStadt] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoQuery, setGeoQuery] = useState("");
  const [geoSuggestions, setGeoSuggestions] = useState<GeocodingSuggestion[]>(
    [],
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Podstawowe dane
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [vollbeschreibung, setVollbeschreibung] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Kategorie i certyfikaty (MTM)
  const [kategorien, setKategorien] = useState<number[]>([]);
  const [zertifizierungen, setZertifizierungen] = useState<string[]>([]);

  // Titelbild
  const [titelbildId, setTitelbildId] = useState<string | null>(null);
  const [titelbildPreview, setTitelbildPreview] = useState<string | null>(null);
  const [titelbildUploading, setTitelbildUploading] = useState(false);
  const [titelbildError, setTitelbildError] = useState<string | null>(null);
  const titelbildRef = useRef<HTMLInputElement>(null);

  // Galerie (do 6 zdjęć) — tylko premium
  const [galerieIds, setGalerieIds] = useState<string[]>([]);
  const [galeriePreviews, setGaleriePreviews] = useState<string[]>([]);
  const [galerieUploading, setGalerieUploading] = useState(false);
  const [galerieError, setGalerieError] = useState<string | null>(null);
  const galerieRef = useRef<HTMLInputElement>(null);

  // Audio
  const [audioId, setAudioId] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  // Formularz
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sprawdź premium status i czy pin już wysłany
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("partner_profiles")
      .select("premium_until, pin_id")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.premium_until) {
          setIsPremium(new Date(data.premium_until) > new Date());
        }
        if (data?.pin_id) {
          setSubmitSuccess(true);
        }
        setPremiumChecked(true);
      });
  }, [user]);

  // Mapbox Geocoding API — autocomplete
  async function fetchGeoSuggestions(query: string) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || query.length < 3) {
      setGeoSuggestions([]);
      return;
    }
    setGeoLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&language=de&types=address,place&limit=5`;
      const res = await fetch(url);
      const data = await res.json();
      setGeoSuggestions(data.features ?? []);
    } catch {
      setGeoSuggestions([]);
    } finally {
      setGeoLoading(false);
    }
  }

  function handleGeoQueryChange(value: string) {
    setGeoQuery(value);
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(() => fetchGeoSuggestions(value), 300);
  }

  function selectGeoSuggestion(suggestion: GeocodingSuggestion) {
    const [lng, lat] = suggestion.center;
    setCoordinates({ lat, lng });

    // Wyciągnij ulicę i miasto z kontekstu
    const adressPart = suggestion.address
      ? `${suggestion.text} ${suggestion.address}`
      : suggestion.text;
    const cityContext = suggestion.context?.find((c) =>
      c.id.startsWith("place."),
    );

    setAdresse(adressPart);
    if (cityContext) setStadt(cityContext.text);
    setGeoQuery(suggestion.place_name);
    setGeoSuggestions([]);
  }

  function toggleMulti<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

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
      setTitelbildError("Fehler beim Hochladen des Titelbildes.");
    } finally {
      setTitelbildUploading(false);
      if (titelbildRef.current) titelbildRef.current.value = "";
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
    const toUpload = files.slice(0, remaining);
    setGalerieError(null);
    setGalerieUploading(true);
    try {
      const newIds: string[] = [];
      const newPreviews: string[] = [];
      for (const file of toUpload) {
        const id = await uploadToDirectus(file);
        newIds.push(id);
        newPreviews.push(URL.createObjectURL(file));
      }
      setGalerieIds((prev) => [...prev, ...newIds]);
      setGaleriePreviews((prev) => [...prev, ...newPreviews]);
    } catch {
      setGalerieError("Fehler beim Hochladen der Galeriebilder.");
    } finally {
      setGalerieUploading(false);
      if (galerieRef.current) galerieRef.current.value = "";
    }
  }

  function removeGalerieBild(index: number) {
    setGalerieIds((prev) => prev.filter((_, i) => i !== index));
    setGaleriePreviews((prev) => prev.filter((_, i) => i !== index));
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
      setAudioError("Fehler beim Hochladen der Audiodatei.");
    } finally {
      setAudioUploading(false);
      if (audioRef.current) audioRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name ist erforderlich.";
    if (!adresse.trim()) errors.adresse = "Adresse ist erforderlich.";
    if (!stadt.trim()) errors.stadt = "Stadt ist erforderlich.";
    if (kategorien.length === 0)
      errors.kategorien = "Bitte mindestens eine Kategorie wählen.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const res = await fetch("/api/audiopin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name.trim(),
          Adresse: adresse.trim(),
          Stadt: stadt.trim(),
          Breite: coordinates?.lat ?? null,
          Lange: coordinates?.lng ?? null,
          Telefon: isPremium ? telefon.trim() || null : null,
          Vollbeschreibung: vollbeschreibung.trim() || null,
          Link_URL: isPremium ? linkUrl.trim() || null : null,
          Link_Text: isPremium ? linkText.trim() || null : null,
          Kategorie: kategorien,
          Zertifizierungen: zertifizierungen,
          Titelbild: titelbildId ?? null,
          Galerie_Bilder:
            isPremium && galerieIds.length > 0 ? galerieIds : null,
          Audio: audioId ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Fehler beim Speichern.");
        return;
      }

      setSubmitSuccess(true);
      setName("");
      setAdresse("");
      setStadt("");
      setCoordinates(null);

      setTelefon("");
      setVollbeschreibung("");
      setLinkUrl("");
      setLinkText("");
      setKategorien([]);
      setZertifizierungen([]);
      setTitelbildId(null);
      setTitelbildPreview(null);
      setGalerieIds([]);
      setGaleriePreviews([]);
      setAudioId(null);
      setAudioPreview(null);
    } catch {
      setSubmitError(
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!premiumChecked) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>
        Du kannst unser Formular ausfüllen und deinen eigenen Audiopin
        erstellen, der auf unsere Karte kommt.
        <br />
        Wir freuen uns auf deine Einsendung.
      </h3>

      {!isPremium && (
        <p className={styles.freeAccountInfo}>
          Mit deinem kostenlosen Konto kannst du einen Audiopin nur einmal
          einreichen und hast nur begrenzte Felder zum Ausfüllen. Nach der
          Einreichung lässt sich der Audiopin nicht mehr bearbeiten. Dein Pin
          wird zunächst von unserem Team geprüft und erst nach Freigabe auf der
          Karte sichtbar. Wenn du mehr Funktionen brauchst und deinen Pin sofort
          veröffentlichen möchtest, upgradiere zu unserem{" "}
          <strong className={styles.premiumBadge}>Premium-Plan</strong>.
        </p>
      )}

      {!isPremium && !submitSuccess && (
        <div className={styles.premiumBanner}>
          Einige Felder sind nur für Premium-Konten verfügbar.{" "}
          <strong>Jetzt upgraden</strong>, um alle Funktionen freizuschalten.
        </div>
      )}

      {submitSuccess && !isPremium && (
        <div className={styles.premiumBanner}>
          Ihr Audiopin wurde eingereicht. Um Änderungen vorzunehmen,{" "}
          <strong>upgraden Sie auf Premium</strong>.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`${styles.form} ${submitSuccess ? styles.formDisabled : ""}`}
        noValidate
      >
        {/* Grunddaten */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Grunddaten</legend>

          <div className={styles.field}>
            <label htmlFor="pin-name" className={styles.label}>
              Name des Ortes
            </label>
            <input
              id="pin-name"
              type="text"
              className={`${styles.input} ${fieldErrors.name ? styles.inputError : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name && (
              <span className={styles.fieldError}>{fieldErrors.name}</span>
            )}
          </div>

          {/* Adresse — autocomplete via Mapbox Geocoding API */}
          <div className={styles.field}>
            <label htmlFor="pin-geo" className={styles.label}>
              Adresse suchen
            </label>
            <div className={styles.geoWrapper}>
              <input
                id="pin-geo"
                type="text"
                className={`${styles.input} ${fieldErrors.adresse || fieldErrors.stadt ? styles.inputError : ""}`}
                value={geoQuery}
                onChange={(e) => handleGeoQueryChange(e.target.value)}
                onBlur={() => setTimeout(() => setGeoSuggestions([]), 150)}
                placeholder="Straße, Stadt…"
                autoComplete="off"
              />
              {geoLoading && <span className={styles.geoLoading}>Suche…</span>}
              {geoSuggestions.length > 0 && (
                <ul className={styles.geoDropdown}>
                  {geoSuggestions.map((s) => (
                    <li
                      key={s.place_name}
                      className={styles.geoDropdownItem}
                      onMouseDown={() => selectGeoSuggestion(s)}
                    >
                      {s.place_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {!coordinates && !fieldErrors.adresse && !fieldErrors.stadt && (
              <span className={styles.geoHint}>
                Bitte wählen Sie eine Adresse aus der Vorschlagsliste aus.
              </span>
            )}
            {(fieldErrors.adresse || fieldErrors.stadt) && (
              <span className={styles.fieldError}>
                Bitte wählen Sie eine Adresse aus der Vorschlagsliste.
              </span>
            )}
          </div>

          {/* Pola wypełniane automatycznie przez autocomplete — readonly */}
          {coordinates && (
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="pin-adresse" className={styles.label}>
                  Straße und Hausnummer
                </label>
                <input
                  id="pin-adresse"
                  type="text"
                  className={`${styles.input} ${styles.inputReadonly}`}
                  value={adresse}
                  readOnly
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pin-stadt" className={styles.label}>
                  Stadt
                </label>
                <input
                  id="pin-stadt"
                  type="text"
                  className={`${styles.input} ${styles.inputReadonly}`}
                  value={stadt}
                  readOnly
                />
              </div>
            </div>
          )}

          {/* Telefon — tylko premium */}
          <div
            className={`${styles.field} ${!isPremium ? styles.premiumLocked : ""}`}
          >
            <label htmlFor="pin-telefon" className={styles.label}>
              Telefon
              {!isPremium && (
                <span className={styles.premiumBadge}>Premium</span>
              )}
            </label>
            <input
              id="pin-telefon"
              type="tel"
              className={styles.input}
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              disabled={!isPremium}
              placeholder={!isPremium ? "Nur für Premium-Konten" : ""}
            />
          </div>
        </fieldset>

        {/* Beschreibung */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Beschreibung</legend>

          <div className={styles.field}>
            <label htmlFor="pin-beschreibung" className={styles.label}>
              Vollständige Beschreibung
            </label>
            <textarea
              id="pin-beschreibung"
              className={styles.textarea}
              value={vollbeschreibung}
              onChange={(e) => setVollbeschreibung(e.target.value)}
              rows={6}
            />
          </div>

          {/* Link — tylko premium */}
          <div
            className={`${styles.fieldRow} ${!isPremium ? styles.premiumLocked : ""}`}
          >
            <div className={styles.field}>
              <label htmlFor="pin-link-url" className={styles.label}>
                Website-Link (URL)
                {!isPremium && (
                  <span className={styles.premiumBadge}>Premium</span>
                )}
              </label>
              <input
                id="pin-link-url"
                type="url"
                className={styles.input}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder={
                  !isPremium ? "Nur für Premium-Konten" : "https://…"
                }
                disabled={!isPremium}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="pin-link-text" className={styles.label}>
                Link-Text
                {!isPremium && (
                  <span className={styles.premiumBadge}>Premium</span>
                )}
              </label>
              <input
                id="pin-link-text"
                type="text"
                className={styles.input}
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder={
                  !isPremium ? "Nur für Premium-Konten" : "z.B. Unsere Website"
                }
                disabled={!isPremium}
              />
            </div>
          </div>
        </fieldset>

        {/* Kategorien */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Kategorien</legend>
          {fieldErrors.kategorien && (
            <span className={styles.fieldError}>{fieldErrors.kategorien}</span>
          )}
          <div className={styles.checkboxGroup}>
            {KATEGORIEN.map((kat) => (
              <label key={kat.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={kategorien.includes(kat.id)}
                  onChange={() =>
                    setKategorien((prev) => toggleMulti(prev, kat.id))
                  }
                />
                {kat.name}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Zertifizierungen */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Zertifizierungen</legend>
          <div className={styles.checkboxGroup}>
            {ZERTIFIZIERUNGEN.map((zert) => (
              <label key={zert.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={zertifizierungen.includes(zert.id)}
                  onChange={() =>
                    setZertifizierungen((prev) => toggleMulti(prev, zert.id))
                  }
                />
                {zert.name}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Titelbild */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Titelbild</legend>
          <p className={styles.hint}>
            Hauptbild des Pins (JPG, PNG, WebP — max. 5 MB).
          </p>
          {titelbildPreview && (
            <div className={styles.titelbildPreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={titelbildPreview}
                alt="Titelbild"
                className={styles.titelbildImg}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  setTitelbildId(null);
                  setTitelbildPreview(null);
                }}
              >
                Entfernen
              </button>
            </div>
          )}
          {!titelbildPreview && (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => titelbildRef.current?.click()}
              disabled={titelbildUploading}
            >
              {titelbildUploading ? "Wird hochgeladen…" : "Bild hochladen"}
            </button>
          )}
          {titelbildError && (
            <p className={styles.uploadError}>{titelbildError}</p>
          )}
          <input
            ref={titelbildRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Titelbild hochladen"
            className={styles.hiddenInput}
            onChange={handleTitelbildUpload}
          />
        </fieldset>

        {/* Galerie — tylko premium */}
        <fieldset
          className={`${styles.fieldset} ${!isPremium ? styles.premiumLocked : ""}`}
        >
          <legend className={styles.legend}>
            Bildergalerie (max. 6 Bilder)
            {!isPremium && <span className={styles.premiumBadge}>Premium</span>}
          </legend>
          {!isPremium ? (
            <p className={styles.hint}>
              Die Bildergalerie ist nur für Premium-Konten verfügbar.
            </p>
          ) : (
            <>
              <p className={styles.hint}>
                Laden Sie bis zu 6 Bilder für die Galerie hoch (JPG, PNG, WebP).
              </p>
              {galeriePreviews.length > 0 && (
                <div className={styles.galerieGrid}>
                  {galeriePreviews.map((url, i) => (
                    <div key={url} className={styles.galerieItem}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className={styles.galerieImg} />
                      <button
                        type="button"
                        className={styles.removeButtonSmall}
                        onClick={() => removeGalerieBild(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {galerieIds.length < 6 && (
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => galerieRef.current?.click()}
                  disabled={galerieUploading}
                >
                  {galerieUploading
                    ? "Wird hochgeladen…"
                    : `Bilder hinzufügen (${galerieIds.length}/6)`}
                </button>
              )}
              {galerieError && (
                <p className={styles.uploadError}>{galerieError}</p>
              )}
              <input
                ref={galerieRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                aria-label="Galeriebilder hochladen"
                className={styles.hiddenInput}
                onChange={handleGalerieUpload}
              />
            </>
          )}
        </fieldset>

        {/* Audio */}
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Audiodatei</legend>
          <p className={styles.hint}>
            Laden Sie eine Audiodatei für den Audiopin hoch (MP3, M4A, WAV —
            max. 50 MB).
          </p>
          {audioPreview ? (
            <div className={styles.audioPreview}>
              <audio
                controls
                src={audioPreview}
                className={styles.audioPlayer}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => {
                  setAudioId(null);
                  setAudioPreview(null);
                }}
              >
                Entfernen
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => audioRef.current?.click()}
              disabled={audioUploading}
            >
              {audioUploading ? "Wird hochgeladen…" : "Audiodatei hochladen"}
            </button>
          )}
          {audioError && <p className={styles.uploadError}>{audioError}</p>}
          <input
            ref={audioRef}
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
            aria-label="Audiodatei hochladen"
            className={styles.hiddenInput}
            onChange={handleAudioUpload}
          />
        </fieldset>

        {!submitSuccess && (
          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? "Wird eingereicht…" : "Audiopin einreichen"}
          </button>
        )}
        {submitSuccess && (
          <p className={styles.successMessage}>
            Ihr Audiopin wurde erfolgreich eingereicht und wird in Kürze
            geprüft.
          </p>
        )}
        {submitError && <p className={styles.errorMessage}>{submitError}</p>}
      </form>
    </div>
  );
}

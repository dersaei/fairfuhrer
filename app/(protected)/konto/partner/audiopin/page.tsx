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
  { id: 1, name: "Sehenswertes" },
  { id: 2, name: "Essen & Übernachten" },
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

interface GalerieItem {
  junctionId: number | string;
  fileId: string;
  preview: string;
  isNew?: boolean;
}

interface PinData {
  id: number;
  Name: string;
  Adresse: string;
  Stadt: string;
  Land: string | null;
  Telefon: string | null;
  Vollbeschreibung: string | null;
  Link_URL: string | null;
  Link_Text: string | null;
  Titelbild: string | null;
  Audio: string | null;
  location: { type: string; coordinates: [number, number] } | null;
  Galerie: { id: number; directus_files_id: string }[];
  Kategorie: { Kategorie_id: number }[];
  Zertifizierungen: { Zertifizierungen_id: string }[];
}

// Proxy przez nasz API dla plików wymagających autoryzacji (galeria, titelbild, audio partnera)
function assetUrl(uuid: string) {
  return `/api/asset/${uuid}`;
}

export default function AudiopinPage() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  // Tryby strony
  type PageMode = "loading" | "new_form" | "view" | "submitting";
  const [mode, setMode] = useState<PageMode>("loading");
  const [pinId, setPinId] = useState<number | null>(null);
  const [pinData, setPinData] = useState<PinData | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  // Które pola są w trybie edycji (per-field)
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
  const [fieldSaveErrors, setFieldSaveErrors] = useState<
    Record<string, string>
  >({});
  const [fieldSaveSuccess, setFieldSaveSuccess] = useState<
    Record<string, boolean>
  >({});

  // Wartości edytowanych pól (lokalne kopie)
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});

  // Galerie edycja
  const [galerieItems, setGalerieItems] = useState<GalerieItem[]>([]);
  const [galerieUploading, setGalerieUploading] = useState(false);
  const [galerieError, setGalerieError] = useState<string | null>(null);
  const galerieRef = useRef<HTMLInputElement>(null);

  // Geocoding (tylko przy edycji adresu)
  const [geoSuggestions, setGeoSuggestions] = useState<GeocodingSuggestion[]>(
    [],
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const geoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nowy formularz (gdy brak pina)
  const [adresse, setAdresse] = useState("");
  const [stadt, setStadt] = useState("");
  const [land, setLand] = useState("");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoQuery, setGeoQuery] = useState("");
  const [geoSuggestionsNew, setGeoSuggestionsNew] = useState<
    GeocodingSuggestion[]
  >([]);
  const [geoLoadingNew, setGeoLoadingNew] = useState(false);
  const geoDebounceNewRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");
  const [vollbeschreibung, setVollbeschreibung] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [kategorien, setKategorien] = useState<number[]>([]);
  const [zertifizierungen, setZertifizierungen] = useState<string[]>([]);
  const [titelbildId, setTitelbildId] = useState<string | null>(null);
  const [titelbildPreview, setTitelbildPreview] = useState<string | null>(null);
  const [titelbildUploading, setTitelbildUploading] = useState(false);
  const [titelbildError, setTitelbildError] = useState<string | null>(null);
  const titelbildRef = useRef<HTMLInputElement>(null);
  const [galerieIds, setGalerieIds] = useState<string[]>([]);
  const [galeriePreviews, setGaleriePreviews] = useState<string[]>([]);
  const [galerieUploadingNew, setGalerieUploadingNew] = useState(false);
  const [galerieErrorNew, setGalerieErrorNew] = useState<string | null>(null);
  const galerieRefNew = useRef<HTMLInputElement>(null);
  const [audioId, setAudioId] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Załaduj status premium i pin_id
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    supabase
      .from("partner_profiles")
      .select("premium_until, pin_id")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const premium = data?.premium_until
          ? new Date(data.premium_until) > new Date()
          : false;
        setIsPremium(premium);
        if (data?.pin_id) {
          setPinId(data.pin_id);
          setMode("view");
        } else {
          setMode("new_form");
        }
        setPremiumChecked(true);
      });
  }, [user]);

  // Załaduj dane pina gdy tryb view
  useEffect(() => {
    if (mode !== "view" || !pinId) return;
    setPinLoading(true);
    fetch(`/api/audiopin/${pinId}`)
      .then((r) => r.json())
      .then((data: PinData) => {
        setPinData(data);
        const items = (data.Galerie ?? []).map((g) => ({
          junctionId: g.id,
          fileId: g.directus_files_id,
          preview: assetUrl(g.directus_files_id),
        }));
        setGalerieItems(items);
      })
      .catch(() => {})
      .finally(() => setPinLoading(false));
  }, [mode, pinId]);

  // ======== Helpers per-field edit ========

  function startEdit(field: string, currentValue: unknown) {
    setEditingFields((prev) => new Set(prev).add(field));
    setEditValues((prev) => ({ ...prev, [field]: currentValue }));
    setFieldSaveErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
    setFieldSaveSuccess((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  }

  function cancelEdit(field: string) {
    setEditingFields((prev) => {
      const n = new Set(prev);
      n.delete(field);
      return n;
    });
    setEditValues((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  }

  async function saveField(field: string, value: unknown) {
    if (!pinId) return;
    setSavingFields((prev) => new Set(prev).add(field));
    setFieldSaveErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
    try {
      // Specjalne przypadki wymagające dodatkowych danych
      let payload: Record<string, unknown>;
      if (field === "adresse_group") {
        payload = {
          Adresse: editValues.Adresse,
          Stadt: editValues.Stadt,
          Land: editValues.Land,
          ...(editValues.location ? { location: editValues.location } : {}),
        };
      } else if (field === "Kategorie") {
        const currentIds = (pinData?.Kategorie ?? []).map(
          (k) => k.Kategorie_id,
        );
        payload = {
          Kategorie: value,
          Kategorie_delete: currentIds,
        };
      } else if (field === "Zertifizierungen") {
        const currentIds = (pinData?.Zertifizierungen ?? []).map(
          (z) => z.Zertifizierungen_id,
        );
        payload = {
          Zertifizierungen: value,
          Zertifizierungen_delete: currentIds,
        };
      } else {
        payload = { [field]: value };
      }

      const res = await fetch(`/api/audiopin/${pinId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldSaveErrors((prev) => ({
          ...prev,
          [field]: data.error ?? "Fehler.",
        }));
        return;
      }
      // Aktualizuj lokalne dane pina
      if (field === "adresse_group") {
        setPinData((prev) =>
          prev
            ? {
                ...prev,
                Adresse: (editValues.Adresse as string) ?? prev.Adresse,
                Stadt: (editValues.Stadt as string) ?? prev.Stadt,
                Land: (editValues.Land as string) ?? prev.Land,
              }
            : prev,
        );
      } else if (field === "Kategorie") {
        setPinData((prev) =>
          prev
            ? {
                ...prev,
                Kategorie: (value as number[]).map((id) => ({
                  Kategorie_id: id,
                })),
              }
            : prev,
        );
      } else if (field === "Zertifizierungen") {
        setPinData((prev) =>
          prev
            ? {
                ...prev,
                Zertifizierungen: (value as string[]).map((id) => ({
                  Zertifizierungen_id: id,
                })),
              }
            : prev,
        );
      } else {
        setPinData((prev) => (prev ? { ...prev, [field]: value } : prev));
      }
      setFieldSaveSuccess((prev) => ({ ...prev, [field]: true }));
      setEditingFields((prev) => {
        const n = new Set(prev);
        n.delete(field);
        return n;
      });
      setTimeout(
        () =>
          setFieldSaveSuccess((prev) => {
            const n = { ...prev };
            delete n[field];
            return n;
          }),
        3000,
      );
    } catch {
      setFieldSaveErrors((prev) => ({ ...prev, [field]: "Netzwerkfehler." }));
    } finally {
      setSavingFields((prev) => {
        const n = new Set(prev);
        n.delete(field);
        return n;
      });
    }
  }

  // ======== Geocoding ========

  async function fetchGeo(
    query: string,
    setSuggestions: (s: GeocodingSuggestion[]) => void,
    setLoading: (b: boolean) => void,
  ) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&language=de&types=address,place&limit=5`;
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleGeoQueryChange(value: string) {
    setGeoQuery(value);
    if (geoDebounceNewRef.current) clearTimeout(geoDebounceNewRef.current);
    geoDebounceNewRef.current = setTimeout(
      () => fetchGeo(value, setGeoSuggestionsNew, setGeoLoadingNew),
      300,
    );
  }

  function selectGeoSuggestion(suggestion: GeocodingSuggestion) {
    const [lng, lat] = suggestion.center;
    setCoordinates({ lat, lng });
    const plzContext = suggestion.context?.find((c) =>
      c.id.startsWith("postcode."),
    );
    const cityContext = suggestion.context?.find((c) =>
      c.id.startsWith("place."),
    );
    const countryContext = suggestion.context?.find((c) =>
      c.id.startsWith("country."),
    );
    const streetPart = suggestion.address
      ? `${suggestion.text} ${suggestion.address}`
      : suggestion.text;
    const adressPart = plzContext
      ? `${streetPart}, ${plzContext.text}`
      : streetPart;
    setAdresse(adressPart);
    if (cityContext) setStadt(cityContext.text);
    if (countryContext) setLand(countryContext.text);
    setGeoQuery(suggestion.place_name);
    setGeoSuggestionsNew([]);
  }

  // Edycja adresu (per-field)
  function handleEditGeoQueryChange(value: string) {
    setEditValues((prev) => ({ ...prev, geoQuery: value, Adresse: value }));
    if (geoDebounceRef.current) clearTimeout(geoDebounceRef.current);
    geoDebounceRef.current = setTimeout(
      () => fetchGeo(value, setGeoSuggestions, setGeoLoading),
      300,
    );
  }

  function selectEditGeoSuggestion(suggestion: GeocodingSuggestion) {
    const [lng, lat] = suggestion.center;
    const plzContext = suggestion.context?.find((c) =>
      c.id.startsWith("postcode."),
    );
    const cityContext = suggestion.context?.find((c) =>
      c.id.startsWith("place."),
    );
    const countryContext = suggestion.context?.find((c) =>
      c.id.startsWith("country."),
    );
    const streetPart = suggestion.address
      ? `${suggestion.text} ${suggestion.address}`
      : suggestion.text;
    const adressPart = plzContext
      ? `${streetPart}, ${plzContext.text}`
      : streetPart;
    setEditValues((prev) => ({
      ...prev,
      geoQuery: suggestion.place_name,
      Adresse: adressPart,
      Stadt: cityContext?.text ?? prev.Stadt,
      Land: countryContext?.text ?? prev.Land,
      location: { type: "Point", coordinates: [lng, lat] },
    }));
    setGeoSuggestions([]);
  }

  // ======== Upload helpers ========

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
      setTitelbildError("Fehler beim Hochladen.");
    } finally {
      setTitelbildUploading(false);
      if (titelbildRef.current) titelbildRef.current.value = "";
    }
  }

  async function handleGalerieUploadNew(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 6 - galerieIds.length;
    if (remaining <= 0) {
      setGalerieErrorNew("Maximal 6 Bilder erlaubt.");
      return;
    }
    setGalerieErrorNew(null);
    setGalerieUploadingNew(true);
    try {
      const newIds: string[] = [],
        newPreviews: string[] = [];
      for (const file of files.slice(0, remaining)) {
        newIds.push(await uploadToDirectus(file));
        newPreviews.push(URL.createObjectURL(file));
      }
      setGalerieIds((p) => [...p, ...newIds]);
      setGaleriePreviews((p) => [...p, ...newPreviews]);
    } catch {
      setGalerieErrorNew("Fehler beim Hochladen.");
    } finally {
      setGalerieUploadingNew(false);
      if (galerieRefNew.current) galerieRefNew.current.value = "";
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

  // Upload dla galerii w trybie edycji
  async function handleGalerieEditUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = 6 - galerieItems.length;
    if (remaining <= 0) {
      setGalerieError("Maximal 6 Bilder erlaubt.");
      return;
    }
    setGalerieError(null);
    setGalerieUploading(true);
    try {
      const newItems: GalerieItem[] = [];
      for (const file of files.slice(0, remaining)) {
        const fileId = await uploadToDirectus(file);
        newItems.push({
          junctionId: `new-${fileId}`,
          fileId,
          preview: URL.createObjectURL(file),
          isNew: true,
        });
      }
      const updated = [...galerieItems, ...newItems];
      setGalerieItems(updated);
      // Natychmiastowy zapis nowych zdjęć
      const patchRes = await fetch(`/api/audiopin/${pinId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Galerie_add: newItems.map((i) => i.fileId) }),
      });
      if (patchRes.ok) {
        // Odśwież przez GET żeby dostać aktualne junction IDs
        const getRes = await fetch(`/api/audiopin/${pinId}`);
        if (getRes.ok) {
          const freshData = (await getRes.json()) as PinData;
          setGalerieItems(
            (freshData.Galerie ?? []).map((g) => ({
              junctionId: g.id,
              fileId: g.directus_files_id,
              preview: assetUrl(g.directus_files_id),
            })),
          );
        }
      }
    } catch {
      setGalerieError("Fehler beim Hochladen.");
    } finally {
      setGalerieUploading(false);
      if (galerieRef.current) galerieRef.current.value = "";
    }
  }

  async function removeGalerieItem(item: GalerieItem) {
    if (item.isNew) {
      setGalerieItems((prev) =>
        prev.filter((g) => g.junctionId !== item.junctionId),
      );
      return;
    }
    const res = await fetch(`/api/audiopin/${pinId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Galerie_delete: [item.junctionId] }),
    });
    if (res.ok) {
      setGalerieItems((prev) =>
        prev.filter((g) => g.junctionId !== item.junctionId),
      );
    }
  }

  // ======== Submit nowego pina ========

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setSubmitError(null);
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
    setMode("submitting");
    try {
      const res = await fetch("/api/audiopin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: name.trim(),
          Adresse: adresse.trim(),
          Stadt: stadt.trim(),
          Land: land.trim() || null,
          Breite: coordinates?.lat ?? null,
          Lange: coordinates?.lng ?? null,
          Telefon: isPremium ? telefon.trim() || null : null,
          Vollbeschreibung: vollbeschreibung.trim() || null,
          Link_URL: isPremium ? linkUrl.trim() || null : null,
          Link_Text: isPremium ? linkText.trim() || null : null,
          Kategorie: kategorien,
          Zertifizierungen: zertifizierungen,
          Titelbild: titelbildId ?? null,
          Galerie: isPremium && galerieIds.length > 0 ? galerieIds : null,
          Audio: audioId ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Fehler.");
        setMode("new_form");
        return;
      }
      setPinId(data.id);
      setMode("view");
    } catch {
      setSubmitError("Es ist ein Fehler aufgetreten.");
      setMode("new_form");
    }
  }

  if (!premiumChecked) return null;

  // ==============================
  // TRYB VIEW — per-field edycja
  // ==============================
  if (mode === "view") {
    if (pinLoading || !pinData) {
      return (
        <div className={styles.wrapper}>
          <p className={styles.hint}>Wird geladen…</p>
        </div>
      );
    }

    const kategorienIds = (pinData.Kategorie ?? []).map((k) => k.Kategorie_id);

    function FieldRow({
      field,
      label,
      value,
      renderEdit,
    }: {
      field: string;
      label: string;
      value: React.ReactNode;
      renderEdit: () => React.ReactNode;
    }) {
      const isEditing = editingFields.has(field);
      const isSaving = savingFields.has(field);
      const error = fieldSaveErrors[field];
      const success = fieldSaveSuccess[field];

      return (
        <div className={styles.viewField}>
          <div className={styles.viewFieldHeader}>
            <span className={styles.viewFieldLabel}>{label}</span>
            {isPremium && !isEditing && (
              <button
                type="button"
                className={styles.editFieldBtn}
                onClick={() =>
                  startEdit(
                    field,
                    editValues[field] ?? pinData?.[field as keyof PinData],
                  )
                }
              >
                Bearbeiten
              </button>
            )}
          </div>
          {isEditing ? (
            <div className={styles.viewFieldEdit}>
              {renderEdit()}
              {error && <p className={styles.fieldError}>{error}</p>}
              <div className={styles.viewFieldActions}>
                <button
                  type="button"
                  className={styles.saveFieldBtn}
                  disabled={isSaving}
                  onClick={() => saveField(field, editValues[field])}
                >
                  {isSaving ? "Speichern…" : "Speichern"}
                </button>
                <button
                  type="button"
                  className={styles.cancelFieldBtn}
                  onClick={() => cancelEdit(field)}
                  disabled={isSaving}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.viewFieldValue}>
              {success && (
                <span className={styles.savedBadge}>✓ Gespeichert</span>
              )}
              {value || <span className={styles.viewFieldEmpty}>—</span>}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.wrapper}>
        <h3 className={styles.intro}>Ihr Audiopin</h3>
        {!isPremium && (
          <p className={styles.freeAccountInfo}>
            Mit einem kostenlosen Konto kann der Pin nach der Einreichung nicht
            bearbeitet werden. Upgrade zu{" "}
            <strong className={styles.premiumBadge}>Premium</strong>, um
            Änderungen vorzunehmen.
          </p>
        )}

        <div className={styles.viewBox}>
          <FieldRow
            field="Name"
            label="Name des Ortes"
            value={pinData.Name}
            renderEdit={() => (
              <input
                type="text"
                aria-label="Name des Ortes"
                className={styles.input}
                value={(editValues.Name as string) ?? ""}
                onChange={(e) =>
                  setEditValues((p) => ({ ...p, Name: e.target.value }))
                }
                autoFocus
              />
            )}
          />

          <FieldRow
            field="adresse_group"
            label="Adresse"
            value={
              <span>
                {pinData.Adresse || "—"}
                {pinData.Stadt ? (
                  <>
                    , <strong>{pinData.Stadt}</strong>
                  </>
                ) : null}
                {pinData.Land ? <> ({pinData.Land})</> : null}
              </span>
            }
            renderEdit={() => (
              <div className={styles.geoWrapper}>
                <input
                  type="text"
                  aria-label="Adresse suchen"
                  className={styles.input}
                  value={
                    (editValues.geoQuery as string) ??
                    [pinData.Adresse, pinData.Stadt, pinData.Land]
                      .filter(Boolean)
                      .join(", ")
                  }
                  onChange={(e) => handleEditGeoQueryChange(e.target.value)}
                  onBlur={() => setTimeout(() => setGeoSuggestions([]), 150)}
                  placeholder="Straße, Stadt…"
                  autoComplete="off"
                  autoFocus
                />
                {geoLoading && (
                  <span className={styles.geoLoading}>Suche…</span>
                )}
                {geoSuggestions.length > 0 && (
                  <ul className={styles.geoDropdown}>
                    {geoSuggestions.map((s) => (
                      <li
                        key={s.place_name}
                        className={styles.geoDropdownItem}
                        onMouseDown={() => selectEditGeoSuggestion(s)}
                      >
                        {s.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          />

          <FieldRow
            field="Telefon"
            label="Telefon"
            value={pinData.Telefon}
            renderEdit={() => (
              <input
                type="tel"
                aria-label="Telefon"
                className={styles.input}
                value={(editValues.Telefon as string) ?? ""}
                onChange={(e) =>
                  setEditValues((p) => ({ ...p, Telefon: e.target.value }))
                }
                autoFocus
              />
            )}
          />

          <FieldRow
            field="Vollbeschreibung"
            label="Vollständige Beschreibung"
            value={
              pinData.Vollbeschreibung ? (
                <span className={styles.viewFieldLong}>
                  {pinData.Vollbeschreibung}
                </span>
              ) : null
            }
            renderEdit={() => (
              <textarea
                aria-label="Vollständige Beschreibung"
                className={styles.textarea}
                rows={5}
                value={(editValues.Vollbeschreibung as string) ?? ""}
                onChange={(e) =>
                  setEditValues((p) => ({
                    ...p,
                    Vollbeschreibung: e.target.value,
                  }))
                }
                autoFocus
              />
            )}
          />

          <FieldRow
            field="Link_URL"
            label="Website-Link"
            value={
              pinData.Link_URL ? (
                <a
                  href={pinData.Link_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewLink}
                >
                  {pinData.Link_Text || pinData.Link_URL}
                </a>
              ) : null
            }
            renderEdit={() => (
              <div className={styles.fieldGroup}>
                <input
                  type="url"
                  aria-label="Website-Link URL"
                  className={styles.input}
                  placeholder="https://…"
                  value={(editValues.Link_URL as string) ?? ""}
                  onChange={(e) =>
                    setEditValues((p) => ({ ...p, Link_URL: e.target.value }))
                  }
                  autoFocus
                />
                <input
                  type="text"
                  aria-label="Link-Text"
                  className={styles.input}
                  placeholder="Link-Text"
                  value={(editValues.Link_Text as string) ?? ""}
                  onChange={(e) =>
                    setEditValues((p) => ({ ...p, Link_Text: e.target.value }))
                  }
                />
              </div>
            )}
          />

          <FieldRow
            field="Titelbild"
            label="Titelbild"
            value={
              pinData.Titelbild ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={assetUrl(pinData.Titelbild!)}
                  alt="Titelbild"
                  className={styles.titelbildImg}
                />
              ) : null
            }
            renderEdit={() => {
              const previewUrl = editValues.Titelbild
                ? typeof editValues._titelbildPreview === "string"
                  ? editValues._titelbildPreview
                  : assetUrl(editValues.Titelbild as string)
                : pinData.Titelbild
                  ? assetUrl(pinData.Titelbild)
                  : null;
              return (
                <div className={styles.fieldGroup}>
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt=""
                      className={styles.titelbildImg}
                    />
                  )}
                  <input
                    ref={titelbildRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    aria-label="Neues Titelbild hochladen"
                    className={styles.hiddenInput}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setTitelbildUploading(true);
                      try {
                        const id = await uploadToDirectus(file);
                        setEditValues((p) => ({
                          ...p,
                          Titelbild: id,
                          _titelbildPreview: URL.createObjectURL(file),
                        }));
                      } catch {
                        setTitelbildError("Fehler beim Hochladen.");
                      } finally {
                        setTitelbildUploading(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() => titelbildRef.current?.click()}
                    disabled={titelbildUploading}
                  >
                    {titelbildUploading
                      ? "Wird hochgeladen…"
                      : "Neues Bild hochladen"}
                  </button>
                  {titelbildError && (
                    <p className={styles.uploadError}>{titelbildError}</p>
                  )}
                </div>
              );
            }}
          />

          {/* Galerie — premium, zawsze widoczna w view, edycja inline */}
          {isPremium && (
            <div className={styles.viewField}>
              <div className={styles.viewFieldHeader}>
                <span className={styles.viewFieldLabel}>Bildergalerie</span>
              </div>
              <div className={styles.galerieGrid}>
                {galerieItems.map((item) => (
                  <div key={item.junctionId} className={styles.galerieItem}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.preview}
                      alt=""
                      className={styles.galerieImg}
                    />
                    <button
                      type="button"
                      className={styles.removeButtonSmall}
                      onClick={() => removeGalerieItem(item)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {galerieItems.length < 6 && (
                  <button
                    type="button"
                    className={styles.galerieAddBtn}
                    onClick={() => galerieRef.current?.click()}
                    disabled={galerieUploading}
                  >
                    {galerieUploading ? "…" : "+"}
                  </button>
                )}
              </div>
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
                onChange={handleGalerieEditUpload}
              />
            </div>
          )}

          {/* Audio */}
          <div className={styles.viewField}>
            <div className={styles.viewFieldHeader}>
              <span className={styles.viewFieldLabel}>Audiodatei</span>
              {isPremium && !editingFields.has("Audio") && (
                <button
                  type="button"
                  className={styles.editFieldBtn}
                  onClick={() => startEdit("Audio", pinData.Audio)}
                >
                  Bearbeiten
                </button>
              )}
            </div>
            {editingFields.has("Audio") ? (
              <div className={styles.viewFieldEdit}>
                {typeof editValues.Audio === "string" && (
                  <audio
                    controls
                    src={
                      typeof editValues._audioPreview === "string"
                        ? editValues._audioPreview
                        : assetUrl(editValues.Audio as string)
                    }
                    className={styles.audioPlayer}
                  />
                )}
                <input
                  ref={audioRef}
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
                  aria-label="Neue Audiodatei hochladen"
                  className={styles.hiddenInput}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setAudioUploading(true);
                    try {
                      const id = await uploadToDirectus(file);
                      setEditValues((p) => ({
                        ...p,
                        Audio: id,
                        _audioPreview: URL.createObjectURL(file),
                      }));
                    } catch {
                      setAudioError("Fehler beim Hochladen.");
                    } finally {
                      setAudioUploading(false);
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => audioRef.current?.click()}
                  disabled={audioUploading}
                >
                  {audioUploading
                    ? "Wird hochgeladen…"
                    : "Neue Audiodatei hochladen"}
                </button>
                {audioError && (
                  <p className={styles.uploadError}>{audioError}</p>
                )}
                <div className={styles.viewFieldActions}>
                  <button
                    type="button"
                    className={styles.saveFieldBtn}
                    disabled={savingFields.has("Audio") || audioUploading}
                    onClick={() => saveField("Audio", editValues.Audio)}
                  >
                    {savingFields.has("Audio") ? "Speichern…" : "Speichern"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelFieldBtn}
                    onClick={() => cancelEdit("Audio")}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewFieldValue}>
                {fieldSaveSuccess.Audio && (
                  <span className={styles.savedBadge}>✓ Gespeichert</span>
                )}
                {pinData.Audio ? (
                  <audio
                    controls
                    src={assetUrl(pinData.Audio!)}
                    className={styles.audioPlayer}
                  />
                ) : (
                  <span className={styles.viewFieldEmpty}>—</span>
                )}
              </div>
            )}
          </div>

          {/* Kategorien */}
          <div className={styles.viewField}>
            <div className={styles.viewFieldHeader}>
              <span className={styles.viewFieldLabel}>Kategorien</span>
              {isPremium && !editingFields.has("Kategorie") && (
                <button
                  type="button"
                  className={styles.editFieldBtn}
                  onClick={() => {
                    startEdit("Kategorie", kategorienIds);
                    setEditValues((p) => ({ ...p, Kategorie: kategorienIds }));
                  }}
                >
                  Bearbeiten
                </button>
              )}
            </div>
            {editingFields.has("Kategorie") ? (
              <div className={styles.viewFieldEdit}>
                <div className={styles.checkboxGroup}>
                  {KATEGORIEN.map((kat) => {
                    const selected =
                      (editValues.Kategorie as number[]) ?? kategorienIds;
                    return (
                      <label key={kat.id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={selected.includes(kat.id)}
                          onChange={() =>
                            setEditValues((p) => ({
                              ...p,
                              Kategorie: toggleMulti(selected, kat.id),
                            }))
                          }
                        />
                        {kat.name}
                      </label>
                    );
                  })}
                </div>
                <div className={styles.viewFieldActions}>
                  <button
                    type="button"
                    className={styles.saveFieldBtn}
                    disabled={savingFields.has("Kategorie")}
                    onClick={() => saveField("Kategorie", editValues.Kategorie)}
                  >
                    {savingFields.has("Kategorie") ? "Speichern…" : "Speichern"}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelFieldBtn}
                    onClick={() => cancelEdit("Kategorie")}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewFieldValue}>
                {fieldSaveSuccess.Kategorie && (
                  <span className={styles.savedBadge}>✓ Gespeichert</span>
                )}
                {kategorienIds.length > 0 ? (
                  kategorienIds
                    .map((id) => KATEGORIEN.find((k) => k.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")
                ) : (
                  <span className={styles.viewFieldEmpty}>—</span>
                )}
              </div>
            )}
          </div>

          {/* Zertifizierungen */}
          {(() => {
            const zertIds = (pinData.Zertifizierungen ?? []).map(
              (z) => z.Zertifizierungen_id,
            );
            return (
              <div className={styles.viewField}>
                <div className={styles.viewFieldHeader}>
                  <span className={styles.viewFieldLabel}>
                    Zertifizierungen
                  </span>
                  {isPremium && !editingFields.has("Zertifizierungen") && (
                    <button
                      type="button"
                      className={styles.editFieldBtn}
                      onClick={() => {
                        startEdit("Zertifizierungen", zertIds);
                        setEditValues((p) => ({
                          ...p,
                          Zertifizierungen: zertIds,
                        }));
                      }}
                    >
                      Bearbeiten
                    </button>
                  )}
                </div>
                {editingFields.has("Zertifizierungen") ? (
                  <div className={styles.viewFieldEdit}>
                    <div className={styles.checkboxGroup}>
                      {ZERTIFIZIERUNGEN.map((zert) => {
                        const selected =
                          (editValues.Zertifizierungen as string[]) ?? zertIds;
                        return (
                          <label key={zert.id} className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                              checked={selected.includes(zert.id)}
                              onChange={() =>
                                setEditValues((p) => ({
                                  ...p,
                                  Zertifizierungen: toggleMulti(
                                    selected,
                                    zert.id,
                                  ),
                                }))
                              }
                            />
                            {zert.name}
                          </label>
                        );
                      })}
                    </div>
                    <div className={styles.viewFieldActions}>
                      <button
                        type="button"
                        className={styles.saveFieldBtn}
                        disabled={savingFields.has("Zertifizierungen")}
                        onClick={() =>
                          saveField(
                            "Zertifizierungen",
                            editValues.Zertifizierungen,
                          )
                        }
                      >
                        {savingFields.has("Zertifizierungen")
                          ? "Speichern…"
                          : "Speichern"}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelFieldBtn}
                        onClick={() => cancelEdit("Zertifizierungen")}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.viewFieldValue}>
                    {fieldSaveSuccess.Zertifizierungen && (
                      <span className={styles.savedBadge}>✓ Gespeichert</span>
                    )}
                    {zertIds.length > 0 ? (
                      zertIds
                        .map(
                          (id) =>
                            ZERTIFIZIERUNGEN.find((z) => z.id === id)?.name,
                        )
                        .filter(Boolean)
                        .join(", ")
                    ) : (
                      <span className={styles.viewFieldEmpty}>—</span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  // ==============================
  // TRYB NOWY FORMULARZ
  // ==============================
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.intro}>
        Du kannst unser Formular ausfüllen und deinen eigenen Audiopin
        erstellen, der auf unsere Karte kommt. Wir freuen uns auf deine
        Einsendung.
      </h3>

      {!isPremium && (
        <p className={styles.freeAccountInfo}>
          Mit deinem kostenlosen Konto kannst du einen Audiopin nur einmal
          einreichen und hast nur begrenzte Felder zum Ausfüllen. Nach der
          Einreichung lässt sich der Audiopin nicht mehr bearbeiten. Dein Pin
          wird zunächst von unserem Team geprüft und erst nach Freigabe auf der
          Karte sichtbar. Wenn du mehr Funktionen brauchst, upgradiere zu{" "}
          <strong className={styles.premiumBadge}>Premium</strong>.
        </p>
      )}
      {!isPremium && (
        <div className={styles.premiumBanner}>
          Einige Felder sind nur für Premium-Konten verfügbar.{" "}
          <strong>Jetzt upgraden</strong>, um alle Funktionen freizuschalten.
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
                onBlur={() => setTimeout(() => setGeoSuggestionsNew([]), 150)}
                placeholder="Straße, Stadt…"
                autoComplete="off"
              />
              {geoLoadingNew && (
                <span className={styles.geoLoading}>Suche…</span>
              )}
              {geoSuggestionsNew.length > 0 && (
                <ul className={styles.geoDropdown}>
                  {geoSuggestionsNew.map((s) => (
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
            {!coordinates && (
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
          {coordinates && (
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="pin-adresse-ro" className={styles.label}>
                  Straße &amp; PLZ
                </label>
                <input
                  id="pin-adresse-ro"
                  type="text"
                  className={`${styles.input} ${styles.inputReadonly}`}
                  value={adresse}
                  readOnly
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="pin-stadt-ro" className={styles.label}>
                  Stadt
                </label>
                <input
                  id="pin-stadt-ro"
                  type="text"
                  className={`${styles.input} ${styles.inputReadonly}`}
                  value={stadt}
                  readOnly
                />
              </div>
              {land && (
                <div className={styles.field}>
                  <label htmlFor="pin-land-ro" className={styles.label}>
                    Land
                  </label>
                  <input
                    id="pin-land-ro"
                    type="text"
                    className={`${styles.input} ${styles.inputReadonly}`}
                    value={land}
                    readOnly
                  />
                </div>
              )}
            </div>
          )}
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
          <div
            className={`${styles.fieldRow} ${!isPremium ? styles.premiumLocked : ""}`}
          >
            <div className={styles.field}>
              <label htmlFor="pin-link-url" className={styles.label}>
                Website-Link
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
                  onChange={() => setKategorien((p) => toggleMulti(p, kat.id))}
                />
                {kat.name}
              </label>
            ))}
          </div>
        </fieldset>

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
                    setZertifizierungen((p) => toggleMulti(p, zert.id))
                  }
                />
                {zert.name}
              </label>
            ))}
          </div>
        </fieldset>

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

        <fieldset
          className={`${styles.fieldset} ${!isPremium ? styles.premiumLocked : ""}`}
        >
          <legend className={styles.legend}>
            Bildergalerie (max. 6)
            {!isPremium && <span className={styles.premiumBadge}>Premium</span>}
          </legend>
          {!isPremium ? (
            <p className={styles.hint}>
              Die Bildergalerie ist nur für Premium-Konten verfügbar.
            </p>
          ) : (
            <>
              <p className={styles.hint}>
                Laden Sie bis zu 6 Bilder hoch (JPG, PNG, WebP).
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
                        onClick={() => {
                          setGalerieIds((p) => p.filter((_, j) => j !== i));
                          setGaleriePreviews((p) =>
                            p.filter((_, j) => j !== i),
                          );
                        }}
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
                  onClick={() => galerieRefNew.current?.click()}
                  disabled={galerieUploadingNew}
                >
                  {galerieUploadingNew
                    ? "Wird hochgeladen…"
                    : `Bilder hinzufügen (${galerieIds.length}/6)`}
                </button>
              )}
              {galerieErrorNew && (
                <p className={styles.uploadError}>{galerieErrorNew}</p>
              )}
              <input
                ref={galerieRefNew}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                aria-label="Galeriebilder hochladen"
                className={styles.hiddenInput}
                onChange={handleGalerieUploadNew}
              />
            </>
          )}
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Audiodatei</legend>
          <p className={styles.hint}>MP3, M4A, WAV — max. 50 MB.</p>
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

        <button
          type="submit"
          className={styles.submitButton}
          disabled={mode === "submitting"}
        >
          {mode === "submitting" ? "Wird eingereicht…" : "Audiopin einreichen"}
        </button>
        {submitError && <p className={styles.errorMessage}>{submitError}</p>}
      </form>
    </div>
  );
}

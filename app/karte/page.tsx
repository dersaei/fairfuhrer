// app/karte/page.tsx - Complete fixed version with description support
import type { Metadata } from "next";
import MapWithFilters from "../../components/MapWithFilters";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ConditionalMapbox } from "../../components/ConditionalMapbox";
import type {
  Place,
  Category,
  DirectusCollectionResponse,
  DirectusKategorie,
  DirectusOrte,
} from "../../types";

// ISR revalidation - dane będą odświeżane co 6 godzin
export const revalidate = 21600;

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Bezpieczne parsowanie współrzędnych z string do number
 */
function parseCoordinate(value: string, fallback: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Walidacja współrzędnych geograficznych
 */
function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
  );
}

/**
 * Transformacja Directus Orte do Place z walidacją - FIXED
 */
function transformDirectusOrteToPlace(ort: DirectusOrte): Place | null {
  try {
    const latitude = parseCoordinate(ort.Breite);
    const longitude = parseCoordinate(ort.Lange);

    if (!isValidCoordinate(latitude, longitude)) {
      console.error(
        `Ungültige Koordinaten für Ort ${ort.id}: lat=${latitude}, lng=${longitude}`
      );
      return null;
    }

    if (!ort.Name || !ort.Adresse) {
      console.error(`Fehlende erforderliche Felder für Ort ${ort.id}`);
      return null;
    }

    return {
      id: ort.id,
      Name: ort.Name.trim(),
      Adresse: ort.Adresse.trim(),
      Telefon: ort.Telefon?.trim(),
      Vollbeschreibung: ort.Vollbeschreibung?.trim(),
      Breite: latitude,
      Lange: longitude,
      // ✅ FIXED: Proper filtering and mapping
      Kategorie:
        ort.Kategorie?.filter((k) => {
          // Check if Kategorie_id exists and is not null
          return k.Kategorie_id && k.Kategorie_id !== null;
        }).map(
          (k): Category => ({
            // ✅ FIXED: Explicitly return Category type
            id: k.Kategorie_id.id,
            name: k.Kategorie_id.Name.trim(),
            color: k.Kategorie_id.Farbe.trim(),
            description: k.Kategorie_id.Beschreibung?.trim(),
          })
        ) ?? [],
      Hauptbild: ort.Hauptbild?.trim(),
      Audio_Datei: ort.Audio_Datei?.trim(),
      Link_URL: ort.Link_URL?.trim(),
      Link_Text: ort.Link_Text?.trim(),
      Galerie_Bilder: ort.Galerie_Bilder?.filter(
        (img) => img.trim().length > 0
      ),
    };
  } catch (error) {
    console.error(`Fehler bei der Transformation von Ort ${ort.id}:`, error);
    return null;
  }
}

/**
 * Fetch data from Directus with error handling
 */
async function fetchFromDirectus<T>(
  url: string,
  entityName: string
): Promise<DirectusCollectionResponse<T>> {
  try {
    const response = await fetch(url, {
      next: {
        revalidate: 21600,
        tags: [entityName.toLowerCase()],
      },
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText} beim Abrufen von ${entityName}`
      );
    }

    const data = (await response.json()) as DirectusCollectionResponse<T>;

    if (data.errors?.length) {
      throw new Error(
        `Directus API Fehler bei ${entityName}: ${data.errors[0].message}`
      );
    }

    return data;
  } catch (error) {
    console.error(`Fehler beim Abrufen von ${entityName}:`, error);
    throw error;
  }
}

// ========================================
// MAIN PAGE COMPONENT
// ========================================

export default async function KartePage() {
  const rawUrl = process.env.DIRECTUS_URL;
  if (!rawUrl) {
    throw new Error(
      "DIRECTUS_URL Umgebungsvariable ist nicht in .env.local konfiguriert"
    );
  }

  const baseUrl = rawUrl.replace(/\/+$/, "");

  try {
    // ========================================
    // FETCH ORTE (PLACES) - Updated with Beschreibung
    // ========================================

    const orteUrl = new URL(`${baseUrl}/items/Orte`);
    orteUrl.searchParams.set(
      "fields",
      [
        "id",
        "Name",
        "Adresse",
        "Telefon",
        "Vollbeschreibung",
        "Breite",
        "Lange",
        "Hauptbild",
        "Audio_Datei",
        "Link_URL",
        "Link_Text",
        "Galerie_Bilder",
        "Kategorie.Kategorie_id.id",
        "Kategorie.Kategorie_id.Name",
        "Kategorie.Kategorie_id.Farbe",
        "Kategorie.Kategorie_id.Beschreibung", // Added description field
      ].join(",")
    );
    orteUrl.searchParams.set("limit", "-1");
    orteUrl.searchParams.set("sort", "Name");

    const orteData = await fetchFromDirectus<DirectusOrte>(
      orteUrl.toString(),
      "Orte"
    );

    // ========================================
    // FETCH KATEGORIEN - Updated with Beschreibung
    // ========================================

    const kategorieUrl = new URL(`${baseUrl}/items/Kategorie`);
    kategorieUrl.searchParams.set("fields", "id,Name,Farbe,Beschreibung"); // Added Beschreibung
    kategorieUrl.searchParams.set("limit", "-1");
    kategorieUrl.searchParams.set("sort", "Name");

    const kategorieData = await fetchFromDirectus<DirectusKategorie>(
      kategorieUrl.toString(),
      "Kategorien"
    );

    // ========================================
    // DATA TRANSFORMATION
    // ========================================

    const places: Place[] = orteData.data
      .map(transformDirectusOrteToPlace)
      .filter((place): place is Place => place !== null);

    const categories: Category[] = kategorieData.data
      .map((kat) => ({
        id: kat.id,
        name: kat.Name.trim(),
        color: kat.Farbe.trim(),
        description: kat.Beschreibung?.trim(), // Added description mapping
      }))
      .filter((cat) => cat.name.length > 0 && cat.color.length > 0);

    // ========================================
    // DATA VALIDATION
    // ========================================

    console.log(`✅ Erfolgreich geladen:`);
    console.log(`   - ${places.length} von ${orteData.data.length} Orte`);
    console.log(
      `   - ${categories.length} von ${kategorieData.data.length} Kategorien`
    );

    if (places.length === 0) {
      console.warn("⚠️  Keine gültigen Orte gefunden");
    }

    if (categories.length === 0) {
      console.warn("⚠️  Keine gültigen Kategorien gefunden");
    }

    const placesWithoutCategories = places.filter(
      (p) => p.Kategorie.length === 0
    );
    if (placesWithoutCategories.length > 0) {
      console.warn(
        `⚠️  ${placesWithoutCategories.length} Orte ohne Kategorien:`,
        placesWithoutCategories.map((p) => `${p.Name} (ID: ${p.id})`)
      );
    }

    // ========================================
    // RENDER COMPONENT
    // ========================================

    return (
      <div>
        {/* SSR TREŚĆ - UKRYTA DLA GOOGLE */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <h1>Interaktive Karte - {places.length} Orte entdecken</h1>
          <p>
            Entdecken Sie {places.length} interessante Orte in{" "}
            {categories.length} Kategorien am Bodensee und im Allgäu.
          </p>

          <h2>Verfügbare Kategorien:</h2>
          <ul>
            {categories.map((category: Category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>

          <h2>Ausgewählte Orte:</h2>
          {places.slice(0, 10).map((place: Place) => (
            <div key={place.id}>
              <h3>{place.Name}</h3>
              <p>📍 {place.Adresse}</p>
              {place.Vollbeschreibung && (
                <p>
                  {place.Vollbeschreibung.replace(/<[^>]*>/g, "").substring(
                    0,
                    200
                  )}
                </p>
              )}
              <div>
                Kategorien:{" "}
                {place.Kategorie.map((kat: Category) => kat.name).join(", ")}
              </div>
            </div>
          ))}
        </div>

        {/* MAPA OWRAPOWANA W CONDITIONAL MAPBOX */}
        <ConditionalMapbox>
          <ErrorBoundary
            fallback={
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  backgroundColor: "#fee",
                  border: "1px solid #fcc",
                  borderRadius: "8px",
                  margin: "2rem",
                  maxWidth: "800px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <h2>Fehler beim Laden der Kartenkomponente</h2>
                <p>Die interaktive Karte konnte nicht geladen werden.</p>
                <p
                  style={{
                    fontSize: "0.9em",
                    color: "#666",
                    marginTop: "1rem",
                  }}
                >
                  Bitte versuchen Sie, die Seite zu aktualisieren oder
                  kontaktieren Sie den Support.
                </p>
              </div>
            }
          >
            <MapWithFilters places={places} categories={categories} />
          </ErrorBoundary>
        </ConditionalMapbox>
      </div>
    );
  } catch (error) {
    // ========================================
    // ERROR HANDLING
    // ========================================

    console.error("❌ Kritischer Fehler beim Laden der Kartendaten:", error);

    let userMessage = "Ein unbekannter Fehler ist aufgetreten.";
    let technicalDetails = "";

    if (error instanceof Error) {
      technicalDetails = error.message;

      if (error.message.includes("DIRECTUS_URL")) {
        userMessage =
          "Konfigurationsfehler: Datenbankverbindung nicht verfügbar.";
      } else if (error.message.includes("HTTP")) {
        userMessage = "Netzwerkfehler: Daten konnten nicht abgerufen werden.";
      } else if (error.message.includes("JSON")) {
        userMessage = "Datenfehler: Ungültige Antwort vom Server.";
      }
    }

    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#fee",
          border: "1px solid #fcc",
          borderRadius: "8px",
          margin: "2rem",
          maxWidth: "800px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h2>Fehler beim Laden der Karte</h2>
        <p style={{ color: "#c33", fontSize: "1.1em", marginBottom: "1rem" }}>
          {userMessage}
        </p>

        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
              marginRight: "1rem",
            }}
          >
            Seite neu laden
          </button>

          <button
            onClick={() => window.history.back()}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Zurück
          </button>
        </div>

        <details
          style={{
            marginTop: "2rem",
            textAlign: "left",
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "4px",
            border: "1px solid #dee2e6",
          }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Technische Details (für Entwickler)
          </summary>
          <pre
            style={{
              fontSize: "0.8rem",
              backgroundColor: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            <strong>Fehler:</strong> {technicalDetails}
            {"\n\n"}
            <strong>Zeitstempel:</strong> {new Date().toISOString()}
            {"\n"}
            <strong>URL:</strong>{" "}
            {typeof window !== "undefined"
              ? window.location.href
              : "Server-side"}
            {"\n"}
            <strong>User Agent:</strong>{" "}
            {typeof navigator !== "undefined"
              ? navigator.userAgent
              : "Server-side"}
            {error instanceof Error &&
              error.stack &&
              "\n\nStack Trace:\n" + error.stack}
          </pre>
        </details>
      </div>
    );
  }
}

// ========================================
// METADATA EXPORT
// ========================================

export const metadata: Metadata = {
  title: "Interaktive Karte",
  description: "Entdecken Sie interessante Orte auf unserer interaktiven Karte",
  keywords: ["Karte", "Orte", "Standorte", "Navigation"],
};

export const dynamic = "force-dynamic";

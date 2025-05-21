// app/karte/page.tsx
import MapWithFilters from "../../components/MapWithFilters";
import type { Place, Category } from "../../types";

interface DirectusMeta {
  total_count?: number;
  filter_count?: number;
}

interface DirectusError {
  message: string;
  extensions: {
    code: string;
    [key: string]: unknown;
  };
}

interface DirectusCollectionResponse<T> {
  data: T[];
  meta?: DirectusMeta;
  errors?: DirectusError[];
}

interface DirectusKategorie {
  id: number;
  Name: string;
  Farbe: string;
}

interface DirectusOrteKategorie {
  id: number;
  Orte_id: number;
  Kategorie_id: DirectusKategorie;
}

interface DirectusOrte {
  id: number;
  Name: string;
  Adresse: string;
  Kurzbeschreibung: string;
  Breite: string;
  Lange: string;
  Kategorie?: DirectusOrteKategorie[];
}

export default async function KartePage() {
  const rawUrl = process.env.DIRECTUS_URL;
  if (!rawUrl) throw new Error("Brakuje DIRECTUS_URL w .env.local");
  const baseUrl = rawUrl.replace(/\/+$/, "");

  try {
    // Pobierz miejsca z kategoriami
    const orteUrl = `${baseUrl}/items/Orte?fields=id,Name,Adresse,Kurzbeschreibung,Breite,Lange,Kategorie.Kategorie_id.id,Kategorie.Kategorie_id.Name,Kategorie.Kategorie_id.Farbe&limit=-1`;
    const orteRes = await fetch(orteUrl, { cache: "no-store" });

    if (!orteRes.ok)
      throw new Error(`Błąd pobierania miejsc: ${orteRes.status}`);

    const orteData =
      (await orteRes.json()) as DirectusCollectionResponse<DirectusOrte>;
    if (orteData.errors) throw new Error(orteData.errors[0].message);

    // Pobierz kategorie
    const kategorieUrl = `${baseUrl}/items/Kategorie?fields=id,Name,Farbe&limit=-1`;
    const kategorieRes = await fetch(kategorieUrl, { cache: "no-store" });

    if (!kategorieRes.ok)
      throw new Error(`Błąd pobierania kategorii: ${kategorieRes.status}`);

    const kategorieData =
      (await kategorieRes.json()) as DirectusCollectionResponse<DirectusKategorie>;
    if (kategorieData.errors) throw new Error(kategorieData.errors[0].message);

    // Mapowanie danych
    const places: Place[] = orteData.data
      .map((ort) => {
        const latitude = parseFloat(ort.Breite);
        const longitude = parseFloat(ort.Lange);

        if (isNaN(latitude) || isNaN(longitude)) {
          console.error(`Nieprawidłowe współrzędne dla miejsca ${ort.id}`);
          return null;
        }

        return {
          id: ort.id,
          nazwa: ort.Name,
          adres: ort.Adresse,
          kurzbeschreibung: ort.Kurzbeschreibung,
          latitude,
          longitude,
          categories:
            ort.Kategorie?.map((k) => ({
              id: k.Kategorie_id.id,
              name: k.Kategorie_id.Name,
              color: k.Kategorie_id.Farbe,
            })) || [],
        };
      })
      .filter(Boolean) as Place[];

    const categories: Category[] = kategorieData.data.map((kat) => ({
      id: kat.id,
      name: kat.Name,
      color: kat.Farbe,
    }));

    return <MapWithFilters places={places} categories={categories} />;
  } catch (error) {
    console.error("Błąd:", error);
    return (
      <div className="error-container">
        <h2>Błąd ładowania mapy</h2>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
}

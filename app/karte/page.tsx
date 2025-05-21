// app/karte/page.tsx
import MapBoxMap from "../../components/MapBoxMap";

interface DirectusOrt {
  id: number;
  Name: string;
  Adresse: string;
  Kurzbeschreibung: string;
  Breite: string;
  Lange: string;
}

export default async function KartePage() {
  const rawUrl = process.env.DIRECTUS_URL;
  if (!rawUrl) throw new Error("Brakuje DIRECTUS_URL w .env.local");

  const baseUrl = rawUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/items/Orte?fields=id,Name,Adresse,Kurzbeschreibung,Breite,Lange&limit=-1`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return <div>Błąd ładowania danych miejsc</div>;

  const json = await res.json();
  const rawData = Array.isArray(json.data) ? (json.data as DirectusOrt[]) : [];

  // Mapujemy rawData → Place[]
  const places = rawData.map((item) => ({
    id: item.id,
    nazwa: item.Name,
    adres: item.Adresse,
    kurzbeschreibung: item.Kurzbeschreibung,
    latitude: parseFloat(item.Breite),
    longitude: parseFloat(item.Lange),
  }));

  return <MapBoxMap places={places} />;
}

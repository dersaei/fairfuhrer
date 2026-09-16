import "server-only";

import { NextResponse } from "next/server";
import { KATEGORIEN, ZERTIFIZIERUNGEN } from "@/app/api/audiopin/route";

/**
 * Listy kategorii i certyfikatów dla formularza Audiopin.
 *
 * Wcześniej były zahardkodowane w komponencie — przez co formularz pokazywał
 * stare nazwy ("Unternehmen" zamiast "Unternehmen & Handwerk") i tylko 9 z 16
 * certyfikatów. Teraz źródłem prawdy jest Directus, a stałe z api/audiopin
 * służą wyłącznie jako fallback, gdy CMS nie odpowie.
 */

export const revalidate = 3600;

interface DirectusKategorie {
  id: number;
  Name: string;
  Reihenfolge: string | null;
}

interface DirectusZertifizierung {
  id: string;
  Name: string;
}

export async function GET() {
  const directusUrl = process.env.DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN;

  const fallback = {
    kategorien: KATEGORIEN.map((k) => ({ id: k.id, name: k.name })),
    zertifizierungen: ZERTIFIZIERUNGEN.map((z) => ({ id: z.id, name: z.name })),
    stale: true,
  };

  if (!directusUrl) {
    return NextResponse.json(fallback);
  }

  // Kolekcja Zertifizierungen nie jest publicznie czytelna — bez tokenu
  // Directus zwraca 403 i formularz pokazuje liste zapasowa.
  const headers = directusToken
    ? { Authorization: `Bearer ${directusToken}` }
    : undefined;

  try {
    const [katRes, zertRes] = await Promise.all([
      fetch(`${directusUrl}/items/Kategorie?fields=id,Name,Reihenfolge&limit=50`, {
        headers,
        next: { revalidate: 3600, tags: ["pin-optionen"] },
      }),
      fetch(`${directusUrl}/items/Zertifizierungen?fields=id,Name&limit=100`, {
        headers,
        next: { revalidate: 3600, tags: ["pin-optionen"] },
      }),
    ]);

    if (!katRes.ok || !zertRes.ok) {
      console.error(
        "pin-optionen: Directus nie odpowiedział poprawnie",
        katRes.status,
        zertRes.status,
      );
      return NextResponse.json(fallback);
    }

    const katData = await katRes.json();
    const zertData = await zertRes.json();

    const kategorien = ((katData.data ?? []) as DirectusKategorie[])
      .map((k) => ({
        id: k.id,
        name: k.Name,
        sort: Number(k.Reihenfolge ?? 999),
      }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ id, name }) => ({ id, name }));

    const zertifizierungen = ((zertData.data ?? []) as DirectusZertifizierung[])
      .map((z) => ({ id: z.id, name: z.Name }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));

    // Pusta odpowiedź z Directusa oznaczałaby formularz bez żadnych opcji —
    // lepiej pokazać listę zapasową niż nic.
    if (kategorien.length === 0 || zertifizierungen.length === 0) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({ kategorien, zertifizierungen, stale: false });
  } catch (error) {
    console.error("pin-optionen error:", error);
    return NextResponse.json(fallback);
  }
}

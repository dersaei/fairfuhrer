// lib/directus.ts - rozszerz swój istniejący plik

import { createDirectus, rest } from "@directus/sdk";
import type {
  Place,
  Category,
  ContactMessage,
  ImpressumContent,
  DatenschutzContent,
} from "@/types";

const DIRECTUS_URL = process.env.DIRECTUS_URL;
if (!DIRECTUS_URL) {
  throw new Error("Brakuje zmiennej środowiskowej DIRECTUS_URL");
}

export const directus = createDirectus(DIRECTUS_URL).with(
  rest({
    onRequest: (opts) => ({
      ...opts,
      // Cache GET requesty (miejsca, kategorie) - oszczędność kosztów
      // Nie cache'uj POST/PUT/DELETE - zawsze świeże dane
      cache: opts.method === "GET" ? "default" : "no-store",
    }),
  })
);

// Typ dla Directus Schema z moimi kolekcjami
export interface DirectusSchema {
  Orte: Place[]; // Niemiecka nazwa
  Kategorie: Category[]; // Niemiecka nazwa
  contact_messages: ContactMessage[];
  impressum_content: ImpressumContent[];
  datenschutz_content: DatenschutzContent[];
}

export async function getImpressumContent(): Promise<ImpressumContent | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/impressum_content?filter[page_slug][_eq]=impressum`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Revalidacja co godzinę - TYLKO dla tej strony
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch impressum content");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as ImpressumContent;
    }

    return null;
  } catch (error) {
    console.error("Error fetching impressum content:", error);
    return null;
  }
}
export async function getDatenschutzContent(): Promise<DatenschutzContent | null> {
  try {
    const response = await fetch(
      `${DIRECTUS_URL}/items/datenschutz_content?filter[page_slug][_eq]=datenschutz`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // Revalidacja co godzinę
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch datenschutz content");
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return data.data[0] as DatenschutzContent;
    }

    return null;
  } catch (error) {
    console.error("Error fetching datenschutz content:", error);
    return null;
  }
}

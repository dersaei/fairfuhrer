// lib/directus.ts
import { createDirectus, rest } from "@directus/sdk";
import type { Place, Category, ContactMessage } from "@/types"; // DODANE IMPORTY

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

// Typ dla Directus Schema z twoimi kolekcjami
export interface DirectusSchema {
  Orte: Place[]; // Niemiecka nazwa
  Kategorie: Category[]; // Niemiecka nazwa
  contact_messages: ContactMessage[];
}

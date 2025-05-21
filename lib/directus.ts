// lib/directus.ts
import { createDirectus, rest } from "@directus/sdk";

const DIRECTUS_URL = process.env.DIRECTUS_URL;
if (!DIRECTUS_URL) {
  throw new Error("Brakuje zmiennej środowiskowej DIRECTUS_URL");
}
export const directus = createDirectus(DIRECTUS_URL).with(
  rest({
    onRequest: (opts) => ({ ...opts, cache: "no-store" }),
  })
);

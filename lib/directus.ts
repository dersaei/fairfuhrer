import { createDirectus, rest } from "@directus/sdk";

/** URL naszej instancji Directus (publiczne API) z konfiguracji środowiskowej */
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

// Tworzymy instancję klienta Directus, korzystając z REST API
export const directus = createDirectus(DIRECTUS_URL).with(rest());

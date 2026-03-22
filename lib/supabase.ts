// lib/supabase.ts
// Uwaga: ten plik NIE tworzy klienta Supabase — używa czystych URL-i Storage,
// żeby uniknąć dublowania instancji GoTrueClient w przeglądarce.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function storagePublicUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// ✅ Dla miejsc na mapie (istniejące)
export const getOptimizedImagePath = (
  _placeId: number,
  filename: string,
  type: "main" | "gallery"
): string => {
  return `media-files/places/images/${type}/${filename}`;
};

// ✅ Kompatybilność wsteczna (audio, fallback)
export const getImageUrl = (
  _placeId: number,
  filename: string,
  type: "main" | "gallery"
) => {
  return storagePublicUrl("media-files", `places/images/${type}/${filename}`);
};

export const getAudioUrl = (_placeId: number, filename: string) => {
  return storagePublicUrl("media-files", `places/audio/${filename}`);
};

// ✅ Dla logo (istniejące)
export const getAssetPath = (filename: string): string => {
  return `media-files/assets/logos/${filename}`;
};

// ✅ NOWE - Dla obrazków na stronach (Partner werden, etc.)
export const getPageAssetPath = (filename: string): string => {
  return `media-files/assets/pages/${filename}`;
};

// ✅ NOWE - Fallback URL dla obrazków stron (jeśli potrzebne)
export const getPageAssetUrl = (filename: string) => {
  return storagePublicUrl("media-files", `assets/pages/${filename}`);
};

// ✅ NOWE - Dla obrazków tła (backgrounds)
export const getBackgroundAssetPath = (filename: string): string => {
  return `media-files/assets/backgrounds/${filename}`;
};

// ✅ NOWE - Fallback URL dla obrazków tła
export const getBackgroundAssetUrl = (filename: string) => {
  return storagePublicUrl("media-files", `assets/backgrounds/${filename}`);
};

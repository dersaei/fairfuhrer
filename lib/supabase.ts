// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Dla miejsc na mapie (istniejące)
export const getOptimizedImagePath = (
  placeId: number,
  filename: string,
  type: "main" | "gallery"
): string => {
  return `media-files/places/images/${type}/${filename}`;
};

// ✅ Kompatybilność wsteczna (audio, fallback)
export const getImageUrl = (
  placeId: number,
  filename: string,
  type: "main" | "gallery"
) => {
  const { data } = supabase.storage
    .from("media-files")
    .getPublicUrl(`places/images/${type}/${filename}`);
  return data.publicUrl;
};

export const getAudioUrl = (placeId: number, filename: string) => {
  const { data } = supabase.storage
    .from("media-files")
    .getPublicUrl(`places/audio/${filename}`);
  return data.publicUrl;
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
  const { data } = supabase.storage
    .from("media-files")
    .getPublicUrl(`assets/pages/${filename}`);
  return data.publicUrl;
};

// ✅ NOWE - Dla obrazków tła (backgrounds)
export const getBackgroundAssetPath = (filename: string): string => {
  return `media-files/assets/backgrounds/${filename}`;
};

// ✅ NOWE - Fallback URL dla obrazków tła
export const getBackgroundAssetUrl = (filename: string) => {
  const { data } = supabase.storage
    .from("media-files")
    .getPublicUrl(`assets/backgrounds/${filename}`);
  return data.publicUrl;
};

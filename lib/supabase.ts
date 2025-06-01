// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ NOWA - Zoptymalizowana funkcja dla Next.js Image Loader
export const getOptimizedImagePath = (
  placeId: number,
  filename: string,
  type: "main" | "gallery"
): string => {
  // Zwraca path dla Supabase Image Loader (bez pełnego URL)
  return `media-files/places/images/${type}/${filename}`;
};

// ✅ ZACHOWANE - Dla kompatybilności wstecznej (audio, fallback)
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

export const getAssetPath = (filename: string): string => {
  return `media-files/assets/logos/${filename}`;
};

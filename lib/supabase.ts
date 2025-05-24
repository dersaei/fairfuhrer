import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

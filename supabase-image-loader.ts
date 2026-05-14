// supabase-image-loader.ts
interface LoaderProps {
  src: string;
  width: number;
  quality?: number;
}

const projectId = "oockmooumzncrvkrjkcc";

export default function supabaseLoader({
  src,
  width,
  quality,
}: LoaderProps): string {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${
    quality || 75
  }`;
}

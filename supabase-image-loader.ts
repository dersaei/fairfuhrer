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
    try {
      const url = new URL(src);
      url.searchParams.set("width", width.toString());
      if (quality) {
        url.searchParams.set("quality", quality.toString());
      }
      return url.toString();
    } catch {
      return src;
    }
  }
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${
    quality || 75
  }`;
}

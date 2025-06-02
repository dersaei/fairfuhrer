// lib/youtube.ts

// ✅ Utility funkcje do YouTube URLs
export function getYouTubeEmbedId(url: string): string | null {
  if (!url) return null;

  // Różne formaty YouTube URL
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeEmbedId(url);
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
}

// ✅ Funkcja do walidacji YouTube URL
export function isValidYouTubeUrl(url: string): boolean {
  return getYouTubeEmbedId(url) !== null;
}

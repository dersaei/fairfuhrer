// components/YouTubeEmbed.tsx
"use client";

import { getYouTubeEmbedUrl } from "../lib/youtube";
import styles from "./YouTubeEmbed.module.css";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export default function YouTubeEmbed({
  url,
  title = "YouTube video",
  className = "",
}: YouTubeEmbedProps) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className={`${styles.youtubeError} ${className}`}>
        <p>Nieprawidłowy URL YouTube</p>
      </div>
    );
  }

  return (
    <div className={`${styles.youtubeContainer} ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}

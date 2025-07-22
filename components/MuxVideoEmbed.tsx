// components/MuxVideoEmbed.tsx
"use client";

import Video from "next-video";
import styles from "./MuxVideoEmbed.module.css";

interface MuxVideoEmbedProps {
  playbackId: string; // hz85VadaGOSuRmlIP7uoACRb63tjJXXNKTcFqHA14Po
  title?: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
}

export default function MuxVideoEmbed({
  playbackId,
  className = "",
  poster,
  autoPlay = false,
  muted = true,
}: MuxVideoEmbedProps) {
  // WALIDACJA - sprawdź czy to Twój Playback ID
  if (!playbackId || playbackId.length !== 43) {
    return (
      <div className={`${styles.videoError} ${className}`}>
        <p>❌ Nieprawidłowy Playback ID!</p>
        <p>Oczekiwano: hz85VadaGOSuRmlIP7uoACRb63tjJXXNKTcFqHA14Po</p>
        <p>Otrzymano: {playbackId}</p>
      </div>
    );
  }

  // TWÓJ STREAM URL
  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`;

  // TWÓJ THUMBNAIL URL
  const thumbnailUrl =
    poster || `https://image.mux.com/${playbackId}/thumbnail.webp`;

  console.log("🎬 Mux Stream URL:", streamUrl);
  console.log("🖼️ Mux Thumbnail:", thumbnailUrl);

  return (
    <div className={`${styles.videoContainer} ${className}`}>
      <Video
        src={streamUrl}
        poster={thumbnailUrl}
        autoPlay={autoPlay}
        muted={muted}
        controls
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onLoadStart={() => console.log(`✅ Loading: ${playbackId}`)}
        onCanPlay={() => console.log(`🎉 Ready: ${playbackId}`)}
        onError={(error) => console.error("❌ Error:", error)}
      />
    </div>
  );
}

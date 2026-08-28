// components/MuxVideoEmbed.tsx
"use client";

import type { CSSProperties } from "react";
import MuxPlayer from "@mux/mux-player-react";
import styles from "./MuxVideoEmbed.module.css";

interface MuxVideoEmbedProps {
  playbackId: string; // z.B. b55Uuj3M7zO01CbLiGM9eMOObyDcY6no56Yf2T3Sctus
  title?: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  // fill = video wypełnia całą wysokość kontenera z przycięciem (object-fit: cover),
  // bez wymuszonego 16:9. Używane w sekcji video na pełną wysokość (100vh).
  fill?: boolean;
}

export default function MuxVideoEmbed({
  playbackId,
  className = "",
  poster,
  title,
  autoPlay = false,
  muted = true,
  fill = false,
}: MuxVideoEmbedProps) {
  // Validation - Mux garantiert keine feste Länge der Playback-ID,
  // daher nur Format (alphanumerisch) statt exakter Zeichenzahl prüfen.
  const isValidPlaybackId =
    typeof playbackId === "string" && /^[A-Za-z0-9]{20,}$/.test(playbackId.trim());

  if (!isValidPlaybackId) {
    return (
      <div className={`${styles.videoError} ${className}`}>
        <p>❌ Ungültige Playback-ID!</p>
        <p>Erwartet: alphanumerische Mux Playback-ID</p>
        <p>Erhalten: {playbackId || "keine ID"}</p>
      </div>
    );
  }

  const playerStyle = (
    fill
      ? {
          width: "100%",
          height: "100%",
          "--media-object-fit": "cover",
          "--media-object-position": "center",
        }
      : {
          width: "100%",
          height: "100%",
          aspectRatio: "16/9",
        }
  ) as CSSProperties & Record<`--${string}`, string>;

  return (
    <div
      className={`${styles.videoContainer} ${
        fill ? styles.videoContainerFill : ""
      } ${className}`}
    >
      <MuxPlayer
        playbackId={playbackId.trim()}
        poster={poster}
        autoPlay={autoPlay ? "muted" : false}
        muted={muted}
        accentColor="#ac39f2"
        metadata={{
          video_title: title || "FairFuhrer Video",
          viewer_user_id: "anonymous",
        }}
        style={playerStyle}
      />
    </div>
  );
}

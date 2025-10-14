// components/MuxVideoEmbed.tsx
"use client";

import MuxPlayer from "@mux/mux-player-react";
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
  title,
  autoPlay = false,
  muted = true,
}: MuxVideoEmbedProps) {
  // Validation - check if playbackId is valid
  if (!playbackId || playbackId.length !== 43) {
    return (
      <div className={`${styles.videoError} ${className}`}>
        <p>❌ Ungültige Playback-ID!</p>
        <p>Erwartet: 43 Zeichen lange Mux Playback-ID</p>
        <p>Erhalten: {playbackId || "keine ID"}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.videoContainer} ${className}`}>
      <MuxPlayer
        playbackId={playbackId}
        poster={poster}
        autoPlay={autoPlay ? "muted" : false}
        muted={muted}
        accentColor="#ac39f2"
        metadata={{
          video_title: title || "FairFuhrer Video",
          viewer_user_id: "anonymous",
        }}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: "16/9",
        }}
      />
    </div>
  );
}

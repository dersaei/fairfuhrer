// components/MediaComponents.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { getAudioUrl, getOptimizedImagePath } from "../lib/supabase";
import styles from "./MediaComponents.module.css";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "./AudioIcons";

interface AudioPlayerProps {
  placeId: number;
  filename: string;
  className?: string;
}

export function AudioPlayer({
  placeId,
  filename,
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  const skipBackward = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, audioRef.current.currentTime - 5);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const skipForward = useCallback(() => {
    if (!audioRef.current) return;
    const newTime = Math.min(duration, audioRef.current.currentTime + 5);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div className={`${styles.audioPlayer} ${className}`}>
      <audio
        ref={audioRef}
        src={getAudioUrl(placeId, filename)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />

      <div className={styles.audioControls}>
        <button
          type="button"
          className={styles.skipButton}
          onClick={skipBackward}
          title="5 sekund wstecz"
        >
          <SkipBackIcon size={32} />
        </button>

        <button
          type="button"
          className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`}
          onClick={togglePlay}
          title={isPlaying ? "Pauza" : "Odtwórz"}
        >
          {isPlaying ? <PauseIcon size={40} /> : <PlayIcon size={40} />}
        </button>

        <button
          type="button"
          className={styles.skipButton}
          onClick={skipForward}
          title="5 sekund do przodu"
        >
          <SkipForwardIcon size={32} />
        </button>
      </div>

      <div className={styles.progressContainer}>
        <span className={styles.currentTime}>{formatTime(currentTime)}</span>
        <input
          id={`audio-progress-${placeId}-${filename}`}
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className={styles.progressBar}
          aria-label="Pasek postępu audio"
          title="Przeciągnij aby przesunąć się w nagraniu"
        />
        <span className={styles.duration}>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

interface ImageGalleryProps {
  placeId: number;
  images: string[];
  className?: string;
  onImageClickAction: (imagePath: string) => void; // ✅ ZMIENIONE: imagePath zamiast imageUrl
}

export function ImageGallery({
  placeId,
  images,
  className = "",
  onImageClickAction,
}: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className={`${styles.gallery} ${className}`}>
      {images.map((imageName, index) => (
        <div
          key={`${placeId}-${imageName}`}
          className={styles.galleryItem}
          onClick={() => {
            onImageClickAction(
              getOptimizedImagePath(placeId, imageName, "gallery")
            );
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onImageClickAction(
                getOptimizedImagePath(placeId, imageName, "gallery")
              );
            }
          }}
          aria-label={`Zdjęcie ${index + 1} z galerii`}
        >
          <Image
            src={getOptimizedImagePath(placeId, imageName, "gallery")}
            alt={`Zdjęcie ${index + 1}`}
            className={styles.galleryImage}
            width={300}
            height={200}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface PlaceImageProps {
  placeId: number;
  filename: string;
  alt: string;
  type?: "main" | "gallery";
  className?: string;
  width?: number;
  height?: number;
}

export function PlaceImage({
  placeId,
  filename,
  alt,
  type = "main",
  className = "",
  width = 400,
  height = 300,
}: PlaceImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (imageError) return null;

  // Validate alt text for accessibility
  const validatedAlt = alt && alt.trim() !== "" ? alt : `Bild für Ort ${placeId}`;

  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {!imageLoaded && <div className={styles.imagePlaceholder}>Laden...</div>}
      <Image
        src={getOptimizedImagePath(placeId, filename, type)}
        alt={validatedAlt}
        className={`${styles.placeImage} ${imageLoaded ? styles.loaded : ""}`}
        width={width}
        height={height}
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        priority={type === "main"}
      />
    </div>
  );
}

// EmbeddedMap - usunięte bo nie jest używane

// components/MediaComponents.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { getImageUrl, getAudioUrl } from "../lib/supabase";
import styles from "./MediaComponents.module.css";

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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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
          className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`}
          onClick={togglePlay}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>

        <div className={styles.timeInfo}>
          <span className={styles.currentTime}>{formatTime(currentTime)}</span>
          <label
            htmlFor={`audio-progress-${placeId}-${filename}`}
            className="sr-only"
          ></label>
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
    </div>
  );
}

interface ImageGalleryProps {
  placeId: number;
  images: string[];
  className?: string;
}

export function ImageGallery({
  placeId,
  images,
  className = "",
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className={`${styles.gallery} ${className}`}>
        {images.map((imageName, index) => (
          <div key={index} className={styles.galleryItem}>
            <Image
              src={getImageUrl(placeId, imageName, "gallery")}
              alt={`Zdjęcie ${index + 1}`}
              className={styles.galleryImage}
              width={300}
              height={200}
              style={{ objectFit: "cover" }}
              onClick={() =>
                setSelectedImage(getImageUrl(placeId, imageName, "gallery"))
              }
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className={styles.imageModal}
          onClick={() => setSelectedImage(null)}
        >
          <div className={styles.modalContent}>
            <Image
              src={selectedImage}
              alt="Powiększone zdjęcie"
              className={styles.modalImage}
              width={800}
              height={600}
              style={{ objectFit: "contain" }}
            />
            <button
              className={styles.modalClose}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
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

  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {!imageLoaded && <div className={styles.imagePlaceholder}>Laden...</div>}
      <Image
        src={getImageUrl(placeId, filename, type)}
        alt={alt}
        className={`${styles.placeImage} ${imageLoaded ? styles.loaded : ""}`}
        width={width}
        height={height}
        style={{ objectFit: "cover" }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}

interface EmbeddedMapProps {
  embedCode: string;
  className?: string;
}

export function EmbeddedMap({ embedCode, className = "" }: EmbeddedMapProps) {
  return (
    <div
      className={`${styles.embeddedMap} ${className}`}
      dangerouslySetInnerHTML={{ __html: embedCode }}
    />
  );
}

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  if (!images || images.length === 0) return null;

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    // Zablokuj scroll na body
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    // Przywróć scroll
    document.body.style.overflow = "unset";
  };

  const goToPrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
    );
  };

  const goToNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex(
      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

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
              onClick={() => openModal(index)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        ))}
      </div>

      {selectedImageIndex !== null && (
        <div
          className={styles.galleryModal}
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="Galeria zdjęć"
        >
          <div
            className={styles.galleryModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Przycisk zamknięcia */}
            <button
              className={styles.galleryModalClose}
              onClick={closeModal}
              aria-label="Zamknij galerię"
            >
              ×
            </button>

            {/* Licznik zdjęć */}
            <div className={styles.imageCounter}>
              {selectedImageIndex + 1} / {images.length}
            </div>

            {/* Główne zdjęcie */}
            <div className={styles.mainImageContainer}>
              <Image
                src={getImageUrl(
                  placeId,
                  images[selectedImageIndex],
                  "gallery"
                )}
                alt={`Zdjęcie ${selectedImageIndex + 1}`}
                className={styles.galleryModalImage}
                width={1200}
                height={800}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

            {/* Przyciski nawigacji */}
            {images.length > 1 && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={goToPrevious}
                  aria-label="Poprzednie zdjęcie"
                >
                  ‹
                </button>
                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={goToNext}
                  aria-label="Następne zdjęcie"
                >
                  ›
                </button>
              </>
            )}

            {/* Miniaturki (slider) */}
            {images.length > 1 && (
              <div className={styles.thumbnailSlider}>
                <div className={styles.thumbnailContainer}>
                  {images.map((imageName, index) => (
                    <div
                      key={index}
                      className={`${styles.thumbnail} ${
                        index === selectedImageIndex
                          ? styles.activeThumbnail
                          : ""
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <Image
                        src={getImageUrl(placeId, imageName, "gallery")}
                        alt={`Miniatura ${index + 1}`}
                        width={80}
                        height={60}
                        style={{ objectFit: "cover" }}
                        className={styles.thumbnailImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
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

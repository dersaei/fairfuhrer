// components/MediaComponents.tsx
"use client";

import { useState, useRef, useId } from "react";
import Image from "next/image";
import { getAudioUrl, getOptimizedImagePath } from "../lib/supabase";
import styles from "./MediaComponents.module.css";
import {
  PlayIcon,
  PauseIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "./AudioIcons";

const SPEED_OPTIONS = [1, 1.25, 1.5, 1.75, 2] as const;
type SpeedOption = (typeof SPEED_OPTIONS)[number];

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
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressId = useId();

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, audioRef.current.currentTime - 5);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    const newTime = Math.min(duration, audioRef.current.currentTime + 5);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
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

  const handleSpeedChange = (speed: SpeedOption) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
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
          className={styles.skipButton}
          onClick={skipBackward}
          title="5 Sekunden zurück"
        >
          <SkipBackIcon size={32} />
        </button>

        <button
          type="button"
          className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`}
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Abspielen"}
        >
          {isPlaying ? <PauseIcon size={40} /> : <PlayIcon size={40} />}
        </button>

        <button
          type="button"
          className={styles.skipButton}
          onClick={skipForward}
          title="5 Sekunden vor"
        >
          <SkipForwardIcon size={32} />
        </button>
      </div>

      <div className={styles.progressContainer}>
        <span className={styles.currentTime}>{formatTime(currentTime)}</span>
        <input
          id={progressId}
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className={styles.progressBar}
          aria-label="Audio-Fortschrittsbalken"
          title="Ziehen, um die Position in der Aufnahme zu verschieben"
        />
        <span className={styles.duration}>{formatTime(duration)}</span>
      </div>

      <div className={styles.speedControl}>
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            type="button"
            className={`${styles.speedButton} ${playbackSpeed === speed ? styles.speedButtonActive : ""}`}
            onClick={() => handleSpeedChange(speed)}
            aria-pressed={playbackSpeed === speed}
            title={`Wiedergabegeschwindigkeit: ${speed}x`}
          >
            {speed}x
          </button>
        ))}
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
        <div key={index} className={styles.galleryItem}>
          <Image
            src={getOptimizedImagePath(placeId, imageName, "gallery")} // ✅ ZOPTYMALIZOWANE
            alt={`Zdjęcie ${index + 1}`}
            className={styles.galleryImage}
            width={300}
            height={200}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 50vw, 300px"
            onClick={() => {
              // ✅ POPRAWKA: Przekaż path zamiast pełnego URL
              onImageClickAction(
                getOptimizedImagePath(placeId, imageName, "gallery")
              );
            }}
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

  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {!imageLoaded && <div className={styles.imagePlaceholder}>Laden...</div>}
      <Image
        src={getOptimizedImagePath(placeId, filename, type)} // ✅ ZOPTYMALIZOWANE
        alt={alt}
        className={`${styles.placeImage} ${imageLoaded ? styles.loaded : ""}`}
        width={width}
        height={height}
        style={{ objectFit: "cover" }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        loading={type === "main" ? "eager" : "lazy"}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        priority={type === "main"} // ✅ Priority dla głównych obrazków
      />
    </div>
  );
}

interface DirectusAudioPlayerProps {
  uuid: string;
  className?: string;
}

export function DirectusAudioPlayer({ uuid, className = "" }: DirectusAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressId = useId();

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
  const src = `${directusUrl}/assets/${uuid}`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
  };
  const skipBackward = () => {
    if (!audioRef.current) return;
    const t = Math.max(0, audioRef.current.currentTime - 5);
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };
  const skipForward = () => {
    if (!audioRef.current) return;
    const t = Math.min(duration, audioRef.current.currentTime + 5);
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = t; setCurrentTime(t); }
  };
  const handleSpeedChange = (speed: SpeedOption) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) audioRef.current.playbackRate = speed;
  };
  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`${styles.audioPlayer} ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        preload="metadata"
      />
      <div className={styles.audioControls}>
        <button type="button" className={styles.skipButton} onClick={skipBackward} title="5 Sekunden zurück">
          <SkipBackIcon size={32} />
        </button>
        <button type="button" className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`} onClick={togglePlay} title={isPlaying ? "Pause" : "Abspielen"}>
          {isPlaying ? <PauseIcon size={40} /> : <PlayIcon size={40} />}
        </button>
        <button type="button" className={styles.skipButton} onClick={skipForward} title="5 Sekunden vor">
          <SkipForwardIcon size={32} />
        </button>
      </div>
      <div className={styles.progressContainer}>
        <span className={styles.currentTime}>{formatTime(currentTime)}</span>
        <input
          id={progressId}
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className={styles.progressBar}
          aria-label="Audio-Fortschrittsbalken"
          title="Ziehen, um die Position in der Aufnahme zu verschieben"
        />
        <span className={styles.duration}>{formatTime(duration)}</span>
      </div>
      <div className={styles.speedControl}>
        {SPEED_OPTIONS.map((speed) => (
          <button
            key={speed}
            type="button"
            className={`${styles.speedButton} ${playbackSpeed === speed ? styles.speedButtonActive : ""}`}
            onClick={() => handleSpeedChange(speed)}
            aria-pressed={playbackSpeed === speed}
            title={`Wiedergabegeschwindigkeit: ${speed}x`}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}

interface DirectusImageProps {
  uuid: string;
  alt: string;
  className?: string;
}

export function DirectusImage({
  uuid,
  alt,
  className = "",
}: DirectusImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
  const src = `${directusUrl}/assets/${uuid}`;

  if (imageError) return null;

  return (
    <div className={`${styles.imageContainer} ${className}`}>
      {!imageLoaded && <div className={styles.imagePlaceholder}>Laden...</div>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${styles.placeImage} ${imageLoaded ? styles.loaded : ""}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
    </div>
  );
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface GalleryMixedProps {
  placeId: number;
  items: string[];
  onImageClickAction?: (imagePath: string, index: number) => void;
}

export function GalleryMixed({ placeId, items, onImageClickAction }: GalleryMixedProps) {
  if (!items || items.length === 0) return null;

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;

  return (
    <div className={styles.gallery}>
      {items.map((item, index) => {
        const isUuid = UUID_REGEX.test(item);
        const src = isUuid
          ? `${directusUrl}/assets/${item}`
          : getOptimizedImagePath(placeId, item, "gallery");

        return (
          <div key={index} className={styles.galleryItem}>
            {isUuid ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={`Bild ${index + 1}`}
                className={styles.galleryImage}
                onClick={() => onImageClickAction?.(src, index)}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <Image
                src={src}
                alt={`Bild ${index + 1}`}
                className={styles.galleryImage}
                width={300}
                height={200}
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 50vw, 300px"
                onClick={() => onImageClickAction?.(src, index)}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface DirectusImageGalleryProps {
  uuids: string[];
  onImageClickAction?: (src: string, index: number) => void;
}

export function DirectusImageGallery({ uuids, onImageClickAction }: DirectusImageGalleryProps) {
  if (!uuids || uuids.length === 0) return null;
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL!;
  return (
    <div className={styles.gallery}>
      {uuids.map((uuid, index) => {
        const src = `${directusUrl}/assets/${uuid}`;
        return (
          <div key={uuid} className={styles.galleryItem}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Bild ${index + 1}`}
              className={styles.galleryImage}
              onClick={() => onImageClickAction?.(src, index)}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        );
      })}
    </div>
  );
}

// EmbeddedMap - usunięte bo nie jest używane

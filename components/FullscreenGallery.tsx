// components/FullscreenGallery.tsx - PROSTA WERSJA BEZ THUMBNAILS
"use client";

import { useEffect } from "react";
import { getImageUrl } from "../lib/supabase";
import type { Place } from "../types";
import styles from "./FullscreenGallery.module.css";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface FullscreenGalleryProps {
  place: Place;
  currentIndex: number;
  isOpen: boolean;
  onCloseAction: () => void;
  onNextAction: () => void;
  onPrevAction: () => void;
}

export default function FullscreenGallery({
  place,
  currentIndex,
  isOpen,
  onCloseAction,
  onNextAction,
  onPrevAction,
}: FullscreenGalleryProps) {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onCloseAction();
          break;
        case "ArrowRight":
          onNextAction();
          break;
        case "ArrowLeft":
          onPrevAction();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCloseAction, onNextAction, onPrevAction]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Galerie_Bilder (stare Supabase piny) ma priorytet — fallback na Galerie (Directus)
  const images: string[] = place.Galerie_Bilder?.length
    ? place.Galerie_Bilder
    : place.Galerie ?? [];

  if (!isOpen || images.length === 0) {
    return null;
  }

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? "";
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentIndex] ?? images[0];
  const isUuid = UUID_REGEX.test(currentImage);
  const src = isUuid
    ? `${directusUrl}/assets/${currentImage}`
    : getImageUrl(place.id, currentImage, "gallery");

  return (
    <div className={styles.gallery} data-gallery-modal="true">
      {/* Close Button */}
      <button
        type="button"
        className={styles.closeButton}
        onClick={onCloseAction}
        aria-label="Galerie schließen"
      >
        ×
      </button>

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className={styles.counter}>
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Main Image Container */}
      <div className={styles.imageContainer}>
        {hasMultipleImages && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={onPrevAction}
            aria-label="Vorheriges Bild"
          >
            ‹
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Galeriebild ${currentIndex + 1} von ${place.Name}`}
          className={styles.image}
          style={{ objectFit: "contain", maxWidth: "100%", maxHeight: "100%" }}
        />

        {hasMultipleImages && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={onNextAction}
            aria-label="Nächstes Bild"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

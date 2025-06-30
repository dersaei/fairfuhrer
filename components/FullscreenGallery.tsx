// components/FullscreenGallery.tsx - PROSTA WERSJA BEZ THUMBNAILS
"use client";

import { useEffect } from "react";
import Image from "next/image";
import { getOptimizedImagePath } from "../lib/supabase";
import type { Place } from "../types";
import styles from "./FullscreenGallery.module.css";

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

  if (!isOpen || !place.Galerie_Bilder || place.Galerie_Bilder.length === 0) {
    return null;
  }

  const images = place.Galerie_Bilder;
  const hasMultipleImages = images.length > 1;

  return (
    <div className={styles.gallery} data-gallery-modal="true">
      {/* Close Button - TYLKO TO zamyka galerię */}
      <button
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
        {/* Previous Button */}
        {hasMultipleImages && (
          <button
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={onPrevAction}
            aria-label="Vorheriges Bild"
          >
            ‹
          </button>
        )}

        {/* Current Image - wyśrodkowany */}
        <Image
          src={getOptimizedImagePath(place.id, images[currentIndex], "gallery")}
          alt={`Galeriebild ${currentIndex + 1} von ${place.Name}`}
          width={1200}
          height={800}
          className={styles.image}
          style={{ objectFit: "contain" }}
          priority
        />

        {/* Next Button */}
        {hasMultipleImages && (
          <button
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

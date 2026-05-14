// components/FullscreenGallery.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

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

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNextAction();
    } else if (isRightSwipe) {
      onPrevAction();
    }
  }, [touchStart, touchEnd, onNextAction, onPrevAction]);

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
    : getImageUrl(place.id, currentImage, "gallery"); // We keep getImageUrl or getOptimizedImagePath

  return (
    <div 
      className={styles.gallery} 
      role="dialog" 
      aria-modal="true" 
      aria-label={`Bildergalerie für ${place.Name}`}
      data-gallery-modal="true"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Backdrop clickable area */}
      <div 
        className={styles.backdrop} 
        onClick={(e) => { e.stopPropagation(); onCloseAction(); }} 
        aria-hidden="true" 
      />

      {/* Close Button */}
      <button
        type="button"
        className={styles.closeButton}
        onClick={(e) => { e.stopPropagation(); onCloseAction(); }}
        aria-label="Galerie schließen"
        title="Schließen (Esc)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {/* Image Counter */}
      {hasMultipleImages && (
        <div className={styles.counter} aria-live="polite">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Main Image Container */}
      <div 
        className={styles.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultipleImages && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={(e) => { e.stopPropagation(); onPrevAction(); }}
            aria-label="Vorheriges Bild"
            title="Zurück (Pfeil links)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div className={styles.imageWrapper}>
          {isUuid ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={`Bild ${currentIndex + 1} von ${images.length} für ${place.Name}`}
              className={styles.image}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          ) : (
            <Image
              src={src}
              alt={`Bild ${currentIndex + 1} von ${images.length} für ${place.Name}`}
              className={styles.image}
              fill
              sizes="100vw"
              style={{ objectFit: "contain" }}
              priority
            />
          )}
        </div>

        {hasMultipleImages && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={(e) => { e.stopPropagation(); onNextAction(); }}
            aria-label="Nächstes Bild"
            title="Weiter (Pfeil rechts)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

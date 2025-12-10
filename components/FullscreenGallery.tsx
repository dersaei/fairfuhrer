// components/FullscreenGallery.tsx - PROSTA WERSJA BEZ THUMBNAILS
"use client";

import { useEffect, useCallback, useRef } from "react";
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
  const galleryRef = useRef<HTMLDivElement>(null);

  // Memoize handlers to stabilize dependencies
  const handleClose = useCallback(() => {
    onCloseAction();
  }, [onCloseAction]);

  const handleNext = useCallback(() => {
    onNextAction();
  }, [onNextAction]);

  const handlePrev = useCallback(() => {
    onPrevAction();
  }, [onPrevAction]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handleNext, handlePrev]);

  // Prevent body scroll when gallery is open - using CSS class instead of direct manipulation
  useEffect(() => {
    if (isOpen) {
      document.documentElement.classList.add("gallery-open");
    } else {
      document.documentElement.classList.remove("gallery-open");
    }

    return () => {
      document.documentElement.classList.remove("gallery-open");
    };
  }, [isOpen]);

  // Focus trap - keep focus within gallery when open
  useEffect(() => {
    if (!isOpen || !galleryRef.current) return;

    const gallery = galleryRef.current;
    const focusableElements = gallery.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when opening
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  if (!isOpen || !place.Galerie_Bilder || place.Galerie_Bilder.length === 0) {
    return null;
  }

  const images = place.Galerie_Bilder;
  const hasMultipleImages = images.length > 1;

  // Preload adjacent images for better UX
  const prevIndex = (currentIndex - 1 + images.length) % images.length;
  const nextIndex = (currentIndex + 1) % images.length;

  return (
    <div
      ref={galleryRef}
      className={styles.gallery}
      data-gallery-modal="true"
      role="dialog"
      aria-modal="true"
      aria-label="Bildergalerie"
    >
      {/* Preload adjacent images */}
      {hasMultipleImages && (
        <>
          <link
            rel="preload"
            as="image"
            href={getOptimizedImagePath(place.id, images[nextIndex], "gallery")}
          />
          <link
            rel="preload"
            as="image"
            href={getOptimizedImagePath(place.id, images[prevIndex], "gallery")}
          />
        </>
      )}

      {/* Close Button - TYLKO TO zamyka galerię */}
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
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
            type="button"
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={handlePrev}
            aria-label="Vorheriges Bild"
          >
            ‹
          </button>
        )}

        {/* Current Image - wyśrodkowany */}
        <div key={currentIndex} className={styles.imageWrapper}>
          <Image
            src={getOptimizedImagePath(place.id, images[currentIndex], "gallery")}
            alt={`Galeriebild ${currentIndex + 1} von ${place.Name}`}
            width={1200}
            height={800}
            className={styles.image}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Next Button */}
        {hasMultipleImages && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={handleNext}
            aria-label="Nächstes Bild"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

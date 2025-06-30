// components/PlaceInfoPanel.tsx
"use client";

import { useRef, useEffect } from "react";
import { AudioPlayer, ImageGallery, PlaceImage } from "./MediaComponents";
import type { Place } from "../types";
import styles from "./PlaceInfoPanel.module.css";

interface PlaceInfoPanelProps {
  place: Place | null;
  isOpen: boolean;
  isVisible: boolean;
  onCloseAction: () => void;
  onImageClickAction?: (imagePath: string, index: number) => void;
  onTransitionEndAction?: (e: React.TransitionEvent<HTMLDivElement>) => void;
}

export default function PlaceInfoPanel({
  place,
  isOpen,
  isVisible,
  onCloseAction,
  onImageClickAction,
  onTransitionEndAction,
}: PlaceInfoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Poprawiona obsługa kliknięć poza panelem
  useEffect(() => {
    if (!isOpen || !isVisible) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;

      // 1. Sprawdź czy kliknięto w backdrop
      if (backdropRef.current && backdropRef.current.contains(target)) {
        onCloseAction();
        return;
      }

      // 2. Nie zamykaj gdy kliknięto w:
      // - Galerię pełnoekranową
      // - Panel
      // - Elementy Mapbox
      if (
        target.closest('[data-gallery-modal="true"]') ||
        (panelRef.current && panelRef.current.contains(target)) ||
        target.closest(".mapboxgl-marker") ||
        target.closest(".mapboxgl-ctrl") ||
        target.closest(".mapboxgl-popup")
      ) {
        return;
      }

      // 3. Zamknij w pozostałych przypadkach
      onCloseAction();
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [isOpen, isVisible, onCloseAction]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseAction();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onCloseAction]);

  // Force reflow dla płynnej animacji przy pierwszym otwarciu
  useEffect(() => {
    if (isOpen && isVisible) {
      const panel = panelRef.current;
      if (panel) {
        // Force reflow
        void panel.offsetHeight;
        // Trigger transition
        requestAnimationFrame(() => {
          panel.style.transform = "translateX(0)";
        });
      }
    }
  }, [isOpen, isVisible]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`${styles.panelBackdrop} ${isVisible ? styles.visible : ""}`}
      />

      {/* Panel informacyjny - KLUCZOWA ZMIANA: renderuj tylko gdy isOpen */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`${styles.infoPanel} ${isVisible ? styles.open : ""}`}
          onTransitionEnd={onTransitionEndAction}
          role="dialog"
          aria-modal="true"
          aria-labelledby={place ? `place-title-${place.id}` : undefined}
        >
          <div className={styles.panelContent}>
            {/* KLUCZOWA ZMIANA: nie resetuj place podczas animacji */}
            {place ? (
              <PlaceContent
                place={place}
                onImageClickAction={onImageClickAction}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PlaceContent({
  place,
  onImageClickAction,
}: {
  place: Place;
  onImageClickAction?: (imagePath: string, index: number) => void;
}) {
  return (
    <>
      <div className={styles.imageAudioContainer}>
        {place.Hauptbild && (
          <div className={styles.mainImageSection}>
            <PlaceImage
              placeId={place.id}
              filename={place.Hauptbild}
              alt={place.Name}
              type="main"
              className={styles.mainImage}
            />
          </div>
        )}

        {place.Audio_Datei && (
          <div className={styles.audioSection}>
            <AudioPlayer placeId={place.id} filename={place.Audio_Datei} />
          </div>
        )}
      </div>

      <div className={styles.placeNameSection}>
        <h2 id={`place-title-${place.id}`} className={styles.placeName}>
          {place.Name}
        </h2>
        <p className={styles.placeAddress}>{place.Adresse}</p>
      </div>

      {place.Vollbeschreibung && (
        <div className={styles.infoSection}>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: place.Vollbeschreibung,
            }}
          />
        </div>
      )}

      {place.Link_URL && (
        <div className={styles.infoSection}>
          <a
            href={place.Link_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            {place.Link_Text || "Website besuchen"}
          </a>
        </div>
      )}

      {place.Galerie_Bilder && place.Galerie_Bilder.length > 0 && (
        <div className={styles.infoSection}>
          <h4>Bildergalerie</h4>
          <ImageGallery
            placeId={place.id}
            images={place.Galerie_Bilder}
            onImageClickAction={(imagePath) => {
              const index =
                place.Galerie_Bilder?.findIndex((img) =>
                  imagePath.includes(img)
                ) ?? 0;
              onImageClickAction?.(imagePath, index);
            }}
          />
        </div>
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <h2>Kein Ort ausgewählt</h2>
      <p>Wählen Sie einen Punkt auf der Karte aus, um Details zu sehen.</p>
    </div>
  );
}

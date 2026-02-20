"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { AudioPlayer, ImageGallery, PlaceImage } from "./MediaComponents";
import type { Place } from "../types";
import styles from "./PlaceInfoPanel.module.css";

interface PlaceInfoPanelProps {
  place: Place | null;
  isOpen: boolean;
  isVisible: boolean;
  onCloseAction: () => void;
  onImageClickAction?: (imagePath: string, index: number) => void;
}

export default function PlaceInfoPanel({
  place,
  isOpen,
  isVisible,
  onCloseAction,
  onImageClickAction,
}: PlaceInfoPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onCloseAction();
      setIsClosing(false);
    }, 500);
  }, [onCloseAction]);

  useEffect(() => {
    if (!isOpen || !isVisible || isClosing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (backdropRef.current && backdropRef.current.contains(target)) {
        handleClose();
        return;
      }

      if (
        target.closest('[data-gallery-modal="true"]') ||
        (panelRef.current && panelRef.current.contains(target)) ||
        target.closest(".mapboxgl-marker") ||
        target.closest(".mapboxgl-ctrl") ||
        target.closest(".mapboxgl-popup")
      ) {
        return;
      }

      handleClose();
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen, isVisible, isClosing, handleClose]);

  useEffect(() => {
    if (!isOpen || isClosing) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isClosing, handleClose]);

  return (
    <>
      <div
        ref={backdropRef}
        className={`${styles.panelBackdrop} ${
          isVisible && !isClosing ? styles.visible : ""
        }`}
      />

      {isOpen && (
        <div
          ref={panelRef}
          className={`${styles.infoPanel} ${
            isVisible && !isClosing ? styles.open : ""
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={place ? `place-title-${place.id}` : undefined}
        >
          {/* Przycisk zamknięcia — absolute nad obrazem, scrolluje razem z treścią */}
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Schließen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className={styles.panelContent}>
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

      {place.Kategorie && place.Kategorie.length > 0 && (
        <div className={styles.categoryBadges}>
          {place.Kategorie.map((cat) => (
            <span
              key={cat.id}
              className={styles.categoryBadge}
              style={{ "--badge-color": cat.color } as React.CSSProperties}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <div className={styles.placeNameSection}>
        <h2 id={`place-title-${place.id}`} className={styles.placeName}>
          {place.Name}
        </h2>
        <p className={styles.placeAddress}>{place.Adresse}</p>
        {place.Telefon && (
          <a href={`tel:${place.Telefon}`} className={styles.placePhone}>
            📞 {place.Telefon}
          </a>
        )}
      </div>

      {place.Vollbeschreibung && (
        <div className={styles.infoSection}>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: place.Vollbeschreibung }}
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

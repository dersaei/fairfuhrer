"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { AudioPlayer, ImageGallery, PlaceImage } from "./MediaComponents";
import ExpandableDescription from "./ExpandableDescription";
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

  // ✅ POPRAWIONA FUNKCJA ZAMYKANIA z płynną animacją
  const handleClose = useCallback(() => {
    setIsClosing(true);

    // Rozpocznij animację zamykania
    setTimeout(() => {
      onCloseAction();
      setIsClosing(false);
    }, 500); // Dopasowane do czasu animacji CSS (0.5s)
  }, [onCloseAction]);

  // Poprawiona obsługa kliknięć poza panelem
  useEffect(() => {
    if (!isOpen || !isVisible || isClosing) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;

      // 1. Sprawdź czy kliknięto w backdrop
      if (backdropRef.current && backdropRef.current.contains(target)) {
        handleClose();
        return;
      }

      // 2. Nie zamykaj gdy kliknięto w:
      // - Galerię pełnoekranową
      // - Panel
      // - Elementy Mapbox (popup, controls, canvas layers)
      if (
        target.closest('[data-gallery-modal="true"]') ||
        (panelRef.current && panelRef.current.contains(target)) ||
        target.closest(".mapboxgl-marker") ||
        target.closest(".mapboxgl-ctrl") ||
        target.closest(".mapboxgl-popup") ||
        target.closest(".mapboxgl-canvas-container")
      ) {
        return;
      }

      // 3. Zamknij w pozostałych przypadkach
      handleClose();
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [isOpen, isVisible, isClosing, handleClose]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || isClosing) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isClosing, handleClose]);

  // ✅ POPRAWIONA ANIMACJA OTWIERANIA
  useEffect(() => {
    if (isOpen && isVisible && !isClosing) {
      const panel = panelRef.current;
      if (panel) {
        // Force reflow dla gładkiej animacji
        void panel.offsetHeight;

        // Małe opóźnienie dla lepszego efektu
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            panel.style.transform =
              window.innerWidth <= 768 ? "translateY(0)" : "translateX(0)";
          });
        });
      }
    }
  }, [isOpen, isVisible, isClosing]);

  // ✅ RESET STYLI przy zamykaniu
  useEffect(() => {
    if (isClosing && panelRef.current) {
      const panel = panelRef.current;
      panel.style.transform =
        window.innerWidth <= 768 ? "translateY(100%)" : "translateX(100%)";
    }
  }, [isClosing]);

  return (
    <>
      {/* Backdrop z płynną animacją */}
      <div
        ref={backdropRef}
        className={`${styles.panelBackdrop} ${
          isVisible && !isClosing ? styles.visible : ""
        }`}
      />

      {/* Panel informacyjny */}
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
          {/* ✅ NOWOCZESNY PRZYCISK ZAMYKANIA */}
          <CloseButton onClick={handleClose} />

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

// ✅ KOMPONENT PRZYCISKU ZAMYKANIA
function CloseButton({ onClick }: { onClick: () => void }) {
  // Zmień na true jeśli wolisz prostszy design
  const useMinimalStyle = false;

  return (
    <button
      type="button"
      className={
        useMinimalStyle ? styles.closeButtonMinimal : styles.closeButton
      }
      onClick={onClick}
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
        {place.Telefon && (
          <a href={`tel:${place.Telefon}`} className={styles.placePhone}>
            📞 {place.Telefon}
          </a>
        )}
      </div>

      {/* ✅ ZASTĄPIONE: Stary opis przez nowy komponent ExpandableDescription */}
      {place.Vollbeschreibung && (
        <div className={styles.infoSection}>
          <ExpandableDescription
            content={place.Vollbeschreibung}
            maxLines={6}
            className={styles.description}
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

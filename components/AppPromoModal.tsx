// components/AppPromoModal.tsx — Hinweis auf die mobile App, nur auf Tablets
// und Smartphones. Erscheint erst, wenn der Cookie-Banner weg ist (kein
// Overlay-Stapel und kein "intrusive interstitial" beim Einstieg aus der
// Suche) und danach 30 Tage lang nicht mehr.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FocusTrap } from "focus-trap-react";
import { X } from "lucide-react";
import { useCookies } from "@/context/CookieContext";
import styles from "./AppPromoModal.module.css";
import appStoreBadge from "@/public/app-store-badge.svg";
import googlePlayBadge from "@/public/android-store-badge.svg";

const APP_STORE_URL = "https://apple.co/46r4XcG";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.fairfuehrer.app";

// Texte an einer Stelle gebündelt — analog zu SIGHTS_LOCK_FALLBACK in
// MapBoxMap.tsx, damit sie später ohne Umbau nach Directus wandern können.
const CONTENT = {
  title: "Fairführer als App",
  body: "Nimm den Fairführer mit: Audioguides zu allen Orten, Karten für unterwegs und mit Fairführer+ Zugang zu allen PINs und exklusiven Funktionen.",
  cta_headline: "Jetzt kostenlos laden:",
  app_store_label: "Fairführer im App Store öffnen",
  google_play_label: "Fairführer bei Google Play öffnen",
  close_label: "Hinweis schließen",
};

/** Tablets und Smartphones — darüber bleibt der Hinweis aus. */
const MOBILE_QUERY = "(max-width: 1024px)";
const DISMISS_KEY = "app-promo-dismissed-at";
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 3000;
const CLOSE_ANIMATION_MS = 250;

/** localStorage kann im Privatmodus werfen — dann zeigen wir den Hinweis. */
function wasRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function rememberDismissal(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Kein Speicher verfügbar — der Hinweis kommt beim nächsten Besuch wieder.
  }
}

export default function AppPromoModal() {
  const { showBanner } = useCookies();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Das Portal darf erst nach dem Mount rendern.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Zeitgesteuertes Einblenden. Der Effekt hängt an showBanner: solange der
  // Cookie-Banner sichtbar ist, läuft kein Timer. Sobald er verschwindet,
  // beginnt die Wartezeit von vorn.
  useEffect(() => {
    if (!mounted || isOpen || showBanner) return;
    if (wasRecentlyDismissed()) return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;

    const timeoutId = setTimeout(() => setIsOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [mounted, isOpen, showBanner]);

  // Einblenden erst im nächsten Frame, damit der Übergang greift.
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      return;
    }
    const frameId = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  // Wird das Fenster auf Desktop-Breite gezogen, verschwindet der Hinweis —
  // ohne die 30-Tage-Sperre, denn der Nutzer hat ihn nicht weggeklickt.
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setIsOpen(false);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Scroll-Sperre, solange der Hinweis offen ist.
  useEffect(() => {
    if (!isOpen) return;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleClose = useCallback(() => {
    rememberDismissal();
    setIsVisible(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(
      () => setIsOpen(false),
      CLOSE_ANIMATION_MS,
    );
  }, []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) handleClose();
    },
    [handleClose],
  );

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={`${styles.backdrop} ${isVisible ? styles.visible : ""}`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      <FocusTrap
        active={isOpen}
        focusTrapOptions={{
          initialFocus: `button.${styles.closeButton}`,
          allowOutsideClick: true,
          escapeDeactivates: (event) => {
            handleClose();
            event.preventDefault();
            return false;
          },
          returnFocusOnDeactivate: true,
        }}
      >
        <div
          className={`${styles.modal} ${isVisible ? styles.visible : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-promo-title"
          aria-describedby="app-promo-body"
        >
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label={CONTENT.close_label}
          >
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>

          <h2 id="app-promo-title" className={styles.title}>
            {CONTENT.title}
          </h2>
          <p id="app-promo-body" className={styles.body}>
            {CONTENT.body}
          </p>
          <p className={styles.cta}>{CONTENT.cta_headline}</p>

          <div className={styles.badges}>
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.badge}
              aria-label={CONTENT.app_store_label}
              onClick={handleClose}
            >
              <Image
                src={appStoreBadge}
                alt="App Store"
                unoptimized
                className={styles.badgeImg}
              />
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.badge}
              aria-label={CONTENT.google_play_label}
              onClick={handleClose}
            >
              <Image
                src={googlePlayBadge}
                alt="Google Play"
                unoptimized
                className={styles.badgeImg}
              />
            </a>
          </div>
        </div>
      </FocusTrap>
    </div>,
    document.body,
  );
}

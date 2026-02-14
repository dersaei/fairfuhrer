// components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CookieSettings from "./CookieSettings";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on /karte page
  if (pathname === "/karte") {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Główna sekcja Footer */}
        <div className={styles.content}>
          {/* Logo/Nazwa */}
          <div className={styles.brand}>
            <h3 className={styles.brandName}>FairFührer Guide</h3>
            <p className={styles.brandDescription}>
              Der Reiseführer für nachhaltiges Leben & Reisen
            </p>
          </div>

          {/* Linki nawigacyjne */}
          <div className={styles.links}>
            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Entdecken</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/" className={styles.link}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/karte" className={styles.link}>
                    Karte
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Information</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/partner-werden" className={styles.link}>
                    Partner Werden
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className={styles.link}>
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4 className={styles.linkTitle}>Rechtliches</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/impressum" className={styles.link}>
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className={styles.link}>
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <CookieSettings />
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright sekcja */}
        <div className={styles.bottom}>
          <div className={styles.copyright}>
            <p>
              &copy; {new Date().getFullYear()} Seenergien GmbH, Hintere Insel
              1, 88131 Lindau, Deutschland. Alle Rechte vorbehalten.
            </p>
          </div>

          {/* Social media lub dodatkowe linki */}
          <div className={styles.social}>
            <p className={styles.socialText}>Folgen Sie uns:</p>
            <div className={styles.mobileSocial}>
              <a
                href="https://www.instagram.com/fairfuehrerofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Instagram"
              >
                <svg
                  width="26"
                  height="26"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61561084330676"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Facebook"
              >
                <svg
                  width="26"
                  height="26"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M279.14 288l14.22-92.66h-88.91V127.45c0-25.35 12.42-50.06 52.24-50.06H293V6.26S259.5 0 225.36 0c-73.22 0-121 44.38-121 124.72v70.62H22.89V288h81.47v224h100.2V288z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

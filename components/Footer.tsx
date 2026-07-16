// components/Footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CookieSettings from "./CookieSettings";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/karte") {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} FAIRFÜHRER
        </p>
        <div className={styles.links}>
          <Link href="/partner-werden/voraussetzungen" className={styles.link}>
            Voraussetzungen
          </Link>
          <Link href="/impressum" className={styles.link}>
            Impressum
          </Link>
          <Link href="/datenschutz" className={styles.link}>
            Datenschutz
          </Link>
          <Link href="/agb" className={styles.link}>
            AGB
          </Link>
          <CookieSettings />
        </div>
      </div>
    </footer>
  );
}

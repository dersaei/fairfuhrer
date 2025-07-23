// fairfuhrer/app/components/CookieSettings.tsx
"use client";

import React from "react";
import { useCookies } from "../context/CookieContext";
import styles from "./CookieSettings.module.css";

export default function CookieSettings() {
  const { showSettings } = useCookies();

  return (
    <button
      className={styles.cookieSettingsButton}
      onClick={showSettings}
      aria-label="Cookie-Einstellungen öffnen"
    >
      🍪 Cookie-Einstellungen
    </button>
  );
}

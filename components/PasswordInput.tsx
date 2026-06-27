"use client";

import { useState, type InputHTMLAttributes } from "react";
import styles from "./PasswordInput.module.css";

// Wrapper um <input type="password"> mit Sichtbarkeits-Toggle. Ersetzt alle
// bisherigen `<input type="password" ... />` in login/register/Einstellungen
// — ein Ort, eine Implementierung, konsistentes Verhalten.
//
// Alle nativen <input>-Props (außer `type` — das wird intern verwaltet)
// werden durchgereicht. `className` greift auf das eigentliche Eingabefeld,
// kompatibel mit den bestehenden styles.input Klassen.

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export default function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  const { className, ...rest } = props;

  return (
    <div className={styles.wrapper}>
      <input
        {...rest}
        type={visible ? "text" : "password"}
        className={`${className ?? ""} ${styles.input}`.trim()}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={styles.toggleBtn}
        aria-label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c5 0 9 4 10 7-.6 1.4-1.5 2.7-2.6 3.7M6.6 6.6C3.6 8.2 2 12 2 12s2.6 5.5 7.5 6.7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1={2} y1={2} x2={22} y2={22} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

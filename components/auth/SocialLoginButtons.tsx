"use client";

import type { OAuthProvider } from "@/types/auth";
import styles from "./SocialLoginButtons.module.css";

interface Props {
  onOAuth: (provider: OAuthProvider) => void;
}

const PROVIDERS: { id: OAuthProvider; label: string; color: string; textColor: string }[] = [
  { id: "google", label: "Google", color: "#fff", textColor: "#3c3c3c" },
  { id: "apple", label: "Apple", color: "#000", textColor: "#fff" },
  { id: "facebook", label: "Facebook", color: "#1877f2", textColor: "#fff" },
  { id: "twitter", label: "X (Twitter)", color: "#000", textColor: "#fff" },
  { id: "spotify", label: "Spotify", color: "#1db954", textColor: "#fff" },
];

export default function SocialLoginButtons({ onOAuth }: Props) {
  return (
    <div className={styles.wrapper}>
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className={styles.button}
          style={{ backgroundColor: p.color, color: p.textColor }}
          onClick={() => onOAuth(p.id)}
        >
          <span className={styles.label}>Mit {p.label} anmelden</span>
        </button>
      ))}
    </div>
  );
}

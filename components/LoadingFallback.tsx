// components/LoadingFallback.tsx
"use client";

import styles from "./LoadingFallback.module.css";

interface LoadingFallbackProps {
  message?: string;
  size?: "small" | "medium" | "large";
  overlay?: boolean;
}

export default function LoadingFallback({
  message = "Laden...",
  size = "medium",
  overlay = false,
}: LoadingFallbackProps) {
  const containerClass = overlay
    ? `${styles.overlay} ${styles[size]}`
    : `${styles.container} ${styles[size]}`;

  return (
    <div className={containerClass}>
      <div className={styles.spinner}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}

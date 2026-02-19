// components/ConditionalPayPal.tsx
"use client";

import type { ReactNode } from "react";
import { useCookies } from "../context/CookieContext";
import styles from "./PayPalButtons.module.css";

interface ConditionalPayPalProps {
  children: ReactNode;
}

export function ConditionalPayPal({ children }: ConditionalPayPalProps) {
  const { hasConsented } = useCookies();

  if (!hasConsented) {
    return (
      <div className={styles.consentNotice}>
        <p>
          PayPal wird geladen, nachdem Sie den Cookie-Einstellungen zugestimmt
          haben.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// components/ErrorScreen.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./ErrorScreen.module.css";

/**
 * Wspólna warstwa prezentacyjna dla stron błędów (error.tsx, not-found.tsx).
 * Bez dyrektywy "use client" — komponent jest czysto prezentacyjny, więc działa
 * zarówno w Server Components (not-found.tsx), jak i w Client Components
 * (error boundaries). Interaktywne akcje przekazuje się przez children.
 */
interface ErrorScreenProps {
  title: string;
  message: string;
  hint?: string;
  digest?: string;
  children?: ReactNode;
}

export default function ErrorScreen({
  title,
  message,
  hint,
  digest,
  children,
}: ErrorScreenProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      {children && <div className={styles.actions}>{children}</div>}
      {digest && (
        <p className={styles.digest}>
          Fehlercode: <code>{digest}</code>
        </p>
      )}
    </div>
  );
}

interface ActionProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function ErrorScreenButton({
  children,
  variant = "primary",
  onClick,
}: ActionProps & { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={variant === "primary" ? styles.primary : styles.secondary}
    >
      {children}
    </button>
  );
}

export function ErrorScreenLink({
  children,
  variant = "secondary",
  href,
}: ActionProps & { href: string }) {
  return (
    <Link
      href={href}
      className={variant === "primary" ? styles.primary : styles.secondary}
    >
      {children}
    </Link>
  );
}

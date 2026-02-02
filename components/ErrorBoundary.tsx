// components/ErrorBoundary.tsx
"use client";

import React, { ReactNode } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";
import styles from "./ErrorBoundary.module.css";

// ✅ REACT 19.2: Funkcyjny Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div className={styles.errorContainer}>
      <h2 className={styles.errorTitle}>Ein Fehler ist aufgetreten</h2>
      <p className={styles.errorMessage}>
        Die Kartenkomponente konnte nicht geladen werden.
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className={styles.retryButton}
      >
        Erneut versuchen
      </button>
      {error != null && (
        <details className={styles.errorDetails}>
          <summary className={styles.errorSummary}>Technische Details</summary>
          <pre className={styles.errorStack}>{errorStack || errorMessage}</pre>
        </details>
      )}
    </div>
  );
}

// ✅ REACT 19.2: Funkcyjny ErrorBoundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

export function ErrorBoundary({
  children,
  fallback,
  onReset,
}: ErrorBoundaryProps) {
  const handleError = (error: unknown, errorInfo: { componentStack?: string | null }) => {
    console.error("🚨 Error caught by boundary:", error);

    if (errorInfo.componentStack) {
      console.error("📍 Component stack:", errorInfo.componentStack);
    }

    // ✅ Optional: Send to error tracking service (Sentry, LogRocket, etc.)
    if (typeof window !== "undefined" && window.gtag) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      window.gtag("event", "exception", {
        description: message,
        fatal: false,
        stack: stack,
      });
    }
  };

  const handleReset = () => {
    console.log("🔄 ErrorBoundary reset triggered");
    onReset?.();
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  );
}

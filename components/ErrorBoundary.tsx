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
      {error && (
        <details className={styles.errorDetails}>
          <summary className={styles.errorSummary}>Technische Details</summary>
          <pre className={styles.errorStack}>{error.stack || error.message}</pre>
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
  const handleError = (error: Error, errorInfo: { componentStack?: string | null }) => {
    console.error("🚨 Error caught by boundary:", error);

    if (errorInfo.componentStack) {
      console.error("📍 Component stack:", errorInfo.componentStack);
    }

    // ✅ Optional: Send to error tracking service (Sentry, LogRocket, etc.)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: error.message,
        fatal: false,
        stack: error.stack,
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

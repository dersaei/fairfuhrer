// lib/reportError.ts
/**
 * Zgłasza błąd do konsoli i do Google Analytics (jeśli użytkownik wyraził zgodę
 * i gtag jest załadowany). Używane przez route-level error boundaries.
 */
export function reportError(
  error: Error & { digest?: string },
  context: string
): void {
  console.error(`🚨 ${context}:`, error);

  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "exception", {
    description: `${context}: ${error.message}`,
    fatal: false,
    digest: error.digest,
  });
}

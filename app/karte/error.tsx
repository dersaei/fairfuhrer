// app/karte/error.tsx
"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import ErrorScreen, {
  ErrorScreenButton,
  ErrorScreenLink,
} from "../../components/ErrorScreen";
import { reportError } from "../../lib/reportError";

export default function KarteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    reportError(error, "Karte error boundary");
  }, [error]);

  return (
    <ErrorScreen
      title="Die Karte konnte nicht geladen werden"
      message="Die Ortsdaten sind im Moment nicht abrufbar."
      hint="Das ist meist ein vorübergehendes Problem. Bitte versuchen Sie es in einem Augenblick noch einmal."
      digest={error.digest}
    >
      <ErrorScreenButton onClick={() => unstable_retry()}>
        Erneut versuchen
      </ErrorScreenButton>
      <ErrorScreenLink href="/">Zur Startseite</ErrorScreenLink>
    </ErrorScreen>
  );
}

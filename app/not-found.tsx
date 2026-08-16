// app/not-found.tsx
import type { Metadata } from "next";
import ErrorScreen, { ErrorScreenLink } from "../components/ErrorScreen";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  description: "Die aufgerufene Seite existiert nicht.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <ErrorScreen
      title="Seite nicht gefunden"
      message="Die aufgerufene Seite existiert nicht oder wurde verschoben."
      hint="Vielleicht finden Sie über die Karte oder die Startseite, wonach Sie suchen."
    >
      <ErrorScreenLink href="/" variant="primary">
        Zur Startseite
      </ErrorScreenLink>
      <ErrorScreenLink href="/karte">Zur Karte</ErrorScreenLink>
    </ErrorScreen>
  );
}

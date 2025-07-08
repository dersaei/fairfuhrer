// app/sparschwein/cancel/page.tsx - POPRAWIONA (opcjonalnie)
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

// ✅ Komponent używający useSearchParams
function CancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const reason = searchParams.get("reason");

  return (
    <div className={styles.container}>
      <div className={styles.cancelCard}>
        <div className={styles.iconContainer}>
          <XCircle size={64} />
        </div>

        <h1 className={styles.title}>Zahlung abgebrochen</h1>

        <p className={styles.subtitle}>
          Ihre PayPal-Zahlung wurde abgebrochen. Es wurde kein Betrag abgebucht.
        </p>

        {orderId && (
          <div className={styles.orderInfo}>
            <p>Abgebrochene Transaktion: {orderId}</p>
          </div>
        )}

        {reason && (
          <div className={styles.reasonInfo}>
            <p>Grund: {reason}</p>
          </div>
        )}

        <div className={styles.message}>
          <p>Das ist völlig in Ordnung! Sie können:</p>
          <ul>
            <li>Die Zahlung erneut versuchen</li>
            <li>Eine andere Zahlungsmethode wählen</li>
            <li>Oder eine Banküberweisung nutzen</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/sparschwein" className={styles.retryButton}>
            <RotateCcw size={16} />
            Erneut versuchen
          </Link>

          <Link href="/" className={styles.homeButton}>
            <ArrowLeft size={16} />
            Zur Hauptseite
          </Link>
        </div>
      </div>
    </div>
  );
}

// ✅ Loading fallback
function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.cancelCard}>
        <div className={styles.iconContainer}>
          <div className={styles.spinner}></div>
        </div>
        <h1 className={styles.title}>Lädt...</h1>
      </div>
    </div>
  );
}

// ✅ GŁÓWNY KOMPONENT z Suspense
export default function CancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CancelContent />
    </Suspense>
  );
}

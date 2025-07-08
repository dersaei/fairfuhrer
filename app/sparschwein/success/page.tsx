// app/sparschwein/success/page.tsx - POPRAWIONA Z SUSPENSE
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

// ✅ POPRAWKA: Wydziel komponent używający useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const amount = searchParams.get("amount");

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.iconContainer}>
          <CheckCircle2 size={64} />
        </div>

        <h1 className={styles.title}>Vielen Dank für Ihre Spende!</h1>

        <p className={styles.subtitle}>
          Ihre Zahlung wurde erfolgreich verarbeitet.
        </p>

        {amount && (
          <div className={styles.amountDisplay}>
            <Heart size={20} />
            <span>Spendenbetrag: {amount} EUR</span>
          </div>
        )}

        {orderId && (
          <div className={styles.orderInfo}>
            <p>Transaktions-ID: {orderId}</p>
          </div>
        )}

        <div className={styles.message}>
          <p>
            Ihre Unterstützung hilft uns dabei, ein Netzwerk aufzubauen, das
            faire Geschäfte und nachhaltige Orte miteinander verbindet.
          </p>
          <p>
            Sie sollten in Kürze eine Bestätigungs-E-Mail von PayPal erhalten.
          </p>
        </div>

        <div className={styles.actions}>
          <Link href="/sparschwein" className={styles.backButton}>
            <ArrowLeft size={16} />
            Zurück zur Spendenseite
          </Link>

          <Link href="/" className={styles.homeButton}>
            Zur Hauptseite
          </Link>
        </div>
      </div>
    </div>
  );
}

// ✅ POPRAWKA: Loading fallback komponent
function LoadingFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.iconContainer}>
          <div className={styles.spinner}></div>
        </div>
        <h1 className={styles.title}>Lädt...</h1>
        <p className={styles.subtitle}>Transaktionsdetails werden geladen...</p>
      </div>
    </div>
  );
}

// ✅ GŁÓWNY KOMPONENT z Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

// app/loading.tsx
import LoadingFallback from "../components/LoadingFallback";

/**
 * Fallback dla tras, które nie mają własnego loading.tsx (mapa ma swój).
 * Zastępuje GlobalLoadingIndicator, który nie mógł działać: useLinkStatus
 * wymaga komponentu potomnego <Link>, a był montowany w root layoucie,
 * więc `pending` zawsze było false.
 */
export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LoadingFallback message="Wird geladen..." size="medium" />
    </div>
  );
}

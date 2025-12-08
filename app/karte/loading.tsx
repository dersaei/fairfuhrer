// app/karte/loading.tsx - Next.js 16.0.7 + React 19.2.1
// ✅ Loading state for map page with skeleton UI

import styles from './loading.module.css'

export default function Loading() {
  return (
    <div className={styles.loadingContainer}>
      {/* Map skeleton */}
      <div className={styles.mapSkeleton}>
        <div className={styles.pulseOverlay} />

        {/* Simulated map controls */}
        <div className={styles.controlsSkeleton}>
          <div className={styles.skeletonBox} />
          <div className={styles.skeletonBox} />
        </div>

        {/* Loading text - center of screen */}
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <h2 className={styles.loadingTitle}>Karte wird geladen...</h2>
          <p className={styles.loadingSubtitle}>
            Orte und Kategorien werden vorbereitet
          </p>
        </div>
      </div>

      {/* Legend skeleton - exact copy of real legend layout */}
      <div className={styles.filtersSkeleton}>
        {/* Legend header - matches MapWithFilters */}
        <h3 className={styles.legendTitle}>Legende</h3>
        <p className={styles.legendSubtitle}>
          Filtern Sie Orte nach Kategorien
        </p>

        {/* Category items skeleton */}
        {[...Array(7)].map((_, i) => (
          <div key={i} className={styles.categoryItem}>
            {/* Checkbox skeleton */}
            <div className={styles.checkboxSkeleton} />
            {/* Category name skeleton - CSS handles variable widths */}
            <div className={styles.categoryNameSkeleton} />
            {/* Info icon skeleton - show on most items (5 out of 7) */}
            {i < 5 && <div className={styles.infoIconSkeleton} />}
          </div>
        ))}
      </div>
    </div>
  )
}

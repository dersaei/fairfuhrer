// components/MapWithFilters.tsx - Z dodanym podtytułem
"use client";

import { useState, useCallback, useMemo } from "react";
import MapBoxMap from "./MapBoxMap";
import CategoryFilter from "./CategoryFilter";
import styles from "./MapWithFilters.module.css";
import type { Place, Category } from "../types";
import { useAuth } from "@/context/AuthContext";
import { filterVisiblePlaces, isSightsCategory, FREE_SIGHTS_VISIBLE_RATIO } from "@/lib/sightsGating";

interface MapWithFiltersProps {
  places: Place[];
  categories: Category[];
  disableGeolocation?: boolean;
  embedded?: boolean;
}

export default function MapWithFilters({
  places,
  categories,
  disableGeolocation = false,
  embedded = false,
}: MapWithFiltersProps) {
  const { isPro } = useAuth();

  // Inicjalizacja z wszystkimi kategoriami
  const allCategoryIds = useMemo(
    () => categories.map((c) => c.id),
    [categories]
  );

  const [selectedCategoryIds, setSelectedCategoryIds] =
    useState<number[]>(allCategoryIds);

  const handleToggleCategory = useCallback((categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  // Free users see ceil(20 %) of Sehenswertes places; premium sees 100 %.
  const visiblePlaces = useMemo(
    () => filterVisiblePlaces(places, isPro),
    [places, isPro]
  );

  // Memoized filtering dla lepszej wydajności
  const filteredPlaces = useMemo(() => {
    if (selectedCategoryIds.length === 0) {
      return [];
    }

    return visiblePlaces.filter((place) =>
      place.Kategorie.some((cat) => selectedCategoryIds.includes(cat.id))
    );
  }, [visiblePlaces, selectedCategoryIds]);

  const containerClass = `${styles.container}${embedded ? ` ${styles.containerEmbedded}` : ""}`;

  // Handle przypadku gdy brak kategorii
  if (categories.length === 0) {
    return (
      <div className={containerClass}>
        <div className={styles.errorMessage}>Keine Kategorien verfügbar</div>
      </div>
    );
  }

  // Handle przypadku gdy brak miejsc
  if (places.length === 0) {
    return (
      <div className={containerClass}>
        <div className={styles.errorMessage}>Keine Orte verfügbar</div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <MapBoxMap
        places={embedded ? places : filteredPlaces}
        disableGeolocation={disableGeolocation}
        embedded={embedded}
      />

      {!embedded && (
        <div className={styles.filtersContainer}>
          <h3 className={styles.legendTitle}>Legende</h3>
          <p className={styles.legendSubtitle}>
            Filtern Sie Orte nach Kategorien
          </p>
          <CategoryFilter
            categories={categories}
            selectedIds={selectedCategoryIds}
            onToggle={handleToggleCategory}
            isPro={isPro}
            isSightsCategory={isSightsCategory}
            freeSightsRatio={FREE_SIGHTS_VISIBLE_RATIO}
          />
        </div>
      )}
    </div>
  );
}

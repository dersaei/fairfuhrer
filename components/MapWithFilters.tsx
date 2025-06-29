// components/MapWithFilters.tsx - Z dodanym podtytułem
"use client";

import { useState, useCallback, useMemo } from "react";
import MapBoxMap from "./MapBoxMap";
import CategoryFilter from "./CategoryFilter";
import styles from "./MapWithFilters.module.css";
import type { Place, Category } from "../types";

interface MapWithFiltersProps {
  places: Place[];
  categories: Category[];
}

export default function MapWithFilters({
  places,
  categories,
}: MapWithFiltersProps) {
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

  // Memoized filtering dla lepszej wydajności
  const filteredPlaces = useMemo(() => {
    if (selectedCategoryIds.length === 0) {
      return []; // Brak wybranych kategorii = brak miejsc
    }

    return places.filter((place) =>
      place.Kategorie.some((cat) => selectedCategoryIds.includes(cat.id))
    );
  }, [places, selectedCategoryIds]);

  // Handle przypadku gdy brak kategorii
  if (categories.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Keine Kategorien verfügbar</div>
      </div>
    );
  }

  // Handle przypadku gdy brak miejsc
  if (places.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Keine Orte verfügbar</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MapBoxMap places={filteredPlaces} />

      <div className={styles.filtersContainer}>
        <h3 className={styles.legendTitle}>Legende</h3>
        <p className={styles.legendSubtitle}>
          Filtern Sie Orte nach Kategorien
        </p>
        <CategoryFilter
          categories={categories}
          selectedIds={selectedCategoryIds}
          onToggle={handleToggleCategory}
        />
      </div>
    </div>
  );
}

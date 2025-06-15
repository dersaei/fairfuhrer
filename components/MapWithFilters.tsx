// components/MapWithFilters.tsx
"use client";

import { useState } from "react";
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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    categories.map((c) => c.id)
  );

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredPlaces = places.filter((place) =>
    place.Kategorie.some((cat: Category) =>
      selectedCategoryIds.includes(cat.id)
    )
  );

  return (
    <div className={styles.container}>
      <MapBoxMap places={filteredPlaces} />

      <div className={styles.filtersContainer}>
        <h3 className={styles.legendTitle}>Legende</h3>
        <CategoryFilter
          categories={categories}
          selectedIds={selectedCategoryIds}
          onToggle={handleToggleCategory}
        />
      </div>
    </div>
  );
}

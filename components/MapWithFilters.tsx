// components/MapWithFilters.tsx
"use client";

import { useState } from "react";
import MapBoxMap, { type Place } from "./MapBoxMap";
import CategoryFilter from "./CategoryFilter";
import styles from "./MapWithFilters.module.css";

interface MapWithFiltersProps {
  places: Place[];
  categories: Array<{
    id: number;
    name: string;
    color: string;
  }>;
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
    place.categories.some((cat) => selectedCategoryIds.includes(cat.id))
  );

  return (
    <div className={styles.container}>
      <MapBoxMap places={filteredPlaces} />

      <div className={styles.filtersContainer}>
        <CategoryFilter
          categories={categories}
          selectedIds={selectedCategoryIds}
          onToggle={handleToggleCategory}
        />
      </div>
    </div>
  );
}

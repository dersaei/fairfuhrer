// components/CategoryFilter.tsx - Ostateczna wersja
import React, { useCallback } from "react";
import styles from "./CategoryFilter.module.css";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedIds,
  onToggle,
}) => {
  // Memoized handler dla keyboard events
  const createKeyDownHandler = useCallback(
    (id: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(id);
      }
    },
    [onToggle]
  );

  // Handle przypadku pustych kategorii
  if (!categories.length) {
    return (
      <div className={styles.filterContainer}>
        <p className={styles.noCategories}>Keine Kategorien verfügbar</p>
      </div>
    );
  }

  return (
    <div className={styles.filterContainer}>
      {categories.map((category) => {
        const isActive = selectedIds.includes(category.id);

        return (
          <div
            key={category.id}
            className={styles.filterItem}
            onClick={() => onToggle(category.id)}
            onKeyDown={createKeyDownHandler(category.id)}
            tabIndex={0}
            role="button"
            aria-pressed={isActive ? "true" : "false"}
            aria-label={`Kategorie ${category.name} ${
              isActive ? "ausblenden" : "anzeigen"
            }`}
          >
            <div
              className={`${styles.checkmark} ${isActive ? styles.active : ""}`}
              style={
                { "--category-color": category.color } as React.CSSProperties
              }
            />
            <span className={styles.filterName}>{category.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryFilter;

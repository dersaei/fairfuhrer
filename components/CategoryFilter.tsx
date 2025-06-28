// components/CategoryFilter.tsx - Poprawki TypeScript
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

// Lepsze typowanie dla FilterLabel
interface FilterLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const FilterLabel: React.FC<FilterLabelProps> = ({ children, ...props }) => (
  <span {...props}>{children}</span>
);

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedIds,
  onToggle,
}) => {
  // Memoized handler dla keyboard events
  const createKeyDownHandler = useCallback(
    (id: number) => (e: React.KeyboardEvent<HTMLSpanElement>) => {
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
          <FilterLabel
            key={category.id}
            className={`${styles.filterLabel} ${
              isActive ? styles.active : styles.inactive
            }`}
            style={
              {
                "--bg-color": category.color,
              } as React.CSSProperties & { "--bg-color": string }
            }
            onClick={() => onToggle(category.id)}
            onKeyDown={createKeyDownHandler(category.id)}
            tabIndex={0}
            role="button"
            aria-pressed={isActive}
            aria-label={`Kategorie ${category.name} ${
              isActive ? "ausblenden" : "anzeigen"
            }`}
          >
            <span className={styles.filterName}>{category.name}</span>
            <span className={styles.filterIcon} aria-hidden="true">
              {isActive ? "✓" : "○"}
            </span>
          </FilterLabel>
        );
      })}

      {/* Zusätzliche Info über Auswahl 
      <div className={styles.selectionInfo}>
        {selectedIds.length} von {categories.length} Kategorien aktiv
      </div> */}
    </div>
  );
};

export default CategoryFilter;

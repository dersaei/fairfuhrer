// components/CategoryFilter.tsx
import React from "react";
import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
  categories: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  selectedIds: number[];
  onToggle: (id: number) => void;
}

// Używamy bezpośrednio HTMLAttributes zamiast pustego interfejsu
const FilterLabel: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({
  children,
  ...props
}) => <span {...props}>{children}</span>;

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedIds,
  onToggle,
}) => {
  const handleKeyDown =
    (id: number) => (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(id);
      }
    };

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
              } as React.CSSProperties
            }
            onClick={() => onToggle(category.id)}
            onKeyDown={handleKeyDown(category.id)}
            tabIndex={0}
          >
            <span className={styles.filterName}>{category.name}</span>
          </FilterLabel>
        );
      })}
    </div>
  );
};

export default CategoryFilter;

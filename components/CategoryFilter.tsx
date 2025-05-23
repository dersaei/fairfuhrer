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

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedIds,
  onToggle,
}) => (
  <div className={styles.filterContainer}>
    {categories.map((category) => {
      const isActive = selectedIds.includes(category.id);
      return (
        <div
          key={category.id}
          className={styles.filterLabel}
          style={{
            backgroundColor: isActive ? category.color : "transparent",
            border: `1px solid ${isActive ? "black" : "white"}`,
          }}
          onClick={() => onToggle(category.id)}
          role="button"
          tabIndex={0}
          aria-pressed={isActive}
        >
          <span
            className={styles.filterName}
            style={{ color: isActive ? "black" : "white" }}
          >
            {category.name}
          </span>
        </div>
      );
    })}
  </div>
);

export default CategoryFilter;

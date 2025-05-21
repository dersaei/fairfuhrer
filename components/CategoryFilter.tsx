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
    {categories.map((category) => (
      <label
        key={category.id}
        className={styles.filterLabel}
        style={{ backgroundColor: `${category.color}` }}
      >
        <input
          type="checkbox"
          checked={selectedIds.includes(category.id)}
          onChange={() => onToggle(category.id)}
          className={styles.filterCheckbox}
        />
        <span className={styles.filterName}>{category.name}</span>
      </label>
    ))}
  </div>
);

export default CategoryFilter;

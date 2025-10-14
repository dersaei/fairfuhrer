// components/CategoryFilter.tsx - With proper modal switching
import React, { useCallback, useState } from "react";
import CategoryInfoModal from "./CategoryInfoModal";
import styles from "./CategoryFilter.module.css";
import type { Category } from "../types";

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
  const [modalCategory, setModalCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

  // Memoized handler for keyboard events
  const createKeyDownHandler = useCallback(
    (id: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(id);
      }
    },
    [onToggle]
  );

  // Handle info icon click with proper modal switching
  const handleInfoClick = useCallback(
    (e: React.MouseEvent, category: Category) => {
      e.stopPropagation();

      // If clicking the same icon that's already open, close the modal
      if (openCategoryId === category.id && isModalOpen) {
        setIsModalOpen(false);
        setModalCategory(null);
        setTriggerElement(null);
        setOpenCategoryId(null);
      } else {
        // If another modal is open, close it first then open new one
        if (isModalOpen && openCategoryId !== category.id) {
          // First close the current modal
          setIsModalOpen(false);

          // Wait for close animation, then open new modal
          setTimeout(() => {
            setTriggerElement(e.currentTarget as HTMLElement);
            setModalCategory(category);
            setIsModalOpen(true);
            setOpenCategoryId(category.id);
          }, 200);
        } else {
          // No modal open, just open this one
          setTriggerElement(e.currentTarget as HTMLElement);
          setModalCategory(category);
          setIsModalOpen(true);
          setOpenCategoryId(category.id);
        }
      }
    },
    [openCategoryId, isModalOpen]
  );

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalCategory(null);
    setTriggerElement(null);
    setOpenCategoryId(null);
  }, []);

  // Handle empty categories case
  if (!categories.length) {
    return (
      <div className={styles.filterContainer}>
        <p className={styles.noCategories}>Keine Kategorien verfügbar</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.filterContainer}>
        {categories.map((category) => {
          const isActive = selectedIds.includes(category.id);
          const hasDescription = Boolean(category.description?.trim());
          const isModalOpenForThis =
            openCategoryId === category.id && isModalOpen;

          return (
            <div key={category.id} className={styles.filterWrapper}>
              {/* Filter toggle button */}
              <div
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
                  className={`${styles.checkmark} ${
                    isActive ? styles.active : ""
                  }`}
                  style={
                    {
                      "--category-color": category.color,
                    } as React.CSSProperties
                  }
                />
                <span className={styles.filterName}>{category.name}</span>
              </div>

              {/* Info button - only if description exists */}
              {hasDescription && (
                <button
                  className={styles.infoButton}
                  onClick={(e) => handleInfoClick(e, category)}
                  aria-label={`Informationen zu ${category.name} ${
                    isModalOpenForThis ? "schließen" : "öffnen"
                  }`}
                  aria-expanded={isModalOpenForThis ? "true" : "false"}
                  type="button"
                  style={{
                    // Visual feedback when modal is open for this category
                    opacity: isModalOpenForThis ? 0.7 : 1,
                    transform: isModalOpenForThis ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <CategoryInfoModal
        category={modalCategory}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        triggerElement={triggerElement}
      />
    </>
  );
};

export default CategoryFilter;

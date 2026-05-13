// components/CategoryFilter.tsx - With proper modal switching
import React, { useCallback, useState } from "react";
import CategoryInfoModal from "./CategoryInfoModal";
import styles from "./CategoryFilter.module.css";
import type { Category } from "../types";
import { getCategoryIconPaths, DEFAULT_ICON_PATHS } from "../lib/categoryIcons";

function CategoryPin({
  category,
  isActive,
}: {
  category: Category;
  isActive: boolean;
}) {
  const iconPaths = getCategoryIconPaths(category.id) ?? DEFAULT_ICON_PATHS;
  const color = isActive ? category.color : "#ccc";

  // Ikona Lucide ma viewBox 0 0 24 24.
  // Kółko w łezce: cx=20 cy=19 r=11 → środek (20,19), dostępna przestrzeń ~18×18px.
  // Skalujemy 24→16px (scale=0.667) i przesuwamy do środka kółka: translate(20-8, 19-8)=(12,11)
  return (
    <svg
      width="28"
      height="38"
      viewBox="0 0 40 56"
      aria-hidden="true"
      className={`${styles.categoryPin} ${isActive ? styles.categoryPinActive : styles.categoryPinInactive}`}
    >
      <path
        d="M20,2 C10.611,2 3,9.611 3,19 C3,31 20,54 20,54 C20,54 37,31 37,19 C37,9.611 29.389,2 20,2 Z"
        fill={color}
      />
      <circle cx="20" cy="19" r="11" fill="white" />
      <g
        transform="translate(12,11) scale(0.667)"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        dangerouslySetInnerHTML={{ __html: iconPaths }}
      />
    </svg>
  );
}

interface CategoryFilterProps {
  categories: Category[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  isPro?: boolean;
  isSightsCategory?: (cat: { id: number; name: string }) => boolean;
  freeSightsRatio?: number;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedIds,
  onToggle,
  isPro = true,
  isSightsCategory,
  freeSightsRatio = 0.2,
}) => {
  const [modalCategory, setModalCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        setOpenCategoryId(null);
      } else {
        // If another modal is open, close it first then open new one
        if (isModalOpen && openCategoryId !== category.id) {
          // First close the current modal
          setIsModalOpen(false);

          // Wait for close animation, then open new modal
          setTimeout(() => {
            setModalCategory(category);
            setIsModalOpen(true);
            setOpenCategoryId(category.id);
          }, 200);
        } else {
          // No modal open, just open this one
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

          const showSightsHint =
            !isPro && isSightsCategory != null && isSightsCategory(category);

          return (
            <div key={category.id} className={styles.filterWrapper}>
              {/* Rząd: toggle + opcjonalny przycisk info */}
              <div className={styles.filterWrapperRow}>
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
                  <CategoryPin category={category} isActive={isActive} />
                  <span className={styles.filterName}>{category.name}</span>
                </div>

                {/* Info button - only if description exists */}
                {hasDescription && (
                  <button
                    className={`${styles.infoButton} ${isModalOpenForThis ? styles.infoButtonActive : ""}`}
                    onClick={(e) => handleInfoClick(e, category)}
                    aria-label={`Informationen zu ${category.name} ${
                      isModalOpenForThis ? "schließen" : "öffnen"
                    }`}
                    aria-expanded={isModalOpenForThis ? "true" : "false"}
                    type="button"
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

              {/* Hint pod rzędem — tylko dla free usera przy Sehenswertes */}
              {showSightsHint && (
                <p className={styles.sightsHint}>
                  Kostenlose Konten sehen {Math.round(freeSightsRatio * 100)}&nbsp;%
                  der Sehenswertes-Orte. Mit Fairführer+ sind alle sichtbar.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <CategoryInfoModal
        category={modalCategory}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
};

export default CategoryFilter;

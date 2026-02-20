// components/ExpandableDescription.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { cleanHtml } from "@/utils/cleanHtml";
import styles from "./ExpandableDescription.module.css";

interface ExpandableDescriptionProps {
  content: string;
  maxLines?: number;
  className?: string;
}

export default function ExpandableDescription({
  content,
  maxLines = 6,
  className = "",
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const fullContentRef = useRef<HTMLDivElement>(null);

  const sanitizedContent = cleanHtml(content);

  // Zmierz wysokości raz po zamontowaniu/zmianie treści
  useEffect(() => {
    if (!fullContentRef.current) return;

    const lineHeight = parseFloat(
      window.getComputedStyle(fullContentRef.current).lineHeight
    );
    const maxH = lineHeight * maxLines;
    const actualH = fullContentRef.current.scrollHeight;

    setShouldShowButton(actualH > maxH);
    setCollapsedHeight(Math.min(maxH, actualH));
    setExpandedHeight(actualH);
  }, [content, maxLines]);

  const toggleExpanded = (e: React.MouseEvent | React.TouchEvent) => {
    // Zatrzymaj propagację, żeby document listener nie zinterpretował tego jako kliknięcia poza panelem
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  // Oblicz bieżącą wysokość dla animacji (unikamy animacji do "none")
  const currentMaxHeight =
    collapsedHeight !== null && expandedHeight !== null
      ? isExpanded
        ? expandedHeight
        : collapsedHeight
      : undefined;

  return (
    <div className={`${styles.expandableContainer} ${className}`}>
      {/* Ukryty pełny tekst do pomiaru wysokości */}
      <div
        ref={fullContentRef}
        className={styles.hiddenContent}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        aria-hidden="true"
      />

      {/* Widoczny tekst — animuje do konkretnych wartości px zamiast "none" */}
      <div
        ref={contentRef}
        className={`${styles.content} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
        style={
          currentMaxHeight !== undefined
            ? { maxHeight: `${currentMaxHeight}px` }
            : { maxHeight: `${maxLines * 1.6}em` }
        }
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Gradient overlay gdy tekst jest zwinięty */}
      {shouldShowButton && !isExpanded && (
        <div className={styles.fadeOverlay} />
      )}

      {/* Przycisk rozwiń/zwiń — zawsze renderowany gdy shouldShowButton, nigdy nie znika */}
      {shouldShowButton && (
        <button
          type="button"
          className={styles.toggleButton}
          onClick={toggleExpanded}
          onTouchEnd={toggleExpanded}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded ? "Weniger anzeigen" : "Vollständigen Text anzeigen"
          }
        >
          <span className={styles.buttonText}>
            {isExpanded ? "Weniger anzeigen" : "Mehr lesen"}
          </span>
          <svg
            className={`${styles.chevron} ${
              isExpanded ? styles.chevronUp : styles.chevronDown
            }`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

// components/ExpandableDescription.tsx
"use client";

import { useState, useRef, useEffect } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const fullContentRef = useRef<HTMLDivElement>(null);

  // Sprawdź czy tekst jest dłuższy niż maksymalna liczba linii
  useEffect(() => {
    if (fullContentRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(fullContentRef.current).lineHeight
      );
      const maxHeight = lineHeight * maxLines;
      const actualHeight = fullContentRef.current.scrollHeight;

      setShouldShowButton(actualHeight > maxHeight);
    }
  }, [content, maxLines]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${styles.expandableContainer} ${className}`}>
      {/* Ukryty pełny tekst do pomiaru wysokości */}
      <div
        ref={fullContentRef}
        className={styles.hiddenContent}
        dangerouslySetInnerHTML={{ __html: content }}
        aria-hidden="true"
      />

      {/* Widoczny tekst */}
      <div
        ref={contentRef}
        className={`${styles.content} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
        style={{
          maxHeight: isExpanded ? "none" : `${maxLines * 1.6}em`,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Gradient overlay gdy tekst jest zwinięty */}
      {shouldShowButton && !isExpanded && (
        <div className={styles.fadeOverlay} />
      )}

      {/* Przycisk rozwiń/zwiń */}
      {shouldShowButton && (
        <button
          type="button"
          className={styles.toggleButton}
          onClick={toggleExpanded}
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

// components/MapSearch.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDebounce } from "../hooks/useDebounce";
import type { Place } from "../types";
import styles from "./MapSearch.module.css";

interface MapSearchProps {
  places: Place[];
  onPlaceSelectAction: (place: Place) => void;
  disabled?: boolean;
}

interface SearchResult {
  place: Place;
  matchType: "name" | "address" | "location";
  highlightedText: string;
}

export default function MapSearch({
  places,
  onPlaceSelectAction,
  disabled = false,
}: MapSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce search query dla lepszej wydajności
  const debouncedQuery = useDebounce(searchQuery.trim(), 300);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const escapeRegExp = useCallback((string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }, []);

  const highlightSearchTerm = useCallback(
    (text: string, query: string): string => {
      if (!query) return text;

      const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    },
    [escapeRegExp]
  );

  // ========================================
  // SEARCH LOGIC - TYLKO NAZWA I ADRES
  // ========================================

  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return [];
    }

    // Rozbij query na słowa — każde musi pasować (AND logic)
    const words = debouncedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];

    places.forEach((place) => {
      const nameLower = place.Name.toLowerCase();
      const adresseLower = place.Adresse.toLowerCase();
      const stadtLower = (place.Stadt ?? "").toLowerCase();
      const landLower = (place.Land ?? "").toLowerCase();
      const locationText = [place.Stadt, place.Land].filter(Boolean).join(", ");
      const locationLower = locationText.toLowerCase();

      const nameMatches = words.every((w) => nameLower.includes(w));
      const locationMatches = locationText.length > 0 && words.every((w) =>
        stadtLower.includes(w) || landLower.includes(w) || locationLower.includes(w)
      );
      const addressMatches = words.every((w) => adresseLower.includes(w));

      if (!nameMatches && !locationMatches && !addressMatches) return;

      const matchType: "name" | "address" | "location" = nameMatches
        ? "name"
        : locationMatches
        ? "location"
        : "address";

      const sourceText = nameMatches
        ? place.Name
        : locationMatches
        ? locationText
        : place.Adresse;

      const highlightedText = words.reduce(
        (text, word) => highlightSearchTerm(text, word),
        sourceText
      );

      results.push({ place, matchType, highlightedText });
    });

    return results.sort((a, b) => {
      const priority = { name: 3, location: 2, address: 1 };
      return priority[b.matchType] - priority[a.matchType];
    });
  }, [debouncedQuery, places, highlightSearchTerm]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSearchIconClick = useCallback(() => {
    if (disabled) return;

    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    } else {
      if (!searchQuery.trim()) {
        setIsExpanded(false);
        setSelectedIndex(-1);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [disabled, isExpanded, searchQuery]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setSelectedIndex(-1);

      if (value.trim().length >= 2) {
        setIsLoading(true);
      }
    },
    []
  );

  const handlePlaceSelect = useCallback(
    (place: Place) => {
      onPlaceSelectAction(place);
      setSearchQuery("");
      setIsExpanded(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    [onPlaceSelectAction]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isExpanded || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;

        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handlePlaceSelect(searchResults[selectedIndex].place);
          }
          break;

        case "Escape":
          e.preventDefault();
          setSearchQuery("");
          setIsExpanded(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isExpanded, searchResults, selectedIndex, handlePlaceSelect]
  );

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
        setSelectedIndex(-1);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  /* eslint-disable react-hooks/set-state-in-effect */
  // Loading state needs to sync with search results updates
  useEffect(() => {
    setIsLoading(false);
  }, [searchResults]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // ========================================
  // RENDER
  // ========================================

  const hasResults = searchResults.length > 0;
  const showSuggestions =
    isExpanded && debouncedQuery.length >= 2 && hasResults;
  const showNoResults =
    isExpanded && debouncedQuery.length >= 2 && !hasResults && !isLoading;

  return (
    <div
      ref={containerRef}
      className={`${styles.searchContainer} ${
        isExpanded ? styles.expanded : ""
      } ${disabled ? styles.disabled : ""}`}
    >
      <div className={styles.searchBox}>
        <button
          className={styles.searchIcon}
          onClick={handleSearchIconClick}
          disabled={disabled}
          aria-label="Suche öffnen"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Ort suchen..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
        />

        {isLoading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner} />
          </div>
        )}

        {isExpanded && searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => {
              setSearchQuery("");
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Eingabe löschen"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {(showSuggestions || showNoResults) && (
        <div className={styles.suggestions} ref={suggestionsRef}>
          {showNoResults ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p>Keine Orte gefunden</p>
              <span>Versuchen Sie einen anderen Suchbegriff</span>
            </div>
          ) : (
            searchResults.map((result, index) => (
              <div
                key={result.place.id}
                className={`${styles.suggestionItem} ${
                  index === selectedIndex ? styles.selected : ""
                }`}
                onClick={() => handlePlaceSelect(result.place)}
              >
                <div className={styles.suggestionIcon}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>

                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTitle}>
                    {result.matchType === "name" ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: result.highlightedText,
                        }}
                      />
                    ) : (
                      result.place.Name
                    )}
                  </div>

                  <div className={styles.suggestionMeta}>
                    {result.matchType === "location" ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: result.highlightedText,
                        }}
                      />
                    ) : result.matchType === "address" ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: result.highlightedText,
                        }}
                      />
                    ) : (
                      [result.place.Stadt, result.place.Land].filter(Boolean).join(", ") || result.place.Adresse
                    )}
                  </div>

                  {result.place.Kategorie.length > 0 && (
                    <div className={styles.suggestionCategories}>
                      {result.place.Kategorie.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className={styles.categoryTag}
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      ))}
                      {result.place.Kategorie.length > 2 && (
                        <span className={styles.moreCategories}>
                          +{result.place.Kategorie.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

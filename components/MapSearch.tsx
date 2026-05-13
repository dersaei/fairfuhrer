// components/MapSearch.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import styles from "./MapSearch.module.css";

interface GeoResult {
  id: string;
  name: string;
  place_formatted: string;
  lat: number;
  lon: number;
  bbox: [number, number, number, number] | null; // [minLon, minLat, maxLon, maxLat]
  feature_type: string; // country | region | district | place
}

interface MapSearchProps {
  onLocationSelect: (
    coords: [number, number],
    zoom: number,
    bbox?: [number, number, number, number],
    maxZoom?: number,
  ) => void;
  disabled?: boolean;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function MapSearch({
  onLocationSelect,
  disabled = false,
}: MapSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(searchQuery.trim(), 300);

  // Fetch suggestions from Mapbox Geocoding v6
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (!MAPBOX_TOKEN) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);

    const url =
      `https://api.mapbox.com/search/geocode/v6/forward` +
      `?q=${encodeURIComponent(debouncedQuery)}` +
      `&language=de` +
      `&limit=6` +
      `&types=country,region,district,place` +
      `&autocomplete=true` +
      `&access_token=${MAPBOX_TOKEN}`;

    fetch(url, { signal: abortRef.current.signal })
      .then((r) => r.json())
      .then((json) => {
        const features = (json.features ?? []) as Record<string, unknown>[];
        setResults(
          features.map((f) => {
            const props = f.properties as Record<string, unknown>;
            const geom = f.geometry as { coordinates: [number, number] };
            const rawBbox = props.bbox as number[] | undefined;
            const bbox: [number, number, number, number] | null =
              rawBbox?.length === 4
                ? [rawBbox[0], rawBbox[1], rawBbox[2], rawBbox[3]]
                : null;
            return {
              id: (props.mapbox_id as string) ?? String(Math.random()),
              name: props.name as string,
              place_formatted: (props.place_formatted as string) ?? "",
              lat: geom.coordinates[1],
              lon: geom.coordinates[0],
              bbox,
              feature_type: (props.feature_type as string) ?? "place",
            };
          }),
        );
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setIsLoading(false);
      });

    return () => {
      abortRef.current?.abort();
    };
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (result: GeoResult) => {
      const maxZoom = result.feature_type === "place" ? 13 : undefined;
      onLocationSelect([result.lon, result.lat], 13, result.bbox ?? undefined, maxZoom);
      setSearchQuery(result.name);
      setIsExpanded(false);
      setResults([]);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    },
    [onLocationSelect],
  );

  const handleSearchIconClick = useCallback(() => {
    if (disabled) return;
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      if (!searchQuery.trim()) {
        setIsExpanded(false);
        setSelectedIndex(-1);
      } else {
        inputRef.current?.focus();
      }
    }
  }, [disabled, isExpanded, searchQuery]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isExpanded || results.length === 0) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((p) => (p < results.length - 1 ? p + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((p) => (p > 0 ? p - 1 : results.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) handleSelect(results[selectedIndex]);
          else if (results.length > 0) handleSelect(results[0]);
          break;
        case "Escape":
          e.preventDefault();
          setSearchQuery("");
          setIsExpanded(false);
          setResults([]);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [isExpanded, results, selectedIndex, handleSelect],
  );

  // Close on outside click
  useEffect(() => {
    if (!isExpanded) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isExpanded]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const el = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const showSuggestions = isExpanded && debouncedQuery.length >= 2 && results.length > 0;
  const showNoResults =
    isExpanded && debouncedQuery.length >= 2 && !isLoading && results.length === 0;

  return (
    <div
      ref={containerRef}
      className={`${styles.searchContainer} ${isExpanded ? styles.expanded : ""} ${
        disabled ? styles.disabled : ""
      }`}
    >
      <div className={styles.searchBox}>
        <button
          className={styles.searchIcon}
          onClick={handleSearchIconClick}
          disabled={disabled}
          aria-label="Suche öffnen"
          type="button"
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
          placeholder="Stadt oder Region suchen…"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={(e) => e.target.select()}
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
              setResults([]);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Eingabe löschen"
            type="button"
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
              <p>Keine Ergebnisse</p>
              <span>Versuchen Sie einen anderen Suchbegriff</span>
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={result.id}
                className={`${styles.suggestionItem} ${
                  index === selectedIndex ? styles.selected : ""
                }`}
                onClick={() => handleSelect(result)}
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
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className={styles.suggestionContent}>
                  <div className={styles.suggestionTitle}>{result.name}</div>
                  {result.place_formatted && (
                    <div className={styles.suggestionMeta}>{result.place_formatted}</div>
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

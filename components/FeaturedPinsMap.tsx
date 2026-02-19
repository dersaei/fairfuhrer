"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ConditionalMapbox } from "./ConditionalMapbox";
import MapWithFilters from "./MapWithFilters";
import type { Place, Category } from "@/types";
import styles from "./FeaturedPinsMap.module.css";

interface FeaturedPinsMapProps {
  places: Place[];
}

// Directus M2M deep fetch zwraca surową strukturę junction:
// Kategorie: [{ Kategorie_id: { id, Name, Farbe, description? } }]
// Parsujemy to do Category[] i Place[] z poprawnym Kategorie
function parsePlaces(rawPlaces: Place[]): { places: Place[]; categories: Category[] } {
  const categoryMap = new Map<number, Category>();
  const parsed: Place[] = rawPlaces.map((place) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawKats = place.Kategorie as any[];
    const categories: Category[] = rawKats
      .map((entry) => {
        const k = entry?.Kategorie_id ?? entry;
        if (!k?.id || !k?.Name) return null;
        const cat: Category = {
          id: k.id,
          name: k.Name,
          color: k.Farbe || "#999",
          description: k.Beschreibung ?? k.description ?? "",
        };
        if (!categoryMap.has(cat.id)) categoryMap.set(cat.id, cat);
        return cat;
      })
      .filter(Boolean) as Category[];
    return { ...place, Kategorie: categories };
  });
  return { places: parsed, categories: Array.from(categoryMap.values()) };
}

export default function FeaturedPinsMap({ places }: FeaturedPinsMapProps) {
  const [isInView, setIsInView] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { places: parsedPlaces, categories } = useMemo(
    () => parsePlaces(places),
    [places]
  );

  return (
    <div ref={wrapperRef} className={styles.mapWrapper}>
      {isInView ? (
        <ConditionalMapbox>
          <MapWithFilters
            places={parsedPlaces}
            categories={categories}
            disableGeolocation
            embedded
          />
        </ConditionalMapbox>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderText}>Karte wird geladen…</span>
        </div>
      )}
    </div>
  );
}

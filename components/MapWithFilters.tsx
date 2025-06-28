// components/MapWithFilters.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import MapBoxMap from "./MapBoxMap";
import CategoryFilter from "./CategoryFilter";
import styles from "./MapWithFilters.module.css";
import type { Place, Category } from "../types";

interface MapWithFiltersProps {
  places: Place[];
  categories: Category[];
}

// Funkcja do obliczania odległości między dwoma punktami w kilometrach
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Promień Ziemi w kilometrach
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapWithFilters({
  places,
  categories,
}: MapWithFiltersProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    categories.map((c) => c.id)
  );
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [searchRadius] = useState(10); // 10 km domyślnie
  const [availableCategories, setAvailableCategories] =
    useState<Category[]>(categories);

  // Pobierz lokalizację użytkownika
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation wird nicht unterstützt");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);
      },
      (error) => {
        console.error("Geolocation-Fehler:", error);
        // Jeśli nie można pobrać lokalizacji, pokaż wszystkie miejsca
        setNearbyPlaces(places);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [places]);

  // Filtruj miejsca w pobliżu użytkownika
  const filterNearbyPlaces = useCallback(() => {
    if (!userLocation) {
      // Jeśli nie mamy lokalizacji, nie pokazuj żadnych miejsc początkowo
      setNearbyPlaces([]);
      return;
    }

    const [userLng, userLat] = userLocation;
    const filtered = places.filter((place) => {
      const distance = calculateDistance(
        userLat,
        userLng,
        place.Breite,
        place.Lange
      );
      return distance <= searchRadius;
    });

    setNearbyPlaces(filtered);

    // Aktualizuj dostępne kategorie na podstawie miejsc w pobliżu
    const nearbyCategories = new Set<number>();
    filtered.forEach((place) => {
      place.Kategorie.forEach((cat) => {
        nearbyCategories.add(cat.id);
      });
    });

    const filteredCategories = categories.filter((cat) =>
      nearbyCategories.has(cat.id)
    );
    setAvailableCategories(filteredCategories);

    // Zaktualizuj wybrane kategorie - pozostaw tylko te, które są dostępne
    setSelectedCategoryIds((prev) =>
      prev.filter((id) => nearbyCategories.has(id))
    );
  }, [userLocation, places, searchRadius, categories]);

  // Efekt do pobierania lokalizacji przy pierwszym załadowaniu
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Efekt do filtrowania miejsc po zmianie lokalizacji
  useEffect(() => {
    filterNearbyPlaces();
  }, [filterNearbyPlaces]);

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filtruj miejsca według wybranych kategorii
  const filteredPlaces = nearbyPlaces.filter((place) =>
    place.Kategorie.some((cat: Category) =>
      selectedCategoryIds.includes(cat.id)
    )
  );

  return (
    <div className={styles.container}>
      <MapBoxMap places={filteredPlaces} />

      {/* Pokaż filtry tylko jeśli są dostępne kategorie w pobliżu */}
      {availableCategories.length > 0 && (
        <div className={styles.filtersContainer}>
          <h3 className={styles.legendTitle}>Legende (Umgebung)</h3>
          <CategoryFilter
            categories={availableCategories}
            selectedIds={selectedCategoryIds}
            onToggle={handleToggleCategory}
          />
          <div className={styles.locationInfo}>
            <p>
              Orte in {searchRadius} km Umkreis: {nearbyPlaces.length}
            </p>
            <p>Sichtbare Orte: {filteredPlaces.length}</p>
          </div>
        </div>
      )}

      {/* Pokaż informację jeśli nie ma lokalizacji */}
      {!userLocation && (
        <div className={styles.noLocationInfo}>
          <p>Standortfreigabe erforderlich, um Orte in der Nähe anzuzeigen</p>
        </div>
      )}
    </div>
  );
}

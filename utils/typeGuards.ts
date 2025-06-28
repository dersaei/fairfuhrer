// utils/typeGuards.ts - Type guards dla bezpieczniejszego kodu
import type { Place } from "../types";

/**
 * Sprawdza czy współrzędne są prawidłowe
 */
export function isValidCoordinate(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/**
 * Sprawdza czy obiekt jest prawidłowym Place
 */
export function isValidPlace(place: unknown): place is Place {
  if (typeof place !== "object" || place === null) {
    return false;
  }

  const p = place as Record<string, unknown>;

  return (
    typeof p.id === "number" &&
    typeof p.Name === "string" &&
    typeof p.Adresse === "string" &&
    typeof p.Breite === "number" &&
    typeof p.Lange === "number" &&
    Array.isArray(p.Kategorie) &&
    // Optional fields
    (p.Vollbeschreibung === undefined ||
      typeof p.Vollbeschreibung === "string") &&
    (p.Hauptbild === undefined || typeof p.Hauptbild === "string") &&
    (p.Audio_Datei === undefined || typeof p.Audio_Datei === "string") &&
    (p.Link_URL === undefined || typeof p.Link_URL === "string") &&
    (p.Link_Text === undefined || typeof p.Link_Text === "string") &&
    (p.Galerie_Bilder === undefined || Array.isArray(p.Galerie_Bilder))
  );
}

/**
 * Sprawdza czy Place ma zdjęcia w galerii
 */
export function hasGalleryImages(
  place: Place | null
): place is Place & { Galerie_Bilder: string[] } {
  return Boolean(place?.Galerie_Bilder && place.Galerie_Bilder.length > 0);
}

/**
 * Sprawdza czy wartość jest niepustym stringiem
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Sprawdza czy wartość jest prawidłowym kolorem hex
 */
export function isValidHexColor(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

/**
 * Sprawdza czy wartość jest prawidłowym URL
 */
export function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sprawdza czy tablica nie jest pusta
 */
export function isNonEmptyArray<T>(arr: T[] | undefined | null): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Sprawdza czy wartość jest prawidłowym ID (pozytywna liczba całkowita)
 */
export function isValidId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

/**
 * Sprawdza czy obiekt ma wszystkie wymagane właściwości
 */
export function hasRequiredProperties<T extends Record<string, unknown>>(
  obj: unknown,
  requiredKeys: string[]
): obj is T {
  if (typeof obj !== "object" || obj === null) return false;

  const o = obj as Record<string, unknown>;
  return requiredKeys.every((key) => key in o && o[key] !== undefined);
}

/**
 * Sprawdza czy wartość jest prawidłową koordinatą geograficzną
 */
export function isValidLatitude(value: unknown): value is number {
  return (
    typeof value === "number" && !isNaN(value) && value >= -90 && value <= 90
  );
}

/**
 * Sprawdza czy wartość jest prawidłową długością geograficzną
 */
export function isValidLongitude(value: unknown): value is number {
  return (
    typeof value === "number" && !isNaN(value) && value >= -180 && value <= 180
  );
}

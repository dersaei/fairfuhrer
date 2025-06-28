// types/index.ts - Poprawki dla pustych obiektów

// ========================================
// PODSTAWOWE TYPY DLA MAP I LOKALIZACJI
// ========================================

// ✅ Category - BEZ description (nie ma w Directus)
export interface Category {
  id: number;
  name: string;
  color: string;
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Kategorie = Category;

// ✅ Place - niemieckie nazwy pól
export interface Place {
  id: number;
  Name: string; // niemieckie nazwy pól jak w Directus
  Adresse: string;
  Vollbeschreibung?: string;
  Breite: number; // Już sparsowane do number
  Lange: number; // Już sparsowane do number
  Kategorie: Category[];
  // Pola dla mediów i dodatkowych informacji
  Hauptbild?: string;
  Audio_Datei?: string;
  Link_URL?: string;
  Link_Text?: string;
  Galerie_Bilder?: string[];
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Orte = Place;

// ✅ NOWE TYPY dla MapBox komponentu
export type GeolocationErrorCode = 1 | 2 | 3;

export type PanelState = "closed" | "opening" | "open" | "closing";
export type LoadingState = "idle" | "loading" | "success" | "error";

// Typ dla konfiguracji mapy
export interface MapConfig {
  readonly INITIAL_CENTER: readonly [number, number];
  readonly INITIAL_ZOOM: number;
  readonly USER_LOCATION_ZOOM: number;
  readonly MOBILE_BREAKPOINT: number;
  readonly ANIMATION_DURATION: number;
  readonly MOBILE_ANIMATION_DURATION: number;
}

// Interfejs dla props MapBox komponentu
export interface MapBoxMapProps {
  places: Place[];
}

// ========================================
// TYPY DLA GEOLOKALIZACJI
// ========================================

export interface GeolocationState {
  location: [number, number] | null;
  error: string | null;
  isLoading: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// ========================================
// TYPY DLA BŁĘDÓW I ERROR HANDLING
// ========================================

export type MapErrorCode =
  | "MAPBOX_TOKEN"
  | "GEOLOCATION"
  | "API_ERROR"
  | "INVALID_DATA";

export interface MapErrorInfo {
  code: MapErrorCode;
  message: string;
  originalError?: unknown;
}

// ========================================
// TYPY DLA DIRECTUS API
// ========================================

export interface DirectusMeta {
  total_count?: number;
  filter_count?: number;
}

export interface DirectusError {
  message: string;
  extensions: {
    code: string;
    [key: string]: unknown;
  };
}

export interface DirectusCollectionResponse<T> {
  data: T[];
  meta?: DirectusMeta;
  errors?: DirectusError[];
}

// Typy dla raw Directus responses
export interface DirectusKategorie {
  id: number;
  Name: string;
  Farbe: string;
}

export interface DirectusOrteKategorie {
  id: number;
  Orte_id: number;
  Kategorie_id: DirectusKategorie;
}

export interface DirectusOrte {
  id: number;
  Name: string;
  Adresse: string;
  Vollbeschreibung?: string;
  Breite: string; // String from API - needs parsing
  Lange: string; // String from API - needs parsing
  Kategorie?: DirectusOrteKategorie[];
  Hauptbild?: string;
  Audio_Datei?: string;
  Link_URL?: string;
  Link_Text?: string;
  Galerie_Bilder?: string[];
}

// ========================================
// TYPY DLA FORMULARZY I KONTAKTU
// ========================================

// ✅ ContactMessage - TYLKO JEDEN (bez duplikatu)
export interface ContactMessage {
  id: string; // UUID w Directus
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string; // ISO date string
  status?: "new" | "read" | "replied" | "archived";
}

// Typ dla formularza kontaktowego (przed wysłaniem)
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Typ dla validation errors
export interface FormValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

// ========================================
// TYPY DLA ZAWARTOŚCI STRON
// ========================================

// ✅ PageContent - dla strony "Über uns"
export interface PageContent {
  id: number;
  page_slug: string;
  title: string;
  intro_text: string;
  // Sekcja kwadratów:
  categories_section_title?: string;
  categories_section_subtitle?: string;
  // 7 kwadratów:
  square1_title?: string;
  square1_description?: string;
  square1_color?: string;
  square2_title?: string;
  square2_description?: string;
  square2_color?: string;
  square3_title?: string;
  square3_description?: string;
  square3_color?: string;
  square4_title?: string;
  square4_description?: string;
  square4_color?: string;
  square5_title?: string;
  square5_description?: string;
  square5_color?: string;
  square6_title?: string;
  square6_description?: string;
  square6_color?: string;
  square7_title?: string;
  square7_description?: string;
  square7_color?: string;
}

// ✅ ROZSZERZONE - PartnerPageContent z kolorami dla każdej sekcji
export interface PartnerPageContent {
  id: number;
  page_slug: string;

  // SEKCJA 1 - Grid dwukolumnowy + KOLORY
  section1_left_title?: string;
  section1_left_text?: string;
  section1_left_background_color?: string;
  section1_left_text_color?: string;

  section1_right_title?: string;
  section1_right_text?: string;
  section1_right_image?: string;
  section1_right_background_color?: string;
  section1_right_text_color?: string;
  section1_right_title_color?: string;

  // SEKCJA 2 - Tekst na tle obrazu + KOLORY
  section2_title?: string;
  section2_text?: string;
  section2_background_image?: string;
  section2_overlay_color?: string;
  section2_overlay_opacity?: number; // 0-1
  section2_text_color?: string;

  // SEKCJA 3 - Tekst + YouTube video + KOLORY
  section3_left_title?: string;
  section3_left_text?: string;
  section3_youtube_url?: string;
  section3_background_color?: string;
  section3_text_color?: string;
  section3_title_color?: string;

  // SEKCJA 4 - Formularz kontaktowy + KOLORY
  section4_title?: string;
  section4_subtitle?: string;
  section4_background_color?: string;
  section4_text_color?: string;

  // SEKCJA 5 - Końcowa sekcja + KOLORY
  section5_title?: string;
  section5_text?: string;
  section5_image?: string;
  section5_background_color?: string;
  section5_text_color?: string;
  section5_title_color?: string;
}

// ✅ ImpressumContent
export interface ImpressumContent {
  id: number;
  page_slug: string;
  title: string;
  address: string;
  email: string;
  business_info_top: string;
  business_info_bottom: string;
  legal_content: string; // HTML content
}

// ✅ DatenschutzContent - dla strony Datenschutz
export interface DatenschutzContent {
  id: number;
  page_slug: string;
  title: string;
  content: string; // HTML content
}

// ========================================
// UTILITY TYPY
// ========================================

// Typ dla koordinat geograficznych
export type Coordinates = [longitude: number, latitude: number];

// Typ dla kolorów (hex, rgb, etc.)
export type ColorValue = string;

// Typ dla URL-i
export type URLString = string;

// Typ dla HTML content
export type HTMLString = string;

// Generic typ dla optional ID
export type OptionalId<T> = Omit<T, "id"> & { id?: number };

// Typ dla pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Typ dla sorting
export interface SortParams {
  sort?: string;
  order?: "asc" | "desc";
}

// Typ dla filtering
export interface FilterParams {
  filter?: Record<string, unknown>;
}

// Combined query params
export interface QueryParams
  extends PaginationParams,
    SortParams,
    FilterParams {}

// ========================================
// TYPE GUARDS (dla runtime checking)
// ========================================

// Helper type dla type guards
export type TypeGuard<T> = (value: unknown) => value is T;

// Type guard results
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// ========================================
// POPRAWIONE UTILITY TYPES (bez pustych obiektów)
// ========================================

// ✅ POPRAWKA: Zamiast {} używamy Record<string, never> lub object
export type EmptyObject = Record<string, never>;

// ✅ POPRAWKA: Lepsze definicje dla component props
export type BaseProps = Record<string, unknown>;

// ✅ POPRAWKA: Zamiast {} w utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & Record<string, never>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PartialFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// ✅ POPRAWKA: Component props utility types bez {}
export type ComponentProps<T> = T extends React.ComponentType<infer P>
  ? P
  : never;

export type PropsWithClassName<T = BaseProps> = T & { className?: string };

export type PropsWithChildren<T = BaseProps> = T & {
  children?: React.ReactNode;
};

// ✅ POPRAWKA: Dodatkowe utility types
export type NonEmptyArray<T> = [T, ...T[]];

export type AtLeastOne<
  T,
  U = { [K in keyof T]: Pick<T, K> & Partial<T> }
> = Partial<T> & U[keyof U];

export type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

// Typ dla strict object (bez dodatkowych właściwości)
export type StrictObject<T> = T & Record<Exclude<string, keyof T>, never>;

// ========================================
// REACT COMPONENT TYPES
// ========================================

// Typ dla React component z generic props
export type FC<P = BaseProps> = React.FunctionComponent<P>;

// Typ dla forwardRef components
export type ForwardRefComponent<
  T,
  P = BaseProps
> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

// Typ dla component z children
export type ComponentWithChildren<P = BaseProps> = FC<PropsWithChildren<P>>;

// ========================================
// EXPORT WSZYSTKICH TYPÓW
// ========================================

// Re-export React types dla wygody
export type {
  ReactNode,
  ComponentType,
  RefObject,
  MutableRefObject,
  CSSProperties,
  HTMLAttributes,
  MouseEvent,
  KeyboardEvent,
  ChangeEvent,
  FormEvent,
} from "react";

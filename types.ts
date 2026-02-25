// types/index.ts - Kompletna wersja z uproszczonym formularzem partnerskim (bez obrazów i audio)

// ========================================
// PODSTAWOWE TYPY DLA MAP I LOKALIZACJI
// ========================================

// ✅ Category
export interface Category {
  id: number;
  name: string;
  color: string;
  description?: string;
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Kategorie = Category;

// ✅ Place - niemieckie nazwy pól
export interface Place {
  id: number;
  Name: string; // niemieckie nazwy pół jak w Directus
  Adresse: string;
  Telefon?: string;
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
  Beschreibung?: string;
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
  Telefon?: string;
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
// UPROSZCZONE TYPY DLA FORMULARZA PARTNERSKIEGO (BEZ OBRAZÓW I AUDIO)
// ========================================

export interface PartnerFormData {
  // Dane osobowe (wymagane)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // NOWE POLA - opcjonalne dane firmowe
  billingAddress: string;
  vatNumber: string;

  // Dane miejsca (wymagane)
  placeName: string;
  address: string;
  kategorie: string;

  // USUNIĘTE: mainImage, additionalImages, textContent, audioFile

  // Opcjonalne pola (przeniesione do sekcji "Informationen zum Pin")
  websiteUrl: string;
  message: string;

  // Teilnahmebedingungen
  certificate: string;
  sustainabilityGoals: number[];

  // Pola radio
  certificationStatus: "A" | "B" | "C" | "";
  companySize: "micro" | "small" | "medium" | "ngo" | "";
}

export interface PartnerFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  // NOWE POLA - opcjonalne
  billingAddress?: string;
  vatNumber?: string;
  placeName?: string;
  address?: string;
  kategorie?: string;
  // USUNIĘTE: mainImage, additionalImages, textContent, audioFile
  websiteUrl?: string;
  message?: string;
  // Teilnahmebedingungen
  certificate?: string;
  sustainabilityGoals?: string;
  // Pola radio
  certificationStatus?: string;
  companySize?: string;
  general?: string;
}

export interface PartnerSubmissionData {
  // Dane osobowe
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  // NOWE POLA - opcjonalne dane firmowe
  billing_address?: string;
  vat_number?: string;

  // Dane miejsca
  place_name: string;
  address: string;
  kategorie?: string;

  // USUNIĘTE: text_content

  // Opcjonalne pola tekstowe
  website_url?: string;
  message?: string;

  // Teilnahmebedingungen
  certificate?: string;
  sustainability_goals?: number[];

  // Pola radio
  certification_status?: "A" | "B" | "C";
  company_size?: "micro" | "small" | "medium" | "ngo";

  // Status
  status: "new" | "review" | "approved" | "rejected";
  created_at: string;

  // USUNIĘTE: main_image_url, additional_images_urls, audio_file_url
}

export interface PartnerApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  // NOWE POLA - opcjonalne dane firmowe
  billing_address?: string;
  vat_number?: string;
  place_name: string;
  address: string;
  kategorie?: string;
  // USUNIĘTE: text_content, main_image_url, additional_images_urls, audio_file_url
  website_url?: string;
  message?: string;

  // Teilnahmebedingungen
  certificate?: string;
  sustainability_goals?: number[];

  // Pola radio
  certification_status?: "A" | "B" | "C";
  company_size?: "micro" | "small" | "medium" | "ngo";

  status: "new" | "review" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface CategoryOption {
  value: string;
  label: string;
  color: string;
}

export interface CertificationStatusOption {
  value: "A" | "B" | "C";
  label: string;
  description: string;
}

export interface CompanySizeOption {
  value: "micro" | "small" | "medium" | "ngo";
  label: string;
}

// ========================================
// TYPY DLA ZAWARTOŚCI STRON
// ========================================

// ✅ ROZSZERZONE - PartnerPageContent z kolorami dla każdej sekcji
export interface PartnerPageContent {
  id: number;
  page_slug: string;

  // SEKCJA 1
  section1_title?: string;
  section1_text?: string;
  section1_image?: string;
  section1_background_color?: string;
  section1_text_color?: string;
  section1_title_color?: string;

  // SEKCJA 2 - Tekst + Mux video + KOLORY
  section2_left_title?: string;
  section2_left_text?: string;
  section2_mux_playback_id?: string;
  section2_video_poster?: string;
  section2_video_title?: string;
  section2_background_color?: string;
  section2_text_color?: string;
  section2_title_color?: string;

  // SEKCJA 3 - Formularz kontaktowy + KOLORY
  section3_text?: string;
  section3_background_color?: string;

  // SEKCJA 4 - tylko kolor tła (formularz)
  section4_background_color?: string;

  // SEKCJA 5 - Końcowa sekcja + KOLORY
  section5_title?: string;
  section5_text?: string;
  section5_image?: string;
  section5_background_color?: string;
  section5_text_color?: string;
  section5_title_color?: string;
}

// ✅ FeaturedPin - kolekcja "Featured Pins" w Directus (M2O → Orte)
export interface FeaturedPin {
  id: number;
  ort: Place; // Many-to-One relacja do Orte (deep-fetched)
  sort: number;
  status: "published" | "draft" | "archived";
}

// ✅ HomePageContent - kolekcja "Home Page Content" w Directus
export interface HomePageContent {
  id: number;
  page_slug: string;

  // Hero section
  hero_title?: string;
  hero_title_font_size?: string;
  hero_title_color?: string;
  hero_title_mobile_font_size?: string;
  hero_title_mobile_color?: string;
  hero_subtitle?: string;
  hero_subtitle_font_size?: string;
  hero_subtitle_color?: string;
  hero_button_text?: string;
  hero_button_link?: string;
  hero_button_color?: string;
  hero_button_font_size?: string;
  hero_button_background_color?: string;
  hero_button_mobile_font_size?: string;
  hero_button_mobile_color?: string;
  hero_button_background_color_mobile?: string;
  hero_image?: string; // filename w Supabase
  hero_background_color?: string;

  // Badges bar
  badges_label?: string;
  badges_label_font_size?: string;
  badges_label_color?: string;

  // Section 2 - Kategorie
  section2_background_color?: string;
  section2_title?: string;
  section2_title_font_size?: string;
  section2_title_color?: string;
  section2_title_mobile_font_size?: string;
  category_name_font_size?: string;
  category_name_color?: string;
  category_name_mobile_font_size?: string;

  // Section 3
  section3_background_color?: string;
  section3_title?: string;
  section3_title_font_size?: string;
  section3_title_color?: string;
  section3_title_mobile_font_size?: string;
  section3_text?: string;
  section3_button_text?: string;
  section3_button_color?: string;
  section3_button_font_size?: string;
  section3_button_background_color?: string;

  // Section 4 - Partner werden
  section4_background_color?: string;
  section4_badge_text?: string;
  section4_title?: string;
  section4_title_font_size?: string;
  section4_title_color?: string;
  section4_title_mobile_font_size?: string;
  section4_text?: string;
  section4_text_font_size?: string;
  section4_text_color?: string;
  section4_text_mobile_font_size?: string;
  section4_button_text?: string;
  section4_button_link?: string;
  section4_button_color?: string;
  section4_button_font_size?: string;
  section4_button_background_color?: string;
  section4_button_mobile_font_size?: string;
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
  webseitenerstellung?: string; // HTML content
}

// ✅ DatenschutzContent - dla strony Datenschutz
export interface DatenschutzContent {
  id: number;
  page_slug: string;
  title: string;
  content: string; // HTML content
}

// ✅ SupportSectionContent - dla sekcji wsparcia na stronie /kontakt
export interface SupportSectionContent {
  id: number;
  page_slug: string;
  background_color?: string;
  title?: string;
  title_font_size?: string;
  title_color?: string;
  text?: string;
  text_font_size?: string;
  text_color?: string;
  second_text?: string;
  second_text_font_size?: string;
  second_text_color?: string;
}

// ✅ ContactInfoContent - dla sekcji nagłówkowej strony /kontakt
export interface ContactInfoContent {
  id: number;
  page_slug: string;
  background_color?: string;
  title?: string;
  title_color?: string;
  title_font_size?: string;
  intro_features?: string; // Markdown: ## Heading\nText\n\n## Heading2\nText2
  features_h2_color?: string;
  features_h2_font_size?: string;
  features_p_color?: string;
  features_p_font_size?: string;
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

// ✅ POPRAWKA: Zamiast {} w utility types - uproszczona wersja dla Next.js 16 & React 19
export type Prettify<T> = {
  [K in keyof T]: T[K];
};

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

// ========================================
// TYPY DLA PAYPAL PŁATNOŚCI
// ========================================

// Podstawowe typy dla PayPal donacji
export interface PayPalDonation {
  id: string; // UUID w Directus
  amount: number; // Kwota w centach (np. 1000 = 10.00 EUR)
  currency: string; // 'EUR' dla niemieckiego rynku
  paypal_order_id: string; // ID zamówienia z PayPal
  paypal_payment_id?: string; // ID płatności po capture
  donor_email?: string; // Email darczyńcy (opcjonalny)
  donor_name?: string; // Imię darczyńcy (opcjonalny)
  donor_message?: string; // Wiadomość od darczyńcy
  status: PayPalDonationStatus;
  created_at: string; // ISO date string
  completed_at?: string; // Kiedy płatność została zakończona
  failed_at?: string; // Kiedy płatność nie powiodła się
  webhook_verified: boolean; // Czy webhook został zweryfikowany
  refunded_amount?: number; // Kwota zwrotu (jeśli była)
  fees_amount?: number; // Opłaty PayPal
  net_amount?: number; // Kwota netto po opłatach
}

export type PayPalDonationStatus =
  | "pending" // Zamówienie utworzone, czeka na płatność
  | "processing" // Płatność w trakcie przetwarzania
  | "completed" // Płatność zakończona pomyślnie
  | "failed" // Płatność nie powiodła się
  | "cancelled" // Płatność anulowana przez użytkownika
  | "refunded" // Płatność zwrócona
  | "disputed"; // Płatność zakwestionowana

// Typy dla PayPal API requests/responses
export interface PayPalOrderRequest {
  amount: number; // Kwota w centach
  currency: string; // Domyślnie 'EUR'
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
  return_url?: string; // URL powrotu po płatności
  cancel_url?: string; // URL anulowania
}

export interface PayPalOrderResponse {
  order_id: string;
  status: string;
  approval_url?: string; // Link do płatności dla użytkownika
  donation_id: string; // Nasze ID w Directus
}

export interface PayPalCaptureRequest {
  order_id: string;
  donation_id: string;
}

export interface PayPalCaptureResponse {
  payment_id: string;
  status: string;
  amount: {
    value: string;
    currency_code: string;
  };
  fees?: {
    value: string;
    currency_code: string;
  };
  net_amount?: {
    value: string;
    currency_code: string;
  };
}

// Typy dla PayPal webhooks
export interface PayPalWebhookEvent {
  id: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  event_type: PayPalWebhookEventType;
  summary: string;
  resource: PayPalWebhookResource;
  links: PayPalLink[];
}

export type PayPalWebhookEventType =
  | "CHECKOUT.ORDER.APPROVED" // Zamówienie zatwierdzone
  | "PAYMENT.CAPTURE.COMPLETED" // Płatność captured
  | "PAYMENT.CAPTURE.DENIED" // Płatność odrzucona
  | "PAYMENT.CAPTURE.PENDING" // Płatność pending
  | "PAYMENT.CAPTURE.REFUNDED" // Płatność zwrócona
  | "PAYMENT.CAPTURE.REVERSED" // Płatność cofnięta
  | "CHECKOUT.ORDER.COMPLETED" // Zamówienie zakończone
  | "CHECKOUT.ORDER.CANCELLED" // Zamówienie anulowane
  | "PAYMENT.AUTHORIZATION.CREATED" // Autoryzacja utworzona
  | "PAYMENT.AUTHORIZATION.VOIDED"; // Autoryzacja anulowana

export interface PayPalWebhookResource {
  id: string;
  status: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  seller_protection?: {
    status: string;
    dispute_categories: string[];
  };
  final_capture?: boolean;
  disbursement_mode?: string;
  links: PayPalLink[];
  create_time?: string;
  update_time?: string;
  // Dodatkowe pola w zależności od typu eventu
  [key: string]: unknown;
}

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

// Typy dla webhook verification
export interface PayPalWebhookVerificationRequest {
  auth_algo: string;
  cert_id: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: PayPalWebhookEvent;
}

export interface PayPalWebhookVerificationResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

// Typy dla webhook processing
export interface WebhookProcessingResult {
  success: boolean;
  donation_id?: string;
  action_taken: WebhookAction;
  error_message?: string;
  processed_at: string;
}

export type WebhookAction =
  | "donation_completed"
  | "donation_failed"
  | "donation_refunded"
  | "donation_cancelled"
  | "status_updated"
  | "no_action_needed"
  | "error_processing";

// Typy dla UI komponentów
export interface PayPalDonationFormData {
  amount: number; // W EUR (np. 10.50)
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
}

export interface PayPalDonationFormErrors {
  amount?: string;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
  general?: string;
}

// ✅ POPRAWIONE: PayPalButtonsProps z donorData i onApprove
export interface PayPalButtonsProps {
  amount: number; // W centach
  donorData?: {
    email?: string;
    name?: string;
    message?: string;
  };
  onSuccess?: (donation: PayPalDonation) => void;
  onError?: (error: PayPalError) => void;
  onCancel?: () => void;
  onApprove?: () => boolean; // return false to cancel validation
  disabled?: boolean;
  style?: PayPalButtonStyle;
}

export interface PayPalButtonStyle {
  layout?: "vertical" | "horizontal";
  color?: "gold" | "blue" | "silver" | "white" | "black";
  shape?: "rect" | "pill";
  label?: "paypal" | "checkout" | "buynow" | "pay" | "donate";
  tagline?: boolean;
  height?: number;
}

// Typy dla error handling
export interface PayPalError {
  code: PayPalErrorCode;
  message: string;
  details?: string;
  donation_id?: string;
  original_error?: unknown;
}

export type PayPalErrorCode =
  | "INVALID_AMOUNT"
  | "ORDER_CREATION_FAILED"
  | "PAYMENT_CAPTURE_FAILED"
  | "WEBHOOK_VERIFICATION_FAILED"
  | "DONATION_NOT_FOUND"
  | "PAYPAL_API_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR"
  | "RATE_LIMIT_EXCEEDED";

// Typy dla konfiguracji
export interface PayPalConfig {
  client_id: string;
  client_secret: string;
  mode: "sandbox" | "production";
  webhook_id: string;
  currency: string; // Domyślnie 'EUR'
  min_amount: number; // Minimalna kwota w centach (np. 100 = 1 EUR)
  max_amount: number; // Maksymalna kwota w centach (np. 100000 = 1000 EUR)
  return_url: string;
  cancel_url: string;
}

// Typy dla Directus integration
export interface DirectusPayPalDonation {
  id: string;
  amount: number;
  currency: string;
  paypal_order_id: string;
  paypal_payment_id?: string;
  donor_email?: string;
  donor_name?: string;
  donor_message?: string;
  status: PayPalDonationStatus;
  created_at: string;
  completed_at?: string;
  failed_at?: string;
  webhook_verified: boolean;
  refunded_amount?: number;
  fees_amount?: number;
  net_amount?: number;
  // Pola audytowe
  user_created?: string;
  date_created: string;
  user_updated?: string;
  date_updated: string;
}

// Utility typy
export type AmountInCents = number;
export type AmountInEUR = number;

// Typ dla logów webhook
export interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: PayPalWebhookEventType;
  resource_id: string;
  verification_status: "SUCCESS" | "FAILURE" | "NOT_VERIFIED";
  processing_result: WebhookProcessingResult;
  raw_payload: string; // JSON string
  headers: Record<string, string>;
  received_at: string;
  processed_at?: string;
}

// Typ dla statystyk donacji
export interface DonationStats {
  total_amount: number; // W centach
  total_count: number;
  successful_count: number;
  failed_count: number;
  average_amount: number;
  currency: string;
  period_start: string;
  period_end: string;
}

// Type guard type
export type PayPalTypeGuard<T> = (value: unknown) => value is T;

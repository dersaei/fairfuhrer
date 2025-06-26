// types.ts

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
  Breite: number;
  Lange: number;
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
  section1_left_background_color?: string; // ✅ NOWE
  section1_left_text_color?: string; // ✅ NOWE

  section1_right_title?: string; // ✅ NOWE - oddzielny tytuł
  section1_right_text?: string;
  section1_right_image?: string;
  section1_right_background_color?: string; // ✅ NOWE
  section1_right_text_color?: string; // ✅ NOWE
  section1_right_title_color?: string; // ✅ NOWE - kolor dla tytułu

  // SEKCJA 2 - Tekst na tle obrazu + KOLORY
  section2_title?: string;
  section2_text?: string;
  section2_background_image?: string;
  section2_overlay_color?: string; // ✅ NOWE - kolor overlay na obrazie
  section2_overlay_opacity?: number; // ✅ NOWE - przezroczystość overlay (0-1)
  section2_text_color?: string; // ✅ NOWE

  // SEKCJA 3 - Tekst + YouTube video + KOLORY
  section3_left_title?: string;
  section3_left_text?: string;
  section3_youtube_url?: string;
  section3_background_color?: string; // ✅ NOWE
  section3_text_color?: string; // ✅ NOWE
  section3_title_color?: string; // ✅ NOWE - oddzielny kolor dla tytułu

  // SEKCJA 4 - Formularz kontaktowy + KOLORY
  section4_title?: string;
  section4_subtitle?: string;
  section4_background_color?: string; // ✅ NOWE
  section4_text_color?: string; // ✅ NOWE

  // SEKCJA 5 - Końcowa sekcja + KOLORY
  section5_title?: string;
  section5_text?: string;
  section5_image?: string;
  section5_background_color?: string; // ✅ NOWE
  section5_text_color?: string; // ✅ NOWE
  section5_title_color?: string; // ✅ NOWE - oddzielny kolor dla tytułu
}

export interface ImpressumContent {
  id: number;
  page_slug: string; // dla identyfikacji strony (np. "impressum")
  title: string; // Tytuł strony
  address: string; // Adres firmy
  email: string; // Adres email
  business_info_top: string; // Tekst na górze (Geschäftsführung: Frank Gebhard)
  business_info_bottom: string; // Tekst na dole (UID: DE270557749)
  legal_content: string; // Tekst WYSIWYG z treścią prawną (HTML)
}

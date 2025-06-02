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

// ✅ NOWY - PartnerPageContent - dla strony "Partner werden"
export interface PartnerPageContent {
  id: number;
  page_slug: string;

  // SEKCJA 1 - Grid dwukolumnowy
  section1_left_title?: string;
  section1_left_text?: string;
  section1_left_image?: string;
  section1_right_text?: string;
  section1_right_image?: string;

  // SEKCJA 2 - Tekst na tle obrazu
  section2_title?: string;
  section2_text?: string;
  section2_background_image?: string;

  // SEKCJA 3 - Tekst + YouTube video
  section3_left_title?: string;
  section3_left_text?: string;
  section3_youtube_url?: string;

  // SEKCJA 4 - Formularz kontaktowy
  section4_title?: string;
  section4_subtitle?: string;

  // SEKCJA 5 - Końcowa sekcja
  section5_title?: string;
  section5_text?: string;
}

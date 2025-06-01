// types.ts
export interface Category {
  id: number;
  name: string;
  color: string;
  description?: string; // DODANE - opis kategorii
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Kategorie = Category;

// ZAKTUALIZOWANE - polskie nazwy (jak używasz w mapowaniu)
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
  // USUNIĘTE: karteEinbetten - powoduje błąd 403
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Orte = Place;

// DODANE - Contact message interface
export interface ContactMessage {
  id: string; // UUID w Directus
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string; // ISO date string
  status?: "new" | "read" | "replied" | "archived"; // opcjonalne pole statusu
}

// ROZSZERZONE - Page content interface
export interface PageContent {
  id: number;
  page_slug: string;
  title: string;
  intro_text: string;
  // POLA dla sekcji kategorii:
  categories_section_title?: string;
  categories_section_subtitle?: string;
  // 7 KWADRATÓW:
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

// NOWY - dodaj to:
export interface ContactMessage {
  id: string; // UUID w Directus
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string; // ISO date string
  status?: "new" | "read" | "replied" | "archived"; // opcjonalne pole statusu
}

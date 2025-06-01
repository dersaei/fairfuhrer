// types.ts
export interface Category {
  id: number;
  name: string;
  color: string;
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

// NOWE - Page content interface
export interface PageContent {
  id: number;
  page_slug: string;
  title: string;
  intro_text: string;
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

// types.ts
export interface Category {
  id: number;
  name: string;
  color: string;
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Kategorie = Category;

export interface Place {
  id: number;
  // ZAKTUALIZOWANE - niemieckie nazwy pól jak w Directus:
  Name: string; // było: nazwa
  Adresse: string; // było: adres
  Vollbeschreibung?: string; // OK
  Breite: number; // było: latitude
  Lange: number; // było: longitude
  Kategorie: Category[]; // było: categories
  // Pola dla mediów i dodatkowych informacji
  Hauptbild?: string; // OK
  Audio_Datei?: string; // było: audioDatei
  Link_URL?: string; // było: linkUrl
  Link_Text?: string; // było: linkText
  Galerie_Bilder?: string[]; // było: galerieBilder
}

// Alias dla niemieckiej nazwy kolekcji w Directus
export type Orte = Place;

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

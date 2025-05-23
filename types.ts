// types.ts
export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Place {
  id: number;
  nazwa: string; // Name - nazwa miejsca (pod audio)
  adres: string; // Adresse - adres
  vollbeschreibung?: string; // Vollbeschreibung - pełny opis (WYSIWYG)
  latitude: number;
  longitude: number;
  categories: Category[];
  // Pola dla mediów i dodatkowych informacji
  hauptbild?: string; // nazwa głównego zdjęcia
  audioDatei?: string; // nazwa pliku audio
  linkUrl?: string; // URL do linku
  linkText?: string; // tekst wyświetlany na przycisku
  galerieBilder?: string[]; // tablica nazw zdjęć w galerii
  karteEinbetten?: string; // kod iframe mapy z Directus
}

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

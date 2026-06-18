import type { Place } from "./map";

export interface PartnerPageContent {
  id: number;
  section1_title?: string;
  section1_text?: string;
  section1_background_color?: string;
  section1_text_color?: string;
  section1_title_color?: string;
  section2_left_title?: string;
  section2_left_text?: string;
  section2_mux_playback_id?: string;
  section2_background_color?: string;
  section2_text_color?: string;
  section2_title_color?: string;
  section3_background_color?: string;
  section4_background_color?: string;
  section5_title?: string;
  section5_text?: string;
  section5_background_color?: string;
  section5_text_color?: string;
  section5_title_color?: string;
  abschnitt_3_titel?: string;
  abschnitt_3_text?: string;
  abschnitt_3_titel_farbe?: string;
  abschnitt_3_text_farbe?: string;
  abschnitt_3_hintergrundfarbe_links?: string;
  abschnitt_3_hintergrundfarbe_rechts?: string;
  abschnitt_4_text_links?: string;
  abschnitt_4_text_rechts?: string;
  abschnitt_4_hintergrundfarbe?: string;
  abschnitt_5_titel?: string;
  abschnitt_5_text?: string;
  abschnitt_5_titel_farbe?: string;
  abschnitt_5_text_farbe?: string;
  abschnitt_5_hintergrundfarbe?: string;
  abschnitt_5_1?: string;
  abschnitt_5_2?: string;
  abschnitt_5_3?: string;
  abschnitt_5_4?: string;
  bild_1?: string;
  bild_2?: string;
  button_parner_werden?: string;
  color_button_partner_werden?: string;
  url_button_partner_werden?: string;
}

export interface FeaturedPin {
  id: number;
  ort: Place;
  sort: number;
  status: "published" | "draft" | "archived";
}

export interface HomePageContent {
  id: number;
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
  hero_image?: string;
  hero_background_color?: string;
  badges_label?: string;
  badges_label_font_size?: string;
  badges_label_color?: string;
  section2_background_color?: string;
  section2_title?: string;
  section2_title_font_size?: string;
  section2_title_color?: string;
  section2_title_mobile_font_size?: string;
  category_name_font_size?: string;
  category_name_color?: string;
  category_name_mobile_font_size?: string;
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
  traveler_title?: string;
  traveler_content?: string;
  traveler_cta_label?: string;
  traveler_cta_url?: string;
  traveler_image?: string;
  partner_title?: string;
  partner_content?: string;
  partner_cta_label?: string;
  partner_cta_url?: string;
  partner_image?: string;
}

export interface ImpressumContent {
  id: number;
  page_slug: string;
  title: string;
  address: string;
  email: string;
  business_info_top: string;
  business_info_bottom: string;
  legal_content: string;
  webseitenerstellung?: string;
}

export interface DatenschutzContent {
  id: number;
  page_slug: string;
  title: string;
  content: string;
}

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

export interface ContactFormContent {
  id: number;
  page_slug: string;
  background_color?: string;
  title?: string;
  title_font_size?: string;
  title_color?: string;
  email?: string;
  email_description?: string;
  email_description_font_size?: string;
  email_description_color?: string;
  telefon?: string;
  adresse?: string;
  contact_fields_font_size?: string;
  contact_fields_color?: string;
}

export interface ContactInfoContent {
  id: number;
  page_slug: string;
  background_color?: string;
  title?: string;
  title_color?: string;
  title_font_size?: string;
  intro_features?: string;
  features_h2_color?: string;
  features_h2_font_size?: string;
  features_p_color?: string;
  features_p_font_size?: string;
}

export interface PremiumPageContent {
  id: number;
  title?: string;
  lead_text?: string;
  pro_active_title?: string;
  pro_active_date_label?: string;
  pro_active_hint?: string;
  comparison_title?: string;
  comparison_th_feature?: string;
  comparison_th_free?: string;
  comparison_th_pro?: string;
  app_box_title?: string;
  app_box_text?: string;
  app_box_steps?: { step: string }[];
  app_box_note?: string;
}

export interface PremiumComparisonFeature {
  id: number;
  status: "published" | "draft" | "archived";
  sort: number | null;
  feature: string;
  free: boolean;
  pro: boolean;
}

export interface RegisterPageContent {
  id: number;
  title?: string;
  subtitle?: string;
  reisender_title?: string;
  reisender_desc?: string;
  reisender_cta?: string;
  partner_title?: string;
  partner_desc?: string;
  partner_cta?: string;
  login_prompt?: string;
  login_link_text?: string;
}

export interface OrtVorschlagenContent {
  id: number;
  intro?: string;
  premium_info?: string;
  premium_badge?: string;
  label_name?: string;
  label_adresse?: string;
  label_beschreibung?: string;
  button_text?: string;
  button_sending_text?: string;
  hint_intro?: string;
  hint_with_name?: string;
  hint_without_name?: string;
  success_message?: string;
  error_message?: string;
  validation_message?: string;
}

export interface AccountContactFormContent {
  id: number;
  title?: string;
  lead_text?: string;
  label_absender?: string;
  label_betreff?: string;
  label_nachricht?: string;
  button_text?: string;
  button_sending_text?: string;
  success_message?: string;
  error_message?: string;
  validation_message?: string;
}

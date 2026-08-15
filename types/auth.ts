export type UserRole = "consumer" | "partner";

export type CompanySize = "nonprofit" | "micro" | "small" | "medium";

export type { TaxBucket, TaxGroup, TaxIdFieldKey } from "@/lib/countries";

export interface Profile {
  id: string;
  role: UserRole;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  premium_until: string | null;
  company_size: CompanySize | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerProfile {
  id: string;
  company_name: string | null;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  website_url: string | null;
  phone_number: string | null;
  business_email: string | null;
  contact_person_name: string | null;
  tax_id: string | null;
  vat_eu: string | null;
  phone_number_2: string | null;
  country_of_registration: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  gallery_paths: string[] | null;
  // VAT / tax fields (new)
  tax_group: import("@/lib/countries").TaxGroup | null;
  tax_bucket: import("@/lib/countries").TaxBucket | null;
  tax_id_field_key: import("@/lib/countries").TaxIdFieldKey | null;
  tax_id_value: string | null;
  no_eu_vat: boolean;
  cross_border_b2c: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  profile: Profile | null;
  partnerProfile?: PartnerProfile | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterConsumerFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface RegisterPartnerFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  countryOfRegistration: string;
  phone: string;
  businessEmail: string;
  taxId: string;
  websiteUrl: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
  general?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export type OAuthProvider = "google" | "apple" | "facebook" | "twitter" | "spotify";

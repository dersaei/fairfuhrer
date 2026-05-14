export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status?: "new" | "read" | "replied" | "archived";
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface FormValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export interface PartnerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  billingAddress: string;
  vatNumber: string;
  placeName: string;
  address: string;
  kategorie: string;
  websiteUrl: string;
  message: string;
  certificate: string;
  sustainabilityGoals: number[];
  certificationStatus: "A" | "B" | "C" | "";
  companySize: "micro" | "small" | "medium" | "ngo" | "";
}

export interface PartnerFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  vatNumber?: string;
  placeName?: string;
  address?: string;
  kategorie?: string;
  websiteUrl?: string;
  message?: string;
  certificate?: string;
  sustainabilityGoals?: string;
  certificationStatus?: string;
  companySize?: string;
  general?: string;
}

export interface PartnerSubmissionData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  billing_address?: string;
  vat_number?: string;
  place_name: string;
  address: string;
  kategorie?: string;
  website_url?: string;
  message?: string;
  certificate?: string;
  sustainability_goals?: number[];
  certification_status?: "A" | "B" | "C";
  company_size?: "micro" | "small" | "medium" | "ngo";
  status: "new" | "review" | "approved" | "rejected";
  created_at: string;
}

export interface PartnerApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  billing_address?: string;
  vat_number?: string;
  place_name: string;
  address: string;
  kategorie?: string;
  website_url?: string;
  message?: string;
  certificate?: string;
  sustainability_goals?: number[];
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

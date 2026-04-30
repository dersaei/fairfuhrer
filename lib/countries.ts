export type TaxGroup = "DE" | "EU" | "EEA_NON_EU" | "SPECIAL" | "THIRD";

export type TaxBucket =
  | "de"
  | "eu_reverse_charge"
  | "eu_no_vat"
  | "third_country";

export type TaxIdFieldKey =
  | "steuernummer"
  | "eu_vat_id"
  | "uid_number"
  | "foreign_tax_id";

export interface Country {
  code: string;
  label: string;
  taxGroup: TaxGroup;
  taxIdFieldKey: TaxIdFieldKey;
  taxIdLabel: string;
  taxIdPlaceholder: string;
  taxIdRequired: boolean;
  hasEuVatOption: boolean;
}

export const COUNTRIES: Country[] = [
  // ── Deutschland ────────────────────────────────────────────────────────────
  {
    code: "DE",
    label: "Deutschland",
    taxGroup: "DE",
    taxIdFieldKey: "steuernummer",
    taxIdLabel: "Steuernummer",
    taxIdPlaceholder: "z.B. 12/345/67890",
    taxIdRequired: true,
    hasEuVatOption: false,
  },

  // ── EU (ohne DE) — alphabetisch ────────────────────────────────────────────
  {
    code: "AT",
    label: "Österreich",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. ATU12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "BE",
    label: "Belgien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. BE0123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "BG",
    label: "Bulgarien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. BG123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "CY",
    label: "Zypern",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. CY12345678X",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "CZ",
    label: "Tschechien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. CZ12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "DK",
    label: "Dänemark",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. DK12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "EE",
    label: "Estland",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. EE123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "EL",
    label: "Griechenland",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. EL123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "ES",
    label: "Spanien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. ESX12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "FI",
    label: "Finnland",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. FI12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "FR",
    label: "Frankreich",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. FRXX123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "HR",
    label: "Kroatien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. HR12345678901",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "HU",
    label: "Ungarn",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. HU12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "IE",
    label: "Irland",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. IE1234567X",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "IT",
    label: "Italien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. IT12345678901",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "LT",
    label: "Litauen",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. LT123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "LU",
    label: "Luxemburg",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. LU12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "LV",
    label: "Lettland",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. LV12345678901",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "MT",
    label: "Malta",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. MT12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "NL",
    label: "Niederlande",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. NL123456789B01",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "PL",
    label: "Polen",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. PL1234567890",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "PT",
    label: "Portugal",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. PT123456789",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "RO",
    label: "Rumänien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. RO12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "SE",
    label: "Schweden",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. SE123456789001",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "SI",
    label: "Slowenien",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. SI12345678",
    taxIdRequired: false,
    hasEuVatOption: true,
  },
  {
    code: "SK",
    label: "Slowakei",
    taxGroup: "EU",
    taxIdFieldKey: "eu_vat_id",
    taxIdLabel: "EU-USt-IdNr.",
    taxIdPlaceholder: "z.B. SK1234567890",
    taxIdRequired: false,
    hasEuVatOption: true,
  },

  // ── EEA / nicht-EU ─────────────────────────────────────────────────────────
  {
    code: "IS",
    label: "Island",
    taxGroup: "EEA_NON_EU",
    taxIdFieldKey: "foreign_tax_id",
    taxIdLabel: "VSK-Nummer",
    taxIdPlaceholder: "z.B. 12345",
    taxIdRequired: false,
    hasEuVatOption: false,
  },
  {
    code: "LI",
    label: "Liechtenstein",
    taxGroup: "EEA_NON_EU",
    taxIdFieldKey: "uid_number",
    taxIdLabel: "UID (Liechtenstein)",
    taxIdPlaceholder: "z.B. FL-0001.234.567-8",
    taxIdRequired: false,
    hasEuVatOption: false,
  },
  {
    code: "NO",
    label: "Norwegen",
    taxGroup: "EEA_NON_EU",
    taxIdFieldKey: "foreign_tax_id",
    taxIdLabel: "Org.nr.",
    taxIdPlaceholder: "z.B. 123 456 789",
    taxIdRequired: false,
    hasEuVatOption: false,
  },

  // ── Sonderfall Schweiz ─────────────────────────────────────────────────────
  {
    code: "CH",
    label: "Schweiz",
    taxGroup: "SPECIAL",
    taxIdFieldKey: "uid_number",
    taxIdLabel: "Schweizer UID",
    taxIdPlaceholder: "z.B. CHE-123.456.789",
    taxIdRequired: false,
    hasEuVatOption: false,
  },

  // ── Drittländer ────────────────────────────────────────────────────────────
  {
    code: "GB",
    label: "Großbritannien",
    taxGroup: "THIRD",
    taxIdFieldKey: "foreign_tax_id",
    taxIdLabel: "Business Tax ID (UK)",
    taxIdPlaceholder: "z.B. GB123456789",
    taxIdRequired: false,
    hasEuVatOption: false,
  },
  {
    code: "US",
    label: "USA",
    taxGroup: "THIRD",
    taxIdFieldKey: "foreign_tax_id",
    taxIdLabel: "EIN / Business Tax ID",
    taxIdPlaceholder: "z.B. 12-3456789",
    taxIdRequired: false,
    hasEuVatOption: false,
  },
  {
    code: "OTHER",
    label: "Sonstiges Land",
    taxGroup: "THIRD",
    taxIdFieldKey: "foreign_tax_id",
    taxIdLabel: "Business Tax ID",
    taxIdPlaceholder: "",
    taxIdRequired: false,
    hasEuVatOption: false,
  },
];

export function getCountry(code: string | null | undefined): Country | undefined {
  if (!code) return undefined;
  return COUNTRIES.find((c) => c.code === code);
}

export function getCountryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}

export function getTaxBucket(
  countryCode: string | null | undefined,
  hasEuVatId: boolean
): TaxBucket {
  const country = getCountry(countryCode);
  if (!country) return "third_country";
  switch (country.taxGroup) {
    case "DE":
      return "de";
    case "EU":
      return hasEuVatId ? "eu_reverse_charge" : "eu_no_vat";
    case "EEA_NON_EU":
    case "SPECIAL":
    case "THIRD":
      return "third_country";
  }
}

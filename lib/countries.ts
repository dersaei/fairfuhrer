export const COUNTRIES: { code: string; label: string }[] = [
  { code: "DE", label: "Deutschland" },
  { code: "AT", label: "Österreich" },
  { code: "CH", label: "Schweiz" },
  { code: "LI", label: "Liechtenstein" },
  { code: "LU", label: "Luxemburg" },
  { code: "BE", label: "Belgien" },
  { code: "NL", label: "Niederlande" },
  { code: "FR", label: "Frankreich" },
  { code: "IT", label: "Italien" },
  { code: "ES", label: "Spanien" },
  { code: "PL", label: "Polen" },
  { code: "CZ", label: "Tschechien" },
  { code: "OTHER", label: "Sonstiges" },
];

export function getCountryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  return COUNTRIES.find((c) => c.code === code)?.label ?? code;
}

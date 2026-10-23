export type Country = {
  code: string;
  name: string;
  currency: string;
  dial: string;
  flag: string;
};

export const countries: Country[] = [
  { code: "GB", name: "United Kingdom", currency: "GBP", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "United States", currency: "USD", dial: "+1", flag: "🇺🇸" },
  { code: "NG", name: "Nigeria", currency: "NGN", dial: "+234", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", currency: "GHS", dial: "+233", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", currency: "KES", dial: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", currency: "ZAR", dial: "+27", flag: "🇿🇦" },
  { code: "CA", name: "Canada", currency: "CAD", dial: "+1", flag: "🇨🇦" },
  { code: "IE", name: "Ireland", currency: "EUR", dial: "+353", flag: "🇮🇪" },
  { code: "DE", name: "Germany", currency: "EUR", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", currency: "EUR", dial: "+33", flag: "🇫🇷" },
  { code: "ES", name: "Spain", currency: "EUR", dial: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", currency: "EUR", dial: "+39", flag: "🇮🇹" },
  { code: "NL", name: "Netherlands", currency: "EUR", dial: "+31", flag: "🇳🇱" },
  { code: "PT", name: "Portugal", currency: "EUR", dial: "+351", flag: "🇵🇹" },
  { code: "AU", name: "Australia", currency: "AUD", dial: "+61", flag: "🇦🇺" },
  { code: "BR", name: "Brazil", currency: "BRL", dial: "+55", flag: "🇧🇷" },
  { code: "IN", name: "India", currency: "INR", dial: "+91", flag: "🇮🇳" },
  { code: "JP", name: "Japan", currency: "JPY", dial: "+81", flag: "🇯🇵" },
  { code: "MX", name: "Mexico", currency: "MXN", dial: "+52", flag: "🇲🇽" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", dial: "+971", flag: "🇦🇪" },
];

export function getCountry(code: string): Country {
  return countries.find((country) => country.code === code) ?? countries[0];
}

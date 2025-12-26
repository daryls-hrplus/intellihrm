// Country to language mapping for auto-selection
// Maps country names to their primary and secondary languages

export interface CountryLanguages {
  first: string;
  second?: string;
}

// Mapping based on official/primary languages
const countryLanguageMap: Record<string, CountryLanguages> = {
  // English-speaking countries
  "United States": { first: "en" },
  "United Kingdom": { first: "en" },
  "Canada": { first: "en", second: "fr" },
  "Australia": { first: "en" },
  "New Zealand": { first: "en" },
  "Ireland": { first: "en" },
  "South Africa": { first: "en" },
  "Singapore": { first: "en", second: "zh" },
  "India": { first: "en" },
  "Nigeria": { first: "en" },
  "Ghana": { first: "en" },
  "Kenya": { first: "en" },
  "Jamaica": { first: "en" },
  "Trinidad and Tobago": { first: "en" },
  "Barbados": { first: "en" },
  "Bahamas": { first: "en" },
  "Guyana": { first: "en" },
  "Belize": { first: "en", second: "es" },
  
  // Spanish-speaking countries
  "Spain": { first: "es" },
  "Mexico": { first: "es" },
  "Colombia": { first: "es" },
  "Argentina": { first: "es" },
  "Peru": { first: "es" },
  "Chile": { first: "es" },
  "Venezuela": { first: "es" },
  "Ecuador": { first: "es" },
  "Guatemala": { first: "es" },
  "Cuba": { first: "es" },
  "Bolivia": { first: "es" },
  "Dominican Republic": { first: "es" },
  "Honduras": { first: "es" },
  "Paraguay": { first: "es" },
  "El Salvador": { first: "es" },
  "Nicaragua": { first: "es" },
  "Costa Rica": { first: "es" },
  "Panama": { first: "es" },
  "Puerto Rico": { first: "es", second: "en" },
  "Uruguay": { first: "es" },
  
  // French-speaking countries
  "France": { first: "fr" },
  "Belgium": { first: "fr", second: "nl" },
  "Switzerland": { first: "fr", second: "de" },
  "Monaco": { first: "fr" },
  "Luxembourg": { first: "fr", second: "de" },
  "Senegal": { first: "fr" },
  "Côte d'Ivoire": { first: "fr" },
  "Cameroon": { first: "fr", second: "en" },
  "Haiti": { first: "fr" },
  "Martinique": { first: "fr" },
  "Guadeloupe": { first: "fr" },
  "French Guiana": { first: "fr" },
  
  // Portuguese-speaking countries
  "Brazil": { first: "pt" },
  "Portugal": { first: "pt" },
  "Mozambique": { first: "pt" },
  "Angola": { first: "pt" },
  "Cape Verde": { first: "pt" },
  
  // German-speaking countries
  "Germany": { first: "de" },
  "Austria": { first: "de" },
  "Liechtenstein": { first: "de" },
  
  // Dutch-speaking countries
  "Netherlands": { first: "nl" },
  "Suriname": { first: "nl" },
  "Aruba": { first: "nl", second: "es" },
  "Curaçao": { first: "nl" },
  "Sint Maarten": { first: "nl", second: "en" },
  
  // Russian-speaking countries
  "Russia": { first: "ru" },
  "Belarus": { first: "ru" },
  "Kazakhstan": { first: "ru" },
  "Kyrgyzstan": { first: "ru" },
  
  // Mandarin-speaking countries/regions
  "China": { first: "zh" },
  "Taiwan": { first: "zh" },
  "Hong Kong": { first: "zh", second: "en" },
  "Macau": { first: "zh", second: "pt" },
  
  // Arabic-speaking countries
  "Saudi Arabia": { first: "ar" },
  "United Arab Emirates": { first: "ar", second: "en" },
  "Egypt": { first: "ar" },
  "Morocco": { first: "ar", second: "fr" },
  "Algeria": { first: "ar", second: "fr" },
  "Tunisia": { first: "ar", second: "fr" },
  "Qatar": { first: "ar", second: "en" },
  "Kuwait": { first: "ar" },
  "Bahrain": { first: "ar", second: "en" },
  "Oman": { first: "ar" },
  "Jordan": { first: "ar" },
  "Lebanon": { first: "ar", second: "fr" },
  "Iraq": { first: "ar" },
  "Syria": { first: "ar" },
  "Libya": { first: "ar" },
  "Yemen": { first: "ar" },
  "Sudan": { first: "ar" },
};

/**
 * Get suggested languages for a country
 * Returns the primary and optional secondary language codes
 */
export function getLanguagesForCountry(countryName: string): CountryLanguages {
  // Check exact match first
  if (countryLanguageMap[countryName]) {
    return countryLanguageMap[countryName];
  }
  
  // Try case-insensitive match
  const normalizedCountry = countryName.toLowerCase();
  const match = Object.entries(countryLanguageMap).find(
    ([key]) => key.toLowerCase() === normalizedCountry
  );
  
  if (match) {
    return match[1];
  }
  
  // Default to English
  return { first: "en" };
}

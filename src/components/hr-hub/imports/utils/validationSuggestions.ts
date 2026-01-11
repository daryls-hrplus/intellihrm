import { countries, getCountryName } from "@/lib/countries";
import { supabase } from "@/integrations/supabase/client";

// Cache for reference data to avoid repeated DB calls
let currenciesCache: { code: string; name: string }[] | null = null;
let lookupValuesCache: Map<string, string[]> | null = null;

/**
 * Fuzzy string matching using Levenshtein distance
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[bLower.length][aLower.length];
}

/**
 * Find the closest match from a list of valid values
 */
function findClosestMatch(
  value: string,
  validValues: { code: string; name: string }[],
  maxDistance: number = 3
): { code: string; name: string } | null {
  const valueLower = value.toLowerCase().trim();
  
  // First, check for exact match on code
  const exactCodeMatch = validValues.find(v => v.code.toLowerCase() === valueLower);
  if (exactCodeMatch) return exactCodeMatch;

  // Check for exact match on name
  const exactNameMatch = validValues.find(v => v.name.toLowerCase() === valueLower);
  if (exactNameMatch) return exactNameMatch;

  // Check if value starts with or contains the code
  const startsWithMatch = validValues.find(v => 
    valueLower.startsWith(v.code.toLowerCase()) || 
    v.name.toLowerCase().startsWith(valueLower)
  );
  if (startsWithMatch) return startsWithMatch;

  // Check for partial name match
  const containsMatch = validValues.find(v => 
    v.name.toLowerCase().includes(valueLower) || 
    valueLower.includes(v.name.toLowerCase())
  );
  if (containsMatch) return containsMatch;

  // Use Levenshtein distance for fuzzy matching
  let bestMatch: { code: string; name: string } | null = null;
  let bestDistance = Infinity;

  for (const valid of validValues) {
    const distanceCode = levenshteinDistance(valueLower, valid.code.toLowerCase());
    const distanceName = levenshteinDistance(valueLower, valid.name.toLowerCase());
    const minDistance = Math.min(distanceCode, distanceName);

    if (minDistance < bestDistance && minDistance <= maxDistance) {
      bestDistance = minDistance;
      bestMatch = valid;
    }
  }

  return bestMatch;
}

/**
 * Load currencies from database (cached)
 */
export async function loadCurrencies(): Promise<{ code: string; name: string }[]> {
  if (currenciesCache) return currenciesCache;

  const { data } = await supabase
    .from("currencies")
    .select("code, name")
    .eq("is_active", true);

  currenciesCache = data?.map(c => ({ code: c.code, name: c.name })) || [];
  return currenciesCache;
}

/**
 * Load lookup values by category from database (cached)
 */
export async function loadLookupValues(): Promise<Map<string, string[]>> {
  if (lookupValuesCache) return lookupValuesCache;

  const { data } = await supabase
    .from("lookup_values")
    .select("category, code")
    .eq("is_active", true);

  lookupValuesCache = new Map();
  data?.forEach(item => {
    const existing = lookupValuesCache!.get(item.category) || [];
    existing.push(item.code);
    lookupValuesCache!.set(item.category, existing);
  });

  return lookupValuesCache;
}

/**
 * Clear the cache (useful for testing or when data changes)
 */
export function clearValidationCache(): void {
  currenciesCache = null;
  lookupValuesCache = null;
}

/**
 * Validate and suggest country code
 */
export function validateCountry(value: string): {
  isValid: boolean;
  suggestion?: string;
  message?: string;
} {
  const valueTrimmed = value.trim();
  if (!valueTrimmed) return { isValid: true }; // Empty is handled by required check

  // Check if it's a valid ISO code
  const exactMatch = countries.find(c => c.code.toUpperCase() === valueTrimmed.toUpperCase());
  if (exactMatch) return { isValid: true };

  // Check if user entered a country name instead of code
  const nameMatch = countries.find(c => c.name.toLowerCase() === valueTrimmed.toLowerCase());
  if (nameMatch) {
    return {
      isValid: false,
      suggestion: `Use ISO code '${nameMatch.code}' for ${nameMatch.name}`,
      message: `Invalid country code '${valueTrimmed}'. Did you mean '${nameMatch.code}' (${nameMatch.name})?`,
    };
  }

  // Fuzzy match
  const countryData = countries.map(c => ({ code: c.code, name: c.name }));
  const closest = findClosestMatch(valueTrimmed, countryData);
  
  if (closest) {
    return {
      isValid: false,
      suggestion: `Use '${closest.code}' for ${closest.name}`,
      message: `Invalid country code '${valueTrimmed}'. Did you mean '${closest.code}' (${closest.name})?`,
    };
  }

  return {
    isValid: false,
    message: `Invalid country code '${valueTrimmed}'. Use ISO 3166-1 alpha-2 codes (e.g., US, GB, TT)`,
    suggestion: "View the Reference Data Catalog for valid country codes",
  };
}

/**
 * Validate and suggest currency code
 */
export async function validateCurrency(value: string): Promise<{
  isValid: boolean;
  suggestion?: string;
  message?: string;
}> {
  const valueTrimmed = value.trim();
  if (!valueTrimmed) return { isValid: true };

  const currencies = await loadCurrencies();

  // Check if it's a valid ISO code
  const exactMatch = currencies.find(c => c.code.toUpperCase() === valueTrimmed.toUpperCase());
  if (exactMatch) return { isValid: true };

  // Common currency name mappings
  const commonNames: Record<string, string> = {
    "dollar": "USD",
    "dollars": "USD",
    "us dollar": "USD",
    "us dollars": "USD",
    "euro": "EUR",
    "euros": "EUR",
    "pound": "GBP",
    "pounds": "GBP",
    "sterling": "GBP",
    "tt dollar": "TTD",
    "tt dollars": "TTD",
    "trinidad dollar": "TTD",
    "jmd": "JMD",
    "jamaican dollar": "JMD",
    "bbd": "BBD",
    "barbados dollar": "BBD",
    "xcd": "XCD",
    "ec dollar": "XCD",
    "eastern caribbean dollar": "XCD",
  };

  const lowerValue = valueTrimmed.toLowerCase();
  const mappedCode = commonNames[lowerValue];
  if (mappedCode) {
    const currency = currencies.find(c => c.code === mappedCode);
    if (currency) {
      return {
        isValid: false,
        suggestion: `Use ISO code '${currency.code}'`,
        message: `Invalid currency. Use ISO code '${currency.code}' instead of '${valueTrimmed}'`,
      };
    }
  }

  // Fuzzy match
  const closest = findClosestMatch(valueTrimmed, currencies);
  if (closest) {
    return {
      isValid: false,
      suggestion: `Use '${closest.code}' for ${closest.name}`,
      message: `Invalid currency '${valueTrimmed}'. Did you mean '${closest.code}' (${closest.name})?`,
    };
  }

  return {
    isValid: false,
    message: `Invalid currency code '${valueTrimmed}'. Use ISO 4217 codes (e.g., USD, EUR, TTD)`,
    suggestion: "View the Reference Data Catalog for valid currency codes",
  };
}

/**
 * Validate and suggest lookup value
 */
export async function validateLookupValue(
  value: string,
  category: string
): Promise<{
  isValid: boolean;
  suggestion?: string;
  message?: string;
}> {
  const valueTrimmed = value.trim();
  if (!valueTrimmed) return { isValid: true };

  const lookupValues = await loadLookupValues();
  const validValues = lookupValues.get(category) || [];

  // Check case-insensitive match
  const exactMatch = validValues.find(v => v.toLowerCase() === valueTrimmed.toLowerCase());
  if (exactMatch) {
    if (exactMatch !== valueTrimmed) {
      return {
        isValid: true,
        suggestion: `Note: exact value is '${exactMatch}'`,
      };
    }
    return { isValid: true };
  }

  // Find closest match
  const valuesWithNames = validValues.map(v => ({ code: v, name: v }));
  const closest = findClosestMatch(valueTrimmed, valuesWithNames, 2);

  if (closest) {
    return {
      isValid: false,
      suggestion: `Use '${closest.code}'`,
      message: `Invalid ${category} value '${valueTrimmed}'. Did you mean '${closest.code}'?`,
    };
  }

  const examples = validValues.slice(0, 3).join(", ");
  return {
    isValid: false,
    message: `Invalid ${category} value '${valueTrimmed}'`,
    suggestion: `Valid options include: ${examples}${validValues.length > 3 ? "..." : ""}`,
  };
}

/**
 * Common gender value mappings
 */
export function normalizeGender(value: string): {
  normalized: string | null;
  suggestion?: string;
} {
  const valueLower = value.toLowerCase().trim();
  
  const mappings: Record<string, string> = {
    "m": "male",
    "f": "female",
    "male": "male",
    "female": "female",
    "man": "male",
    "woman": "female",
    "other": "other",
    "non-binary": "other",
    "nonbinary": "other",
    "prefer not to say": "other",
    "undisclosed": "other",
  };

  const normalized = mappings[valueLower];
  if (normalized) {
    if (normalized !== valueLower) {
      return {
        normalized,
        suggestion: `Use '${normalized}' instead of '${value}'`,
      };
    }
    return { normalized };
  }

  return {
    normalized: null,
    suggestion: "Valid values: male, female, other",
  };
}

/**
 * Common marital status mappings
 */
export function normalizeMaritalStatus(value: string): {
  normalized: string | null;
  suggestion?: string;
} {
  const valueLower = value.toLowerCase().trim();
  
  const mappings: Record<string, string> = {
    "single": "single",
    "married": "married",
    "divorced": "divorced",
    "widowed": "widowed",
    "separated": "separated",
    "domestic partnership": "domestic_partnership",
    "domestic_partnership": "domestic_partnership",
    "common law": "common_law",
    "common_law": "common_law",
    "s": "single",
    "m": "married",
    "d": "divorced",
    "w": "widowed",
  };

  const normalized = mappings[valueLower];
  if (normalized) {
    if (normalized !== valueLower) {
      return {
        normalized,
        suggestion: `Use '${normalized}' instead of '${value}'`,
      };
    }
    return { normalized };
  }

  return {
    normalized: null,
    suggestion: "Valid values: single, married, divorced, widowed, separated, domestic_partnership, common_law",
  };
}

export type FieldValidationType = 
  | "country" 
  | "currency" 
  | "gender" 
  | "marital_status" 
  | "lookup";

export interface EnhancedValidationResult {
  isValid: boolean;
  message?: string;
  suggestion?: string;
  autoCorrect?: string;
}

/**
 * Enhanced field validation with smart suggestions
 */
export async function validateFieldWithSuggestions(
  fieldName: string,
  value: string,
  fieldType?: FieldValidationType,
  lookupCategory?: string
): Promise<EnhancedValidationResult> {
  if (!value.trim()) return { isValid: true };

  // Determine field type from field name if not provided
  const inferredType = fieldType || inferFieldType(fieldName);

  switch (inferredType) {
    case "country":
      return validateCountry(value);

    case "currency":
      return await validateCurrency(value);

    case "gender": {
      const genderResult = normalizeGender(value);
      if (genderResult.normalized) {
        return {
          isValid: true,
          autoCorrect: genderResult.normalized !== value.toLowerCase().trim() 
            ? genderResult.normalized 
            : undefined,
          suggestion: genderResult.suggestion,
        };
      }
      return {
        isValid: false,
        message: `Invalid gender value '${value}'`,
        suggestion: genderResult.suggestion,
      };
    }

    case "marital_status": {
      const maritalResult = normalizeMaritalStatus(value);
      if (maritalResult.normalized) {
        return {
          isValid: true,
          autoCorrect: maritalResult.normalized !== value.toLowerCase().trim() 
            ? maritalResult.normalized 
            : undefined,
          suggestion: maritalResult.suggestion,
        };
      }
      return {
        isValid: false,
        message: `Invalid marital status '${value}'`,
        suggestion: maritalResult.suggestion,
      };
    }

    case "lookup":
      if (lookupCategory) {
        return await validateLookupValue(value, lookupCategory);
      }
      return { isValid: true };

    default:
      return { isValid: true };
  }
}

/**
 * Infer field type from field name
 */
function inferFieldType(fieldName: string): FieldValidationType | null {
  const lowerField = fieldName.toLowerCase();

  if (lowerField.includes("country") || lowerField === "nationality") {
    return "country";
  }
  if (lowerField.includes("currency")) {
    return "currency";
  }
  if (lowerField === "gender" || lowerField === "sex") {
    return "gender";
  }
  if (lowerField.includes("marital") || lowerField === "marital_status") {
    return "marital_status";
  }

  return null;
}

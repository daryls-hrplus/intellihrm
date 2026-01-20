import { supabase } from "@/integrations/supabase/client";
import i18n from 'i18next';

interface TranslationRow {
  translation_key: string;
  en: string | null;
  ar: string | null;
  es: string | null;
  fr: string | null;
  nl: string | null;
  pt: string | null;
  de: string | null;
  ru: string | null;
  zh: string | null;
}

type LanguageCode = 'en' | 'ar' | 'es' | 'fr' | 'nl' | 'pt' | 'de' | 'ru' | 'zh';

// Cache for database translations
let translationCache: Record<string, Record<string, string>> = {};
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch translations from database
async function fetchTranslationsFromDB(): Promise<Record<LanguageCode, Record<string, string>> | null> {
  try {
    const { data, error } = await supabase
      .from('translations')
      .select('translation_key, en, ar, es, fr, nl, pt, de, ru, zh');
    
    if (error) {
      console.warn('Failed to fetch translations from database:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const translations: Record<LanguageCode, Record<string, string>> = {
      en: {}, ar: {}, es: {}, fr: {}, nl: {}, pt: {}, de: {}, ru: {}, zh: {}
    };
    
    const languages: LanguageCode[] = ['en', 'ar', 'es', 'fr', 'nl', 'pt', 'de', 'ru', 'zh'];
    
    for (const row of data as TranslationRow[]) {
      for (const lang of languages) {
        const value = row[lang];
        if (value) {
          translations[lang][row.translation_key] = value;
        }
      }
    }
    
    return translations;
  } catch (err) {
    console.warn('Error fetching translations:', err);
    return null;
  }
}

// Check if cache is valid
function isCacheValid(): boolean {
  if (!cacheTimestamp) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
}

// Load database overrides and add them to i18next resources
export async function loadDatabaseOverrides(): Promise<void> {
  if (isCacheValid()) {
    return; // Already loaded and cache is valid
  }
  
  const dbTranslations = await fetchTranslationsFromDB();
  
  if (!dbTranslations) {
    return; // No database translations, use bundled only
  }
  
  const languages: LanguageCode[] = ['en', 'ar', 'es', 'fr', 'nl', 'pt', 'de', 'ru', 'zh'];
  
  // Add each translation key to i18next resources (overrides bundled)
  for (const lang of languages) {
    const langTranslations = dbTranslations[lang];
    for (const key in langTranslations) {
      i18n.addResource(lang, 'translation', key, langTranslations[key]);
    }
    translationCache[lang] = langTranslations;
  }
  
  cacheTimestamp = Date.now();
}

// Function to clear cache (useful for admin updates)
export function clearTranslationCache(): void {
  translationCache = {};
  cacheTimestamp = null;
}

// Function to refresh translations from database
export async function refreshTranslationsFromDB(): Promise<void> {
  clearTranslationCache();
  await loadDatabaseOverrides();
}

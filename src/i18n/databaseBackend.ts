import { supabase } from "@/integrations/supabase/client";
import type { BackendModule, ReadCallback, Services, InitOptions } from 'i18next';

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
const translationCache: Record<string, Record<string, string>> = {};
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Convert flat key-value pairs to nested object
function unflatten(data: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  for (const key in data) {
    const keys = key.split('.');
    let current: Record<string, unknown> = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as Record<string, unknown>;
    }
    
    current[keys[keys.length - 1]] = data[key];
  }
  
  return result;
}

// Fetch translations from database
async function fetchTranslationsFromDB(language: LanguageCode): Promise<Record<string, string> | null> {
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
    
    const translations: Record<string, string> = {};
    
    for (const row of data as TranslationRow[]) {
      const value = row[language];
      if (value) {
        translations[row.translation_key] = value;
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

// Database backend plugin for i18next
const DatabaseBackend: BackendModule = {
  type: 'backend',
  
  init(_services: Services, _backendOptions: object, _i18nextOptions: InitOptions) {
    // Initialization if needed
  },
  
  read(language: string, _namespace: string, callback: ReadCallback) {
    const langCode = language as LanguageCode;
    
    // Check cache first
    if (isCacheValid() && translationCache[langCode]) {
      const nested = unflatten(translationCache[langCode]);
      callback(null, nested);
      return;
    }
    
    // Fetch from database
    fetchTranslationsFromDB(langCode).then((dbTranslations) => {
      if (dbTranslations && Object.keys(dbTranslations).length > 0) {
        // Update cache
        translationCache[langCode] = dbTranslations;
        cacheTimestamp = Date.now();
        
        const nested = unflatten(dbTranslations);
        callback(null, nested);
      } else {
        // Return empty - i18next will fall back to resources
        callback(null, {});
      }
    }).catch((err) => {
      console.warn('Database translation fetch failed, using fallback:', err);
      callback(null, {});
    });
  }
};

// Function to clear cache (useful for admin updates)
export function clearTranslationCache(): void {
  Object.keys(translationCache).forEach(key => delete translationCache[key]);
  cacheTimestamp = null;
}

// Function to refresh translations from database
export async function refreshTranslationsFromDB(): Promise<void> {
  clearTranslationCache();
  // The next translation request will fetch fresh data
}

export default DatabaseBackend;

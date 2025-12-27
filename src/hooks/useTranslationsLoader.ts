import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/i18n/config';
import type { SupportedLanguage } from '@/i18n/config';

interface TranslationRow {
  translation_key: string;
  en: string;
  ar: string | null;
  es: string | null;
  fr: string | null;
  nl: string | null;
  pt: string | null;
  de: string | null;
  ru: string | null;
  zh: string | null;
}

type NestedObject = { [key: string]: string | NestedObject };

/**
 * Convert flat dot-notation keys to nested object structure
 */
function unflattenObject(flat: Record<string, string>): NestedObject {
  const result: NestedObject = {};

  for (const key in flat) {
    if (!Object.prototype.hasOwnProperty.call(flat, key)) continue;
    
    const parts = key.split('.');
    let current: NestedObject = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      // Create a new reference to avoid modifying frozen objects
      const next = current[part];
      if (typeof next === 'object' && next !== null) {
        current = next as NestedObject;
      }
    }

    const lastPart = parts[parts.length - 1];
    if (lastPart) {
      current[lastPart] = flat[key];
    }
  }

  return result;
}

/**
 * Build translation resources for a specific language from database rows
 */
function buildLanguageResource(
  translations: TranslationRow[],
  langCode: SupportedLanguage
): NestedObject {
  const flat: Record<string, string> = {};

  translations.forEach((row) => {
    const value = row[langCode as keyof TranslationRow];
    if (typeof value === 'string' && value.trim() !== '') {
      flat[row.translation_key] = value;
    } else if (langCode !== 'en' && row.en) {
      flat[row.translation_key] = row.en;
    }
  });

  return unflattenObject(flat);
}

export function useTranslationsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadTranslations = useCallback(async () => {
    // Prevent concurrent loads
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      // Fetch active company languages
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('first_language, second_language')
        .eq('is_active', true);

      let companyLanguages: SupportedLanguage[] = ['en'];
      
      if (!companyError && companies && companies.length > 0) {
        const languageCodes = new Set<SupportedLanguage>();
        languageCodes.add('en');
        
        companies.forEach((company) => {
          if (company.first_language) {
            languageCodes.add(company.first_language as SupportedLanguage);
          }
          if (company.second_language) {
            languageCodes.add(company.second_language as SupportedLanguage);
          }
        });
        
        companyLanguages = Array.from(languageCodes);
      }

      // Build the select query for only the needed language columns
      const selectQuery = `translation_key, ${companyLanguages.join(', ')}`;

      // Fetch translations in batches
      const allTranslations: TranslationRow[] = [];
      const batchSize = 1000;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from('translations')
          .select(selectQuery)
          .range(offset, offset + batchSize - 1);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          allTranslations.push(...(data as unknown as TranslationRow[]));
          offset += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      if (allTranslations.length === 0) {
        console.log('No translations in database, using static files');
        setIsLoaded(true);
        loadingRef.current = false;
        return;
      }

      // Build and add resources only for active company languages
      companyLanguages.forEach((langCode) => {
        const resource = buildLanguageResource(allTranslations, langCode);
        i18n.addResourceBundle(langCode, 'translation', resource, true, true);
      });

      console.log(`Loaded ${allTranslations.length} translations for ${companyLanguages.length} languages: ${companyLanguages.join(', ')}`);
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error loading translations from database:', err);
      setError('Failed to load translations');
      setIsLoaded(true);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadTranslations();

    const channel = supabase
      .channel('translations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations',
        },
        () => {
          console.log('Translation change detected, reloading...');
          loadTranslations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTranslations]);

  return { isLoaded, error, reload: loadTranslations };
}

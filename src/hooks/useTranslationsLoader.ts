import { useEffect, useState, useCallback } from 'react';
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
 * e.g., { "common.save": "Save" } -> { common: { save: "Save" } }
 */
function unflattenObject(flat: Record<string, string>): NestedObject {
  const result: NestedObject = {};

  for (const key in flat) {
    const parts = key.split('.');
    let current: NestedObject = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as NestedObject;
    }

    current[parts[parts.length - 1]] = flat[key];
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
    // Use the translation value, or fall back to English if missing
    if (typeof value === 'string' && value.trim() !== '') {
      flat[row.translation_key] = value;
    } else if (langCode !== 'en' && row.en) {
      // Fallback to English for non-English languages
      flat[row.translation_key] = row.en;
    }
  });

  return unflattenObject(flat);
}

const LANGUAGES: SupportedLanguage[] = ['en', 'ar', 'es', 'fr', 'nl', 'pt', 'de', 'ru', 'zh'];

export function useTranslationsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTranslations = useCallback(async () => {
    try {
      // Fetch all translations in batches to overcome the 1000 row limit
      const allTranslations: TranslationRow[] = [];
      const batchSize = 1000;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from('translations')
          .select('translation_key, en, ar, es, fr, nl, pt, de, ru, zh')
          .range(offset, offset + batchSize - 1);

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          allTranslations.push(...data);
          offset += batchSize;
          hasMore = data.length === batchSize;
        } else {
          hasMore = false;
        }
      }

      // If no translations in database, keep using the static files
      if (allTranslations.length === 0) {
        console.log('No translations in database, using static files');
        setIsLoaded(true);
        return;
      }

      // Build and add resources for each language
      LANGUAGES.forEach((langCode) => {
        const resource = buildLanguageResource(allTranslations, langCode);
        i18n.addResourceBundle(langCode, 'translation', resource, true, true);
      });

      console.log(`Loaded ${allTranslations.length} translations from database`);
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error loading translations from database:', err);
      setError('Failed to load translations');
      // Still mark as loaded so the app can use static fallbacks
      setIsLoaded(true);
    }
  }, []);

  // Subscribe to real-time updates
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
          // Reload all translations when any change occurs
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

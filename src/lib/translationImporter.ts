import enTranslations from '@/i18n/locales/en.json';
import arTranslations from '@/i18n/locales/ar.json';
import esTranslations from '@/i18n/locales/es.json';
import frTranslations from '@/i18n/locales/fr.json';
import nlTranslations from '@/i18n/locales/nl.json';
import ptTranslations from '@/i18n/locales/pt.json';
import deTranslations from '@/i18n/locales/de.json';
import ruTranslations from '@/i18n/locales/ru.json';
import zhTranslations from '@/i18n/locales/zh.json';
import type { TranslationInput } from '@/hooks/useDatabaseTranslations';

type NestedObject = { [key: string]: string | NestedObject };

/**
 * Flatten a nested object into dot-notation keys
 */
function flattenObject(obj: NestedObject, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value as NestedObject, newKey));
    }
  }

  return result;
}

/**
 * Get the category from a translation key (first segment)
 */
function getCategoryFromKey(key: string): string {
  const parts = key.split('.');
  return parts[0] || 'common';
}

/**
 * Get a value from a nested object using dot notation
 */
function getNestedValue(obj: NestedObject, key: string): string | null {
  const parts = key.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
}

/**
 * Generate translation records from all locale files
 */
export function generateTranslationRecords(): TranslationInput[] {
  // Flatten English translations to get all keys
  const flatEnglish = flattenObject(enTranslations as NestedObject);
  const keys = Object.keys(flatEnglish);

  // Create translation records
  const records: TranslationInput[] = keys.map((key) => ({
    translation_key: key,
    category: getCategoryFromKey(key),
    en: flatEnglish[key],
    ar: getNestedValue(arTranslations as NestedObject, key),
    es: getNestedValue(esTranslations as NestedObject, key),
    fr: getNestedValue(frTranslations as NestedObject, key),
    nl: getNestedValue(nlTranslations as NestedObject, key),
    pt: getNestedValue(ptTranslations as NestedObject, key),
    de: getNestedValue(deTranslations as NestedObject, key),
    ru: getNestedValue(ruTranslations as NestedObject, key),
    zh: getNestedValue(zhTranslations as NestedObject, key),
    description: null,
  }));

  return records;
}

/**
 * Get summary statistics about translations
 */
export function getTranslationStats() {
  const records = generateTranslationRecords();
  const total = records.length;
  
  const languageCounts = {
    en: records.filter(r => r.en).length,
    ar: records.filter(r => r.ar).length,
    es: records.filter(r => r.es).length,
    fr: records.filter(r => r.fr).length,
    nl: records.filter(r => r.nl).length,
    pt: records.filter(r => r.pt).length,
    de: records.filter(r => r.de).length,
    ru: records.filter(r => r.ru).length,
    zh: records.filter(r => r.zh).length,
  };

  const categories = [...new Set(records.map(r => r.category))];

  return {
    total,
    languageCounts,
    categories,
  };
}

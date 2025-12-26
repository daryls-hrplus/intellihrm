import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supportedLanguages, type SupportedLanguage } from '@/i18n';

export interface Translation {
  id: string;
  translation_key: string;
  category: string;
  en: string;
  ar: string | null;
  es: string | null;
  fr: string | null;
  nl: string | null;
  pt: string | null;
  de: string | null;
  ru: string | null;
  zh: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type TranslationInput = Omit<Translation, 'id' | 'created_at' | 'updated_at'>;

export function useDatabaseTranslations() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTranslations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all translations in batches to overcome the 1000 row limit
      const allTranslations: Translation[] = [];
      const batchSize = 1000;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error: fetchError } = await supabase
          .from('translations')
          .select('*')
          .order('category')
          .order('translation_key')
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

      setTranslations(allTranslations);
      setError(null);
    } catch (err) {
      console.error('Error fetching translations:', err);
      setError('Failed to load translations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTranslation = useCallback(async (translation: TranslationInput) => {
    const { data, error: insertError } = await supabase
      .from('translations')
      .insert(translation)
      .select()
      .single();

    if (insertError) throw insertError;
    setTranslations(prev => [...prev, data]);
    return data;
  }, []);

  const updateTranslation = useCallback(async (id: string, updates: Partial<TranslationInput>) => {
    const { data, error: updateError } = await supabase
      .from('translations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    setTranslations(prev => prev.map(t => t.id === id ? data : t));
    return data;
  }, []);

  const deleteTranslation = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('translations')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    setTranslations(prev => prev.filter(t => t.id !== id));
  }, []);

  const bulkImport = useCallback(async (translations: TranslationInput[]) => {
    const { data, error: insertError } = await supabase
      .from('translations')
      .upsert(translations, { onConflict: 'translation_key' })
      .select();

    if (insertError) throw insertError;
    await fetchTranslations();
    return data;
  }, [fetchTranslations]);

  // Get categories for filtering
  const categories = [...new Set(translations.map(t => t.category))].sort();

  // Get missing translations count per language
  const getMissingCounts = useCallback(() => {
    const counts: Record<SupportedLanguage, number> = {
      en: 0, ar: 0, es: 0, fr: 0, nl: 0, pt: 0, de: 0, ru: 0, zh: 0
    };
    
    translations.forEach(t => {
      supportedLanguages.forEach(lang => {
        const value = t[lang.code as keyof Translation];
        if (!value || value === '') {
          counts[lang.code as SupportedLanguage]++;
        }
      });
    });
    
    return counts;
  }, [translations]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  return {
    translations,
    isLoading,
    error,
    categories,
    fetchTranslations,
    addTranslation,
    updateTranslation,
    deleteTranslation,
    bulkImport,
    getMissingCounts,
  };
}

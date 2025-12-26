import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supportedLanguages, type SupportedLanguage } from '@/i18n';

export function useCompanyLanguages() {
  const [companyLanguageCodes, setCompanyLanguageCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyLanguages() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('first_language, second_language')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching company languages:', error);
          setCompanyLanguageCodes(['en']); // Fallback to English
          return;
        }

        if (!data || data.length === 0) {
          setCompanyLanguageCodes(['en']); // Fallback to English
          return;
        }

        // Collect unique language codes from all active companies
        const languageCodes = new Set<string>();
        data.forEach((company) => {
          if (company.first_language) {
            languageCodes.add(company.first_language);
          }
          if (company.second_language) {
            languageCodes.add(company.second_language);
          }
        });

        // If no languages found, fallback to English
        if (languageCodes.size === 0) {
          setCompanyLanguageCodes(['en']);
        } else {
          setCompanyLanguageCodes(Array.from(languageCodes));
        }
      } catch (err) {
        console.error('Error in useCompanyLanguages:', err);
        setCompanyLanguageCodes(['en']); // Fallback to English
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanyLanguages();
  }, []);

  // Filter supported languages to only those used by active companies
  const availableLanguages = useMemo(() => {
    return supportedLanguages.filter((lang) =>
      companyLanguageCodes.includes(lang.code)
    );
  }, [companyLanguageCodes]);

  return {
    availableLanguages,
    isLoading,
  };
}

import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { supportedLanguages, type SupportedLanguage } from '@/i18n';

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;
  
  const currentLanguageInfo = supportedLanguages.find(
    (lang) => lang.code === currentLanguage
  ) || supportedLanguages[0];

  const changeLanguage = useCallback(
    async (languageCode: SupportedLanguage) => {
      await i18n.changeLanguage(languageCode);
      
      // Update document direction for RTL languages
      const langInfo = supportedLanguages.find((l) => l.code === languageCode);
      if (langInfo) {
        document.documentElement.dir = langInfo.dir;
        document.documentElement.lang = languageCode;
      }
    },
    [i18n]
  );

  // Set initial direction on mount
  useEffect(() => {
    document.documentElement.dir = currentLanguageInfo.dir;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, currentLanguageInfo.dir]);

  return {
    t,
    i18n,
    currentLanguage,
    currentLanguageInfo,
    supportedLanguages,
    changeLanguage,
    isRTL: currentLanguageInfo.dir === 'rtl',
  };
}

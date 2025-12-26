import { useTranslationsLoader } from '@/hooks/useTranslationsLoader';

interface TranslationsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that loads translations from the database
 * and keeps them in sync with real-time updates.
 * 
 * Wraps the app to ensure translations are loaded before rendering.
 * Falls back to static JSON files during initial load.
 */
export function TranslationsProvider({ children }: TranslationsProviderProps) {
  const { isLoaded, error } = useTranslationsLoader();

  // We don't block rendering - static translations are available immediately
  // Database translations will override them once loaded
  if (error) {
    console.warn('TranslationsProvider: Using static translations due to error:', error);
  }

  if (!isLoaded) {
    // Optional: could show a minimal loading state here
    // For now, we render children immediately with static translations
  }

  return <>{children}</>;
}

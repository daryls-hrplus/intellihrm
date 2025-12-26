import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { useCompanyLanguages } from '@/hooks/useCompanyLanguages';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { availableLanguages, isLoading } = useCompanyLanguages();

  // Don't show switcher if loading or only one language available
  if (isLoading || availableLanguages.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              'flex items-center justify-between cursor-pointer',
              currentLanguage === language.code && 'bg-accent'
            )}
          >
            <span>{language.nativeName}</span>
            {currentLanguage === language.code && (
              <span className="text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

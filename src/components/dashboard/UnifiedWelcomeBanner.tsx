import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardConfiguration } from '@/hooks/useDashboardConfiguration';
import { CARD_RADIUS } from '@/lib/dashboard-config';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface UnifiedWelcomeBannerProps {
  title: string;
  subtitle?: string;
  features?: Feature[];
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  storageKey: string;
  className?: string;
}

export function UnifiedWelcomeBanner({
  title,
  subtitle,
  features = [],
  primaryAction,
  secondaryAction,
  storageKey,
  className,
}: UnifiedWelcomeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(true);
  const { config } = useDashboardConfiguration();

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    setIsDismissed(dismissed === 'true');
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20',
        CARD_RADIUS[config.layout.cardRadius],
        config.layout.showAnimations && 'animate-slide-up',
        className
      )}
    >
      <CardContent className="p-6">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}

            {features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <feature.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(primaryAction || secondaryAction) && (
              <div className="flex gap-2 mt-4">
                {primaryAction && (
                  <Button size="sm" onClick={primaryAction.onClick}>
                    {primaryAction.label}
                  </Button>
                )}
                {secondaryAction && (
                  <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                    {secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

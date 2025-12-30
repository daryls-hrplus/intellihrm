import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useDashboardConfiguration } from '@/hooks/useDashboardConfiguration';
import { CARD_RADIUS } from '@/lib/dashboard-config';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  badge?: string;
}

interface UnifiedQuickActionsProps {
  title?: string;
  actions: QuickAction[];
  className?: string;
  showTitle?: boolean;
}

export function UnifiedQuickActions({
  title = 'Quick Actions',
  actions,
  className,
  showTitle = true,
}: UnifiedQuickActionsProps) {
  const { config } = useDashboardConfiguration();

  const visibleActions = actions.slice(0, config.quickActions.maxVisible);

  if (config.quickActions.style === 'icons') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {visibleActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size="icon"
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.label}
          >
            <action.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
    );
  }

  if (config.quickActions.style === 'cards') {
    return (
      <div className={className}>
        {showTitle && (
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleActions.map((action, index) => (
            <Card
              key={index}
              className={cn(
                'cursor-pointer hover:border-primary/30 transition-colors',
                CARD_RADIUS[config.layout.cardRadius],
                action.disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={action.disabled ? undefined : action.onClick}
            >
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="p-2 rounded-lg bg-accent">
                  <action.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
                {action.badge && (
                  <span className="text-xs text-muted-foreground">{action.badge}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default: buttons style
  return (
    <Card className={cn(CARD_RADIUS[config.layout.cardRadius], className)}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!showTitle ? 'pt-4' : undefined}>
        <div className="flex flex-wrap gap-2">
          {visibleActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="gap-2"
            >
              {config.quickActions.showIcons && (
                <action.icon className="h-4 w-4" />
              )}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

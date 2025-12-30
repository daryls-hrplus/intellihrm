import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, RefreshCw, Sparkles, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboardConfiguration } from '@/hooks/useDashboardConfiguration';
import { CARD_RADIUS } from '@/lib/dashboard-config';

interface AIStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  type?: 'positive' | 'negative' | 'warning' | 'neutral';
  onClick?: () => void;
}

interface AIInsight {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'action';
  action?: string;
  onAction?: () => void;
}

interface UnifiedAIDashboardProps {
  title?: string;
  subtitle?: string;
  stats?: AIStat[];
  insights?: AIInsight[];
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  className?: string;
}

export function UnifiedAIDashboard({
  title = 'AI Insights',
  subtitle,
  stats = [],
  insights = [],
  onRefresh,
  refreshing = false,
  loading = false,
  className,
}: UnifiedAIDashboardProps) {
  const { config } = useDashboardConfiguration();

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'action':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      default:
        return <Sparkles className="h-4 w-4 text-info" />;
    }
  };

  const getInsightBadgeVariant = (type: AIInsight['type']) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'action':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className={cn(CARD_RADIUS[config.layout.cardRadius], className)}>
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg animate-pulse">
                  <div className="h-4 w-20 bg-muted rounded mb-2" />
                  <div className="h-6 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        CARD_RADIUS[config.layout.cardRadius],
        config.aiDashboard.showGradientBorder && 'border-l-4 border-l-primary',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Section */}
        {stats.length > 0 && config.aiDashboard.statsPosition === 'top' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 bg-muted/50 rounded-lg',
                  stat.onClick && 'cursor-pointer hover:bg-muted transition-colors'
                )}
                onClick={stat.onClick}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <span className={cn(
                  'text-lg font-bold',
                  stat.type === 'positive' && 'text-success',
                  stat.type === 'negative' && 'text-destructive',
                  stat.type === 'warning' && 'text-warning'
                )}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Insights Section */}
        {insights.length > 0 && (
          <div className={cn(
            config.aiDashboard.insightStyle === 'compact' ? 'space-y-2' : 'space-y-3'
          )}>
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  config.aiDashboard.insightStyle === 'card' && 'p-3 bg-muted/30 rounded-lg'
                )}
              >
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {insight.description}
                  </p>
                  {insight.action && insight.onAction && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-xs"
                      onClick={insight.onAction}
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
                <Badge variant={getInsightBadgeVariant(insight.type)} className="shrink-0">
                  {insight.type}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Stats at bottom */}
        {stats.length > 0 && config.aiDashboard.statsPosition === 'bottom' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 bg-muted/50 rounded-lg',
                  stat.onClick && 'cursor-pointer hover:bg-muted transition-colors'
                )}
                onClick={stat.onClick}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <stat.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {stats.length === 0 && insights.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI insights available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

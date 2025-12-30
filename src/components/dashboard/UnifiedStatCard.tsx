import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useDashboardConfiguration } from '@/hooks/useDashboardConfiguration';
import {
  CARD_RADIUS,
  VALUE_SIZES,
  ICON_STYLES,
  getSemanticColor,
} from '@/lib/dashboard-config';

export type ValueType = 'positive' | 'negative' | 'warning' | 'neutral';

interface UnifiedStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: ValueType;
  icon: LucideIcon;
  valueType?: ValueType;
  onClick?: () => void;
  className?: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function UnifiedStatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  valueType = 'neutral',
  onClick,
  className,
  delay = 0,
  size = 'md',
  loading = false,
}: UnifiedStatCardProps) {
  const { config } = useDashboardConfiguration();

  const sizeStyles = {
    sm: {
      padding: 'p-3',
      iconContainer: 'p-2',
      iconSize: 'h-4 w-4',
      titleSize: 'text-xs',
      valueSize: 'text-lg',
      changeSize: 'text-xs',
    },
    md: {
      padding: 'p-4',
      iconContainer: 'p-2.5',
      iconSize: 'h-5 w-5',
      titleSize: 'text-sm',
      valueSize: VALUE_SIZES[config.statCardStyle.valueSize],
      changeSize: 'text-sm',
    },
    lg: {
      padding: 'p-6',
      iconContainer: 'p-3',
      iconSize: 'h-6 w-6',
      titleSize: 'text-sm',
      valueSize: 'text-3xl',
      changeSize: 'text-sm',
    },
  };

  const currentSize = sizeStyles[size];

  // Get value color based on semantic type
  const valueColor = getSemanticColor(valueType, config.colorSemantics[valueType]);
  const changeColor = getSemanticColor(changeType, config.colorSemantics[changeType]);

  // Build card classes
  const cardClasses = cn(
    'group relative overflow-hidden transition-all duration-300',
    CARD_RADIUS[config.layout.cardRadius],
    currentSize.padding,
    'bg-card',
    config.statCardStyle.showBorder && 'border',
    config.statCardStyle.showShadow && 'shadow-sm hover:shadow-md',
    config.statCardStyle.variant === 'elevated' && 'hover:-translate-y-0.5',
    onClick && 'cursor-pointer',
    config.layout.showAnimations && 'animate-slide-up',
    className
  );

  if (loading) {
    return (
      <div className={cardClasses} style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          </div>
          <div className={cn('rounded-lg bg-muted animate-pulse', currentSize.iconContainer)}>
            <div className={cn(currentSize.iconSize)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cardClasses}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 min-w-0 flex-1">
          <p className={cn('font-medium text-muted-foreground truncate', currentSize.titleSize)}>
            {title}
          </p>
          <p className={cn('font-bold tracking-tight', currentSize.valueSize, valueColor)}>
            {value}
          </p>
          {change && (
            <p className={cn('font-medium', currentSize.changeSize, changeColor)}>
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'rounded-lg transition-transform duration-300 group-hover:scale-110 shrink-0',
            ICON_STYLES[config.statCardStyle.iconStyle],
            currentSize.iconContainer
          )}
        >
          <Icon className={currentSize.iconSize} />
        </div>
      </div>
      {/* Decorative element */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
    </div>
  );
}

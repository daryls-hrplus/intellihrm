import { cn } from '@/lib/utils';
import { useDashboardConfiguration } from '@/hooks/useDashboardConfiguration';
import { STATS_GRID_COLS, CARD_SPACING } from '@/lib/dashboard-config';

interface UnifiedStatsRowProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function UnifiedStatsRow({
  children,
  columns,
  className,
}: UnifiedStatsRowProps) {
  const { config } = useDashboardConfiguration();
  
  const effectiveColumns = columns ?? config.layout.statsColumns;

  return (
    <div
      className={cn(
        'grid',
        STATS_GRID_COLS[effectiveColumns],
        CARD_SPACING[config.layout.cardSpacing],
        className
      )}
    >
      {children}
    </div>
  );
}

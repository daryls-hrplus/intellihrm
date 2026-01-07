import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 
  | 'high'     // Green - High confidence, success
  | 'medium'   // Amber - Medium, caution
  | 'low'      // Gray - Low, pending
  | 'critical' // Red - Critical, errors
  | 'info';    // Blue - Informational

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  high: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-300 dark:border-emerald-700',
  },
  medium: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-300 dark:border-amber-700',
  },
  low: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border',
  },
  critical: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-300 dark:border-red-700',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-700',
  },
};

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {children}
    </span>
  );
}

// Convenience components
export function HighStatusBadge({ children, className }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="high" className={className}>{children}</StatusBadge>;
}

export function MediumStatusBadge({ children, className }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="medium" className={className}>{children}</StatusBadge>;
}

export function LowStatusBadge({ children, className }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="low" className={className}>{children}</StatusBadge>;
}

export function CriticalStatusBadge({ children, className }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="critical" className={className}>{children}</StatusBadge>;
}

export function InfoStatusBadge({ children, className }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="info" className={className}>{children}</StatusBadge>;
}

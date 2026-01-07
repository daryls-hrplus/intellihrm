import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeatureCardVariant = 
  | 'primary'    // Blue - Main features, employee empowerment
  | 'success'    // Green/Emerald - Approvals, completions, certifications
  | 'info'       // Teal - Information, controlled access
  | 'warning'    // Amber - Alerts, cautions, pending items
  | 'purple'     // Purple - Licenses, real-time, special features
  | 'orange'     // Orange - Memberships, offboarding, time-related
  | 'neutral';   // Gray - Default, low priority

interface FeatureCardProps {
  variant?: FeatureCardVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
}

const variantConfig = {
  primary: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-slate-900 dark:text-blue-100',
    textColor: 'text-slate-800 dark:text-blue-200',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-slate-900 dark:text-emerald-100',
    textColor: 'text-slate-800 dark:text-emerald-200',
  },
  info: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-800',
    iconColor: 'text-teal-600 dark:text-teal-400',
    titleColor: 'text-slate-900 dark:text-teal-100',
    textColor: 'text-slate-800 dark:text-teal-200',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-slate-900 dark:text-amber-100',
    textColor: 'text-slate-800 dark:text-amber-200',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-slate-900 dark:text-purple-100',
    textColor: 'text-slate-800 dark:text-purple-200',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    iconColor: 'text-orange-600 dark:text-orange-400',
    titleColor: 'text-slate-900 dark:text-orange-100',
    textColor: 'text-slate-800 dark:text-orange-200',
  },
  neutral: {
    bg: 'bg-muted/30',
    border: 'border',
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
    textColor: 'text-muted-foreground',
  },
};

export function FeatureCard({ 
  variant = 'neutral', 
  icon: Icon, 
  title, 
  description, 
  children, 
  className,
  centered = false 
}: FeatureCardProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        config.bg,
        config.border,
        centered && 'text-center',
        className
      )}
    >
      {Icon && (
        <Icon 
          className={cn(
            'h-6 w-6 mb-2',
            config.iconColor,
            centered && 'mx-auto h-8 w-8 mb-3'
          )} 
        />
      )}
      <h4 className={cn('font-semibold mb-2', config.titleColor, centered && 'mb-1')}>
        {title}
      </h4>
      {description && (
        <p className={cn('text-sm', config.textColor, centered && 'mt-1')}>
          {description}
        </p>
      )}
      {children && (
        <div className={cn('text-sm', config.textColor)}>
          {children}
        </div>
      )}
    </div>
  );
}

// Convenience components for common use cases
export function PrimaryFeatureCard(props: Omit<FeatureCardProps, 'variant'>) {
  return <FeatureCard variant="primary" {...props} />;
}

export function SuccessFeatureCard(props: Omit<FeatureCardProps, 'variant'>) {
  return <FeatureCard variant="success" {...props} />;
}

export function InfoFeatureCard(props: Omit<FeatureCardProps, 'variant'>) {
  return <FeatureCard variant="info" {...props} />;
}

export function WarningFeatureCard(props: Omit<FeatureCardProps, 'variant'>) {
  return <FeatureCard variant="warning" {...props} />;
}

export function PurpleFeatureCard(props: Omit<FeatureCardProps, 'variant'>) {
  return <FeatureCard variant="purple" {...props} />;
}

export function OrangeFeatureCard(props: Omit<FeatureCardProps, 'variant'>) {
  return <FeatureCard variant="orange" {...props} />;
}

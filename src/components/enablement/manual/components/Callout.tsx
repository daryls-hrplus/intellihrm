import { AlertTriangle, Info, Lightbulb, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutVariant = 'info' | 'warning' | 'tip' | 'note' | 'prerequisite' | 'success';

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantConfig = {
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-muted/50',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-muted/50',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  tip: {
    border: 'border-l-emerald-500',
    bg: 'bg-muted/50',
    icon: Lightbulb,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  note: {
    border: 'border-l-purple-500',
    bg: 'bg-muted/50',
    icon: FileText,
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  prerequisite: {
    border: 'border-l-amber-500',
    bg: 'bg-muted/50',
    icon: AlertCircle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    border: 'border-l-green-500',
    bg: 'bg-muted/50',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
  },
};

export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'p-4 border-l-4 rounded-r-lg my-4',
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          )}
          <div className="text-sm text-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function InfoCallout({ title, children, className }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="info" title={title} className={className}>{children}</Callout>;
}

export function WarningCallout({ title, children, className }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="warning" title={title} className={className}>{children}</Callout>;
}

export function TipCallout({ title, children, className }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="tip" title={title} className={className}>{children}</Callout>;
}

export function NoteCallout({ title, children, className }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="note" title={title} className={className}>{children}</Callout>;
}

export function SuccessCallout({ title, children, className }: Omit<CalloutProps, 'variant'>) {
  return <Callout variant="success" title={title} className={className}>{children}</Callout>;
}

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star } from 'lucide-react';

export type FeatureStatus = 'implemented' | 'recommended';

interface FeatureStatusBadgeProps {
  status: FeatureStatus;
  size?: 'sm' | 'default';
}

const STATUS_CONFIG: Record<FeatureStatus, { label: string; className: string; Icon: typeof CheckCircle }> = {
  implemented: {
    label: 'Implemented',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
    Icon: CheckCircle
  },
  recommended: {
    label: 'Recommended',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
    Icon: Star
  }
};

export function FeatureStatusBadge({ status, size = 'default' }: FeatureStatusBadgeProps) {
  const { label, className, Icon } = STATUS_CONFIG[status];

  return (
    <Badge 
      variant="outline" 
      className={`${className} ${size === 'sm' ? 'text-xs px-1.5 py-0' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {label}
    </Badge>
  );
}

// Inline helper components for marking features in content
export function Implemented({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <FeatureStatusBadge status="implemented" size="sm" />
    </span>
  );
}

export function Recommended({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <FeatureStatusBadge status="recommended" size="sm" />
    </span>
  );
}

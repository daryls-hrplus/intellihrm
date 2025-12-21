import { Badge } from '@/components/ui/badge';
import { STATUS_CONFIG, type ArtifactStatus } from '@/types/artifact';
import { FileEdit, Clock, CheckCircle, Globe, Archive } from 'lucide-react';

interface ArtifactStatusBadgeProps {
  status: ArtifactStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const STATUS_ICONS: Record<ArtifactStatus, React.ComponentType<{ className?: string }>> = {
  draft: FileEdit,
  in_review: Clock,
  approved: CheckCircle,
  published: Globe,
  deprecated: Archive
};

export function ArtifactStatusBadge({ status, showIcon = true, size = 'default' }: ArtifactStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = STATUS_ICONS[status];

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />}
      {config.label}
    </Badge>
  );
}

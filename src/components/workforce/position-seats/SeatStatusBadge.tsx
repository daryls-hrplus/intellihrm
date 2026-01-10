import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, 
  CheckCircle2, 
  UserX, 
  UserCheck, 
  Snowflake, 
  XCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeatStatus } from './types';
import { SEAT_STATUS_CONFIG } from './types';

interface SeatStatusBadgeProps {
  status: SeatStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap = {
  ClipboardList,
  CheckCircle2,
  UserX,
  UserCheck,
  Snowflake,
  XCircle
};

export function SeatStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: SeatStatusBadgeProps) {
  const config = SEAT_STATUS_CONFIG[status];
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4'
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-0',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && (
        <Icon className={cn(iconSizes[size], 'mr-1')} />
      )}
      {config.label}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  AlertCircle,
  User,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Employment Type variants
export type EmploymentTypeCode = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN';

// Employment Status variants  
export type EmploymentStatus = 'active' | 'probation' | 'on_leave' | 'terminated' | 'suspended';

// Assignment Type variants
export type AssignmentType = 'primary' | 'acting' | 'temporary' | 'interim';

interface EmploymentTypeConfig {
  label: string;
  variant: 'success' | 'warning' | 'neutral' | 'info' | 'error';
  icon?: React.ElementType;
}

interface EmploymentStatusConfig {
  label: string;
  variant: 'success' | 'warning' | 'neutral' | 'info' | 'error';
  icon: React.ElementType;
}

const EMPLOYMENT_TYPE_CONFIG: Record<EmploymentTypeCode, EmploymentTypeConfig> = {
  FULL_TIME: { label: 'Full-Time', variant: 'success', icon: Briefcase },
  PART_TIME: { label: 'Part-Time', variant: 'neutral', icon: Clock },
  CONTRACTOR: { label: 'Contractor', variant: 'warning', icon: User },
  TEMPORARY: { label: 'Temporary', variant: 'neutral', icon: Calendar },
  INTERN: { label: 'Intern', variant: 'info', icon: User },
};

const EMPLOYMENT_STATUS_CONFIG: Record<EmploymentStatus, EmploymentStatusConfig> = {
  active: { label: 'Active', variant: 'success', icon: CheckCircle2 },
  probation: { label: 'Probation', variant: 'warning', icon: Clock },
  on_leave: { label: 'On Leave', variant: 'neutral', icon: Calendar },
  terminated: { label: 'Terminated', variant: 'error', icon: AlertCircle },
  suspended: { label: 'Suspended', variant: 'error', icon: AlertCircle },
};

const ASSIGNMENT_TYPE_CONFIG: Record<AssignmentType, EmploymentTypeConfig> = {
  primary: { label: 'Primary', variant: 'success' },
  acting: { label: 'Acting', variant: 'warning' },
  temporary: { label: 'Temporary', variant: 'neutral' },
  interim: { label: 'Interim', variant: 'info' },
};

const variantStyles: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

interface EmploymentTypeBadgeProps {
  type: EmploymentTypeCode | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function EmploymentTypeBadge({ 
  type, 
  size = 'sm', 
  showIcon = false,
  className 
}: EmploymentTypeBadgeProps) {
  const normalizedType = type.toUpperCase().replace('-', '_').replace(' ', '_') as EmploymentTypeCode;
  const config = EMPLOYMENT_TYPE_CONFIG[normalizedType] || { 
    label: type, 
    variant: 'neutral' as const 
  };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        variantStyles[config.variant],
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        'font-medium',
        className
      )}
    >
      {showIcon && Icon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {config.label}
    </Badge>
  );
}

interface EmploymentStatusBadgeProps {
  status: EmploymentStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function EmploymentStatusBadge({ 
  status, 
  size = 'sm', 
  showIcon = true,
  className 
}: EmploymentStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace('-', '_').replace(' ', '_') as EmploymentStatus;
  const config = EMPLOYMENT_STATUS_CONFIG[normalizedStatus] || { 
    label: status, 
    variant: 'neutral' as const,
    icon: AlertCircle
  };
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        variantStyles[config.variant],
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        'font-medium',
        className
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />}
      {config.label}
    </Badge>
  );
}

interface AssignmentTypeBadgeProps {
  type: AssignmentType | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AssignmentTypeBadge({ 
  type, 
  size = 'sm',
  className 
}: AssignmentTypeBadgeProps) {
  const normalizedType = type.toLowerCase().replace('-', '_').replace(' ', '_') as AssignmentType;
  const config = ASSIGNMENT_TYPE_CONFIG[normalizedType] || { 
    label: type, 
    variant: 'neutral' as const 
  };

  // Don't show badge for primary assignments
  if (normalizedType === 'primary') return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        variantStyles[config.variant],
        size === 'sm' ? 'text-xs px-1.5 py-0' : 'text-sm px-2 py-0.5',
        'font-medium capitalize',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

// Utility function to normalize employment type from database
export function normalizeEmploymentType(type?: string | null): EmploymentTypeCode | null {
  if (!type) return null;
  const normalized = type.toUpperCase().replace('-', '_').replace(' ', '_');
  if (normalized in EMPLOYMENT_TYPE_CONFIG) {
    return normalized as EmploymentTypeCode;
  }
  return null;
}

// Utility function to check if employee is on probation
export function isOnProbation(probationEndDate?: string | null): boolean {
  if (!probationEndDate) return false;
  return new Date(probationEndDate) > new Date();
}

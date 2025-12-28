import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  Settings, 
  Users, 
  Code, 
  Shield, 
  Target, 
  FileText, 
  HeadphonesIcon,
  FolderKanban 
} from "lucide-react";

export type ResponsibilityCategory = 
  | 'financial'
  | 'operational'
  | 'people_leadership'
  | 'technical'
  | 'compliance'
  | 'strategic'
  | 'administrative'
  | 'customer_service'
  | 'project_management';

interface CategoryConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  className: string;
}

const categoryConfig: Record<ResponsibilityCategory, CategoryConfig> = {
  financial: {
    label: 'Financial',
    icon: DollarSign,
    variant: 'outline',
    className: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  operational: {
    label: 'Operational',
    icon: Settings,
    variant: 'outline',
    className: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  },
  people_leadership: {
    label: 'People Leadership',
    icon: Users,
    variant: 'outline',
    className: 'border-purple-500/50 bg-purple-500/10 text-purple-700 dark:text-purple-400',
  },
  technical: {
    label: 'Technical',
    icon: Code,
    variant: 'outline',
    className: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400',
  },
  compliance: {
    label: 'Compliance',
    icon: Shield,
    variant: 'outline',
    className: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400',
  },
  strategic: {
    label: 'Strategic',
    icon: Target,
    variant: 'outline',
    className: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
  },
  administrative: {
    label: 'Administrative',
    icon: FileText,
    variant: 'outline',
    className: 'border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400',
  },
  customer_service: {
    label: 'Customer Service',
    icon: HeadphonesIcon,
    variant: 'outline',
    className: 'border-pink-500/50 bg-pink-500/10 text-pink-700 dark:text-pink-400',
  },
  project_management: {
    label: 'Project Management',
    icon: FolderKanban,
    variant: 'outline',
    className: 'border-teal-500/50 bg-teal-500/10 text-teal-700 dark:text-teal-400',
  },
};

interface ResponsibilityCategoryBadgeProps {
  category: ResponsibilityCategory | null | undefined;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function ResponsibilityCategoryBadge({ 
  category, 
  showIcon = true,
  size = 'default' 
}: ResponsibilityCategoryBadgeProps) {
  if (!category) return null;
  
  const config = categoryConfig[category];
  if (!config) return null;
  
  const Icon = config.icon;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        config.className,
        size === 'sm' && 'text-xs px-1.5 py-0'
      )}
    >
      {showIcon && <Icon className={cn("mr-1", size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {config.label}
    </Badge>
  );
}

export function getCategoryOptions() {
  return Object.entries(categoryConfig).map(([value, config]) => ({
    value: value as ResponsibilityCategory,
    label: config.label,
    icon: config.icon,
  }));
}

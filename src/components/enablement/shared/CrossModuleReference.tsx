import { ExternalLink, AlertTriangle, Info, ArrowRight, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReferenceType = 'prerequisite' | 'dependency' | 'see_also' | 'integration';

interface CrossModuleReferenceProps {
  type: ReferenceType;
  moduleCode: string;
  moduleName: string;
  sectionId: string;
  sectionTitle: string;
  description: string;
  manualPath?: string;
  className?: string;
}

const referenceConfig: Record<ReferenceType, {
  icon: React.ElementType;
  label: string;
  bgClass: string;
  borderClass: string;
  iconClass: string;
}> = {
  prerequisite: {
    icon: AlertTriangle,
    label: 'Prerequisite',
    bgClass: 'bg-destructive/5',
    borderClass: 'border-destructive/30',
    iconClass: 'text-destructive'
  },
  dependency: {
    icon: Link2,
    label: 'Dependency',
    bgClass: 'bg-blue-500/5',
    borderClass: 'border-blue-500/30',
    iconClass: 'text-blue-500'
  },
  see_also: {
    icon: Info,
    label: 'See Also',
    bgClass: 'bg-muted/50',
    borderClass: 'border-muted-foreground/20',
    iconClass: 'text-muted-foreground'
  },
  integration: {
    icon: ArrowRight,
    label: 'Integration',
    bgClass: 'bg-green-500/5',
    borderClass: 'border-green-500/30',
    iconClass: 'text-green-500'
  }
};

export function CrossModuleReference({
  type,
  moduleCode,
  moduleName,
  sectionId,
  sectionTitle,
  description,
  manualPath,
  className
}: CrossModuleReferenceProps) {
  const config = referenceConfig[type];
  const Icon = config.icon;

  const handleClick = () => {
    if (manualPath) {
      // Navigate to the specific manual section
      window.location.href = `${manualPath}#${sectionId}`;
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-colors',
        config.bgClass,
        config.borderClass,
        manualPath && 'cursor-pointer hover:border-primary/50',
        className
      )}
      onClick={manualPath ? handleClick : undefined}
      role={manualPath ? 'button' : undefined}
      tabIndex={manualPath ? 0 : undefined}
    >
      <div className={cn('mt-0.5 flex-shrink-0', config.iconClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs font-medium text-primary">
            {moduleName} Manual
          </span>
        </div>
        <p className="text-sm font-medium mt-1">
          {sectionTitle}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>
      {manualPath && (
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      )}
    </div>
  );
}

// Convenience components for common reference types
export function PrerequisiteReference(props: Omit<CrossModuleReferenceProps, 'type'>) {
  return <CrossModuleReference type="prerequisite" {...props} />;
}

export function DependencyReference(props: Omit<CrossModuleReferenceProps, 'type'>) {
  return <CrossModuleReference type="dependency" {...props} />;
}

export function SeeAlsoReference(props: Omit<CrossModuleReferenceProps, 'type'>) {
  return <CrossModuleReference type="see_also" {...props} />;
}

export function IntegrationReference(props: Omit<CrossModuleReferenceProps, 'type'>) {
  return <CrossModuleReference type="integration" {...props} />;
}

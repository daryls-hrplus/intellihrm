import { Badge } from "@/components/ui/badge";
import { useReleaseLifecycle } from "@/hooks/useReleaseLifecycle";
import { Loader2 } from "lucide-react";

interface ReleaseStatusBadgeProps {
  showVersion?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ReleaseStatusBadge({ 
  showVersion = false, 
  size = 'md',
  className = '' 
}: ReleaseStatusBadgeProps) {
  const { lifecycle, isLoading, getStatusDisplay } = useReleaseLifecycle();

  if (isLoading) {
    return (
      <Badge variant="outline" className={`${className}`}>
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Loading
      </Badge>
    );
  }

  const status = getStatusDisplay();
  const baseVersion = lifecycle?.base_version || '1.0.0';

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-1.5 py-0.5' 
    : 'text-sm px-2 py-1';

  return (
    <Badge 
      variant="outline" 
      className={`${status.color} ${sizeClasses} ${className}`}
    >
      {showVersion && `v${baseVersion} • `}
      {status.label}
    </Badge>
  );
}

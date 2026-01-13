import { Badge } from "@/components/ui/badge";
import { Globe, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScopeBadgeProps {
  scope: 'global' | 'company';
  className?: string;
  showLabel?: boolean;
}

export function ScopeBadge({ scope, className, showLabel = true }: ScopeBadgeProps) {
  const isGlobal = scope === 'global';
  
  return (
    <Badge 
      variant={isGlobal ? "default" : "secondary"}
      className={cn(
        "gap-1 text-xs font-medium",
        isGlobal 
          ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20" 
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        className
      )}
    >
      {isGlobal ? (
        <Globe className="h-3 w-3" />
      ) : (
        <Building2 className="h-3 w-3" />
      )}
      {showLabel && (isGlobal ? "Global" : "Company")}
    </Badge>
  );
}

interface InheritedFromBadgeProps {
  sourceName?: string;
  className?: string;
}

export function InheritedFromBadge({ sourceName, className }: InheritedFromBadgeProps) {
  if (!sourceName) return null;
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        "gap-1 text-xs font-normal text-muted-foreground",
        className
      )}
    >
      Based on: {sourceName}
    </Badge>
  );
}

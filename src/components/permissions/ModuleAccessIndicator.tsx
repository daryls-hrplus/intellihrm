import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AccessStatus = "full" | "partial" | "none";

interface ModuleAccessIndicatorProps {
  status: AccessStatus;
  tabCount: number;
  accessibleTabCount: number;
  className?: string;
}

export function ModuleAccessIndicator({
  status,
  tabCount,
  accessibleTabCount,
  className,
}: ModuleAccessIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "full":
        return {
          icon: CheckCircle2,
          label: "Full Access",
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        };
      case "partial":
        return {
          icon: AlertCircle,
          label: "Partial",
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        };
      case "none":
        return {
          icon: XCircle,
          label: "No Access",
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className={cn("gap-1", config.className)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {accessibleTabCount}/{tabCount} tabs
      </span>
    </div>
  );
}

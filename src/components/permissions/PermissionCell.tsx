import { cn } from "@/lib/utils";
import { Check, X, Minus, Eye, EyeOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PermissionLevel = "full" | "limited" | "masked" | "view" | "configure" | "approve" | "none" | "denied" | boolean;

interface PermissionCellProps {
  level: PermissionLevel;
  label?: string;
  showTooltip?: boolean;
  size?: "sm" | "md";
}

const levelConfig: Record<string, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  full: {
    icon: <Check className="h-3.5 w-3.5" />,
    bg: "bg-success/15",
    text: "text-success",
    label: "Full Access",
  },
  approve: {
    icon: <Check className="h-3.5 w-3.5" />,
    bg: "bg-success/15",
    text: "text-success",
    label: "Approve",
  },
  configure: {
    icon: <Check className="h-3.5 w-3.5" />,
    bg: "bg-primary/15",
    text: "text-primary",
    label: "Configure",
  },
  limited: {
    icon: <Eye className="h-3.5 w-3.5" />,
    bg: "bg-warning/15",
    text: "text-warning",
    label: "Limited",
  },
  view: {
    icon: <Eye className="h-3.5 w-3.5" />,
    bg: "bg-warning/15",
    text: "text-warning",
    label: "View Only",
  },
  masked: {
    icon: <EyeOff className="h-3.5 w-3.5" />,
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: "Masked",
  },
  none: {
    icon: <Minus className="h-3.5 w-3.5" />,
    bg: "bg-transparent",
    text: "text-muted-foreground/40",
    label: "No Access",
  },
  denied: {
    icon: <X className="h-3.5 w-3.5" />,
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: "Denied",
  },
  true: {
    icon: <Check className="h-3.5 w-3.5" />,
    bg: "bg-success/15",
    text: "text-success",
    label: "Yes",
  },
  false: {
    icon: <X className="h-3.5 w-3.5" />,
    bg: "bg-transparent",
    text: "text-muted-foreground/40",
    label: "No",
  },
};

export function PermissionCell({ level, label, showTooltip = true, size = "md" }: PermissionCellProps) {
  const levelKey = String(level);
  const config = levelConfig[levelKey] || levelConfig.none;
  const displayLabel = label || config.label;

  const cell = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        config.bg,
        config.text,
        size === "sm" ? "h-6 w-6" : "h-7 w-7"
      )}
    >
      {config.icon}
    </div>
  );

  if (!showTooltip) return cell;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{cell}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {displayLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Badge version for inline display
export function PermissionBadge({ level, label }: { level: PermissionLevel; label?: string }) {
  const levelKey = String(level);
  const config = levelConfig[levelKey] || levelConfig.none;
  const displayLabel = label || config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        config.bg,
        config.text
      )}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
}

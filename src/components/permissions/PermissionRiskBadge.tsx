import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type RiskLevel = "low" | "medium" | "high";

interface PermissionRiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
  size?: "sm" | "md";
}

const riskConfig: Record<RiskLevel, { icon: React.ReactNode; bg: string; text: string; label: string; description: string }> = {
  low: {
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    bg: "bg-success/10 hover:bg-success/20",
    text: "text-success",
    label: "Low Risk",
    description: "Standard access level with appropriate permissions",
  },
  medium: {
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
    bg: "bg-warning/10 hover:bg-warning/20",
    text: "text-warning",
    label: "Medium Risk",
    description: "Elevated permissions - consider periodic review",
  },
  high: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    bg: "bg-destructive/10 hover:bg-destructive/20",
    text: "text-destructive",
    label: "High Risk",
    description: "Over-permissioned account - immediate review recommended",
  },
};

export function PermissionRiskBadge({ level, showLabel = false, size = "md" }: PermissionRiskBadgeProps) {
  const config = riskConfig[level];

  const content = (
    <Badge
      variant="outline"
      className={cn(
        "border-0 font-medium",
        config.bg,
        config.text,
        size === "sm" ? "h-5 text-[10px] px-1.5" : "h-6 text-xs px-2"
      )}
    >
      {config.icon}
      {showLabel && <span className="ml-1">{config.label}</span>}
    </Badge>
  );

  if (showLabel) return content;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Inline dot indicator
export function RiskDot({ level }: { level: RiskLevel }) {
  const colors: Record<RiskLevel, string> = {
    low: "bg-success",
    medium: "bg-warning",
    high: "bg-destructive",
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className={cn("inline-block h-2 w-2 rounded-full", colors[level])} />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {riskConfig[level].label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";

interface AIRiskBadgeProps {
  riskScore: number | null;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AIRiskBadge({ riskScore, showLabel = true, size = "md" }: AIRiskBadgeProps) {
  if (riskScore === null || riskScore === undefined) {
    return null;
  }

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: "critical", label: "Critical", color: "destructive" as const };
    if (score >= 0.6) return { level: "high", label: "High", color: "destructive" as const };
    if (score >= 0.4) return { level: "medium", label: "Medium", color: "secondary" as const };
    return { level: "low", label: "Low", color: "default" as const };
  };

  const { level, label, color } = getRiskLevel(riskScore);

  const iconSize = size === "sm" ? 12 : size === "lg" ? 20 : 16;

  const Icon = level === "critical" 
    ? ShieldAlert 
    : level === "high" 
    ? AlertTriangle 
    : level === "medium" 
    ? AlertCircle 
    : CheckCircle;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={color} className="gap-1 cursor-help">
          <Icon className={`h-${iconSize === 12 ? 3 : iconSize === 20 ? 5 : 4} w-${iconSize === 12 ? 3 : iconSize === 20 ? 5 : 4}`} />
          {showLabel && <span>{label}</span>}
          <span className="font-mono text-xs">({(riskScore * 100).toFixed(0)}%)</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>AI Risk Score: {(riskScore * 100).toFixed(1)}%</p>
        <p className="text-xs text-muted-foreground">
          {level === "critical" && "Requires immediate human review"}
          {level === "high" && "Human review recommended"}
          {level === "medium" && "Monitor for patterns"}
          {level === "low" && "Within acceptable parameters"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

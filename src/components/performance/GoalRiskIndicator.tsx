import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Ban, AlertTriangle, CheckCircle, Rocket, HelpCircle } from "lucide-react";
import type { RiskIndicator, RiskFactor } from "@/types/goalDependencies";
import { RISK_INDICATOR_LABELS, RISK_INDICATOR_COLORS } from "@/types/goalDependencies";
import { cn } from "@/lib/utils";

interface GoalRiskIndicatorProps {
  riskIndicator: RiskIndicator | null;
  riskScore?: number | null;
  riskFactors?: RiskFactor[];
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showScore?: boolean;
}

const iconMap = {
  blocked: Ban,
  at_risk: AlertTriangle,
  on_track: CheckCircle,
  accelerated: Rocket,
};

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function GoalRiskIndicator({
  riskIndicator,
  riskScore,
  riskFactors = [],
  size = "md",
  showLabel = true,
  showScore = false,
}: GoalRiskIndicatorProps) {
  if (!riskIndicator) {
    return (
      <Badge variant="outline" className="gap-1">
        <HelpCircle className={sizeClasses[size]} />
        {showLabel && <span>Not Assessed</span>}
      </Badge>
    );
  }

  const Icon = iconMap[riskIndicator];
  const label = RISK_INDICATOR_LABELS[riskIndicator];
  const colorClass = RISK_INDICATOR_COLORS[riskIndicator];

  const formatRiskFactor = (factor: RiskFactor) => {
    switch (factor.type) {
      case 'unresolved_dependencies':
        return `${factor.count} unresolved dependencies`;
      case 'critical_dependencies':
        return `${factor.count} critical dependencies`;
      case 'overdue':
        return `${factor.days_overdue} days overdue`;
      case 'deadline_risk':
        return `${factor.days_remaining} days left, ${factor.progress}% complete`;
      case 'progress_behind':
        return `Progress behind by ${factor.gap?.toFixed(0)}%`;
      case 'ahead_of_schedule':
        return `Ahead of schedule`;
      default:
        return factor.type;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("gap-1 cursor-help", colorClass)}>
            <Icon className={sizeClasses[size]} />
            {showLabel && <span>{label}</span>}
            {showScore && riskScore !== null && riskScore !== undefined && (
              <span className="ml-1 opacity-80">({riskScore.toFixed(0)})</span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{label}</p>
            {riskScore !== null && riskScore !== undefined && (
              <p className="text-sm text-muted-foreground">Risk Score: {riskScore.toFixed(0)}/100</p>
            )}
            {riskFactors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">Risk Factors:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {riskFactors.map((factor, idx) => (
                    <li key={idx}>{formatRiskFactor(factor)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

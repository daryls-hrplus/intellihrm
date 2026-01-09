import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeyOutcome {
  value: string;
  label: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
}

interface KeyOutcomeMetricsProps {
  outcomes: KeyOutcome[];
  className?: string;
}

export function KeyOutcomeMetrics({ outcomes, className }: KeyOutcomeMetricsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Key Outcomes
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {outcomes.map((outcome, index) => (
          <OutcomeCard key={index} {...outcome} />
        ))}
      </div>
    </div>
  );
}

function OutcomeCard({ value, label, description, trend = "up", icon: Icon }: KeyOutcome) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";
  
  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-card to-muted/20 p-4 text-center">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <span className="text-2xl font-bold text-primary">{value}</span>
        <TrendIcon className={cn("h-4 w-4", trendColor)} />
      </div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
  );
}

import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface OutcomeMetricProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

export function OutcomeMetric({ label, value, trend = "up", description }: OutcomeMetricProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={cn("p-2 rounded-lg", trend === "up" ? "bg-green-500/10" : trend === "down" ? "bg-red-500/10" : "bg-muted")}>
        <TrendIcon className={cn("h-4 w-4", trendColor)} />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

interface KeyOutcomesProps {
  outcomes: { label: string; value: string; trend?: "up" | "down" | "neutral" }[];
}

export function KeyOutcomes({ outcomes }: KeyOutcomesProps) {
  return (
    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium text-green-600">Key Outcomes</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {outcomes.map((outcome, index) => (
          <div key={index} className="text-center p-2 rounded-lg bg-background/50">
            <div className="text-xl font-bold text-green-600">{outcome.value}</div>
            <div className="text-xs text-muted-foreground">{outcome.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

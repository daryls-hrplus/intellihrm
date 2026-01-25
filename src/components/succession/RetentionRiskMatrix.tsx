import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetentionRiskMatrixProps {
  criticality?: string | null;
  difficulty?: string | null;
  onCellClick?: (criticality: string, difficulty: string) => void;
  selectedCriticality?: string;
  selectedDifficulty?: string;
  interactive?: boolean;
  compact?: boolean;
}

// Risk levels based on the Excel specification
const RISK_MATRIX: Record<string, Record<string, { level: string; score: number }>> = {
  most_critical: {
    difficult: { level: "high", score: 3 },
    moderate: { level: "high", score: 2 },
    easy: { level: "moderate", score: 3 },
  },
  critical: {
    difficult: { level: "high", score: 1 },
    moderate: { level: "moderate", score: 2 },
    easy: { level: "low", score: 3 },
  },
  important: {
    difficult: { level: "moderate", score: 1 },
    moderate: { level: "low", score: 2 },
    easy: { level: "low", score: 1 },
  },
};

const CRITICALITY_LABELS: Record<string, string> = {
  most_critical: "Most Critical",
  critical: "Critical",
  important: "Important",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  difficult: "Difficult",
  moderate: "Moderate",
  easy: "Easy",
};

const RISK_COLORS: Record<string, string> = {
  high: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
  moderate: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  low: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
};

const RISK_CELL_BG: Record<string, string> = {
  high: "bg-red-500/10 hover:bg-red-500/20",
  moderate: "bg-amber-500/10 hover:bg-amber-500/20",
  low: "bg-green-500/10 hover:bg-green-500/20",
};

export function getRiskLevel(criticality: string | null, difficulty: string | null): string | null {
  if (!criticality || !difficulty) return null;
  return RISK_MATRIX[criticality]?.[difficulty]?.level || null;
}

export function getRiskScore(criticality: string | null, difficulty: string | null): number | null {
  if (!criticality || !difficulty) return null;
  return RISK_MATRIX[criticality]?.[difficulty]?.score || null;
}

export function RetentionRiskBadge({ 
  criticality, 
  difficulty 
}: { 
  criticality: string | null; 
  difficulty: string | null; 
}) {
  const level = getRiskLevel(criticality, difficulty);
  if (!level) return null;

  const Icon = level === "high" ? ShieldAlert : level === "moderate" ? AlertTriangle : ShieldCheck;

  return (
    <Badge className={cn("gap-1", RISK_COLORS[level])}>
      <Icon className="h-3 w-3" />
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </Badge>
  );
}

export function RetentionRiskMatrix({
  criticality,
  difficulty,
  onCellClick,
  selectedCriticality,
  selectedDifficulty,
  interactive = false,
  compact = false,
}: RetentionRiskMatrixProps) {
  const criticalityLevels = ["most_critical", "critical", "important"];
  const difficultyLevels = ["difficult", "moderate", "easy"];

  const isSelected = (c: string, d: string) =>
    (selectedCriticality === c && selectedDifficulty === d) ||
    (criticality === c && difficulty === d);

  return (
    <Card className={cn(compact && "border-0 shadow-none")}>
      {!compact && (
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Retention Risk Matrix
          </CardTitle>
          <CardDescription>
            Position criticality vs. replacement difficulty
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={cn(!compact && "pt-0", compact && "p-0")}>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-2 border bg-muted/50 text-left font-medium">
                    Criticality \ Replacement
                  </th>
                  {difficultyLevels.map((d) => (
                    <th
                      key={d}
                      className="p-2 border bg-muted/50 text-center font-medium min-w-[100px]"
                    >
                      {DIFFICULTY_LABELS[d]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criticalityLevels.map((c) => (
                  <tr key={c}>
                    <td className="p-2 border bg-muted/30 font-medium">
                      {CRITICALITY_LABELS[c]}
                    </td>
                    {difficultyLevels.map((d) => {
                      const risk = RISK_MATRIX[c][d];
                      const selected = isSelected(c, d);
                      return (
                        <td key={d} className="p-0 border">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                disabled={!interactive}
                                onClick={() => interactive && onCellClick?.(c, d)}
                                className={cn(
                                  "w-full h-full p-3 text-center transition-colors",
                                  RISK_CELL_BG[risk.level],
                                  interactive && "cursor-pointer",
                                  !interactive && "cursor-default",
                                  selected && "ring-2 ring-primary ring-inset"
                                )}
                              >
                                <span className="font-semibold capitalize">
                                  {risk.level}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({risk.score})
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                <strong>{CRITICALITY_LABELS[c]}</strong> position +{" "}
                                <strong>{DIFFICULTY_LABELS[d]}</strong> to replace
                              </p>
                              <p className="text-muted-foreground">
                                = {risk.level.toUpperCase()} retention risk
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/30" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-500/30" />
            <span>Moderate Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-500/30" />
            <span>Low Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

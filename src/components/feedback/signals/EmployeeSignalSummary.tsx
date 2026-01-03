import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTalentSignalSnapshots } from "@/hooks/feedback/useTalentSignals";
import { SignalConfidenceIndicator } from "./SignalConfidenceIndicator";
import { SignalBiasWarning } from "./SignalBiasWarning";
import { TrendingUp, TrendingDown, Minus, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeSignalSummaryProps {
  employeeId: string;
  showStrengths?: boolean;
  showDevelopmentAreas?: boolean;
  compact?: boolean;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  leadership: "bg-purple-100 text-purple-800 border-purple-200",
  teamwork: "bg-blue-100 text-blue-800 border-blue-200",
  technical: "bg-cyan-100 text-cyan-800 border-cyan-200",
  values: "bg-green-100 text-green-800 border-green-200",
  general: "bg-gray-100 text-gray-800 border-gray-200",
};

export function EmployeeSignalSummary({
  employeeId,
  showStrengths = true,
  showDevelopmentAreas = true,
  compact = false,
  className,
}: EmployeeSignalSummaryProps) {
  const { data: signals, isLoading, error } = useTalentSignalSnapshots(employeeId);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load talent signals
        </CardContent>
      </Card>
    );
  }

  if (!signals || signals.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No talent signals available yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Signals will appear after completing a 360 feedback cycle
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall score
  const validSignals = signals.filter((s) => s.signal_value !== null);
  const overallScore =
    validSignals.length > 0
      ? validSignals.reduce((sum, s) => sum + (s.signal_value || 0), 0) / validSignals.length
      : 0;

  // Group by category
  const byCategory: Record<string, typeof signals> = {};
  signals.forEach((signal) => {
    const category = signal.signal_definition?.signal_category || "general";
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(signal);
  });

  // Identify strengths and development areas
  const strengths = signals.filter((s) => (s.signal_value || 0) >= 75);
  const developmentAreas = signals.filter((s) => (s.signal_value || 0) < 60);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Talent Signals</CardTitle>
            <div className={cn("text-2xl font-bold", getScoreColor(overallScore))}>
              {overallScore.toFixed(0)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {signals.slice(0, 4).map((signal) => (
            <div key={signal.id} className="flex items-center justify-between gap-2">
              <span className="text-sm truncate flex-1">
                {signal.signal_definition?.name || "Unknown Signal"}
              </span>
              <div className="flex items-center gap-2">
                <Progress
                  value={signal.signal_value || 0}
                  className="w-16 h-1.5"
                />
                <span className={cn("text-xs font-medium w-8 text-right", getScoreColor(signal.signal_value || 0))}>
                  {signal.signal_value?.toFixed(0)}
                </span>
              </div>
            </div>
          ))}
          {signals.length > 4 && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              +{signals.length - 4} more signals
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Talent Signals</CardTitle>
            <CardDescription>
              Based on {validSignals.length} signal{validSignals.length !== 1 ? "s" : ""} from 360 feedback
            </CardDescription>
          </div>
          <div className="text-center">
            <div className={cn("text-3xl font-bold", getScoreColor(overallScore))}>
              {overallScore.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Overall Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Signals by Category */}
        {Object.entries(byCategory).map(([category, categorySignals]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("capitalize", CATEGORY_COLORS[category] || CATEGORY_COLORS.general)}>
                {category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {categorySignals.length} signal{categorySignals.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2 pl-2">
              {categorySignals.map((signal) => (
                <div key={signal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {signal.signal_definition?.name || "Unknown Signal"}
                      </span>
                      <SignalConfidenceIndicator
                        confidence={signal.confidence_score || 0}
                        evidenceCount={signal.evidence_count}
                        size="sm"
                      />
                      {signal.bias_risk_level && signal.bias_risk_level !== "low" && (
                        <SignalBiasWarning
                          biasLevel={signal.bias_risk_level as "low" | "medium" | "high"}
                          biasFactors={Array.isArray(signal.bias_factors) ? signal.bias_factors : []}
                          variant="badge"
                        />
                      )}
                    </div>
                    <span className={cn("text-sm font-semibold", getScoreColor(signal.signal_value || 0))}>
                      {signal.signal_value?.toFixed(0) || "-"}
                    </span>
                  </div>
                  <Progress
                    value={signal.signal_value || 0}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Strengths */}
        {showStrengths && strengths.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h4 className="font-medium text-sm">Strengths</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.map((signal) => (
                <Badge key={signal.id} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {signal.signal_definition?.name} ({signal.signal_value?.toFixed(0)})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Development Areas */}
        {showDevelopmentAreas && developmentAreas.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-sm">Development Areas</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {developmentAreas.map((signal) => (
                <Badge key={signal.id} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {signal.signal_definition?.name} ({signal.signal_value?.toFixed(0)})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

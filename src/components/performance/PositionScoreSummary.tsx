import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PositionWeight } from "@/hooks/useMultiPositionParticipant";
import { BarChart3, TrendingUp, Star } from "lucide-react";

interface PositionScore {
  positionId: string;
  competency: number;
  responsibility: number;
  goal: number;
  overall: number;
}

interface PositionScoreSummaryProps {
  positions: PositionWeight[];
  positionScores: PositionScore[];
  cycleWeights: {
    competency_weight: number;
    responsibility_weight: number;
    goal_weight: number;
  };
  overallWeightedScore: number;
  mode: "aggregate" | "separate";
}

export function PositionScoreSummary({
  positions,
  positionScores,
  cycleWeights,
  overallWeightedScore,
  mode,
}: PositionScoreSummaryProps) {
  if (positions.length <= 1) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card className="border-accent/40 bg-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent-foreground" />
          Multi-Position Score Breakdown
          <Badge variant="outline" className="ml-2 text-xs">
            {mode === "aggregate" ? "Weighted Average" : "Separate Scores"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Position Scores */}
        <div className="space-y-3">
          {positions.map((position) => {
            const score = positionScores.find(s => s.positionId === position.position_id);
            const positionOverall = score?.overall || 0;
            
            return (
              <div key={position.position_id} className="p-3 rounded-lg bg-background border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{position.position_title}</span>
                    {position.is_primary && (
                      <Badge className="text-xs bg-primary/20 text-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                    {position.job_title && (
                      <span className="text-xs text-muted-foreground">
                        ({position.job_title})
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {position.weight_percentage}% weight
                    </Badge>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(positionOverall)}`}>
                    {positionOverall.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={positionOverall} 
                  className="h-2"
                />
                
                {score && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center p-1.5 rounded bg-muted/50">
                      <span className="text-muted-foreground">Competency</span>
                      <span className="font-medium">{score.competency.toFixed(1)}%</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({cycleWeights.competency_weight}% weight)
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded bg-muted/50">
                      <span className="text-muted-foreground">Responsibility</span>
                      <span className="font-medium">{score.responsibility.toFixed(1)}%</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({cycleWeights.responsibility_weight}% weight)
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded bg-muted/50">
                      <span className="text-muted-foreground">Goals</span>
                      <span className="font-medium">{score.goal.toFixed(1)}%</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({cycleWeights.goal_weight}% weight)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weighted Overall Calculation - only for aggregate mode */}
        {mode === "aggregate" && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Weighted Overall Score</span>
              </div>
              <span className="text-xl font-bold text-primary">
                {overallWeightedScore.toFixed(1)}%
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Calculated as: {positions.map((p, i) => {
                const score = positionScores.find(s => s.positionId === p.position_id);
                return (
                  <span key={p.position_id}>
                    {i > 0 && " + "}
                    ({score?.overall.toFixed(1) || 0}% × {p.weight_percentage}%)
                  </span>
                );
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

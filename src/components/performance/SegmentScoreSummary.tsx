import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RoleSegment } from "@/hooks/useAppraisalRoleSegments";
import { BarChart3, TrendingUp } from "lucide-react";

interface SegmentScore {
  segmentId: string;
  competency: number;
  responsibility: number;
  goal: number;
  overall: number;
}

interface SegmentScoreSummaryProps {
  segments: RoleSegment[];
  segmentScores: SegmentScore[];
  cycleWeights: {
    competency_weight: number;
    responsibility_weight: number;
    goal_weight: number;
  };
  overallWeightedScore: number;
}

export function SegmentScoreSummary({
  segments,
  segmentScores,
  cycleWeights,
  overallWeightedScore,
}: SegmentScoreSummaryProps) {
  if (segments.length <= 1) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Segment-Level Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Individual Segment Scores */}
        <div className="space-y-3">
          {segments.map((segment, idx) => {
            const score = segmentScores.find(s => s.segmentId === segment.id);
            const segmentOverall = score?.overall || 0;
            
            return (
              <div key={segment.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{segment.position_title}</span>
                    <Badge variant="outline" className="text-xs">
                      {segment.contribution_percentage}% weight
                    </Badge>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(segmentOverall)}`}>
                    {segmentOverall.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={segmentOverall} 
                  className="h-2"
                />
                
                {score && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center p-1.5 rounded bg-background">
                      <span className="text-muted-foreground">Competency</span>
                      <span className="font-medium">{score.competency.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded bg-background">
                      <span className="text-muted-foreground">Responsibility</span>
                      <span className="font-medium">{score.responsibility.toFixed(1)}%</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded bg-background">
                      <span className="text-muted-foreground">Goals</span>
                      <span className="font-medium">{score.goal.toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weighted Overall Calculation */}
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
            Calculated as: {segments.map((s, i) => (
              <span key={s.id}>
                {i > 0 && " + "}
                ({segmentScores.find(sc => sc.segmentId === s.id)?.overall.toFixed(1) || 0}% × {s.contribution_percentage}%)
              </span>
            ))}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

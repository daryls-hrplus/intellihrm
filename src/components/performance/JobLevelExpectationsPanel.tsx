import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { JobLevelExpectation } from "@/hooks/useJobLevelExpectations";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Award,
  Briefcase,
  Info
} from "lucide-react";
import { useState } from "react";

interface GapAnalysis {
  competencyGap: number | null;
  goalGap: number | null;
  competencyStatus: "exceeds" | "meets" | "below" | "unknown";
  goalStatus: "exceeds" | "meets" | "below" | "unknown";
}

interface EmployeeInfo {
  jobLevel: string | null;
  jobGrade: string | null;
  jobTitle: string | null;
  positionTitle: string | null;
}

interface JobLevelExpectationsPanelProps {
  expectation: JobLevelExpectation | null;
  employeeInfo: EmployeeInfo;
  gapAnalysis: GapAnalysis | null;
  currentScores: {
    competencyScore: number;
    goalScore: number;
  };
  maxRating: number;
}

export function JobLevelExpectationsPanel({
  expectation,
  employeeInfo,
  gapAnalysis,
  currentScores,
  maxRating,
}: JobLevelExpectationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!expectation) {
    // Show minimal info if no expectations defined
    if (employeeInfo.jobLevel && employeeInfo.jobGrade) {
      return (
        <Card className="border-muted bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>
                No level expectations defined for {employeeInfo.jobGrade}/{employeeInfo.jobLevel}
              </span>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "exceeds":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "meets":
        return <CheckCircle2 className="h-4 w-4 text-primary" />;
      case "below":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "exceeds":
        return <Badge className="bg-success/20 text-success border-success/30">Exceeds</Badge>;
      case "meets":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Meets</Badge>;
      case "below":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Below</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getGapColor = (gap: number | null, isPositiveGood: boolean = true) => {
    if (gap === null) return "text-muted-foreground";
    const isGood = isPositiveGood ? gap >= 0 : gap <= 0;
    if (Math.abs(gap) < 0.2) return "text-primary";
    return isGood ? "text-success" : "text-destructive";
  };

  const formatGap = (gap: number | null, suffix: string = "") => {
    if (gap === null) return "—";
    const sign = gap >= 0 ? "+" : "";
    return `${sign}${gap.toFixed(1)}${suffix}`;
  };

  // Convert score to percentage for display
  const competencyPercent = (currentScores.competencyScore / maxRating) * 100;
  const expectedCompetencyPercent = (expectation.min_competency_score / maxRating) * 100;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-accent/40 bg-gradient-to-br from-accent/5 to-transparent">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-accent/10 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-accent-foreground" />
                Level Expectations: {expectation.job_grade} / {expectation.job_level}
              </CardTitle>
              <div className="flex items-center gap-2">
                {gapAnalysis && (
                  <div className="flex items-center gap-1">
                    {getStatusIcon(gapAnalysis.competencyStatus)}
                    {getStatusIcon(gapAnalysis.goalStatus)}
                  </div>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Employee Context */}
            {employeeInfo.jobTitle && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                <span>{employeeInfo.jobTitle}</span>
                {employeeInfo.positionTitle && employeeInfo.positionTitle !== employeeInfo.jobTitle && (
                  <>
                    <span>•</span>
                    <span>{employeeInfo.positionTitle}</span>
                  </>
                )}
              </div>
            )}

            {/* Competency Comparison */}
            <div className="space-y-2 p-3 rounded-lg bg-background border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Competency Score</span>
                </div>
                {gapAnalysis && getStatusBadge(gapAnalysis.competencyStatus)}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Expected Min</div>
                  <div className="text-lg font-bold text-muted-foreground">
                    {expectation.min_competency_score.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Actual</div>
                  <div className={`text-lg font-bold ${getGapColor(gapAnalysis?.competencyGap ?? null)}`}>
                    {currentScores.competencyScore.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Gap</div>
                  <div className={`text-lg font-bold ${getGapColor(gapAnalysis?.competencyGap ?? null)}`}>
                    {formatGap(gapAnalysis?.competencyGap ?? null)}
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="relative pt-2">
                <Progress value={competencyPercent} className="h-2" />
                {/* Expected threshold marker */}
                <div 
                  className="absolute top-2 h-2 w-0.5 bg-destructive"
                  style={{ left: `${expectedCompetencyPercent}%` }}
                />
                <div 
                  className="absolute -top-1 text-[10px] text-muted-foreground transform -translate-x-1/2"
                  style={{ left: `${expectedCompetencyPercent}%` }}
                >
                  Min
                </div>
              </div>
            </div>

            {/* Goal Achievement Comparison */}
            <div className="space-y-2 p-3 rounded-lg bg-background border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Goal Achievement</span>
                </div>
                {gapAnalysis && getStatusBadge(gapAnalysis.goalStatus)}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Expected Min</div>
                  <div className="text-lg font-bold text-muted-foreground">
                    {expectation.min_goal_achievement_percent}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Actual</div>
                  <div className={`text-lg font-bold ${getGapColor(gapAnalysis?.goalGap ?? null)}`}>
                    {currentScores.goalScore.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Gap</div>
                  <div className={`text-lg font-bold ${getGapColor(gapAnalysis?.goalGap ?? null)}`}>
                    {formatGap(gapAnalysis?.goalGap ?? null, "%")}
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="relative pt-2">
                <Progress value={Math.min(currentScores.goalScore, 100)} className="h-2" />
                {/* Expected threshold marker */}
                <div 
                  className="absolute top-2 h-2 w-0.5 bg-destructive"
                  style={{ left: `${expectation.min_goal_achievement_percent}%` }}
                />
                <div 
                  className="absolute -top-1 text-[10px] text-muted-foreground transform -translate-x-1/2"
                  style={{ left: `${expectation.min_goal_achievement_percent}%` }}
                >
                  Min
                </div>
              </div>
            </div>

            {/* Progression Criteria */}
            {expectation.progression_criteria && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Progression Criteria</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {expectation.progression_criteria}
                </p>
              </div>
            )}

            {/* Summary */}
            {gapAnalysis && (
              <div className={`p-3 rounded-lg border ${
                gapAnalysis.competencyStatus === "below" || gapAnalysis.goalStatus === "below"
                  ? "bg-destructive/5 border-destructive/20"
                  : gapAnalysis.competencyStatus === "exceeds" && gapAnalysis.goalStatus === "exceeds"
                    ? "bg-success/5 border-success/20"
                    : "bg-primary/5 border-primary/20"
              }`}>
                <div className="text-sm">
                  {gapAnalysis.competencyStatus === "below" || gapAnalysis.goalStatus === "below" ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Performance is below level expectations. 
                        {gapAnalysis.competencyStatus === "below" && " Competency score needs improvement."}
                        {gapAnalysis.goalStatus === "below" && " Goal achievement needs improvement."}
                      </span>
                    </div>
                  ) : gapAnalysis.competencyStatus === "exceeds" && gapAnalysis.goalStatus === "exceeds" ? (
                    <div className="flex items-center gap-2 text-success">
                      <TrendingUp className="h-4 w-4" />
                      <span>Performance exceeds all level expectations. Consider for advancement.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Performance meets level expectations.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

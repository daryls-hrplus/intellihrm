import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface CapabilityRequirement {
  id: string;
  capability_id: string;
  capability: {
    id: string;
    name: string;
    code: string;
    type: "SKILL" | "COMPETENCY";
    category: string;
  };
  required_level: number;
  is_mandatory: boolean;
  weight: number;
}

interface EmployeeCapability {
  capability_id: string;
  current_level: number;
  confidence_score: number;
  validation_status: string;
}

interface GapItem {
  capability: CapabilityRequirement["capability"];
  required_level: number;
  current_level: number;
  gap: number;
  is_mandatory: boolean;
  weight: number;
  gapPercentage: number;
  status: "exceeds" | "meets" | "gap" | "missing";
}

interface CapabilityGapAnalysisCardProps {
  requirements: CapabilityRequirement[];
  employeeCapabilities: EmployeeCapability[];
  jobTitle?: string;
  onViewLearning?: (capabilityId: string) => void;
  onRequestTraining?: (capabilityId: string) => void;
}

export function CapabilityGapAnalysisCard({
  requirements,
  employeeCapabilities,
  jobTitle,
  onViewLearning,
  onRequestTraining,
}: CapabilityGapAnalysisCardProps) {
  const analysis = useMemo(() => {
    const gaps: GapItem[] = requirements.map((req) => {
      const employeeCap = employeeCapabilities.find(
        (ec) => ec.capability_id === req.capability_id
      );
      const currentLevel = employeeCap?.current_level || 0;
      const gap = req.required_level - currentLevel;
      const gapPercentage = req.required_level > 0 
        ? Math.min(100, (currentLevel / req.required_level) * 100) 
        : 100;

      let status: GapItem["status"];
      if (currentLevel === 0) {
        status = "missing";
      } else if (gap > 0) {
        status = "gap";
      } else if (gap < 0) {
        status = "exceeds";
      } else {
        status = "meets";
      }

      return {
        capability: req.capability,
        required_level: req.required_level,
        current_level: currentLevel,
        gap,
        is_mandatory: req.is_mandatory,
        weight: req.weight,
        gapPercentage,
        status,
      };
    });

    // Sort: mandatory gaps first, then by gap size
    gaps.sort((a, b) => {
      if (a.is_mandatory !== b.is_mandatory) {
        return a.is_mandatory ? -1 : 1;
      }
      return b.gap - a.gap;
    });

    const mandatoryGaps = gaps.filter(g => g.is_mandatory && g.gap > 0);
    const optionalGaps = gaps.filter(g => !g.is_mandatory && g.gap > 0);
    const strengths = gaps.filter(g => g.status === "exceeds" || g.status === "meets");
    const missingCapabilities = gaps.filter(g => g.status === "missing");

    // Calculate overall readiness
    const totalWeight = gaps.reduce((sum, g) => sum + g.weight, 0);
    const weightedScore = gaps.reduce((sum, g) => {
      const score = Math.min(1, g.current_level / Math.max(1, g.required_level));
      return sum + score * g.weight;
    }, 0);
    const overallReadiness = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;

    return {
      gaps,
      mandatoryGaps,
      optionalGaps,
      strengths,
      missingCapabilities,
      overallReadiness,
      totalRequirements: requirements.length,
    };
  }, [requirements, employeeCapabilities]);

  const getStatusIcon = (status: GapItem["status"]) => {
    switch (status) {
      case "exceeds":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "meets":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "gap":
        return <TrendingDown className="h-4 w-4 text-amber-600" />;
      case "missing":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: GapItem["status"]) => {
    switch (status) {
      case "exceeds":
        return <Badge className="bg-green-500/10 text-green-600 text-xs">Exceeds</Badge>;
      case "meets":
        return <Badge className="bg-green-500/10 text-green-600 text-xs">Meets</Badge>;
      case "gap":
        return <Badge className="bg-amber-500/10 text-amber-600 text-xs">Gap</Badge>;
      case "missing":
        return <Badge className="bg-destructive/10 text-destructive text-xs">Missing</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "text-blue-600",
      functional: "text-purple-600",
      behavioral: "text-orange-600",
      leadership: "text-emerald-600",
      core: "text-slate-600",
    };
    return colors[category] || colors.core;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Capability Gap Analysis
            </CardTitle>
            {jobTitle && (
              <p className="text-sm text-muted-foreground mt-1">
                vs. {jobTitle} requirements
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall Readiness</p>
            <p className={`text-2xl font-bold ${
              analysis.overallReadiness >= 80 
                ? "text-green-600" 
                : analysis.overallReadiness >= 60 
                ? "text-amber-600" 
                : "text-destructive"
            }`}>
              {Math.round(analysis.overallReadiness)}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-2 rounded-lg bg-green-500/10 text-center">
            <p className="text-lg font-semibold text-green-600">{analysis.strengths.length}</p>
            <p className="text-xs text-muted-foreground">Met/Exceeded</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-center">
            <p className="text-lg font-semibold text-amber-600">
              {analysis.mandatoryGaps.length + analysis.optionalGaps.length}
            </p>
            <p className="text-xs text-muted-foreground">Gaps</p>
          </div>
          <div className="p-2 rounded-lg bg-destructive/10 text-center">
            <p className="text-lg font-semibold text-destructive">{analysis.missingCapabilities.length}</p>
            <p className="text-xs text-muted-foreground">Missing</p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-center">
            <p className="text-lg font-semibold text-primary">{analysis.totalRequirements}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Critical Gaps Alert */}
        {analysis.mandatoryGaps.length > 0 && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {analysis.mandatoryGaps.length} Critical Gap{analysis.mandatoryGaps.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.mandatoryGaps.slice(0, 3).map((gap) => (
                <Badge key={gap.capability.id} variant="outline" className="text-xs text-destructive border-destructive/30">
                  {gap.capability.name}
                </Badge>
              ))}
              {analysis.mandatoryGaps.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{analysis.mandatoryGaps.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Detailed Gap List */}
        <ScrollArea className="h-[300px] pr-3">
          <div className="space-y-2">
            {analysis.gaps.map((gap) => (
              <div
                key={gap.capability.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {gap.capability.type === "SKILL" ? (
                        <Target className={`h-4 w-4 ${getCategoryColor(gap.capability.category)}`} />
                      ) : (
                        <Brain className={`h-4 w-4 ${getCategoryColor(gap.capability.category)}`} />
                      )}
                      <span className="text-sm font-medium truncate">{gap.capability.name}</span>
                      {gap.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Level {gap.current_level} of {gap.required_level}</span>
                        <span>{Math.round(gap.gapPercentage)}%</span>
                      </div>
                      <Progress 
                        value={gap.gapPercentage} 
                        className={`h-2 ${
                          gap.status === "exceeds" || gap.status === "meets"
                            ? "[&>div]:bg-green-500"
                            : gap.status === "gap"
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-destructive"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(gap.status)}
                    
                    {/* Action Buttons for Gaps */}
                    {(gap.status === "gap" || gap.status === "missing") && (
                      <div className="flex gap-1">
                        {onViewLearning && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => onViewLearning(gap.capability.id)}
                          >
                            <GraduationCap className="h-3 w-3 mr-1" />
                            Learn
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gap Details */}
                {gap.gap !== 0 && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {getStatusIcon(gap.status)}
                    <span className="text-muted-foreground">
                      {gap.status === "exceeds" && `Exceeds requirement by ${Math.abs(gap.gap)} level(s)`}
                      {gap.status === "meets" && "Meets requirement"}
                      {gap.status === "gap" && `${gap.gap} level(s) below requirement`}
                      {gap.status === "missing" && `Missing - needs ${gap.required_level} level(s)`}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {analysis.gaps.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No capability requirements defined</p>
                <p className="text-xs">Link capabilities to the job profile to enable gap analysis</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Development Recommendations */}
        {(analysis.mandatoryGaps.length > 0 || analysis.optionalGaps.length > 0) && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Development Path</span>
              {onRequestTraining && analysis.mandatoryGaps.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRequestTraining(analysis.mandatoryGaps[0].capability.id)}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  View Learning Path
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

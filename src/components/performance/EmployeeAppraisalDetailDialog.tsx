import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobLevelExpectationsPanel } from "./JobLevelExpectationsPanel";
import { RoleSegmentTimeline } from "./RoleSegmentTimeline";
import { PositionScoreSummary } from "./PositionScoreSummary";
import { useEmployeeLevelExpectations } from "@/hooks/useEmployeeLevelExpectations";
import { useAppraisalRoleSegments, RoleSegment } from "@/hooks/useAppraisalRoleSegments";
import { useMultiPositionParticipant } from "@/hooks/useMultiPositionParticipant";
import { supabase } from "@/integrations/supabase/client";
import { 
  Target, 
  Award, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  BarChart3,
  User
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface AppraisalDetails {
  id: string;
  cycle_id: string;
  cycle_name: string;
  evaluator_name: string | null;
  status: string;
  overall_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  goal_score: number | null;
  evaluation_deadline: string | null;
  employee_comments?: string | null;
  final_comments?: string | null;
  has_role_change?: boolean;
  role_segments?: any;
}

interface CycleDetails {
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  min_rating: number;
  max_rating: number;
  start_date: string;
  end_date: string;
  multi_position_mode: string | null;
}

interface EmployeeAppraisalDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: AppraisalDetails | null;
  employeeId: string;
  companyId: string;
}

export function EmployeeAppraisalDetailDialog({
  open,
  onOpenChange,
  appraisal,
  employeeId,
  companyId,
}: EmployeeAppraisalDetailDialogProps) {
  const [cycleDetails, setCycleDetails] = useState<CycleDetails | null>(null);
  const [roleSegments, setRoleSegments] = useState<RoleSegment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | undefined>();
  
  const { fetchSegments } = useAppraisalRoleSegments();
  const { 
    hasMultiplePositions, 
    positions: multiPositions, 
    multiPositionMode,
    loading: mpLoading 
  } = useMultiPositionParticipant(
    appraisal?.id || null,
    appraisal?.cycle_id || null
  );

  // Calculate current scores for gap analysis
  const currentScores = {
    competencyScore: appraisal?.competency_score ?? null,
    goalScore: appraisal?.goal_score ?? null,
  };

  const { expectation, employeeInfo, gapAnalysis, loading: expectationsLoading } = 
    useEmployeeLevelExpectations(employeeId, companyId, currentScores);

  // Fetch cycle details
  useEffect(() => {
    const fetchCycleDetails = async () => {
      if (!appraisal?.cycle_id) return;
      
      const { data } = await supabase
        .from("appraisal_cycles")
        .select(`
          competency_weight,
          responsibility_weight,
          goal_weight,
          min_rating,
          max_rating,
          start_date,
          end_date,
          multi_position_mode
        `)
        .eq("id", appraisal.cycle_id)
        .single();
      
      if (data) {
        setCycleDetails(data);
      }
    };

    if (open && appraisal) {
      fetchCycleDetails();
    }
  }, [open, appraisal?.cycle_id]);

  // Fetch role segments if employee had role changes
  useEffect(() => {
    const loadRoleSegments = async () => {
      if (!appraisal?.id || !appraisal.has_role_change) {
        setRoleSegments([]);
        return;
      }
      
      const segments = await fetchSegments(appraisal.id);
      setRoleSegments(segments);
      if (segments.length > 0) {
        setActiveSegmentId(segments[segments.length - 1].id);
      }
    };

    if (open && appraisal) {
      loadRoleSegments();
    }
  }, [open, appraisal?.id, appraisal?.has_role_change, fetchSegments]);

  if (!appraisal) return null;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      pending: "bg-muted text-muted-foreground",
      in_progress: "bg-info/10 text-info",
      submitted: "bg-warning/10 text-warning",
      reviewed: "bg-success/10 text-success",
      finalized: "bg-success/10 text-success",
    };
    return classes[status] || "bg-muted text-muted-foreground";
  };

  // Build position scores for PositionScoreSummary
  const positionScores = multiPositions.map(p => ({
    positionId: p.position_id,
    competency: p.competency_score || 0,
    responsibility: p.responsibility_score || 0,
    goal: p.goal_score || 0,
    overall: p.overall_score || 0,
  }));

  const hasRoleChanges = appraisal.has_role_change && roleSegments.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Appraisal Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Appraisal Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{appraisal.cycle_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Evaluator: {appraisal.evaluator_name || "Not assigned"}</span>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeClass(appraisal.status)}>
                    {appraisal.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {cycleDetails && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(parseISO(cycleDetails.start_date), "MMM d, yyyy")} - {format(parseISO(cycleDetails.end_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    {appraisal.evaluation_deadline && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Deadline: {format(parseISO(appraisal.evaluation_deadline), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Overall Score Display */}
                <div className="grid gap-4 md:grid-cols-4">
                  <ScoreCard 
                    label="Competency" 
                    score={appraisal.competency_score} 
                    weight={cycleDetails?.competency_weight}
                    icon={<Award className="h-5 w-5" />}
                  />
                  <ScoreCard 
                    label="Responsibility" 
                    score={appraisal.responsibility_score} 
                    weight={cycleDetails?.responsibility_weight}
                    icon={<Briefcase className="h-5 w-5" />}
                  />
                  <ScoreCard 
                    label="Goals" 
                    score={appraisal.goal_score} 
                    weight={cycleDetails?.goal_weight}
                    icon={<Target className="h-5 w-5" />}
                  />
                  <ScoreCard 
                    label="Overall" 
                    score={appraisal.overall_score}
                    isOverall
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content for Complex Scenarios */}
            <Tabs defaultValue="expectations" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expectations" className="gap-1">
                  <Target className="h-4 w-4" />
                  Level Expectations
                </TabsTrigger>
                <TabsTrigger 
                  value="roles" 
                  className="gap-1"
                  disabled={!hasRoleChanges}
                >
                  <Briefcase className="h-4 w-4" />
                  Role Changes
                  {hasRoleChanges && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {roleSegments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="positions" 
                  className="gap-1"
                  disabled={!hasMultiplePositions}
                >
                  <BarChart3 className="h-4 w-4" />
                  Positions
                  {hasMultiplePositions && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {multiPositions.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Job Level Expectations Tab */}
              <TabsContent value="expectations" className="mt-4 space-y-4">
                {expectationsLoading ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Loading expectations...
                    </CardContent>
                  </Card>
                ) : (
                  <JobLevelExpectationsPanel
                    expectation={expectation}
                    employeeInfo={employeeInfo}
                    gapAnalysis={gapAnalysis}
                    currentScores={{
                      competencyScore: appraisal.competency_score || 0,
                      goalScore: appraisal.goal_score || 0,
                    }}
                    maxRating={cycleDetails?.max_rating || 5}
                  />
                )}

                {/* Progression Status Summary */}
                {gapAnalysis && (
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Performance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className={`p-3 rounded-lg border ${
                          gapAnalysis.competencyStatus === "exceeds" 
                            ? "bg-success/5 border-success/20" 
                            : gapAnalysis.competencyStatus === "meets"
                              ? "bg-primary/5 border-primary/20"
                              : gapAnalysis.competencyStatus === "below"
                                ? "bg-destructive/5 border-destructive/20"
                                : "bg-muted"
                        }`}>
                          <div className="text-sm font-medium">Competency vs Level</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {gapAnalysis.competencyStatus === "exceeds" && "Exceeding expectations for your level"}
                            {gapAnalysis.competencyStatus === "meets" && "Meeting expectations for your level"}
                            {gapAnalysis.competencyStatus === "below" && "Below expectations for your level"}
                            {gapAnalysis.competencyStatus === "unknown" && "Awaiting evaluation"}
                          </div>
                        </div>
                        <div className={`p-3 rounded-lg border ${
                          gapAnalysis.goalStatus === "exceeds" 
                            ? "bg-success/5 border-success/20" 
                            : gapAnalysis.goalStatus === "meets"
                              ? "bg-primary/5 border-primary/20"
                              : gapAnalysis.goalStatus === "below"
                                ? "bg-destructive/5 border-destructive/20"
                                : "bg-muted"
                        }`}>
                          <div className="text-sm font-medium">Goals vs Level</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {gapAnalysis.goalStatus === "exceeds" && "Exceeding goal expectations for your level"}
                            {gapAnalysis.goalStatus === "meets" && "Meeting goal expectations for your level"}
                            {gapAnalysis.goalStatus === "below" && "Below goal expectations for your level"}
                            {gapAnalysis.goalStatus === "unknown" && "Awaiting evaluation"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Role Changes Tab */}
              <TabsContent value="roles" className="mt-4 space-y-4">
                {hasRoleChanges ? (
                  <>
                    <RoleSegmentTimeline
                      segments={roleSegments}
                      activeSegmentId={activeSegmentId}
                      onSegmentClick={setActiveSegmentId}
                    />

                    {/* Active Segment Details */}
                    {activeSegmentId && (
                      <SegmentDetailCard 
                        segment={roleSegments.find(s => s.id === activeSegmentId)}
                      />
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No role changes during this review period</p>
                      <p className="text-sm mt-1">You held the same position throughout</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Multi-Position Tab */}
              <TabsContent value="positions" className="mt-4 space-y-4">
                {hasMultiplePositions && cycleDetails ? (
                  <PositionScoreSummary
                    positions={multiPositions}
                    positionScores={positionScores}
                    cycleWeights={{
                      competency_weight: cycleDetails.competency_weight,
                      responsibility_weight: cycleDetails.responsibility_weight,
                      goal_weight: cycleDetails.goal_weight,
                    }}
                    overallWeightedScore={appraisal.overall_score || 0}
                    mode={multiPositionMode}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Single position evaluation</p>
                      <p className="text-sm mt-1">You hold one position in this cycle</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            {(appraisal.employee_comments || appraisal.final_comments) && (
              <>
                <Separator />
                <div className="space-y-4">
                  {appraisal.employee_comments && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Your Comments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {appraisal.employee_comments}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  {appraisal.final_comments && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Manager's Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {appraisal.final_comments}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function ScoreCard({ 
  label, 
  score, 
  weight, 
  isOverall = false,
  icon 
}: { 
  label: string; 
  score: number | null; 
  weight?: number;
  isOverall?: boolean;
  icon: React.ReactNode;
}) {
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className={`p-3 rounded-lg border ${isOverall ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'}`}>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm">{label}</span>
        {weight && <span className="text-xs">({weight}%)</span>}
      </div>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score !== null ? `${score.toFixed(1)}%` : "—"}
      </div>
      {score !== null && (
        <Progress value={score} className="h-1.5 mt-2" />
      )}
    </div>
  );
}

function SegmentDetailCard({ segment }: { segment?: RoleSegment }) {
  if (!segment) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          {segment.position_title}
          <Badge variant="outline" className="text-xs ml-auto">
            {segment.contribution_percentage}% weight
          </Badge>
        </CardTitle>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(parseISO(segment.segment_start_date), "MMM d, yyyy")} - {format(parseISO(segment.segment_end_date), "MMM d, yyyy")}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {segment.responsibilities && segment.responsibilities.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Responsibilities</div>
            <div className="flex flex-wrap gap-1">
              {segment.responsibilities.map((r: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {r.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {segment.competencies && segment.competencies.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Competencies</div>
            <div className="flex flex-wrap gap-1">
              {segment.competencies.map((c: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {segment.goals && segment.goals.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Goals</div>
            <div className="flex flex-wrap gap-1">
              {segment.goals.map((g: any, idx: number) => (
                <Badge key={idx} className="text-xs bg-primary/10 text-primary">
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

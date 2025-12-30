import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  Star,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  MessageSquare,
  ClipboardList,
} from "lucide-react";
import type { MyAppraisal } from "@/hooks/useMyAppraisals";
import { useAppraisalActionExecutions } from "@/hooks/useAppraisalActionRules";

interface EssAppraisalDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: MyAppraisal;
}

export function EssAppraisalDetailDialog({
  open,
  onOpenChange,
  appraisal,
}: EssAppraisalDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { pendingExecutions, mandatoryPending, isLoading: actionsLoading } = useAppraisalActionExecutions(appraisal.id);

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-blue-600";
    if (score >= 2) return "text-amber-600";
    return "text-red-600";
  };

  const renderStars = (score: number | null, max: number = 5) => {
    if (score === null) return <span className="text-muted-foreground">Not rated</span>;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < Math.round(score) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className={`ml-2 text-lg font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      pending: { variant: "secondary", label: "Pending" },
      in_progress: { variant: "default", label: "In Progress" },
      submitted: { variant: "default", label: "Submitted" },
      reviewed: { variant: "default", label: "Reviewed" },
      completed: { variant: "default", label: "Completed" },
      acknowledged: { variant: "default", label: "Acknowledged" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ClipboardList className="h-6 w-6 text-primary" />
            {appraisal.cycle_name}
          </DialogTitle>
        </DialogHeader>

        {/* Header Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(appraisal.cycle_start_date), "MMM d, yyyy")} - {format(new Date(appraisal.cycle_end_date), "MMM d, yyyy")}
          </span>
          {appraisal.evaluator_name && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Evaluator: {appraisal.evaluator_name}
            </span>
          )}
          {getStatusBadge(appraisal.status)}
        </div>

        {/* Pending Actions Alert */}
        {mandatoryPending.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {mandatoryPending.length} required action(s) to complete for this appraisal.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="actions">
              Actions
              {pendingExecutions.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {pendingExecutions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Overall Score */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Overall Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {renderStars(appraisal.overall_score)}
                  {appraisal.overall_score !== null && (
                    <Progress 
                      value={(appraisal.overall_score / 5) * 100} 
                      className="flex-1 h-3" 
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-pink-500" />
                      <span className="font-medium">Goals</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(appraisal.goal_score)}`}>
                      {appraisal.goal_score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  {appraisal.goal_score !== null && (
                    <Progress value={(appraisal.goal_score / 5) * 100} className="mt-2 h-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Competencies</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(appraisal.competency_score)}`}>
                      {appraisal.competency_score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  {appraisal.competency_score !== null && (
                    <Progress value={(appraisal.competency_score / 5) * 100} className="mt-2 h-2" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Responsibilities</span>
                    </div>
                    <span className={`text-lg font-bold ${getScoreColor(appraisal.responsibility_score)}`}>
                      {appraisal.responsibility_score?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                  {appraisal.responsibility_score !== null && (
                    <Progress value={(appraisal.responsibility_score / 5) * 100} className="mt-2 h-2" />
                  )}
                </CardContent>
              </Card>

              {appraisal.position_title && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-5 w-5" />
                      <span>Position: {appraisal.position_title}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cycle Period</span>
                    <span>
                      {format(new Date(appraisal.cycle_start_date), "MMM d, yyyy")} - {format(new Date(appraisal.cycle_end_date), "MMM d, yyyy")}
                    </span>
                  </div>
                  {appraisal.evaluation_deadline && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Evaluation Deadline</span>
                      <span>{format(new Date(appraisal.evaluation_deadline), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {appraisal.submitted_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Self-Assessment Submitted</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {format(new Date(appraisal.submitted_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                  {appraisal.reviewed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Manager Review</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {format(new Date(appraisal.reviewed_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Goals */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-pink-500" />
                      Goals Performance
                    </h4>
                    <span className={`font-bold ${getScoreColor(appraisal.goal_score)}`}>
                      {appraisal.goal_score?.toFixed(1) || "Not Rated"}
                    </span>
                  </div>
                  {appraisal.goal_score !== null && (
                    <Progress value={(appraisal.goal_score / 5) * 100} className="h-3" />
                  )}
                </div>

                <Separator />

                {/* Competencies */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      Competency Assessment
                    </h4>
                    <span className={`font-bold ${getScoreColor(appraisal.competency_score)}`}>
                      {appraisal.competency_score?.toFixed(1) || "Not Rated"}
                    </span>
                  </div>
                  {appraisal.competency_score !== null && (
                    <Progress value={(appraisal.competency_score / 5) * 100} className="h-3" />
                  )}
                </div>

                <Separator />

                {/* Responsibilities */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Key Responsibilities
                    </h4>
                    <span className={`font-bold ${getScoreColor(appraisal.responsibility_score)}`}>
                      {appraisal.responsibility_score?.toFixed(1) || "Not Rated"}
                    </span>
                  </div>
                  {appraisal.responsibility_score !== null && (
                    <Progress value={(appraisal.responsibility_score / 5) * 100} className="h-3" />
                  )}
                </div>

                <Separator />

                {/* Overall */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      Final Overall Score
                    </h4>
                    <span className={`text-xl font-bold ${getScoreColor(appraisal.overall_score)}`}>
                      {appraisal.overall_score?.toFixed(1) || "Not Rated"}
                    </span>
                  </div>
                  {appraisal.overall_score !== null && (
                    <Progress value={(appraisal.overall_score / 5) * 100} className="h-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4 mt-4">
            {appraisal.final_comments || appraisal.employee_comments ? (
              <>
                {appraisal.final_comments && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                        Manager's Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {appraisal.final_comments}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {appraisal.employee_comments && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        Your Comments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {appraisal.employee_comments}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Feedback Yet</h3>
                  <p className="text-muted-foreground">
                    Feedback will appear here once it's been provided.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4 mt-4">
            {actionsLoading ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Loading actions...</p>
                </CardContent>
              </Card>
            ) : pendingExecutions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500/50 mb-4" />
                  <h3 className="text-lg font-medium">No Pending Actions</h3>
                  <p className="text-muted-foreground">
                    All required actions have been completed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingExecutions.map((execution) => (
                  <Card key={execution.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{execution.rule?.rule_name}</span>
                            {execution.rule?.action_is_mandatory ? (
                              <Badge variant="destructive">Required</Badge>
                            ) : (
                              <Badge variant="secondary">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {execution.rule?.action_description || execution.rule?.action_message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Triggered on {format(new Date(execution.triggered_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

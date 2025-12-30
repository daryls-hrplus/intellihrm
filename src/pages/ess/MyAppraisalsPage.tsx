import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Star,
  Calendar,
  User,
  Target,
  FileText,
  Eye,
  ClipboardEdit,
  Shield
} from "lucide-react";
import { useMyActiveAppraisals, type MyAppraisal } from "@/hooks/useMyAppraisals";
import { EssAppraisalDetailDialog } from "@/components/ess/EssAppraisalDetailDialog";
import { EssPIPStatusCard } from "@/components/ess/EssPIPStatusCard";
import { EssAppraisalSelfAssessmentDialog } from "@/components/ess/EssAppraisalSelfAssessmentDialog";
import { EssAppraisalAcknowledgmentDialog } from "@/components/ess/EssAppraisalAcknowledgmentDialog";
export default function MyAppraisalsPage() {
  const { t } = useTranslation();
  const { 
    appraisals, 
    active, 
    completed, 
    pendingSelfAssessment,
    pendingAcknowledgment,
    isLoading: appraisalsLoading 
  } = useMyActiveAppraisals();
  
  const [selectedAppraisal, setSelectedAppraisal] = useState<MyAppraisal | null>(null);
  const [selfAssessmentAppraisal, setSelfAssessmentAppraisal] = useState<MyAppraisal | null>(null);
  const [acknowledgmentAppraisal, setAcknowledgmentAppraisal] = useState<MyAppraisal | null>(null);
  const [activeTab, setActiveTab] = useState("current");

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
            className={`h-4 w-4 ${i < Math.round(score) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className={`ml-1 font-medium ${getScoreColor(score)}`}>{score.toFixed(1)}</span>
      </div>
    );
  };

  if (appraisalsLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: "My Appraisals" },
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            My Appraisals
          </h1>
          <p className="text-muted-foreground">
            View and manage your performance appraisals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{active.length}</p>
                  <p className="text-sm text-muted-foreground">Active Appraisals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingSelfAssessment.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Self-Assessment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completed.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PIP Status (if any) */}
        <EssPIPStatusCard />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current ({active.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completed.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Current Appraisals Tab */}
          <TabsContent value="current" className="space-y-4">
            {active.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Active Appraisals</h3>
                  <p className="text-muted-foreground">You don't have any active appraisal cycles.</p>
                </CardContent>
              </Card>
            ) : (
              active.map((appraisal) => (
                <Card key={appraisal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{appraisal.cycle_name}</h3>
                          {getStatusBadge(appraisal.status)}
                          {appraisal.mandatory_actions_count > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {appraisal.mandatory_actions_count} Required Actions
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                          {appraisal.position_title && (
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {appraisal.position_title}
                            </span>
                          )}
                        </div>

                        {/* Score Summary */}
                        {appraisal.overall_score !== null && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Overall</p>
                              {renderStars(appraisal.overall_score)}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Goals</p>
                              {renderStars(appraisal.goal_score)}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Competencies</p>
                              {renderStars(appraisal.competency_score)}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Responsibilities</p>
                              {renderStars(appraisal.responsibility_score)}
                            </div>
                          </div>
                        )}

                        {/* Progress indicator for self-assessment */}
                        {!appraisal.submitted_at && (
                          <div className="mt-4">
                            <p className="text-sm text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Self-assessment not submitted
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Self-Assessment Button */}
                        {!appraisal.submitted_at && (appraisal.status === "pending" || appraisal.status === "draft" || appraisal.status === "in_progress") && (
                          <Button 
                            onClick={() => setSelfAssessmentAppraisal(appraisal)}
                          >
                            <ClipboardEdit className="h-4 w-4 mr-2" />
                            {appraisal.status === "in_progress" ? "Continue" : "Self-Assess"}
                          </Button>
                        )}
                        {/* Acknowledge Button */}
                        {appraisal.overall_score !== null && appraisal.status !== "acknowledged" && appraisal.reviewed_at && (
                          <Button 
                            variant="outline"
                            onClick={() => setAcknowledgmentAppraisal(appraisal)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedAppraisal(appraisal)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completed.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Completed Appraisals</h3>
                  <p className="text-muted-foreground">Your completed appraisals will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              completed.map((appraisal) => (
                <Card key={appraisal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{appraisal.cycle_name}</h3>
                          {getStatusBadge(appraisal.status)}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(appraisal.cycle_start_date), "MMM d, yyyy")} - {format(new Date(appraisal.cycle_end_date), "MMM d, yyyy")}
                          </span>
                          {appraisal.evaluator_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {appraisal.evaluator_name}
                            </span>
                          )}
                        </div>

                        {/* Final Score Summary */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="col-span-2 md:col-span-1">
                            <p className="text-xs text-muted-foreground font-medium">Final Score</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress 
                                value={(appraisal.overall_score || 0) * 20} 
                                className="h-2 flex-1" 
                              />
                              <span className={`font-bold ${getScoreColor(appraisal.overall_score)}`}>
                                {appraisal.overall_score?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Goals</p>
                            <p className={`font-medium ${getScoreColor(appraisal.goal_score)}`}>
                              {appraisal.goal_score?.toFixed(1) || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Competencies</p>
                            <p className={`font-medium ${getScoreColor(appraisal.competency_score)}`}>
                              {appraisal.competency_score?.toFixed(1) || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Responsibilities</p>
                            <p className={`font-medium ${getScoreColor(appraisal.responsibility_score)}`}>
                              {appraisal.responsibility_score?.toFixed(1) || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        onClick={() => setSelectedAppraisal(appraisal)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appraisal History</CardTitle>
              </CardHeader>
              <CardContent>
                {appraisals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No appraisal history available.</p>
                ) : (
                  <div className="space-y-4">
                    {appraisals.map((appraisal) => (
                      <div 
                        key={appraisal.id} 
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{appraisal.cycle_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appraisal.cycle_start_date), "MMM yyyy")} - {format(new Date(appraisal.cycle_end_date), "MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {appraisal.overall_score !== null && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Score</p>
                              <p className={`font-bold ${getScoreColor(appraisal.overall_score)}`}>
                                {appraisal.overall_score.toFixed(1)}
                              </p>
                            </div>
                          )}
                          {getStatusBadge(appraisal.status)}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedAppraisal(appraisal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {selectedAppraisal && (
        <EssAppraisalDetailDialog
          open={!!selectedAppraisal}
          onOpenChange={(open) => !open && setSelectedAppraisal(null)}
          appraisal={selectedAppraisal}
        />
      )}


      {selfAssessmentAppraisal && (
        <EssAppraisalSelfAssessmentDialog
          open={!!selfAssessmentAppraisal}
          onOpenChange={(open) => !open && setSelfAssessmentAppraisal(null)}
          appraisal={selfAssessmentAppraisal}
        />
      )}

      {acknowledgmentAppraisal && acknowledgmentAppraisal.company_id && (
        <EssAppraisalAcknowledgmentDialog
          open={!!acknowledgmentAppraisal}
          onOpenChange={(open) => !open && setAcknowledgmentAppraisal(null)}
          appraisal={acknowledgmentAppraisal}
          companyId={acknowledgmentAppraisal.company_id}
        />
      )}
    </AppLayout>
  );
}

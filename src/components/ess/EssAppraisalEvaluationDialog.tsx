import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  Award,
  Briefcase,
  Heart,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileText,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import type { MyAppraisal } from "@/hooks/useMyAppraisals";
import { EmployeeGoalRatingCard } from "./EmployeeGoalRatingCard";
import { EmployeeCompetencyCard } from "./EmployeeCompetencyCard";
import { EmployeeResponsibilityCard } from "./EmployeeResponsibilityCard";
import { EvidenceQuickAttach } from "./EvidenceQuickAttach";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCompetencyCascade } from "@/hooks/useCompetencyCascade";

interface ScoreItem {
  id?: string;
  item_id: string;
  item_name: string;
  evaluation_type: "competency" | "responsibility" | "goal";
  weight: number;
  self_rating: number | null;
  self_comments: string;
  self_metadata?: Record<string, any>;
  proficiency_indicators?: Record<string, string[]>;
  evidence_count?: number;
}

interface EssAppraisalEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: MyAppraisal;
  onSuccess?: () => void;
}

export function EssAppraisalEvaluationDialog({
  open,
  onOpenChange,
  appraisal,
  onSuccess,
}: EssAppraisalEvaluationDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("goals");
  const [scores, setScores] = useState<ScoreItem[]>([]);
  const [selfReflection, setSelfReflection] = useState("");
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [selectedItemForEvidence, setSelectedItemForEvidence] = useState<{
    id: string;
    name: string;
    type: "goal" | "competency" | "responsibility";
  } | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Check if already submitted - form should be read-only
  const isSubmitted = !!appraisal.submitted_at;

  // Enabled categories from cycle config
  const enabledCategories = useMemo(() => ({
    goals: appraisal.include_goals && appraisal.goal_weight > 0,
    competencies: appraisal.include_competencies && appraisal.competency_weight > 0,
    responsibilities: appraisal.include_responsibilities && appraisal.responsibility_weight > 0,
    values: appraisal.include_values_assessment && appraisal.values_weight > 0,
  }), [appraisal]);

  // Set initial tab based on enabled categories
  useEffect(() => {
    if (enabledCategories.goals) setActiveTab("goals");
    else if (enabledCategories.competencies) setActiveTab("competencies");
    else if (enabledCategories.responsibilities) setActiveTab("responsibilities");
  }, [enabledCategories]);

  useEffect(() => {
    if (open && appraisal.id) {
      fetchData();
    }
  }, [open, appraisal.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch existing appraisal scores for this participant
      const { data: existingScores } = await supabase
        .from("appraisal_scores")
        .select("*")
        .eq("participant_id", appraisal.id);

      // Fetch evidence counts for all items
      const { data: evidenceData } = await supabase
        .from("performance_evidence")
        .select("goal_id, capability_id, responsibility_id")
        .eq("participant_id", appraisal.id);

      // Create evidence count map
      const evidenceCountMap: Record<string, number> = {};
      (evidenceData || []).forEach((e: any) => {
        const itemId = e.goal_id || e.capability_id || e.responsibility_id;
        if (itemId) {
          evidenceCountMap[itemId] = (evidenceCountMap[itemId] || 0) + 1;
        }
      });

      if (existingScores && existingScores.length > 0) {
        setScores(existingScores.map((s: any) => ({
          id: s.id,
          item_id: s.item_id,
          item_name: s.item_name,
          evaluation_type: s.evaluation_type,
          weight: s.weight || 0,
          self_rating: s.self_rating,
          self_comments: s.self_comments || "",
          self_metadata: s.self_metadata || {},
          proficiency_indicators: s.metadata?.proficiency_indicators,
          evidence_count: evidenceCountMap[s.item_id] || 0,
        })));
      } else {
        // Fetch items for this employee to create score entries
        await fetchEmployeeItems(evidenceCountMap);
      }

      // Load existing self-reflection from employee_comments
      const { data: participant } = await supabase
        .from("appraisal_participants")
        .select("employee_comments")
        .eq("id", appraisal.id)
        .single();

      if (participant?.employee_comments) {
        try {
          const parsed = JSON.parse(participant.employee_comments);
          setSelfReflection(parsed.selfReflection || "");
        } catch {
          setSelfReflection("");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load appraisal data");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeItems = async (evidenceCountMap: Record<string, number> = {}) => {
    if (!user?.id) return;
    const newScores: ScoreItem[] = [];

    // Fetch competencies using cascade logic (job -> employee override)
    if (enabledCategories.competencies) {
      const cascadeResult = await fetchCompetencyCascade(user.id);
      
      // Use merged competencies (job as primary, employee as override)
      cascadeResult.competencies.forEach(comp => {
        newScores.push({
          item_id: comp.competency_id,
          item_name: comp.name,
          evaluation_type: "competency",
          weight: comp.weighting || 0,
          self_rating: null,
          self_comments: "",
          proficiency_indicators: comp.proficiency_indicators as any,
          evidence_count: evidenceCountMap[comp.competency_id] || 0,
        });
      });
    }

    // Fetch goals (from performance_goals or job_goals)
    if (enabledCategories.goals) {
      const { data: goals } = await supabase
        .from("performance_goals")
        .select("id, title, weighting")
        .eq("employee_id", user.id)
        .eq("status", "active");

      (goals || []).forEach(goal => {
        newScores.push({
          item_id: goal.id,
          item_name: goal.title,
          evaluation_type: "goal",
          weight: goal.weighting || 0,
          self_rating: null,
          self_comments: "",
          evidence_count: evidenceCountMap[goal.id] || 0,
        });
      });
    }

    // Fetch responsibilities from employee's position
    if (enabledCategories.responsibilities) {
      const { data: positions } = await supabase
        .from("employee_positions")
        .select("position_id, positions!inner(job_id)")
        .eq("employee_id", user.id)
        .eq("is_active", true);

      if (positions?.length) {
        const jobIds = positions.map((p: any) => p.positions?.job_id).filter(Boolean);
        if (jobIds.length > 0) {
          const { data: jobResps } = await supabase
            .from("job_responsibilities")
            .select("responsibility_id, weighting, responsibilities(id, name)")
            .in("job_id", jobIds)
            .is("end_date", null);

          (jobResps || []).forEach((jr: any) => {
            if (jr.responsibilities) {
              newScores.push({
                item_id: jr.responsibility_id,
                item_name: jr.responsibilities.name,
                evaluation_type: "responsibility",
                weight: jr.weighting || 0,
                self_rating: null,
                self_comments: "",
                evidence_count: evidenceCountMap[jr.responsibility_id] || 0,
              });
            }
          });
        }
      }
    }

    setScores(newScores);
  };

  const handleRatingChange = (itemId: string, type: string, rating: number) => {
    setScores(prev => prev.map(s => 
      s.item_id === itemId && s.evaluation_type === type
        ? { ...s, self_rating: rating }
        : s
    ));
  };

  const handleCommentsChange = (itemId: string, type: string, comments: string) => {
    setScores(prev => prev.map(s => 
      s.item_id === itemId && s.evaluation_type === type
        ? { ...s, self_comments: comments }
        : s
    ));
  };

  const handleBehaviorsChange = (itemId: string, behaviors: string[]) => {
    setScores(prev => prev.map(s => 
      s.item_id === itemId && s.evaluation_type === "competency"
        ? { ...s, self_metadata: { ...s.self_metadata, demonstrated_behaviors: behaviors } }
        : s
    ));
  };

  const handleAttachEvidence = (itemId: string, itemName: string, type: "goal" | "competency" | "responsibility") => {
    setSelectedItemForEvidence({ id: itemId, name: itemName, type });
    setEvidenceDialogOpen(true);
  };

  // Handle evidence attached - refresh count and auto-save
  const handleEvidenceAttached = async () => {
    if (!selectedItemForEvidence) {
      setEvidenceDialogOpen(false);
      return;
    }

    // Refetch evidence count for the specific item
    const columnName = selectedItemForEvidence.type === "goal" 
      ? "goal_id" 
      : selectedItemForEvidence.type === "competency" 
        ? "capability_id" 
        : "responsibility_id";
    
    const { count } = await supabase
      .from("performance_evidence")
      .select("id", { count: "exact", head: true })
      .eq("participant_id", appraisal.id)
      .eq(columnName, selectedItemForEvidence.id);

    // Update local state with new count
    setScores(prev => prev.map(s => 
      s.item_id === selectedItemForEvidence.id
        ? { ...s, evidence_count: count || 0 }
        : s
    ));

    setEvidenceDialogOpen(false);
    
    // Auto-save draft to persist the score record (ensures evidence link works)
    await handleSave(false);
    toast.success("Evidence attached and draft saved");
  };

  // Completion stats
  const completionStats = useMemo(() => {
    const byType = { goal: { total: 0, done: 0 }, competency: { total: 0, done: 0 }, responsibility: { total: 0, done: 0 } };
    scores.forEach(s => {
      if (byType[s.evaluation_type]) {
        byType[s.evaluation_type].total++;
        if (s.self_rating !== null) byType[s.evaluation_type].done++;
      }
    });
    const total = scores.length + 1; // +1 for reflection
    const done = scores.filter(s => s.self_rating !== null).length + (selfReflection.trim() ? 1 : 0);
    return { total, done, percentage: total > 0 ? Math.round((done / total) * 100) : 0, byType };
  }, [scores, selfReflection]);

  const canSubmit = completionStats.percentage === 100;

  const handleSave = async (submit = false, silent = false) => {
    setSaving(true);
    try {
      // Save ALL scores (including unrated ones) to ensure evidence links work
      for (const score of scores) {
        const payload: any = {
          participant_id: appraisal.id,
          evaluation_type: score.evaluation_type,
          item_id: score.item_id,
          item_name: score.item_name,
          weight: score.weight,
          self_rating: score.self_rating,
          self_comments: score.self_comments || null,
          self_rated_at: score.self_rating !== null ? new Date().toISOString() : null,
          self_metadata: score.self_metadata || {},
        };

        if (score.id) {
          // Update existing record
          await supabase.from("appraisal_scores").update({
            self_rating: payload.self_rating,
            self_comments: payload.self_comments,
            self_rated_at: payload.self_rated_at,
            self_metadata: payload.self_metadata,
          }).eq("id", score.id);
        } else {
          // Insert new record - this creates the score record for evidence linking
          const { data: inserted } = await supabase.from("appraisal_scores")
            .insert(payload)
            .select("id")
            .single();
          
          // Update local state with the new ID
          if (inserted) {
            setScores(prev => prev.map(s => 
              s.item_id === score.item_id && s.evaluation_type === score.evaluation_type
                ? { ...s, id: inserted.id }
                : s
            ));
          }
        }
      }

      // Save participant status
      const employeeComments = JSON.stringify({
        selfReflection,
        submittedAt: submit ? new Date().toISOString() : null,
        isDraft: !submit,
      });

      const { error: participantError } = await supabase.from("appraisal_participants").update({
        employee_comments: employeeComments,
        status: submit ? "submitted" : "in_progress",
        submitted_at: submit ? new Date().toISOString() : null,
      }).eq("id", appraisal.id);

      if (participantError) {
        console.error("Failed to update participant:", participantError);
        toast.error("Failed to save. Please try again.");
        return;
      }

      if (!silent) {
        toast.success(submit ? "Self-assessment submitted! Your manager will be notified." : "Progress saved");
      }
      queryClient.invalidateQueries({ queryKey: ["my-appraisals"] });
      
      if (submit) {
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      if (!silent) {
        toast.error(error.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitClick = () => {
    setConfirmSubmitOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setConfirmSubmitOpen(false);
    await handleSave(true);
  };

  const goalScores = scores.filter(s => s.evaluation_type === "goal");
  const competencyScores = scores.filter(s => s.evaluation_type === "competency");
  const responsibilityScores = scores.filter(s => s.evaluation_type === "responsibility");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Self-Assessment: {appraisal.cycle_name}
            </DialogTitle>
          </DialogHeader>

          {/* Submitted Banner */}
          {isSubmitted && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <span className="font-medium">Submitted</span> on {format(new Date(appraisal.submitted_at!), "MMMM d, yyyy 'at' h:mm a")}. 
                Your self-assessment is now with your manager for review.
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar */}
          {!isSubmitted && (
            <div className="space-y-2 px-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{completionStats.percentage}%</span>
              </div>
              <Progress value={completionStats.percentage} className="h-2" />
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-4">
                {enabledCategories.goals && (
                  <TabsTrigger value="goals" className="gap-1">
                    <Target className="h-4 w-4" />
                    Goals
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {completionStats.byType.goal.done}/{completionStats.byType.goal.total}
                    </Badge>
                  </TabsTrigger>
                )}
                {enabledCategories.competencies && (
                  <TabsTrigger value="competencies" className="gap-1">
                    <Award className="h-4 w-4" />
                    Competencies
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {completionStats.byType.competency.done}/{completionStats.byType.competency.total}
                    </Badge>
                  </TabsTrigger>
                )}
                {enabledCategories.responsibilities && (
                  <TabsTrigger value="responsibilities" className="gap-1">
                    <Briefcase className="h-4 w-4" />
                    KRAs
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {completionStats.byType.responsibility.done}/{completionStats.byType.responsibility.total}
                    </Badge>
                  </TabsTrigger>
                )}
                <TabsTrigger value="reflection" className="gap-1">
                  <Heart className="h-4 w-4" />
                  Reflection
                  {selfReflection.trim() && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                {/* Goals Tab */}
                {enabledCategories.goals && (
                  <TabsContent value="goals" className="space-y-3 m-0">
                    {goalScores.length === 0 ? (
                      <Card><CardContent className="py-8 text-center text-muted-foreground">No goals assigned</CardContent></Card>
                    ) : (
                      goalScores.map(score => (
                        <EmployeeGoalRatingCard
                          key={score.item_id}
                          goalId={score.item_id}
                          goalName={score.item_name}
                          weight={score.weight}
                          currentRating={score.self_rating}
                          comments={score.self_comments}
                          evidenceCount={score.evidence_count}
                          onRatingChange={(r) => handleRatingChange(score.item_id, "goal", r)}
                          onCommentsChange={(c) => handleCommentsChange(score.item_id, "goal", c)}
                          onAttachEvidence={() => handleAttachEvidence(score.item_id, score.item_name, "goal")}
                        />
                      ))
                    )}
                  </TabsContent>
                )}

                {/* Competencies Tab */}
                {enabledCategories.competencies && (
                  <TabsContent value="competencies" className="space-y-3 m-0">
                    {competencyScores.length === 0 ? (
                      <Card><CardContent className="py-8 text-center text-muted-foreground">No competencies assigned</CardContent></Card>
                    ) : (
                      competencyScores.map(score => (
                        <EmployeeCompetencyCard
                          key={score.item_id}
                          competencyId={score.item_id}
                          competencyName={score.item_name}
                          weight={score.weight}
                          currentRating={score.self_rating}
                          comments={score.self_comments}
                          selectedBehaviors={score.self_metadata?.demonstrated_behaviors || []}
                          proficiencyIndicators={score.proficiency_indicators}
                          evidenceCount={score.evidence_count}
                          onRatingChange={(r) => handleRatingChange(score.item_id, "competency", r)}
                          onCommentsChange={(c) => handleCommentsChange(score.item_id, "competency", c)}
                          onBehaviorsChange={(b) => handleBehaviorsChange(score.item_id, b)}
                          onAttachEvidence={() => handleAttachEvidence(score.item_id, score.item_name, "competency")}
                        />
                      ))
                    )}
                  </TabsContent>
                )}

                {/* Responsibilities Tab */}
                {enabledCategories.responsibilities && (
                  <TabsContent value="responsibilities" className="space-y-3 m-0">
                    {responsibilityScores.length === 0 ? (
                      <Card><CardContent className="py-8 text-center text-muted-foreground">No responsibilities assigned</CardContent></Card>
                    ) : (
                      responsibilityScores.map(score => (
                        <EmployeeResponsibilityCard
                          key={score.item_id}
                          responsibilityId={score.item_id}
                          responsibilityName={score.item_name}
                          weight={score.weight}
                          currentRating={score.self_rating}
                          comments={score.self_comments}
                          evidenceCount={score.evidence_count}
                          onRatingChange={(r) => handleRatingChange(score.item_id, "responsibility", r)}
                          onCommentsChange={(c) => handleCommentsChange(score.item_id, "responsibility", c)}
                          onAttachEvidence={() => handleAttachEvidence(score.item_id, score.item_name, "responsibility")}
                        />
                      ))
                    )}
                  </TabsContent>
                )}

                {/* Reflection Tab */}
                <TabsContent value="reflection" className="space-y-4 m-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Overall Self-Reflection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reflect on your overall performance {!isSubmitted && "*"}</Label>
                        <Textarea
                          value={selfReflection}
                          onChange={(e) => setSelfReflection(e.target.value)}
                          placeholder="Summarize your performance, key accomplishments, challenges overcome, and areas for growth..."
                          rows={6}
                          className="resize-none"
                          disabled={isSubmitted}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {!isSubmitted && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Once submitted, your self-assessment will be visible to your manager and cannot be edited.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}

          {/* Footer Actions */}
          {!isSubmitted ? (
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmitClick} disabled={saving || !canSubmit}>
                <Send className="h-4 w-4 mr-2" />
                {saving ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <Lock className="h-4 w-4 mr-2" />
                Close (Read-Only)
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Self-Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Once submitted, your self-assessment will be visible to your manager 
              and <strong>cannot be edited</strong>. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit}>
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Evidence Dialog */}
      {selectedItemForEvidence && user?.id && (
        <EvidenceQuickAttach
          open={evidenceDialogOpen}
          onOpenChange={setEvidenceDialogOpen}
          employeeId={user.id}
          participantId={appraisal.id}
          scoreItemId={selectedItemForEvidence.id}
          itemName={selectedItemForEvidence.name}
          itemType={selectedItemForEvidence.type}
          cycleId={appraisal.cycle_id}
          onAttached={handleEvidenceAttached}
        />
      )}
    </>
  );
}

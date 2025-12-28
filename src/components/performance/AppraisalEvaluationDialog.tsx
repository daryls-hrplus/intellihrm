import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Briefcase, Award, Save, Send, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useKRARatingSubmissions } from "@/hooks/useKRARatingSubmissions";
import { KRAWithRating, ResponsibilityKRA } from "@/types/responsibilityKRA";
import { KRARatingCard } from "./KRARatingCard";

interface AppraisalScore {
  id?: string;
  item_id: string;
  item_name: string;
  evaluation_type: "competency" | "responsibility" | "goal";
  weight: number;
  rating: number | null;
  weighted_score: number | null;
  comments: string;
  // For responsibilities with KRAs
  hasKRAs?: boolean;
  kras?: KRAWithRating[];
  kraRollupScore?: number;
}

interface CycleInfo {
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  min_rating: number;
  max_rating: number;
}

interface AppraisalEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  employeeName: string;
  cycleId: string;
  onSuccess: () => void;
  isEmployee?: boolean;
  currentUserId?: string;
}

export function AppraisalEvaluationDialog({
  open,
  onOpenChange,
  participantId,
  employeeName,
  cycleId,
  onSuccess,
  isEmployee = false,
  currentUserId,
}: AppraisalEvaluationDialogProps) {
  const [activeTab, setActiveTab] = useState("competencies");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [scores, setScores] = useState<AppraisalScore[]>([]);
  const [finalComments, setFinalComments] = useState("");
  const [expandedResponsibilities, setExpandedResponsibilities] = useState<Set<string>>(new Set());

  const { 
    fetchKRAsWithRatings, 
    submitSelfRating, 
    submitManagerRating,
    calculateResponsibilityRollup,
  } = useKRARatingSubmissions({ participantId });

  useEffect(() => {
    if (open && participantId) {
      fetchData();
    }
  }, [open, participantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch cycle info
      const { data: cycleData } = await supabase
        .from("appraisal_cycles")
        .select("competency_weight, responsibility_weight, goal_weight, min_rating, max_rating")
        .eq("id", cycleId)
        .single();

      if (cycleData) {
        setCycleInfo(cycleData);
      }

      // Fetch participant info
      const { data: participantData } = await supabase
        .from("appraisal_participants")
        .select("employee_id, final_comments")
        .eq("id", participantId)
        .single();

      if (participantData) {
        setFinalComments(participantData.final_comments || "");
        await fetchEmployeeItems(participantData.employee_id);
      }

      // Fetch existing scores
      await fetchExistingScores();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeItems = async (employeeId: string) => {
    // Fetch employee competencies
    const { data: competencies } = await supabase
      .from("employee_competencies")
      .select(`
        id,
        weighting,
        competency_id
      `)
      .eq("employee_id", employeeId)
      .is("end_date", null);

    // Get competency names
    const compIds = (competencies || []).map((c: any) => c.competency_id);
    let compNames: Record<string, string> = {};
    if (compIds.length > 0) {
      const { data: compData } = await supabase
        .from("competencies")
        .select("id, name")
        .in("id", compIds);
      compNames = Object.fromEntries((compData || []).map((c: any) => [c.id, c.name]));
    }

    // Fetch employee responsibilities from job_responsibilities via positions
    const { data: positions } = await supabase
      .from("employee_positions")
      .select("position_id, positions!inner(job_id)")
      .eq("employee_id", employeeId)
      .eq("is_active", true);

    let responsibilities: { id: string; name: string; weight: number; responsibility_id: string }[] = [];
    if (positions && positions.length > 0) {
      const jobIds = positions
        .map((p: any) => p.positions?.job_id)
        .filter(Boolean);
      
      if (jobIds.length > 0) {
        const { data: jobResps } = await supabase
          .from("job_responsibilities")
          .select("id, weighting, responsibility_id, responsibilities(id, name)")
          .in("job_id", jobIds)
          .is("end_date", null);
        
        responsibilities = (jobResps || []).map((jr: any) => ({
          id: jr.responsibility_id,
          name: jr.responsibilities?.name || 'Unknown',
          weight: jr.weighting || 0,
          responsibility_id: jr.responsibility_id,
        }));
      }
    }

    // Fetch employee goals from job_goals via positions -> jobs
    let goals: { id: string; title: string; weight: number }[] = [];
    if (positions && positions.length > 0) {
      const jobIds = positions
        .map((p: any) => p.positions?.job_id)
        .filter(Boolean);
      
      if (jobIds.length > 0) {
        const { data: jobGoals } = await supabase
          .from("job_goals")
          .select("id, goal_name, weighting")
          .in("job_id", jobIds)
          .is("end_date", null);
        
        goals = (jobGoals || []).map((g: any) => ({
          id: g.id,
          title: g.goal_name,
          weight: g.weighting || 0
        }));
      }
    }

    // Build scores array
    const newScores: AppraisalScore[] = [];

    // Add competencies
    (competencies || []).forEach((comp: any) => {
      newScores.push({
        item_id: comp.competency_id,
        item_name: compNames[comp.competency_id] || "Unknown",
        evaluation_type: "competency",
        weight: comp.weighting || 0,
        rating: null,
        weighted_score: null,
        comments: "",
      });
    });

    // Add responsibilities - check for structured KRAs
    for (const resp of responsibilities) {
      // Check if this responsibility has structured KRAs
      const krasWithRatings = await fetchKRAsWithRatings(participantId, resp.id);
      const hasKRAs = krasWithRatings.length > 0;

      newScores.push({
        item_id: resp.id,
        item_name: resp.name,
        evaluation_type: "responsibility",
        weight: resp.weight || 0,
        rating: null,
        weighted_score: null,
        comments: "",
        hasKRAs,
        kras: hasKRAs ? krasWithRatings : undefined,
        kraRollupScore: hasKRAs ? calculateKRAScore(krasWithRatings) : undefined,
      });

      // Auto-expand responsibilities with KRAs
      if (hasKRAs) {
        setExpandedResponsibilities(prev => new Set([...prev, resp.id]));
      }
    }

    // Add goals
    (goals || []).forEach((goal: any) => {
      newScores.push({
        item_id: goal.id,
        item_name: goal.title,
        evaluation_type: "goal",
        weight: goal.weight || 0,
        rating: null,
        weighted_score: null,
        comments: "",
      });
    });

    setScores(newScores);
  };

  const calculateKRAScore = (kras: KRAWithRating[]): number => {
    let totalWeight = 0;
    let weightedSum = 0;

    kras.forEach(kra => {
      if (kra.rating?.final_score !== null && kra.rating?.final_score !== undefined) {
        weightedSum += kra.rating.final_score * kra.weight;
        totalWeight += kra.weight;
      }
    });

    if (totalWeight === 0) return 0;
    return Math.round((weightedSum / totalWeight) * 100) / 100;
  };

  const fetchExistingScores = async () => {
    const { data } = await supabase
      .from("appraisal_scores")
      .select("*")
      .eq("participant_id", participantId);

    if (data && data.length > 0) {
      setScores((prev) =>
        prev.map((score) => {
          const existing = data.find(
            (d) => d.item_id === score.item_id && d.evaluation_type === score.evaluation_type
          );
          if (existing) {
            return {
              ...score,
              id: existing.id,
              rating: existing.rating,
              weighted_score: existing.weighted_score,
              comments: existing.comments || "",
            };
          }
          return score;
        })
      );
    }
  };

  const handleRatingChange = (itemId: string, type: string, rating: number) => {
    setScores((prev) =>
      prev.map((score) => {
        if (score.item_id === itemId && score.evaluation_type === type) {
          const maxRating = cycleInfo?.max_rating || 5;
          const weightedScore = (rating / maxRating) * score.weight;
          return { ...score, rating, weighted_score: weightedScore };
        }
        return score;
      })
    );
  };

  const handleCommentChange = (itemId: string, type: string, comments: string) => {
    setScores((prev) =>
      prev.map((score) => {
        if (score.item_id === itemId && score.evaluation_type === type) {
          return { ...score, comments };
        }
        return score;
      })
    );
  };

  const handleKRASelfRating = useCallback(async (kraId: string, responsibilityId: string, rating: number, comments?: string) => {
    const { error } = await submitSelfRating(kraId, responsibilityId, rating, comments, participantId);
    if (error) {
      toast.error("Failed to save KRA rating");
      return;
    }

    // Refresh KRAs for this responsibility
    const updatedKRAs = await fetchKRAsWithRatings(participantId, responsibilityId);
    const newRollupScore = calculateKRAScore(updatedKRAs);

    setScores(prev => prev.map(score => {
      if (score.item_id === responsibilityId && score.evaluation_type === 'responsibility') {
        return {
          ...score,
          kras: updatedKRAs,
          kraRollupScore: newRollupScore,
          rating: newRollupScore,
          weighted_score: (newRollupScore / (cycleInfo?.max_rating || 5)) * score.weight,
        };
      }
      return score;
    }));
  }, [participantId, cycleInfo, fetchKRAsWithRatings, submitSelfRating]);

  const handleKRAManagerRating = useCallback(async (kraId: string, responsibilityId: string, rating: number, comments?: string) => {
    if (!currentUserId) return;

    const { error } = await submitManagerRating(kraId, responsibilityId, currentUserId, rating, comments, participantId);
    if (error) {
      toast.error("Failed to save KRA rating");
      return;
    }

    // Refresh KRAs for this responsibility
    const updatedKRAs = await fetchKRAsWithRatings(participantId, responsibilityId);
    const newRollupScore = calculateKRAScore(updatedKRAs);

    setScores(prev => prev.map(score => {
      if (score.item_id === responsibilityId && score.evaluation_type === 'responsibility') {
        return {
          ...score,
          kras: updatedKRAs,
          kraRollupScore: newRollupScore,
          rating: newRollupScore,
          weighted_score: (newRollupScore / (cycleInfo?.max_rating || 5)) * score.weight,
        };
      }
      return score;
    }));
  }, [participantId, currentUserId, cycleInfo, fetchKRAsWithRatings, submitManagerRating]);

  const handleSave = async (submit: boolean = false) => {
    setSaving(true);
    try {
      // Upsert scores
      for (const score of scores) {
        // For responsibilities with KRAs, use the rollup score
        const finalRating = score.hasKRAs ? score.kraRollupScore : score.rating;
        
        if (finalRating !== null && finalRating !== undefined) {
          const payload = {
            participant_id: participantId,
            evaluation_type: score.evaluation_type,
            item_id: score.item_id,
            item_name: score.item_name,
            weight: score.weight,
            rating: finalRating,
            comments: score.comments || null,
          };

          if (score.id) {
            await supabase.from("appraisal_scores").update(payload).eq("id", score.id);
          } else {
            await supabase.from("appraisal_scores").insert(payload);
          }
        }
      }

      // Update participant status and comments
      const updatePayload: any = {
        final_comments: finalComments || null,
        status: submit ? "submitted" : "in_progress",
      };

      if (submit) {
        updatePayload.submitted_at = new Date().toISOString();
      }

      await supabase.from("appraisal_participants").update(updatePayload).eq("id", participantId);

      toast.success(submit ? "Evaluation submitted successfully" : "Progress saved");
      if (submit) {
        onOpenChange(false);
      }
      onSuccess();
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const getScoresByType = (type: string) => scores.filter((s) => s.evaluation_type === type);

  const calculateCategoryScore = (type: string) => {
    const typeScores = getScoresByType(type);
    return typeScores.reduce((sum, s) => sum + (s.weighted_score || 0), 0);
  };

  const calculateTotalWeight = (type: string) => {
    return getScoresByType(type).reduce((sum, s) => sum + s.weight, 0);
  };

  const toggleResponsibilityExpanded = (itemId: string) => {
    setExpandedResponsibilities(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const renderResponsibilityItems = () => {
    const items = getScoresByType("responsibility");
    const totalWeight = calculateTotalWeight("responsibility");

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No responsibilities assigned
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total weight: {totalWeight}%</span>
          <span className={totalWeight === 100 ? "text-success" : "text-warning"}>
            {totalWeight === 100 ? "✓ Valid" : "Should total 100%"}
          </span>
        </div>

        {items.map((item) => (
          <Card key={`responsibility-${item.item_id}`}>
            <Collapsible 
              open={expandedResponsibilities.has(item.item_id)}
              onOpenChange={() => toggleResponsibilityExpanded(item.item_id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{item.item_name}</CardTitle>
                      {item.hasKRAs && (
                        <Badge variant="secondary" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {item.kras?.length} KRAs
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.weight}% weight</Badge>
                      {item.hasKRAs && item.kraRollupScore !== undefined && (
                        <Badge variant="default" className="bg-green-600">
                          Score: {item.kraRollupScore.toFixed(2)}
                        </Badge>
                      )}
                      {expandedResponsibilities.has(item.item_id) ? (
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
                  {item.hasKRAs && item.kras ? (
                    // Render individual KRA rating cards
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        Rate each Key Result Area individually:
                      </div>
                      {item.kras.map((kra) => (
                        <KRARatingCard
                          key={kra.id}
                          kra={kra}
                          isEmployee={isEmployee}
                          minRating={cycleInfo?.min_rating || 1}
                          maxRating={cycleInfo?.max_rating || 5}
                          onSelfRatingChange={(kraId, rating, comments) => 
                            handleKRASelfRating(kraId, item.item_id, rating, comments)
                          }
                          onManagerRatingChange={(kraId, rating, comments) => 
                            handleKRAManagerRating(kraId, item.item_id, rating, comments)
                          }
                        />
                      ))}
                      
                      {/* Rollup Summary */}
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Responsibility Rollup Score</span>
                          <span className="text-xl font-bold text-primary">
                            {item.kraRollupScore?.toFixed(2) || '—'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Calculated from weighted average of KRA ratings
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Traditional single rating
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Rating ({cycleInfo?.min_rating || 1} - {cycleInfo?.max_rating || 5})</Label>
                          <span className="text-lg font-semibold">
                            {item.rating !== null ? item.rating : "-"}
                          </span>
                        </div>
                        <Slider
                          value={[item.rating || cycleInfo?.min_rating || 1]}
                          min={cycleInfo?.min_rating || 1}
                          max={cycleInfo?.max_rating || 5}
                          step={0.5}
                          onValueChange={([value]) =>
                            handleRatingChange(item.item_id, item.evaluation_type, value)
                          }
                        />
                        {item.weighted_score !== null && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Weighted score: {item.weighted_score.toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`comments-${item.item_id}`}>Comments</Label>
                        <Textarea
                          id={`comments-${item.item_id}`}
                          value={item.comments}
                          onChange={(e) =>
                            handleCommentChange(item.item_id, item.evaluation_type, e.target.value)
                          }
                          placeholder="Add feedback comments..."
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    );
  };

  const renderScoreItems = (type: "competency" | "goal") => {
    const items = getScoresByType(type);
    const totalWeight = calculateTotalWeight(type);

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type === "competency" ? "competencies" : "goals"} assigned
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total weight: {totalWeight}%</span>
          <span className={totalWeight === 100 ? "text-success" : "text-warning"}>
            {totalWeight === 100 ? "✓ Valid" : "Should total 100%"}
          </span>
        </div>

        {items.map((item) => (
          <Card key={`${item.evaluation_type}-${item.item_id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{item.item_name}</CardTitle>
                <Badge variant="outline">{item.weight}% weight</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Rating ({cycleInfo?.min_rating || 1} - {cycleInfo?.max_rating || 5})</Label>
                  <span className="text-lg font-semibold">
                    {item.rating !== null ? item.rating : "-"}
                  </span>
                </div>
                <Slider
                  value={[item.rating || cycleInfo?.min_rating || 1]}
                  min={cycleInfo?.min_rating || 1}
                  max={cycleInfo?.max_rating || 5}
                  step={0.5}
                  onValueChange={([value]) =>
                    handleRatingChange(item.item_id, item.evaluation_type, value)
                  }
                />
                {item.weighted_score !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Weighted score: {item.weighted_score.toFixed(1)}%
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor={`comments-${item.item_id}`}>Comments</Label>
                <Textarea
                  id={`comments-${item.item_id}`}
                  value={item.comments}
                  onChange={(e) =>
                    handleCommentChange(item.item_id, item.evaluation_type, e.target.value)
                  }
                  placeholder="Add feedback comments..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const compScore = calculateCategoryScore("competency");
  const respScore = calculateCategoryScore("responsibility");
  const goalScore = calculateCategoryScore("goal");
  const overallScore =
    cycleInfo
      ? (compScore * cycleInfo.competency_weight +
          respScore * cycleInfo.responsibility_weight +
          goalScore * cycleInfo.goal_weight) /
        100
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEmployee ? "Self-Evaluation" : "Evaluate"}: {employeeName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Competency</p>
                <p className="text-xl font-bold">{compScore.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {cycleInfo?.competency_weight}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Responsibility</p>
                <p className="text-xl font-bold">{respScore.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {cycleInfo?.responsibility_weight}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Goals</p>
                <p className="text-xl font-bold">{goalScore.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  Weight: {cycleInfo?.goal_weight}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-primary/10">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Overall</p>
                <p className="text-2xl font-bold text-primary">{overallScore.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for evaluation categories */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="competencies" className="gap-2">
                <Award className="h-4 w-4" />
                Competencies
              </TabsTrigger>
              <TabsTrigger value="responsibilities" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Responsibilities
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="competencies" className="mt-4">
              {renderScoreItems("competency")}
            </TabsContent>

            <TabsContent value="responsibilities" className="mt-4">
              {renderResponsibilityItems()}
            </TabsContent>

            <TabsContent value="goals" className="mt-4">
              {renderScoreItems("goal")}
            </TabsContent>
          </Tabs>

          {/* Final Comments */}
          <div>
            <Label htmlFor="final_comments">Overall Comments & Recommendations</Label>
            <Textarea
              id="final_comments"
              value={finalComments}
              onChange={(e) => setFinalComments(e.target.value)}
              placeholder="Provide overall feedback and development recommendations..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
            <Button onClick={() => handleSave(true)} disabled={saving}>
              <Send className="mr-2 h-4 w-4" />
              Submit Evaluation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

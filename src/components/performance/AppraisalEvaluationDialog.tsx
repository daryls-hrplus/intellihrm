import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Briefcase, Award, Save, Send } from "lucide-react";

interface AppraisalScore {
  id?: string;
  item_id: string;
  item_name: string;
  evaluation_type: "competency" | "responsibility" | "goal";
  weight: number;
  rating: number | null;
  weighted_score: number | null;
  comments: string;
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
}

export function AppraisalEvaluationDialog({
  open,
  onOpenChange,
  participantId,
  employeeName,
  cycleId,
  onSuccess,
}: AppraisalEvaluationDialogProps) {
  const [activeTab, setActiveTab] = useState("competencies");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [scores, setScores] = useState<AppraisalScore[]>([]);
  const [finalComments, setFinalComments] = useState("");

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

    // Fetch employee goals from job_goals via employee positions -> positions -> jobs
    const { data: positions } = await supabase
      .from("employee_positions")
      .select("position_id, positions!inner(job_id)")
      .eq("employee_id", employeeId)
      .eq("is_active", true);

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

  const handleSave = async (submit: boolean = false) => {
    setSaving(true);
    try {
      // Upsert scores
      for (const score of scores) {
        if (score.rating !== null) {
          const payload = {
            participant_id: participantId,
            evaluation_type: score.evaluation_type,
            item_id: score.item_id,
            item_name: score.item_name,
            weight: score.weight,
            rating: score.rating,
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

  const renderScoreItems = (type: "competency" | "responsibility" | "goal") => {
    const items = getScoresByType(type);
    const totalWeight = calculateTotalWeight(type);

    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type === "competency" ? "competencies" : type === "responsibility" ? "responsibilities" : "goals"} assigned
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
          <DialogTitle>Evaluate: {employeeName}</DialogTitle>
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
              {renderScoreItems("responsibility")}
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

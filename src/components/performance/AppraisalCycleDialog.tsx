import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Users, GitMerge } from "lucide-react";

interface AppraisalCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  evaluation_deadline: string | null;
  status: string;
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  min_rating: number;
  max_rating: number;
  multi_position_mode?: string;
}

interface AppraisalCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: AppraisalCycle | null;
  companyId: string | undefined;
  onSuccess: () => void;
  isProbationReview?: boolean;
  isManagerCycle?: boolean;
}

export function AppraisalCycleDialog({
  open,
  onOpenChange,
  cycle,
  companyId,
  onSuccess,
  isProbationReview = false,
  isManagerCycle = false,
}: AppraisalCycleDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    evaluation_deadline: "",
    status: "draft",
    competency_weight: 40,
    responsibility_weight: 30,
    goal_weight: 30,
    min_rating: 1,
    max_rating: 5,
    multi_position_mode: "aggregate" as "aggregate" | "separate",
  });

  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name,
        description: cycle.description || "",
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        evaluation_deadline: cycle.evaluation_deadline || "",
        status: cycle.status,
        competency_weight: cycle.competency_weight,
        responsibility_weight: cycle.responsibility_weight,
        goal_weight: cycle.goal_weight,
        min_rating: cycle.min_rating,
        max_rating: cycle.max_rating,
        multi_position_mode: (cycle.multi_position_mode as "aggregate" | "separate") || "aggregate",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        evaluation_deadline: "",
        status: "draft",
        competency_weight: 40,
        responsibility_weight: 30,
        goal_weight: 30,
        min_rating: 1,
        max_rating: 5,
        multi_position_mode: "aggregate",
      });
    }
  }, [cycle]);

  const totalWeight = formData.competency_weight + formData.responsibility_weight + formData.goal_weight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      toast.error("Company not found");
      return;
    }

    if (totalWeight !== 100) {
      toast.error("Category weights must total 100%");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        company_id: companyId,
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        evaluation_deadline: formData.evaluation_deadline || null,
        status: formData.status,
        competency_weight: formData.competency_weight,
        responsibility_weight: formData.responsibility_weight,
        goal_weight: formData.goal_weight,
        min_rating: formData.min_rating,
        max_rating: formData.max_rating,
        multi_position_mode: formData.multi_position_mode,
        created_by: user?.id,
        is_probation_review: isProbationReview,
        is_manager_cycle: isManagerCycle,
      };

      if (cycle) {
        const { error } = await supabase
          .from("appraisal_cycles")
          .update(payload)
          .eq("id", cycle.id);

        if (error) throw error;
        toast.success("Appraisal cycle updated successfully");
      } else {
        const { error } = await supabase.from("appraisal_cycles").insert(payload);
        if (error) throw error;
        toast.success("Appraisal cycle created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error saving cycle:", error);
      toast.error(error.message || "Failed to save cycle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cycle ? "Edit " : "Create "}
            {isProbationReview ? "Probation Review Cycle" : "Appraisal Cycle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Cycle Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q4 2024 Performance Review"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the appraisal cycle..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="evaluation_deadline">Evaluation Deadline</Label>
              <Input
                id="evaluation_deadline"
                type="date"
                value={formData.evaluation_deadline}
                onChange={(e) => setFormData({ ...formData, evaluation_deadline: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Category Weights</h3>
              <span
                className={`text-sm font-medium ${
                  totalWeight === 100 ? "text-success" : "text-destructive"
                }`}
              >
                Total: {totalWeight}% {totalWeight !== 100 && "(must be 100%)"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="competency_weight">Competency Weight (%)</Label>
                <Input
                  id="competency_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.competency_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, competency_weight: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="responsibility_weight">Responsibility Weight (%)</Label>
                <Input
                  id="responsibility_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.responsibility_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, responsibility_weight: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="goal_weight">Goal Weight (%)</Label>
                <Input
                  id="goal_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.goal_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_weight: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rating Scale</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="min_rating">Minimum Rating</Label>
                <Input
                  id="min_rating"
                  type="number"
                  min="0"
                  value={formData.min_rating}
                  onChange={(e) =>
                    setFormData({ ...formData, min_rating: parseFloat(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_rating">Maximum Rating</Label>
                <Input
                  id="max_rating"
                  type="number"
                  min="1"
                  value={formData.max_rating}
                  onChange={(e) =>
                    setFormData({ ...formData, max_rating: parseFloat(e.target.value) || 5 })
                  }
                />
              </div>
            </div>
          </div>

          {/* Multi-Position Handling */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Multi-Position Employees
              </CardTitle>
              <CardDescription>
                How should employees with multiple concurrent positions be appraised?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.multi_position_mode}
                onValueChange={(value: "aggregate" | "separate") =>
                  setFormData({ ...formData, multi_position_mode: value })
                }
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="aggregate" id="aggregate" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="aggregate" className="flex items-center gap-2 cursor-pointer font-medium">
                      <GitMerge className="h-4 w-4 text-primary" />
                      Aggregate Scores
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create one appraisal per employee. Scores from all positions are combined using 
                      configurable weights into a single overall score.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="separate" id="separate" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="separate" className="flex items-center gap-2 cursor-pointer font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      Separate Appraisals
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create individual appraisals for each position an employee holds. 
                      Each position is evaluated independently.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || totalWeight !== 100}>
              {loading ? "Saving..." : cycle ? "Update Cycle" : "Create Cycle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

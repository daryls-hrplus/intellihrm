import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardEdit, 
  Save, 
  Send, 
  AlertTriangle,
  CheckCircle2,
  Target,
  Star
} from "lucide-react";
import { toast } from "sonner";
import type { MyAppraisal } from "@/hooks/useMyAppraisals";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface EssAppraisalSelfAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: MyAppraisal;
  onSuccess?: () => void;
}

const RATING_OPTIONS = [
  { value: "1", label: "1 - Needs Improvement" },
  { value: "2", label: "2 - Below Expectations" },
  { value: "3", label: "3 - Meets Expectations" },
  { value: "4", label: "4 - Exceeds Expectations" },
  { value: "5", label: "5 - Outstanding" },
];

export function EssAppraisalSelfAssessmentDialog({
  open,
  onOpenChange,
  appraisal,
  onSuccess,
}: EssAppraisalSelfAssessmentDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selfGoalRating, setSelfGoalRating] = useState<string>("");
  const [selfCompetencyRating, setSelfCompetencyRating] = useState<string>("");
  const [selfResponsibilityRating, setSelfResponsibilityRating] = useState<string>("");
  const [selfReflection, setSelfReflection] = useState("");
  const [achievements, setAchievements] = useState("");
  const [challenges, setChallenges] = useState("");
  const [developmentAreas, setDevelopmentAreas] = useState("");

  const completionProgress = () => {
    let completed = 0;
    const total = 4;
    if (selfGoalRating) completed++;
    if (selfCompetencyRating) completed++;
    if (selfResponsibilityRating) completed++;
    if (selfReflection.trim()) completed++;
    return (completed / total) * 100;
  };

  const canSubmit = () => {
    return (
      selfGoalRating &&
      selfCompetencyRating &&
      selfResponsibilityRating &&
      selfReflection.trim()
    );
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const employeeComments = JSON.stringify({
        selfGoalRating,
        selfCompetencyRating,
        selfResponsibilityRating,
        selfReflection,
        achievements,
        challenges,
        developmentAreas,
        savedAt: new Date().toISOString(),
        isDraft: true,
      });

      const { error } = await supabase
        .from("appraisal_participants")
        .update({
          employee_comments: employeeComments,
          status: "in_progress",
        })
        .eq("id", appraisal.id);

      if (error) throw error;

      toast.success("Draft saved successfully");
      queryClient.invalidateQueries({ queryKey: ["my-appraisals"] });
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast.error(error.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      const employeeComments = JSON.stringify({
        selfGoalRating: parseFloat(selfGoalRating),
        selfCompetencyRating: parseFloat(selfCompetencyRating),
        selfResponsibilityRating: parseFloat(selfResponsibilityRating),
        selfReflection,
        achievements,
        challenges,
        developmentAreas,
        submittedAt: new Date().toISOString(),
        isDraft: false,
      });

      const { error } = await supabase
        .from("appraisal_participants")
        .update({
          employee_comments: employeeComments,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", appraisal.id);

      if (error) throw error;

      toast.success("Self-assessment submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-appraisals"] });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting self-assessment:", error);
      toast.error(error.message || "Failed to submit self-assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardEdit className="h-5 w-5 text-primary" />
            Self-Assessment
          </DialogTitle>
          <DialogDescription>{appraisal.cycle_name}</DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion Progress</span>
            <span className="font-medium">{Math.round(completionProgress())}%</span>
          </div>
          <Progress value={completionProgress()} className="h-2" />
        </div>

        <div className="space-y-6 py-4">
          {/* Self-Rating Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Rate Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Goals Rating */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-pink-500" />
                    Goals *
                  </Label>
                  <Select value={selfGoalRating} onValueChange={setSelfGoalRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Competencies Rating */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    Competencies *
                  </Label>
                  <Select value={selfCompetencyRating} onValueChange={setSelfCompetencyRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Responsibilities Rating */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <ClipboardEdit className="h-4 w-4 text-purple-500" />
                    Responsibilities *
                  </Label>
                  <Select value={selfResponsibilityRating} onValueChange={setSelfResponsibilityRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Self-Reflection */}
          <div className="space-y-2">
            <Label htmlFor="selfReflection">Overall Self-Reflection *</Label>
            <Textarea
              id="selfReflection"
              value={selfReflection}
              onChange={(e) => setSelfReflection(e.target.value)}
              placeholder="Reflect on your overall performance during this period..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Summarize your performance, key accomplishments, and areas you want to highlight.
            </p>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <Label htmlFor="achievements">Key Achievements (Optional)</Label>
            <Textarea
              id="achievements"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="List your key achievements and accomplishments..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Challenges */}
          <div className="space-y-2">
            <Label htmlFor="challenges">Challenges Faced (Optional)</Label>
            <Textarea
              id="challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Describe any challenges you faced and how you overcame them..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Development Areas */}
          <div className="space-y-2">
            <Label htmlFor="developmentAreas">Development Areas (Optional)</Label>
            <Textarea
              id="developmentAreas"
              value={developmentAreas}
              onChange={(e) => setDevelopmentAreas(e.target.value)}
              placeholder="Identify areas where you want to develop and grow..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Once submitted, your self-assessment will be visible to your manager and cannot be edited.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !canSubmit()}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Submit Self-Assessment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

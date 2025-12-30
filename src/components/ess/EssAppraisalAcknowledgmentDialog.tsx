import { useState } from "react";
import { format } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertTriangle,
  Star,
  Target,
  FileText,
  MessageSquare,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { MyAppraisal } from "@/hooks/useMyAppraisals";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { RatingDisputeDialog } from "@/components/performance/RatingDisputeDialog";
import { useAuth } from "@/contexts/AuthContext";

interface EssAppraisalAcknowledgmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: MyAppraisal;
  companyId: string;
  onSuccess?: () => void;
}

export function EssAppraisalAcknowledgmentDialog({
  open,
  onOpenChange,
  appraisal,
  companyId,
  onSuccess,
}: EssAppraisalAcknowledgmentDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [comments, setComments] = useState("");
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

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

  const handleAcknowledge = async () => {
    if (!acknowledged) {
      toast.error("Please acknowledge that you have reviewed your evaluation");
      return;
    }

    setLoading(true);
    try {
      // Parse existing comments and add acknowledgment
      let existingComments = {};
      try {
        if (appraisal.employee_comments) {
          existingComments = JSON.parse(appraisal.employee_comments);
        }
      } catch {
        existingComments = { originalComments: appraisal.employee_comments };
      }

      const updatedComments = JSON.stringify({
        ...existingComments,
        acknowledgmentComments: comments,
        acknowledgedAt: new Date().toISOString(),
      });

      const { error } = await supabase
        .from("appraisal_participants")
        .update({
          employee_comments: updatedComments,
          status: "acknowledged",
        })
        .eq("id", appraisal.id);

      if (error) throw error;

      toast.success("Rating acknowledged successfully");
      queryClient.invalidateQueries({ queryKey: ["my-appraisals"] });
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error acknowledging rating:", error);
      toast.error(error.message || "Failed to acknowledge rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Acknowledge Rating
            </DialogTitle>
            <DialogDescription>{appraisal.cycle_name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Overall Score */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Final Performance Score
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
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-6 w-6 mx-auto text-pink-500 mb-2" />
                  <p className="text-xs text-muted-foreground">Goals</p>
                  <p className={`text-xl font-bold ${getScoreColor(appraisal.goal_score)}`}>
                    {appraisal.goal_score?.toFixed(1) || "N/A"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                  <p className="text-xs text-muted-foreground">Competencies</p>
                  <p className={`text-xl font-bold ${getScoreColor(appraisal.competency_score)}`}>
                    {appraisal.competency_score?.toFixed(1) || "N/A"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                  <p className="text-xs text-muted-foreground">Responsibilities</p>
                  <p className={`text-xl font-bold ${getScoreColor(appraisal.responsibility_score)}`}>
                    {appraisal.responsibility_score?.toFixed(1) || "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Manager Feedback */}
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

            <Separator />

            {/* Acknowledgment */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="acknowledge" className="cursor-pointer font-medium">
                  I acknowledge that I have reviewed my performance evaluation
                </Label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you confirm you have reviewed your scores and feedback.
                </p>
              </div>
            </div>

            {/* Employee Comments */}
            <div className="space-y-2">
              <Label htmlFor="comments">Your Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments or feedback about your evaluation..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Dispute Notice */}
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  If you disagree with your rating, you may file a formal dispute.
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDisputeDialogOpen(true)}
                >
                  File Dispute
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAcknowledge}
              disabled={loading || !acknowledged}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {loading ? "Processing..." : "Confirm Acknowledgment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <RatingDisputeDialog
        open={disputeDialogOpen}
        onOpenChange={setDisputeDialogOpen}
        submissionId={appraisal.id}
        goalTitle={appraisal.cycle_name}
        companyId={companyId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["my-appraisals"] });
          onOpenChange(false);
        }}
      />
    </>
  );
}

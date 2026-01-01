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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AIHumanOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riskId: string;
  employeeName: string;
  currentRiskLevel: string;
  currentRiskScore: number;
  aiRecommendation: string;
  companyId: string;
  onOverrideComplete?: () => void;
}

type OverrideAction = "accept" | "modify" | "reject";
type ModifiedRiskLevel = "low" | "medium" | "high" | "critical";

const OVERRIDE_CATEGORIES = [
  { value: "additional_context", label: "Additional context not available to AI" },
  { value: "policy_exception", label: "Policy exception applies" },
  { value: "timing_factors", label: "Timing or situational factors" },
  { value: "data_quality", label: "Data quality concerns" },
  { value: "business_judgment", label: "Business judgment override" },
  { value: "other", label: "Other (specify in notes)" },
];

export function AIHumanOverrideDialog({
  open,
  onOpenChange,
  riskId,
  employeeName,
  currentRiskLevel,
  currentRiskScore,
  aiRecommendation,
  companyId,
  onOverrideComplete,
}: AIHumanOverrideDialogProps) {
  const { user } = useAuth();
  const [action, setAction] = useState<OverrideAction>("accept");
  const [modifiedRiskLevel, setModifiedRiskLevel] = useState<ModifiedRiskLevel>(currentRiskLevel as ModifiedRiskLevel);
  const [justificationCategory, setJustificationCategory] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (action !== "accept" && !overrideReason.trim()) {
      toast.error("Please provide a reason for the override");
      return;
    }

    if (action !== "accept" && !justificationCategory) {
      toast.error("Please select a justification category");
      return;
    }

    setIsSubmitting(true);

    try {
      // Log the human override
      const { error: overrideError } = await supabase
        .from("ai_human_overrides")
        .insert({
          company_id: companyId,
          overridden_by: user.id,
          original_ai_response: JSON.stringify({
            risk_level: currentRiskLevel,
            risk_score: currentRiskScore,
            recommendation: aiRecommendation,
          }),
          override_action: action,
          override_reason: overrideReason || "AI assessment accepted without modification",
          justification_category: justificationCategory || "accepted",
          modified_response: action === "modify" ? JSON.stringify({
            risk_level: modifiedRiskLevel,
            human_adjusted: true,
          }) : null,
          approval_required: action === "reject",
          approval_status: action === "accept" ? "approved" : "pending",
        });

      if (overrideError) throw overrideError;

      // Update the risk assessment if modified or rejected
      if (action === "modify") {
        const { error: updateError } = await supabase
          .from("employee_performance_risks")
          .update({
            risk_level: modifiedRiskLevel,
            is_acknowledged: true,
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user.id,
          })
          .eq("id", riskId);

        if (updateError) throw updateError;
      } else if (action === "reject") {
        const { error: updateError } = await supabase
          .from("employee_performance_risks")
          .update({
            is_active: false,
            resolution_notes: overrideReason,
            resolved_at: new Date().toISOString(),
            resolved_by: user.id,
          })
          .eq("id", riskId);

        if (updateError) throw updateError;
      } else {
        // Accept - just mark as acknowledged
        const { error: updateError } = await supabase
          .from("employee_performance_risks")
          .update({
            is_acknowledged: true,
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user.id,
          })
          .eq("id", riskId);

        if (updateError) throw updateError;
      }

      const actionLabels = {
        accept: "accepted",
        modify: "modified",
        reject: "dismissed",
      };

      toast.success(`AI assessment ${actionLabels[action]} successfully`);
      onOverrideComplete?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error processing override:", error);
      toast.error("Failed to process override");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Human Review & Override
          </DialogTitle>
          <DialogDescription>
            Review the AI risk assessment for {employeeName} and take action
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current AI Assessment */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">AI Assessment</p>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{currentRiskLevel.toUpperCase()} Risk</Badge>
              <span className="text-sm text-muted-foreground">Score: {currentRiskScore}</span>
            </div>
            <p className="text-sm text-muted-foreground">{aiRecommendation}</p>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Your Decision</Label>
            <RadioGroup value={action} onValueChange={(v) => setAction(v as OverrideAction)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="accept" id="accept" />
                <Label htmlFor="accept" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Accept AI Assessment</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confirm the AI's risk assessment is accurate
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="modify" id="modify" />
                <Label htmlFor="modify" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span>Modify Risk Level</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Adjust the risk level based on additional context
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    <span>Dismiss Assessment</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    The AI assessment is not applicable
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Modified Risk Level (if modifying) */}
          {action === "modify" && (
            <div className="space-y-3">
              <Label>Adjusted Risk Level</Label>
              <RadioGroup
                value={modifiedRiskLevel}
                onValueChange={(v) => setModifiedRiskLevel(v as ModifiedRiskLevel)}
                className="grid grid-cols-4 gap-2"
              >
                {(["low", "medium", "high", "critical"] as const).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={level} className="sr-only" />
                    <Label
                      htmlFor={level}
                      className={`w-full text-center py-2 px-3 border rounded-lg cursor-pointer transition-colors ${
                        modifiedRiskLevel === level
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Justification Category (if modifying or rejecting) */}
          {action !== "accept" && (
            <div className="space-y-3">
              <Label>Justification Category *</Label>
              <RadioGroup
                value={justificationCategory}
                onValueChange={setJustificationCategory}
                className="space-y-2"
              >
                {OVERRIDE_CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={category.value} id={category.value} />
                    <Label htmlFor={category.value} className="text-sm cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Override Reason */}
          {action !== "accept" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Justification *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you are overriding the AI assessment..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This will be logged for audit purposes (ISO 42001 compliance)
              </p>
            </div>
          )}

          {/* Audit Warning */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This action will be logged in the AI governance audit trail with your user ID and timestamp.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

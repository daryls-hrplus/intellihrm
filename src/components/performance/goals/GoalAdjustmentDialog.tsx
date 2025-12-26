import { useState } from "react";
import { FileEdit, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoalAdjustments } from "@/hooks/useGoalAdjustments";
import {
  ChangeType,
  AdjustmentReason,
  CHANGE_TYPE_LABELS,
  CHANGE_TYPE_DESCRIPTIONS,
  ADJUSTMENT_REASON_CATEGORIES,
  ADJUSTMENT_REASON_LABELS,
} from "@/types/goalAdjustments";

interface GoalAdjustmentDialogProps {
  goalId: string;
  goalTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  suggestedChangeType?: ChangeType;
}

export function GoalAdjustmentDialog({
  goalId,
  goalTitle,
  open,
  onOpenChange,
  previousValue,
  newValue,
  suggestedChangeType,
}: GoalAdjustmentDialogProps) {
  const { createAdjustment } = useGoalAdjustments(goalId);
  
  const [changeType, setChangeType] = useState<ChangeType>(suggestedChangeType || "target_revision");
  const [adjustmentReason, setAdjustmentReason] = useState<AdjustmentReason>("strategic_priority_shift");
  const [reasonDetails, setReasonDetails] = useState("");
  const [businessJustification, setBusinessJustification] = useState("");
  const [isMaterialChange, setIsMaterialChange] = useState(false);
  const [requiresRecalibration, setRequiresRecalibration] = useState(false);

  const isSubmitting = createAdjustment.isPending;

  const handleSubmit = async () => {
    await createAdjustment.mutateAsync({
      goal_id: goalId,
      change_type: changeType,
      adjustment_reason: adjustmentReason,
      reason_details: reasonDetails || undefined,
      previous_value: previousValue,
      new_value: newValue,
      business_justification: businessJustification || undefined,
      is_material_change: isMaterialChange,
      requires_recalibration: requiresRecalibration,
    });
    
    // Reset form
    setChangeType("target_revision");
    setAdjustmentReason("strategic_priority_shift");
    setReasonDetails("");
    setBusinessJustification("");
    setIsMaterialChange(false);
    setRequiresRecalibration(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Record Goal Adjustment
          </DialogTitle>
          <DialogDescription>
            Document the change being made to "{goalTitle}" for audit trail purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Change Type */}
          <div className="space-y-2">
            <Label>Change Type *</Label>
            <Select value={changeType} onValueChange={(v) => setChangeType(v as ChangeType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select change type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CHANGE_TYPE_LABELS) as ChangeType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {CHANGE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {CHANGE_TYPE_DESCRIPTIONS[changeType]}
            </p>
          </div>

          {/* Adjustment Reason */}
          <div className="space-y-2">
            <Label>Reason Category *</Label>
            <Select value={adjustmentReason} onValueChange={(v) => setAdjustmentReason(v as AdjustmentReason)}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ADJUSTMENT_REASON_CATEGORIES).map(([key, category]) => (
                  <SelectGroup key={key}>
                    <SelectLabel>{category.label}</SelectLabel>
                    {category.reasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {ADJUSTMENT_REASON_LABELS[reason]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Details */}
          <div className="space-y-2">
            <Label htmlFor="reason-details">Additional Details</Label>
            <Textarea
              id="reason-details"
              placeholder="Provide more context about why this change is needed..."
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={2}
            />
          </div>

          {/* Business Justification */}
          <div className="space-y-2">
            <Label htmlFor="business-justification">Business Justification</Label>
            <Textarea
              id="business-justification"
              placeholder="Explain the business impact and rationale..."
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              rows={2}
            />
          </div>

          {/* Material Change Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Material Change
              </Label>
              <p className="text-xs text-muted-foreground">
                Requires approval before the change takes effect
              </p>
            </div>
            <Switch
              checked={isMaterialChange}
              onCheckedChange={setIsMaterialChange}
            />
          </div>

          {/* Requires Recalibration Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label>Requires Recalibration</Label>
              <p className="text-xs text-muted-foreground">
                Mark if performance metrics need to be recalculated
              </p>
            </div>
            <Switch
              checked={requiresRecalibration}
              onCheckedChange={setRequiresRecalibration}
            />
          </div>

          {/* Value Changes Preview */}
          {(previousValue || newValue) && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <Label className="text-xs font-medium">Changes Being Recorded</Label>
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                {previousValue && (
                  <div>
                    <span className="text-muted-foreground">Previous:</span>
                    <pre className="mt-1 overflow-auto rounded bg-background p-2">
                      {JSON.stringify(previousValue, null, 2)}
                    </pre>
                  </div>
                )}
                {newValue && (
                  <div>
                    <span className="text-muted-foreground">New:</span>
                    <pre className="mt-1 overflow-auto rounded bg-background p-2">
                      {JSON.stringify(newValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Recording..." : isMaterialChange ? "Submit for Approval" : "Record Adjustment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

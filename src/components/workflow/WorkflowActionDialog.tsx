import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RotateCcw, AlertTriangle, PenLine } from "lucide-react";
import { WorkflowAction, WorkflowInstance, WorkflowStep } from "@/hooks/useWorkflow";

interface WorkflowActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: WorkflowInstance | null;
  currentStep: WorkflowStep | null;
  previousSteps?: WorkflowStep[];
  action: WorkflowAction | null;
  onConfirm: (options: {
    comment?: string;
    internalNotes?: string;
    returnToStep?: number;
    returnReason?: string;
    signatureText?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function WorkflowActionDialog({
  open,
  onOpenChange,
  instance,
  currentStep,
  previousSteps = [],
  action,
  onConfirm,
  isLoading = false,
}: WorkflowActionDialogProps) {
  const [comment, setComment] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);
  const [returnToStep, setReturnToStep] = useState<string>("");
  const [returnReason, setReturnReason] = useState("");

  const requiresSignature = currentStep?.requires_signature || false;
  const requiresComment = currentStep?.requires_comment || false;
  const isReturn = action === "return";

  const actionConfig: Record<WorkflowAction, { title: string; description: string; icon: React.ReactNode; variant: "default" | "destructive" | "outline" }> = {
    approve: {
      title: "Approve Request",
      description: "Approve this request and move it to the next step or complete the workflow.",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      variant: "default",
    },
    reject: {
      title: "Reject Request",
      description: "Reject this request. The workflow will be terminated.",
      icon: <XCircle className="h-5 w-5 text-destructive" />,
      variant: "destructive",
    },
    return: {
      title: "Return for Revision",
      description: "Send this request back to a previous step for revision.",
      icon: <RotateCcw className="h-5 w-5 text-amber-500" />,
      variant: "outline",
    },
    escalate: {
      title: "Escalate Request",
      description: "Escalate this request to a higher authority.",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      variant: "outline",
    },
    delegate: {
      title: "Delegate Request",
      description: "Delegate this request to another approver.",
      icon: <PenLine className="h-5 w-5 text-blue-500" />,
      variant: "outline",
    },
    comment: {
      title: "Add Comment",
      description: "Add a comment without taking action.",
      icon: <PenLine className="h-5 w-5 text-muted-foreground" />,
      variant: "outline",
    },
  };

  const config = action ? actionConfig[action] : null;

  const canSubmit = () => {
    if (requiresComment && !comment.trim()) return false;
    if (requiresSignature && (!signatureText.trim() || !signatureConfirmed)) return false;
    if (isReturn && (!returnToStep || !returnReason.trim())) return false;
    return true;
  };

  const handleSubmit = async () => {
    await onConfirm({
      comment: comment.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      signatureText: requiresSignature ? signatureText.trim() : undefined,
      returnToStep: isReturn ? parseInt(returnToStep) : undefined,
      returnReason: isReturn ? returnReason.trim() : undefined,
    });
    
    // Reset form
    setComment("");
    setInternalNotes("");
    setSignatureText("");
    setSignatureConfirmed(false);
    setReturnToStep("");
    setReturnReason("");
  };

  if (!action || !config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Step Info */}
          {currentStep && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Step</span>
                <Badge variant="outline">Step {currentStep.step_order}</Badge>
              </div>
              <p className="font-medium mt-1">{currentStep.name}</p>
            </div>
          )}

          {/* Return Step Selection */}
          {isReturn && previousSteps.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="return-step">Return to Step *</Label>
              <Select value={returnToStep} onValueChange={setReturnToStep}>
                <SelectTrigger>
                  <SelectValue placeholder="Select step to return to" />
                </SelectTrigger>
                <SelectContent>
                  {previousSteps.map((step) => (
                    <SelectItem key={step.id} value={step.step_order.toString()}>
                      Step {step.step_order}: {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Return Reason */}
          {isReturn && (
            <div className="space-y-2">
              <Label htmlFor="return-reason">Reason for Return *</Label>
              <Textarea
                id="return-reason"
                placeholder="Explain why this request needs revision..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Comments {requiresComment && "*"}
            </Label>
            <Textarea
              id="comment"
              placeholder="Add your comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label htmlFor="internal-notes">
              Internal Notes
              <span className="text-xs text-muted-foreground ml-2">(only visible to approvers)</span>
            </Label>
            <Textarea
              id="internal-notes"
              placeholder="Add internal notes..."
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Digital Signature */}
          {requiresSignature && (
            <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" />
                <Label className="font-medium">Digital Signature Required</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signature">Type your full name to sign *</Label>
                <Input
                  id="signature"
                  placeholder="Enter your full legal name"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirm-signature"
                  checked={signatureConfirmed}
                  onCheckedChange={(checked) => setSignatureConfirmed(checked === true)}
                />
                <label htmlFor="confirm-signature" className="text-sm text-muted-foreground leading-tight">
                  I confirm that this typed signature constitutes my legal electronic signature and has the same legal effect as a handwritten signature.
                </label>
              </div>

              <p className="text-xs text-muted-foreground">
                Timestamp and IP address will be recorded for audit purposes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={config.variant}
            onClick={handleSubmit}
            disabled={isLoading || !canSubmit()}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

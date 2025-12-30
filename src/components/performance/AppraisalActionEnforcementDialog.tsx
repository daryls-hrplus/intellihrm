import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAppraisalActionExecutions, AppraisalActionExecution, getRuleDescription } from "@/hooks/useAppraisalActionRules";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertOctagon,
  ChevronRight,
  Shield,
  Loader2 
} from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  onProceed: () => void;
  onCancel: () => void;
}

export function AppraisalActionEnforcementDialog({
  open,
  onOpenChange,
  participantId,
  onProceed,
  onCancel,
}: Props) {
  const { 
    pendingExecutions, 
    mandatoryPending, 
    advisoryPending, 
    isLoading,
    executeAction,
    overrideAction,
    dismissAction,
    hasBlockingActions,
  } = useAppraisalActionExecutions(participantId);

  const [overrideReason, setOverrideReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showOverrideForm, setShowOverrideForm] = useState<string | null>(null);

  const handleExecute = async (execution: AppraisalActionExecution) => {
    setProcessingId(execution.id);
    try {
      await executeAction({ executionId: execution.id });
    } finally {
      setProcessingId(null);
    }
  };

  const handleOverride = async (execution: AppraisalActionExecution) => {
    if (!overrideReason.trim()) return;
    
    setProcessingId(execution.id);
    try {
      await overrideAction({ 
        executionId: execution.id, 
        reason: overrideReason,
        approvedBy: "current-user-id", // This should come from auth context
      });
      setShowOverrideForm(null);
      setOverrideReason("");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (execution: AppraisalActionExecution) => {
    setProcessingId(execution.id);
    try {
      await dismissAction(execution.id);
    } finally {
      setProcessingId(null);
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "create_idp":
      case "create_pip":
        return <FileText className="h-4 w-4" />;
      case "block_finalization":
        return <AlertOctagon className="h-4 w-4" />;
      case "require_comment":
        return <FileText className="h-4 w-4" />;
      default:
        return <ChevronRight className="h-4 w-4" />;
    }
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case "create_idp": return "Create Development Plan";
      case "create_pip": return "Start PIP";
      case "suggest_succession": return "Suggest for Succession";
      case "block_finalization": return "Add Required Comment";
      case "require_comment": return "Add Comment";
      case "notify_hr": return "Acknowledge";
      case "schedule_coaching": return "Schedule Session";
      case "require_development_plan": return "Create Plan";
      default: return "Execute";
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // No actions to show
  if (pendingExecutions.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Ready to Finalize
            </DialogTitle>
            <DialogDescription>
              No action rules were triggered. You may proceed with finalizing this appraisal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={onProceed}>Proceed to Finalize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Action Requirements
          </DialogTitle>
          <DialogDescription>
            The following actions have been triggered based on appraisal scores
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mandatory Actions (Blocking) */}
          {mandatoryPending.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-destructive">Required Actions</h3>
                <Badge variant="destructive">{mandatoryPending.length}</Badge>
              </div>
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Blocking Actions</AlertTitle>
                <AlertDescription>
                  The following actions must be completed or overridden before finalizing.
                </AlertDescription>
              </Alert>

              {mandatoryPending.map((execution) => (
                <Card key={execution.id} className="border-destructive/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getActionIcon(execution.rule?.action_type || "")}
                        {execution.rule?.rule_name}
                      </CardTitle>
                      <Badge variant="destructive">Mandatory</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {execution.rule && getRuleDescription(execution.rule)}
                    </div>

                    {execution.rule?.action_message && (
                      <Alert>
                        <AlertDescription>{execution.rule.action_message}</AlertDescription>
                      </Alert>
                    )}

                    <div className="text-sm">
                      <span className="text-muted-foreground">Triggered Score:</span>{" "}
                      <span className="font-mono">{execution.triggered_score}</span>
                      {execution.triggered_section && (
                        <span className="text-muted-foreground"> ({execution.triggered_section})</span>
                      )}
                    </div>

                    {showOverrideForm === execution.id ? (
                      <div className="space-y-3 pt-2 border-t">
                        <Label>Override Justification</Label>
                        <Textarea
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          placeholder="Explain why this action is being overridden..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleOverride(execution)}
                            disabled={!overrideReason.trim() || processingId === execution.id}
                          >
                            {processingId === execution.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Confirm Override
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setShowOverrideForm(null);
                              setOverrideReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm"
                          onClick={() => handleExecute(execution)}
                          disabled={processingId === execution.id}
                        >
                          {processingId === execution.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {getActionLabel(execution.rule?.action_type || "")}
                        </Button>
                        {execution.rule?.requires_hr_override && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowOverrideForm(execution.id)}
                          >
                            HR Override
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {mandatoryPending.length > 0 && advisoryPending.length > 0 && (
            <Separator />
          )}

          {/* Advisory Actions (Non-Blocking) */}
          {advisoryPending.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Recommended Actions</h3>
                <Badge variant="secondary">{advisoryPending.length}</Badge>
              </div>

              <Alert>
                <AlertDescription>
                  These actions are recommended but not required to finalize.
                </AlertDescription>
              </Alert>

              {advisoryPending.map((execution) => (
                <Card key={execution.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getActionIcon(execution.rule?.action_type || "")}
                        {execution.rule?.rule_name}
                      </CardTitle>
                      <Badge variant="secondary">Advisory</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {execution.rule && getRuleDescription(execution.rule)}
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Triggered Score:</span>{" "}
                      <span className="font-mono">{execution.triggered_score}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleExecute(execution)}
                        disabled={processingId === execution.id}
                      >
                        {processingId === execution.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {getActionLabel(execution.rule?.action_type || "")}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDismiss(execution)}
                        disabled={processingId === execution.id}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            onClick={onProceed} 
            disabled={hasBlockingActions}
            className={hasBlockingActions ? "opacity-50" : ""}
          >
            {hasBlockingActions ? (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Complete Required Actions
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Proceed to Finalize
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, XCircle, Info, FileText } from "lucide-react";
import { usePolicyEnforcement } from "@/hooks/usePolicyEnforcement";

interface PolicyViolation {
  rule_id: string;
  rule_type: string;
  severity: "info" | "warning" | "error";
  message: string;
  document_title: string;
  can_override: boolean;
}

interface PolicyEnforcementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violations: PolicyViolation[];
  warnings: PolicyViolation[];
  actionContext: string;
  onProceed: () => void;
  onCancel: () => void;
}

export function PolicyEnforcementDialog({
  open,
  onOpenChange,
  violations,
  warnings,
  actionContext,
  onProceed,
  onCancel,
}: PolicyEnforcementDialogProps) {
  const [justification, setJustification] = useState("");
  const { logEnforcementAction } = usePolicyEnforcement();
  const hasBlockingViolations = violations.length > 0;
  const allItems = [...violations, ...warnings];

  const handleProceed = async () => {
    // Log all warnings as overridden
    for (const warning of warnings) {
      await logEnforcementAction(
        warning.rule_id,
        actionContext,
        warning.message,
        "overridden",
        justification
      );
    }
    onProceed();
    onOpenChange(false);
    setJustification("");
  };

  const handleCancel = async () => {
    // Log all items as cancelled
    for (const item of allItems) {
      await logEnforcementAction(
        item.rule_id,
        actionContext,
        item.message,
        "cancelled"
      );
    }
    onCancel();
    onOpenChange(false);
    setJustification("");
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Policy {hasBlockingViolations ? "Violation" : "Warning"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasBlockingViolations
              ? "This action violates company policy and cannot proceed."
              : "This action may conflict with company policies. Please review before proceeding."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {allItems.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                item.severity === "error"
                  ? "border-destructive/50 bg-destructive/5"
                  : item.severity === "warning"
                  ? "border-yellow-500/50 bg-yellow-500/5"
                  : "border-blue-500/50 bg-blue-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(item.severity)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {item.document_title}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        item.severity === "error"
                          ? "bg-destructive/10 text-destructive"
                          : item.severity === "warning"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : ""
                      }`}
                    >
                      {item.rule_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!hasBlockingViolations && warnings.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="justification">
                Justification for Override (Required)
              </Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Please explain why you need to proceed despite the policy warning..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          {!hasBlockingViolations && (
            <AlertDialogAction
              onClick={handleProceed}
              disabled={!justification.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Proceed Anyway
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

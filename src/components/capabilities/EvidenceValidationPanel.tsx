import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  UserCheck,
  Users,
  GraduationCap,
  Award,
  FolderGit2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Shield,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, addMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Evidence {
  id: string;
  employee_id: string;
  capability_id: string;
  evidence_source: string;
  proficiency_level: number;
  confidence_score: number;
  validation_status: string;
  validated_by: string | null;
  validated_at: string | null;
  evidence_reference: any;
  notes: string | null;
  effective_from: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  capability?: {
    name: string;
    code: string;
    type: string;
  };
  validator?: {
    full_name: string;
  };
}

interface EvidenceValidationPanelProps {
  evidence: Evidence[];
  onValidate?: (evidenceId: string, status: "validated" | "rejected", notes: string) => void;
  canValidate?: boolean;
  isLoading?: boolean;
}

const sourceConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  self_declared: { icon: User, label: "Self-Declared", color: "bg-blue-500/10 text-blue-600" },
  manager_assessment: { icon: UserCheck, label: "Manager", color: "bg-green-500/10 text-green-600" },
  "360_feedback": { icon: Users, label: "360 Feedback", color: "bg-purple-500/10 text-purple-600" },
  formal_assessment: { icon: Shield, label: "Formal Assessment", color: "bg-indigo-500/10 text-indigo-600" },
  training_completion: { icon: GraduationCap, label: "Training", color: "bg-amber-500/10 text-amber-600" },
  certification: { icon: Award, label: "Certification", color: "bg-emerald-500/10 text-emerald-600" },
  project_history: { icon: FolderGit2, label: "Project", color: "bg-slate-500/10 text-slate-600" },
  ai_inference: { icon: Sparkles, label: "AI Inferred", color: "bg-pink-500/10 text-pink-600" },
};

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  validated: { icon: CheckCircle2, label: "Validated", color: "bg-green-500/10 text-green-600" },
  rejected: { icon: XCircle, label: "Rejected", color: "bg-destructive/10 text-destructive" },
  expired: { icon: AlertTriangle, label: "Expired", color: "bg-orange-500/10 text-orange-600" },
};

export function EvidenceValidationPanel({
  evidence,
  onValidate,
  canValidate = false,
  isLoading = false,
}: EvidenceValidationPanelProps) {
  const [validationDialog, setValidationDialog] = useState<{
    open: boolean;
    evidenceId: string;
    action: "validate" | "reject";
  }>({ open: false, evidenceId: "", action: "validate" });
  const [validationNotes, setValidationNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidationSubmit = async () => {
    if (!onValidate) return;
    
    setIsSubmitting(true);
    try {
      const status = validationDialog.action === "validate" ? "validated" : "rejected";
      await onValidate(validationDialog.evidenceId, status, validationNotes);
      setValidationDialog({ open: false, evidenceId: "", action: "validate" });
      setValidationNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const warningDate = addMonths(now, 3);

    if (isPast(expiryDate)) {
      return { status: "expired", message: "Expired" };
    }
    if (expiryDate <= warningDate) {
      return { 
        status: "warning", 
        message: `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}` 
      };
    }
    return null;
  };

  const groupedEvidence = evidence.reduce((acc, ev) => {
    const source = ev.evidence_source;
    if (!acc[source]) acc[source] = [];
    acc[source].push(ev);
    return acc;
  }, {} as Record<string, Evidence[]>);

  // Calculate aggregate confidence
  const avgConfidence = evidence.length > 0
    ? evidence.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / evidence.length
    : 0;

  const validatedCount = evidence.filter(e => e.validation_status === "validated").length;
  const pendingCount = evidence.filter(e => e.validation_status === "pending").length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading evidence...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Evidence & Validation
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {evidence.length} Sources
              </Badge>
              {pendingCount > 0 && canValidate && (
                <Badge variant="secondary" className="text-xs">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Aggregate Stats */}
          <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-accent/30">
            <div>
              <p className="text-xs text-muted-foreground">Avg Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={avgConfidence * 100} className="h-2 flex-1" />
                <span className="text-sm font-medium">{Math.round(avgConfidence * 100)}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Validated</p>
              <p className="text-lg font-semibold text-green-600">{validatedCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-semibold text-yellow-600">{pendingCount}</p>
            </div>
          </div>

          {/* Evidence List */}
          <ScrollArea className="h-[350px] pr-3">
            {Object.entries(groupedEvidence).map(([source, items]) => {
              const config = sourceConfig[source] || sourceConfig.self_declared;
              const Icon = config.icon;

              return (
                <div key={source} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {items.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 ml-6">
                    {items.map((ev) => {
                      const status = statusConfig[ev.validation_status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const expiry = getExpiryStatus(ev.expires_at);

                      return (
                        <div
                          key={ev.id}
                          className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {/* Capability Name */}
                              {ev.capability && (
                                <p className="text-sm font-medium truncate">
                                  {ev.capability.name}
                                </p>
                              )}

                              {/* Level & Confidence */}
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>Level {ev.proficiency_level}</span>
                                <span>•</span>
                                <span>{Math.round((ev.confidence_score || 0) * 100)}% confidence</span>
                              </div>

                              {/* Dates */}
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {format(new Date(ev.effective_from), "MMM d, yyyy")}
                                </span>
                                {expiry && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ml-2 ${
                                      expiry.status === "expired"
                                        ? "text-destructive border-destructive"
                                        : "text-amber-600 border-amber-300"
                                    }`}
                                  >
                                    {expiry.message}
                                  </Badge>
                                )}
                              </div>

                              {/* Notes */}
                              {ev.notes && (
                                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                  {ev.notes}
                                </p>
                              )}

                              {/* Validator Info */}
                              {ev.validated_by && ev.validator && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Validated by {ev.validator.full_name}
                                  {ev.validated_at && ` on ${format(new Date(ev.validated_at), "MMM d, yyyy")}`}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              {/* Status Badge */}
                              <Badge variant="outline" className={`text-xs ${status.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>

                              {/* Validation Actions */}
                              {canValidate && ev.validation_status === "pending" && (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() =>
                                      setValidationDialog({
                                        open: true,
                                        evidenceId: ev.id,
                                        action: "validate",
                                      })
                                    }
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() =>
                                      setValidationDialog({
                                        open: true,
                                        evidenceId: ev.id,
                                        action: "reject",
                                      })
                                    }
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {evidence.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No evidence recorded</p>
                <p className="text-xs">Evidence will appear here as assessments are completed</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Validation Dialog */}
      <Dialog
        open={validationDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setValidationDialog({ open: false, evidenceId: "", action: "validate" });
            setValidationNotes("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {validationDialog.action === "validate" ? "Validate Evidence" : "Reject Evidence"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {validationDialog.action === "validate"
                ? "Confirm that this evidence is accurate and valid."
                : "Provide a reason for rejecting this evidence."}
            </p>

            <Textarea
              placeholder={
                validationDialog.action === "validate"
                  ? "Optional notes about this validation..."
                  : "Reason for rejection (required)..."
              }
              value={validationNotes}
              onChange={(e) => setValidationNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setValidationDialog({ open: false, evidenceId: "", action: "validate" });
                setValidationNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={validationDialog.action === "validate" ? "default" : "destructive"}
              onClick={handleValidationSubmit}
              disabled={isSubmitting || (validationDialog.action === "reject" && !validationNotes.trim())}
            >
              {isSubmitting
                ? "Submitting..."
                : validationDialog.action === "validate"
                ? "Validate"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

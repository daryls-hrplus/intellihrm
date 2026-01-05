import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, Clock, XCircle, RotateCcw, AlertTriangle, User, GitBranch } from "lucide-react";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { WorkflowTimeline } from "@/components/workflow/WorkflowTimeline";
import { WorkflowSlaIndicator } from "@/components/workflow/WorkflowSlaIndicator";
import type { WorkflowStepAction } from "@/hooks/useWorkflow";

interface LeaveWorkflowProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRequestId: string;
  leaveRequestNumber?: string;
}

interface WorkflowInstanceData {
  id: string;
  status: string;
  current_step_order: number;
  initiated_at: string;
  completed_at: string | null;
  final_action: string | null;
  current_step_started_at: string | null;
  current_step_deadline_at: string | null;
  sla_status: string;
  template: {
    name: string;
    code: string;
  } | null;
  current_step: {
    id: string;
    name: string;
    step_order: number;
    escalation_hours: number | null;
    sla_warning_hours: number | null;
    sla_critical_hours: number | null;
  } | null;
  steps: Array<{
    id: string;
    name: string;
    step_order: number;
    approver_type: string;
  }>;
}

interface StepProgress {
  step_order: number;
  name: string;
  status: "completed" | "current" | "pending";
  approver_name?: string;
  action?: string;
  acted_at?: string;
}

export function LeaveWorkflowProgressDialog({
  open,
  onOpenChange,
  leaveRequestId,
  leaveRequestNumber,
}: LeaveWorkflowProgressDialogProps) {
  const [loading, setLoading] = useState(true);
  const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstanceData | null>(null);
  const [actions, setActions] = useState<WorkflowStepAction[]>([]);
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);

  useEffect(() => {
    if (open && leaveRequestId) {
      fetchWorkflowData();
    }
  }, [open, leaveRequestId]);

  const fetchWorkflowData = async () => {
    setLoading(true);
    try {
      // Fetch workflow instance for this leave request
      const { data: instance, error: instanceError } = await supabase
        .from("workflow_instances")
        .select(`
          id,
          status,
          current_step_order,
          initiated_at,
          completed_at,
          final_action,
          current_step_started_at,
          current_step_deadline_at,
          sla_status,
          template:workflow_templates(name, code),
          current_step:workflow_steps!workflow_instances_current_step_id_fkey(
            id, name, step_order, escalation_hours, sla_warning_hours, sla_critical_hours
          )
        `)
        .eq("reference_type", "leave_request")
        .eq("reference_id", leaveRequestId)
        .order("initiated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (instanceError) throw instanceError;

      if (instance) {
        // Fetch all steps for this workflow template
        const { data: steps } = await supabase
          .from("workflow_steps")
          .select("id, name, step_order, approver_type")
          .eq("template_id", instance.template?.code ? undefined : instance.id)
          .order("step_order");

        // Actually fetch steps by template
        const { data: templateSteps } = await supabase
          .from("workflow_steps")
          .select("id, name, step_order, approver_type")
          .eq("template_id", (instance as any).template_id || instance.id)
          .eq("is_active", true)
          .order("step_order");

        // Fetch actions/history
        const { data: actionsData } = await supabase
          .from("workflow_step_actions")
          .select(`
            id,
            instance_id,
            step_id,
            step_order,
            action,
            actor_id,
            acted_at,
            comment,
            internal_notes,
            delegated_to,
            delegation_reason,
            return_to_step,
            return_reason,
            actor:profiles!workflow_step_actions_actor_id_fkey(full_name, email)
          `)
          .eq("instance_id", instance.id)
          .order("acted_at", { ascending: true });

        setWorkflowInstance({
          ...instance,
          template: instance.template as any,
          current_step: instance.current_step as any,
          steps: templateSteps || [],
        });

        setActions((actionsData || []) as unknown as WorkflowStepAction[]);

        // Build step progress
        const progress: StepProgress[] = (templateSteps || []).map((step) => {
          const stepAction = (actionsData || []).find(
            (a) => a.step_order === step.step_order && a.action !== "comment"
          );
          
          let status: "completed" | "current" | "pending" = "pending";
          if (stepAction && stepAction.action !== "comment") {
            status = "completed";
          } else if (step.step_order === instance.current_step_order) {
            status = instance.status === "approved" || instance.status === "rejected" 
              ? "completed" 
              : "current";
          } else if (step.step_order < instance.current_step_order) {
            status = "completed";
          }

          return {
            step_order: step.step_order,
            name: step.name,
            status,
            approver_name: stepAction?.actor?.full_name,
            action: stepAction?.action,
            acted_at: stepAction?.acted_at,
          };
        });

        setStepProgress(progress);
      } else {
        setWorkflowInstance(null);
        setActions([]);
        setStepProgress([]);
      }
    } catch (error) {
      console.error("Failed to fetch workflow data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      in_progress: { variant: "secondary", label: "In Progress" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      returned: { variant: "outline", label: "Returned" },
      escalated: { variant: "secondary", label: "Escalated" },
      cancelled: { variant: "secondary", label: "Cancelled" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStepIcon = (status: "completed" | "current" | "pending", action?: string) => {
    if (status === "completed") {
      if (action === "reject") {
        return <XCircle className="h-5 w-5 text-destructive" />;
      }
      if (action === "return") {
        return <RotateCcw className="h-5 w-5 text-amber-500" />;
      }
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (status === "current") {
      return <Clock className="h-5 w-5 text-primary animate-pulse" />;
    }
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Approval Progress
            {leaveRequestNumber && (
              <span className="text-muted-foreground font-normal">
                - {leaveRequestNumber}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Track the approval status of your leave request
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !workflowInstance ? (
          <div className="text-center py-12 text-muted-foreground">
            <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No workflow found</p>
            <p className="text-sm">This leave request may not have an active approval workflow.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Workflow Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(workflowInstance.status)}
                  {workflowInstance.template && (
                    <span className="text-sm text-muted-foreground">
                      ({workflowInstance.template.name})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-sm font-medium">
                  {formatDateForDisplay(workflowInstance.initiated_at, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* SLA Indicator for current step */}
            {workflowInstance.status !== "approved" && 
             workflowInstance.status !== "rejected" && 
             workflowInstance.current_step && (
              <WorkflowSlaIndicator
                stepStartedAt={workflowInstance.current_step_started_at}
                stepDeadlineAt={workflowInstance.current_step_deadline_at}
                escalationHours={workflowInstance.current_step.escalation_hours}
                slaWarningHours={workflowInstance.current_step.sla_warning_hours}
                slaCriticalHours={workflowInstance.current_step.sla_critical_hours}
                variant="detailed"
              />
            )}

            {/* Step Progress Visualization */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Approval Steps</h4>
              <div className="relative">
                {stepProgress.map((step, index) => (
                  <div key={step.step_order} className="flex gap-4 pb-4">
                    {/* Connector line */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background"
                        style={{
                          borderColor: step.status === "completed" 
                            ? (step.action === "reject" ? "hsl(var(--destructive))" : "hsl(142.1 76.2% 36.3%)") 
                            : step.status === "current" 
                              ? "hsl(var(--primary))" 
                              : "hsl(var(--muted-foreground) / 0.3)"
                        }}
                      >
                        {getStepIcon(step.status, step.action)}
                      </div>
                      {index < stepProgress.length - 1 && (
                        <div 
                          className="w-0.5 flex-1 mt-2"
                          style={{
                            backgroundColor: step.status === "completed" 
                              ? "hsl(142.1 76.2% 36.3%)" 
                              : "hsl(var(--muted-foreground) / 0.2)"
                          }}
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{step.name}</p>
                          <p className="text-sm text-muted-foreground">Step {step.step_order}</p>
                        </div>
                        {step.status === "completed" && step.action && (
                          <Badge variant={step.action === "approve" ? "default" : step.action === "reject" ? "destructive" : "secondary"}>
                            {step.action.charAt(0).toUpperCase() + step.action.slice(1)}
                          </Badge>
                        )}
                        {step.status === "current" && (
                          <Badge variant="outline" className="animate-pulse">
                            Awaiting Approval
                          </Badge>
                        )}
                      </div>
                      
                      {step.approver_name && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {step.approver_name}
                          {step.acted_at && (
                            <span className="text-xs">
                              • {formatDateForDisplay(step.acted_at, "MMM d, h:mm a")}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed info */}
            {workflowInstance.completed_at && (
              <>
                <Separator />
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Final Outcome</p>
                    <p className="font-medium capitalize">{workflowInstance.final_action || workflowInstance.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-sm font-medium">
                      {formatDateForDisplay(workflowInstance.completed_at, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Detailed Timeline */}
            {actions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Activity Timeline</h4>
                  <WorkflowTimeline actions={actions} showInternalNotes={false} />
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

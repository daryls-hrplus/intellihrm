import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, RotateCcw, Clock, User, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { WorkflowInstance, WorkflowStep, useWorkflow, CrossCompanyPathEntry, SlaStatus } from "@/hooks/useWorkflow";
import { WorkflowStatusBadge } from "./WorkflowStatusBadge";
import { WorkflowActionDialog } from "./WorkflowActionDialog";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { LeaveApprovalContext } from "@/components/leave/LeaveApprovalContext";
import { CrossCompanyBadge } from "./CrossCompanyBadge";
import { WorkflowSlaIndicator } from "./WorkflowSlaIndicator";
import type { WorkflowAction, WorkflowStepAction } from "@/hooks/useWorkflow";

interface WorkflowApprovalCardProps {
  instance: WorkflowInstance;
  currentStep: WorkflowStep | null;
  allSteps?: WorkflowStep[];
  actions?: WorkflowStepAction[];
  canAct?: boolean;
  onActionComplete?: () => void;
  showDetails?: boolean;
}

export function WorkflowApprovalCard({
  instance,
  currentStep,
  allSteps = [],
  actions = [],
  canAct = false,
  onActionComplete,
  showDetails = true,
}: WorkflowApprovalCardProps) {
  const { takeAction, isLoading } = useWorkflow();
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const previousSteps = allSteps.filter(
    (step) => step.step_order < (currentStep?.step_order || 1)
  );

  const handleAction = async (options: {
    comment?: string;
    internalNotes?: string;
    returnToStep?: number;
    returnReason?: string;
    signatureText?: string;
  }) => {
    if (!selectedAction) return;

    const success = await takeAction(instance.id, selectedAction, options);
    if (success) {
      setSelectedAction(null);
      onActionComplete?.();
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      leave_request: "Leave Request",
      probation_confirmation: "Probation Confirmation",
      headcount_request: "Headcount Request",
      training_request: "Training Request",
      promotion: "Promotion",
      transfer: "Transfer",
      resignation: "Resignation",
      termination: "Termination",
      expense_claim: "Expense Claim",
      letter_request: "Letter Request",
      general: "General",
    };
    return labels[category] || category;
  };

  const isActionable = ["pending", "in_progress", "escalated", "returned"].includes(instance.status);
  
  // Check if this is a leave request workflow
  const isLeaveRequest = instance.category === "leave_request";
  const leaveMetadata = instance.metadata as Record<string, unknown> | null;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">
                  {instance.template?.name || getCategoryLabel(instance.category)}
                </CardTitle>
                <WorkflowStatusBadge status={instance.status} />
                <CrossCompanyBadge
                  isCrossCompany={instance.is_cross_company || false}
                  originCompanyName={instance.origin_company?.name}
                  crossCompanyPath={(instance.cross_company_path as CrossCompanyPathEntry[]) || []}
                />
              </div>
              <CardDescription>
                Initiated by {instance.initiator?.full_name || "Unknown"} • {" "}
                {formatDistanceToNow(new Date(instance.initiated_at), { addSuffix: true })}
                {instance.origin_company?.name && (
                  <span className="ml-2">
                    <Building2 className="h-3 w-3 inline mr-1" />
                    {instance.origin_company.name}
                  </span>
                )}
              </CardDescription>
            </div>
            {currentStep && (
              <Badge variant="outline" className="shrink-0">
                Step {instance.current_step_order}: {currentStep.name}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* SLA Status Indicator */}
          {isActionable && currentStep && (
            <WorkflowSlaIndicator
              stepStartedAt={instance.current_step_started_at}
              stepDeadlineAt={instance.current_step_deadline_at}
              escalationHours={currentStep.escalation_hours}
              slaWarningHours={currentStep.sla_warning_hours}
              slaCriticalHours={currentStep.sla_critical_hours}
              slaStatus={instance.sla_status as SlaStatus}
              variant="detailed"
            />
          )}

          {/* Deadline Warning */}
          {instance.auto_terminate_at && isActionable && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              <span>
                Auto-terminates{" "}
                {formatDistanceToNow(new Date(instance.auto_terminate_at), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Step Progress */}
          {allSteps.length > 0 && showDetails && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {allSteps.map((step, index) => {
                  const hasTargetCompany = step.target_company_id && step.target_company_id !== instance.company_id;
                  
                  return (
                    <div key={step.id} className="flex items-center gap-2">
                      <div className="relative">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            step.step_order < instance.current_step_order
                              ? "bg-green-500 text-white"
                              : step.step_order === instance.current_step_order
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {step.step_order < instance.current_step_order ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            step.step_order
                          )}
                        </div>
                        {hasTargetCompany && (
                          <Building2 className="h-3 w-3 absolute -top-1 -right-1 text-amber-500" />
                        )}
                      </div>
                      {index < allSteps.length - 1 && (
                        <div
                          className={`h-0.5 w-8 ${
                            step.step_order < instance.current_step_order
                              ? "bg-green-500"
                              : hasTargetCompany
                              ? "bg-amber-300"
                              : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leave Request Context */}
          {isLeaveRequest && canAct && leaveMetadata && showDetails && (
            <LeaveApprovalContext
              employeeId={leaveMetadata.employee_id as string}
              leaveTypeId={leaveMetadata.leave_type_id as string}
              startDate={leaveMetadata.start_date as string}
              endDate={leaveMetadata.end_date as string}
              duration={leaveMetadata.duration as number}
              departmentId={leaveMetadata.department_id as string | undefined}
              companyId={leaveMetadata.company_id as string | undefined}
            />
          )}

          {/* Action Buttons */}
          {canAct && isActionable && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => setSelectedAction("approve")}
                className="gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setSelectedAction("reject")}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
              {instance.template?.allow_return_to_previous && previousSteps.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAction("return")}
                  className="gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  Return
                </Button>
              )}
            </div>
          )}

          {/* History Toggle */}
          {actions.length > 0 && showDetails && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full justify-between"
              >
                <span>Workflow History ({actions.length} actions)</span>
                {showHistory ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              {showHistory && (
                <div className="pt-2">
                  <WorkflowTimeline actions={actions} showInternalNotes={canAct} />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <WorkflowActionDialog
        open={selectedAction !== null}
        onOpenChange={(open) => !open && setSelectedAction(null)}
        instance={instance}
        currentStep={currentStep}
        previousSteps={previousSteps}
        action={selectedAction}
        onConfirm={handleAction}
        isLoading={isLoading}
      />
    </>
  );
}

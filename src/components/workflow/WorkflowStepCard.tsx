import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  Building2,
  Briefcase,
  Users,
  UserCircle,
  Shield,
  Clock,
  AlertTriangle,
  PenTool,
  MessageSquare,
  ArrowRightLeft,
  Pencil,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { WorkflowStep } from "@/hooks/useWorkflow";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface WorkflowStepCardProps {
  step: WorkflowStep;
  positions?: { id: string; title: string }[];
  roles?: { id: string; name: string }[];
  governanceBodies?: { id: string; name: string }[];
  users?: { id: string; full_name: string; email: string }[];
  workflowApprovalRoles?: { id: string; name: string; code: string }[];
  onEdit?: (step: WorkflowStep) => void;
  onDelete?: (stepId: string) => void;
  readonly?: boolean;
}

const APPROVER_TYPE_CONFIG: Record<string, { icon: typeof User; label: string; color: string }> = {
  manager: { icon: User, label: "Direct Manager", color: "text-blue-600" },
  hr: { icon: Building2, label: "HR Manager", color: "text-purple-600" },
  position: { icon: Briefcase, label: "Specific Position", color: "text-green-600" },
  workflow_role: { icon: Users, label: "Workflow Approval Role", color: "text-orange-600" },
  role: { icon: Shield, label: "System Role", color: "text-red-600" },
  governance_body: { icon: Users, label: "Governance Body", color: "text-indigo-600" },
  specific_user: { icon: UserCircle, label: "Specific User", color: "text-teal-600" },
};

const ESCALATION_ACTION_LABELS: Record<string, string> = {
  notify_alternate: "Notify Alternate",
  escalate_up: "Escalate Up",
  auto_approve: "Auto-Approve",
  auto_reject: "Auto-Reject",
  terminate: "Terminate Workflow",
};

export function WorkflowStepCard({
  step,
  positions = [],
  roles = [],
  governanceBodies = [],
  users = [],
  workflowApprovalRoles = [],
  onEdit,
  onDelete,
  readonly = false,
}: WorkflowStepCardProps) {
  const approverConfig = APPROVER_TYPE_CONFIG[step.approver_type] || {
    icon: User,
    label: step.approver_type,
    color: "text-muted-foreground",
  };
  const ApproverIcon = approverConfig.icon;

  // Get approver detail text
  const getApproverDetail = () => {
    switch (step.approver_type) {
      case "position":
        const position = positions.find(p => p.id === step.approver_position_id);
        return position?.title || "Position not set";
      case "workflow_role":
        const workflowRole = workflowApprovalRoles.find(r => r.id === step.workflow_approval_role_id);
        return workflowRole?.name || "Role not set";
      case "role":
        const role = roles.find(r => r.id === step.approver_role_id);
        return role?.name || "Role not set";
      case "governance_body":
        const body = governanceBodies.find(b => b.id === step.approver_governance_body_id);
        return body?.name || "Governance body not set";
      case "specific_user":
        const user = users.find(u => u.id === step.approver_user_id);
        return user?.full_name || user?.email || "User not set";
      case "manager":
        return step.use_reporting_line ? "Via Reporting Line" : "Direct Manager";
      case "hr":
        return "HR Department";
      default:
        return null;
    }
  };

  // Check if step is date-active
  const today = new Date().toISOString().split('T')[0];
  const isDateActive = true; // Steps don't have their own dates, but templates do

  return (
    <Card className={`border-l-4 ${step.is_active ? 'border-l-primary' : 'border-l-muted'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Step Order Badge */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
              {step.step_order}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{step.name}</h4>
                  {!step.is_active && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
                {step.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {!readonly && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onEdit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(step)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Step</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {onDelete && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(step.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Step</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>

            {/* Approver Info Row */}
            <div className="flex items-center gap-2 text-sm">
              <ApproverIcon className={`h-4 w-4 ${approverConfig.color}`} />
              <span className="font-medium">{approverConfig.label}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-muted-foreground">{getApproverDetail()}</span>
            </div>

            {/* Features & Settings Row */}
            <div className="flex flex-wrap gap-2">
              {/* Escalation */}
              {step.escalation_hours && step.escalation_action && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200 bg-orange-50">
                        <Clock className="h-3 w-3" />
                        {step.escalation_hours}h → {ESCALATION_ACTION_LABELS[step.escalation_action] || step.escalation_action}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Escalates after {step.escalation_hours} hours
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* SLA Warning */}
              {step.sla_warning_hours && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-3 w-3" />
                        Warning: {step.sla_warning_hours}h
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      SLA warning at {step.sla_warning_hours} hours
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* SLA Critical */}
              {step.sla_critical_hours && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1 text-red-600 border-red-200 bg-red-50">
                        <AlertTriangle className="h-3 w-3" />
                        Critical: {step.sla_critical_hours}h
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      SLA critical at {step.sla_critical_hours} hours
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Expiration Days */}
              {step.expiration_days && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires: {step.expiration_days}d
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Step expires after {step.expiration_days} days
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Requires Signature */}
              {step.requires_signature && (
                <Badge variant="secondary" className="gap-1">
                  <PenTool className="h-3 w-3" />
                  Signature
                </Badge>
              )}

              {/* Requires Comment */}
              {step.requires_comment && (
                <Badge variant="secondary" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Comment
                </Badge>
              )}

              {/* Can Delegate */}
              {step.can_delegate && (
                <Badge variant="secondary" className="gap-1">
                  <ArrowRightLeft className="h-3 w-3" />
                  Delegate
                </Badge>
              )}
            </div>

            {/* Scope Restrictions */}
            {(step.company_id || step.department_id || step.section_id || step.target_company_id) && (
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {step.company_id && (
                  <span className="px-2 py-0.5 bg-muted rounded">Company-specific</span>
                )}
                {step.department_id && (
                  <span className="px-2 py-0.5 bg-muted rounded">Dept-specific</span>
                )}
                {step.section_id && (
                  <span className="px-2 py-0.5 bg-muted rounded">Section-specific</span>
                )}
                {step.target_company_id && (
                  <span className="px-2 py-0.5 bg-muted rounded">Cross-company</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

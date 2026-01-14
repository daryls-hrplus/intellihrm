import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  User, 
  Clock, 
  CheckSquare, 
  Settings2, 
  UserCircle, 
  Building2, 
  Shield, 
  Users, 
  Landmark, 
  UserCog,
  Info,
  AlertTriangle,
  AlertCircle
} from "lucide-react";
import type { WorkflowStep } from "@/hooks/useWorkflow";
import { cn } from "@/lib/utils";

const APPROVER_TYPE_OPTIONS = [
  { value: "manager", label: "Direct Manager", description: "Uses reporting line hierarchy", icon: UserCircle },
  { value: "position", label: "Specific Position", description: "Assigned to a job position", icon: Building2 },
  { value: "workflow_role", label: "Workflow Role", description: "Custom approval role", icon: Shield },
  { value: "role", label: "System Role", description: "Based on user's system role", icon: Users },
  { value: "governance_body", label: "Governance Body", description: "Committee or board approval", icon: Landmark },
  { value: "specific_user", label: "Specific User", description: "Assigned to a named user", icon: UserCog },
];

const ESCALATION_ACTIONS = [
  { value: "notify_alternate", label: "Notify Alternate (Keep Waiting)" },
  { value: "escalate_up", label: "Escalate to Next Level" },
  { value: "auto_approve", label: "Auto-Approve" },
  { value: "auto_reject", label: "Auto-Reject" },
  { value: "terminate", label: "Terminate Workflow" },
];

interface WorkflowStepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStep: Partial<WorkflowStep> | null;
  onStepChange: (step: Partial<WorkflowStep>) => void;
  onSave: () => void;
  positions: { id: string; title: string }[];
  roles: { id: string; name: string }[];
  governanceBodies: { id: string; name: string }[];
  users: { id: string; full_name: string; email: string }[];
  workflowApprovalRoles: { id: string; name: string; code: string }[];
  companies: { id: string; name: string }[];
}

export function WorkflowStepFormDialog({
  open,
  onOpenChange,
  editingStep,
  onStepChange,
  onSave,
  positions,
  roles,
  governanceBodies,
  users,
  workflowApprovalRoles,
  companies,
}: WorkflowStepFormDialogProps) {
  const [openSections, setOpenSections] = useState<string[]>(["basics", "approver", "timing", "requirements"]);

  // Reset sections when dialog opens
  useEffect(() => {
    if (open) {
      setOpenSections(["basics", "approver", "timing", "requirements"]);
    }
  }, [open]);

  const updateStep = (updates: Partial<WorkflowStep>) => {
    onStepChange({ ...editingStep, ...updates });
  };

  const renderApproverTypeSelector = () => {
    const selectedType = editingStep?.approver_type || "";

    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium">Who should approve? *</Label>
        <RadioGroup 
          value={selectedType} 
          onValueChange={(value) => updateStep({ approver_type: value })}
          className="grid grid-cols-2 gap-3"
        >
          {APPROVER_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>

        {/* Conditional fields based on selected approver type */}
        {selectedType && renderApproverTypeFields(selectedType)}
      </div>
    );
  };

  const renderApproverTypeFields = (type: string) => {
    const fieldWrapperClass = "mt-4 p-4 bg-muted/30 rounded-lg border border-border/50";

    switch (type) {
      case "position":
        return (
          <div className={fieldWrapperClass}>
            <Label className="text-sm">Select Position</Label>
            <Select
              value={editingStep?.approver_position_id || ""}
              onValueChange={(value) => updateStep({ approver_position_id: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a position..." />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "workflow_role":
        return (
          <div className={fieldWrapperClass}>
            <Label className="text-sm">Select Workflow Role</Label>
            <Select
              value={editingStep?.workflow_approval_role_id || ""}
              onValueChange={(value) => updateStep({ workflow_approval_role_id: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a workflow role..." />
              </SelectTrigger>
              <SelectContent>
                {workflowApprovalRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name} ({role.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Create workflow roles in the "Approval Roles" tab
            </p>
          </div>
        );

      case "role":
        return (
          <div className={fieldWrapperClass}>
            <Label className="text-sm">Select System Role</Label>
            <Select
              value={editingStep?.approver_role_id || ""}
              onValueChange={(value) => updateStep({ approver_role_id: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a system role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "governance_body":
        return (
          <div className={fieldWrapperClass}>
            <Label className="text-sm">Select Governance Body</Label>
            <Select
              value={editingStep?.approver_governance_body_id || ""}
              onValueChange={(value) => updateStep({ approver_governance_body_id: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a governance body..." />
              </SelectTrigger>
              <SelectContent>
                {governanceBodies.map((body) => (
                  <SelectItem key={body.id} value={body.id}>
                    {body.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "specific_user":
        return (
          <div className={fieldWrapperClass}>
            <Label className="text-sm">Select User</Label>
            <Select
              value={editingStep?.approver_user_id || ""}
              onValueChange={(value) => updateStep({ approver_user_id: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingStep?.id ? "Edit Approval Step" : "Add Approval Step"}
          </DialogTitle>
          <DialogDescription>
            Configure who will approve and when escalation should occur
          </DialogDescription>
        </DialogHeader>

        <Accordion 
          type="multiple" 
          value={openSections} 
          onValueChange={setOpenSections}
          className="space-y-3"
        >
          {/* Step Basics */}
          <AccordionItem value="basics" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">Step Basics</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label>Step Name *</Label>
                <Input
                  value={editingStep?.name || ""}
                  onChange={(e) => updateStep({ name: e.target.value })}
                  placeholder="e.g., Manager Approval, HR Review"
                />
              </div>
              <div className="space-y-2">
                <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea
                  value={editingStep?.description || ""}
                  onChange={(e) => updateStep({ description: e.target.value })}
                  placeholder="Brief explanation of what this step does..."
                  rows={2}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Approver Assignment */}
          <AccordionItem value="approver" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Approver Assignment</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {renderApproverTypeSelector()}
            </AccordionContent>
          </AccordionItem>

          {/* Timing & Escalation */}
          <AccordionItem value="timing" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Timing & Escalation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span>If no action within</span>
                  <Input
                    type="number"
                    value={editingStep?.escalation_hours || ""}
                    onChange={(e) => updateStep({ 
                      escalation_hours: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="24"
                    className="w-20 h-8"
                  />
                  <span>hours, then</span>
                  <Select
                    value={editingStep?.escalation_action || ""}
                    onValueChange={(value) => updateStep({ escalation_action: value })}
                  >
                    <SelectTrigger className="w-[200px] h-8">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ESCALATION_ACTIONS.map((action) => (
                        <SelectItem key={action.value} value={action.value}>
                          {action.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingStep?.escalation_action === "notify_alternate" && (
                  <div className="space-y-2">
                    <Label className="text-sm">Alternate Approver</Label>
                    <Select
                      value={editingStep?.alternate_approver_id || ""}
                      onValueChange={(value) => updateStep({ alternate_approver_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select alternate approver..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.full_name || u.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* SLA Tracking */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">SLA Tracking</span>
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      Warning at
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editingStep?.sla_warning_hours || ""}
                        onChange={(e) => updateStep({ 
                          sla_warning_hours: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        placeholder="24"
                        className="h-8"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">hours left</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-destructive" />
                      Critical at
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editingStep?.sla_critical_hours || ""}
                        onChange={(e) => updateStep({ 
                          sla_critical_hours: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        placeholder="8"
                        className="h-8"
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">hours left</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm">Auto-reject after (days)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={editingStep?.expiration_days || ""}
                    onChange={(e) => updateStep({ 
                      expiration_days: e.target.value ? parseInt(e.target.value) : null 
                    })}
                    placeholder="7"
                    className="w-24 h-8"
                  />
                  <span className="text-xs text-muted-foreground">Leave empty for no auto-rejection</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Requirements */}
          <AccordionItem value="requirements" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="font-medium">Requirements</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                  <Checkbox
                    id="requires_signature"
                    checked={editingStep?.requires_signature || false}
                    onCheckedChange={(checked) => updateStep({ requires_signature: !!checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="requires_signature" className="text-sm font-medium cursor-pointer">
                      Requires Signature
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Approver must provide a signature to complete this step
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                  <Checkbox
                    id="requires_comment"
                    checked={editingStep?.requires_comment || false}
                    onCheckedChange={(checked) => updateStep({ requires_comment: !!checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="requires_comment" className="text-sm font-medium cursor-pointer">
                      Requires Comment
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Approver must provide a comment or justification
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border bg-background">
                  <Checkbox
                    id="can_delegate"
                    checked={editingStep?.can_delegate !== false}
                    onCheckedChange={(checked) => updateStep({ can_delegate: !!checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="can_delegate" className="text-sm font-medium cursor-pointer">
                      Allow Delegation
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Approver can delegate this step to another user
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Advanced Options */}
          <AccordionItem value="advanced" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Advanced Options</span>
                <span className="text-xs text-muted-foreground ml-2">Cross-company routing</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Target Company</Label>
                <p className="text-xs text-muted-foreground">
                  Route this step to a different company for approval
                </p>
                <Select
                  value={editingStep?.target_company_id || "same"}
                  onValueChange={(value) => updateStep({ 
                    target_company_id: value === "same" ? null : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Same as workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same as Workflow</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {editingStep?.id ? "Update" : "Add"} Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

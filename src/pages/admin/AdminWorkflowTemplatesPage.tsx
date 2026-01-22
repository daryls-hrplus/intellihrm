import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Loader2, GitBranch, ArrowRight, Clock, Settings, Users, FileImage, Settings2, Info, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDateForDisplay } from "@/utils/dateUtils";
import type { WorkflowTemplate, WorkflowStep, WorkflowCategory } from "@/hooks/useWorkflow";
import { SchedulerManagement } from "@/components/admin/SchedulerManagement";
import { WorkflowApprovalRolesManagement } from "@/components/admin/WorkflowApprovalRolesManagement";
import { WorkflowProcessMapDialog } from "@/components/workflow/WorkflowProcessMapDialog";
import { WorkflowAnalyticsDashboard } from "@/components/workflow/WorkflowAnalyticsDashboard";
import { WorkflowAuditTrail } from "@/components/workflow/WorkflowAuditTrail";
import { WorkflowDelegationManager } from "@/components/workflow/WorkflowDelegationManager";
import { UnifiedWorkflowTemplatesTab } from "@/components/workflow/UnifiedWorkflowTemplatesTab";
import { WorkflowTemplateLibrary } from "@/components/workflow/WorkflowTemplateLibrary";
import { WorkflowStepConfiguration } from "@/components/workflow/WorkflowStepConfiguration";
import { WorkflowStepFormDialog } from "@/components/workflow/WorkflowStepFormDialog";
import { BarChart3, History, UserCheck } from "lucide-react";
import { usePageAudit } from "@/hooks/usePageAudit";

const WORKFLOW_CATEGORIES: { value: WorkflowCategory; label: string }[] = [
  // Employee Transactions
  { value: "hire", label: "New Hire" },
  { value: "rehire", label: "Rehire" },
  { value: "confirmation", label: "Confirmation" },
  { value: "probation_extension", label: "Probation Extension" },
  { value: "acting", label: "Acting Assignment" },
  { value: "promotion", label: "Promotion" },
  { value: "transfer", label: "Transfer" },
  { value: "secondment", label: "Secondment" },
  { value: "termination", label: "Termination" },
  { value: "resignation", label: "Resignation" },
  { value: "salary_change", label: "Salary Change" },
  { value: "rate_change", label: "Hourly/Daily Rate Change" },
  // Self-Service Workflows
  { value: "ess_approval", label: "ESS Approval" },
  // Performance Workflows
  { value: "goal_approval", label: "Goal Approval" },
  { value: "rating_approval", label: "Performance Rating Approval" },
  { value: "feedback_360_approval", label: "360 Feedback Release" },
  { value: "calibration_approval", label: "Calibration Sign-off" },
  { value: "succession_approval", label: "Succession Plan Approval" },
  { value: "learning_approval", label: "Training Request Approval" },
  { value: "pip_acknowledgment", label: "PIP Acknowledgment" },
  { value: "rating_release_approval", label: "Rating Release Approval" },
  // Other Workflows
  { value: "leave_request", label: "Leave Request" },
  { value: "probation_confirmation", label: "Probation Confirmation (Legacy)" },
  { value: "headcount_request", label: "Headcount Request" },
  { value: "training_request", label: "Training Request" },
  { value: "expense_claim", label: "Expense Claim" },
  { value: "letter_request", label: "Letter Request" },
  { value: "qualification", label: "Qualification" },
  { value: "general", label: "General" },
];

const APPROVER_TYPES = [
  { value: "manager", label: "Direct Manager (Reporting Line)" },
  { value: "hr", label: "HR Manager" },
  { value: "position", label: "Specific Position" },
  { value: "workflow_role", label: "Workflow Approval Role" },
  { value: "role", label: "System Role" },
  { value: "governance_body", label: "Governance Body" },
  { value: "specific_user", label: "Specific User" },
];

const ESCALATION_ACTIONS = [
  { value: "notify_alternate", label: "Notify Alternate (Keep Waiting)" },
  { value: "escalate_up", label: "Escalate to Next Level" },
  { value: "auto_approve", label: "Auto-Approve" },
  { value: "auto_reject", label: "Auto-Reject" },
  { value: "terminate", label: "Terminate Workflow" },
];

export default function AdminWorkflowTemplatesPage() {
  usePageAudit('workflow_templates', 'Admin');
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<WorkflowTemplate> | null>(null);
  const [editingStep, setEditingStep] = useState<Partial<WorkflowStep> | null>(null);
  const [positions, setPositions] = useState<{ id: string; title: string }[]>([]);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [governanceBodies, setGovernanceBodies] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string; company_id: string }[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string; department_id: string }[]>([]);
  const [workflowApprovalRoles, setWorkflowApprovalRoles] = useState<{ id: string; name: string; code: string }[]>([]);
  const [showProcessMapDialog, setShowProcessMapDialog] = useState(false);
  const [processMapTemplate, setProcessMapTemplate] = useState<WorkflowTemplate | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchSteps(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [templatesRes, positionsRes, rolesRes, governanceRes, usersRes, companiesRes, departmentsRes, sectionsRes, workflowRolesRes] = await Promise.all([
        supabase.from("workflow_templates").select("*").order("name"),
        supabase.from("positions").select("id, title").eq("is_active", true),
        supabase.from("roles").select("id, name").eq("is_active", true),
        supabase.from("governance_bodies").select("id, name").eq("is_active", true),
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
        supabase.from("departments").select("id, name, company_id").eq("is_active", true).order("name"),
        supabase.from("sections").select("id, name, department_id").eq("is_active", true).order("name"),
        supabase.from("workflow_approval_roles").select("id, name, code").eq("is_active", true).order("name"),
      ]);

      if (templatesRes.data) setTemplates(templatesRes.data as WorkflowTemplate[]);
      if (positionsRes.data) setPositions(positionsRes.data);
      if (rolesRes.data) setRoles(rolesRes.data);
      if (governanceRes.data) setGovernanceBodies(governanceRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
      if (departmentsRes.data) setDepartments(departmentsRes.data);
      if (sectionsRes.data) setSections(sectionsRes.data);
      if (workflowRolesRes.data) setWorkflowApprovalRoles(workflowRolesRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSteps = async (templateId: string) => {
    const { data, error } = await supabase
      .from("workflow_steps")
      .select("*")
      .eq("template_id", templateId)
      .order("step_order");

    if (data) setSteps(data as WorkflowStep[]);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name || !editingTemplate?.code || !editingTemplate?.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingTemplate.id) {
        const { error } = await supabase
          .from("workflow_templates")
          .update({
            name: editingTemplate.name,
            code: editingTemplate.code,
            category: editingTemplate.category,
            description: editingTemplate.description,
            is_active: editingTemplate.is_active,
            is_global: editingTemplate.is_global,
            requires_signature: editingTemplate.requires_signature,
            requires_letter: editingTemplate.requires_letter,
            auto_terminate_hours: editingTemplate.auto_terminate_hours,
            allow_return_to_previous: editingTemplate.allow_return_to_previous,
            start_date: editingTemplate.start_date,
            end_date: editingTemplate.end_date,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("Template updated");
      } else {
        const { error } = await supabase.from("workflow_templates").insert({
          ...editingTemplate,
          created_by: user?.id,
        } as any);

        if (error) throw error;
        toast.success("Template created");
      }

      setShowTemplateDialog(false);
      setEditingTemplate(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
    }
  };

  const handleSaveStep = async () => {
    if (!editingStep?.name || !editingStep?.approver_type || !selectedTemplate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingStep.id) {
        const { error } = await supabase
          .from("workflow_steps")
          .update({
            name: editingStep.name,
            description: editingStep.description,
            approver_type: editingStep.approver_type,
            approver_position_id: editingStep.approver_position_id,
            approver_role_id: editingStep.approver_role_id,
            approver_governance_body_id: editingStep.approver_governance_body_id,
            approver_user_id: editingStep.approver_user_id,
            use_reporting_line: editingStep.use_reporting_line,
            requires_signature: editingStep.requires_signature,
            requires_comment: editingStep.requires_comment,
            can_delegate: editingStep.can_delegate,
            escalation_hours: editingStep.escalation_hours,
            escalation_action: editingStep.escalation_action,
            alternate_approver_id: editingStep.alternate_approver_id,
          })
          .eq("id", editingStep.id);

        if (error) throw error;
        toast.success("Step updated");
      } else {
        const nextOrder = steps.length > 0 ? Math.max(...steps.map((s) => s.step_order)) + 1 : 1;
        const { error } = await supabase.from("workflow_steps").insert({
          ...editingStep,
          template_id: selectedTemplate.id,
          step_order: nextOrder,
        } as any);

        if (error) throw error;
        toast.success("Step added");
      }

      setShowStepDialog(false);
      setEditingStep(null);
      fetchSteps(selectedTemplate.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to save step");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("Delete this step?")) return;

    try {
      await supabase.from("workflow_steps").delete().eq("id", stepId);
      toast.success("Step deleted");
      if (selectedTemplate) fetchSteps(selectedTemplate.id);
    } catch (error) {
      toast.error("Failed to delete step");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template and all its steps?")) return;

    try {
      await supabase.from("workflow_templates").delete().eq("id", templateId);
      toast.success("Template deleted");
      setSelectedTemplate(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const [activeMainTab, setActiveMainTab] = useState("template-library");
  const [stepConfigTemplateId, setStepConfigTemplateId] = useState<string | null>(null);

  // Navigate to Step Configuration with a specific template
  const handleNavigateToStepConfiguration = (templateId: string) => {
    setStepConfigTemplateId(templateId);
    setActiveMainTab("step-configuration");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "HR Hub", href: "/hr-hub" },
            { label: "Workflow Management" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflow Management</h1>
            <p className="text-muted-foreground">
              Configure approval workflows and background processing
            </p>
          </div>
        </div>

        {/* Performance Workflow Quick Access Hint */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              <strong>Performance workflows</strong> (Goals, Appraisals, 360 Feedback, Succession) can be quickly configured via Performance Setup with AI-powered guidance and industry templates.
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/performance/setup?tab=foundation&sub=approval-workflows">
                <ExternalLink className="mr-2 h-4 w-4" />
                Quick Setup
              </Link>
            </Button>
          </AlertDescription>
        </Alert>

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="template-library" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Template Library
            </TabsTrigger>
            <TabsTrigger value="step-configuration" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Step Configuration
            </TabsTrigger>
            <TabsTrigger value="approval-roles" className="gap-2">
              <Users className="h-4 w-4" />
              Approval Roles
            </TabsTrigger>
            <TabsTrigger value="delegation" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Delegation
            </TabsTrigger>
            <TabsTrigger value="configuration" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="gap-2">
              <Clock className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template-library" className="mt-6">
            <WorkflowTemplateLibrary
              isStandaloneTab={true}
              onEditTemplate={(template) => {
                setSelectedTemplate(template);
                setEditingTemplate(template);
                setShowTemplateDialog(true);
              }}
              onViewProcessMap={(template) => {
                setProcessMapTemplate(template);
                setShowProcessMapDialog(true);
              }}
              onNavigateToStepConfiguration={handleNavigateToStepConfiguration}
              onCreateTemplate={() => {
                setEditingTemplate({ 
                  is_global: true, 
                  requires_signature: false, 
                  requires_letter: false, 
                  allow_return_to_previous: true,
                });
                setShowTemplateDialog(true);
              }}
              positions={positions}
              roles={roles}
              governanceBodies={governanceBodies}
              users={users}
              workflowApprovalRoles={workflowApprovalRoles}
            />
          </TabsContent>

          <TabsContent value="step-configuration" className="mt-6">
            <WorkflowStepConfiguration
              templates={templates}
              selectedTemplateId={stepConfigTemplateId}
              onSelectTemplate={setStepConfigTemplateId}
              onAddStep={(templateId) => {
                const template = templates.find(t => t.id === templateId);
                if (template) {
                  setSelectedTemplate(template);
                  fetchSteps(templateId);
                }
                setEditingStep({});
                setShowStepDialog(true);
              }}
              onEditStep={(step) => {
                setEditingStep(step);
                setShowStepDialog(true);
              }}
              onDeleteStep={handleDeleteStep}
              positions={positions}
              roles={roles}
              governanceBodies={governanceBodies}
              users={users}
              workflowApprovalRoles={workflowApprovalRoles}
            />
          </TabsContent>

          <TabsContent value="approval-roles" className="mt-6">
            <WorkflowApprovalRolesManagement />
          </TabsContent>

          <TabsContent value="delegation" className="mt-6">
            <WorkflowDelegationManager />
          </TabsContent>

          <TabsContent value="configuration" className="mt-6">
            <UnifiedWorkflowTemplatesTab
              onCreateTemplate={(category) => {
                setEditingTemplate({ 
                  is_global: false, 
                  requires_signature: false, 
                  requires_letter: false, 
                  allow_return_to_previous: true,
                  category: category as WorkflowCategory,
                });
                setShowTemplateDialog(true);
              }}
              onEditTemplate={(template) => {
                setSelectedTemplate(template);
                setEditingTemplate(template);
                setShowTemplateDialog(true);
              }}
              onViewProcessMap={(template) => {
                setProcessMapTemplate(template);
                setShowProcessMapDialog(true);
              }}
              onAddStep={(templateId) => {
                const template = templates.find(t => t.id === templateId);
                if (template) {
                  setSelectedTemplate(template);
                  fetchSteps(templateId);
                }
                setEditingStep({});
                setShowStepDialog(true);
              }}
              onEditStep={(step) => {
                setEditingStep(step);
                setShowStepDialog(true);
              }}
              onDeleteStep={handleDeleteStep}
              positions={positions}
              roles={roles}
              governanceBodies={governanceBodies}
              users={users}
              workflowApprovalRoles={workflowApprovalRoles}
              hideTemplateLibrary={true}
            />
          </TabsContent>

          <TabsContent value="scheduler" className="mt-6">
            <SchedulerManagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <WorkflowAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <WorkflowAuditTrail />
          </TabsContent>
        </Tabs>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate?.id ? "Edit Template" : "Create Template"}
              </DialogTitle>
              <DialogDescription>
                Define a workflow template for approval processes
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editingTemplate?.name || ""}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    placeholder="Leave Approval"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={editingTemplate?.code || ""}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, code: e.target.value.toUpperCase().replace(/\s/g, "_") })
                    }
                    placeholder="LEAVE_APPROVAL"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={editingTemplate?.category}
                  onValueChange={(value) =>
                    setEditingTemplate({ ...editingTemplate, category: value as WorkflowCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKFLOW_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />
              <p className="text-sm font-medium">Scope (Optional)</p>
              <p className="text-xs text-muted-foreground -mt-2">
                Limit this template to specific company, department, or section
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select
                    value={editingTemplate?.company_id || "all"}
                    onValueChange={(value) =>
                      setEditingTemplate({ 
                        ...editingTemplate, 
                        company_id: value === "all" ? null : value,
                        department_id: value === "all" ? null : editingTemplate?.department_id,
                        section_id: value === "all" ? null : editingTemplate?.section_id,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={editingTemplate?.department_id || "all"}
                    onValueChange={(value) =>
                      setEditingTemplate({ 
                        ...editingTemplate, 
                        department_id: value === "all" ? null : value,
                        section_id: value === "all" ? null : editingTemplate?.section_id,
                      })
                    }
                    disabled={!editingTemplate?.company_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments
                        .filter(d => !editingTemplate?.company_id || d.company_id === editingTemplate.company_id)
                        .map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select
                    value={editingTemplate?.section_id || "all"}
                    onValueChange={(value) =>
                      setEditingTemplate({ 
                        ...editingTemplate, 
                        section_id: value === "all" ? null : value,
                      })
                    }
                    disabled={!editingTemplate?.department_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections
                        .filter(s => !editingTemplate?.department_id || s.department_id === editingTemplate.department_id)
                        .map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingTemplate?.description || ""}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                  placeholder="Describe the workflow..."
                  rows={2}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editingTemplate?.start_date || ""}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, start_date: e.target.value || null })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    When this template becomes active
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editingTemplate?.end_date || ""}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, end_date: e.target.value || null })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for no expiry
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Auto-Terminate After (hours)</Label>
                <Input
                  type="number"
                  value={editingTemplate?.auto_terminate_hours || ""}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      auto_terminate_hours: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="Leave empty to disable"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Requires Digital Signature</Label>
                    <p className="text-xs text-muted-foreground">
                      Users must provide typed signature confirmation
                    </p>
                  </div>
                  <Switch
                    checked={editingTemplate?.requires_signature || false}
                    onCheckedChange={(checked) =>
                      setEditingTemplate({ ...editingTemplate, requires_signature: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Return to Previous Step</Label>
                    <p className="text-xs text-muted-foreground">
                      Approvers can send back for revision
                    </p>
                  </div>
                  <Switch
                    checked={editingTemplate?.allow_return_to_previous !== false}
                    onCheckedChange={(checked) =>
                      setEditingTemplate({ ...editingTemplate, allow_return_to_previous: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Template is available for use
                    </p>
                  </div>
                  <Switch
                    checked={editingTemplate?.is_active !== false}
                    onCheckedChange={(checked) =>
                      setEditingTemplate({ ...editingTemplate, is_active: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Global Template</Label>
                    <p className="text-xs text-muted-foreground">
                      Available to all companies
                    </p>
                  </div>
                  <Switch
                    checked={editingTemplate?.is_global || false}
                    onCheckedChange={(checked) =>
                      setEditingTemplate({ ...editingTemplate, is_global: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {editingTemplate?.id ? "Update" : "Create"} Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Step Dialog - Redesigned */}
        <WorkflowStepFormDialog
          open={showStepDialog}
          onOpenChange={setShowStepDialog}
          editingStep={editingStep}
          onStepChange={setEditingStep}
          onSave={handleSaveStep}
          positions={positions}
          roles={roles}
          governanceBodies={governanceBodies}
          users={users}
          workflowApprovalRoles={workflowApprovalRoles}
          companies={companies}
        />

        {/* Process Map Dialog */}
        <WorkflowProcessMapDialog
          open={showProcessMapDialog}
          onOpenChange={(open) => {
            setShowProcessMapDialog(open);
            if (!open) setProcessMapTemplate(null);
          }}
          template={processMapTemplate || selectedTemplate}
          steps={steps}
        />
      </div>
    </AppLayout>
  );
}

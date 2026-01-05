import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Loader2, GitBranch, ArrowRight, GripVertical, Clock, Settings, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import type { WorkflowTemplate, WorkflowStep, WorkflowCategory } from "@/hooks/useWorkflow";
import { SchedulerManagement } from "@/components/admin/SchedulerManagement";
import { WorkflowApprovalRolesManagement } from "@/components/admin/WorkflowApprovalRolesManagement";

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

  const [activeMainTab, setActiveMainTab] = useState("templates");

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Workflow Templates" },
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

        <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
          <TabsList>
            <TabsTrigger value="templates" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="approval-roles" className="gap-2">
              <Users className="h-4 w-4" />
              Approval Roles
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="gap-2">
              <Clock className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <div className="flex items-center justify-end mb-4">
              <Button onClick={() => {
                setEditingTemplate({ is_global: false, requires_signature: false, requires_letter: false, allow_return_to_previous: true });
                setShowTemplateDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
          {/* Templates List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
              <CardDescription>Select a template to configure steps</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No templates created yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                        selectedTemplate?.id === template.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {WORKFLOW_CATEGORIES.find((c) => c.value === template.category)?.label}
                          </p>
                        </div>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Details & Steps */}
          <Card className="lg:col-span-2">
            {selectedTemplate ? (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(selectedTemplate);
                          setShowTemplateDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">Code: {selectedTemplate.code}</Badge>
                    {selectedTemplate.start_date && (
                      <Badge variant="outline">
                        From: {formatDateForDisplay(selectedTemplate.start_date)}
                      </Badge>
                    )}
                    {selectedTemplate.end_date && (
                      <Badge variant="outline">
                        Until: {formatDateForDisplay(selectedTemplate.end_date)}
                      </Badge>
                    )}
                    {selectedTemplate.requires_signature && (
                      <Badge variant="secondary">Requires Signature</Badge>
                    )}
                    {selectedTemplate.auto_terminate_hours && (
                      <Badge variant="secondary">
                        Auto-terminate: {selectedTemplate.auto_terminate_hours}h
                      </Badge>
                    )}
                    {selectedTemplate.is_global && (
                      <Badge>Global</Badge>
                    )}
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Workflow Steps</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingStep({
                          use_reporting_line: false,
                          requires_signature: false,
                          requires_comment: false,
                          can_delegate: true,
                        });
                        setShowStepDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Step
                    </Button>
                  </div>

                  {steps.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p>No steps configured</p>
                      <p className="text-xs">Add steps to define the approval flow</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {steps.map((step, index) => (
                        <div
                          key={step.id}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {step.step_order}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {APPROVER_TYPES.find((t) => t.value === step.approver_type)?.label}
                              {step.escalation_hours && ` • Escalate after ${step.escalation_hours}h`}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {step.requires_signature && (
                              <Badge variant="outline" className="text-xs">Signature</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingStep(step);
                                setShowStepDialog(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteStep(step.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {index < steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Select a template</p>
                  <p className="text-sm">Choose a template from the list to view and configure its steps</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="approval-roles" className="mt-6">
            <WorkflowApprovalRolesManagement />
          </TabsContent>

          <TabsContent value="scheduler" className="mt-6">
            <SchedulerManagement />
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

        {/* Step Dialog */}
        <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStep?.id ? "Edit Step" : "Add Step"}
              </DialogTitle>
              <DialogDescription>
                Configure an approval step in the workflow
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Step Name *</Label>
                <Input
                  value={editingStep?.name || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, name: e.target.value })
                  }
                  placeholder="Manager Approval"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingStep?.description || ""}
                  onChange={(e) =>
                    setEditingStep({ ...editingStep, description: e.target.value })
                  }
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Approver Type *</Label>
                <Select
                  value={editingStep?.approver_type}
                  onValueChange={(value) =>
                    setEditingStep({ ...editingStep, approver_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver type" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPROVER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional approver selection based on type */}
              {editingStep?.approver_type === "position" && (
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={editingStep?.approver_position_id || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, approver_position_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
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
              )}

              {editingStep?.approver_type === "workflow_role" && (
                <div className="space-y-2">
                  <Label>Workflow Approval Role</Label>
                  <Select
                    value={editingStep?.workflow_approval_role_id || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, workflow_approval_role_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow role" />
                    </SelectTrigger>
                    <SelectContent>
                      {workflowApprovalRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name} ({role.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Create workflow roles in the "Approval Roles" tab
                  </p>
                </div>
              )}

              {editingStep?.approver_type === "role" && (
                <div className="space-y-2">
                  <Label>System Role</Label>
                  <Select
                    value={editingStep?.approver_role_id || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, approver_role_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
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
              )}

              {editingStep?.approver_type === "governance_body" && (
                <div className="space-y-2">
                  <Label>Governance Body</Label>
                  <Select
                    value={editingStep?.approver_governance_body_id || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, approver_governance_body_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select governance body" />
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
              )}

              {editingStep?.approver_type === "specific_user" && (
                <div className="space-y-2">
                  <Label>User</Label>
                  <Select
                    value={editingStep?.approver_user_id || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, approver_user_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
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

              <Separator />
              <p className="text-sm font-medium">Cross-Company Routing (Optional)</p>
              <p className="text-xs text-muted-foreground -mt-2">
                Route this step to a different company for approval
              </p>

              <div className="space-y-2">
                <Label>Target Company</Label>
                <Select
                  value={editingStep?.target_company_id || "same"}
                  onValueChange={(value) =>
                    setEditingStep({ 
                      ...editingStep, 
                      target_company_id: value === "same" ? null : value,
                    })
                  }
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

              <Separator />
              <p className="text-sm font-medium">Timing & SLA</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Escalation After (hours)</Label>
                  <Input
                    type="number"
                    value={editingStep?.escalation_hours || ""}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        escalation_hours: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiration (days)</Label>
                  <Input
                    type="number"
                    value={editingStep?.expiration_days || ""}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        expiration_days: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-reject if no action
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>SLA Warning (hours before deadline)</Label>
                  <Input
                    type="number"
                    value={editingStep?.sla_warning_hours || ""}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        sla_warning_hours: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SLA Critical (hours before deadline)</Label>
                  <Input
                    type="number"
                    value={editingStep?.sla_critical_hours || ""}
                    onChange={(e) =>
                      setEditingStep({
                        ...editingStep,
                        sla_critical_hours: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="e.g., 8"
                  />
                </div>
              </div>

              {editingStep?.escalation_hours && (
                <div className="space-y-2">
                  <Label>Escalation Action</Label>
                  <Select
                    value={editingStep?.escalation_action || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, escalation_action: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
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
              )}

              {editingStep?.escalation_action === "notify_alternate" && (
                <div className="space-y-2">
                  <Label>Alternate Approver</Label>
                  <Select
                    value={editingStep?.alternate_approver_id || ""}
                    onValueChange={(value) =>
                      setEditingStep({ ...editingStep, alternate_approver_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alternate" />
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

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Requires Signature</Label>
                  <Switch
                    checked={editingStep?.requires_signature || false}
                    onCheckedChange={(checked) =>
                      setEditingStep({ ...editingStep, requires_signature: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Requires Comment</Label>
                  <Switch
                    checked={editingStep?.requires_comment || false}
                    onCheckedChange={(checked) =>
                      setEditingStep({ ...editingStep, requires_comment: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Allow Delegation</Label>
                  <Switch
                    checked={editingStep?.can_delegate !== false}
                    onCheckedChange={(checked) =>
                      setEditingStep({ ...editingStep, can_delegate: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStep}>
                {editingStep?.id ? "Update" : "Add"} Step
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

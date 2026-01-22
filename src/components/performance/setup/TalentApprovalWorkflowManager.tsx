import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Plus,
  Settings2,
  Users,
  Building2,
  User,
  Trash2,
  Clock,
  Target,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  TrendingUp,
  ExternalLink,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkflowSetupGuidanceCard, type IndustryTemplate } from "./WorkflowSetupGuidanceCard";
import { WorkflowQuickStartSection } from "./WorkflowQuickStartSection";
import type { WorkflowCategory } from "@/hooks/useWorkflow";

interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  company_id: string | null;
  is_active: boolean;
  is_global: boolean;
}

interface WorkflowStep {
  id: string;
  template_id: string;
  step_order: number;
  name: string;
  approver_type: string;
  approver_user_id: string | null;
  use_reporting_line: boolean;
  escalation_hours: number | null;
  is_active: boolean;
}

interface TalentApprovalWorkflowManagerProps {
  companyId?: string;
}

// Performance workflow categories in the unified system
const PERFORMANCE_CATEGORIES: WorkflowCategory[] = [
  'goal_approval',
  'rating_approval',
  'feedback_360_approval',
  'calibration_approval',
  'succession_approval',
  'learning_approval',
];

const categoryToProcessType: Record<string, string> = {
  goal_approval: 'goals',
  rating_approval: 'appraisals',
  feedback_360_approval: '360_feedback',
  learning_approval: 'learning',
  succession_approval: 'succession',
  calibration_approval: 'appraisals',
};

const processTypeToCategory: Record<string, WorkflowCategory> = {
  goals: 'goal_approval',
  appraisals: 'rating_approval',
  '360_feedback': 'feedback_360_approval',
  learning: 'learning_approval',
  succession: 'succession_approval',
};

const processTypeConfig = {
  goals: { label: "Goals", icon: Target, color: "bg-primary/10 text-primary" },
  appraisals: { label: "Performance Appraisals", icon: ClipboardCheck, color: "bg-success/10 text-success" },
  "360_feedback": { label: "360° Feedback", icon: MessageSquare, color: "bg-info/10 text-info" },
  learning: { label: "Learning Requests", icon: GraduationCap, color: "bg-warning/10 text-warning" },
  succession: { label: "Succession Plans", icon: TrendingUp, color: "bg-secondary/10 text-secondary-foreground" },
};

const scopeLevelConfig = {
  individual: { label: "Individual", icon: User },
  team: { label: "Team", icon: Users },
  department: { label: "Department", icon: Users },
  company: { label: "Company", icon: Building2 },
};

const approverTypeLabels: Record<string, string> = {
  manager: "Direct Manager",
  hr: "HR Representative",
  position: "Department Head",
  specific_user: "Specific User",
  workflow_role: "Workflow Approval Role",
};

// Map legacy approver types to new system
const legacyApproverTypeLabels: Record<string, string> = {
  direct_manager: "Direct Manager",
  skip_manager: "Skip-Level Manager",
  hr: "HR Representative",
  department_head: "Department Head",
  specific_user: "Specific User",
};

export function TalentApprovalWorkflowManager({ companyId }: TalentApprovalWorkflowManagerProps) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [steps, setSteps] = useState<Record<string, WorkflowStep[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [filterProcessType, setFilterProcessType] = useState<string>("all");
  const [companyName, setCompanyName] = useState<string>("");

  const [templateForm, setTemplateForm] = useState({
    name: "",
    process_type: "goals",
    scope_level: "individual",
    is_active: true,
  });

  const [stepForm, setStepForm] = useState({
    approver_type: "manager",
    approver_user_id: "",
    use_reporting_line: true,
    sla_hours: "",
  });

  useEffect(() => {
    if (companyId) {
      fetchTemplates();
      fetchEmployees();
      fetchCompanyName();
    }
  }, [companyId]);

  const fetchCompanyName = async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("companies")
      .select("name")
      .eq("id", companyId)
      .single();
    if (data) setCompanyName(data.name);
  };

  const fetchEmployees = async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .order("full_name");
    setEmployees(data || []);
  };

  const fetchTemplates = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      // Fetch workflow templates for performance categories
      const { data: templatesData, error: templatesError } = await supabase
        .from("workflow_templates")
        .select("*")
        .eq("company_id", companyId)
        .in("category", PERFORMANCE_CATEGORIES)
        .order("name");

      if (templatesError) throw templatesError;
      setTemplates((templatesData || []) as WorkflowTemplate[]);

      // Fetch steps for each template
      if (templatesData?.length) {
        const templateIds = templatesData.map(t => t.id);
        const { data: stepsData, error: stepsError } = await supabase
          .from("workflow_steps")
          .select("*")
          .in("template_id", templateIds)
          .eq("is_active", true)
          .order("step_order");

        if (stepsError) throw stepsError;

        const stepsMap: Record<string, WorkflowStep[]> = {};
        ((stepsData || []) as WorkflowStep[]).forEach(step => {
          if (!stepsMap[step.template_id]) stepsMap[step.template_id] = [];
          stepsMap[step.template_id].push(step);
        });
        setSteps(stepsMap);
      }
    } catch (error) {
      console.error("Error fetching workflow templates:", error);
      toast.error("Failed to load approval workflows");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = (name: string): string => {
    return name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').substring(0, 50) + '_' + Date.now().toString(36).toUpperCase();
  };

  const handleSaveTemplate = async () => {
    if (!companyId) return;

    try {
      const category = processTypeToCategory[templateForm.process_type] || 'goal_approval';
      const templateData = {
        company_id: companyId,
        name: templateForm.name || `${templateForm.process_type} - ${templateForm.scope_level} approval`,
        code: generateCode(templateForm.name || `${templateForm.process_type}_${templateForm.scope_level}`),
        category: category,
        description: `Scope: ${templateForm.scope_level}`,
        is_global: false,
        is_active: templateForm.is_active,
        requires_signature: false,
        requires_letter: false,
        allow_return_to_previous: true,
        created_by: companyId,
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from("workflow_templates")
          .update({
            name: templateData.name,
            description: templateData.description,
            is_active: templateData.is_active,
          })
          .eq("id", selectedTemplate.id);
        if (error) throw error;
        toast.success("Approval workflow updated");
      } else {
        const { error } = await supabase
          .from("workflow_templates")
          .insert([templateData]);
        if (error) throw error;
        toast.success("Approval workflow created");
      }

      setDialogOpen(false);
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save approval workflow");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this approval workflow?")) return;

    try {
      // Delete steps first
      await supabase
        .from("workflow_steps")
        .delete()
        .eq("template_id", templateId);

      // Then delete template
      const { error } = await supabase
        .from("workflow_templates")
        .delete()
        .eq("id", templateId);
      if (error) throw error;
      toast.success("Approval workflow deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete approval workflow");
    }
  };

  const handleAddStep = async () => {
    if (!selectedTemplate) return;

    try {
      const currentSteps = steps[selectedTemplate.id] || [];
      const nextOrder = currentSteps.length + 1;

      const { error } = await supabase
        .from("workflow_steps")
        .insert([{
          template_id: selectedTemplate.id,
          step_order: nextOrder,
          name: `Step ${nextOrder}: ${approverTypeLabels[stepForm.approver_type] || stepForm.approver_type}`,
          approver_type: stepForm.approver_type,
          approver_user_id: stepForm.approver_type === "specific_user" ? stepForm.approver_user_id : null,
          use_reporting_line: stepForm.use_reporting_line,
          escalation_hours: stepForm.sla_hours ? parseInt(stepForm.sla_hours) : null,
          is_active: true,
          requires_signature: false,
          requires_comment: false,
          can_delegate: true,
        }]);

      if (error) throw error;
      toast.success("Approval step added");
      setStepDialogOpen(false);
      setStepForm({
        approver_type: "manager",
        approver_user_id: "",
        use_reporting_line: true,
        sla_hours: "",
      });
      fetchTemplates();
    } catch (error) {
      console.error("Error adding step:", error);
      toast.error("Failed to add approval step");
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from("workflow_steps")
        .delete()
        .eq("id", stepId);
      if (error) throw error;
      toast.success("Approval step removed");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting step:", error);
      toast.error("Failed to remove approval step");
    }
  };

  const handleToggleActive = async (template: WorkflowTemplate) => {
    try {
      const { error } = await supabase
        .from("workflow_templates")
        .update({ is_active: !template.is_active })
        .eq("id", template.id);
      if (error) throw error;
      fetchTemplates();
    } catch (error) {
      console.error("Error toggling template:", error);
      toast.error("Failed to update workflow");
    }
  };

  const openEditTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    const processType = categoryToProcessType[template.category] || "goals";
    const scopeMatch = template.description?.match(/Scope:\s*(\w+)/i);
    const scopeLevel = scopeMatch ? scopeMatch[1].toLowerCase() : "individual";
    
    setTemplateForm({
      name: template.name,
      process_type: processType,
      scope_level: scopeLevel,
      is_active: template.is_active,
    });
    setDialogOpen(true);
  };

  const openAddStep = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setStepDialogOpen(true);
  };

  // Filter templates by process type
  const filteredTemplates = filterProcessType === "all" 
    ? templates 
    : templates.filter(t => categoryToProcessType[t.category] === filterProcessType);

  // Group templates by process type
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const type = categoryToProcessType[template.category] || "goals";
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<string, WorkflowTemplate[]>);

  // Handle applying templates from WorkflowSetupGuidanceCard
  const handleApplyTemplate = async (template: IndustryTemplate) => {
    if (!companyId) return;

    try {
      const category = processTypeToCategory[template.processType] || 'goal_approval';
      
      // Check for existing template with same category and scope
      const { data: existingTemplates } = await supabase
        .from("workflow_templates")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("category", category)
        .ilike("description", `%Scope: ${template.scopeLevel}%`);

      if (existingTemplates && existingTemplates.length > 0) {
        const confirmReplace = confirm(
          `A workflow already exists for ${template.processType} - ${template.scopeLevel}. Replace it?`
        );
        if (!confirmReplace) return;
        
        // Delete existing template and its steps
        for (const existing of existingTemplates) {
          await supabase.from("workflow_steps").delete().eq("template_id", existing.id);
          await supabase.from("workflow_templates").delete().eq("id", existing.id);
        }
      }

      // Create the workflow template
      const { data: newTemplate, error: templateError } = await supabase
        .from("workflow_templates")
        .insert([{
          company_id: companyId,
          name: template.name,
          code: generateCode(template.name),
          category: category,
          description: `Scope: ${template.scopeLevel}`,
          is_global: false,
          is_active: true,
          requires_signature: false,
          requires_letter: false,
          allow_return_to_previous: true,
          created_by: companyId,
        }])
        .select()
        .single();

      if (templateError) throw templateError;

      // Create workflow steps
      const stepsToInsert = template.steps.map((step, idx) => {
        // Map legacy approver types to new system
        const approverType = step.approverType === 'direct_manager' || step.approverType === 'skip_manager' 
          ? 'manager' 
          : step.approverType === 'department_head' 
            ? 'position' 
            : step.approverType;
        
        return {
          template_id: newTemplate.id,
          step_order: idx + 1,
          name: `Step ${idx + 1}: ${legacyApproverTypeLabels[step.approverType] || step.approverType}`,
          approver_type: approverType,
          use_reporting_line: step.approverType === 'direct_manager' || step.approverType === 'skip_manager',
          escalation_hours: step.slaHours,
          is_active: true,
          requires_signature: false,
          requires_comment: false,
          can_delegate: true,
        };
      });

      const { error: stepsError } = await supabase
        .from("workflow_steps")
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      toast.success(`Applied "${template.name}" template successfully`);
      fetchTemplates();
    } catch (error: any) {
      console.error("Error applying template:", error);
      toast.error(error.message || "Failed to apply template");
    }
  };

  const handleQuickSetup = (processType: string) => {
    setFilterProcessType(processType);
  };

  const existingProcessTypes = [...new Set(templates.map(t => categoryToProcessType[t.category] || "goals"))];
  
  // Track which specific templates have been applied
  const appliedTemplates = templates.map(t => {
    const scopeMatch = t.description?.match(/Scope:\s*(\w+)/i);
    return {
      processType: categoryToProcessType[t.category] || "goals",
      scopeLevel: scopeMatch ? scopeMatch[1].toLowerCase() : "individual",
      name: t.name,
    };
  });

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading approval workflows...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Company Context Indicator */}
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Viewing workflows for:</span>
        <Badge variant="outline" className="font-semibold">{companyName || "Loading..."}</Badge>
      </div>

      {/* AI Guidance Section */}
      <WorkflowSetupGuidanceCard
        onApplyTemplate={handleApplyTemplate}
        existingProcessTypes={existingProcessTypes}
        appliedTemplates={appliedTemplates}
      />

      {/* Quick Start Section */}
      <WorkflowQuickStartSection
        onQuickSetup={handleQuickSetup}
        existingProcessTypes={existingProcessTypes}
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configured Approval Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Manage approval chains for Goals, Appraisals, 360 Feedback, and other talent processes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterProcessType} onValueChange={setFilterProcessType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by process" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Processes</SelectItem>
              {Object.entries(processTypeConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { 
            setSelectedTemplate(null); 
            setTemplateForm({
              name: "",
              process_type: "goals",
              scope_level: "individual",
              is_active: true,
            }); 
            setDialogOpen(true); 
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Workflow
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No approval workflows configured yet</p>
            <p className="text-muted-foreground mb-4 text-center max-w-md">
              Use the AI-powered guidance above to apply industry-standard templates, or create a custom workflow.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Custom Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTemplates).map(([processType, processTemplates]) => {
            const processConfig = processTypeConfig[processType as keyof typeof processTypeConfig] || processTypeConfig.goals;
            const ProcessIcon = processConfig.icon;
            
            return (
              <Card key={processType}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${processConfig.color}`}>
                      <ProcessIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{processConfig.label}</CardTitle>
                      <CardDescription>{processTemplates.length} workflow{processTemplates.length !== 1 ? 's' : ''} configured</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="space-y-2">
                    {processTemplates.map((template) => {
                      const scopeMatch = template.description?.match(/Scope:\s*(\w+)/i);
                      const scopeLevel = scopeMatch ? scopeMatch[1].toLowerCase() : "individual";
                      const scopeConfig = scopeLevelConfig[scopeLevel as keyof typeof scopeLevelConfig] || scopeLevelConfig.individual;
                      const ScopeIcon = scopeConfig.icon;
                      const templateSteps = steps[template.id] || [];

                      return (
                        <AccordionItem key={template.id} value={template.id} className="border rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-4 w-full">
                              <div className="flex items-center gap-2">
                                <ScopeIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{scopeConfig.label}</span>
                              </div>
                              <Badge variant={template.is_active ? "default" : "secondary"} className="ml-auto mr-4">
                                {template.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {templateSteps.length} step{templateSteps.length !== 1 ? 's' : ''}
                              </span>
                              <div onClick={e => e.stopPropagation()}>
                                <Switch
                                  checked={template.is_active}
                                  onCheckedChange={() => handleToggleActive(template)}
                                />
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Approval Chain ({templateSteps.length} step{templateSteps.length !== 1 ? 's' : ''})</h4>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditTemplate(template)}>
                                    Edit
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={() => openAddStep(template)}>
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add Step
                                  </Button>
                                </div>
                              </div>

                              {templateSteps.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                  No approval steps defined. Add steps to define the approval chain.
                                </p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-12">#</TableHead>
                                      <TableHead>Approver</TableHead>
                                      <TableHead>Reporting Line</TableHead>
                                      <TableHead>SLA</TableHead>
                                      <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {templateSteps.map((step) => (
                                      <TableRow key={step.id}>
                                        <TableCell className="font-medium">{step.step_order}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            {approverTypeLabels[step.approver_type] || step.name}
                                            {step.approver_user_id && (
                                              <Badge variant="outline" className="text-xs">
                                                {employees.find(e => e.id === step.approver_user_id)?.full_name || "Unknown"}
                                              </Badge>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant={step.use_reporting_line ? "default" : "secondary"}>
                                            {step.use_reporting_line ? "Yes" : "No"}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          {step.escalation_hours ? (
                                            <span className="flex items-center gap-1 text-sm">
                                              <Clock className="h-3 w-3" />
                                              {step.escalation_hours}h
                                            </span>
                                          ) : "—"}
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive"
                                            onClick={() => handleDeleteStep(step.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}

                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleDeleteTemplate(template.id)}
                                >
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  Delete Workflow
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cross-System Navigation Link */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-sm">
            These workflows are part of the unified HR Hub workflow engine. For advanced configuration (delegation, escalation, analytics), visit Workflow Management.
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/workflow-templates">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Workflow Management
            </Link>
          </Button>
        </AlertDescription>
      </Alert>

      {/* Add/Edit Workflow Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? "Edit Approval Workflow" : "Create Approval Workflow"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Workflow Name</Label>
              <Input
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                placeholder="e.g., Manager Goal Approval"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Process Type</Label>
                <Select
                  value={templateForm.process_type}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, process_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(processTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scope Level</Label>
                <Select
                  value={templateForm.scope_level}
                  onValueChange={(v) => setTemplateForm({ ...templateForm, scope_level: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(scopeLevelConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={templateForm.is_active}
                onCheckedChange={(c) => setTemplateForm({ ...templateForm, is_active: c })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Step Dialog */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Approval Step</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Approver Type</Label>
              <Select
                value={stepForm.approver_type}
                onValueChange={(v) => setStepForm({ ...stepForm, approver_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(approverTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {stepForm.approver_type === "specific_user" && (
              <div>
                <Label>Select User</Label>
                <Select
                  value={stepForm.approver_user_id}
                  onValueChange={(v) => setStepForm({ ...stepForm, approver_user_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>SLA (Hours)</Label>
              <Input
                type="number"
                value={stepForm.sla_hours}
                onChange={(e) => setStepForm({ ...stepForm, sla_hours: e.target.value })}
                placeholder="e.g., 48"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={stepForm.use_reporting_line}
                onCheckedChange={(c) => setStepForm({ ...stepForm, use_reporting_line: c })}
              />
              <Label>Use Reporting Line</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStepDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStep}>Add Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { type IndustryTemplate };

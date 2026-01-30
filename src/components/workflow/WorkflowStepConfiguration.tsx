import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Settings2,
  Globe,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkflowTemplate, WorkflowStep } from "@/hooks/useWorkflow";
import { WorkflowStepCard } from "./WorkflowStepCard";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WorkflowStepConfigurationProps {
  templates: WorkflowTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  onAddStep: (templateId: string) => void;
  onEditStep: (step: WorkflowStep) => void;
  onDeleteStep: (stepId: string) => void;
  positions?: { id: string; title: string }[];
  roles?: { id: string; name: string }[];
  governanceBodies?: { id: string; name: string }[];
  users?: { id: string; full_name: string; email: string }[];
  workflowApprovalRoles?: { id: string; name: string; code: string }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  hire: "New Hire",
  rehire: "Rehire",
  confirmation: "Confirmation",
  probation_extension: "Probation Extension",
  acting: "Acting Assignment",
  promotion: "Promotion",
  transfer: "Transfer",
  secondment: "Secondment",
  termination: "Termination",
  resignation: "Resignation",
  salary_change: "Salary Change",
  rate_change: "Rate Change",
  leave_request: "Leave Request",
  probation_confirmation: "Probation Confirmation",
  headcount_request: "Headcount Request",
  training_request: "Training Request",
  expense_claim: "Expense Claim",
  letter_request: "Letter Request",
  qualification: "Qualification",
  general: "General",
  performance: "Performance",
  disciplinary_acknowledgement: "Disciplinary Acknowledgement",
  grievance_submission: "Grievance Submission",
};

export function WorkflowStepConfiguration({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onAddStep,
  onEditStep,
  onDeleteStep,
  positions = [],
  roles = [],
  governanceBodies = [],
  users = [],
  workflowApprovalRoles = [],
}: WorkflowStepConfigurationProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Filter to only global templates
  const globalTemplates = useMemo(() => {
    return templates.filter(t => t.is_global);
  }, [templates]);

  const selectedTemplate = globalTemplates.find(t => t.id === selectedTemplateId);

  // Fetch steps when template is selected
  useEffect(() => {
    const fetchSteps = async () => {
      if (!selectedTemplateId) {
        setSteps([]);
        return;
      }

      setStepsLoading(true);
      const { data, error } = await supabase
        .from("workflow_steps")
        .select("*")
        .eq("template_id", selectedTemplateId)
        .order("step_order");

      if (error) {
        console.error("Error fetching steps:", error);
        setStepsLoading(false);
        return;
      }

      setSteps((data || []) as WorkflowStep[]);
      setStepsLoading(false);
    };

    fetchSteps();
  }, [selectedTemplateId]);

  // Reorder step
  const handleReorderStep = async (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const currentStep = steps[stepIndex];
    const targetStep = steps[targetIndex];

    try {
      // Swap step_order values
      await Promise.all([
        supabase
          .from("workflow_steps")
          .update({ step_order: targetStep.step_order })
          .eq("id", currentStep.id),
        supabase
          .from("workflow_steps")
          .update({ step_order: currentStep.step_order })
          .eq("id", targetStep.id),
      ]);

      // Update local state
      const newSteps = [...steps];
      newSteps[stepIndex] = { ...currentStep, step_order: targetStep.step_order };
      newSteps[targetIndex] = { ...targetStep, step_order: currentStep.step_order };
      newSteps.sort((a, b) => a.step_order - b.step_order);
      setSteps(newSteps);

      toast.success("Step order updated");
    } catch (error) {
      toast.error("Failed to reorder step");
    }
  };

  // Get status badge for template
  function getTemplateBadge(template: WorkflowTemplate) {
    if (!template.is_active) {
      return <Badge variant="outline" className="text-muted-foreground"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
    
    if (template.end_date && template.end_date < today) {
      return <Badge variant="destructive" className="gap-1"><Calendar className="h-3 w-3" />Expired</Badge>;
    }
    
    if (template.start_date && template.start_date > today) {
      return <Badge variant="secondary" className="gap-1 text-blue-600"><Calendar className="h-3 w-3" />Scheduled</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Step Configuration</h2>
        </div>
      </div>

      {/* Template Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Template to Configure</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedTemplateId || ""} 
            onValueChange={onSelectTemplate}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a template..." />
            </SelectTrigger>
            <SelectContent>
              {globalTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-blue-500" />
                    <span>{template.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({CATEGORY_LABELS[template.category] || template.category})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Selected Template Info & Steps */}
      {selectedTemplate ? (
        <Card>
          {/* Template Info Header */}
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <Badge variant="outline" className="gap-1 text-blue-600">
                    <Globe className="h-3 w-3" />
                    Global
                  </Badge>
                  {getTemplateBadge(selectedTemplate)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}
                </p>
                
                {/* Effective Dates */}
                {(selectedTemplate.start_date || selectedTemplate.end_date) && (
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Effective:</span>
                    </div>
                    {selectedTemplate.start_date && (
                      <span className={cn(
                        selectedTemplate.start_date > today && "text-blue-600 font-medium"
                      )}>
                        {formatDateForDisplay(selectedTemplate.start_date)}
                      </span>
                    )}
                    {selectedTemplate.start_date && selectedTemplate.end_date && (
                      <span className="text-muted-foreground">→</span>
                    )}
                    {selectedTemplate.end_date && (
                      <span className={cn(
                        selectedTemplate.end_date < today && "text-destructive font-medium"
                      )}>
                        {formatDateForDisplay(selectedTemplate.end_date)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Steps Section */}
          <CardContent className="p-0">
            <div className="p-4 border-b bg-background flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Workflow Steps</h4>
                <Badge variant="secondary">{steps.length} steps</Badge>
              </div>
              <Button size="sm" onClick={() => onAddStep(selectedTemplate.id)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            <ScrollArea className="max-h-[500px]">
              <div className="p-4 space-y-3">
                {stepsLoading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertTriangle className="h-10 w-10 mb-3 opacity-40" />
                    <p className="text-sm font-medium">No steps configured</p>
                    <p className="text-xs text-muted-foreground mt-1">Add your first step to configure this workflow</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => onAddStep(selectedTemplate.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Step
                    </Button>
                  </div>
                ) : (
                  steps.map((step, index) => (
                    <div key={step.id} className="flex gap-2">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 pt-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={index === 0}
                          onClick={() => handleReorderStep(step.id, 'up')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          disabled={index === steps.length - 1}
                          onClick={() => handleReorderStep(step.id, 'down')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Step Card */}
                      <div className="flex-1">
                        <WorkflowStepCard
                          step={step}
                          positions={positions}
                          roles={roles}
                          governanceBodies={governanceBodies}
                          users={users}
                          workflowApprovalRoles={workflowApprovalRoles}
                          onEdit={onEditStep}
                          onDelete={onDeleteStep}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <Settings2 className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">No template selected</p>
              <p className="text-xs mt-1">Select a template above to configure its workflow steps</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

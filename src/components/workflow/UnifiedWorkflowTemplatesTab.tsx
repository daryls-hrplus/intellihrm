import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Building2, Globe, Info, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkflowModuleSidebar } from "./WorkflowModuleSidebar";
import { WorkflowCategorySection } from "./WorkflowCategorySection";
import { WorkflowTemplateLibrary } from "./WorkflowTemplateLibrary";
import { WORKFLOW_MODULES } from "@/constants/workflowModuleStructure";
import type { WorkflowTemplate, WorkflowStep } from "@/hooks/useWorkflow";

interface Company {
  id: string;
  name: string;
}

interface TransactionType {
  id: string;
  code: string;
  name: string;
}

interface TransactionWorkflowSetting {
  id: string;
  company_id: string;
  transaction_type_id: string;
  workflow_enabled: boolean;
  workflow_template_id: string | null;
  auto_start_workflow: boolean;
  requires_approval_before_effective: boolean;
  is_active: boolean;
}

interface ExtendedWorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: string | null;
  is_global: boolean;
  company_id: string | null;
  is_active: boolean;
}

interface UnifiedWorkflowTemplatesTabProps {
  onCreateTemplate: (category?: string) => void;
  onEditTemplate: (template: WorkflowTemplate) => void;
  onViewProcessMap: (template: WorkflowTemplate) => void;
  onAddStep?: (templateId: string) => void;
  onEditStep?: (step: WorkflowStep) => void;
  onDeleteStep?: (stepId: string) => void;
  positions?: { id: string; title: string }[];
  roles?: { id: string; name: string }[];
  governanceBodies?: { id: string; name: string }[];
  users?: { id: string; full_name: string; email: string }[];
  workflowApprovalRoles?: { id: string; name: string; code: string }[];
  hideTemplateLibrary?: boolean;
}

export function UnifiedWorkflowTemplatesTab({
  onCreateTemplate,
  onEditTemplate,
  onViewProcessMap,
  onAddStep,
  onEditStep,
  onDeleteStep,
  positions = [],
  roles = [],
  governanceBodies = [],
  users = [],
  workflowApprovalRoles = [],
  hideTemplateLibrary = false,
}: UnifiedWorkflowTemplatesTabProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("global");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("workforce");
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<ExtendedWorkflowTemplate[]>([]);
  const [settings, setSettings] = useState<TransactionWorkflowSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTemplates, setAllTemplates] = useState<WorkflowTemplate[]>([]);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copyTemplateId, setCopyTemplateId] = useState<string | null>(null);
  const [copyTargetCompanyId, setCopyTargetCompanyId] = useState<string>("");

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  // Fetch transaction types
  useEffect(() => {
    const fetchTransactionTypes = async () => {
      const { data } = await supabase
        .from("lookup_values")
        .select("id, code, name")
        .eq("category", "transaction_type" as never)
        .eq("is_active", true)
        .order("name");
      
      const types = (data || []).map(item => ({
        id: item.id,
        code: (item as any).code || '',
        name: (item as any).name || '',
      }));
      setTransactionTypes(types);
    };
    fetchTransactionTypes();
  }, []);

  // Fetch workflow templates (including global ones)
  const fetchWorkflowTemplates = useCallback(async () => {
    let query = supabase
      .from("workflow_templates")
      .select("id, name, code, category, is_global, company_id, is_active")
      .eq("is_active", true);

    if (selectedCompanyId && selectedCompanyId !== "global") {
      // Get company-specific OR global templates
      query = query.or(`company_id.eq.${selectedCompanyId},is_global.eq.true`);
    }
    // For global view, get all templates

    const { data, error } = await query.order("name");
    
    if (error) {
      console.error("Error fetching templates:", error);
      return;
    }

    setWorkflowTemplates((data || []) as ExtendedWorkflowTemplate[]);
  }, [selectedCompanyId]);

  // Fetch all templates for the dialog
  const fetchAllTemplates = useCallback(async () => {
    const { data } = await supabase
      .from("workflow_templates")
      .select("*")
      .order("name");
    setAllTemplates((data || []) as WorkflowTemplate[]);
  }, []);

  // Fetch settings for selected company
  const fetchSettings = useCallback(async () => {
    if (!selectedCompanyId || selectedCompanyId === "global") {
      setSettings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("company_transaction_workflow_settings")
      .select("*")
      .eq("company_id", selectedCompanyId);

    if (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load workflow settings");
    }

    setSettings((data || []) as TransactionWorkflowSetting[]);
    setLoading(false);
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchWorkflowTemplates();
    fetchSettings();
    fetchAllTemplates();
  }, [fetchWorkflowTemplates, fetchSettings, fetchAllTemplates]);

  // Calculate enabled counts per module
  const enabledCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    for (const module of WORKFLOW_MODULES) {
      let count = 0;
      for (const category of module.categories) {
        for (const workflow of category.workflows) {
          if (workflow.transactionTypeCode) {
            const transactionType = transactionTypes.find(
              t => t.code === workflow.transactionTypeCode
            );
            if (transactionType) {
              const setting = settings.find(
                s => s.transaction_type_id === transactionType.id && s.workflow_enabled
              );
              if (setting) count++;
            }
          }
        }
      }
      counts[module.id] = count;
    }
    
    return counts;
  }, [settings, transactionTypes]);

  const selectedModule = WORKFLOW_MODULES.find(m => m.id === selectedModuleId);

  // Handle settings updates
  const upsertSetting = async (
    transactionTypeId: string,
    updates: Partial<TransactionWorkflowSetting>
  ) => {
    if (!selectedCompanyId || selectedCompanyId === "global") {
      toast.error("Please select a company to configure settings");
      return;
    }

    const existingSetting = settings.find(
      s => s.transaction_type_id === transactionTypeId
    );

    if (existingSetting) {
      const { error } = await supabase
        .from("company_transaction_workflow_settings")
        .update(updates)
        .eq("id", existingSetting.id);

      if (error) {
        toast.error("Failed to update setting");
        return;
      }
    } else {
      const { error } = await supabase
        .from("company_transaction_workflow_settings")
        .insert({
          company_id: selectedCompanyId,
          transaction_type_id: transactionTypeId,
          ...updates,
        });

      if (error) {
        toast.error("Failed to create setting");
        return;
      }
    }

    toast.success("Setting updated");
    fetchSettings();
  };

  const handleToggleEnabled = (transactionTypeId: string, enabled: boolean) => {
    upsertSetting(transactionTypeId, { workflow_enabled: enabled });
  };

  const handleTemplateChange = (transactionTypeId: string, templateId: string | null) => {
    upsertSetting(transactionTypeId, { workflow_template_id: templateId });
  };

  const handleAutoStartChange = (transactionTypeId: string, autoStart: boolean) => {
    upsertSetting(transactionTypeId, { auto_start_workflow: autoStart });
  };

  const handleRequiresApprovalChange = (transactionTypeId: string, requiresApproval: boolean) => {
    upsertSetting(transactionTypeId, { requires_approval_before_effective: requiresApproval });
  };

  const handleConfigureSteps = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      onEditTemplate(template);
    }
  };

  const handleCreateTemplate = (workflowCode: string) => {
    onCreateTemplate(workflowCode);
  };

  const handleViewProcessMap = (templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template) {
      onViewProcessMap(template);
    }
  };

  const handleCopyToCompany = (templateId: string) => {
    setCopyTemplateId(templateId);
    setShowCopyDialog(true);
  };

  const executeCopyToCompany = async () => {
    if (!copyTemplateId || !copyTargetCompanyId) return;

    const template = allTemplates.find(t => t.id === copyTemplateId);
    if (!template) return;

    try {
      // Create a copy of the template for the selected company
      const { data: newTemplate, error: templateError } = await supabase
        .from("workflow_templates")
        .insert({
          name: `${template.name} (Copy)`,
          code: `${template.code}_${copyTargetCompanyId.slice(0, 8).toUpperCase()}`,
          category: template.category as any,
          description: template.description,
          is_global: false,
          company_id: copyTargetCompanyId,
          is_active: true,
          requires_signature: template.requires_signature,
          requires_letter: template.requires_letter,
          allow_return_to_previous: template.allow_return_to_previous,
        } as any)
        .select()
        .single();

      if (templateError) throw templateError;

      // Copy the steps if any
      const { data: steps } = await supabase
        .from("workflow_steps")
        .select("*")
        .eq("template_id", copyTemplateId);

      if (steps && steps.length > 0 && newTemplate) {
        const newSteps = steps.map(step => ({
          template_id: newTemplate.id,
          name: step.name,
          description: step.description,
          step_order: step.step_order,
          approver_type: step.approver_type,
          approver_position_id: step.approver_position_id,
          approver_role_id: step.approver_role_id,
          approver_governance_body_id: step.approver_governance_body_id,
          approver_user_id: step.approver_user_id,
          use_reporting_line: step.use_reporting_line,
          requires_signature: step.requires_signature,
          requires_comment: step.requires_comment,
          can_delegate: step.can_delegate,
          escalation_hours: step.escalation_hours,
          escalation_action: step.escalation_action,
        }));

        await supabase.from("workflow_steps").insert(newSteps);
      }

      toast.success("Template copied to company successfully");
      setShowCopyDialog(false);
      setCopyTemplateId(null);
      setCopyTargetCompanyId("");
      fetchWorkflowTemplates();
      fetchAllTemplates();
    } catch (error: any) {
      toast.error(error.message || "Failed to copy template");
    }
  };

  return (
    <div className="space-y-4">
      {/* Company Selector Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card border rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium whitespace-nowrap">
            Configuring for:
          </Label>
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[240px]">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Global (All Companies)
                </div>
              </SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant={selectedCompanyId === "global" ? "default" : "secondary"} className="hidden sm:flex">
            {selectedCompanyId === "global" ? "Global Templates" : "Company-Specific"}
          </Badge>
        </div>

        <Button onClick={() => onCreateTemplate()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Info Alert for Global View */}
      {selectedCompanyId === "global" && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You're viewing global templates available to all companies. Select a specific company to configure which workflows require approval.
            Use the "Copy to Company" action to create company-specific versions of global templates.
          </AlertDescription>
        </Alert>
      )}

      {/* Module-based Navigation + Content */}
      <div className="flex rounded-lg border bg-card overflow-hidden">
        {/* Module Sidebar */}
        <WorkflowModuleSidebar
          selectedModuleId={selectedModuleId}
          onModuleSelect={setSelectedModuleId}
          enabledCounts={enabledCounts}
        />

        {/* Category & Workflow Content */}
        <div className="flex-1 bg-muted/20">
          {loading && selectedCompanyId !== "global" ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : selectedModule ? (
            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <selectedModule.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">{selectedModule.name}</h2>
                </div>

                {selectedModule.categories.map((category) => (
                  <WorkflowCategorySection
                    key={category.id}
                    category={category}
                    companyId={selectedCompanyId}
                    settings={settings}
                    transactionTypes={transactionTypes}
                    workflowTemplates={workflowTemplates}
                    onToggleEnabled={handleToggleEnabled}
                    onTemplateChange={handleTemplateChange}
                    onAutoStartChange={handleAutoStartChange}
                    onRequiresApprovalChange={handleRequiresApprovalChange}
                    onConfigureSteps={handleConfigureSteps}
                    onCreateTemplate={handleCreateTemplate}
                    onViewProcessMap={handleViewProcessMap}
                    onCopyToCompany={handleCopyToCompany}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-6">
              Select a module from the sidebar
            </div>
          )}
        </div>
      </div>

      {/* Template Library Section - conditionally shown */}
      {!hideTemplateLibrary && (
        <WorkflowTemplateLibrary
          selectedCompanyId={selectedCompanyId}
          onEditTemplate={onEditTemplate}
          onViewProcessMap={(template) => {
            const fullTemplate = allTemplates.find(t => t.id === template.id);
            if (fullTemplate) {
              onViewProcessMap(fullTemplate);
            }
          }}
          onAddStep={onAddStep || (() => {})}
          onEditStep={onEditStep || (() => {})}
          onDeleteStep={onDeleteStep || (() => {})}
          positions={positions}
          roles={roles}
          governanceBodies={governanceBodies}
          users={users}
          workflowApprovalRoles={workflowApprovalRoles}
        />
      )}

      {/* Copy to Company Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Template to Company</DialogTitle>
            <DialogDescription>
              Create a company-specific copy of this global template. The new template will include all workflow steps.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Target Company</Label>
              <Select value={copyTargetCompanyId} onValueChange={setCopyTargetCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeCopyToCompany} disabled={!copyTargetCompanyId}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

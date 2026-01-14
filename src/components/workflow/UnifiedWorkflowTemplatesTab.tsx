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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Building2, Globe, Info, GitBranch } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkflowModuleSidebar } from "./WorkflowModuleSidebar";
import { WorkflowCategorySection } from "./WorkflowCategorySection";
import { WORKFLOW_MODULES } from "@/constants/workflowModuleStructure";
import type { WorkflowTemplate } from "@/hooks/useWorkflow";

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
}

export function UnifiedWorkflowTemplatesTab({
  onCreateTemplate,
  onEditTemplate,
  onViewProcessMap,
}: UnifiedWorkflowTemplatesTabProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("global");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("workforce");
  const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<ExtendedWorkflowTemplate[]>([]);
  const [settings, setSettings] = useState<TransactionWorkflowSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTemplates, setAllTemplates] = useState<WorkflowTemplate[]>([]);

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
    } else {
      // For global view, only show global templates
      query = query.eq("is_global", true);
    }

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

  const selectedCompanyName = selectedCompanyId === "global" 
    ? "Global (All Companies)" 
    : companies.find(c => c.id === selectedCompanyId)?.name || "Select Company";

  return (
    <div className="space-y-6">
      {/* Company Selector Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium whitespace-nowrap">
                  Configuring for:
                </Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[280px]">
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
              </div>

              <Badge variant={selectedCompanyId === "global" ? "default" : "secondary"}>
                {selectedCompanyId === "global" ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Viewing Global Templates
                  </>
                ) : (
                  <>
                    <Building2 className="h-3 w-3 mr-1" />
                    Company-Specific
                  </>
                )}
              </Badge>
            </div>

            <Button onClick={() => onCreateTemplate()}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert for Global View */}
      {selectedCompanyId === "global" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You're viewing global templates. To configure which workflows require approval for a specific company, select a company from the dropdown above.
            Global templates can be used by all companies.
          </AlertDescription>
        </Alert>
      )}

      {/* Module-based Navigation + Content */}
      <div className="flex rounded-lg border bg-card overflow-hidden min-h-[500px]">
        {/* Module Sidebar */}
        <WorkflowModuleSidebar
          selectedModuleId={selectedModuleId}
          onModuleSelect={setSelectedModuleId}
          enabledCounts={enabledCounts}
        />

        {/* Category & Workflow Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : selectedCompanyId === "global" ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <GitBranch className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Global Template View</h3>
              <p className="max-w-md">
                Select a specific company to configure which transaction types require workflow approval.
                Global templates are available to all companies.
              </p>
            </div>
          ) : selectedModule ? (
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="space-y-6 pr-4">
                <div className="flex items-center gap-2 mb-4">
                  <selectedModule.icon className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{selectedModule.name}</h2>
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
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a module from the sidebar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

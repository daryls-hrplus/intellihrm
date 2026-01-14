import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { UnifiedWorkflowCard } from "./UnifiedWorkflowCard";
import { getCategoryColorClasses, type WorkflowCategory, type WorkflowDefinition } from "@/constants/workflowModuleStructure";

interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: string | null;
  is_global?: boolean;
  company_id?: string | null;
}

interface TransactionType {
  id: string;
  code: string;
  name: string;
}

interface TransactionWorkflowSetting {
  id: string;
  transaction_type_id: string;
  workflow_enabled: boolean;
  workflow_template_id: string | null;
  auto_start_workflow: boolean;
  requires_approval_before_effective: boolean;
}

interface WorkflowCategorySectionProps {
  category: WorkflowCategory;
  companyId: string | "global";
  settings: TransactionWorkflowSetting[];
  transactionTypes: TransactionType[];
  workflowTemplates: WorkflowTemplate[];
  onToggleEnabled: (transactionTypeId: string, enabled: boolean) => void;
  onTemplateChange: (transactionTypeId: string, templateId: string | null) => void;
  onAutoStartChange: (transactionTypeId: string, autoStart: boolean) => void;
  onRequiresApprovalChange: (transactionTypeId: string, requiresApproval: boolean) => void;
  onConfigureSteps: (templateId: string) => void;
  onCreateTemplate: (workflowCode: string) => void;
  onViewProcessMap: (templateId: string) => void;
}

export function WorkflowCategorySection({
  category,
  companyId,
  settings,
  transactionTypes,
  workflowTemplates,
  onToggleEnabled,
  onTemplateChange,
  onAutoStartChange,
  onRequiresApprovalChange,
  onConfigureSteps,
  onCreateTemplate,
  onViewProcessMap,
}: WorkflowCategorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const colorClasses = getCategoryColorClasses(category.color);
  const Icon = category.icon;

  // Calculate enabled count for this category
  const enabledCount = category.workflows.filter(workflow => {
    const transactionType = transactionTypes.find(
      t => t.code === workflow.transactionTypeCode
    );
    if (!transactionType) return false;
    const setting = settings.find(s => s.transaction_type_id === transactionType.id);
    return setting?.workflow_enabled;
  }).length;

  const getSettingForWorkflow = (workflow: WorkflowDefinition) => {
    const transactionType = transactionTypes.find(
      t => t.code === workflow.transactionTypeCode
    );
    if (!transactionType) return null;
    return settings.find(s => s.transaction_type_id === transactionType.id) || null;
  };

  const getTransactionTypeId = (workflow: WorkflowDefinition) => {
    const transactionType = transactionTypes.find(
      t => t.code === workflow.transactionTypeCode
    );
    return transactionType?.id || null;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
        colorClasses.bg,
        colorClasses.text,
        "hover:opacity-90"
      )}>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "rotate-180"
        )} />
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{category.name}</span>
        <Badge variant="secondary" className="text-xs">
          {enabledCount} / {category.workflows.length} enabled
        </Badge>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid gap-3 mt-3 pl-2">
          {category.workflows.map((workflow) => {
            const transactionTypeId = getTransactionTypeId(workflow);
            const setting = getSettingForWorkflow(workflow);

            return (
              <UnifiedWorkflowCard
                key={workflow.code}
                workflow={workflow}
                categoryColor={category.color}
                companyId={companyId}
                setting={setting}
                availableTemplates={workflowTemplates}
                transactionTypeId={transactionTypeId}
                onToggleEnabled={(enabled) => {
                  if (transactionTypeId) {
                    onToggleEnabled(transactionTypeId, enabled);
                  }
                }}
                onTemplateChange={(templateId) => {
                  if (transactionTypeId) {
                    onTemplateChange(transactionTypeId, templateId);
                  }
                }}
                onAutoStartChange={(autoStart) => {
                  if (transactionTypeId) {
                    onAutoStartChange(transactionTypeId, autoStart);
                  }
                }}
                onRequiresApprovalChange={(requiresApproval) => {
                  if (transactionTypeId) {
                    onRequiresApprovalChange(transactionTypeId, requiresApproval);
                  }
                }}
                onConfigureSteps={onConfigureSteps}
                onCreateTemplate={onCreateTemplate}
                onViewProcessMap={onViewProcessMap}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

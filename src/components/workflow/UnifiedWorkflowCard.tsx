import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  MoreVertical, 
  Plus, 
  Copy, 
  FileImage, 
  Globe,
  Building2
} from "lucide-react";
import type { WorkflowDefinition } from "@/constants/workflowModuleStructure";

interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: string | null;
  is_global?: boolean;
  company_id?: string | null;
}

interface TransactionWorkflowSetting {
  id: string;
  workflow_enabled: boolean;
  workflow_template_id: string | null;
  auto_start_workflow: boolean;
  requires_approval_before_effective: boolean;
}

interface UnifiedWorkflowCardProps {
  workflow: WorkflowDefinition;
  categoryColor: string;
  companyId: string | "global";
  setting: TransactionWorkflowSetting | null;
  availableTemplates: WorkflowTemplate[];
  transactionTypeId: string | null;
  onToggleEnabled: (enabled: boolean) => void;
  onTemplateChange: (templateId: string | null) => void;
  onAutoStartChange: (autoStart: boolean) => void;
  onRequiresApprovalChange: (requiresApproval: boolean) => void;
  onConfigureSteps: (templateId: string) => void;
  onCreateTemplate: (workflowCode: string) => void;
  onViewProcessMap: (templateId: string) => void;
  onCopyToCompany?: (templateId: string) => void;
}

export function UnifiedWorkflowCard({
  workflow,
  categoryColor,
  companyId,
  setting,
  availableTemplates,
  transactionTypeId,
  onToggleEnabled,
  onTemplateChange,
  onAutoStartChange,
  onRequiresApprovalChange,
  onConfigureSteps,
  onCreateTemplate,
  onViewProcessMap,
  onCopyToCompany,
}: UnifiedWorkflowCardProps) {
  const isEnabled = setting?.workflow_enabled ?? false;
  const selectedTemplateId = setting?.workflow_template_id;
  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId);

  // Legacy category mapping for backward compatibility
  const legacyMapping: Record<string, string[]> = {
    'rating_approval': ['performance', 'appraisal', 'rating', 'calibration'],
    'pip_acknowledgment': ['performance', 'pip'],
    'rating_release_approval': ['performance', 'release'],
    'feedback_360_approval': ['360', 'feedback'],
    'succession_approval': ['succession'],
    'goal_approval_individual': ['goal', 'goal_approval'],
    'goal_approval_team': ['goal', 'goal_approval'],
    'goal_approval_department': ['goal', 'goal_approval'],
  };

  // Filter templates by workflow category with flexible matching
  const filteredTemplates = availableTemplates.filter(t => {
    // Exact category match
    if (t.category === workflow.code) return true;
    
    // Partial code match (case-insensitive)
    if (workflow.code && t.code?.toLowerCase().includes(workflow.code.toLowerCase())) return true;
    
    // Match transaction type code pattern in template code
    if (workflow.transactionTypeCode && 
        t.code?.toUpperCase().includes(workflow.transactionTypeCode.replace('PERF_', ''))) return true;
    
    // Legacy category mapping
    if (workflow.code && legacyMapping[workflow.code]) {
      const matches = legacyMapping[workflow.code].some(legacy => 
        t.category?.toLowerCase().includes(legacy) || 
        t.code?.toLowerCase().includes(legacy) ||
        t.name?.toLowerCase().includes(legacy)
      );
      if (matches) return true;
    }
    
    // General templates available for all
    if (t.category === "general" || !t.category) return true;
    
    return false;
  });

  // If no category-specific templates, show all templates
  const templatesToShow = filteredTemplates.length > 0 ? filteredTemplates : availableTemplates;

  return (
    <div className={cn(
      "flex items-center gap-4 px-4 py-3 bg-background hover:bg-muted/30 transition-colors",
      isEnabled && "bg-primary/5"
    )}>
      {/* Workflow Info */}
      <div className="flex items-center gap-3 min-w-[200px] flex-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{workflow.name}</span>
            {workflow.transactionTypeCode && (
              <span className="text-xs text-muted-foreground">
                {workflow.transactionTypeCode}
              </span>
            )}
          </div>
          {isEnabled && selectedTemplate && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {selectedTemplate.name}
              </span>
              {selectedTemplate.is_global && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                  Global
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id={`workflow-${workflow.code}`}
            checked={isEnabled}
            onCheckedChange={onToggleEnabled}
            disabled={!transactionTypeId && !!workflow.transactionTypeCode}
          />
          <Label
            htmlFor={`workflow-${workflow.code}`}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Enabled
          </Label>
        </div>

        {/* Template Selection - Only show when enabled */}
        {isEnabled && (
          <>
            <Select
              value={selectedTemplateId || "none"}
              onValueChange={(v) => onTemplateChange(v === "none" ? null : v)}
            >
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Template</SelectItem>
                {templatesToShow.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.name}</span>
                      {template.is_global && (
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Auto-start Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id={`auto-start-${workflow.code}`}
                checked={setting?.auto_start_workflow ?? false}
                onCheckedChange={onAutoStartChange}
                className="scale-90"
              />
              <Label
                htmlFor={`auto-start-${workflow.code}`}
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Auto-start
              </Label>
            </div>

            {/* Configure Steps Button */}
            {selectedTemplateId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onConfigureSteps(selectedTemplateId)}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Configure
              </Button>
            )}
          </>
        )}

        {/* Quick Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateTemplate(workflow.code)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </DropdownMenuItem>
            {selectedTemplateId && (
              <DropdownMenuItem onClick={() => onViewProcessMap(selectedTemplateId)}>
                <FileImage className="h-4 w-4 mr-2" />
                View Process Map
              </DropdownMenuItem>
            )}
            {selectedTemplateId && selectedTemplate?.is_global && onCopyToCompany && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onCopyToCompany(selectedTemplateId)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Company
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

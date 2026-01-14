import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { 
  Settings, 
  MoreVertical, 
  Plus, 
  Copy, 
  FileImage, 
  ChevronDown,
  Globe,
  Building2
} from "lucide-react";
import type { WorkflowDefinition } from "@/constants/workflowModuleStructure";
import { getCategoryColorClasses } from "@/constants/workflowModuleStructure";

interface WorkflowTemplate {
  id: string;
  name: string;
  code: string;
  category: string | null;
  is_global?: boolean;
  company_id?: string | null;
  step_count?: number;
  auto_start?: boolean;
  requires_approval?: boolean;
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
}: UnifiedWorkflowCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const isEnabled = setting?.workflow_enabled ?? false;
  const selectedTemplateId = setting?.workflow_template_id;
  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId);
  const colorClasses = getCategoryColorClasses(categoryColor);

  // Filter templates by workflow category or general
  const filteredTemplates = availableTemplates.filter(
    t => t.category === workflow.code || t.category === "general" || !t.category
  );

  // If no category-specific templates, show all templates
  const templatesToShow = filteredTemplates.length > 0 ? filteredTemplates : availableTemplates;

  return (
    <Card className={cn(
      "transition-all duration-200",
      isEnabled ? "border-primary/30 bg-primary/5" : "hover:bg-muted/50"
    )}>
      <CardContent className="py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Workflow Info */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className={cn("p-2 rounded-md", colorClasses.bg)}>
              <div className={cn("h-4 w-4", colorClasses.text)} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{workflow.name}</span>
                {workflow.transactionTypeCode && (
                  <Badge variant="outline" className="text-xs">
                    {workflow.transactionTypeCode}
                  </Badge>
                )}
              </div>
              {isEnabled && selectedTemplate && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-muted-foreground">
                    Using: {selectedTemplate.name}
                  </span>
                  {selectedTemplate.is_global ? (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                      <Globe className="h-2.5 w-2.5 mr-0.5" />
                      Global
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                      <Building2 className="h-2.5 w-2.5 mr-0.5" />
                      Company
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
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
                className="text-sm cursor-pointer"
              >
                Enabled
              </Label>
            </div>

            {/* Template Selection - Only show when enabled */}
            {isEnabled && (
              <>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTemplateId || "none"}
                    onValueChange={(v) => onTemplateChange(v === "none" ? null : v)}
                  >
                    <SelectTrigger className="w-[180px]">
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
                </div>

                {/* Auto-start Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id={`auto-start-${workflow.code}`}
                    checked={setting?.auto_start_workflow ?? false}
                    onCheckedChange={onAutoStartChange}
                  />
                  <Label
                    htmlFor={`auto-start-${workflow.code}`}
                    className="text-sm cursor-pointer"
                  >
                    Auto-start
                  </Label>
                </div>

                {/* Requires Approval Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id={`requires-approval-${workflow.code}`}
                    checked={setting?.requires_approval_before_effective ?? false}
                    onCheckedChange={onRequiresApprovalChange}
                  />
                  <Label
                    htmlFor={`requires-approval-${workflow.code}`}
                    className="text-sm cursor-pointer whitespace-nowrap"
                  >
                    Block until approved
                  </Label>
                </div>

                {/* Configure Steps Button */}
                {selectedTemplateId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onConfigureSteps(selectedTemplateId)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configure
                  </Button>
                )}
              </>
            )}

            {/* Quick Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
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
                {companyId !== "global" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy from Global
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Collapsible Template Details */}
        {isEnabled && selectedTemplate && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary mt-3 hover:underline">
              <ChevronDown className={cn(
                "h-3 w-3 transition-transform",
                showDetails && "rotate-180"
              )} />
              {showDetails ? "Hide" : "Show"} template details
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>Template: <strong className="text-foreground">{selectedTemplate.name}</strong></span>
                  <span>•</span>
                  <span>Code: <strong className="text-foreground">{selectedTemplate.code}</strong></span>
                  {selectedTemplate.category && (
                    <>
                      <span>•</span>
                      <span>Category: <strong className="text-foreground">{selectedTemplate.category}</strong></span>
                    </>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

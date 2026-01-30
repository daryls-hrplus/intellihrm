import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Plus,
  Pencil,
  GitBranch,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Clock,
  Settings2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { WorkflowTemplate, WorkflowStep } from "@/hooks/useWorkflow";
import { WorkflowStepCard } from "./WorkflowStepCard";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { WORKFLOW_MODULES, getWorkflowCodesForModule } from "@/constants/workflowModuleStructure";

interface WorkflowTemplateLibraryProps {
  onEditTemplate: (template: WorkflowTemplate) => void;
  onViewProcessMap: (template: WorkflowTemplate) => void;
  onCreateTemplate?: () => void;
  onNavigateToStepConfiguration?: (templateId: string) => void;
  positions?: { id: string; title: string }[];
  roles?: { id: string; name: string }[];
  governanceBodies?: { id: string; name: string }[];
  users?: { id: string; full_name: string; email: string }[];
  workflowApprovalRoles?: { id: string; name: string; code: string }[];
  isStandaloneTab?: boolean;
}

interface ExtendedTemplate extends WorkflowTemplate {
  steps?: WorkflowStep[];
  stepsLoading?: boolean;
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
  performance: "Appraisal Acknowledgment",
  leave_cancellation: "Leave Cancellation",
  certification_request: "Certification Request",
  requisition_approval: "Requisition Approval",
  offer_approval: "Offer Approval",
  offer_extension: "Offer Extension",
  pip_acknowledgment: "PIP Acknowledgment",
  goal_approval: "Goal Approval",
  goal_approval_individual: "Individual Goal Approval",
  goal_approval_team: "Team Goal Approval",
  goal_approval_department: "Department Goal Approval",
  goal_cascade: "Goal Cascade Approval",
  goal_modification: "Goal Modification Approval",
  immigration: "Immigration Documents",
  contract_extension: "Contract Extension",
  contract_conversion: "Contract Conversion",
  status_change: "Status Change",
  retirement: "Retirement",
  disciplinary_acknowledgement: "Disciplinary Acknowledgement",
  grievance_submission: "Grievance Submission",
  // Performance Appraisal workflow types
  rating_approval: "Rating Approval",
  rating_release_approval: "Rating Release",
  calibration_approval: "Calibration Approval",
  // Succession Planning workflow types
  succession_approval: "Readiness Assessment",
  succession_nomination: "Candidate Nomination",
  succession_plan_approval: "Succession Plan Approval",
  talent_pool_nomination: "Talent Pool Nomination",
  succession_emergency: "Emergency Succession",
  // Career Development workflow types
  idp_approval: "IDP Approval",
  career_path_approval: "Career Path Approval",
  mentorship_approval: "Mentorship Approval",
  development_assignment: "Development Assignment",
  career_move_request: "Career Move Request",
  // 360 Feedback workflow types
  feedback_360_approval: "360 Feedback",
  feedback_360_release: "360 Results Release",
  feedback_360_investigation: "360 Investigation",
  feedback_360_external: "360 External Rater",
  feedback_360_cycle: "360 Cycle Launch",
};

export function WorkflowTemplateLibrary({
  onEditTemplate,
  onViewProcessMap,
  onCreateTemplate,
  onNavigateToStepConfiguration,
  positions = [],
  roles = [],
  governanceBodies = [],
  users = [],
  workflowApprovalRoles = [],
  isStandaloneTab = false,
}: WorkflowTemplateLibraryProps) {
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  // Get current date for effective date checks
  const today = new Date().toISOString().split('T')[0];

  // Fetch only global templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*")
        .eq("is_global", true)
        .order("name");

      if (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
        return;
      }

      setTemplates((data || []) as ExtendedTemplate[]);
      setLoading(false);
    };

    fetchTemplates();
  }, []);

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

  // Get workflow codes for selected module
  const moduleWorkflowCodes = useMemo(() => {
    if (selectedModuleId === "all") return null;
    return getWorkflowCodesForModule(selectedModuleId);
  }, [selectedModuleId]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (
          !template.name.toLowerCase().includes(searchLower) &&
          !template.code.toLowerCase().includes(searchLower) &&
          !(template.category && CATEGORY_LABELS[template.category]?.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }

      // Module filter
      if (moduleWorkflowCodes && !moduleWorkflowCodes.includes(template.category)) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const isEffectivelyActive = getTemplateEffectiveStatus(template);
        if (statusFilter === "active" && !isEffectivelyActive) return false;
        if (statusFilter === "inactive" && isEffectivelyActive) return false;
        if (statusFilter === "scheduled" && !isTemplateScheduled(template)) return false;
        if (statusFilter === "expired" && !isTemplateExpired(template)) return false;
      }

      return true;
    });
  }, [templates, searchQuery, moduleWorkflowCodes, statusFilter]);

  // Count templates per module
  const moduleTemplateCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    WORKFLOW_MODULES.forEach(module => {
      const codes = getWorkflowCodesForModule(module.id);
      counts[module.id] = templates.filter(t => codes.includes(t.category)).length;
    });
    return counts;
  }, [templates]);

  // Selected template
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Check template effective status
  function getTemplateEffectiveStatus(template: WorkflowTemplate): boolean {
    if (!template.is_active) return false;
    if (template.start_date && template.start_date > today) return false;
    if (template.end_date && template.end_date < today) return false;
    return true;
  }

  function isTemplateScheduled(template: WorkflowTemplate): boolean {
    return template.is_active && template.start_date !== null && template.start_date > today;
  }

  function isTemplateExpired(template: WorkflowTemplate): boolean {
    return template.end_date !== null && template.end_date < today;
  }

  // Get status badge for template
  function getTemplateBadge(template: WorkflowTemplate) {
    if (!template.is_active) {
      return <Badge variant="outline" className="text-muted-foreground"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
    
    if (template.end_date && template.end_date < today) {
      return <Badge variant="destructive" className="gap-1"><Clock className="h-3 w-3" />Expired</Badge>;
    }
    
    if (template.start_date && template.start_date > today) {
      return <Badge variant="secondary" className="gap-1 text-blue-600"><Calendar className="h-3 w-3" />Scheduled</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
  }

  // Render Module Sidebar
  const renderModuleSidebar = () => (
    <div className="w-48 border-r bg-muted/20 flex-shrink-0">
      <div className="p-3 border-b bg-muted/30">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">
          Modules
        </h3>
      </div>
      <ScrollArea className="h-[450px]">
        <div className="p-2 space-y-0.5">
          {/* All Modules Option */}
          <button
            onClick={() => setSelectedModuleId("all")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors text-sm",
              selectedModuleId === "all"
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"
            )}
          >
            <GitBranch className={cn(
              "h-4 w-4 flex-shrink-0",
              selectedModuleId === "all" ? "text-primary-foreground" : "text-muted-foreground"
            )} />
            <span className="flex-1 truncate">All Modules</span>
            <span className={cn(
              "text-xs tabular-nums px-1.5 py-0.5 rounded",
              selectedModuleId === "all"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {moduleTemplateCounts.all}
            </span>
          </button>

          {/* Module List */}
          {WORKFLOW_MODULES.map((module) => {
            const Icon = module.icon;
            const count = moduleTemplateCounts[module.id] || 0;
            const isSelected = selectedModuleId === module.id;

            return (
              <button
                key={module.id}
                onClick={() => setSelectedModuleId(module.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors text-sm",
                  isSelected
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 flex-shrink-0",
                  isSelected ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                <span className="flex-1 truncate">{module.name}</span>
                <span className={cn(
                  "text-xs tabular-nums px-1.5 py-0.5 rounded",
                  isSelected
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  // Render the template list and details grid
  const renderTemplateGrid = () => (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[450px]">
      {/* Template List */}
      <div className="lg:col-span-4 border rounded-lg overflow-hidden bg-muted/20">
        <ScrollArea className="h-[450px]">
          {loading ? (
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
              <GitBranch className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm">No templates found</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-md transition-colors",
                    selectedTemplateId === template.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Globe className={cn(
                          "h-3.5 w-3.5 flex-shrink-0",
                          selectedTemplateId === template.id 
                            ? "text-primary-foreground/80" 
                            : "text-blue-500"
                        )} />
                        <span className="font-medium truncate text-sm">
                          {template.name}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs mt-0.5 truncate",
                        selectedTemplateId === template.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}>
                        {CATEGORY_LABELS[template.category] || template.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {selectedTemplateId === template.id ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <span className={cn(
                          "w-2 h-2 rounded-full inline-block",
                          getTemplateEffectiveStatus(template) 
                            ? "bg-green-500" 
                            : isTemplateScheduled(template)
                              ? "bg-blue-500"
                              : "bg-muted-foreground"
                        )} />
                      )}
                    </div>
                  </div>
                  
                  {/* Date indicators */}
                  {(template.start_date || template.end_date) && selectedTemplateId !== template.id && (
                    <div className="flex items-center gap-2 mt-1">
                      {template.start_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateForDisplay(template.start_date)}
                        </span>
                      )}
                      {template.end_date && (
                        <span className={cn(
                          "text-xs flex items-center gap-1",
                          template.end_date < today ? "text-destructive" : "text-muted-foreground"
                        )}>
                          → {formatDateForDisplay(template.end_date)}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Template Details & Steps (Read-Only) */}
      <div className="lg:col-span-8 border rounded-lg overflow-hidden">
        {!selectedTemplateId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
            <GitBranch className="h-12 w-12 mb-3 opacity-40" />
            <p className="text-sm">Select a template to view details</p>
          </div>
        ) : selectedTemplate ? (
          <div className="h-full flex flex-col">
            {/* Template Header */}
            <div className="p-4 bg-muted/30 border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                    <Badge variant="outline" className="gap-1 text-blue-600">
                      <Globe className="h-3 w-3" />
                      Global
                    </Badge>
                    {getTemplateBadge(selectedTemplate)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">
                      {selectedTemplate.code}
                    </span>
                    {CATEGORY_LABELS[selectedTemplate.category] || selectedTemplate.category}
                  </p>
                  {selectedTemplate.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {selectedTemplate.description}
                    </p>
                  )}
                  
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
                      {!selectedTemplate.start_date && !selectedTemplate.end_date && (
                        <span className="text-muted-foreground">Always active</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProcessMap(selectedTemplate)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Process Map
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditTemplate(selectedTemplate)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            {/* Steps Section - READ ONLY */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4 border-b bg-background flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Workflow Steps</h4>
                  <Badge variant="secondary">{steps.length} steps</Badge>
                </div>
                {onNavigateToStepConfiguration && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => onNavigateToStepConfiguration(selectedTemplate.id)}
                  >
                    <Settings2 className="h-4 w-4 mr-1" />
                    Configure Steps
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[280px]">
                <div className="p-4 space-y-3">
                  {stepsLoading ? (
                    <>
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </>
                  ) : steps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-sm">No steps configured</p>
                      {onNavigateToStepConfiguration && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => onNavigateToStepConfiguration(selectedTemplate.id)}
                        >
                          <Settings2 className="h-4 w-4 mr-1" />
                          Configure Steps
                        </Button>
                      )}
                    </div>
                  ) : (
                    steps.map((step) => (
                      <WorkflowStepCard
                        key={step.id}
                        step={step}
                        positions={positions}
                        roles={roles}
                        governanceBodies={governanceBodies}
                        users={users}
                        workflowApprovalRoles={workflowApprovalRoles}
                        readonly={true}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  // Render filters row
  const renderFilters = () => (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Standalone tab layout with module sidebar
  if (isStandaloneTab) {
    return (
      <div className="space-y-4">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Template Library</h2>
            <Badge variant="secondary">{filteredTemplates.length} templates</Badge>
            <Badge variant="outline" className="gap-1 text-blue-600">
              <Globe className="h-3 w-3" />
              Global Only
            </Badge>
          </div>
          {onCreateTemplate && (
            <Button onClick={onCreateTemplate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          )}
        </div>

        {/* Filters */}
        {renderFilters()}

        {/* Main Content: Module Sidebar + Template Grid */}
        <div className="flex gap-4 border rounded-lg overflow-hidden bg-background">
          {renderModuleSidebar()}
          <div className="flex-1 p-4">
            {renderTemplateGrid()}
          </div>
        </div>
      </div>
    );
  }

  // Collapsible layout (embedded in another component)
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded-md">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Template Library</CardTitle>
                <Badge variant="secondary">{filteredTemplates.length} templates</Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {/* Filters */}
            {renderFilters()}

            {/* Main Content: Module Sidebar + Template Grid */}
            <div className="flex gap-4 border rounded-lg overflow-hidden">
              {renderModuleSidebar()}
              <div className="flex-1 p-4">
                {renderTemplateGrid()}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

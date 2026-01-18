import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  CheckCircle2, 
  ExternalLink, 
  Upload, 
  ChevronDown, 
  Clock,
  MessageSquare,
  User,
  ListChecks,
  AlertCircle,
  Globe,
  Building2,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import type { StepMapping } from "@/types/implementation";
import type { StepProgress } from "@/hooks/useStepProgress";
import { SubTaskList } from "./SubTaskList";
import { getSubTasksForStep } from "@/data/subTaskDefinitions";
import type { StepRollupStatus } from "@/hooks/useSubTaskProgress";
import { useSubTaskProgress } from "@/hooks/useSubTaskProgress";
import { useToast } from "@/hooks/use-toast";
import { useRouteResolver, RouteResolution } from "@/hooks/useRouteResolver";

interface PhaseItem {
  order: number;
  area: string;
  description: string;
}

interface StepCardProps {
  phaseId: string;
  step: PhaseItem;
  mapping?: StepMapping;
  stepProgress?: StepProgress;
  isComplete: boolean;
  isLoading: boolean;
  onToggleComplete: (complete: boolean) => Promise<void>;
  onUpdateNotes: (notes: string) => Promise<void>;
  onImportClick?: () => void;
  companyId?: string;
}

export function StepCard({
  phaseId,
  step,
  mapping,
  stepProgress,
  isComplete,
  isLoading,
  onToggleComplete,
  onUpdateNotes,
  onImportClick,
  companyId
}: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(stepProgress?.notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const { toast } = useToast();
  const { resolve } = useRouteResolver();
  
  const subTaskDefinitions = getSubTasksForStep(phaseId, step.order);
  const hasSubTasks = subTaskDefinitions.length > 0;
  
  // Use the hook to get actual sub-task status from database
  const { calculateStepStatus, subTasks, isLoading: isLoadingSubTasks } = useSubTaskProgress(
    companyId,
    phaseId,
    step.order
  );
  
  // Calculate rollup status from actual sub-task data
  const subTaskRollupStatus: StepRollupStatus = useMemo(() => {
    if (!hasSubTasks || isLoadingSubTasks) return 'not_started';
    return calculateStepStatus();
  }, [hasSubTasks, isLoadingSubTasks, calculateStepStatus, subTasks]);

  // Resolve route using Database-First approach
  const routeResolution: RouteResolution = useMemo(() => {
    // TODO: When featureCode is added to StepMapping, use it here
    // For now, use legacy adminRoute
    return resolve({ adminRoute: mapping?.adminRoute });
  }, [resolve, mapping?.adminRoute]);

  const hasValidRoute = routeResolution.isValid && routeResolution.path !== '#';

  const handleNotesBlur = async () => {
    if (notes !== (stepProgress?.notes || "")) {
      setIsSavingNotes(true);
      try {
        await onUpdateNotes(notes);
      } finally {
        setIsSavingNotes(false);
      }
    }
  };

  const handleToggle = async () => {
    await onToggleComplete(!isComplete);
  };

  // Auto-complete/uncomplete based on sub-task status changes
  useEffect(() => {
    if (!hasSubTasks || isLoadingSubTasks) return;
    
    // Auto-complete when all required sub-tasks are resolved
    if (subTaskRollupStatus === 'completed' && !isComplete) {
      onToggleComplete(true);
      toast({
        title: "Step auto-completed",
        description: "All required sub-tasks have been resolved",
      });
    }
    // Uncomplete if sub-tasks are no longer all resolved
    else if (subTaskRollupStatus !== 'completed' && isComplete && hasSubTasks) {
      onToggleComplete(false);
    }
  }, [subTaskRollupStatus, isComplete, hasSubTasks, isLoadingSubTasks, onToggleComplete, toast]);

  // Handler for SubTaskList (still needed for immediate UI updates)
  const handleSubTaskStatusChange = useCallback(async (_status: StepRollupStatus) => {
    // Status is now computed via the hook, no need to set state
    // The useEffect above handles auto-complete logic
  }, []);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`transition-colors ${isComplete ? "bg-muted/30 border-green-500/30" : "hover:bg-muted/50"}`}>
        <CardContent className="p-4">
          {/* Main Row */}
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <div className="pt-0.5">
              <Checkbox
                checked={isComplete}
                onCheckedChange={handleToggle}
                disabled={isLoading}
                className="h-5 w-5"
              />
            </div>

            {/* Order Number */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              isComplete 
                ? "bg-green-500/10 text-green-600" 
                : "bg-primary/10 text-primary"
            }`}>
              {isComplete ? <CheckCircle2 className="h-4 w-4" /> : step.order}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-medium ${isComplete ? "text-muted-foreground line-through" : ""}`}>
                  {step.area}
                </p>
                {mapping?.isRequired && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">Required</Badge>
                )}
                {mapping?.estimatedMinutes && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 gap-1">
                    <Clock className="h-3 w-3" />
                    {mapping.estimatedMinutes}m
                  </Badge>
                )}
                {hasSubTasks && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 gap-1">
                    <ListChecks className="h-3 w-3" />
                    {subTaskDefinitions.length} sub-tasks
                  </Badge>
                )}
                {/* Global vs Company scope badge */}
                {mapping?.isGlobal === true && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 gap-1 border-blue-500 text-blue-600">
                    <Globe className="h-3 w-3" />
                    Global
                  </Badge>
                )}
                {mapping?.isGlobal === false && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 gap-1">
                    <Building2 className="h-3 w-3" />
                    Per Company
                  </Badge>
                )}
                {/* Step status badges based on sub-task rollup */}
                {hasSubTasks && subTaskRollupStatus === 'not_started' && !isComplete && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground">
                    Not Started
                  </Badge>
                )}
                {hasSubTasks && subTaskRollupStatus === 'in_progress' && !isComplete && (
                  <Badge className="text-xs px-1.5 py-0 bg-blue-500">
                    In Progress
                  </Badge>
                )}
                {hasSubTasks && subTaskRollupStatus === 'blocked' && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0 gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Blocked
                  </Badge>
                )}
                {hasSubTasks && subTaskRollupStatus === 'deferred' && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 text-orange-500 border-orange-500">
                    Deferred
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              
              {/* Completion Info */}
              {isComplete && stepProgress?.completed_at && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Completed {format(new Date(stepProgress.completed_at), "MMM d, yyyy 'at' h:mm a")}
                  {stepProgress.completed_by_profile && (
                    <span>by {stepProgress.completed_by_profile.full_name}</span>
                  )}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {hasValidRoute && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={routeResolution.path}>
                        Configure
                        {routeResolution.source === 'legacy' && (
                          <AlertTriangle className="h-3 w-3 ml-1 text-warning" />
                        )}
                        {routeResolution.source !== 'legacy' && (
                          <ExternalLink className="h-3 w-3 ml-1" />
                        )}
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-xs">
                      {routeResolution.source === 'database' && "Route from database (SSOT)"}
                      {routeResolution.source === 'registry' && "Route from code registry (not synced)"}
                      {routeResolution.source === 'legacy' && "Legacy hardcoded route - needs migration"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{routeResolution.path}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {mapping?.importType && onImportClick && (
                <Button variant="outline" size="sm" onClick={onImportClick}>
                  <Upload className="h-3 w-3 mr-1" />
                  Import
                </Button>
              )}

              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Expanded Content */}
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t">
              {hasSubTasks ? (
                <Tabs defaultValue="subtasks" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="subtasks" className="gap-1">
                      <ListChecks className="h-3 w-3" />
                      Sub-Tasks ({subTaskDefinitions.length})
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Notes
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="subtasks">
                    <SubTaskList
                      companyId={companyId}
                      phaseId={phaseId}
                      stepOrder={step.order}
                      subTaskDefinitions={subTaskDefinitions}
                      onStepStatusChange={handleSubTaskStatusChange}
                    />
                  </TabsContent>
                  <TabsContent value="notes">
                    <div>
                      <Textarea
                        placeholder="Add notes about this step's implementation..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        disabled={isSavingNotes}
                        className="min-h-[80px]"
                      />
                      {isSavingNotes && (
                        <p className="text-xs text-muted-foreground mt-1">Saving...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div>
                  <label className="text-sm font-medium flex items-center gap-1 mb-2">
                    <MessageSquare className="h-3 w-3" />
                    Implementation Notes
                  </label>
                  <Textarea
                    placeholder="Add notes about this step's implementation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={handleNotesBlur}
                    disabled={isSavingNotes}
                    className="min-h-[80px]"
                  />
                  {isSavingNotes && (
                    <p className="text-xs text-muted-foreground mt-1">Saving...</p>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}

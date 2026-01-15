import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Clock,
  ChevronDown,
  ChevronRight,
  Trash2,
  Target,
  User,
  UserCheck,
  MessageSquare,
  BarChart,
  CheckCircle,
  FileCheck,
  GripVertical,
  Play,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Lightbulb,
} from "lucide-react";
import type { AppraisalTemplatePhase } from "@/types/appraisalFormTemplates";
import { formatDateRange } from "@/utils/appraisalDateCalculations";
import { formatPhaseDuration } from "@/hooks/useAppraisalTemplatePhases";
import type { DurationRecommendation } from "@/utils/phaseDurationRecommendations";

interface SortablePhaseItemProps {
  phase: AppraisalTemplatePhase;
  index: number;
  isExpanded: boolean;
  phaseWithDates?: {
    calculated_start_date?: Date;
    calculated_end_date?: Date;
  };
  recommendation?: DurationRecommendation | null;
  onToggleExpand: (open: boolean) => void;
  onUpdatePhase: (data: Partial<AppraisalTemplatePhase> & { id: string }) => Promise<any>;
  onDeletePhase: (id: string) => Promise<void>;
}

const getPhaseIcon = (phaseType: string) => {
  switch (phaseType) {
    case "goal_setting": return Target;
    case "self_assessment": return User;
    case "manager_review": return UserCheck;
    case "360_collection": return MessageSquare;
    case "calibration": return BarChart;
    case "hr_review": return ShieldCheck;
    case "finalization": return CheckCircle;
    case "employee_acknowledgment": return FileCheck;
    default: return Calendar;
  }
};

export function SortablePhaseItem({
  phase,
  index,
  isExpanded,
  phaseWithDates,
  recommendation,
  onToggleExpand,
  onUpdatePhase,
  onDeletePhase,
}: SortablePhaseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  const Icon = getPhaseIcon(phase.phase_type);

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible
        open={isExpanded}
        onOpenChange={onToggleExpand}
      >
        <Card className={`border ${!phase.is_active ? 'opacity-50' : ''} ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}>
          <div className="flex items-center">
            {/* Drag Handle - separate from collapsible trigger */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center p-4 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            
            {/* Collapsible Trigger */}
            <CollapsibleTrigger className="flex-1">
              <div className="flex items-center gap-3 p-4 pl-0 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {index + 1}
                </div>
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-medium flex-1 text-left">{phase.phase_name}</span>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatPhaseDuration(phase.duration_days)}
                </div>
                
                {phase.is_mandatory && (
                  <Badge variant="outline" className="mr-2">Required</Badge>
                )}
                
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 space-y-4">
              {/* Sample Dates */}
              {phaseWithDates?.calculated_start_date && phaseWithDates?.calculated_end_date && (
                <div className="p-2 bg-muted/50 rounded text-sm">
                  <span className="text-muted-foreground">Sample dates: </span>
                  <span className="font-medium">
                    {formatDateRange(phaseWithDates.calculated_start_date, phaseWithDates.calculated_end_date)}
                  </span>
                </div>
              )}

              {/* Timing Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Offset (days from cycle start)</Label>
                  <Input
                    type="number"
                    value={phase.start_offset_days}
                    onChange={(e) => onUpdatePhase({ 
                      id: phase.id, 
                      start_offset_days: parseInt(e.target.value) || 0 
                    })}
                    min={0}
                    max={365}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Duration (days)</Label>
                    {recommendation && recommendation.recommendedDays !== phase.duration_days && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUpdatePhase({ 
                                id: phase.id, 
                                duration_days: recommendation.recommendedDays 
                              })}
                              className="h-6 px-2 text-xs gap-1"
                            >
                              <Lightbulb className="h-3 w-3 text-amber-500" />
                              Suggested: {recommendation.recommendedDays}d
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="font-medium mb-1">{recommendation.rationale}</p>
                            <p className="text-xs text-muted-foreground">
                              Recommended range: {recommendation.minDays}-{recommendation.maxDays} days
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Input
                    type="number"
                    value={phase.duration_days}
                    onChange={(e) => onUpdatePhase({ 
                      id: phase.id, 
                      duration_days: parseInt(e.target.value) || 1 
                    })}
                    min={1}
                    max={90}
                  />
                </div>
              </div>

              {/* Phase Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Mandatory
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>When enabled, participants must complete this phase before the appraisal can be finalized. Optional phases can be skipped.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={phase.is_mandatory}
                      onCheckedChange={(checked) => onUpdatePhase({ 
                        id: phase.id, 
                        is_mandatory: checked 
                      })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {phase.is_mandatory ? "Required phase" : "Optional phase"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Allow Parallel
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>When enabled, this phase can run at the same time as other phases. Otherwise, it must complete before the next phase can start.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={phase.allow_parallel}
                      onCheckedChange={(checked) => onUpdatePhase({ 
                        id: phase.id, 
                        allow_parallel: checked 
                      })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {phase.allow_parallel ? "Can overlap" : "Sequential"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Automation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Auto-Advance
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p>When enabled, the appraisal automatically moves to the next phase when the advance condition is met. Otherwise, HR must manually advance each participant.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={phase.auto_advance}
                      onCheckedChange={(checked) => onUpdatePhase({ 
                        id: phase.id, 
                        auto_advance: checked 
                      })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {phase.auto_advance ? "Auto-advance when complete" : "Manual advancement"}
                    </span>
                  </div>
                </div>

                {phase.auto_advance && (
                  <div className="space-y-2">
                    <Label>Advance Condition</Label>
                    <Select 
                      value={phase.advance_condition || "deadline_passed"} 
                      onValueChange={(v) => onUpdatePhase({ id: phase.id, advance_condition: v as "all_complete" | "deadline_passed" | "approval_received" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_complete">All participants complete</SelectItem>
                        <SelectItem value="deadline_passed">Deadline passed</SelectItem>
                        <SelectItem value="approval_received">Approval received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  Notifications
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p>Choose when to send email reminders to participants. "On Start" notifies when the phase begins. "On Deadline" sends a reminder as the deadline approaches.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={phase.notify_on_start}
                      onCheckedChange={(checked) => onUpdatePhase({ 
                        id: phase.id, 
                        notify_on_start: checked 
                      })}
                    />
                    <Play className="h-3 w-3" />
                    On Start
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={phase.notify_on_deadline}
                      onCheckedChange={(checked) => onUpdatePhase({ 
                        id: phase.id, 
                        notify_on_deadline: checked 
                      })}
                    />
                    <Clock className="h-3 w-3" />
                    On Deadline
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={phase.is_active}
                    onCheckedChange={(checked) => onUpdatePhase({ 
                      id: phase.id, 
                      is_active: checked 
                    })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {phase.is_active ? "Active" : "Disabled"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeletePhase(phase.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

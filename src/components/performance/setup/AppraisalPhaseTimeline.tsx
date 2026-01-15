import { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle,
  Target,
  User,
  UserCheck,
  MessageSquare,
  BarChart,
  CheckCircle,
  FileCheck,
  GripVertical,
  Play,
  ArrowRight,
  HelpCircle
} from "lucide-react";
import type { 
  AppraisalTemplatePhase, 
  CreateTemplatePhaseInput,
  AppraisalPhaseType 
} from "@/types/appraisalFormTemplates";
import { PHASE_TYPE_PRESETS } from "@/types/appraisalFormTemplates";
import { calculateAllPhaseDates, formatDateRange } from "@/utils/appraisalDateCalculations";
import { formatPhaseDuration, validatePhaseTimeline } from "@/hooks/useAppraisalTemplatePhases";

interface Props {
  phases: AppraisalTemplatePhase[];
  templateId: string;
  defaultDurationDays: number;
  sampleStartDate?: Date;
  onAddPhase: (input: CreateTemplatePhaseInput) => Promise<any>;
  onUpdatePhase: (data: Partial<AppraisalTemplatePhase> & { id: string }) => Promise<any>;
  onDeletePhase: (id: string) => Promise<void>;
  onReorderPhases: (orderedIds: string[]) => Promise<void>;
  isUpdating?: boolean;
}

const getPhaseIcon = (phaseType: string) => {
  switch (phaseType) {
    case "goal_setting": return Target;
    case "self_assessment": return User;
    case "manager_review": return UserCheck;
    case "360_collection": return MessageSquare;
    case "calibration": return BarChart;
    case "finalization": return CheckCircle;
    case "employee_acknowledgment": return FileCheck;
    default: return Calendar;
  }
};

export function AppraisalPhaseTimeline({
  phases,
  templateId,
  defaultDurationDays,
  sampleStartDate = new Date(new Date().getFullYear() + 1, 0, 1),
  onAddPhase,
  onUpdatePhase,
  onDeletePhase,
  onReorderPhases,
  isUpdating,
}: Props) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhaseType, setNewPhaseType] = useState<AppraisalPhaseType>("self_assessment");

  // Calculate phase dates for visualization
  const phasesWithDates = useMemo(() => {
    return calculateAllPhaseDates(phases, sampleStartDate);
  }, [phases, sampleStartDate]);

  // Validate timeline
  const validation = useMemo(() => {
    return validatePhaseTimeline(phases);
  }, [phases]);

  // Calculate total timeline duration
  const totalDuration = useMemo(() => {
    if (phases.length === 0) return 0;
    let maxEnd = 0;
    phases.forEach(p => {
      const end = p.start_offset_days + p.duration_days;
      if (end > maxEnd) maxEnd = end;
    });
    return maxEnd;
  }, [phases]);

  const handleAddPhase = async () => {
    const preset = PHASE_TYPE_PRESETS[newPhaseType];
    const lastPhase = phases[phases.length - 1];
    const startOffset = lastPhase 
      ? lastPhase.start_offset_days + lastPhase.duration_days 
      : 0;

    const newPhase: CreateTemplatePhaseInput = {
      template_id: templateId,
      phase_type: newPhaseType,
      phase_name: preset.label,
      display_order: phases.length,
      start_offset_days: startOffset,
      duration_days: preset.defaultDurationDays,
      is_mandatory: true,
      notify_on_start: true,
      notify_on_deadline: true,
    };
    
    await onAddPhase(newPhase);
    setShowAddPhase(false);
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Phase Timeline</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Duration: <span className="font-medium">{formatPhaseDuration(totalDuration)}</span>
        </div>
      </div>

      {/* Validation Warnings */}
      {!validation.valid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {validation.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Visual Timeline */}
      {phasesWithDates.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="text-xs text-muted-foreground mb-2">
              Sample timeline starting {format(sampleStartDate, "MMM d, yyyy")}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {phasesWithDates.map((phase, index) => {
                const Icon = getPhaseIcon(phase.phase_type);
                const widthPercent = Math.max((phase.duration_days / totalDuration) * 100, 15);
                
                return (
                  <div key={phase.id} className="flex items-center gap-1">
                    <div 
                      className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 border border-primary/20"
                      style={{ minWidth: `${widthPercent}%` }}
                    >
                      <Icon className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-xs truncate">{phase.phase_name}</span>
                    </div>
                    {index < phasesWithDates.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase List */}
      <div className="space-y-2">
        {phases.map((phase, index) => {
          const Icon = getPhaseIcon(phase.phase_type);
          const isExpanded = expandedPhase === phase.id;
          const phaseWithDates = phasesWithDates.find(p => p.id === phase.id);

          return (
            <Collapsible
              key={phase.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedPhase(open ? phase.id : null)}
            >
              <Card className={`border ${!phase.is_active ? 'opacity-50' : ''}`}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
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
                        <Label>Duration (days)</Label>
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
          );
        })}
      </div>

      {/* Add Phase */}
      {showAddPhase ? (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Select value={newPhaseType} onValueChange={(v) => setNewPhaseType(v as AppraisalPhaseType)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                {(Object.entries(PHASE_TYPE_PRESETS) as [AppraisalPhaseType, typeof PHASE_TYPE_PRESETS[AppraisalPhaseType]][]).map(([type, preset]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex flex-col">
                        <span>{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddPhase} disabled={isUpdating}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddPhase(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button 
          variant="outline" 
          className="w-full border-dashed"
          onClick={() => setShowAddPhase(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Phase
        </Button>
      )}

      {/* Preset Suggestions */}
      {phases.length === 0 && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            No phases configured. Add phases to define the appraisal workflow timeline.
            A typical annual review includes: Goal Setting → Self Assessment → 360 Collection → Manager Review → Calibration → Finalization.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

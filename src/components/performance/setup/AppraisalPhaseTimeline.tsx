import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar,
  Plus,
  AlertTriangle,
  Target,
  User,
  UserCheck,
  MessageSquare,
  BarChart,
  CheckCircle,
  FileCheck,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { 
  AppraisalTemplatePhase, 
  CreateTemplatePhaseInput,
  AppraisalPhaseType 
} from "@/types/appraisalFormTemplates";
import { PHASE_TYPE_PRESETS } from "@/types/appraisalFormTemplates";
import { calculateAllPhaseDates } from "@/utils/appraisalDateCalculations";
import { formatPhaseDuration, validatePhaseTimeline } from "@/hooks/useAppraisalTemplatePhases";
import { SortablePhaseItem } from "./SortablePhaseItem";

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
    case "hr_review": return ShieldCheck;
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

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex(p => p.id === active.id);
      const newIndex = phases.findIndex(p => p.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedPhases = arrayMove(phases, oldIndex, newIndex);
        const orderedIds = reorderedPhases.map(p => p.id);
        await onReorderPhases(orderedIds);
      }
    }
  }, [phases, onReorderPhases]);

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

  // Phase IDs for sortable context
  const phaseIds = useMemo(() => phases.map(p => p.id), [phases]);

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={phaseIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {phases.map((phase, index) => {
              const isExpanded = expandedPhase === phase.id;
              const phaseWithDates = phasesWithDates.find(p => p.id === phase.id);

              return (
                <SortablePhaseItem
                  key={phase.id}
                  phase={phase}
                  index={index}
                  isExpanded={isExpanded}
                  phaseWithDates={phaseWithDates}
                  onToggleExpand={(open) => setExpandedPhase(open ? phase.id : null)}
                  onUpdatePhase={onUpdatePhase}
                  onDeletePhase={onDeletePhase}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

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

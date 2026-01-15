import { useMemo } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Target,
  User,
  UserCheck,
  MessageSquare,
  BarChart,
  CheckCircle,
  FileCheck,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import type { AppraisalTemplatePhase } from "@/types/appraisalFormTemplates";
import { formatPhaseDuration } from "@/hooks/useAppraisalTemplatePhases";

interface PhaseWithDates extends AppraisalTemplatePhase {
  calculated_start_date?: Date;
  calculated_end_date?: Date;
}

interface PhaseGanttChartProps {
  phases: PhaseWithDates[];
  totalDuration: number;
  sampleStartDate: Date;
  onPhaseClick?: (phaseId: string) => void;
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

const getPhaseColor = (phaseType: string): string => {
  switch (phaseType) {
    case "goal_setting": return "bg-blue-500";
    case "self_assessment": return "bg-emerald-500";
    case "manager_review": return "bg-violet-500";
    case "360_collection": return "bg-amber-500";
    case "calibration": return "bg-rose-500";
    case "hr_review": return "bg-cyan-500";
    case "finalization": return "bg-indigo-500";
    case "employee_acknowledgment": return "bg-teal-500";
    default: return "bg-gray-500";
  }
};

const getPhaseColorLight = (phaseType: string): string => {
  switch (phaseType) {
    case "goal_setting": return "bg-blue-100 border-blue-300 text-blue-700";
    case "self_assessment": return "bg-emerald-100 border-emerald-300 text-emerald-700";
    case "manager_review": return "bg-violet-100 border-violet-300 text-violet-700";
    case "360_collection": return "bg-amber-100 border-amber-300 text-amber-700";
    case "calibration": return "bg-rose-100 border-rose-300 text-rose-700";
    case "hr_review": return "bg-cyan-100 border-cyan-300 text-cyan-700";
    case "finalization": return "bg-indigo-100 border-indigo-300 text-indigo-700";
    case "employee_acknowledgment": return "bg-teal-100 border-teal-300 text-teal-700";
    default: return "bg-gray-100 border-gray-300 text-gray-700";
  }
};

export function PhaseGanttChart({
  phases,
  totalDuration,
  sampleStartDate,
  onPhaseClick,
}: PhaseGanttChartProps) {
  // Sort phases by display_order to respect user's saved sequence
  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => a.display_order - b.display_order);
  }, [phases]);

  // Assign rows based on display order - each phase gets its own row
  const phaseRows = useMemo(() => {
    return sortedPhases.map((phase, index) => ({
      phase,
      row: index,
    }));
  }, [sortedPhases]);

  const maxRow = useMemo(() => {
    return Math.max(0, sortedPhases.length - 1);
  }, [sortedPhases]);

  // Generate time scale markers
  const timeMarkers = useMemo(() => {
    const markers: { day: number; label: string }[] = [];
    const interval = totalDuration <= 30 ? 7 : totalDuration <= 90 ? 14 : 30;
    
    for (let day = 0; day <= totalDuration; day += interval) {
      const date = addDays(sampleStartDate, day);
      markers.push({
        day,
        label: format(date, "MMM d"),
      });
    }
    
    // Add final day if not already included
    if (markers.length === 0 || markers[markers.length - 1].day < totalDuration) {
      const endDate = addDays(sampleStartDate, totalDuration);
      markers.push({
        day: totalDuration,
        label: format(endDate, "MMM d"),
      });
    }
    
    return markers;
  }, [totalDuration, sampleStartDate]);

  if (phases.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-8 text-center text-muted-foreground">
          No phases to display. Add phases to see the Gantt chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-6">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedPhases.map(phase => {
            const Icon = getPhaseIcon(phase.phase_type);
            return (
              <Badge
                key={phase.id}
                variant="outline"
                className={`${getPhaseColorLight(phase.phase_type)} gap-1`}
              >
                <Icon className="h-3 w-3" />
                {phase.phase_name}
              </Badge>
            );
          })}
        </div>

        {/* Gantt Chart Container */}
        <div className="relative">
          {/* Time Scale Header */}
          <div className="flex border-b border-border pb-2 mb-2">
            <div className="w-32 flex-shrink-0" />
            <div className="flex-1 relative h-6">
              {timeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute text-xs text-muted-foreground transform -translate-x-1/2"
                  style={{ left: `${(marker.day / totalDuration) * 100}%` }}
                >
                  {marker.label}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none" style={{ left: '128px' }}>
            {timeMarkers.map((marker, index) => (
              <div
                key={index}
                className="absolute top-8 bottom-0 border-l border-dashed border-border/50"
                style={{ left: `${(marker.day / totalDuration) * 100}%` }}
              />
            ))}
          </div>

          {/* Phase Rows */}
          <div className="space-y-1" style={{ minHeight: `${(maxRow + 1) * 44}px` }}>
            {phaseRows.map(({ phase, row }) => {
              const Icon = getPhaseIcon(phase.phase_type);
              const startPercent = (phase.start_offset_days / totalDuration) * 100;
              const widthPercent = (phase.duration_days / totalDuration) * 100;
              const startDate = phase.calculated_start_date || addDays(sampleStartDate, phase.start_offset_days);
              const endDate = phase.calculated_end_date || addDays(startDate, phase.duration_days);
              
              return (
                <div 
                  key={phase.id} 
                  className="flex items-center h-10"
                  style={{ marginTop: row > 0 ? `${row * 44}px` : undefined }}
                >
                  {/* Phase Label */}
                  <div className="w-32 flex-shrink-0 pr-2 truncate text-sm font-medium flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{phase.phase_name}</span>
                  </div>
                  
                  {/* Gantt Bar */}
                  <div className="flex-1 relative h-8">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute h-full rounded-md cursor-pointer transition-all hover:opacity-90 hover:shadow-md flex items-center px-2 gap-1 overflow-hidden ${getPhaseColor(phase.phase_type)}`}
                            style={{
                              left: `${startPercent}%`,
                              width: `${Math.max(widthPercent, 3)}%`,
                            }}
                            onClick={() => onPhaseClick?.(phase.id)}
                          >
                            <span className="text-xs text-white font-medium truncate">
                              {formatPhaseDuration(phase.duration_days)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">{phase.phase_name}</p>
                            <p className="text-xs">
                              {format(startDate, "MMM d, yyyy")} – {format(endDate, "MMM d, yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Duration: {formatPhaseDuration(phase.duration_days)}
                            </p>
                            {phase.is_mandatory && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Duration Summary */}
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{phases.length}</span> phases
              {phaseRows.some(r => r.row > 0) && (
                <span className="ml-2 text-amber-600">
                  (includes overlapping phases)
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              Total: <span className="font-medium text-foreground">{formatPhaseDuration(totalDuration)}</span>
              <span className="ml-2">
                ({format(sampleStartDate, "MMM d")} – {format(addDays(sampleStartDate, totalDuration), "MMM d, yyyy")})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

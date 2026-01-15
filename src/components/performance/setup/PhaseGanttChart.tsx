import { useState, useMemo, useRef } from "react";
import { format, addDays, addWeeks } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  ZoomIn,
  ZoomOut,
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

type ViewMode = "day" | "week" | "month";

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
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Calculate chart width based on view mode
  const chartConfig = useMemo(() => {
    switch (viewMode) {
      case "day":
        return {
          unitWidth: 30, // pixels per day
          interval: 1,
          formatLabel: (date: Date) => format(date, "d"),
          formatHeader: (date: Date) => format(date, "MMM yyyy"),
        };
      case "week":
        return {
          unitWidth: 80, // pixels per week
          interval: 7,
          formatLabel: (date: Date) => `W${format(date, "w")}`,
          formatHeader: (date: Date) => format(date, "MMM yyyy"),
        };
      case "month":
        return {
          unitWidth: 120, // pixels per month
          interval: 30,
          formatLabel: (date: Date) => format(date, "MMM"),
          formatHeader: (date: Date) => format(date, "yyyy"),
        };
    }
  }, [viewMode]);

  // Generate time markers based on view mode
  const timeMarkers = useMemo(() => {
    const markers: { day: number; label: string; isMonthStart?: boolean }[] = [];
    const { interval, formatLabel } = chartConfig;
    
    for (let day = 0; day <= totalDuration; day += interval) {
      const date = addDays(sampleStartDate, day);
      const isMonthStart = date.getDate() <= interval;
      markers.push({
        day,
        label: formatLabel(date),
        isMonthStart,
      });
    }
    
    // Add final marker if not already included
    if (markers.length === 0 || markers[markers.length - 1].day < totalDuration) {
      const endDate = addDays(sampleStartDate, totalDuration);
      markers.push({
        day: totalDuration,
        label: formatLabel(endDate),
      });
    }
    
    return markers;
  }, [totalDuration, sampleStartDate, chartConfig]);

  // Calculate total chart width
  const totalChartWidth = useMemo(() => {
    const units = totalDuration / chartConfig.interval;
    return Math.max(units * chartConfig.unitWidth, 400);
  }, [totalDuration, chartConfig]);

  // Calculate month headers for grouping
  const monthHeaders = useMemo(() => {
    const headers: { label: string; startDay: number; endDay: number }[] = [];
    let currentMonth = -1;
    let currentHeader: { label: string; startDay: number; endDay: number } | null = null;

    for (let day = 0; day <= totalDuration; day += chartConfig.interval) {
      const date = addDays(sampleStartDate, day);
      const month = date.getMonth();

      if (month !== currentMonth) {
        if (currentHeader) {
          currentHeader.endDay = day;
          headers.push(currentHeader);
        }
        currentMonth = month;
        currentHeader = {
          label: format(date, "MMMM yyyy"),
          startDay: day,
          endDay: totalDuration,
        };
      }
    }

    if (currentHeader) {
      headers.push(currentHeader);
    }

    return headers;
  }, [totalDuration, sampleStartDate, chartConfig.interval]);

  // Detect overlapping phases for visual indicator
  const hasOverlaps = useMemo(() => {
    for (let i = 0; i < sortedPhases.length; i++) {
      for (let j = i + 1; j < sortedPhases.length; j++) {
        const a = sortedPhases[i];
        const b = sortedPhases[j];
        const aEnd = a.start_offset_days + a.duration_days;
        const bEnd = b.start_offset_days + b.duration_days;
        
        // Check if phases overlap
        if (!(aEnd <= b.start_offset_days || bEnd <= a.start_offset_days)) {
          return true;
        }
      }
    }
    return false;
  }, [sortedPhases]);

  if (phases.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-8 text-center text-muted-foreground">
          No phases to display. Add phases to see the Gantt chart.
        </CardContent>
      </Card>
    );
  }

  const rowHeight = 40;
  const headerHeight = 56;

  return (
    <Card>
      <CardContent className="pt-4 pb-6">
        {/* Controls Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-2">
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

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">View:</span>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as ViewMode)}
              className="bg-muted/50 rounded-md p-0.5"
            >
              <ToggleGroupItem value="day" size="sm" className="text-xs px-2 h-7">
                Day
              </ToggleGroupItem>
              <ToggleGroupItem value="week" size="sm" className="text-xs px-2 h-7">
                Week
              </ToggleGroupItem>
              <ToggleGroupItem value="month" size="sm" className="text-xs px-2 h-7">
                Month
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Gantt Chart Container with Sticky Header */}
        <div className="relative border rounded-lg overflow-hidden">
          <ScrollArea className="w-full" ref={scrollRef}>
            <div style={{ minWidth: `${totalChartWidth + 140}px` }}>
              {/* Sticky Header */}
              <div className="sticky top-0 z-20 bg-background border-b">
                <div className="flex">
                  {/* Phase column header */}
                  <div className="w-[140px] flex-shrink-0 px-3 py-2 border-r bg-muted/30 font-medium text-sm">
                    Phase
                  </div>
                  
                  {/* Month headers */}
                  <div className="flex-1 relative" style={{ width: `${totalChartWidth}px` }}>
                    {/* Month row */}
                    <div className="h-7 border-b bg-muted/20 flex">
                      {monthHeaders.map((header, index) => {
                        const startPercent = (header.startDay / totalDuration) * 100;
                        const widthPercent = ((header.endDay - header.startDay) / totalDuration) * 100;
                        return (
                          <div
                            key={index}
                            className="absolute text-xs font-medium text-foreground px-2 flex items-center border-r border-border/50"
                            style={{
                              left: `${startPercent}%`,
                              width: `${widthPercent}%`,
                              height: '28px',
                            }}
                          >
                            {header.label}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Day/Week markers row */}
                    <div className="h-7 relative">
                      {timeMarkers.map((marker, index) => (
                        <div
                          key={index}
                          className={`absolute text-xs text-muted-foreground flex items-center justify-center border-r border-border/30 h-full ${
                            marker.isMonthStart ? "font-medium" : ""
                          }`}
                          style={{
                            left: `${(marker.day / totalDuration) * 100}%`,
                            width: `${(chartConfig.interval / totalDuration) * 100}%`,
                          }}
                        >
                          {marker.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase Rows */}
              <div>
                {phaseRows.map(({ phase, row }) => {
                  const Icon = getPhaseIcon(phase.phase_type);
                  const startPercent = (phase.start_offset_days / totalDuration) * 100;
                  const widthPercent = (phase.duration_days / totalDuration) * 100;
                  const startDate = phase.calculated_start_date || addDays(sampleStartDate, phase.start_offset_days);
                  const endDate = phase.calculated_end_date || addDays(startDate, phase.duration_days);
                  
                  return (
                    <div 
                      key={phase.id} 
                      className="flex items-center border-b border-border/30 hover:bg-muted/20 transition-colors"
                      style={{ height: `${rowHeight}px` }}
                    >
                      {/* Phase Label - Sticky */}
                      <div className="w-[140px] flex-shrink-0 px-3 truncate text-sm font-medium flex items-center gap-2 border-r bg-background sticky left-0 z-10 h-full">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{phase.phase_name}</span>
                      </div>
                      
                      {/* Gantt Bar Area */}
                      <div className="flex-1 relative h-8 mx-1" style={{ width: `${totalChartWidth}px` }}>
                        {/* Grid lines */}
                        {timeMarkers.map((marker, index) => (
                          <div
                            key={index}
                            className="absolute top-0 bottom-0 border-l border-border/20"
                            style={{ left: `${(marker.day / totalDuration) * 100}%` }}
                          />
                        ))}
                        
                        {/* Phase Bar */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-1 h-6 rounded cursor-pointer transition-all hover:opacity-90 hover:shadow-md flex items-center px-2 gap-1 overflow-hidden ${getPhaseColor(phase.phase_type)}`}
                                style={{
                                  left: `${startPercent}%`,
                                  width: `${Math.max(widthPercent, 2)}%`,
                                }}
                                onClick={() => onPhaseClick?.(phase.id)}
                              >
                                <span className="text-xs text-white font-medium truncate">
                                  {widthPercent > 8 ? formatPhaseDuration(phase.duration_days) : ""}
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
                                <p className="text-xs text-muted-foreground">
                                  Starts: Day {phase.start_offset_days}
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
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Timeline Duration Summary */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">{phases.length}</span> phases
            {hasOverlaps && (
              <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300 bg-amber-50">
                Has Overlaps
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatPhaseDuration(totalDuration)}</span>
            <span className="ml-2">
              ({format(sampleStartDate, "MMM d")} – {format(addDays(sampleStartDate, totalDuration), "MMM d, yyyy")})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

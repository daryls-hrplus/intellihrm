import { format, addDays, differenceInDays } from "date-fns";
import type { 
  AppraisalTemplatePhase, 
  AppraisalTemplateSection,
  PhaseWithDates,
  SectionWithDeadline 
} from "@/types/appraisalFormTemplates";

// Calculate all phase dates based on cycle start date
export function calculateAllPhaseDates(
  phases: AppraisalTemplatePhase[],
  cycleStartDate: Date
): PhaseWithDates[] {
  return phases.map(phase => {
    const startDate = addDays(cycleStartDate, phase.start_offset_days);
    const endDate = addDays(startDate, phase.duration_days);
    
    return {
      ...phase,
      calculated_start_date: startDate,
      calculated_end_date: endDate,
    };
  });
}

// Calculate section deadlines based on cycle end date and evaluation offset
export function calculateSectionDeadlines(
  sections: AppraisalTemplateSection[],
  cycleEndDate: Date,
  evaluationOffsetDays: number
): SectionWithDeadline[] {
  const evaluationDeadline = addDays(cycleEndDate, -evaluationOffsetDays);
  
  return sections.map(section => {
    const deadline = addDays(evaluationDeadline, -section.deadline_offset_days);
    
    return {
      ...section,
      calculated_deadline: deadline,
    };
  });
}

// Calculate cycle dates from template defaults
export function calculateCycleDatesFromTemplate(
  startDate: Date,
  durationDays: number,
  evaluationOffsetDays: number
): {
  endDate: Date;
  evaluationDeadline: Date;
} {
  const endDate = addDays(startDate, durationDays);
  const evaluationDeadline = addDays(endDate, -evaluationOffsetDays);
  
  return {
    endDate,
    evaluationDeadline,
  };
}

// Format date for display
export function formatPhaseDate(date: Date, formatStr: string = "MMM d, yyyy"): string {
  return format(date, formatStr);
}

// Format date range for display
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  
  if (sameMonth && sameYear) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  }
  
  if (sameYear) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  }
  
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
}

// Get days remaining until deadline
export function getDaysUntilDeadline(deadline: Date): number {
  return differenceInDays(deadline, new Date());
}

// Check if a date is overdue
export function isOverdue(deadline: Date): boolean {
  return getDaysUntilDeadline(deadline) < 0;
}

// Get deadline status
export function getDeadlineStatus(deadline: Date): 'overdue' | 'due_soon' | 'on_track' {
  const daysRemaining = getDaysUntilDeadline(deadline);
  
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 3) return 'due_soon';
  return 'on_track';
}

// Calculate recommended reminder dates
export function calculateReminderDates(
  deadline: Date,
  reminderDaysBefore: number[]
): Date[] {
  return reminderDaysBefore
    .map(days => addDays(deadline, -days))
    .filter(date => date > new Date()) // Only future dates
    .sort((a, b) => a.getTime() - b.getTime());
}

// Generate sample dates for preview
export function generateSampleDates(durationDays: number = 365): {
  sampleStartDate: Date;
  sampleEndDate: Date;
} {
  // Use Jan 1 of next year as sample start for clarity
  const nextYear = new Date().getFullYear() + 1;
  const sampleStartDate = new Date(nextYear, 0, 1);
  const sampleEndDate = addDays(sampleStartDate, durationDays);
  
  return {
    sampleStartDate,
    sampleEndDate,
  };
}

// Validate that phases fit within cycle duration
export function validatePhasesWithinCycle(
  phases: AppraisalTemplatePhase[],
  cycleDurationDays: number
): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  for (const phase of phases) {
    const phaseEndDay = phase.start_offset_days + phase.duration_days;
    
    if (phaseEndDay > cycleDurationDays) {
      issues.push(
        `"${phase.phase_name}" extends beyond cycle end (ends on day ${phaseEndDay}, cycle is ${cycleDurationDays} days)`
      );
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

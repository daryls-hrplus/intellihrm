/**
 * Proration Calculator for Mid-Period Salary Calculations
 * 
 * Handles proration when employees start or end employment mid-pay-period.
 * Supports three proration methods:
 * - CALENDAR_DAYS: Prorate based on calendar days
 * - WORK_DAYS: Prorate based on working days (Mon-Fri, excluding weekends)
 * - NONE: No proration applied
 */

export type ProrationMethod = 'CALENDAR_DAYS' | 'WORK_DAYS' | 'NONE';

export interface ProrationParams {
  periodStart: Date;
  periodEnd: Date;
  employeeStartDate: Date | null;
  employeeEndDate: Date | null; // termination date
  prorationMethod: ProrationMethod;
}

export interface ProrationResult {
  factor: number; // 0.0 to 1.0
  daysWorked: number;
  totalDays: number;
  isProrated: boolean;
  effectiveStart: Date;
  effectiveEnd: Date;
}

/**
 * Count working days (Mon-Fri) between two dates, inclusive
 */
export function countWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // Monday = 1, Friday = 5
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Count calendar days between two dates, inclusive
 */
export function countCalendarDays(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculate proration factor for an employee's pay based on their
 * start date, end date, and the pay period boundaries.
 */
export function calculateProrationFactor(params: ProrationParams): ProrationResult {
  const { periodStart, periodEnd, employeeStartDate, employeeEndDate, prorationMethod } = params;
  
  // Normalize dates to start of day for accurate comparison
  const periodStartNorm = new Date(periodStart);
  periodStartNorm.setHours(0, 0, 0, 0);
  
  const periodEndNorm = new Date(periodEnd);
  periodEndNorm.setHours(23, 59, 59, 999);
  
  // Determine effective start date (later of period start or employee start)
  let effectiveStart = new Date(periodStartNorm);
  if (employeeStartDate) {
    const empStart = new Date(employeeStartDate);
    empStart.setHours(0, 0, 0, 0);
    if (empStart > periodStartNorm) {
      effectiveStart = empStart;
    }
  }
  
  // Determine effective end date (earlier of period end or employee termination)
  let effectiveEnd = new Date(periodEndNorm);
  if (employeeEndDate) {
    const empEnd = new Date(employeeEndDate);
    empEnd.setHours(23, 59, 59, 999);
    if (empEnd < periodEndNorm) {
      effectiveEnd = empEnd;
    }
  }
  
  // If employee started after period ended or ended before period started, no pay
  if (effectiveStart > periodEndNorm || effectiveEnd < periodStartNorm) {
    return {
      factor: 0,
      daysWorked: 0,
      totalDays: prorationMethod === 'WORK_DAYS' 
        ? countWorkingDays(periodStartNorm, periodEndNorm)
        : countCalendarDays(periodStartNorm, periodEndNorm),
      isProrated: true,
      effectiveStart,
      effectiveEnd,
    };
  }
  
  // If no proration method or NONE, return full pay
  if (prorationMethod === 'NONE') {
    const totalDays = countCalendarDays(periodStartNorm, periodEndNorm);
    return {
      factor: 1,
      daysWorked: totalDays,
      totalDays,
      isProrated: false,
      effectiveStart: periodStartNorm,
      effectiveEnd: periodEndNorm,
    };
  }
  
  // Calculate based on proration method
  let daysWorked: number;
  let totalDays: number;
  
  if (prorationMethod === 'WORK_DAYS') {
    daysWorked = countWorkingDays(effectiveStart, effectiveEnd);
    totalDays = countWorkingDays(periodStartNorm, periodEndNorm);
  } else {
    // CALENDAR_DAYS (default)
    daysWorked = countCalendarDays(effectiveStart, effectiveEnd);
    totalDays = countCalendarDays(periodStartNorm, periodEndNorm);
  }
  
  // Check if proration is actually needed
  const isProrated = daysWorked !== totalDays;
  const factor = totalDays > 0 ? daysWorked / totalDays : 0;
  
  return {
    factor,
    daysWorked,
    totalDays,
    isProrated,
    effectiveStart,
    effectiveEnd,
  };
}

/**
 * Apply proration to a compensation amount
 */
export function applyProration(amount: number, prorationResult: ProrationResult): number {
  return Math.round((amount * prorationResult.factor) * 100) / 100;
}

/**
 * Get the proration method code from a pay element's proration_method lookup value
 */
export function getProrationMethodCode(prorationMethodName: string | null | undefined): ProrationMethod {
  if (!prorationMethodName) return 'NONE';
  
  const upperName = prorationMethodName.toUpperCase();
  if (upperName.includes('CALENDAR')) return 'CALENDAR_DAYS';
  if (upperName.includes('WORK')) return 'WORK_DAYS';
  
  // Check for codes
  if (upperName === 'CALENDAR_DAYS') return 'CALENDAR_DAYS';
  if (upperName === 'WORK_DAYS') return 'WORK_DAYS';
  if (upperName === 'NONE') return 'NONE';
  
  return 'NONE';
}

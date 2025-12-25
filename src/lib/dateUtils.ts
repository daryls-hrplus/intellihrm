import { parseISO, format as dateFnsFormat } from "date-fns";

/**
 * Safely parses a date string, handling both date-only (YYYY-MM-DD) and full ISO timestamps.
 * 
 * Date-only strings like "2025-12-01" are parsed as LOCAL dates to avoid timezone shifts.
 * Full timestamps with timezone info are parsed normally.
 * 
 * @param dateString - The date string to parse
 * @returns A Date object
 */
export function parseDate(dateString: string): Date {
  // parseISO from date-fns correctly handles date-only strings as local dates
  return parseISO(dateString);
}

/**
 * Formats a date string for display, properly handling timezone issues.
 * Use this instead of `format(new Date(dateString), pattern)` to avoid
 * date-only strings being shifted by timezone.
 * 
 * @param dateString - The date string to format
 * @param formatPattern - The date-fns format pattern (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null | undefined, formatPattern: string = 'MMM d, yyyy'): string {
  if (!dateString) return '-';
  return dateFnsFormat(parseISO(dateString), formatPattern);
}

/**
 * Formats a date string for display, returning null if the date is empty.
 * Useful for conditional rendering.
 * 
 * @param dateString - The date string to format
 * @param formatPattern - The date-fns format pattern (default: 'MMM d, yyyy')
 * @returns Formatted date string or null
 */
export function formatDateOrNull(dateString: string | null | undefined, formatPattern: string = 'MMM d, yyyy'): string | null {
  if (!dateString) return null;
  return dateFnsFormat(parseISO(dateString), formatPattern);
}

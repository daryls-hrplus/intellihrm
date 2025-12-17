import { format, parseISO } from "date-fns";

/**
 * Parses a date string (YYYY-MM-DD) as a local date, not UTC.
 * This prevents timezone-related date shifts (e.g., Dec 1 becoming Nov 30).
 * 
 * @param dateString - A date string in YYYY-MM-DD format or ISO format
 * @returns Date object in local timezone
 */
export function parseLocalDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  // If it's just a date (YYYY-MM-DD), parse it as local time
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Append time component to treat as local midnight, not UTC
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // For ISO strings with time, use parseISO from date-fns
  return parseISO(dateString);
}

/**
 * Formats a date string for display, handling timezone correctly.
 * 
 * @param dateString - A date string from the database
 * @param formatStr - The format string (default: "MMM d, yyyy")
 * @returns Formatted date string or empty string if invalid
 */
export function formatDateForDisplay(
  dateString: string | null | undefined,
  formatStr: string = "MMM d, yyyy"
): string {
  if (!dateString) return "";
  
  const date = parseLocalDate(dateString);
  if (!date || isNaN(date.getTime())) return "";
  
  return format(date, formatStr);
}

/**
 * Converts a Date object to a YYYY-MM-DD string for database storage.
 * Uses local date components to prevent timezone shifts.
 * 
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function toDateString(date: Date | null | undefined): string {
  if (!date) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date as a YYYY-MM-DD string in local timezone.
 * 
 * @returns Today's date string
 */
export function getTodayString(): string {
  return toDateString(new Date());
}

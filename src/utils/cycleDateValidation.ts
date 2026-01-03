import { parseLocalDate } from "./dateUtils";

interface CycleDates {
  start_date: string;
  end_date: string;
  self_review_deadline?: string;
  peer_nomination_deadline?: string;
  feedback_deadline?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates cycle dates according to industry standards.
 * Returns errors (blocking) and warnings (advisory).
 */
export function validateCycleDates(dates: CycleDates): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const start = dates.start_date ? parseLocalDate(dates.start_date) : null;
  const end = dates.end_date ? parseLocalDate(dates.end_date) : null;
  const selfReview = dates.self_review_deadline ? parseLocalDate(dates.self_review_deadline) : null;
  const peerNomination = dates.peer_nomination_deadline ? parseLocalDate(dates.peer_nomination_deadline) : null;
  const feedback = dates.feedback_deadline ? parseLocalDate(dates.feedback_deadline) : null;

  // Required: Start date must be before end date
  if (start && end && start >= end) {
    errors.push({ field: "end_date", message: "End date must be after start date" });
  }

  // All deadlines must be within cycle period
  if (selfReview && start && selfReview < start) {
    errors.push({ field: "self_review_deadline", message: "Self review deadline must be on or after start date" });
  }
  if (selfReview && end && selfReview > end) {
    errors.push({ field: "self_review_deadline", message: "Self review deadline must be on or before end date" });
  }

  if (peerNomination && start && peerNomination < start) {
    errors.push({ field: "peer_nomination_deadline", message: "Peer nomination deadline must be on or after start date" });
  }
  if (peerNomination && end && peerNomination > end) {
    errors.push({ field: "peer_nomination_deadline", message: "Peer nomination deadline must be on or before end date" });
  }

  if (feedback && start && feedback < start) {
    errors.push({ field: "feedback_deadline", message: "Feedback deadline must be on or after start date" });
  }
  if (feedback && end && feedback > end) {
    errors.push({ field: "feedback_deadline", message: "Feedback deadline must be on or before end date" });
  }

  // Logical sequence warnings (advisory, not blocking)
  if (peerNomination && selfReview && peerNomination > selfReview) {
    warnings.push({ field: "peer_nomination_deadline", message: "Peer nomination typically happens before self review deadline" });
  }
  if (selfReview && feedback && selfReview > feedback) {
    warnings.push({ field: "self_review_deadline", message: "Self review typically completes before feedback deadline" });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get field-specific error if it exists
 */
export function getFieldError(validation: ValidationResult, field: string): string | undefined {
  return validation.errors.find((e) => e.field === field)?.message;
}

/**
 * Check if a specific field has a validation error
 */
export function hasFieldError(validation: ValidationResult, field: string): boolean {
  return validation.errors.some((e) => e.field === field);
}

// Category-to-Manual Mapping for Knowledge Base Publishing
// This maps Administrator Manuals to their target KB categories

export const MANUAL_TO_CATEGORY_MAP: Record<string, string> = {
  // Current manuals → KB categories
  'admin-security': 'admin-security',
  'hr-hub': 'hr-hub',
  'workforce': 'workforce',
  'time-attendance': 'time-attendance',
  'benefits': 'benefits',
  'appraisals': 'performance-management',
  'goals': 'performance-management',
  'feedback-360': 'feedback-360',
  'succession': 'succession-planning',
  'career-development': 'career-development',
  
  // Future manuals → KB categories (placeholders)
  'ess': 'ess',
  'mss': 'mss',
  'payroll': 'payroll-compensation',
  'compensation': 'payroll-compensation',
  'leave': 'leave-management',
  'recruitment': 'recruitment',
  'training': 'training-learning',
  'learning': 'training-learning',
  'hse': 'health-safety',
  'employee-relations': 'employee-relations',
  'company-property': 'company-property',
};

// Reverse mapping: KB category → manuals that publish to it
export const CATEGORY_MANUAL_REVERSE_MAP: Record<string, string[]> = {
  'admin-security': ['admin-security'],
  'hr-hub': ['hr-hub'],
  'workforce': ['workforce'],
  'time-attendance': ['time-attendance'],
  'benefits': ['benefits'],
  'performance-management': ['appraisals', 'goals'],
  'feedback-360': ['feedback-360'],
  'succession-planning': ['succession'],
  'career-development': ['career-development'],
  'ess': ['ess'],
  'mss': ['mss'],
  'payroll-compensation': ['payroll', 'compensation'],
  'leave-management': ['leave'],
  'recruitment': ['recruitment'],
  'training-learning': ['training', 'learning'],
  'health-safety': ['hse'],
  'employee-relations': ['employee-relations'],
  'company-property': ['company-property'],
};

// Get the target KB category slug for a manual
export function getCategoryForManual(manualId: string): string | null {
  return MANUAL_TO_CATEGORY_MAP[manualId] || null;
}

// Get all manuals that publish to a category
export function getManualsForCategory(categorySlug: string): string[] {
  return CATEGORY_MANUAL_REVERSE_MAP[categorySlug] || [];
}

// Check if a manual has a valid category mapping
export function hasValidCategoryMapping(manualId: string): boolean {
  return manualId in MANUAL_TO_CATEGORY_MAP;
}

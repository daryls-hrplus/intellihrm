/**
 * Centralized placeholder substitution for email template previews.
 * Handles both {{token}} and {token} formats for compatibility.
 */

export interface PreviewReplacementOptions {
  companyName?: string;
  employeeName?: string;
  managerName?: string;
  cycleName?: string;
  eventDate?: string;
  eventTitle?: string;
  daysUntil?: string;
}

const DEFAULT_REPLACEMENTS: Record<string, string> = {
  employee_first_name: 'John',
  employee_full_name: 'John Doe',
  employee_name: 'John Doe',
  recipient_name: 'John Doe',
  manager_name: 'Jane Smith',
  supervisor_name: 'Jane Smith',
  company_name: 'Your Company',
  event_date: 'January 15, 2025',
  event_title: 'Work Permit Renewal',
  days_until: '14',
  cycle_name: '2024 Annual Review',
  item_name: 'Work Permit',
  response_deadline: 'January 15, 2025',
  review_date: 'January 1, 2025',
  review_period: 'Q4 2024',
  department_name: 'Human Resources',
  action_url: '#',
  portal_url: '#',
  login_url: '#',
};

/**
 * Replaces template placeholders with sample values for preview.
 * Supports both {{placeholder}} and {placeholder} formats.
 */
export function substitutePreviewPlaceholders(
  text: string,
  options: PreviewReplacementOptions = {}
): string {
  if (!text) return '';
  
  const replacements: Record<string, string> = {
    ...DEFAULT_REPLACEMENTS,
    company_name: options.companyName || DEFAULT_REPLACEMENTS.company_name,
    employee_name: options.employeeName || DEFAULT_REPLACEMENTS.employee_name,
    employee_full_name: options.employeeName || DEFAULT_REPLACEMENTS.employee_full_name,
    recipient_name: options.employeeName || DEFAULT_REPLACEMENTS.recipient_name,
    manager_name: options.managerName || DEFAULT_REPLACEMENTS.manager_name,
    supervisor_name: options.managerName || DEFAULT_REPLACEMENTS.supervisor_name,
    cycle_name: options.cycleName || DEFAULT_REPLACEMENTS.cycle_name,
    event_date: options.eventDate || DEFAULT_REPLACEMENTS.event_date,
    event_title: options.eventTitle || DEFAULT_REPLACEMENTS.event_title,
    days_until: options.daysUntil || DEFAULT_REPLACEMENTS.days_until,
  };
  
  let result = text;
  
  // Replace both {{token}} and {token} formats (case-insensitive)
  Object.entries(replacements).forEach(([key, value]) => {
    // Double curly braces format: {{key}}
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'gi'), value);
    // Single curly braces format: {key}
    result = result.replace(new RegExp(`\\{${key}\\}`, 'gi'), value);
  });
  
  return result;
}

/**
 * Detects if the template body contains HTML tags.
 */
export function isHtmlContent(text: string): boolean {
  if (!text) return false;
  // Check for common HTML tags
  const htmlTagPattern = /<\/?(?:p|div|span|br|ul|ol|li|a|strong|em|b|i|h[1-6]|table|tr|td|th|thead|tbody|img|button|style|head|body|html)[^>]*>/i;
  return htmlTagPattern.test(text);
}

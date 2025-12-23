// Shared template placeholder definitions for reminder message templates

export interface TemplatePlaceholder {
  key: string;
  label: string;
  description?: string;
}

export const TEMPLATE_PLACEHOLDERS: TemplatePlaceholder[] = [
  // Employee details
  { key: '{employee_name}', label: 'Full Name', description: 'Employee full name' },
  { key: '{employee_first_name}', label: 'First Name', description: 'Employee first name' },
  { key: '{employee_last_name}', label: 'Last Name', description: 'Employee last name' },
  
  // Event details
  { key: '{item_name}', label: 'Item Name', description: 'Certificate/license/document name' },
  { key: '{event_date}', label: 'Event Date', description: 'Formatted event date' },
  { key: '{days_until}', label: 'Days Until', description: 'Days until the event' },
  { key: '{event_type}', label: 'Event Type', description: 'Type of reminder event' },
  
  // Organization details
  { key: '{manager_name}', label: 'Manager', description: 'Direct manager name' },
  { key: '{department}', label: 'Department', description: 'Employee department' },
  { key: '{position}', label: 'Position', description: 'Employee job position' },
  { key: '{company_name}', label: 'Company', description: 'Company name' },
];

// Helper to parse first/last name from full name
export function parseNameParts(fullName: string | null | undefined): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: 'Employee', lastName: '' };
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

import type { SubTaskDefinition } from "@/hooks/useSubTaskProgress";

// Sub-task definitions by phase and step order
export const subTaskDefinitions: Record<string, Record<number, SubTaskDefinition[]>> = {
  phase1: {
    // 1A: Security Foundation
    1: [ // SSO Settings
      { order: 1, name: "Select identity provider (SAML/OAuth)", isRequired: true },
      { order: 2, name: "Configure SSO endpoint URLs", isRequired: true },
      { order: 3, name: "Upload IdP certificate", isRequired: true },
      { order: 4, name: "Map user attributes (email, name, department)", isRequired: true },
      { order: 5, name: "Test SSO login flow", isRequired: true },
      { order: 6, name: "Configure fallback local authentication", isRequired: false },
    ],
    2: [ // MFA Settings
      { order: 1, name: "Enable MFA globally or by role", isRequired: true },
      { order: 2, name: "Select MFA methods (TOTP, SMS, Email)", isRequired: true },
      { order: 3, name: "Configure grace period for enrollment", isRequired: false },
      { order: 4, name: "Set up backup/recovery codes policy", isRequired: true },
      { order: 5, name: "Test MFA enrollment flow", isRequired: true },
    ],
    3: [ // Session Management
      { order: 1, name: "Set session timeout duration", isRequired: true },
      { order: 2, name: "Configure concurrent session limits", isRequired: false },
      { order: 3, name: "Enable session activity logging", isRequired: true },
      { order: 4, name: "Configure forced logout triggers", isRequired: false },
    ],
    4: [ // Password Policies
      { order: 1, name: "Set minimum password length (12+ recommended)", isRequired: true },
      { order: 2, name: "Configure complexity requirements", isRequired: true },
      { order: 3, name: "Set password expiry period", isRequired: false },
      { order: 4, name: "Configure lockout threshold and duration", isRequired: true },
      { order: 5, name: "Set password history rules", isRequired: false },
    ],
    5: [ // Audit Logging
      { order: 1, name: "Enable audit trail for security events", isRequired: true },
      { order: 2, name: "Configure log retention period", isRequired: true },
      { order: 3, name: "Set up alert thresholds", isRequired: false },
      { order: 4, name: "Configure export/archival settings", isRequired: false },
    ],

    // 1B: Legal & Compliance Foundation
    6: [ // Data Protection
      { order: 1, name: "Configure data residency settings", isRequired: true },
      { order: 2, name: "Set up PII field classifications", isRequired: true },
      { order: 3, name: "Configure data retention policies", isRequired: true },
      { order: 4, name: "Enable consent management", isRequired: false },
    ],

    // 1C: Organization Structure
    7: [ // Territories
      { order: 1, name: "Create territory hierarchy", isRequired: true },
      { order: 2, name: "Assign countries to territories", isRequired: true },
      { order: 3, name: "Configure territory-specific settings", isRequired: false },
    ],
    8: [ // Company Groups
      { order: 1, name: "Define company group structure", isRequired: true },
      { order: 2, name: "Configure shared settings inheritance", isRequired: false },
    ],
    9: [ // Companies
      { order: 1, name: "Add company legal name and registration", isRequired: true },
      { order: 2, name: "Upload company logo", isRequired: false },
      { order: 3, name: "Configure company address", isRequired: true },
      { order: 4, name: "Assign to territory and company group", isRequired: true },
      { order: 5, name: "Set default currency and language", isRequired: true },
    ],
    10: [ // Divisions
      { order: 1, name: "Create division structure", isRequired: false },
      { order: 2, name: "Assign divisions to companies", isRequired: false },
    ],
    11: [ // Departments
      { order: 1, name: "Create department hierarchy", isRequired: true },
      { order: 2, name: "Assign cost centers to departments", isRequired: false },
      { order: 3, name: "Link departments to divisions", isRequired: false },
    ],
    12: [ // Sections
      { order: 1, name: "Create section structure", isRequired: false },
      { order: 2, name: "Assign sections to departments", isRequired: false },
    ],
    13: [ // Branch Locations
      { order: 1, name: "Add branch addresses", isRequired: false },
      { order: 2, name: "Configure timezone per branch", isRequired: false },
      { order: 3, name: "Link branches to companies", isRequired: false },
    ],

    // 1D: System Configuration
    14: [ // System Settings
      { order: 1, name: "Configure date and time formats", isRequired: true },
      { order: 2, name: "Set default language", isRequired: true },
      { order: 3, name: "Configure number formats", isRequired: true },
      { order: 4, name: "Set fiscal year start", isRequired: true },
      { order: 5, name: "Configure work week settings", isRequired: true },
    ],
    15: [ // Lookup Values
      { order: 1, name: "Review and customize employment types", isRequired: true },
      { order: 2, name: "Configure marital status options", isRequired: true },
      { order: 3, name: "Set up document types", isRequired: true },
      { order: 4, name: "Configure nationality/citizenship options", isRequired: true },
      { order: 5, name: "Review all lookup categories", isRequired: true },
    ],
    16: [ // Currencies
      { order: 1, name: "Add supported currencies", isRequired: false },
      { order: 2, name: "Set default currency", isRequired: false },
      { order: 3, name: "Configure exchange rate source", isRequired: false },
    ],
    17: [ // Custom Fields
      { order: 1, name: "Identify custom data requirements", isRequired: false },
      { order: 2, name: "Create employee custom fields", isRequired: false },
      { order: 3, name: "Configure field visibility by role", isRequired: false },
    ],
    18: [ // Notifications
      { order: 1, name: "Configure email notification templates", isRequired: true },
      { order: 2, name: "Set up system reminder rules", isRequired: true },
      { order: 3, name: "Configure escalation settings", isRequired: false },
    ],

    // 1E: Users & Roles
    19: [ // Permission Groups
      { order: 1, name: "Review default permission groups", isRequired: true },
      { order: 2, name: "Create custom permission groups", isRequired: false },
      { order: 3, name: "Configure module access by group", isRequired: true },
    ],
    20: [ // Granular Permissions
      { order: 1, name: "Review field-level permissions", isRequired: false },
      { order: 2, name: "Configure sensitive field access", isRequired: false },
    ],
    21: [ // Role Architecture
      { order: 1, name: "Design role hierarchy", isRequired: true },
      { order: 2, name: "Map roles to permission groups", isRequired: true },
    ],
    22: [ // Role Management
      { order: 1, name: "Create system roles", isRequired: true },
      { order: 2, name: "Assign permissions to roles", isRequired: true },
      { order: 3, name: "Test role access levels", isRequired: true },
    ],
    23: [ // Users
      { order: 1, name: "Create system administrator account", isRequired: true },
      { order: 2, name: "Create HR administrator accounts", isRequired: true },
      { order: 3, name: "Assign roles to administrators", isRequired: true },
      { order: 4, name: "Send welcome emails with credentials", isRequired: true },
      { order: 5, name: "Verify login for all admin users", isRequired: true },
    ],
  },
  
  // Add more phases as needed
  phase2: {},
  phase3: {},
  phase4: {},
  phase5: {},
};

export function getSubTasksForStep(phaseId: string, stepOrder: number): SubTaskDefinition[] {
  return subTaskDefinitions[phaseId]?.[stepOrder] || [];
}

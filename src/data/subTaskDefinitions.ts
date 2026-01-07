import type { SubTaskDefinition } from "@/hooks/useSubTaskProgress";

// Sub-task definitions by phase and step order
export const subTaskDefinitions: Record<string, Record<number, SubTaskDefinition[]>> = {
  foundation: {
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
    24: [ // Access Request Workflow
      { order: 1, name: "Configure access request form", isRequired: false },
      { order: 2, name: "Set up approval workflow", isRequired: false },
      { order: 3, name: "Define auto-approval rules", isRequired: false },
    ],
    25: [ // Data Access Controls
      { order: 1, name: "Configure PII access levels", isRequired: true },
      { order: 2, name: "Set up data masking rules", isRequired: true },
      { order: 3, name: "Configure audit trail for data access", isRequired: true },
    ],
  },
  
  // Phase 2: Workforce Setup
  workforce: {
    1: [ // Job Families
      { order: 1, name: "Define job family categories", isRequired: true },
      { order: 2, name: "Create job family hierarchy", isRequired: true },
      { order: 3, name: "Import existing job families (if any)", isRequired: false },
    ],
    2: [ // Jobs
      { order: 1, name: "Create job titles and descriptions", isRequired: true },
      { order: 2, name: "Link jobs to job families", isRequired: true },
      { order: 3, name: "Set job grades/levels", isRequired: true },
      { order: 4, name: "Import existing jobs (if any)", isRequired: false },
    ],
    3: [ // Responsibilities
      { order: 1, name: "Define standard job responsibilities", isRequired: false },
      { order: 2, name: "Link responsibilities to jobs", isRequired: false },
      { order: 3, name: "Import existing responsibilities", isRequired: false },
    ],
    4: [ // Competencies & Levels
      { order: 1, name: "Define competency categories", isRequired: false },
      { order: 2, name: "Create competency definitions", isRequired: false },
      { order: 3, name: "Set proficiency levels", isRequired: false },
      { order: 4, name: "Import existing competencies", isRequired: false },
    ],
    5: [ // Job Competencies
      { order: 1, name: "Map competencies to jobs", isRequired: false },
      { order: 2, name: "Set required proficiency levels", isRequired: false },
    ],
    6: [ // Job Goals
      { order: 1, name: "Define standard goals by job", isRequired: false },
      { order: 2, name: "Set goal templates", isRequired: false },
    ],
    7: [ // Positions
      { order: 1, name: "Create position codes", isRequired: true },
      { order: 2, name: "Link positions to jobs", isRequired: true },
      { order: 3, name: "Assign positions to departments", isRequired: true },
      { order: 4, name: "Set reporting relationships", isRequired: true },
      { order: 5, name: "Import existing positions", isRequired: false },
    ],
    8: [ // Employees
      { order: 1, name: "Define employee data collection fields", isRequired: true },
      { order: 2, name: "Create employee profiles", isRequired: true },
      { order: 3, name: "Upload employee photos", isRequired: false },
      { order: 4, name: "Set emergency contacts", isRequired: false },
      { order: 5, name: "Import employee data", isRequired: false },
    ],
    9: [ // Employee Assignments
      { order: 1, name: "Assign employees to positions", isRequired: true },
      { order: 2, name: "Set assignment dates", isRequired: true },
      { order: 3, name: "Configure reporting managers", isRequired: true },
      { order: 4, name: "Import assignments", isRequired: false },
    ],
    10: [ // Onboarding Templates
      { order: 1, name: "Create onboarding task templates", isRequired: false },
      { order: 2, name: "Set task owners and deadlines", isRequired: false },
      { order: 3, name: "Configure welcome materials", isRequired: false },
    ],
    11: [ // Offboarding Templates
      { order: 1, name: "Create offboarding task templates", isRequired: false },
      { order: 2, name: "Set exit interview requirements", isRequired: false },
      { order: 3, name: "Configure asset return checklist", isRequired: false },
    ],
  },

  // Phase 3: Compensation & Payroll
  compensation: {
    1: [ // Pay Elements
      { order: 1, name: "Define earnings types (basic, allowances)", isRequired: true },
      { order: 2, name: "Define deduction types", isRequired: true },
      { order: 3, name: "Configure calculation formulas", isRequired: true },
      { order: 4, name: "Import existing pay elements", isRequired: false },
    ],
    2: [ // Salary Grades
      { order: 1, name: "Create salary grade structure", isRequired: true },
      { order: 2, name: "Set min/mid/max ranges", isRequired: true },
      { order: 3, name: "Import existing grades", isRequired: false },
    ],
    3: [ // Position Compensation
      { order: 1, name: "Assign salary grades to positions", isRequired: true },
      { order: 2, name: "Configure position-based allowances", isRequired: false },
    ],
    4: [ // Pay Groups
      { order: 1, name: "Create pay groups by entity/country", isRequired: true },
      { order: 2, name: "Assign employees to pay groups", isRequired: true },
    ],
    5: [ // Pay Periods
      { order: 1, name: "Configure pay frequency", isRequired: true },
      { order: 2, name: "Set pay period dates", isRequired: true },
      { order: 3, name: "Configure cut-off dates", isRequired: true },
    ],
    6: [ // Semi-Monthly Rules
      { order: 1, name: "Configure first half dates", isRequired: false },
      { order: 2, name: "Configure second half dates", isRequired: false },
    ],
    7: [ // Tax Configuration
      { order: 1, name: "Set up country tax tables", isRequired: true },
      { order: 2, name: "Configure tax brackets", isRequired: true },
      { order: 3, name: "Set up statutory deductions (NIS, NHT, etc.)", isRequired: true },
      { order: 4, name: "Configure employer contributions", isRequired: true },
    ],
    8: [ // Statutory Tax Relief
      { order: 1, name: "Configure statutory allowances", isRequired: false },
      { order: 2, name: "Set annual limits", isRequired: false },
    ],
    9: [ // Tax Relief Schemes
      { order: 1, name: "Set up pension relief schemes", isRequired: false },
      { order: 2, name: "Configure education relief", isRequired: false },
      { order: 3, name: "Set up other approved schemes", isRequired: false },
    ],
    10: [ // Bank File Config
      { order: 1, name: "Configure bank file format", isRequired: true },
      { order: 2, name: "Set up company bank details", isRequired: true },
      { order: 3, name: "Test bank file generation", isRequired: true },
    ],
    11: [ // Bonus Plans
      { order: 1, name: "Create bonus plan types", isRequired: false },
      { order: 2, name: "Configure eligibility criteria", isRequired: false },
      { order: 3, name: "Set calculation methods", isRequired: false },
    ],
    12: [ // Tips & Tronc
      { order: 1, name: "Configure tip distribution rules", isRequired: false },
      { order: 2, name: "Set up tronc scheme", isRequired: false },
    ],
    13: [ // Retroactive Pay
      { order: 1, name: "Configure back pay calculation rules", isRequired: false },
      { order: 2, name: "Set effective date handling", isRequired: false },
    ],
  },

  // Phase 4: Time & Leave
  "time-leave": {
    1: [ // Attendance Policies
      { order: 1, name: "Define attendance rules", isRequired: true },
      { order: 2, name: "Configure late/early policies", isRequired: true },
      { order: 3, name: "Set overtime rules", isRequired: true },
    ],
    2: [ // Work Schedules
      { order: 1, name: "Create standard work schedules", isRequired: true },
      { order: 2, name: "Configure shift patterns", isRequired: true },
      { order: 3, name: "Assign schedules to employees", isRequired: true },
      { order: 4, name: "Import schedules", isRequired: false },
    ],
    3: [ // Geofencing Locations
      { order: 1, name: "Define work locations", isRequired: false },
      { order: 2, name: "Set geofence radius", isRequired: false },
      { order: 3, name: "Configure clock-in rules", isRequired: false },
    ],
    4: [ // Project/Client/Tasks
      { order: 1, name: "Create project categories", isRequired: false },
      { order: 2, name: "Set up client list", isRequired: false },
      { order: 3, name: "Define task types", isRequired: false },
    ],
    5: [ // Leave Types
      { order: 1, name: "Configure vacation leave", isRequired: true },
      { order: 2, name: "Configure sick leave", isRequired: true },
      { order: 3, name: "Set up maternity/paternity leave", isRequired: true },
      { order: 4, name: "Configure other leave types", isRequired: false },
      { order: 5, name: "Import leave types", isRequired: false },
    ],
    6: [ // Accrual Rules
      { order: 1, name: "Set accrual frequency", isRequired: true },
      { order: 2, name: "Configure accrual rates by tenure", isRequired: true },
      { order: 3, name: "Set maximum balances", isRequired: true },
    ],
    7: [ // Rollover Rules
      { order: 1, name: "Configure carry-over limits", isRequired: false },
      { order: 2, name: "Set expiry dates for carry-over", isRequired: false },
    ],
    8: [ // Holidays
      { order: 1, name: "Add public holidays", isRequired: true },
      { order: 2, name: "Configure regional holidays", isRequired: false },
      { order: 3, name: "Import holiday calendar", isRequired: false },
    ],
    9: [ // Comp Time Policies
      { order: 1, name: "Configure comp time earning rules", isRequired: false },
      { order: 2, name: "Set usage policies", isRequired: false },
    ],
  },

  // Phase 5: Benefits & Training
  "benefits-training": {
    1: [ // Benefit Categories
      { order: 1, name: "Define benefit categories", isRequired: false },
      { order: 2, name: "Set category descriptions", isRequired: false },
    ],
    2: [ // Benefit Providers
      { order: 1, name: "Add insurance providers", isRequired: false },
      { order: 2, name: "Configure provider contacts", isRequired: false },
    ],
    3: [ // Benefit Plans
      { order: 1, name: "Create health insurance plans", isRequired: false },
      { order: 2, name: "Configure life insurance", isRequired: false },
      { order: 3, name: "Set up pension plans", isRequired: false },
      { order: 4, name: "Define eligibility criteria", isRequired: false },
    ],
    4: [ // Enrollment Periods
      { order: 1, name: "Set open enrollment dates", isRequired: false },
      { order: 2, name: "Configure qualifying life events", isRequired: false },
    ],
    5: [ // Auto-Enrollment Rules
      { order: 1, name: "Configure auto-enrollment criteria", isRequired: false },
      { order: 2, name: "Set default plans", isRequired: false },
    ],
    6: [ // Training Categories
      { order: 1, name: "Define training categories", isRequired: false },
      { order: 2, name: "Set compliance categories", isRequired: false },
    ],
    7: [ // Training Programs
      { order: 1, name: "Create training programs", isRequired: false },
      { order: 2, name: "Set program objectives", isRequired: false },
      { order: 3, name: "Configure prerequisites", isRequired: false },
    ],
    8: [ // LMS Courses
      { order: 1, name: "Create course catalog", isRequired: false },
      { order: 2, name: "Configure course settings", isRequired: false },
      { order: 3, name: "Set completion criteria", isRequired: false },
    ],
    9: [ // Modules & Lessons
      { order: 1, name: "Create course modules", isRequired: false },
      { order: 2, name: "Upload lesson content", isRequired: false },
      { order: 3, name: "Configure lesson order", isRequired: false },
    ],
    10: [ // Quizzes
      { order: 1, name: "Create quiz questions", isRequired: false },
      { order: 2, name: "Set passing scores", isRequired: false },
      { order: 3, name: "Configure retake policies", isRequired: false },
    ],
  },

  // Phase 6: Performance Management
  performance: {
    1: [ // Goals (OKR/SMART)
      { order: 1, name: "Configure goal framework (OKR/SMART)", isRequired: false },
      { order: 2, name: "Create goal templates", isRequired: false },
      { order: 3, name: "Set goal alignment rules", isRequired: false },
    ],
    2: [ // 360 Feedback Cycles
      { order: 1, name: "Configure feedback dimensions", isRequired: false },
      { order: 2, name: "Set rater selection rules", isRequired: false },
      { order: 3, name: "Configure anonymity settings", isRequired: false },
    ],
    3: [ // Appraisal Cycles
      { order: 1, name: "Create appraisal templates", isRequired: false },
      { order: 2, name: "Configure rating scales", isRequired: false },
      { order: 3, name: "Set cycle timeline", isRequired: false },
      { order: 4, name: "Configure workflow stages", isRequired: false },
    ],
    4: [ // Performance Improvement Plans
      { order: 1, name: "Create PIP templates", isRequired: false },
      { order: 2, name: "Set improvement milestones", isRequired: false },
      { order: 3, name: "Configure review checkpoints", isRequired: false },
    ],
    5: [ // Recognition Programs
      { order: 1, name: "Create recognition categories", isRequired: false },
      { order: 2, name: "Set reward types", isRequired: false },
      { order: 3, name: "Configure approval workflow", isRequired: false },
    ],
    6: [ // Nine Box Grid Config
      { order: 1, name: "Configure performance axis", isRequired: false },
      { order: 2, name: "Configure potential axis", isRequired: false },
      { order: 3, name: "Set box definitions", isRequired: false },
    ],
    7: [ // Talent Pools
      { order: 1, name: "Define talent pool categories", isRequired: false },
      { order: 2, name: "Set nomination criteria", isRequired: false },
    ],
    8: [ // Key Positions
      { order: 1, name: "Identify key/critical positions", isRequired: false },
      { order: 2, name: "Set risk assessment criteria", isRequired: false },
    ],
    9: [ // Succession Plans
      { order: 1, name: "Configure succession readiness levels", isRequired: false },
      { order: 2, name: "Set development requirements", isRequired: false },
      { order: 3, name: "Create succession templates", isRequired: false },
    ],
    10: [ // Career Paths
      { order: 1, name: "Define career tracks", isRequired: false },
      { order: 2, name: "Map progression requirements", isRequired: false },
      { order: 3, name: "Link to learning paths", isRequired: false },
    ],
    11: [ // Mentorship Programs
      { order: 1, name: "Create mentorship program types", isRequired: false },
      { order: 2, name: "Configure matching criteria", isRequired: false },
      { order: 3, name: "Set program duration", isRequired: false },
    ],
  },

  // Phase 7: Auxiliary Modules
  auxiliary: {
    1: [ // Recruitment
      { order: 1, name: "Configure job posting templates", isRequired: false },
      { order: 2, name: "Set up hiring workflow stages", isRequired: false },
      { order: 3, name: "Configure interview scorecards", isRequired: false },
      { order: 4, name: "Set up offer letter templates", isRequired: false },
    ],
    2: [ // Health & Safety
      { order: 1, name: "Configure incident types", isRequired: false },
      { order: 2, name: "Set up safety training requirements", isRequired: false },
      { order: 3, name: "Configure OSHA reporting", isRequired: false },
    ],
    3: [ // Employee Relations
      { order: 1, name: "Configure grievance categories", isRequired: false },
      { order: 2, name: "Set up disciplinary workflow", isRequired: false },
      { order: 3, name: "Configure case management", isRequired: false },
    ],
    4: [ // Company Property
      { order: 1, name: "Define asset categories", isRequired: false },
      { order: 2, name: "Configure assignment workflow", isRequired: false },
      { order: 3, name: "Set up return tracking", isRequired: false },
    ],
  },

  // Phase 8: HR Hub & Final
  "hr-hub": {
    1: [ // Dashboard Module Ordering
      { order: 1, name: "Configure dashboard layout", isRequired: false },
      { order: 2, name: "Set default widgets by role", isRequired: false },
    ],
    2: [ // Workflow Templates
      { order: 1, name: "Create approval workflow templates", isRequired: true },
      { order: 2, name: "Configure workflow triggers", isRequired: true },
      { order: 3, name: "Set escalation rules", isRequired: false },
      { order: 4, name: "Test workflow execution", isRequired: true },
    ],
    3: [ // Letter Templates
      { order: 1, name: "Create employment letter templates", isRequired: false },
      { order: 2, name: "Configure variable placeholders", isRequired: false },
      { order: 3, name: "Set up approval for letters", isRequired: false },
    ],
    4: [ // Report Templates
      { order: 1, name: "Create standard HR reports", isRequired: false },
      { order: 2, name: "Configure report schedules", isRequired: false },
      { order: 3, name: "Set up report distribution", isRequired: false },
    ],
    5: [ // Analytics Dashboards
      { order: 1, name: "Configure HR analytics KPIs", isRequired: false },
      { order: 2, name: "Create executive dashboards", isRequired: false },
      { order: 3, name: "Set up data refresh schedules", isRequired: false },
    ],
  },
};

export function getSubTasksForStep(phaseId: string, stepOrder: number): SubTaskDefinition[] {
  return subTaskDefinitions[phaseId]?.[stepOrder] || [];
}

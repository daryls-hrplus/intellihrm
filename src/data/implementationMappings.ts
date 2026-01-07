// Mappings for implementation steps to admin routes and import types

export interface StepMapping {
  order: number;
  area: string;
  adminRoute?: string;
  importType?: string;
  isRequired?: boolean;
  estimatedMinutes?: number;
  subSection?: string;
}

// Maps phase ID to step mappings with admin routes and import types
export const PHASE_STEP_MAPPINGS: Record<string, StepMapping[]> = {
  foundation: [
    // 1A: Prerequisites
    { order: 1, area: "Prerequisites Checklist", adminRoute: "/admin/implementation-handbook", isRequired: true, estimatedMinutes: 30, subSection: "1A: Prerequisites" },
    // 1B: Security Foundation (must configure BEFORE creating users)
    { order: 2, area: "Authentication Settings", adminRoute: "/admin/sso-settings", isRequired: true, estimatedMinutes: 25, subSection: "1B: Security Foundation" },
    { order: 3, area: "MFA Configuration", adminRoute: "/admin/mfa-settings", isRequired: true, estimatedMinutes: 20, subSection: "1B: Security Foundation" },
    { order: 4, area: "Password Policies", adminRoute: "/admin/password-policies", isRequired: true, estimatedMinutes: 15, subSection: "1B: Security Foundation" },
    { order: 5, area: "Session Management", adminRoute: "/admin/session-management", isRequired: true, estimatedMinutes: 15, subSection: "1B: Security Foundation" },
    { order: 6, area: "Audit Logging", adminRoute: "/admin/audit-logs", isRequired: true, estimatedMinutes: 20, subSection: "1B: Security Foundation" },
    // 1C: Organization Structure
    { order: 7, area: "Territories", adminRoute: "/admin/territories", isRequired: true, estimatedMinutes: 15, subSection: "1C: Organization Structure" },
    { order: 8, area: "Company Groups", adminRoute: "/admin/company-groups", isRequired: true, estimatedMinutes: 10, subSection: "1C: Organization Structure" },
    { order: 9, area: "Companies", adminRoute: "/admin/companies", importType: "companies", isRequired: true, estimatedMinutes: 20, subSection: "1C: Organization Structure" },
    { order: 10, area: "Divisions", adminRoute: "/workforce/org-chart", importType: "divisions", isRequired: false, estimatedMinutes: 15, subSection: "1C: Organization Structure" },
    { order: 11, area: "Departments", adminRoute: "/workforce/org-chart", importType: "departments", isRequired: true, estimatedMinutes: 20, subSection: "1C: Organization Structure" },
    { order: 12, area: "Sections", adminRoute: "/workforce/org-chart", importType: "sections", isRequired: false, estimatedMinutes: 15, subSection: "1C: Organization Structure" },
    { order: 13, area: "Branch Locations", adminRoute: "/admin/companies", importType: "branch_locations", isRequired: false, estimatedMinutes: 15, subSection: "1C: Organization Structure" },
    // 1D: System Configuration
    { order: 14, area: "System Settings", adminRoute: "/admin/settings", isRequired: true, estimatedMinutes: 20, subSection: "1D: System Configuration" },
    { order: 15, area: "Lookup Values", adminRoute: "/admin/lookup-values", isRequired: true, estimatedMinutes: 45, subSection: "1D: System Configuration" },
    { order: 16, area: "Currencies", adminRoute: "/admin/currencies", isRequired: false, estimatedMinutes: 10, subSection: "1D: System Configuration" },
    { order: 17, area: "Custom Fields", adminRoute: "/admin/custom-fields", isRequired: false, estimatedMinutes: 25, subSection: "1D: System Configuration" },
    { order: 18, area: "Notifications", adminRoute: "/admin/reminders", isRequired: true, estimatedMinutes: 20, subSection: "1D: System Configuration" },
    // 1E: Users & Roles (configure permissions BEFORE creating users)
    { order: 19, area: "Permission Groups", adminRoute: "/admin/permissions", isRequired: true, estimatedMinutes: 25, subSection: "1E: Users & Roles" },
    { order: 20, area: "Granular Permissions", adminRoute: "/admin/granular-permissions", isRequired: false, estimatedMinutes: 30, subSection: "1E: Users & Roles" },
    { order: 21, area: "Role Architecture", adminRoute: "/admin/roles", isRequired: true, estimatedMinutes: 20, subSection: "1E: Users & Roles" },
    { order: 22, area: "Role Management", adminRoute: "/admin/roles", isRequired: true, estimatedMinutes: 30, subSection: "1E: Users & Roles" },
    { order: 23, area: "Users", adminRoute: "/admin/users", isRequired: true, estimatedMinutes: 20, subSection: "1E: Users & Roles" },
    { order: 24, area: "Access Request Workflow", adminRoute: "/admin/access-requests", isRequired: false, estimatedMinutes: 15, subSection: "1E: Users & Roles" },
    { order: 25, area: "Data Access Controls", adminRoute: "/admin/pii-access", isRequired: true, estimatedMinutes: 20, subSection: "1E: Users & Roles" },
  ],
  workforce: [
    { order: 1, area: "Job Families", adminRoute: "/admin/job-families", importType: "job_families", isRequired: true, estimatedMinutes: 15 },
    { order: 2, area: "Jobs", adminRoute: "/admin/jobs", importType: "jobs", isRequired: true, estimatedMinutes: 30 },
    { order: 3, area: "Responsibilities", adminRoute: "/admin/responsibilities", importType: "responsibilities", isRequired: false, estimatedMinutes: 20 },
    { order: 4, area: "Competencies & Levels", adminRoute: "/admin/competencies", importType: "competencies", isRequired: false, estimatedMinutes: 25 },
    { order: 5, area: "Job Competencies", adminRoute: "/admin/job-competencies", isRequired: false, estimatedMinutes: 20 },
    { order: 6, area: "Job Goals", adminRoute: "/admin/job-goals", isRequired: false, estimatedMinutes: 15 },
    { order: 7, area: "Positions", adminRoute: "/admin/positions", importType: "positions", isRequired: true, estimatedMinutes: 30 },
    { order: 8, area: "Employees", adminRoute: "/admin/employees", importType: "employees", isRequired: true, estimatedMinutes: 45 },
    { order: 9, area: "Employee Assignments", adminRoute: "/admin/employee-assignments", importType: "employee_assignments", isRequired: true, estimatedMinutes: 30 },
    { order: 10, area: "Onboarding Templates", adminRoute: "/admin/onboarding-templates", isRequired: false, estimatedMinutes: 30 },
    { order: 11, area: "Offboarding Templates", adminRoute: "/admin/offboarding-templates", isRequired: false, estimatedMinutes: 30 },
  ],
  compensation: [
    { order: 1, area: "Pay Elements", adminRoute: "/admin/pay-elements", importType: "pay_elements", isRequired: true, estimatedMinutes: 30 },
    { order: 2, area: "Salary Grades", adminRoute: "/admin/salary-grades", importType: "salary_grades", isRequired: true, estimatedMinutes: 20 },
    { order: 3, area: "Position Compensation", adminRoute: "/admin/position-compensation", isRequired: true, estimatedMinutes: 25 },
    { order: 4, area: "Pay Groups", adminRoute: "/admin/pay-groups", importType: "pay_groups", isRequired: true, estimatedMinutes: 15 },
    { order: 5, area: "Pay Periods", adminRoute: "/admin/pay-periods", isRequired: true, estimatedMinutes: 20 },
    { order: 6, area: "Semi-Monthly Rules", adminRoute: "/admin/semi-monthly-rules", isRequired: false, estimatedMinutes: 15 },
    { order: 7, area: "Tax Configuration", adminRoute: "/admin/tax-configuration", isRequired: true, estimatedMinutes: 45 },
    { order: 8, area: "Statutory Tax Relief", adminRoute: "/admin/statutory-tax-relief", isRequired: false, estimatedMinutes: 20 },
    { order: 9, area: "Tax Relief Schemes", adminRoute: "/admin/tax-relief-schemes", isRequired: false, estimatedMinutes: 25 },
    { order: 10, area: "Bank File Config", adminRoute: "/admin/bank-file-config", isRequired: true, estimatedMinutes: 30 },
    { order: 11, area: "Bonus Plans", adminRoute: "/admin/bonus-plans", isRequired: false, estimatedMinutes: 20 },
    { order: 12, area: "Tips & Tronc", adminRoute: "/admin/tips-tronc", isRequired: false, estimatedMinutes: 25 },
    { order: 13, area: "Retroactive Pay (Back Pay)", adminRoute: "/admin/retroactive-pay", isRequired: false, estimatedMinutes: 20 },
  ],
  "time-leave": [
    { order: 1, area: "Attendance Policies", adminRoute: "/admin/attendance-policies", isRequired: true, estimatedMinutes: 25 },
    { order: 2, area: "Work Schedules", adminRoute: "/admin/work-schedules", importType: "work_schedules", isRequired: true, estimatedMinutes: 30 },
    { order: 3, area: "Geofencing Locations", adminRoute: "/admin/geofencing", isRequired: false, estimatedMinutes: 20 },
    { order: 4, area: "Project/Client/Tasks", adminRoute: "/admin/projects", isRequired: false, estimatedMinutes: 25 },
    { order: 5, area: "Leave Types", adminRoute: "/admin/leave-types", importType: "leave_types", isRequired: true, estimatedMinutes: 20 },
    { order: 6, area: "Accrual Rules", adminRoute: "/admin/accrual-rules", isRequired: true, estimatedMinutes: 30 },
    { order: 7, area: "Rollover Rules", adminRoute: "/admin/rollover-rules", isRequired: false, estimatedMinutes: 15 },
    { order: 8, area: "Holidays", adminRoute: "/admin/holidays", importType: "holidays", isRequired: true, estimatedMinutes: 15 },
    { order: 9, area: "Comp Time Policies", adminRoute: "/admin/comp-time", isRequired: false, estimatedMinutes: 15 },
  ],
  "benefits-training": [
    { order: 1, area: "Benefit Categories", adminRoute: "/admin/benefit-categories", isRequired: false, estimatedMinutes: 15 },
    { order: 2, area: "Benefit Providers", adminRoute: "/admin/benefit-providers", isRequired: false, estimatedMinutes: 20 },
    { order: 3, area: "Benefit Plans", adminRoute: "/admin/benefit-plans", isRequired: false, estimatedMinutes: 30 },
    { order: 4, area: "Enrollment Periods", adminRoute: "/admin/enrollment-periods", isRequired: false, estimatedMinutes: 15 },
    { order: 5, area: "Auto-Enrollment Rules", adminRoute: "/admin/auto-enrollment", isRequired: false, estimatedMinutes: 20 },
    { order: 6, area: "Training Categories", adminRoute: "/admin/training-categories", isRequired: false, estimatedMinutes: 10 },
    { order: 7, area: "Training Programs", adminRoute: "/admin/training-programs", isRequired: false, estimatedMinutes: 25 },
    { order: 8, area: "LMS Courses", adminRoute: "/lms/courses", isRequired: false, estimatedMinutes: 45 },
    { order: 9, area: "Modules & Lessons", adminRoute: "/lms/modules", isRequired: false, estimatedMinutes: 60 },
    { order: 10, area: "Quizzes", adminRoute: "/lms/quizzes", isRequired: false, estimatedMinutes: 30 },
  ],
  performance: [
    { order: 1, area: "Goals (OKR/SMART)", adminRoute: "/admin/goal-templates", isRequired: false, estimatedMinutes: 25 },
    { order: 2, area: "360 Feedback Cycles", adminRoute: "/admin/feedback-cycles", isRequired: false, estimatedMinutes: 30 },
    { order: 3, area: "Appraisal Cycles", adminRoute: "/admin/appraisal-cycles", isRequired: false, estimatedMinutes: 35 },
    { order: 4, area: "Performance Improvement Plans", adminRoute: "/admin/pip-templates", isRequired: false, estimatedMinutes: 20 },
    { order: 5, area: "Recognition Programs", adminRoute: "/admin/recognition-programs", isRequired: false, estimatedMinutes: 20 },
    { order: 6, area: "Nine Box Grid Config", adminRoute: "/admin/nine-box-config", isRequired: false, estimatedMinutes: 15 },
    { order: 7, area: "Talent Pools", adminRoute: "/admin/talent-pools", isRequired: false, estimatedMinutes: 20 },
    { order: 8, area: "Key Positions", adminRoute: "/admin/key-positions", isRequired: false, estimatedMinutes: 15 },
    { order: 9, area: "Succession Plans", adminRoute: "/admin/succession-plans", isRequired: false, estimatedMinutes: 30 },
    { order: 10, area: "Career Paths", adminRoute: "/admin/career-paths", isRequired: false, estimatedMinutes: 25 },
    { order: 11, area: "Mentorship Programs", adminRoute: "/admin/mentorship", isRequired: false, estimatedMinutes: 20 },
  ],
  auxiliary: [
    { order: 1, area: "Recruitment", adminRoute: "/recruitment", isRequired: false, estimatedMinutes: 45 },
    { order: 2, area: "Health & Safety", adminRoute: "/health-safety", isRequired: false, estimatedMinutes: 40 },
    { order: 3, area: "Employee Relations", adminRoute: "/employee-relations", isRequired: false, estimatedMinutes: 35 },
    { order: 4, area: "Company Property", adminRoute: "/admin/company-property", isRequired: false, estimatedMinutes: 25 },
  ],
  "hr-hub": [
    { order: 1, area: "Dashboard Module Ordering", adminRoute: "/admin/dashboard-config", isRequired: false, estimatedMinutes: 10 },
    { order: 2, area: "Workflow Templates", adminRoute: "/admin/workflow-templates", isRequired: true, estimatedMinutes: 45 },
    { order: 3, area: "Letter Templates", adminRoute: "/admin/letter-templates", isRequired: false, estimatedMinutes: 30 },
    { order: 4, area: "Policy Documents", adminRoute: "/admin/policies", isRequired: false, estimatedMinutes: 30 },
    { order: 5, area: "SOPs", adminRoute: "/admin/sops", isRequired: false, estimatedMinutes: 45 },
    { order: 6, area: "Knowledge Base", adminRoute: "/admin/knowledge-base", isRequired: false, estimatedMinutes: 30 },
    { order: 7, area: "Reminder Rules", adminRoute: "/admin/reminder-rules", isRequired: false, estimatedMinutes: 20 },
    { order: 8, area: "Scheduled Reports", adminRoute: "/admin/scheduled-reports", isRequired: false, estimatedMinutes: 25 },
    { order: 9, area: "AI Budget Tiers", adminRoute: "/admin/ai-budget-tiers", isRequired: false, estimatedMinutes: 15 },
    { order: 10, area: "AI User Settings", adminRoute: "/admin/ai-user-settings", isRequired: false, estimatedMinutes: 20 },
    { order: 11, area: "AI Guardrails", adminRoute: "/admin/ai-guardrails", isRequired: false, estimatedMinutes: 25 },
    { order: 12, area: "AI Voice Settings", adminRoute: "/admin/ai-voice-settings", isRequired: false, estimatedMinutes: 10 },
    { order: 13, area: "AI System Settings", adminRoute: "/admin/ai-system-settings", isRequired: false, estimatedMinutes: 15 },
    { order: 14, area: "AI Usage Monitoring", adminRoute: "/admin/ai-usage", isRequired: false, estimatedMinutes: 10 },
  ],
  billing: [
    { order: 1, area: "Subscription Tiers", adminRoute: "/admin/subscription-tiers", isRequired: false, estimatedMinutes: 20 },
    { order: 2, area: "Invoice Settings", adminRoute: "/admin/invoice-settings", isRequired: false, estimatedMinutes: 15 },
    { order: 3, area: "Payment Methods", adminRoute: "/admin/payment-methods", isRequired: false, estimatedMinutes: 15 },
    { order: 4, area: "Trial Management", adminRoute: "/admin/trial-management", isRequired: false, estimatedMinutes: 10 },
    { order: 5, area: "Grace Period Config", adminRoute: "/admin/grace-period", isRequired: false, estimatedMinutes: 10 },
    { order: 6, area: "Invoice Generation", adminRoute: "/admin/invoice-generation", isRequired: false, estimatedMinutes: 15 },
    { order: 7, area: "Payment Webhook", adminRoute: "/admin/payment-webhook", isRequired: false, estimatedMinutes: 20 },
    { order: 8, area: "Multi-Currency Billing", adminRoute: "/admin/multi-currency-billing", isRequired: false, estimatedMinutes: 20 },
    { order: 9, area: "Employee Overage Rules", adminRoute: "/admin/overage-rules", isRequired: false, estimatedMinutes: 15 },
    { order: 10, area: "Leave Buyout Config", adminRoute: "/admin/leave-buyout", isRequired: false, estimatedMinutes: 15 },
    { order: 11, area: "Leave Payment Rules", adminRoute: "/admin/leave-payment-rules", isRequired: false, estimatedMinutes: 15 },
  ],
  international: [
    { order: 1, area: "Country Configuration", adminRoute: "/admin/country-config", isRequired: true, estimatedMinutes: 30 },
    { order: 2, area: "Statutory Deductions", adminRoute: "/admin/statutory-deductions", isRequired: true, estimatedMinutes: 35 },
    { order: 3, area: "Tax Tables", adminRoute: "/admin/tax-tables", isRequired: true, estimatedMinutes: 40 },
    { order: 4, area: "Country Tax Settings", adminRoute: "/admin/country-tax-settings", isRequired: true, estimatedMinutes: 25 },
    { order: 5, area: "Bank Formats", adminRoute: "/admin/bank-formats", isRequired: true, estimatedMinutes: 30 },
    { order: 6, area: "Payslip Templates", adminRoute: "/admin/payslip-templates", isRequired: false, estimatedMinutes: 25 },
    { order: 7, area: "Statutory Reports", adminRoute: "/admin/statutory-reports", isRequired: false, estimatedMinutes: 30 },
    { order: 8, area: "Multi-Currency Processing", adminRoute: "/admin/multi-currency", isRequired: false, estimatedMinutes: 25 },
    { order: 9, area: "Cross-Border Compliance", adminRoute: "/admin/cross-border", isRequired: false, estimatedMinutes: 35 },
    { order: 10, area: "Regional Holidays", adminRoute: "/admin/regional-holidays", isRequired: false, estimatedMinutes: 20 },
  ],
  "mexico-core": [
    { order: 1, area: "Company SAT Setup", adminRoute: "/admin/mexico/sat-setup", isRequired: true, estimatedMinutes: 45 },
    { order: 2, area: "Employee IMSS Data", adminRoute: "/admin/mexico/imss-data", isRequired: true, estimatedMinutes: 30 },
    { order: 3, area: "SDI Calculation", adminRoute: "/admin/mexico/sdi", isRequired: true, estimatedMinutes: 25 },
    { order: 4, area: "ISR Configuration", adminRoute: "/admin/mexico/isr", isRequired: true, estimatedMinutes: 35 },
    { order: 5, area: "IMSS Contributions", adminRoute: "/admin/mexico/imss-contributions", isRequired: true, estimatedMinutes: 30 },
    { order: 6, area: "ISN by State", adminRoute: "/admin/mexico/isn", isRequired: true, estimatedMinutes: 25 },
    { order: 7, area: "CFDI Timbrado", adminRoute: "/admin/mexico/cfdi", isRequired: true, estimatedMinutes: 40 },
    { order: 8, area: "INFONAVIT Credits", adminRoute: "/admin/mexico/infonavit", isRequired: false, estimatedMinutes: 25 },
    { order: 9, area: "FONACOT Loans", adminRoute: "/admin/mexico/fonacot", isRequired: false, estimatedMinutes: 20 },
    { order: 10, area: "Aguinaldo & Vacation", adminRoute: "/admin/mexico/aguinaldo", isRequired: true, estimatedMinutes: 25 },
    { order: 11, area: "PTU Configuration", adminRoute: "/admin/mexico/ptu", isRequired: false, estimatedMinutes: 30 },
    { order: 12, area: "Severance Calculator", adminRoute: "/admin/mexico/severance", isRequired: false, estimatedMinutes: 20 },
  ],
  "mexico-advanced": [
    { order: 1, area: "SAT XML Validation", adminRoute: "/admin/mexico/sat-validation", isRequired: false, estimatedMinutes: 25 },
    { order: 2, area: "IDSE Automation", adminRoute: "/admin/mexico/idse", isRequired: false, estimatedMinutes: 35 },
    { order: 3, area: "SUA Advanced", adminRoute: "/admin/mexico/sua", isRequired: false, estimatedMinutes: 40 },
    { order: 4, area: "E.Firma Management", adminRoute: "/admin/mexico/efirma", isRequired: false, estimatedMinutes: 20 },
    { order: 5, area: "STPS Compliance", adminRoute: "/admin/mexico/stps", isRequired: false, estimatedMinutes: 30 },
    { order: 6, area: "REPSE Registry", adminRoute: "/admin/mexico/repse", isRequired: false, estimatedMinutes: 25 },
    { order: 7, area: "Outsourcing Reform", adminRoute: "/admin/mexico/outsourcing", isRequired: false, estimatedMinutes: 30 },
    { order: 8, area: "SAT Audit Support", adminRoute: "/admin/mexico/sat-audit", isRequired: false, estimatedMinutes: 35 },
    { order: 9, area: "Union Management", adminRoute: "/admin/mexico/unions", isRequired: false, estimatedMinutes: 25 },
    { order: 10, area: "Employer Social Dashboard", adminRoute: "/admin/mexico/employer-dashboard", isRequired: false, estimatedMinutes: 15 },
    { order: 11, area: "Payroll Anomaly Detection", adminRoute: "/admin/mexico/anomaly-detection", isRequired: false, estimatedMinutes: 20 },
    { order: 12, area: "Compliance Calendar", adminRoute: "/admin/mexico/compliance-calendar", isRequired: false, estimatedMinutes: 15 },
    { order: 13, area: "Multi-Period Comparison", adminRoute: "/admin/mexico/period-comparison", isRequired: false, estimatedMinutes: 20 },
    { order: 14, area: "Payroll Simulations", adminRoute: "/admin/mexico/simulations", isRequired: false, estimatedMinutes: 25 },
  ],
  "mexico-enterprise": [
    { order: 1, area: "Employee Mobile ESS (Mexico)", adminRoute: "/admin/mexico/mobile-ess", isRequired: false, estimatedMinutes: 30 },
    { order: 2, area: "SIPARE Integration", adminRoute: "/admin/mexico/sipare", isRequired: false, estimatedMinutes: 35 },
    { order: 3, area: "Constancia Situación Fiscal", adminRoute: "/admin/mexico/csf", isRequired: false, estimatedMinutes: 25 },
    { order: 4, area: "ISR Annual Adjustment", adminRoute: "/admin/mexico/isr-annual", isRequired: false, estimatedMinutes: 30 },
    { order: 5, area: "SAT/IMSS API Integration", adminRoute: "/admin/mexico/api-integration", isRequired: false, estimatedMinutes: 45 },
    { order: 6, area: "Advanced PTU Distribution", adminRoute: "/admin/mexico/ptu-advanced", isRequired: false, estimatedMinutes: 25 },
    { order: 7, area: "Payroll Audit Dashboard", adminRoute: "/admin/mexico/audit-dashboard", isRequired: false, estimatedMinutes: 20 },
    { order: 8, area: "Complete Regulatory Calendar", adminRoute: "/admin/mexico/regulatory-calendar", isRequired: false, estimatedMinutes: 15 },
  ],
};

// Get mapping for a specific phase and step
export function getStepMapping(phaseId: string, stepOrder: number): StepMapping | undefined {
  const phaseMappings = PHASE_STEP_MAPPINGS[phaseId];
  if (!phaseMappings) return undefined;
  return phaseMappings.find(m => m.order === stepOrder);
}

// Check if a step has an import type
export function stepHasImport(phaseId: string, stepOrder: number): boolean {
  const mapping = getStepMapping(phaseId, stepOrder);
  return !!mapping?.importType;
}

// Get all import-eligible steps for a phase
export function getImportableSteps(phaseId: string): StepMapping[] {
  const phaseMappings = PHASE_STEP_MAPPINGS[phaseId];
  if (!phaseMappings) return [];
  return phaseMappings.filter(m => !!m.importType);
}

// Calculate estimated time for a phase
export function getPhaseEstimatedTime(phaseId: string): number {
  const phaseMappings = PHASE_STEP_MAPPINGS[phaseId];
  if (!phaseMappings) return 0;
  return phaseMappings.reduce((total, step) => total + (step.estimatedMinutes || 0), 0);
}

// Get required steps count for a phase
export function getRequiredStepsCount(phaseId: string): number {
  const phaseMappings = PHASE_STEP_MAPPINGS[phaseId];
  if (!phaseMappings) return 0;
  return phaseMappings.filter(m => m.isRequired).length;
}

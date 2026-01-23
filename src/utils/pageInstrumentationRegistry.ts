/**
 * Page Instrumentation Registry
 * 
 * Tracks which pages actually have usePageAudit() hooks implemented.
 * This is separate from the entity registry - it tracks ACTUAL implementation,
 * not aspirational/expected implementation.
 * 
 * Status:
 * - instrumented: Page has usePageAudit() hook implemented
 * - not_instrumented: Page exists but no hook yet
 */

export interface PageInstrumentationStatus {
  pagePath: string;
  pageName: string;
  module: string;
  entityType: string;
  isInstrumented: boolean;
}

/**
 * Registry of all pages and their instrumentation status.
 * Update this when adding usePageAudit hooks to pages.
 */
export const pageInstrumentationRegistry: PageInstrumentationStatus[] = [
  // ===========================
  // ADMIN MODULE - INSTRUMENTED
  // ===========================
  { pagePath: '/admin/access-requests', pageName: 'Access Requests', module: 'Admin', entityType: 'access_requests', isInstrumented: true },
  { pagePath: '/admin/ai-governance', pageName: 'AI Governance', module: 'Admin', entityType: 'ai_governance', isInstrumented: true },
  { pagePath: '/admin/ai-security', pageName: 'AI Security', module: 'Admin', entityType: 'ai_security', isInstrumented: true },
  { pagePath: '/admin/ai-usage', pageName: 'AI Usage', module: 'Admin', entityType: 'ai_usage', isInstrumented: true },
  { pagePath: '/admin/announcements', pageName: 'Announcements', module: 'Admin', entityType: 'announcements', isInstrumented: true },
  { pagePath: '/admin/approval-delegations', pageName: 'Approval Delegations', module: 'Admin', entityType: 'approval_delegations', isInstrumented: true },
  { pagePath: '/admin/bulk-import', pageName: 'Bulk Import', module: 'Admin', entityType: 'bulk_import', isInstrumented: true },
  { pagePath: '/admin/company-tags', pageName: 'Company Tags', module: 'Admin', entityType: 'company_tags', isInstrumented: true },
  { pagePath: '/admin/custom-fields', pageName: 'Custom Fields', module: 'Admin', entityType: 'custom_fields', isInstrumented: true },
  { pagePath: '/admin/letter-templates', pageName: 'Letter Templates', module: 'Admin', entityType: 'letter_templates', isInstrumented: true },
  { pagePath: '/admin/mfa-settings', pageName: 'MFA Settings', module: 'Admin', entityType: 'mfa_settings', isInstrumented: true },
  { pagePath: '/admin/onboarding-templates', pageName: 'Onboarding Templates', module: 'Admin', entityType: 'onboarding_templates', isInstrumented: true },
  { pagePath: '/admin/password-policies', pageName: 'Password Policies', module: 'Admin', entityType: 'password_policies', isInstrumented: true },
  { pagePath: '/admin/permissions', pageName: 'Permissions', module: 'Admin', entityType: 'permissions', isInstrumented: true },
  { pagePath: '/admin/policy-documents', pageName: 'Policy Documents', module: 'Admin', entityType: 'policy_documents', isInstrumented: true },
  { pagePath: '/admin/sso-settings', pageName: 'SSO Settings', module: 'Admin', entityType: 'sso_settings', isInstrumented: true },
  { pagePath: '/admin/workflow-templates', pageName: 'Workflow Templates', module: 'Admin', entityType: 'workflow_templates', isInstrumented: true },
  { pagePath: '/admin/audit-coverage', pageName: 'Audit Coverage', module: 'Admin', entityType: 'audit_coverage', isInstrumented: true },

  // ===========================
  // COMPENSATION MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/compensation/salary-grades', pageName: 'Salary Grades', module: 'Compensation', entityType: 'salary_grades', isInstrumented: true },
  { pagePath: '/compensation/pay-elements', pageName: 'Pay Elements', module: 'Compensation', entityType: 'pay_elements', isInstrumented: false },
  { pagePath: '/compensation/pay-equity', pageName: 'Pay Equity', module: 'Compensation', entityType: 'pay_equity', isInstrumented: false },
  { pagePath: '/compensation/bonus-management', pageName: 'Bonus Management', module: 'Compensation', entityType: 'bonus_management', isInstrumented: false },
  { pagePath: '/compensation/equity-management', pageName: 'Equity Management', module: 'Compensation', entityType: 'equity_management', isInstrumented: false },
  { pagePath: '/compensation/merit-cycles', pageName: 'Merit Cycles', module: 'Compensation', entityType: 'merit_cycles', isInstrumented: false },
  { pagePath: '/compensation/market-benchmarking', pageName: 'Market Benchmarking', module: 'Compensation', entityType: 'market_benchmarking', isInstrumented: false },
  { pagePath: '/compensation/compensation-analytics', pageName: 'Compensation Analytics', module: 'Compensation', entityType: 'compensation_analytics', isInstrumented: false },
  { pagePath: '/compensation/compensation-budgets', pageName: 'Compensation Budgets', module: 'Compensation', entityType: 'compensation_budgets', isInstrumented: false },
  { pagePath: '/compensation/compensation-dashboard', pageName: 'Compensation Dashboard', module: 'Compensation', entityType: 'compensation_dashboard', isInstrumented: false },
  { pagePath: '/compensation/compensation-history', pageName: 'Compensation History', module: 'Compensation', entityType: 'compensation_history', isInstrumented: false },
  { pagePath: '/compensation/employee-compensation', pageName: 'Employee Compensation', module: 'Compensation', entityType: 'employee_compensation', isInstrumented: false },
  { pagePath: '/compensation/compa-ratio', pageName: 'Compa Ratio', module: 'Compensation', entityType: 'compa_ratio', isInstrumented: false },
  { pagePath: '/compensation/minimum-wage-compliance', pageName: 'Minimum Wage Compliance', module: 'Compensation', entityType: 'minimum_wage_compliance', isInstrumented: false },
  { pagePath: '/compensation/minimum-wage-config', pageName: 'Minimum Wage Config', module: 'Compensation', entityType: 'minimum_wage_config', isInstrumented: false },
  { pagePath: '/compensation/spinal-points', pageName: 'Spinal Points', module: 'Compensation', entityType: 'spinal_points', isInstrumented: false },
  { pagePath: '/compensation/total-rewards', pageName: 'Total Rewards', module: 'Compensation', entityType: 'total_rewards', isInstrumented: false },
  { pagePath: '/compensation/position-budget-approvals', pageName: 'Position Budget Approvals', module: 'Compensation', entityType: 'position_budget_approvals', isInstrumented: false },
  { pagePath: '/compensation/position-budget-cost-config', pageName: 'Position Budget Cost Config', module: 'Compensation', entityType: 'position_budget_cost_config', isInstrumented: false },
  { pagePath: '/compensation/position-budget-dashboard', pageName: 'Position Budget Dashboard', module: 'Compensation', entityType: 'position_budget_dashboard', isInstrumented: false },
  { pagePath: '/compensation/position-budget-plan', pageName: 'Position Budget Plan', module: 'Compensation', entityType: 'position_budget_plan', isInstrumented: false },
  { pagePath: '/compensation/position-budget-what-if', pageName: 'Position Budget What-If', module: 'Compensation', entityType: 'position_budget_what_if', isInstrumented: false },
  { pagePath: '/compensation/position-compensation', pageName: 'Position Compensation', module: 'Compensation', entityType: 'position_compensation', isInstrumented: false },

  // ===========================
  // BENEFITS MODULE - NOT INSTRUMENTED
  // ===========================
  { pagePath: '/benefits/claims', pageName: 'Benefit Claims', module: 'Benefits', entityType: 'benefit_claims', isInstrumented: true },
  { pagePath: '/benefits/auto-enrollment-rules', pageName: 'Auto Enrollment Rules', module: 'Benefits', entityType: 'auto_enrollment_rules', isInstrumented: false },
  { pagePath: '/benefits/analytics', pageName: 'Benefits Analytics', module: 'Benefits', entityType: 'benefit_analytics', isInstrumented: false },
  { pagePath: '/benefits/calculator', pageName: 'Benefits Calculator', module: 'Benefits', entityType: 'benefit_calculator', isInstrumented: false },
  { pagePath: '/benefits/categories', pageName: 'Benefit Categories', module: 'Benefits', entityType: 'benefit_categories', isInstrumented: false },
  { pagePath: '/benefits/compliance-reports', pageName: 'Compliance Reports', module: 'Benefits', entityType: 'benefit_compliance', isInstrumented: false },
  { pagePath: '/benefits/cost-projections', pageName: 'Cost Projections', module: 'Benefits', entityType: 'benefit_cost_projections', isInstrumented: false },
  { pagePath: '/benefits/enrollments', pageName: 'Benefit Enrollments', module: 'Benefits', entityType: 'benefit_enrollments', isInstrumented: false },
  { pagePath: '/benefits/plans', pageName: 'Benefit Plans', module: 'Benefits', entityType: 'benefit_plans', isInstrumented: false },
  { pagePath: '/benefits/providers', pageName: 'Benefit Providers', module: 'Benefits', entityType: 'benefit_providers', isInstrumented: false },
  { pagePath: '/benefits/dashboard', pageName: 'Benefits Dashboard', module: 'Benefits', entityType: 'benefits_dashboard', isInstrumented: false },
  { pagePath: '/benefits/eligibility-audit', pageName: 'Eligibility Audit', module: 'Benefits', entityType: 'eligibility_audit', isInstrumented: false },
  { pagePath: '/benefits/life-events', pageName: 'Life Events', module: 'Benefits', entityType: 'life_events', isInstrumented: false },
  { pagePath: '/benefits/open-enrollment', pageName: 'Open Enrollment', module: 'Benefits', entityType: 'open_enrollment', isInstrumented: false },
  { pagePath: '/benefits/plan-comparison', pageName: 'Plan Comparison', module: 'Benefits', entityType: 'plan_comparison', isInstrumented: false },
  { pagePath: '/benefits/waiting-period', pageName: 'Waiting Period', module: 'Benefits', entityType: 'waiting_period', isInstrumented: false },

  // ===========================
  // LEAVE MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/leave/accrual-rules', pageName: 'Leave Accrual Rules', module: 'Leave', entityType: 'leave_accrual_rules', isInstrumented: true },
  { pagePath: '/leave/apply', pageName: 'Apply Leave', module: 'Leave', entityType: 'apply_leave', isInstrumented: false },
  { pagePath: '/leave/approvals', pageName: 'Leave Approvals', module: 'Leave', entityType: 'leave_approvals', isInstrumented: false },
  { pagePath: '/leave/balance-adjustments', pageName: 'Balance Adjustments', module: 'Leave', entityType: 'leave_adjustments', isInstrumented: false },
  { pagePath: '/leave/balances', pageName: 'Leave Balances', module: 'Leave', entityType: 'leave_balances', isInstrumented: false },
  { pagePath: '/leave/blackout-periods', pageName: 'Blackout Periods', module: 'Leave', entityType: 'leave_blackout', isInstrumented: false },
  { pagePath: '/leave/calendar', pageName: 'Leave Calendar', module: 'Leave', entityType: 'leave_calendar', isInstrumented: false },
  { pagePath: '/leave/compliance', pageName: 'Leave Compliance', module: 'Leave', entityType: 'leave_compliance', isInstrumented: false },
  { pagePath: '/leave/conflict-rules', pageName: 'Conflict Rules', module: 'Leave', entityType: 'leave_conflict_rules', isInstrumented: false },
  { pagePath: '/leave/dashboard', pageName: 'Leave Dashboard', module: 'Leave', entityType: 'leave_dashboard', isInstrumented: false },
  { pagePath: '/leave/encashment', pageName: 'Leave Encashment', module: 'Leave', entityType: 'leave_encashment', isInstrumented: false },
  { pagePath: '/leave/holidays', pageName: 'Leave Holidays', module: 'Leave', entityType: 'leave_holidays', isInstrumented: false },
  { pagePath: '/leave/liability', pageName: 'Leave Liability', module: 'Leave', entityType: 'leave_liability', isInstrumented: false },
  { pagePath: '/leave/prorata-settings', pageName: 'Prorata Settings', module: 'Leave', entityType: 'leave_prorata', isInstrumented: false },
  { pagePath: '/leave/rollover-rules', pageName: 'Rollover Rules', module: 'Leave', entityType: 'leave_rollover', isInstrumented: false },
  { pagePath: '/leave/schedule-config', pageName: 'Schedule Config', module: 'Leave', entityType: 'leave_schedule', isInstrumented: false },
  { pagePath: '/leave/types', pageName: 'Leave Types', module: 'Leave', entityType: 'leave_types', isInstrumented: false },
  { pagePath: '/leave/years', pageName: 'Leave Years', module: 'Leave', entityType: 'leave_years', isInstrumented: false },
  { pagePath: '/leave/analytics', pageName: 'Leave Analytics', module: 'Leave', entityType: 'leave_analytics', isInstrumented: false },
  { pagePath: '/leave/comp-time-policies', pageName: 'Comp Time Policies', module: 'Leave', entityType: 'comp_time', isInstrumented: false },
  { pagePath: '/leave/compensatory-time', pageName: 'Compensatory Time', module: 'Leave', entityType: 'compensatory_time', isInstrumented: false },
  { pagePath: '/leave/maternity-leave', pageName: 'Maternity Leave', module: 'Leave', entityType: 'maternity_leave', isInstrumented: false },

  // ===========================
  // TRAINING MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/training/course-catalog', pageName: 'Course Catalog', module: 'Training', entityType: 'course_catalog', isInstrumented: true },
  { pagePath: '/training/certifications', pageName: 'Certifications', module: 'Training', entityType: 'certifications', isInstrumented: false },
  { pagePath: '/training/learning-paths', pageName: 'Learning Paths', module: 'Training', entityType: 'learning_paths', isInstrumented: false },
  { pagePath: '/training/instructors', pageName: 'Instructors', module: 'Training', entityType: 'instructors', isInstrumented: false },
  { pagePath: '/training/live-sessions', pageName: 'Live Sessions', module: 'Training', entityType: 'live_sessions', isInstrumented: false },
  { pagePath: '/training/analytics', pageName: 'Training Analytics', module: 'Training', entityType: 'training_analytics', isInstrumented: false },
  { pagePath: '/training/budgets', pageName: 'Training Budgets', module: 'Training', entityType: 'training_budgets', isInstrumented: false },
  { pagePath: '/training/calendar', pageName: 'Training Calendar', module: 'Training', entityType: 'training_calendar', isInstrumented: false },
  { pagePath: '/training/dashboard', pageName: 'Training Dashboard', module: 'Training', entityType: 'training_dashboard', isInstrumented: false },
  { pagePath: '/training/evaluations', pageName: 'Training Evaluations', module: 'Training', entityType: 'training_evaluations', isInstrumented: false },
  { pagePath: '/training/needs', pageName: 'Training Needs', module: 'Training', entityType: 'training_needs', isInstrumented: false },
  { pagePath: '/training/compliance', pageName: 'Compliance Training', module: 'Training', entityType: 'compliance_training', isInstrumented: false },
  { pagePath: '/training/competency-gap-analysis', pageName: 'Competency Gap Analysis', module: 'Training', entityType: 'competency_gap_analysis', isInstrumented: false },
  { pagePath: '/training/content-authoring', pageName: 'Content Authoring', module: 'Training', entityType: 'content_authoring', isInstrumented: false },
  { pagePath: '/training/external', pageName: 'External Training', module: 'Training', entityType: 'external_training', isInstrumented: false },
  { pagePath: '/training/interactive', pageName: 'Interactive Training', module: 'Training', entityType: 'interactive_training', isInstrumented: false },
  { pagePath: '/training/mentorship', pageName: 'Mentorship', module: 'Training', entityType: 'mentorship', isInstrumented: false },
  { pagePath: '/training/recertification', pageName: 'Recertification', module: 'Training', entityType: 'recertification', isInstrumented: false },
  { pagePath: '/training/virtual-classroom', pageName: 'Virtual Classroom', module: 'Training', entityType: 'virtual_classroom', isInstrumented: false },
  { pagePath: '/training/requests', pageName: 'Training Requests', module: 'Training', entityType: 'training_requests', isInstrumented: false },

  // ===========================
  // PERFORMANCE MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/performance/appraisals', pageName: 'Appraisals', module: 'Performance', entityType: 'appraisals', isInstrumented: true },
  { pagePath: '/performance/goals', pageName: 'Goals', module: 'Performance', entityType: 'goals', isInstrumented: false },
  { pagePath: '/performance/calibration', pageName: 'Calibration', module: 'Performance', entityType: 'calibration', isInstrumented: false },
  { pagePath: '/performance/continuous-feedback', pageName: 'Continuous Feedback', module: 'Performance', entityType: 'continuous_feedback', isInstrumented: false },
  { pagePath: '/performance/dashboard', pageName: 'Performance Dashboard', module: 'Performance', entityType: 'performance_dashboard', isInstrumented: false },
  { pagePath: '/performance/setup', pageName: 'Performance Setup', module: 'Performance', entityType: 'performance_setup', isInstrumented: false },
  { pagePath: '/performance/pip', pageName: 'PIP', module: 'Performance', entityType: 'pip', isInstrumented: false },
  { pagePath: '/performance/recognition', pageName: 'Recognition & Awards', module: 'Performance', entityType: 'recognition_awards', isInstrumented: false },
  { pagePath: '/performance/review-360', pageName: '360 Review', module: 'Performance', entityType: 'review_360', isInstrumented: false },
  { pagePath: '/performance/talent-dashboard', pageName: 'Talent Dashboard', module: 'Performance', entityType: 'talent_dashboard', isInstrumented: false },

  // ===========================
  // SUCCESSION MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/succession/plans', pageName: 'Succession Plans', module: 'Succession', entityType: 'succession_plans', isInstrumented: true },
  { pagePath: '/succession/dashboard', pageName: 'Succession Dashboard', module: 'Succession', entityType: 'succession_dashboard', isInstrumented: false },
  { pagePath: '/succession/analytics', pageName: 'Succession Analytics', module: 'Succession', entityType: 'succession_analytics', isInstrumented: false },
  { pagePath: '/succession/talent-pools', pageName: 'Talent Pools', module: 'Succession', entityType: 'talent_pools', isInstrumented: false },
  { pagePath: '/succession/key-positions', pageName: 'Key Positions', module: 'Succession', entityType: 'key_positions', isInstrumented: false },
  { pagePath: '/succession/bench-strength', pageName: 'Bench Strength', module: 'Succession', entityType: 'bench_strength', isInstrumented: false },
  { pagePath: '/succession/nine-box', pageName: 'Nine Box', module: 'Succession', entityType: 'nine_box', isInstrumented: false },
  { pagePath: '/succession/flight-risk', pageName: 'Flight Risk', module: 'Succession', entityType: 'flight_risk', isInstrumented: false },
  { pagePath: '/succession/career-development', pageName: 'Career Development', module: 'Succession', entityType: 'career_development', isInstrumented: false },

  // ===========================
  // HSE MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/hse/incidents', pageName: 'HSE Incidents', module: 'HSE', entityType: 'hse_incidents', isInstrumented: true },
  { pagePath: '/hse/inspections', pageName: 'HSE Inspections', module: 'HSE', entityType: 'hse_inspections', isInstrumented: false },
  { pagePath: '/hse/risk-assessment', pageName: 'Risk Assessment', module: 'HSE', entityType: 'hse_risk_assessment', isInstrumented: false },
  { pagePath: '/hse/training', pageName: 'HSE Training', module: 'HSE', entityType: 'hse_training', isInstrumented: false },
  { pagePath: '/hse/analytics', pageName: 'HSE Analytics', module: 'HSE', entityType: 'hse_analytics', isInstrumented: false },
  { pagePath: '/hse/dashboard', pageName: 'HSE Dashboard', module: 'HSE', entityType: 'hse_dashboard', isInstrumented: false },
  { pagePath: '/hse/chemicals', pageName: 'Chemical Management', module: 'HSE', entityType: 'hse_chemicals', isInstrumented: false },
  { pagePath: '/hse/compliance', pageName: 'HSE Compliance', module: 'HSE', entityType: 'hse_compliance', isInstrumented: false },
  { pagePath: '/hse/emergency-response', pageName: 'Emergency Response', module: 'HSE', entityType: 'hse_emergency_response', isInstrumented: false },
  { pagePath: '/hse/ergonomics', pageName: 'Ergonomics', module: 'HSE', entityType: 'hse_ergonomics', isInstrumented: false },
  { pagePath: '/hse/first-aid', pageName: 'First Aid', module: 'HSE', entityType: 'hse_first_aid', isInstrumented: false },
  { pagePath: '/hse/loto', pageName: 'LOTO', module: 'HSE', entityType: 'hse_loto', isInstrumented: false },
  { pagePath: '/hse/near-miss', pageName: 'Near Miss', module: 'HSE', entityType: 'hse_near_miss', isInstrumented: false },
  { pagePath: '/hse/osha', pageName: 'OSHA Reporting', module: 'HSE', entityType: 'hse_osha', isInstrumented: false },
  { pagePath: '/hse/ppe', pageName: 'PPE Management', module: 'HSE', entityType: 'hse_ppe', isInstrumented: false },
  { pagePath: '/hse/permit-to-work', pageName: 'Permit to Work', module: 'HSE', entityType: 'hse_permit_to_work', isInstrumented: false },
  { pagePath: '/hse/safety-observations', pageName: 'Safety Observations', module: 'HSE', entityType: 'hse_safety_observations', isInstrumented: false },
  { pagePath: '/hse/safety-policies', pageName: 'Safety Policies', module: 'HSE', entityType: 'hse_safety_policies', isInstrumented: false },
  { pagePath: '/hse/toolbox-talks', pageName: 'Toolbox Talks', module: 'HSE', entityType: 'hse_toolbox_talks', isInstrumented: false },
  { pagePath: '/hse/workers-comp', pageName: 'Workers Comp', module: 'HSE', entityType: 'hse_workers_comp', isInstrumented: false },

  // ===========================
  // EMPLOYEE RELATIONS MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/employee-relations/cases', pageName: 'ER Cases', module: 'Employee Relations', entityType: 'er_cases', isInstrumented: true },
  { pagePath: '/employee-relations/grievances', pageName: 'Grievances', module: 'Employee Relations', entityType: 'grievances', isInstrumented: false },
  { pagePath: '/employee-relations/disciplinary', pageName: 'Disciplinary', module: 'Employee Relations', entityType: 'disciplinary', isInstrumented: false },
  { pagePath: '/employee-relations/unions', pageName: 'Unions', module: 'Employee Relations', entityType: 'unions', isInstrumented: false },
  { pagePath: '/employee-relations/cba', pageName: 'CBA', module: 'Employee Relations', entityType: 'cba', isInstrumented: false },
  { pagePath: '/employee-relations/exit-interviews', pageName: 'Exit Interviews', module: 'Employee Relations', entityType: 'exit_interviews', isInstrumented: false },
  { pagePath: '/employee-relations/surveys', pageName: 'Surveys', module: 'Employee Relations', entityType: 'surveys', isInstrumented: false },
  { pagePath: '/employee-relations/wellness', pageName: 'Wellness', module: 'Employee Relations', entityType: 'wellness', isInstrumented: false },
  { pagePath: '/employee-relations/recognition', pageName: 'Recognition', module: 'Employee Relations', entityType: 'recognition', isInstrumented: false },
  { pagePath: '/employee-relations/court-judgements', pageName: 'Court Judgements', module: 'Employee Relations', entityType: 'court_judgements', isInstrumented: false },
  { pagePath: '/employee-relations/analytics', pageName: 'ER Analytics', module: 'Employee Relations', entityType: 'er_analytics', isInstrumented: false },
  { pagePath: '/employee-relations/dashboard', pageName: 'ER Dashboard', module: 'Employee Relations', entityType: 'er_dashboard', isInstrumented: false },

  // ===========================
  // WORKFORCE MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/workforce/employees', pageName: 'Employees', module: 'Workforce', entityType: 'employees', isInstrumented: true },
  { pagePath: '/workforce/jobs', pageName: 'Jobs', module: 'Workforce', entityType: 'jobs', isInstrumented: false },
  { pagePath: '/workforce/positions', pageName: 'Positions', module: 'Workforce', entityType: 'positions', isInstrumented: false },
  { pagePath: '/workforce/departments', pageName: 'Departments', module: 'Workforce', entityType: 'departments', isInstrumented: false },
  { pagePath: '/workforce/divisions', pageName: 'Divisions', module: 'Workforce', entityType: 'divisions', isInstrumented: false },
  { pagePath: '/workforce/competencies', pageName: 'Competencies', module: 'Workforce', entityType: 'competencies', isInstrumented: false },
  { pagePath: '/workforce/qualifications', pageName: 'Qualifications', module: 'Workforce', entityType: 'qualifications', isInstrumented: false },
  { pagePath: '/workforce/org-structure', pageName: 'Org Structure', module: 'Workforce', entityType: 'org_structure', isInstrumented: false },
  { pagePath: '/workforce/org-changes', pageName: 'Org Changes', module: 'Workforce', entityType: 'org_changes', isInstrumented: false },
  { pagePath: '/workforce/headcount', pageName: 'Headcount', module: 'Workforce', entityType: 'headcount', isInstrumented: false },
  { pagePath: '/workforce/headcount-requests', pageName: 'Headcount Requests', module: 'Workforce', entityType: 'headcount_requests', isInstrumented: false },
  { pagePath: '/workforce/forecasting', pageName: 'Workforce Forecasting', module: 'Workforce', entityType: 'workforce_forecasting', isInstrumented: false },
  { pagePath: '/workforce/offboarding', pageName: 'Offboarding', module: 'Workforce', entityType: 'offboarding', isInstrumented: false },
  { pagePath: '/workforce/analytics', pageName: 'Workforce Analytics', module: 'Workforce', entityType: 'workforce_analytics', isInstrumented: false },

  // ===========================
  // TIME & ATTENDANCE MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/time-attendance/analytics', pageName: 'Attendance Analytics', module: 'Time & Attendance', entityType: 'attendance_analytics', isInstrumented: true },
  { pagePath: '/time-attendance/records', pageName: 'Attendance Records', module: 'Time & Attendance', entityType: 'attendance_records', isInstrumented: false },
  { pagePath: '/time-attendance/exceptions', pageName: 'Attendance Exceptions', module: 'Time & Attendance', entityType: 'attendance_exceptions', isInstrumented: false },
  { pagePath: '/time-attendance/policies', pageName: 'Attendance Policies', module: 'Time & Attendance', entityType: 'attendance_policies', isInstrumented: false },
  { pagePath: '/time-attendance/shifts', pageName: 'Shift Management', module: 'Time & Attendance', entityType: 'shift_management', isInstrumented: false },
  { pagePath: '/time-attendance/shift-swaps', pageName: 'Shift Swaps', module: 'Time & Attendance', entityType: 'shift_swaps', isInstrumented: false },
  { pagePath: '/time-attendance/schedules', pageName: 'Schedules', module: 'Time & Attendance', entityType: 'schedules', isInstrumented: false },
  { pagePath: '/time-attendance/overtime', pageName: 'Overtime Management', module: 'Time & Attendance', entityType: 'overtime_management', isInstrumented: false },
  { pagePath: '/time-attendance/timesheets', pageName: 'Timesheets', module: 'Time & Attendance', entityType: 'timesheets', isInstrumented: false },
  { pagePath: '/time-attendance/timesheet-approvals', pageName: 'Timesheet Approvals', module: 'Time & Attendance', entityType: 'timesheet_approvals', isInstrumented: false },
  { pagePath: '/time-attendance/time-tracking', pageName: 'Time Tracking', module: 'Time & Attendance', entityType: 'time_tracking', isInstrumented: false },
  { pagePath: '/time-attendance/time-audit-trail', pageName: 'Time Audit Trail', module: 'Time & Attendance', entityType: 'time_audit_trail', isInstrumented: false },
  { pagePath: '/time-attendance/devices', pageName: 'Timeclock Devices', module: 'Time & Attendance', entityType: 'timeclock_devices', isInstrumented: false },
  { pagePath: '/time-attendance/geofence', pageName: 'Geofence', module: 'Time & Attendance', entityType: 'geofence', isInstrumented: false },
  { pagePath: '/time-attendance/flex-time', pageName: 'Flex Time', module: 'Time & Attendance', entityType: 'flex_time', isInstrumented: false },
  { pagePath: '/time-attendance/live', pageName: 'Live Attendance', module: 'Time & Attendance', entityType: 'live_attendance', isInstrumented: false },
  { pagePath: '/time-attendance/dashboard', pageName: 'T&A Dashboard', module: 'Time & Attendance', entityType: 'time_attendance_dashboard', isInstrumented: false },

  // ===========================
  // PROPERTY MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/property/assets', pageName: 'Property Assets', module: 'Property', entityType: 'property_assets', isInstrumented: true },
  { pagePath: '/property/assignments', pageName: 'Property Assignments', module: 'Property', entityType: 'property_assignments', isInstrumented: false },
  { pagePath: '/property/categories', pageName: 'Property Categories', module: 'Property', entityType: 'property_categories', isInstrumented: false },
  { pagePath: '/property/maintenance', pageName: 'Property Maintenance', module: 'Property', entityType: 'property_maintenance', isInstrumented: false },
  { pagePath: '/property/requests', pageName: 'Property Requests', module: 'Property', entityType: 'property_requests', isInstrumented: false },
  { pagePath: '/property/analytics', pageName: 'Property Analytics', module: 'Property', entityType: 'property_analytics', isInstrumented: false },
  { pagePath: '/property/dashboard', pageName: 'Property Dashboard', module: 'Property', entityType: 'property_dashboard', isInstrumented: false },

  // ===========================
  // ESS MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/ess', pageName: 'Employee Self Service', module: 'ESS', entityType: 'employee_self_service', isInstrumented: true },
  { pagePath: '/ess/profile', pageName: 'My Profile', module: 'ESS', entityType: 'my_profile', isInstrumented: false },
  { pagePath: '/ess/leave', pageName: 'My Leave', module: 'ESS', entityType: 'my_leave', isInstrumented: false },
  { pagePath: '/ess/time', pageName: 'My Time', module: 'ESS', entityType: 'my_time', isInstrumented: false },
  { pagePath: '/ess/benefits', pageName: 'My Benefits', module: 'ESS', entityType: 'my_benefits', isInstrumented: false },
  { pagePath: '/ess/training', pageName: 'My Training', module: 'ESS', entityType: 'my_training', isInstrumented: false },
  { pagePath: '/ess/goals', pageName: 'My Goals', module: 'ESS', entityType: 'my_goals', isInstrumented: false },
  { pagePath: '/ess/compensation', pageName: 'My Compensation', module: 'ESS', entityType: 'my_compensation', isInstrumented: false },
  { pagePath: '/ess/documents', pageName: 'My Documents', module: 'ESS', entityType: 'my_documents', isInstrumented: false },
  { pagePath: '/ess/banking', pageName: 'My Banking', module: 'ESS', entityType: 'my_banking', isInstrumented: false },
  { pagePath: '/ess/dependents', pageName: 'My Dependents', module: 'ESS', entityType: 'my_dependents', isInstrumented: false },

  // ===========================
  // MSS MODULE - PARTIALLY INSTRUMENTED
  // ===========================
  { pagePath: '/mss', pageName: 'Manager Self Service', module: 'MSS', entityType: 'manager_self_service', isInstrumented: true },
  { pagePath: '/mss/team', pageName: 'My Team', module: 'MSS', entityType: 'mss_team', isInstrumented: false },
  { pagePath: '/mss/analytics', pageName: 'MSS Analytics', module: 'MSS', entityType: 'mss_analytics', isInstrumented: false },
  { pagePath: '/mss/appraisals', pageName: 'MSS Appraisals', module: 'MSS', entityType: 'mss_appraisals', isInstrumented: false },
  { pagePath: '/mss/compensation', pageName: 'MSS Compensation', module: 'MSS', entityType: 'mss_compensation', isInstrumented: false },
  { pagePath: '/mss/leave', pageName: 'MSS Leave', module: 'MSS', entityType: 'mss_leave', isInstrumented: false },
  { pagePath: '/mss/time-attendance', pageName: 'MSS Time & Attendance', module: 'MSS', entityType: 'mss_time_attendance', isInstrumented: false },
  { pagePath: '/mss/training', pageName: 'MSS Training', module: 'MSS', entityType: 'mss_training', isInstrumented: false },
  { pagePath: '/mss/recruitment', pageName: 'MSS Recruitment', module: 'MSS', entityType: 'mss_recruitment', isInstrumented: false },
  { pagePath: '/mss/goals', pageName: 'MSS Goals', module: 'MSS', entityType: 'mss_goals', isInstrumented: false },
];

/**
 * Get instrumentation status summary by module
 */
export function getInstrumentationSummaryByModule(): Record<string, { total: number; instrumented: number; percentage: number }> {
  const summary: Record<string, { total: number; instrumented: number; percentage: number }> = {};
  
  for (const page of pageInstrumentationRegistry) {
    if (!summary[page.module]) {
      summary[page.module] = { total: 0, instrumented: 0, percentage: 0 };
    }
    summary[page.module].total++;
    if (page.isInstrumented) {
      summary[page.module].instrumented++;
    }
  }
  
  // Calculate percentages
  for (const module in summary) {
    summary[module].percentage = Math.round((summary[module].instrumented / summary[module].total) * 100);
  }
  
  return summary;
}

/**
 * Get all pages that are not instrumented yet
 */
export function getNotInstrumentedPages(): PageInstrumentationStatus[] {
  return pageInstrumentationRegistry.filter(p => !p.isInstrumented);
}

/**
 * Get all instrumented pages
 */
export function getInstrumentedPages(): PageInstrumentationStatus[] {
  return pageInstrumentationRegistry.filter(p => p.isInstrumented);
}

/**
 * Get total counts
 */
export function getInstrumentationCounts(): { total: number; instrumented: number; notInstrumented: number } {
  const instrumented = pageInstrumentationRegistry.filter(p => p.isInstrumented).length;
  return {
    total: pageInstrumentationRegistry.length,
    instrumented,
    notInstrumented: pageInstrumentationRegistry.length - instrumented,
  };
}

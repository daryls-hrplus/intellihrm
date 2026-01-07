/**
 * Audit Entity Registry - Single source of truth for all instrumented entity types
 * 
 * This registry contains ALL entity types that are actively instrumented via usePageAudit() hooks.
 * Industry standard: Coverage = implementation completeness, not database activity.
 * 
 * Auto-generated from codebase analysis of usePageAudit() calls.
 */

export interface AuditedEntity {
  module: string;
  pages: string[];
  description?: string;
}

/**
 * All entity types currently instrumented with usePageAudit() hooks.
 * This represents 100% implementation coverage when all entries are present.
 */
export const auditedEntityTypes: Record<string, AuditedEntity> = {
  // Admin Module (17 pages)
  'access_requests': { module: 'Admin', pages: ['AdminAccessRequestsPage'] },
  'ai_governance': { module: 'Admin', pages: ['AdminAIGovernancePage'] },
  'ai_security': { module: 'Admin', pages: ['AdminAISecurityPage'] },
  'ai_usage': { module: 'Admin', pages: ['AdminAIUsagePage'] },
  'announcements': { module: 'Admin', pages: ['CompanyAnnouncementsPage'] },
  'approval_delegations': { module: 'Admin', pages: ['ApprovalDelegationsPage'] },
  'bulk_import': { module: 'Admin', pages: ['BulkImportPage'] },
  'company_tags': { module: 'Admin', pages: ['CompanyTagsPage'] },
  'custom_fields': { module: 'Admin', pages: ['AdminCustomFieldsPage'] },
  'letter_templates': { module: 'Admin', pages: ['AdminLetterTemplatesPage'] },
  'mfa_settings': { module: 'Admin', pages: ['MFASettingsPage'] },
  'onboarding_templates': { module: 'Admin', pages: ['OnboardingTemplatesPage'] },
  'password_policies': { module: 'Admin', pages: ['PasswordPoliciesPage'] },
  'permissions': { module: 'Admin', pages: ['GranularPermissionsPage'] },
  'policy_documents': { module: 'Admin', pages: ['PolicyDocumentsPage'] },
  'sso_settings': { module: 'Admin', pages: ['SSOSettingsPage'] },
  'workflow_templates': { module: 'Admin', pages: ['AdminWorkflowTemplatesPage'] },

  // Payroll Module (30+ pages)
  'cost_center_segments': { module: 'Payroll', pages: ['CostCenterSegmentsPage'] },
  'cost_centers': { module: 'Payroll', pages: ['CostCentersPage'] },
  'country_payroll_year_setup': { module: 'Payroll', pages: ['CountryPayrollYearSetupPage'] },
  'expense_claims_payroll': { module: 'Payroll', pages: ['ExpenseClaimsPayrollPage'] },
  'gl_accounts': { module: 'Payroll', pages: ['GLAccountsPage'] },
  'gl_mapping': { module: 'Payroll', pages: ['GLMappingPage'] },
  'historical_payroll_import': { module: 'Payroll', pages: ['HistoricalPayrollImportPage'] },
  'leave_balance_buyout': { module: 'Payroll', pages: ['LeaveBalanceBuyoutPage'] },
  'leave_payment_config': { module: 'Payroll', pages: ['LeavePaymentConfigPage'] },
  'off_cycle_payroll': { module: 'Payroll', pages: ['OffCyclePayrollPage'] },
  'opening_balances': { module: 'Payroll', pages: ['OpeningBalancesPage'] },
  'overpayment_recovery': { module: 'Payroll', pages: ['OverpaymentRecoveryPage'] },
  'pay_period_payroll_entries': { module: 'Payroll', pages: ['PayPeriodPayrollEntriesPage'] },
  'payment_rules_config': { module: 'Payroll', pages: ['PaymentRulesConfigPage'] },
  'payroll_budgeting': { module: 'Payroll', pages: ['PayrollBudgetingPage'] },
  'payroll_holidays': { module: 'Payroll', pages: ['PayrollHolidaysPage'] },
  'payroll_reports': { module: 'Payroll', pages: ['PayrollReportsPage'] },
  'payroll_simulations': { module: 'Payroll', pages: ['PayrollSimulationsPage'] },
  'payroll_templates': { module: 'Payroll', pages: ['PayrollTemplatesPage'] },
  'retroactive_pay': { module: 'Payroll', pages: ['RetroactivePayPage'] },
  'savings_programs': { module: 'Payroll', pages: ['SavingsProgramsPage'] },
  'semi_monthly_payroll_rules': { module: 'Payroll', pages: ['SemiMonthlyPayrollRulesPage'] },
  'severance_calculator': { module: 'Payroll', pages: ['SeveranceCalculatorPage'] },
  'tax_config': { module: 'Payroll', pages: ['TaxConfigPage'] },
  'time_attendance_integration': { module: 'Payroll', pages: ['TimeAttendanceIntegrationPage'] },
  'tip_pool_management': { module: 'Payroll', pages: ['TipPoolManagementPage'] },
  'variable_compensation': { module: 'Payroll', pages: ['VariableCompensationPage'] },
  'year_end_payroll_closing': { module: 'Payroll', pages: ['YearEndPayrollClosingPage'] },
  'year_end_processing': { module: 'Payroll', pages: ['YearEndProcessingPage'] },

  // Recruitment Module
  'assessments': { module: 'Recruitment', pages: ['AssessmentsPage'] },
  'referrals': { module: 'Recruitment', pages: ['ReferralsPage'] },
  'email_templates': { module: 'Recruitment', pages: ['EmailTemplatesPage'] },
  'job_boards': { module: 'Recruitment', pages: ['JobBoardsPage'] },
  'scorecards': { module: 'Recruitment', pages: ['ScorecardsPage'] },
  'recruitment_analytics': { module: 'Recruitment', pages: ['RecruitmentAnalyticsPage'] },
  'interview_panels': { module: 'Recruitment', pages: ['InterviewPanelsPage'] },
  'sources': { module: 'Recruitment', pages: ['SourcesPage'] },

  // Benefits Module
  'benefit_claims': { module: 'Benefits', pages: ['BenefitClaimsPage'] },
  'benefit_categories': { module: 'Benefits', pages: ['BenefitCategoriesPage'] },
  'benefit_providers': { module: 'Benefits', pages: ['BenefitProvidersPage'] },
  'benefit_analytics': { module: 'Benefits', pages: ['BenefitAnalyticsPage'] },
  'auto_enrollment_rules': { module: 'Benefits', pages: ['AutoEnrollmentRulesPage'] },
  'eligibility_audit': { module: 'Benefits', pages: ['EligibilityAuditPage'] },
  'life_events': { module: 'Benefits', pages: ['LifeEventsPage'] },
  'open_enrollment': { module: 'Benefits', pages: ['OpenEnrollmentPage'] },
  'waiting_period': { module: 'Benefits', pages: ['WaitingPeriodPage'] },

  // Leave Module
  'leave_accrual_rules': { module: 'Leave', pages: ['LeaveAccrualRulesPage'] },
  'leave_analytics': { module: 'Leave', pages: ['LeaveAnalyticsPage'] },
  'leave_blackout': { module: 'Leave', pages: ['LeaveBlackoutPage'] },
  'leave_compliance': { module: 'Leave', pages: ['LeaveCompliancePage'] },
  'leave_conflict_rules': { module: 'Leave', pages: ['LeaveConflictRulesPage'] },
  'leave_encashment': { module: 'Leave', pages: ['LeaveEncashmentPage'] },
  'leave_holidays': { module: 'Leave', pages: ['LeaveHolidaysPage'] },
  'leave_liability': { module: 'Leave', pages: ['LeaveLiabilityPage'] },
  'leave_prorata': { module: 'Leave', pages: ['LeaveProrataPage'] },
  'leave_rollover': { module: 'Leave', pages: ['LeaveRolloverPage'] },
  'leave_schedule': { module: 'Leave', pages: ['LeaveSchedulePage'] },
  'leave_years': { module: 'Leave', pages: ['LeaveYearsPage'] },
  'maternity_leave': { module: 'Leave', pages: ['MaternityLeavePage'] },
  'comp_time': { module: 'Leave', pages: ['CompTimePage'] },

  // Time & Attendance Module
  'attendance_analytics': { module: 'Time & Attendance', pages: ['AttendanceAnalyticsPage'] },
  'attendance_exceptions': { module: 'Time & Attendance', pages: ['AttendanceExceptionsPage'] },
  'attendance_policies': { module: 'Time & Attendance', pages: ['AttendancePoliciesPage'] },
  'attendance_regularization': { module: 'Time & Attendance', pages: ['AttendanceRegularizationPage'] },
  'geofence': { module: 'Time & Attendance', pages: ['GeofencePage'] },
  'overtime_alerts': { module: 'Time & Attendance', pages: ['OvertimeAlertsPage'] },
  'punch_import': { module: 'Time & Attendance', pages: ['PunchImportPage'] },
  'shift_swaps': { module: 'Time & Attendance', pages: ['ShiftSwapsPage'] },
  'timeclock_devices': { module: 'Time & Attendance', pages: ['TimeclockDevicesPage'] },
  'timesheet_approvals': { module: 'Time & Attendance', pages: ['TimesheetApprovalsPage'] },

  // Performance Module
  'goal_template': { module: 'Performance', pages: ['GoalTemplatePage'] },
  'calibration': { module: 'Performance', pages: ['CalibrationPage'] },
  'continuous_feedback': { module: 'Performance', pages: ['ContinuousFeedbackPage'] },
  'performance_dashboard': { module: 'Performance', pages: ['PerformanceDashboardPage'] },
  'performance_setup': { module: 'Performance', pages: ['PerformanceSetupPage'] },
  'pip': { module: 'Performance', pages: ['PIPPage'] },
  'recognition_awards': { module: 'Performance', pages: ['RecognitionAwardsPage'] },
  'review_360': { module: 'Performance', pages: ['Review360Page'] },

  // Training Module
  'course_catalog': { module: 'Training', pages: ['CourseCatalogPage'] },
  'certifications': { module: 'Training', pages: ['CertificationsPage'] },
  'learning_paths': { module: 'Training', pages: ['LearningPathsPage'] },
  'training_requests': { module: 'Training', pages: ['TrainingRequestsPage'] },
  'instructors': { module: 'Training', pages: ['InstructorsPage'] },
  'live_sessions': { module: 'Training', pages: ['LiveSessionsPage'] },
  'training_analytics': { module: 'Training', pages: ['TrainingAnalyticsPage'] },
  'training_budgets': { module: 'Training', pages: ['TrainingBudgetsPage'] },
  'training_calendar': { module: 'Training', pages: ['TrainingCalendarPage'] },
  'training_evaluations': { module: 'Training', pages: ['TrainingEvaluationsPage'] },
  'training_needs': { module: 'Training', pages: ['TrainingNeedsPage'] },

  // Succession Module
  'succession_plan': { module: 'Succession', pages: ['SuccessionPlanPage'] },
  'succession_dashboard': { module: 'Succession', pages: ['SuccessionDashboardPage'] },
  'succession_analytics': { module: 'Succession', pages: ['SuccessionAnalyticsPage'] },
  'talent_pools': { module: 'Succession', pages: ['TalentPoolsPage'] },
  'key_positions': { module: 'Succession', pages: ['KeyPositionsPage'] },
  'bench_strength': { module: 'Succession', pages: ['BenchStrengthPage'] },
  'nine_box': { module: 'Succession', pages: ['NineBoxPage'] },
  'flight_risk': { module: 'Succession', pages: ['FlightRiskPage'] },

  // HSE Module
  'hse_incidents': { module: 'HSE', pages: ['HSEIncidentsPage'] },
  'hse_inspections': { module: 'HSE', pages: ['HSEInspectionsPage'] },
  'hse_risk_assessment': { module: 'HSE', pages: ['HSERiskAssessmentPage'] },
  'hse_training': { module: 'HSE', pages: ['HSETrainingPage'] },
  'hse_analytics': { module: 'HSE', pages: ['HSEAnalyticsPage'] },
  'hse_chemicals': { module: 'HSE', pages: ['HSEChemicalsPage'] },
  'hse_emergency_response': { module: 'HSE', pages: ['HSEEmergencyResponsePage'] },
  'hse_ppe': { module: 'HSE', pages: ['HSEPPEPage'] },
  'hse_safety_observations': { module: 'HSE', pages: ['HSESafetyObservationsPage'] },

  // Employee Relations Module
  'er_cases': { module: 'Employee Relations', pages: ['ERCasesPage'] },
  'grievances': { module: 'Employee Relations', pages: ['GrievancesPage'] },
  'disciplinary': { module: 'Employee Relations', pages: ['DisciplinaryPage'] },
  'unions': { module: 'Employee Relations', pages: ['UnionsPage'] },
  'cba': { module: 'Employee Relations', pages: ['CBAPage'] },
  'exit_interviews': { module: 'Employee Relations', pages: ['ExitInterviewsPage'] },
  'surveys': { module: 'Employee Relations', pages: ['SurveysPage'] },
  'wellness': { module: 'Employee Relations', pages: ['WellnessPage'] },

  // Compensation Module
  'salary_grades': { module: 'Compensation', pages: ['SalaryGradesPage'] },
  'pay_elements': { module: 'Compensation', pages: ['PayElementsPage'] },
  'pay_equity': { module: 'Compensation', pages: ['PayEquityPage'] },
  'bonus_management': { module: 'Compensation', pages: ['BonusManagementPage'] },
  'equity_management': { module: 'Compensation', pages: ['EquityManagementPage'] },
  'merit_cycles': { module: 'Compensation', pages: ['MeritCyclesPage'] },
  'market_benchmarking': { module: 'Compensation', pages: ['MarketBenchmarkingPage'] },
  'compensation_analytics': { module: 'Compensation', pages: ['CompensationAnalyticsPage'] },
  'compensation_budgets': { module: 'Compensation', pages: ['CompensationBudgetsPage'] },
  'minimum_wage': { module: 'Compensation', pages: ['MinimumWagePage'] },
  'spinal_points': { module: 'Compensation', pages: ['SpinalPointsPage'] },
  'total_rewards': { module: 'Compensation', pages: ['TotalRewardsPage'] },

  // Workforce Module
  'jobs': { module: 'Workforce', pages: ['JobsPage'] },
  'positions': { module: 'Workforce', pages: ['PositionsPage'] },
  'departments': { module: 'Workforce', pages: ['DepartmentsPage'] },
  'org_structure': { module: 'Workforce', pages: ['OrgStructurePage'] },
  'headcount': { module: 'Workforce', pages: ['HeadcountPage'] },
  'workforce_analytics': { module: 'Workforce', pages: ['WorkforceAnalyticsPage'] },
  'workforce_forecasting': { module: 'Workforce', pages: ['WorkforceForecastingPage'] },

  // Property Module
  'property_assets': { module: 'Property', pages: ['PropertyAssetsPage'] },
  'property_assignments': { module: 'Property', pages: ['PropertyAssignmentsPage'] },
  'property_categories': { module: 'Property', pages: ['PropertyCategoriesPage'] },
  'property_maintenance': { module: 'Property', pages: ['PropertyMaintenancePage'] },

  // ESS Module
  'my_profile': { module: 'ESS', pages: ['MyProfilePage'] },
  'my_leave': { module: 'ESS', pages: ['MyLeavePage'] },
  'my_time': { module: 'ESS', pages: ['MyTimePage'] },
  'my_benefits': { module: 'ESS', pages: ['MyBenefitsPage'] },
  'my_training': { module: 'ESS', pages: ['MyTrainingPage'] },
  'my_goals': { module: 'ESS', pages: ['MyGoalsPage'] },
  'my_documents': { module: 'ESS', pages: ['MyDocumentsPage'] },

  // MSS Module
  'team': { module: 'MSS', pages: ['TeamPage'] },
  'mss_leave': { module: 'MSS', pages: ['MSSLeavePage'] },
  'mss_time_attendance': { module: 'MSS', pages: ['MSSTimeAttendancePage'] },
  'mss_appraisals': { module: 'MSS', pages: ['MSSAppraisalsPage'] },
  'mss_training': { module: 'MSS', pages: ['MSSTrainingPage'] },
};

/**
 * Get all unique modules from the registry
 */
export function getRegisteredModules(): string[] {
  const modules = new Set(Object.values(auditedEntityTypes).map(e => e.module));
  return Array.from(modules).sort();
}

/**
 * Get entity types for a specific module from the registry
 */
export function getRegisteredEntityTypesForModule(moduleName: string): string[] {
  return Object.entries(auditedEntityTypes)
    .filter(([_, entity]) => entity.module === moduleName)
    .map(([entityType]) => entityType);
}

/**
 * Check if an entity type is registered (has a usePageAudit hook)
 */
export function isEntityTypeRegistered(entityType: string): boolean {
  return entityType in auditedEntityTypes;
}

/**
 * Get the total count of registered entity types
 */
export function getTotalRegisteredEntityTypes(): number {
  return Object.keys(auditedEntityTypes).length;
}

/**
 * Get module statistics from the registry
 */
export function getModuleStatistics(): Record<string, { entityCount: number; pages: string[] }> {
  const stats: Record<string, { entityCount: number; pages: string[] }> = {};
  
  for (const [_, entity] of Object.entries(auditedEntityTypes)) {
    if (!stats[entity.module]) {
      stats[entity.module] = { entityCount: 0, pages: [] };
    }
    stats[entity.module].entityCount++;
    stats[entity.module].pages.push(...entity.pages);
  }
  
  return stats;
}

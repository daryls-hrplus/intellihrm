/**
 * Audit Entity Registry - Single source of truth for all instrumented entity types
 * 
 * This registry contains ALL entity types that are actively instrumented via usePageAudit() hooks.
 * Industry standard: Coverage = implementation completeness, not database activity.
 * 
 * IMPORTANT: Only add entries here AFTER the corresponding usePageAudit() hook is implemented.
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
  // ===========================
  // ADMIN MODULE (Verified)
  // ===========================
  'access_requests': { module: 'Admin', pages: ['AdminAccessRequestsPage'] },
  'ai_governance': { module: 'Admin', pages: ['AdminAIGovernancePage'] },
  'ai_security': { module: 'Admin', pages: ['AISecurityViolationsPage'] },
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
  'audit_coverage': { module: 'Admin', pages: ['AuditCoveragePage'] },
  'admin_dashboard': { module: 'Admin', pages: ['AdminDashboardPage'] },
  'admin_ai_agents': { module: 'Admin', pages: ['AdminAIAgentsPage'] },
  'admin_ai_cost': { module: 'Admin', pages: ['AdminAICostPage'] },
  'admin_ai_observability': { module: 'Admin', pages: ['AdminAIObservabilityPage'] },
  'admin_ai_reports': { module: 'Admin', pages: ['AdminAIReportsPage'] },
  'admin_integrations': { module: 'Admin', pages: ['AdminIntegrationsPage'] },
  'admin_payroll_settings': { module: 'Admin', pages: ['AdminPayrollSettingsPage'] },
  'admin_roles': { module: 'Admin', pages: ['AdminRolesPage'] },
  'admin_users': { module: 'Admin', pages: ['AdminUsersPage'] },

  // ===========================
  // PAYROLL MODULE (Verified)
  // ===========================
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
  'batch_operations': { module: 'Payroll', pages: ['BatchOperationsPage'] },
  'vacation_manager': { module: 'Payroll', pages: ['VacationManagerPage'] },
  'integration_webhooks': { module: 'Payroll', pages: ['IntegrationWebhooksPage'] },
  'multi_company_consolidation': { module: 'Payroll', pages: ['MultiCompanyConsolidationPage'] },

  // ===========================
  // RECRUITMENT MODULE (Verified)
  // ===========================
  'assessments': { module: 'Recruitment', pages: ['AssessmentsPage'] },
  'referrals': { module: 'Recruitment', pages: ['ReferralsPage'] },
  'email_templates': { module: 'Recruitment', pages: ['EmailTemplatesPage'] },
  'job_boards': { module: 'Recruitment', pages: ['JobBoardsPage'] },
  'scorecards': { module: 'Recruitment', pages: ['ScorecardsPage'] },
  'recruitment_analytics': { module: 'Recruitment', pages: ['RecruitmentAnalyticsPage'] },
  'interview_panels': { module: 'Recruitment', pages: ['InterviewPanelsPage'] },
  'sources': { module: 'Recruitment', pages: ['SourcesPage'] },
  'pipeline': { module: 'Recruitment', pages: ['PipelinePage'] },
  'offers': { module: 'Recruitment', pages: ['OffersPage'] },

  // ===========================
  // COMPENSATION MODULE (Now Instrumented)
  // ===========================
  'salary_grades': { module: 'Compensation', pages: ['SalaryGradesPage'] },
  'pay_elements': { module: 'Compensation', pages: ['PayElementsPage'] },
  'pay_equity': { module: 'Compensation', pages: ['PayEquityPage'] },
  'bonus_management': { module: 'Compensation', pages: ['BonusManagementPage'] },
  'equity_management': { module: 'Compensation', pages: ['EquityManagementPage'] },
  'merit_cycles': { module: 'Compensation', pages: ['MeritCyclesPage'] },
  'market_benchmarking': { module: 'Compensation', pages: ['MarketBenchmarkingPage'] },
  'compensation_analytics': { module: 'Compensation', pages: ['CompensationAnalyticsPage'] },
  'compensation_budgets': { module: 'Compensation', pages: ['CompensationBudgetsPage'] },
  'minimum_wage_compliance': { module: 'Compensation', pages: ['MinimumWageCompliancePage'] },
  'minimum_wage_config': { module: 'Compensation', pages: ['MinimumWageConfigPage'] },
  'spinal_points': { module: 'Compensation', pages: ['SpinalPointsPage'] },
  'total_rewards': { module: 'Compensation', pages: ['TotalRewardsPage'] },
  'compensation_dashboard': { module: 'Compensation', pages: ['CompensationDashboardPage'] },
  'compensation_history': { module: 'Compensation', pages: ['CompensationHistoryPage'] },
  'employee_compensation': { module: 'Compensation', pages: ['EmployeeCompensationPage'] },
  'compa_ratio': { module: 'Compensation', pages: ['CompaRatioPage'] },
  'position_budget_approvals': { module: 'Compensation', pages: ['PositionBudgetApprovalsPage'] },
  'position_budget_cost_config': { module: 'Compensation', pages: ['PositionBudgetCostConfigPage'] },
  'position_budget_dashboard': { module: 'Compensation', pages: ['PositionBudgetDashboardPage'] },
  'position_budget_plan': { module: 'Compensation', pages: ['PositionBudgetPlanPage'] },
  'position_budget_what_if': { module: 'Compensation', pages: ['PositionBudgetWhatIfPage'] },
  'position_compensation': { module: 'Compensation', pages: ['PositionCompensationPage'] },

  // ===========================
  // BENEFITS MODULE (Now Instrumented)
  // ===========================
  'benefit_claims': { module: 'Benefits', pages: ['BenefitClaimsPage'] },
  'benefit_categories': { module: 'Benefits', pages: ['BenefitCategoriesPage'] },
  'benefit_providers': { module: 'Benefits', pages: ['BenefitProvidersPage'] },
  'benefit_analytics': { module: 'Benefits', pages: ['BenefitAnalyticsPage'] },
  'auto_enrollment_rules': { module: 'Benefits', pages: ['AutoEnrollmentRulesPage'] },
  'eligibility_audit': { module: 'Benefits', pages: ['EligibilityAuditPage'] },
  'life_event_management': { module: 'Benefits', pages: ['LifeEventManagementPage'] },
  'open_enrollment_tracker': { module: 'Benefits', pages: ['OpenEnrollmentTrackerPage'] },
  'waiting_period_tracking': { module: 'Benefits', pages: ['WaitingPeriodTrackingPage'] },
  'benefit_calculator': { module: 'Benefits', pages: ['BenefitCalculatorPage'] },
  'benefit_compliance_reports': { module: 'Benefits', pages: ['BenefitComplianceReportsPage'] },
  'benefit_cost_projections': { module: 'Benefits', pages: ['BenefitCostProjectionsPage'] },
  'benefit_enrollments': { module: 'Benefits', pages: ['BenefitEnrollmentsPage'] },
  'benefit_plans': { module: 'Benefits', pages: ['BenefitPlansPage'] },
  'benefits_dashboard': { module: 'Benefits', pages: ['BenefitsDashboardPage'] },
  'plan_comparison': { module: 'Benefits', pages: ['PlanComparisonPage'] },

  // ===========================
  // LEAVE MODULE (Now Instrumented)
  // ===========================
  'leave_accrual_rules': { module: 'Leave', pages: ['LeaveAccrualRulesPage'] },
  'leave_analytics': { module: 'Leave', pages: ['LeaveAnalyticsPage'] },
  'leave_blackout_periods': { module: 'Leave', pages: ['LeaveBlackoutPeriodsPage'] },
  'leave_compliance': { module: 'Leave', pages: ['LeaveCompliancePage'] },
  'leave_conflict_rules': { module: 'Leave', pages: ['LeaveConflictRulesPage'] },
  'leave_encashment': { module: 'Leave', pages: ['LeaveEncashmentPage'] },
  'leave_holidays': { module: 'Leave', pages: ['LeaveHolidaysPage'] },
  'leave_liability': { module: 'Leave', pages: ['LeaveLiabilityPage'] },
  'leave_prorata_settings': { module: 'Leave', pages: ['LeaveProrataSettingsPage'] },
  'leave_rollover_rules': { module: 'Leave', pages: ['LeaveRolloverRulesPage'] },
  'leave_schedule_config': { module: 'Leave', pages: ['LeaveScheduleConfigPage'] },
  'leave_years': { module: 'Leave', pages: ['LeaveYearsPage'] },
  'maternity_leave': { module: 'Leave', pages: ['MaternityLeavePage'] },
  'comp_time_policies': { module: 'Leave', pages: ['CompTimePoliciesPage'] },
  'compensatory_time': { module: 'Leave', pages: ['CompensatoryTimePage'] },
  'apply_leave': { module: 'Leave', pages: ['ApplyLeavePage'] },
  'employee_leave_balances': { module: 'Leave', pages: ['EmployeeLeaveBalancesPage'] },
  'employee_leave_records': { module: 'Leave', pages: ['EmployeeLeaveRecordsPage'] },
  'leave_approvals': { module: 'Leave', pages: ['LeaveApprovalsPage'] },
  'leave_balance_adjustments': { module: 'Leave', pages: ['LeaveBalanceAdjustmentsPage'] },
  'leave_balance_recalculation': { module: 'Leave', pages: ['LeaveBalanceRecalculationPage'] },
  'leave_calendar': { module: 'Leave', pages: ['LeaveCalendarPage'] },
  'leave_dashboard': { module: 'Leave', pages: ['LeaveDashboardPage'] },
  'leave_types': { module: 'Leave', pages: ['LeaveTypesPage'] },
  'my_leave': { module: 'Leave', pages: ['MyLeavePage'] },

  // ===========================
  // TIME & ATTENDANCE MODULE (Now Instrumented)
  // ===========================
  'attendance_analytics': { module: 'Time & Attendance', pages: ['AttendanceAnalyticsPage'] },
  'attendance_exceptions': { module: 'Time & Attendance', pages: ['AttendanceExceptionsPage'] },
  'attendance_policies': { module: 'Time & Attendance', pages: ['AttendancePoliciesPage'] },
  'attendance_regularization': { module: 'Time & Attendance', pages: ['AttendanceRegularizationPage'] },
  'geofence_management': { module: 'Time & Attendance', pages: ['GeofenceManagementPage'] },
  'overtime_alerts': { module: 'Time & Attendance', pages: ['OvertimeAlertsPage'] },
  'punch_import': { module: 'Time & Attendance', pages: ['PunchImportPage'] },
  'shift_swaps': { module: 'Time & Attendance', pages: ['ShiftSwapsPage'] },
  'timeclock_devices': { module: 'Time & Attendance', pages: ['TimeclockDevicesPage'] },
  'timesheet_approvals': { module: 'Time & Attendance', pages: ['TimesheetApprovalsPage'] },
  'attendance_records': { module: 'Time & Attendance', pages: ['AttendanceRecordsPage'] },
  'absenteeism_cost': { module: 'Time & Attendance', pages: ['AbsenteeismCostPage'] },
  'cba_extensions': { module: 'Time & Attendance', pages: ['CBAExtensionsPage'] },
  'cba_time_rules': { module: 'Time & Attendance', pages: ['CBATimeRulesPage'] },
  'flex_time': { module: 'Time & Attendance', pages: ['FlexTimePage'] },
  'labor_compliance': { module: 'Time & Attendance', pages: ['LaborCompliancePage'] },
  'live_attendance': { module: 'Time & Attendance', pages: ['LiveAttendancePage'] },
  'overtime_management': { module: 'Time & Attendance', pages: ['OvertimeManagementPage'] },
  'project_time_tracking': { module: 'Time & Attendance', pages: ['ProjectTimeTrackingPage'] },
  'schedules': { module: 'Time & Attendance', pages: ['SchedulesPage'] },
  'shift_management': { module: 'Time & Attendance', pages: ['ShiftManagementPage'] },
  'time_attendance_dashboard': { module: 'Time & Attendance', pages: ['TimeAttendanceDashboardPage'] },
  'time_audit_trail': { module: 'Time & Attendance', pages: ['TimeAuditTrailPage'] },
  'time_tracking': { module: 'Time & Attendance', pages: ['TimeTrackingPage'] },
  'wellness_monitoring': { module: 'Time & Attendance', pages: ['WellnessMonitoringPage'] },

  // ===========================
  // PERFORMANCE MODULE (Now Instrumented)
  // ===========================
  'appraisals': { module: 'Performance', pages: ['AppraisalsPage'] },
  'goals': { module: 'Performance', pages: ['GoalsPage'] },
  'calibration_sessions': { module: 'Performance', pages: ['CalibrationSessionsPage'] },
  'calibration_workspace': { module: 'Performance', pages: ['CalibrationWorkspacePage'] },
  'continuous_feedback': { module: 'Performance', pages: ['ContinuousFeedbackPage'] },
  'performance_dashboard': { module: 'Performance', pages: ['PerformanceDashboardPage'] },
  'performance_setup': { module: 'Performance', pages: ['PerformanceSetupPage'] },
  'performance_improvement_plans': { module: 'Performance', pages: ['PerformanceImprovementPlansPage'] },
  'performance_intelligence_hub': { module: 'Performance', pages: ['PerformanceIntelligenceHub'] },
  'recognition_awards': { module: 'Performance', pages: ['RecognitionAwardsPage'] },
  'review_360': { module: 'Performance', pages: ['Review360Page'] },
  'talent_unified_dashboard': { module: 'Performance', pages: ['TalentUnifiedDashboardPage'] },

  // ===========================
  // TRAINING MODULE (Now Instrumented)
  // ===========================
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
  'competency_gap_analysis': { module: 'Training', pages: ['CompetencyGapAnalysisPage'] },
  'compliance_training': { module: 'Training', pages: ['ComplianceTrainingPage'] },
  'content_authoring': { module: 'Training', pages: ['ContentAuthoringPage'] },
  'course_competencies': { module: 'Training', pages: ['CourseCompetenciesPage'] },
  'employee_certifications': { module: 'Training', pages: ['EmployeeCertificationsPage'] },
  'employee_learning': { module: 'Training', pages: ['EmployeeLearningPage'] },
  'external_training': { module: 'Training', pages: ['ExternalTrainingPage'] },
  'interactive_training_admin': { module: 'Training', pages: ['InteractiveTrainingAdminPage'] },
  'interactive_training': { module: 'Training', pages: ['InteractiveTrainingPage'] },
  'my_learning': { module: 'Training', pages: ['MyLearningPage'] },
  'recertification': { module: 'Training', pages: ['RecertificationPage'] },
  'training_career_paths': { module: 'Training', pages: ['TrainingCareerPathsPage'] },
  'training_dashboard': { module: 'Training', pages: ['TrainingDashboardPage'] },
  'training_mentorship': { module: 'Training', pages: ['TrainingMentorshipPage'] },
  'virtual_classroom': { module: 'Training', pages: ['VirtualClassroomPage'] },

  // ===========================
  // SUCCESSION MODULE (Now Instrumented)
  // ===========================
  'succession_plans': { module: 'Succession', pages: ['SuccessionPlansPage'] },
  'succession_dashboard': { module: 'Succession', pages: ['SuccessionDashboardPage'] },
  'succession_analytics': { module: 'Succession', pages: ['SuccessionAnalyticsPage'] },
  'talent_pools': { module: 'Succession', pages: ['TalentPoolsPage'] },
  'key_positions': { module: 'Succession', pages: ['KeyPositionsPage'] },
  'bench_strength': { module: 'Succession', pages: ['BenchStrengthPage'] },
  'nine_box': { module: 'Succession', pages: ['NineBoxPage'] },
  'flight_risk': { module: 'Succession', pages: ['FlightRiskPage'] },
  'career_development': { module: 'Succession', pages: ['CareerDevelopmentPage'] },
  'career_paths': { module: 'Succession', pages: ['CareerPathsPage'] },
  'mentorship': { module: 'Succession', pages: ['MentorshipPage'] },
  'nine_box_config': { module: 'Succession', pages: ['NineBoxConfigPage'] },

  // ===========================
  // HSE MODULE (Now Instrumented)
  // ===========================
  'hse_incidents': { module: 'HSE', pages: ['HSEIncidentsPage'] },
  'hse_inspections': { module: 'HSE', pages: ['HSEInspectionsPage'] },
  'hse_risk_assessment': { module: 'HSE', pages: ['HSERiskAssessmentPage'] },
  'hse_training': { module: 'HSE', pages: ['HSESafetyTrainingPage'] },
  'hse_analytics': { module: 'HSE', pages: ['HSEAnalyticsPage'] },
  'hse_chemicals': { module: 'HSE', pages: ['HSEChemicalsPage'] },
  'hse_emergency_response': { module: 'HSE', pages: ['HSEEmergencyResponsePage'] },
  'hse_ppe_management': { module: 'HSE', pages: ['HSEPPEManagementPage'] },
  'hse_safety_observations': { module: 'HSE', pages: ['HSESafetyObservationsPage'] },
  'hse_compliance': { module: 'HSE', pages: ['HSECompliancePage'] },
  'hse_dashboard': { module: 'HSE', pages: ['HSEDashboardPage'] },
  'hse_ergonomics': { module: 'HSE', pages: ['HSEErgonomicsPage'] },
  'hse_first_aid': { module: 'HSE', pages: ['HSEFirstAidPage'] },
  'hse_loto': { module: 'HSE', pages: ['HSELotoPage'] },
  'hse_near_miss': { module: 'HSE', pages: ['HSENearMissPage'] },
  'hse_osha_reporting': { module: 'HSE', pages: ['HSEOshaReportingPage'] },
  'hse_permit_to_work': { module: 'HSE', pages: ['HSEPermitToWorkPage'] },
  'hse_safety_policies': { module: 'HSE', pages: ['HSESafetyPoliciesPage'] },
  'hse_toolbox_talks': { module: 'HSE', pages: ['HSEToolboxTalksPage'] },
  'hse_workers_comp': { module: 'HSE', pages: ['HSEWorkersCompPage'] },

  // ===========================
  // EMPLOYEE RELATIONS MODULE (Now Instrumented)
  // ===========================
  'er_cases': { module: 'Employee Relations', pages: ['ERCasesPage'] },
  'er_grievances': { module: 'Employee Relations', pages: ['ERGrievancesPage'] },
  'er_disciplinary': { module: 'Employee Relations', pages: ['ERDisciplinaryPage'] },
  'er_unions': { module: 'Employee Relations', pages: ['ERUnionsPage'] },
  'er_cba': { module: 'Employee Relations', pages: ['CBADetailPage'] },
  'er_exit_interviews': { module: 'Employee Relations', pages: ['ERExitInterviewsPage'] },
  'er_surveys': { module: 'Employee Relations', pages: ['ERSurveysPage'] },
  'er_wellness': { module: 'Employee Relations', pages: ['ERWellnessPage'] },
  'er_analytics': { module: 'Employee Relations', pages: ['ERAnalyticsPage'] },
  'er_court_judgements': { module: 'Employee Relations', pages: ['ERCourtJudgementsPage'] },
  'er_recognition': { module: 'Employee Relations', pages: ['ERRecognitionPage'] },
  'employee_relations_dashboard': { module: 'Employee Relations', pages: ['EmployeeRelationsDashboardPage'] },

  // ===========================
  // WORKFORCE MODULE (Now Instrumented)
  // ===========================
  'employees': { module: 'Workforce', pages: ['EmployeesPage'] },
  'jobs': { module: 'Workforce', pages: ['JobsPage'] },
  'positions': { module: 'Workforce', pages: ['PositionsPage'] },
  'departments': { module: 'Workforce', pages: ['DepartmentsPage'] },
  'org_structure': { module: 'Workforce', pages: ['OrgStructurePage'] },
  'workforce_analytics': { module: 'Workforce', pages: ['WorkforceAnalyticsPage'] },
  'workforce_forecasting': { module: 'Workforce', pages: ['WorkforceForecastingPage'] },
  'capability_registry': { module: 'Workforce', pages: ['CapabilityRegistryPage'] },
  'company_boards': { module: 'Workforce', pages: ['CompanyBoardsPage'] },
  'competencies': { module: 'Workforce', pages: ['CompetenciesPage'] },
  'divisions': { module: 'Workforce', pages: ['DivisionsPage'] },
  'employee_assignments': { module: 'Workforce', pages: ['EmployeeAssignmentsPage'] },
  'employee_profile': { module: 'Workforce', pages: ['EmployeeProfilePage'] },
  'employee_transactions': { module: 'Workforce', pages: ['EmployeeTransactionsPage'] },
  'governance': { module: 'Workforce', pages: ['GovernancePage'] },
  'headcount_analytics': { module: 'Workforce', pages: ['HeadcountAnalyticsPage'] },
  'headcount_forecast': { module: 'Workforce', pages: ['HeadcountForecastPage'] },
  'headcount_requests': { module: 'Workforce', pages: ['HeadcountRequestsPage'] },
  'job_families': { module: 'Workforce', pages: ['JobFamiliesPage'] },
  'offboarding': { module: 'Workforce', pages: ['OffboardingPage'] },
  'org_changes': { module: 'Workforce', pages: ['OrgChangesPage'] },
  'org_structure_config': { module: 'Workforce', pages: ['OrgStructureConfigPage'] },
  'position_control_vacancies': { module: 'Workforce', pages: ['PositionControlVacanciesPage'] },
  'qualifications': { module: 'Workforce', pages: ['QualificationsPage'] },
  'responsibilities': { module: 'Workforce', pages: ['ResponsibilitiesPage'] },
  'workforce_dashboard': { module: 'Workforce', pages: ['WorkforceDashboardPage'] },

  // ===========================
  // PROPERTY MODULE (Now Instrumented)
  // ===========================
  'property_assets': { module: 'Property', pages: ['PropertyAssetsPage'] },
  'property_assignments': { module: 'Property', pages: ['PropertyAssignmentsPage'] },
  'property_categories': { module: 'Property', pages: ['PropertyCategoriesPage'] },
  'property_maintenance': { module: 'Property', pages: ['PropertyMaintenancePage'] },
  'property_analytics': { module: 'Property', pages: ['PropertyAnalyticsPage'] },
  'property_dashboard': { module: 'Property', pages: ['PropertyDashboardPage'] },
  'property_requests': { module: 'Property', pages: ['PropertyRequestsPage'] },

  // ===========================
  // ESS MODULE (Now Instrumented)
  // ===========================
  'ess_dashboard': { module: 'ESS', pages: ['EmployeeSelfServicePage'] },
  'ess_appraisal_interviews': { module: 'ESS', pages: ['EssAppraisalInterviewsPage'] },
  'ess_goal_interviews': { module: 'ESS', pages: ['EssGoalInterviewsPage'] },
  'my_reminders': { module: 'ESS', pages: ['MyRemindersPage'] },
  'ess_announcements': { module: 'ESS', pages: ['AnnouncementsPage'] },
  'ess_milestones': { module: 'ESS', pages: ['MilestonesPage'] },
  'my_appraisals': { module: 'ESS', pages: ['MyAppraisalsPage'] },
  'my_banking': { module: 'ESS', pages: ['MyBankingPage'] },
  'my_benefits': { module: 'ESS', pages: ['MyBenefitsPage'] },
  'my_calendar': { module: 'ESS', pages: ['MyCalendarPage'] },
  'my_career_paths': { module: 'ESS', pages: ['MyCareerPathsPage'] },
  'my_career_plan': { module: 'ESS', pages: ['MyCareerPlanPage'] },
  'my_competencies': { module: 'ESS', pages: ['MyCompetenciesPage'] },
  'my_dependents': { module: 'ESS', pages: ['MyDependentsPage'] },
  'my_development_plan': { module: 'ESS', pages: ['MyDevelopmentPlanPage'] },
  'my_employee_relations': { module: 'ESS', pages: ['MyEmployeeRelationsPage'] },
  'my_evidence_portfolio': { module: 'ESS', pages: ['MyEvidencePortfolioPage'] },
  'my_expense_claims': { module: 'ESS', pages: ['MyExpenseClaimsPage'] },
  'my_feedback': { module: 'ESS', pages: ['MyFeedbackPage'] },
  'my_goals': { module: 'ESS', pages: ['MyGoalsPage'] },
  'my_government_ids': { module: 'ESS', pages: ['MyGovernmentIdsPage'] },
  'my_hse': { module: 'ESS', pages: ['MyHSEPage'] },
  'my_immigration': { module: 'ESS', pages: ['MyImmigrationPage'] },
  'my_interests': { module: 'ESS', pages: ['MyInterestsPage'] },
  'my_letters': { module: 'ESS', pages: ['MyLettersPage'] },
  'my_medical_info': { module: 'ESS', pages: ['MyMedicalInfoPage'] },
  'my_mentorship': { module: 'ESS', pages: ['MyMentorshipPage'] },
  'my_offboarding': { module: 'ESS', pages: ['MyOffboardingPage'] },
  'my_onboarding': { module: 'ESS', pages: ['MyOnboardingPage'] },
  'my_personal_info': { module: 'ESS', pages: ['MyPersonalInfoPage'] },
  'my_professional_info': { module: 'ESS', pages: ['MyProfessionalInfoPage'] },
  'my_property': { module: 'ESS', pages: ['MyPropertyPage'] },
  'my_qualifications': { module: 'ESS', pages: ['MyQualificationsPage'] },
  'my_recognition': { module: 'ESS', pages: ['MyRecognitionPage'] },
  'my_skill_gaps': { module: 'ESS', pages: ['MySkillGapsPage'] },
  'my_time_attendance': { module: 'ESS', pages: ['MyTimeAttendancePage'] },
  'my_timesheets': { module: 'ESS', pages: ['MyTimesheetsPage'] },
  'my_training': { module: 'ESS', pages: ['MyTrainingPage'] },
  'my_transactions': { module: 'ESS', pages: ['MyTransactionsPage'] },
  'notification_preferences': { module: 'ESS', pages: ['NotificationPreferencesPage'] },
  'team_calendar': { module: 'ESS', pages: ['TeamCalendarPage'] },
  'ess_compa_ratio': { module: 'ESS', pages: ['EssCompaRatioPage'] },
  'ess_compensation': { module: 'ESS', pages: ['EssCompensationPage'] },
  'ess_compensation_history': { module: 'ESS', pages: ['EssCompensationHistoryPage'] },
  'ess_currency_preferences': { module: 'ESS', pages: ['EssCurrencyPreferencesPage'] },
  'ess_equity': { module: 'ESS', pages: ['EssEquityPage'] },
  'ess_job_openings': { module: 'ESS', pages: ['EssJobOpeningsPage'] },
  'ess_leave': { module: 'ESS', pages: ['EssLeavePage'] },
  'ess_total_rewards': { module: 'ESS', pages: ['EssTotalRewardsPage'] },

  // ===========================
  // MSS MODULE (Now Instrumented)
  // ===========================
  'mss_dashboard': { module: 'MSS', pages: ['ManagerSelfServicePage'] },
  'mss_appraisal_interviews': { module: 'MSS', pages: ['MssAppraisalInterviewsPage'] },
  'mss_goal_interviews': { module: 'MSS', pages: ['MssGoalInterviewsPage'] },
  'mss_analytics': { module: 'MSS', pages: ['MssAnalyticsPage'] },
  'mss_appraisals': { module: 'MSS', pages: ['MssAppraisalsPage'] },
  'mss_benefits': { module: 'MSS', pages: ['MssBenefitsPage'] },
  'mss_calibration': { module: 'MSS', pages: ['MssCalibrationPage'] },
  'mss_compa_ratio': { module: 'MSS', pages: ['MssCompaRatioPage'] },
  'mss_compensation': { module: 'MSS', pages: ['MssCompensationPage'] },
  'mss_development_plans': { module: 'MSS', pages: ['MssDevelopmentPlansPage'] },
  'mss_employee_relations': { module: 'MSS', pages: ['MssEmployeeRelationsPage'] },
  'mss_equity': { module: 'MSS', pages: ['MssEquityPage'] },
  'mss_feedback': { module: 'MSS', pages: ['MssFeedbackPage'] },
  'mss_goals': { module: 'MSS', pages: ['MssGoalsPage'] },
  'mss_hse': { module: 'MSS', pages: ['MssHSEPage'] },
  'mss_leave': { module: 'MSS', pages: ['MssLeavePage'] },
  'mss_offboarding': { module: 'MSS', pages: ['MssOffboardingPage'] },
  'mss_onboarding': { module: 'MSS', pages: ['MssOnboardingPage'] },
  'mss_payroll_consolidation': { module: 'MSS', pages: ['MssPayrollConsolidationPage'] },
  'mss_pips': { module: 'MSS', pages: ['MssPipsPage'] },
  'mss_property': { module: 'MSS', pages: ['MssPropertyPage'] },
  'mss_recognition': { module: 'MSS', pages: ['MssRecognitionPage'] },
  'mss_recruitment': { module: 'MSS', pages: ['MssRecruitmentPage'] },
  'mss_reminders': { module: 'MSS', pages: ['MssRemindersPage'] },
  'mss_review_360': { module: 'MSS', pages: ['MssReview360Page'] },
  'mss_succession': { module: 'MSS', pages: ['MssSuccessionPage'] },
  'mss_team': { module: 'MSS', pages: ['MssTeamPage'] },
  'mss_team_member': { module: 'MSS', pages: ['MssTeamMemberPage'] },
  'mss_time_attendance': { module: 'MSS', pages: ['MssTimeAttendancePage'] },
  'mss_training': { module: 'MSS', pages: ['MssTrainingPage'] },
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

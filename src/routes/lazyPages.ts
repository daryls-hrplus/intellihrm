import { lazy } from 'react';

// Core pages (keep synchronous for fast initial load)
export { default as Index } from '@/pages/Index';
export { default as NotFound } from '@/pages/NotFound';
export { default as AuthPage } from '@/pages/AuthPage';
export { default as UnauthorizedPage } from '@/pages/UnauthorizedPage';

// Lazy load all other pages
export const MFAChallengePage = lazy(() => import('@/pages/auth/MFAChallengePage'));

// Admin pages
export const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
export const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
export const AdminCompaniesPage = lazy(() => import('@/pages/admin/AdminCompaniesPage'));
export const AdminCompanyGroupsPage = lazy(() => import('@/pages/admin/AdminCompanyGroupsPage'));
export const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AdminAuditLogsPage'));
export const AuditCoveragePage = lazy(() => import('@/pages/admin/AuditCoveragePage'));
export const AdminAIUsagePage = lazy(() => import('@/pages/admin/AdminAIUsagePage'));
export const AdminRolesPage = lazy(() => import('@/pages/admin/AdminRolesPage'));
export const RoleManagementPage = lazy(() => import('@/pages/admin/RoleManagementPage'));
export const RoleDetailPage = lazy(() => import('@/pages/admin/RoleDetailPage'));
export const AdminPiiAccessPage = lazy(() => import('@/pages/admin/AdminPiiAccessPage'));
export const AISecurityViolationsPage = lazy(() => import('@/pages/admin/AISecurityViolationsPage'));
export const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));
export const AdminPermissionsSummaryPage = lazy(() => import('@/pages/admin/AdminPermissionsSummaryPage'));
export const AdminAccessRequestsPage = lazy(() => import('@/pages/admin/AdminAccessRequestsPage'));
export const AdminAutoApprovalPage = lazy(() => import('@/pages/admin/AdminAutoApprovalPage'));
export const AdminBulkImportPage = lazy(() => import('@/pages/admin/AdminBulkImportPage'));
export const AdminScheduledReportsPage = lazy(() => import('@/pages/admin/AdminScheduledReportsPage'));
export const AdminKnowledgeBasePage = lazy(() => import('@/pages/admin/AdminKnowledgeBasePage'));
export const AdminHelpdeskPage = lazy(() => import('@/pages/admin/AdminHelpdeskPage'));
export const AdminPolicyDocumentsPage = lazy(() => import('@/pages/admin/AdminPolicyDocumentsPage'));
export const AdminLetterTemplatesPage = lazy(() => import('@/pages/admin/AdminLetterTemplatesPage'));
export const AdminLookupValuesPage = lazy(() => import('@/pages/admin/AdminLookupValuesPage'));
export const AdminLmsManagementPage = lazy(() => import('@/pages/admin/AdminLmsManagementPage'));
export const DemoManagementPage = lazy(() => import('@/pages/admin/DemoManagementPage'));
export const DemoAnalyticsDashboard = lazy(() => import('@/pages/admin/DemoAnalyticsDashboard'));
export const ProspectJourneyPage = lazy(() => import('@/pages/admin/ProspectJourneyPage'));
export const AdminOnboardingPage = lazy(() => import('@/pages/admin/AdminOnboardingPage'));
export const AdminOnboardingDetailPage = lazy(() => import('@/pages/admin/AdminOnboardingDetailPage'));
export const AdminColorSchemePage = lazy(() => import('@/pages/admin/AdminColorSchemePage'));
export const TerritoriesPage = lazy(() => import('@/pages/admin/TerritoriesPage'));
export const CompanyTagsPage = lazy(() => import('@/pages/admin/CompanyTagsPage'));
export const GranularPermissionsPage = lazy(() => import('@/pages/admin/GranularPermissionsPage'));
export const ImplementationHandbookPage = lazy(() => import('@/pages/admin/ImplementationHandbookPage'));
export const FeaturesBrochurePage = lazy(() => import('@/pages/admin/FeaturesBrochurePage'));
export const AdminCustomFieldsPage = lazy(() => import('@/pages/admin/AdminCustomFieldsPage'));
export const ModulesBrochurePage = lazy(() => import('@/pages/admin/ModulesBrochurePage'));
export const CurrencyManagementPage = lazy(() => import('@/pages/admin/CurrencyManagementPage'));
export const SubscriptionManagementPage = lazy(() => import('@/pages/admin/SubscriptionManagementPage'));
export const MFASettingsPage = lazy(() => import('@/pages/admin/MFASettingsPage'));
export const SSOSettingsPage = lazy(() => import('@/pages/admin/SSOSettingsPage'));
export const PasswordPoliciesPage = lazy(() => import('@/pages/admin/PasswordPoliciesPage'));
export const SessionManagementPage = lazy(() => import('@/pages/admin/SessionManagementPage'));
export const AIGovernancePage = lazy(() => import('@/pages/admin/AIGovernancePage'));
export const TranslationsPage = lazy(() => import('@/pages/admin/TranslationsPage'));
export const CompanyValuesPage = lazy(() => import('@/pages/admin/CompanyValuesPage'));
export const ClientRegistryPage = lazy(() => import('@/pages/admin/ClientRegistryPage'));
export const ClientDetailPage = lazy(() => import('@/pages/admin/ClientDetailPage'));
export const ClientProvisioningPage = lazy(() => import('@/pages/admin/ClientProvisioningPage'));
export const InvestigationRequestsPage = lazy(() => import('@/pages/admin/InvestigationRequestsPage'));
export const EmployeeDirectoryPage = lazy(() => import('@/pages/admin/EmployeeDirectoryPage'));
export const CompanyAnnouncementsPage = lazy(() => import('@/pages/admin/CompanyAnnouncementsPage'));
export const ApprovalDelegationsPage = lazy(() => import('@/pages/admin/ApprovalDelegationsPage'));
export const CompanyDocumentsPage = lazy(() => import('@/pages/admin/CompanyDocumentsPage'));
export const AdminRemindersPage = lazy(() => import('@/pages/admin/AdminRemindersPage'));
export const AdminWorkflowTemplatesPage = lazy(() => import('@/pages/admin/AdminWorkflowTemplatesPage'));

// Demo pages
export const DemoLoginPage = lazy(() => import('@/pages/demo/DemoLoginPage'));
export const DemoExpiredPage = lazy(() => import('@/pages/demo/DemoExpiredPage'));
export const DemoConversionPage = lazy(() => import('@/pages/demo/DemoConversionPage'));

// Enablement pages
export const EnablementHubPage = lazy(() => import('@/pages/enablement/EnablementHubPage'));
export const ApplicationDocsGeneratorPage = lazy(() => import('@/pages/enablement/ApplicationDocsGeneratorPage'));
export const FeatureCatalogPage = lazy(() => import('@/pages/enablement/FeatureCatalogPage'));
export const FeatureDatabasePage = lazy(() => import('@/pages/enablement/FeatureDatabasePage'));
export const TemplateLibraryPage = lazy(() => import('@/pages/enablement/TemplateLibraryPage'));
export const EnablementAnalyticsPage = lazy(() => import('@/pages/enablement/EnablementAnalyticsPage'));
export const SCORMGeneratorPage = lazy(() => import('@/pages/enablement/SCORMGeneratorPage'));
export const ReleaseCalendarPage = lazy(() => import('@/pages/enablement/ReleaseCalendarPage'));
export const EnablementSettingsPage = lazy(() => import('@/pages/enablement/EnablementSettingsPage'));
export const EnablementAIToolsPage = lazy(() => import('@/pages/enablement/EnablementAIToolsPage'));
export const EnablementGuidePage = lazy(() => import('@/pages/enablement/EnablementGuidePage'));
export const EnablementArtifactsPage = lazy(() => import('@/pages/enablement/EnablementArtifactsPage'));
export const ArtifactEditorPage = lazy(() => import('@/pages/enablement/ArtifactEditorPage'));
export const ArtifactDetailPage = lazy(() => import('@/pages/enablement/ArtifactDetailPage'));
export const ToursManagementPage = lazy(() => import('@/pages/enablement/ToursManagementPage'));
export const FeatureAuditDashboard = lazy(() => import('@/pages/enablement/FeatureAuditDashboard'));
export const ImplementationDetailPage = lazy(() => import('@/pages/enablement/ImplementationDetailPage'));
export const AppraisalsManualPage = lazy(() => import('@/pages/enablement/AppraisalsManualPage'));
export const AdminSecurityManualPage = lazy(() => import('@/pages/enablement/AdminSecurityManualPage'));
export const GoalsManualPage = lazy(() => import('@/pages/enablement/GoalsManualPage'));
export const WorkforceManualPage = lazy(() => import('@/pages/enablement/WorkforceManualPage'));
export const HRHubManualPage = lazy(() => import('@/pages/enablement/HRHubManualPage'));
export const BenefitsManualPage = lazy(() => import('@/pages/enablement/BenefitsManualPage'));
export const ClientProvisioningGuidePage = lazy(() => import('@/pages/enablement/ClientProvisioningGuidePage'));
export const ClientProvisioningTestingPage = lazy(() => import('@/pages/enablement/ClientProvisioningTestingPage'));
export const ManualPublishingPage = lazy(() => import('@/pages/enablement/ManualPublishingPage'));
export const ContentLifecyclePage = lazy(() => import('@/pages/enablement/ContentLifecyclePage'));
export const ManualsIndexPage = lazy(() => import('@/pages/enablement/ManualsIndexPage'));

// Marketing pages
export const LandingPage = lazy(() => import('@/pages/marketing/LandingPage'));
export const RegisterDemoPage = lazy(() => import('@/pages/marketing/RegisterDemoPage'));
export const RegisterDemoSuccessPage = lazy(() => import('@/pages/marketing/RegisterDemoSuccessPage'));
export const FeaturesPage = lazy(() => import('@/pages/marketing/FeaturesPage'));
export const AboutPage = lazy(() => import('@/pages/marketing/AboutPage'));

// Product Tour pages
export const ProductTourLandingPage = lazy(() => import('@/pages/product-tour/ProductTourLandingPage'));
export const ProductTourPlayerPage = lazy(() => import('@/pages/product-tour/ProductTourPlayerPage'));

// Subscription pages
export const SubscriptionPage = lazy(() => import('@/pages/subscription/SubscriptionPage'));
export const UpgradePage = lazy(() => import('@/pages/subscription/UpgradePage'));

// Workforce pages
export const WorkforceDashboardPage = lazy(() => import('@/pages/workforce/WorkforceDashboardPage'));
export const EmployeesPage = lazy(() => import('@/pages/workforce/EmployeesPage'));
export const EmployeeProfilePage = lazy(() => import('@/pages/workforce/EmployeeProfilePage'));
export const PositionsPage = lazy(() => import('@/pages/workforce/PositionsPage'));
export const OrgStructurePage = lazy(() => import('@/pages/workforce/OrgStructurePage'));
export const OrgStructureConfigPage = lazy(() => import('@/pages/workforce/OrgStructureConfigPage'));
export const DepartmentsPage = lazy(() => import('@/pages/workforce/DepartmentsPage'));
export const OrgChangesPage = lazy(() => import('@/pages/workforce/OrgChangesPage'));
export const EmployeeAssignmentsPage = lazy(() => import('@/pages/workforce/EmployeeAssignmentsPage'));
export const EmployeeTransactionsPage = lazy(() => import('@/pages/workforce/EmployeeTransactionsPage'));
export const WorkforceForecastingPage = lazy(() => import('@/pages/workforce/WorkforceForecastingPage'));
export const JobFamiliesPage = lazy(() => import('@/pages/workforce/JobFamiliesPage'));
export const JobsPage = lazy(() => import('@/pages/workforce/JobsPage'));
export const CompetenciesPage = lazy(() => import('@/pages/workforce/CompetenciesPage'));
export const ResponsibilitiesPage = lazy(() => import('@/pages/workforce/ResponsibilitiesPage'));
export const CapabilityRegistryPage = lazy(() => import('@/pages/workforce/CapabilityRegistryPage'));
export const OffboardingPage = lazy(() => import('@/pages/workforce/OffboardingPage'));
export const WorkforceAnalyticsPage = lazy(() => import('@/pages/workforce/WorkforceAnalyticsPage'));
export const QualificationsPage = lazy(() => import('@/pages/workforce/QualificationsPage'));
export const CompanyBoardsPage = lazy(() => import('@/pages/workforce/CompanyBoardsPage'));
export const GovernancePage = lazy(() => import('@/pages/workforce/GovernancePage'));
export const PositionControlVacanciesPage = lazy(() => import('@/pages/workforce/PositionControlVacanciesPage'));
export const HeadcountRequestsPage = lazy(() => import('@/pages/workforce/HeadcountRequestsPage'));
export const HeadcountAnalyticsPage = lazy(() => import('@/pages/workforce/HeadcountAnalyticsPage'));
export const HeadcountForecastPage = lazy(() => import('@/pages/workforce/HeadcountForecastPage'));
export const DivisionsPage = lazy(() => import('@/pages/workforce/DivisionsPage'));

// Performance pages
export const PerformanceDashboardPage = lazy(() => import('@/pages/performance/PerformanceDashboardPage'));
export const GoalsPage = lazy(() => import('@/pages/performance/GoalsPage'));
export const Review360Page = lazy(() => import('@/pages/performance/Review360Page'));
export const AppraisalsPage = lazy(() => import('@/pages/performance/AppraisalsPage'));
export const PerformanceImprovementPlansPage = lazy(() => import('@/pages/performance/PerformanceImprovementPlansPage'));
export const ContinuousFeedbackPage = lazy(() => import('@/pages/performance/ContinuousFeedbackPage'));
export const RecognitionAwardsPage = lazy(() => import('@/pages/performance/RecognitionAwardsPage'));
export const PerformanceIntelligenceHub = lazy(() => import('@/pages/performance/PerformanceIntelligenceHub'));
export const CalibrationSessionsPage = lazy(() => import('@/pages/performance/CalibrationSessionsPage'));
export const CalibrationWorkspacePage = lazy(() => import('@/pages/performance/CalibrationWorkspacePage'));
export const PerformanceSetupPage = lazy(() => import('@/pages/performance/PerformanceSetupPage'));
export const TalentUnifiedDashboardPage = lazy(() => import('@/pages/performance/TalentUnifiedDashboardPage'));
export const MyDevelopmentThemesPage = lazy(() => import('@/pages/performance/feedback/MyDevelopmentThemesPage'));

// Leave pages
export const LeaveDashboardPage = lazy(() => import('@/pages/leave/LeaveDashboardPage'));
export const LeaveTypesPage = lazy(() => import('@/pages/leave/LeaveTypesPage'));
export const LeaveAccrualRulesPage = lazy(() => import('@/pages/leave/LeaveAccrualRulesPage'));
export const LeaveRolloverRulesPage = lazy(() => import('@/pages/leave/LeaveRolloverRulesPage'));
export const LeaveScheduleConfigPage = lazy(() => import('@/pages/leave/LeaveScheduleConfigPage'));
export const MyLeavePage = lazy(() => import('@/pages/leave/MyLeavePage'));
export const ApplyLeavePage = lazy(() => import('@/pages/leave/ApplyLeavePage'));
export const LeaveApprovalsPage = lazy(() => import('@/pages/leave/LeaveApprovalsPage'));
export const LeaveHolidaysPage = lazy(() => import('@/pages/leave/LeaveHolidaysPage'));
export const LeaveBalanceRecalculationPage = lazy(() => import('@/pages/leave/LeaveBalanceRecalculationPage'));
export const LeaveAnalyticsPage = lazy(() => import('@/pages/leave/LeaveAnalyticsPage'));
export const CompensatoryTimePage = lazy(() => import('@/pages/leave/CompensatoryTimePage'));
export const CompTimePoliciesPage = lazy(() => import('@/pages/leave/CompTimePoliciesPage'));
export const LeaveCalendarPage = lazy(() => import('@/pages/leave/LeaveCalendarPage'));
export const LeaveBalanceAdjustmentsPage = lazy(() => import('@/pages/leave/LeaveBalanceAdjustmentsPage'));
export const EmployeeLeaveRecordsPage = lazy(() => import('@/pages/leave/EmployeeLeaveRecordsPage'));
export const EmployeeLeaveBalancesPage = lazy(() => import('@/pages/leave/EmployeeLeaveBalancesPage'));
export const LeaveYearsPage = lazy(() => import('@/pages/leave/LeaveYearsPage'));
export const LeaveBlackoutPeriodsPage = lazy(() => import('@/pages/leave/LeaveBlackoutPeriodsPage'));
export const LeaveConflictRulesPage = lazy(() => import('@/pages/leave/LeaveConflictRulesPage'));
export const LeaveEncashmentPage = lazy(() => import('@/pages/leave/LeaveEncashmentPage'));
export const LeaveLiabilityPage = lazy(() => import('@/pages/leave/LeaveLiabilityPage'));
export const LeaveProrataSettingsPage = lazy(() => import('@/pages/leave/LeaveProrataSettingsPage'));
export const MaternityLeavePage = lazy(() => import('@/pages/leave/MaternityLeavePage'));
export const LeaveCompliancePage = lazy(() => import('@/pages/leave/LeaveCompliancePage'));

// Compensation pages
export const CompensationDashboardPage = lazy(() => import('@/pages/compensation/CompensationDashboardPage'));
export const PayElementsPage = lazy(() => import('@/pages/compensation/PayElementsPage'));
export const SalaryGradesPage = lazy(() => import('@/pages/compensation/SalaryGradesPage'));
export const PositionCompensationPage = lazy(() => import('@/pages/compensation/PositionCompensationPage'));
export const CompensationHistoryPage = lazy(() => import('@/pages/compensation/CompensationHistoryPage'));
export const MeritCyclesPage = lazy(() => import('@/pages/compensation/MeritCyclesPage'));
export const BonusManagementPage = lazy(() => import('@/pages/compensation/BonusManagementPage'));
export const MarketBenchmarkingPage = lazy(() => import('@/pages/compensation/MarketBenchmarkingPage'));
export const PayEquityPage = lazy(() => import('@/pages/compensation/PayEquityPage'));
export const TotalRewardsPage = lazy(() => import('@/pages/compensation/TotalRewardsPage'));
export const CompensationBudgetsPage = lazy(() => import('@/pages/compensation/CompensationBudgetsPage'));
export const EquityManagementPage = lazy(() => import('@/pages/compensation/EquityManagementPage'));
export const CompaRatioPage = lazy(() => import('@/pages/compensation/CompaRatioPage'));
export const CompensationAnalyticsPage = lazy(() => import('@/pages/compensation/CompensationAnalyticsPage'));
export const SpinalPointsPage = lazy(() => import('@/pages/compensation/SpinalPointsPage'));
export const EmployeeCompensationPage = lazy(() => import('@/pages/compensation/EmployeeCompensationPage'));
export const PositionBudgetDashboardPage = lazy(() => import('@/pages/compensation/PositionBudgetDashboardPage'));
export const PositionBudgetPlanPage = lazy(() => import('@/pages/compensation/PositionBudgetPlanPage'));
export const PositionBudgetWhatIfPage = lazy(() => import('@/pages/compensation/PositionBudgetWhatIfPage'));
export const PositionBudgetApprovalsPage = lazy(() => import('@/pages/compensation/PositionBudgetApprovalsPage'));
export const PositionBudgetCostConfigPage = lazy(() => import('@/pages/compensation/PositionBudgetCostConfigPage'));
export const MinimumWageCompliancePage = lazy(() => import('@/pages/compensation/MinimumWageCompliancePage'));
export const MinimumWageConfigPage = lazy(() => import('@/pages/compensation/MinimumWageConfigPage'));

// Benefits pages
export const BenefitsDashboardPage = lazy(() => import('@/pages/benefits/BenefitsDashboardPage'));
export const BenefitCategoriesPage = lazy(() => import('@/pages/benefits/BenefitCategoriesPage'));
export const BenefitPlansPage = lazy(() => import('@/pages/benefits/BenefitPlansPage'));
export const BenefitEnrollmentsPage = lazy(() => import('@/pages/benefits/BenefitEnrollmentsPage'));
export const BenefitClaimsPage = lazy(() => import('@/pages/benefits/BenefitClaimsPage'));
export const BenefitAnalyticsPage = lazy(() => import('@/pages/benefits/BenefitAnalyticsPage'));
export const BenefitCostProjectionsPage = lazy(() => import('@/pages/benefits/BenefitCostProjectionsPage'));
export const AutoEnrollmentRulesPage = lazy(() => import('@/pages/benefits/AutoEnrollmentRulesPage'));
export const LifeEventManagementPage = lazy(() => import('@/pages/benefits/LifeEventManagementPage'));
export const WaitingPeriodTrackingPage = lazy(() => import('@/pages/benefits/WaitingPeriodTrackingPage'));
export const OpenEnrollmentTrackerPage = lazy(() => import('@/pages/benefits/OpenEnrollmentTrackerPage'));
export const EligibilityAuditPage = lazy(() => import('@/pages/benefits/EligibilityAuditPage'));
export const BenefitComplianceReportsPage = lazy(() => import('@/pages/benefits/BenefitComplianceReportsPage'));
export const PlanComparisonPage = lazy(() => import('@/pages/benefits/PlanComparisonPage'));
export const BenefitCalculatorPage = lazy(() => import('@/pages/benefits/BenefitCalculatorPage'));
export const BenefitProvidersPage = lazy(() => import('@/pages/benefits/BenefitProvidersPage'));

// Training pages
export const TrainingDashboardPage = lazy(() => import('@/pages/training/TrainingDashboardPage'));
export const CourseCatalogPage = lazy(() => import('@/pages/training/CourseCatalogPage'));
export const MyLearningPage = lazy(() => import('@/pages/training/MyLearningPage'));
export const CourseViewerPage = lazy(() => import('@/pages/training/CourseViewerPage'));
export const QuizPage = lazy(() => import('@/pages/training/QuizPage'));
export const CertificationsPage = lazy(() => import('@/pages/training/CertificationsPage'));
export const LiveSessionsPage = lazy(() => import('@/pages/training/LiveSessionsPage'));
export const TrainingCalendarPage = lazy(() => import('@/pages/training/TrainingCalendarPage'));
export const CompetencyGapAnalysisPage = lazy(() => import('@/pages/training/CompetencyGapAnalysisPage'));
export const TrainingRequestsPage = lazy(() => import('@/pages/training/TrainingRequestsPage'));
export const ExternalTrainingPage = lazy(() => import('@/pages/training/ExternalTrainingPage'));
export const TrainingBudgetsPage = lazy(() => import('@/pages/training/TrainingBudgetsPage'));
export const InstructorsPage = lazy(() => import('@/pages/training/InstructorsPage'));
export const TrainingEvaluationsPage = lazy(() => import('@/pages/training/TrainingEvaluationsPage'));
export const LearningPathsPage = lazy(() => import('@/pages/training/LearningPathsPage'));
export const ComplianceTrainingPage = lazy(() => import('@/pages/training/ComplianceTrainingPage'));
export const InteractiveTrainingPage = lazy(() => import('@/pages/training/InteractiveTrainingPage'));
export const InteractiveTrainingAdminPage = lazy(() => import('@/pages/training/InteractiveTrainingAdminPage'));
export const CourseCompetenciesPage = lazy(() => import('@/pages/training/CourseCompetenciesPage'));
export const RecertificationPage = lazy(() => import('@/pages/training/RecertificationPage'));
export const TrainingNeedsPage = lazy(() => import('@/pages/training/TrainingNeedsPage'));
export const TrainingAnalyticsPage = lazy(() => import('@/pages/training/TrainingAnalyticsPage'));
export const VirtualClassroomPage = lazy(() => import('@/pages/training/VirtualClassroomPage'));
export const ContentAuthoringPage = lazy(() => import('@/pages/training/ContentAuthoringPage'));
export const EmployeeLearningPage = lazy(() => import('@/pages/training/EmployeeLearningPage'));
export const EmployeeCertificationsPage = lazy(() => import('@/pages/training/EmployeeCertificationsPage'));
export const TrainingCareerPathsPage = lazy(() => import('@/pages/training/TrainingCareerPathsPage'));
export const TrainingMentorshipPage = lazy(() => import('@/pages/training/TrainingMentorshipPage'));

// Succession pages
export const SuccessionDashboardPage = lazy(() => import('@/pages/succession/SuccessionDashboardPage'));
export const NineBoxPage = lazy(() => import('@/pages/succession/NineBoxPage'));
export const NineBoxConfigPage = lazy(() => import('@/pages/succession/NineBoxConfigPage'));
export const TalentPoolsPage = lazy(() => import('@/pages/succession/TalentPoolsPage'));
export const SuccessionPlansPage = lazy(() => import('@/pages/succession/SuccessionPlansPage'));
export const KeyPositionsPage = lazy(() => import('@/pages/succession/KeyPositionsPage'));
export const CareerDevelopmentPage = lazy(() => import('@/pages/succession/CareerDevelopmentPage'));
export const CareerPathsPage = lazy(() => import('@/pages/succession/CareerPathsPage'));
export const MentorshipPage = lazy(() => import('@/pages/succession/MentorshipPage'));
export const FlightRiskPage = lazy(() => import('@/pages/succession/FlightRiskPage'));
export const BenchStrengthPage = lazy(() => import('@/pages/succession/BenchStrengthPage'));
export const SuccessionAnalyticsPage = lazy(() => import('@/pages/succession/SuccessionAnalyticsPage'));

// Recruitment pages
export const RecruitmentDashboardPage = lazy(() => import('@/pages/recruitment/RecruitmentDashboardPage'));
export const RecruitmentFullPage = lazy(() => import('@/pages/recruitment/RecruitmentFullPage'));
export const RecruitmentAnalyticsPage = lazy(() => import('@/pages/recruitment/RecruitmentAnalyticsPage'));
export const RequisitionsPage = lazy(() => import('@/pages/recruitment/RequisitionsPage'));
export const CandidatesPage = lazy(() => import('@/pages/recruitment/CandidatesPage'));
export const ApplicationsPage = lazy(() => import('@/pages/recruitment/ApplicationsPage'));
export const PipelinePage = lazy(() => import('@/pages/recruitment/PipelinePage'));
export const ScorecardsPage = lazy(() => import('@/pages/recruitment/ScorecardsPage'));
export const OffersPage = lazy(() => import('@/pages/recruitment/OffersPage'));
export const ReferralsPage = lazy(() => import('@/pages/recruitment/ReferralsPage'));
export const AssessmentsPage = lazy(() => import('@/pages/recruitment/AssessmentsPage'));
export const InterviewPanelsPage = lazy(() => import('@/pages/recruitment/InterviewPanelsPage'));
export const EmailTemplatesPage = lazy(() => import('@/pages/recruitment/EmailTemplatesPage'));
export const SourcesPage = lazy(() => import('@/pages/recruitment/SourcesPage'));
export const JobBoardsPage = lazy(() => import('@/pages/recruitment/JobBoardsPage'));

// HSE pages
export const HSEDashboardPage = lazy(() => import('@/pages/hse/HSEDashboardPage'));
export const HSEIncidentsPage = lazy(() => import('@/pages/hse/HSEIncidentsPage'));
export const HSERiskAssessmentPage = lazy(() => import('@/pages/hse/HSERiskAssessmentPage'));
export const HSESafetyTrainingPage = lazy(() => import('@/pages/hse/HSESafetyTrainingPage'));
export const HSECompliancePage = lazy(() => import('@/pages/hse/HSECompliancePage'));
export const HSESafetyPoliciesPage = lazy(() => import('@/pages/hse/HSESafetyPoliciesPage'));
export const HSEWorkersCompPage = lazy(() => import('@/pages/hse/HSEWorkersCompPage'));
export const HSEPPEManagementPage = lazy(() => import('@/pages/hse/HSEPPEManagementPage'));
export const HSEInspectionsPage = lazy(() => import('@/pages/hse/HSEInspectionsPage'));
export const HSEEmergencyResponsePage = lazy(() => import('@/pages/hse/HSEEmergencyResponsePage'));
export const HSEChemicalsPage = lazy(() => import('@/pages/hse/HSEChemicalsPage'));
export const HSEOshaReportingPage = lazy(() => import('@/pages/hse/HSEOshaReportingPage'));
export const HSEPermitToWorkPage = lazy(() => import('@/pages/hse/HSEPermitToWorkPage'));
export const HSELotoPage = lazy(() => import('@/pages/hse/HSELotoPage'));
export const HSENearMissPage = lazy(() => import('@/pages/hse/HSENearMissPage'));
export const HSESafetyObservationsPage = lazy(() => import('@/pages/hse/HSESafetyObservationsPage'));
export const HSEToolboxTalksPage = lazy(() => import('@/pages/hse/HSEToolboxTalksPage'));
export const HSEFirstAidPage = lazy(() => import('@/pages/hse/HSEFirstAidPage'));
export const HSEErgonomicsPage = lazy(() => import('@/pages/hse/HSEErgonomicsPage'));
export const HSEAnalyticsPage = lazy(() => import('@/pages/hse/HSEAnalyticsPage'));

// Employee Relations pages
export const EmployeeRelationsDashboardPage = lazy(() => import('@/pages/employee-relations/EmployeeRelationsDashboardPage'));
export const ERAnalyticsPage = lazy(() => import('@/pages/employee-relations/ERAnalyticsPage'));
export const ERCasesPage = lazy(() => import('@/pages/employee-relations/ERCasesPage'));
export const ERDisciplinaryPage = lazy(() => import('@/pages/employee-relations/ERDisciplinaryPage'));
export const ERRecognitionPage = lazy(() => import('@/pages/employee-relations/ERRecognitionPage'));
export const ERExitInterviewsPage = lazy(() => import('@/pages/employee-relations/ERExitInterviewsPage'));
export const ERSurveysPage = lazy(() => import('@/pages/employee-relations/ERSurveysPage'));
export const ERWellnessPage = lazy(() => import('@/pages/employee-relations/ERWellnessPage'));
export const ERUnionsPage = lazy(() => import('@/pages/employee-relations/ERUnionsPage'));
export const ERGrievancesPage = lazy(() => import('@/pages/employee-relations/ERGrievancesPage'));
export const ERCourtJudgementsPage = lazy(() => import('@/pages/employee-relations/ERCourtJudgementsPage'));
export const CBADetailPage = lazy(() => import('@/pages/employee-relations/CBADetailPage'));

// Property pages
export const PropertyDashboardPage = lazy(() => import('@/pages/property/PropertyDashboardPage'));
export const PropertyAnalyticsPage = lazy(() => import('@/pages/property/PropertyAnalyticsPage'));
export const PropertyAssetsPage = lazy(() => import('@/pages/property/PropertyAssetsPage'));
export const PropertyAssignmentsPage = lazy(() => import('@/pages/property/PropertyAssignmentsPage'));
export const PropertyRequestsPage = lazy(() => import('@/pages/property/PropertyRequestsPage'));
export const PropertyMaintenancePage = lazy(() => import('@/pages/property/PropertyMaintenancePage'));
export const PropertyCategoriesPage = lazy(() => import('@/pages/property/PropertyCategoriesPage'));

// Payroll pages
export const PayrollDashboardPage = lazy(() => import('@/pages/payroll/PayrollDashboardPage'));
export const TaxAllowancesPage = lazy(() => import('@/pages/payroll/TaxAllowancesPage'));
export const CountryPayrollYearSetupPage = lazy(() => import('@/pages/payroll/CountryPayrollYearSetupPage'));
export const BankFileBuilderPage = lazy(() => import('@/pages/payroll/BankFileBuilderPage'));
export const PayGroupsPage = lazy(() => import('@/pages/payroll/PayGroupsPage'));
export const SemiMonthlyPayrollRulesPage = lazy(() => import('@/pages/payroll/SemiMonthlyPayrollRulesPage'));
export const CountryTaxSettingsPage = lazy(() => import('@/pages/payroll/CountryTaxSettingsPage'));
export const TipPoolManagementPage = lazy(() => import('@/pages/payroll/TipPoolManagementPage'));
export const StatutoryTaxReliefPage = lazy(() => import('@/pages/payroll/StatutoryTaxReliefPage'));
export const TaxReliefSchemesPage = lazy(() => import('@/pages/payroll/TaxReliefSchemesPage'));
export const PayPeriodsPage = lazy(() => import('@/pages/payroll/PayPeriodsPage'));
export const PayrollProcessingPage = lazy(() => import('@/pages/payroll/PayrollProcessingPage'));
export const OffCyclePayrollPage = lazy(() => import('@/pages/payroll/OffCyclePayrollPage'));
export const TaxConfigPage = lazy(() => import('@/pages/payroll/TaxConfigPage'));
export const PayrollReportsPage = lazy(() => import('@/pages/payroll/PayrollReportsPage'));
export const YearEndProcessingPage = lazy(() => import('@/pages/payroll/YearEndProcessingPage'));
export const YearEndPayrollClosingPage = lazy(() => import('@/pages/payroll/YearEndPayrollClosingPage'));
export const StatutoryDeductionTypesPage = lazy(() => import('@/pages/payroll/StatutoryDeductionTypesPage'));
export const PayslipsPage = lazy(() => import('@/pages/payroll/PayslipsPage'));
export const PayPeriodPayrollEntriesPage = lazy(() => import('@/pages/payroll/PayPeriodPayrollEntriesPage'));
export const EmployeeRegularDeductionsPage = lazy(() => import('@/pages/payroll/EmployeeRegularDeductionsPage'));
export const OverpaymentRecoveryPage = lazy(() => import('@/pages/payroll/OverpaymentRecoveryPage'));
export const LeavePaymentConfigPage = lazy(() => import('@/pages/payroll/LeavePaymentConfigPage'));
export const LeaveBalanceBuyoutPage = lazy(() => import('@/pages/payroll/LeaveBalanceBuyoutPage'));
export const PayslipTemplateConfigPage = lazy(() => import('@/pages/payroll/PayslipTemplateConfigPage'));
export const PayrollExpenseClaimsPage = lazy(() => import('@/pages/payroll/PayrollExpenseClaimsPage'));
export const PayrollArchiveSettingsPage = lazy(() => import('@/pages/payroll/PayrollArchiveSettingsPage'));
export const MexicoPayrollPage = lazy(() => import('@/pages/payroll/MexicoPayrollPage'));
export const BenefitPayrollMappingsPage = lazy(() => import('@/pages/payroll/BenefitPayrollMappingsPage'));
export const EmployeeTransactionPayrollMappingsPage = lazy(() => import('@/pages/payroll/EmployeeTransactionPayrollMappingsPage'));
export const StatutoryPayElementMappingsPage = lazy(() => import('@/pages/payroll/StatutoryPayElementMappingsPage'));
export const PayrollHolidaysPage = lazy(() => import('@/pages/payroll/PayrollHolidaysPage'));
export const OpeningBalancesPage = lazy(() => import('@/pages/payroll/OpeningBalancesPage'));
export const HistoricalPayrollImportPage = lazy(() => import('@/pages/payroll/HistoricalPayrollImportPage'));
export const RetroactivePayConfigPage = lazy(() => import('@/pages/payroll/RetroactivePayConfigPage'));
export const RetroactivePayGeneratePage = lazy(() => import('@/pages/payroll/RetroactivePayGeneratePage'));
export const PayrollCountryDocumentationPage = lazy(() => import('@/pages/payroll/PayrollCountryDocumentationPage'));
export const SalaryAdvancesPage = lazy(() => import('@/pages/payroll/SalaryAdvancesPage'));
export const SavingsProgramsPage = lazy(() => import('@/pages/payroll/SavingsProgramsPage'));
export const TimePayrollSyncPage = lazy(() => import('@/pages/payroll/TimePayrollSyncPage'));
export const PaymentRulesConfigPage = lazy(() => import('@/pages/payroll/PaymentRulesConfigPage'));
export const MultiCompanyConsolidationPage = lazy(() => import('@/pages/payroll/MultiCompanyConsolidationPage'));
export const PayrollLoansPage = lazy(() => import('@/pages/payroll/PayrollLoansPage'));
export const VariableCompensationPage = lazy(() => import('@/pages/payroll/VariableCompensationPage'));
export const TimeAttendanceIntegrationPage = lazy(() => import('@/pages/payroll/TimeAttendanceIntegrationPage'));
export const PayrollBudgetingPage = lazy(() => import('@/pages/payroll/PayrollBudgetingPage'));
export const PayrollSimulationsPage = lazy(() => import('@/pages/payroll/PayrollSimulationsPage'));
export const BatchOperationsPage = lazy(() => import('@/pages/payroll/BatchOperationsPage'));
export const VacationManagerPage = lazy(() => import('@/pages/payroll/VacationManagerPage'));
export const SeveranceCalculatorPage = lazy(() => import('@/pages/payroll/SeveranceCalculatorPage'));
export const PayrollTemplatesPage = lazy(() => import('@/pages/payroll/PayrollTemplatesPage'));
export const IntegrationWebhooksPage = lazy(() => import('@/pages/payroll/IntegrationWebhooksPage'));

// GL pages
export const GLDashboardPage = lazy(() => import('@/pages/payroll/gl/GLDashboardPage'));
export const GLAccountsPage = lazy(() => import('@/pages/payroll/gl/GLAccountsPage'));
export const CostCenterSegmentsPage = lazy(() => import('@/pages/payroll/gl/CostCenterSegmentsPage'));
export const CostCentersPage = lazy(() => import('@/pages/payroll/gl/CostCentersPage'));
export const CostReallocationsPage = lazy(() => import('@/pages/payroll/gl/CostReallocationsPage'));
export const GLAccountMappingsPage = lazy(() => import('@/pages/payroll/gl/GLAccountMappingsPage'));
export const GLJournalBatchesPage = lazy(() => import('@/pages/payroll/gl/GLJournalBatchesPage'));
export const EntitySegmentMappingsPage = lazy(() => import('@/pages/payroll/gl/EntitySegmentMappingsPage'));
export const GLOverrideRulesPage = lazy(() => import('@/pages/payroll/gl/GLOverrideRulesPage'));

// Time & Attendance pages
export const TimeAttendanceDashboardPage = lazy(() => import('@/pages/time-attendance/TimeAttendanceDashboardPage'));
export const TimeTrackingPage = lazy(() => import('@/pages/time-attendance/TimeTrackingPage'));
export const AttendanceRecordsPage = lazy(() => import('@/pages/time-attendance/AttendanceRecordsPage'));
export const SchedulesPage = lazy(() => import('@/pages/time-attendance/SchedulesPage'));
export const OvertimeManagementPage = lazy(() => import('@/pages/time-attendance/OvertimeManagementPage'));
export const ShiftManagementPage = lazy(() => import('@/pages/time-attendance/ShiftManagementPage'));
export const ShiftsPage = lazy(() => import('@/pages/time-attendance/shifts/ShiftsPage'));
export const RoundingRulesPage = lazy(() => import('@/pages/time-attendance/shifts/RoundingRulesPage'));
export const PaymentRulesPage = lazy(() => import('@/pages/time-attendance/shifts/PaymentRulesPage'));
export const ShiftAssignmentsPage = lazy(() => import('@/pages/time-attendance/shifts/ShiftAssignmentsPage'));
export const ShiftCalendarPage = lazy(() => import('@/pages/time-attendance/shifts/ShiftCalendarPage'));
export const ShiftSwapRequestsPage = lazy(() => import('@/pages/time-attendance/shifts/ShiftSwapRequestsPage'));
export const OpenShiftBoardPage = lazy(() => import('@/pages/time-attendance/shifts/OpenShiftBoardPage'));
export const ShiftTemplatesPage = lazy(() => import('@/pages/time-attendance/shifts/ShiftTemplatesPage'));
export const RotationPatternsPage = lazy(() => import('@/pages/time-attendance/shifts/RotationPatternsPage'));
export const FatigueManagementPage = lazy(() => import('@/pages/time-attendance/shifts/FatigueManagementPage'));
export const ShiftCoveragePage = lazy(() => import('@/pages/time-attendance/shifts/ShiftCoveragePage'));
export const ShiftBiddingPage = lazy(() => import('@/pages/time-attendance/shifts/ShiftBiddingPage'));
export const AISchedulerPage = lazy(() => import('@/pages/time-attendance/shifts/AISchedulerPage'));
export const MultiLocationSchedulePage = lazy(() => import('@/pages/time-attendance/shifts/MultiLocationSchedulePage'));
export const GeofenceManagementPage = lazy(() => import('@/pages/time-attendance/GeofenceManagementPage'));
export const ProjectTimeTrackingPage = lazy(() => import('@/pages/time-attendance/ProjectTimeTrackingPage'));
export const TimesheetApprovalsPage = lazy(() => import('@/pages/time-attendance/TimesheetApprovalsPage'));
export const TimeclockDevicesPage = lazy(() => import('@/pages/time-attendance/TimeclockDevicesPage'));
export const AttendancePoliciesPage = lazy(() => import('@/pages/time-attendance/AttendancePoliciesPage'));
export const AttendanceExceptionsPage = lazy(() => import('@/pages/time-attendance/AttendanceExceptionsPage'));
export const LiveAttendancePage = lazy(() => import('@/pages/time-attendance/LiveAttendancePage'));
export const PunchImportPage = lazy(() => import('@/pages/time-attendance/PunchImportPage'));
export const AttendanceAnalyticsPage = lazy(() => import('@/pages/time-attendance/AttendanceAnalyticsPage'));
export const AbsenteeismCostPage = lazy(() => import('@/pages/time-attendance/AbsenteeismCostPage'));
export const WellnessMonitoringPage = lazy(() => import('@/pages/time-attendance/WellnessMonitoringPage'));
export const OvertimeAlertsPage = lazy(() => import('@/pages/time-attendance/OvertimeAlertsPage'));
export const LaborCompliancePage = lazy(() => import('@/pages/time-attendance/LaborCompliancePage'));
export const FlexTimePage = lazy(() => import('@/pages/time-attendance/FlexTimePage'));
export const AttendanceRegularizationPage = lazy(() => import('@/pages/time-attendance/AttendanceRegularizationPage'));
export const CBATimeRulesPage = lazy(() => import('@/pages/time-attendance/CBATimeRulesPage'));
export const CBAExtensionsPage = lazy(() => import('@/pages/time-attendance/CBAExtensionsPage'));
export const TimeAuditTrailPage = lazy(() => import('@/pages/time-attendance/TimeAuditTrailPage'));
export const ShiftSwapsPage = lazy(() => import('@/pages/time-attendance/ShiftSwapsPage'));

// Time pages
export const ShiftDifferentialsPage = lazy(() => import('@/pages/time/ShiftDifferentialsPage'));
export const GeofenceLocationsPage = lazy(() => import('@/pages/time/GeofenceLocationsPage'));
export const FaceVerificationPage = lazy(() => import('@/pages/time/FaceVerificationPage'));
export const ProjectCostDashboardPage = lazy(() => import('@/pages/time/ProjectCostDashboardPage'));
export const ProjectCostConfigPage = lazy(() => import('@/pages/time/ProjectCostConfigPage'));
export const CostAllocationPage = lazy(() => import('@/pages/time/CostAllocationPage'));

// ESS pages
export const EmployeeSelfServicePage = lazy(() => import('@/pages/ess/EmployeeSelfServicePage'));
export const MyLettersPage = lazy(() => import('@/pages/ess/MyLettersPage'));
export const MyGoalsPage = lazy(() => import('@/pages/ess/MyGoalsPage'));
export const MyOnboardingPage = lazy(() => import('@/pages/ess/MyOnboardingPage'));
export const MyOffboardingPage = lazy(() => import('@/pages/ess/MyOffboardingPage'));
export const MyPropertyPage = lazy(() => import('@/pages/ess/MyPropertyPage'));
export const MyEmployeeRelationsPage = lazy(() => import('@/pages/ess/MyEmployeeRelationsPage'));
export const EssLeavePage = lazy(() => import('@/pages/ess/EssLeavePage'));
export const EssJobOpeningsPage = lazy(() => import('@/pages/ess/EssJobOpeningsPage'));
export const MyHSEPage = lazy(() => import('@/pages/ess/MyHSEPage'));
export const MyTrainingPage = lazy(() => import('@/pages/ess/MyTrainingPage'));
export const EssAppraisalInterviewsPage = lazy(() => import('@/pages/ess/EssAppraisalInterviewsPage'));
export const EssGoalInterviewsPage = lazy(() => import('@/pages/ess/EssGoalInterviewsPage'));
export const MyDevelopmentPlanPage = lazy(() => import('@/pages/ess/MyDevelopmentPlanPage'));
export const MyAppraisalsPage = lazy(() => import('@/pages/ess/MyAppraisalsPage'));
export const MySkillGapsPage = lazy(() => import('@/pages/ess/MySkillGapsPage'));
export const MyFeedbackPage = lazy(() => import('@/pages/ess/MyFeedbackPage'));
export const MyRecognitionPage = lazy(() => import('@/pages/ess/MyRecognitionPage'));
export const MyBenefitsPage = lazy(() => import('@/pages/ess/MyBenefitsPage'));
export const MyBankingPage = lazy(() => import('@/pages/ess/MyBankingPage'));
export const MyPersonalInfoPage = lazy(() => import('@/pages/ess/MyPersonalInfoPage'));
export const MyDependentsPage = lazy(() => import('@/pages/ess/MyDependentsPage'));
export const MyTransactionsPage = lazy(() => import('@/pages/ess/MyTransactionsPage'));
export const MyInboxPage = lazy(() => import('@/pages/ess/MyInboxPage'));
export const EssCompensationPage = lazy(() => import('@/pages/ess/EssCompensationPage'));
export const EssCompensationHistoryPage = lazy(() => import('@/pages/ess/EssCompensationHistoryPage'));
export const EssTotalRewardsPage = lazy(() => import('@/pages/ess/EssTotalRewardsPage'));
export const EssEquityPage = lazy(() => import('@/pages/ess/EssEquityPage'));
export const EssCompaRatioPage = lazy(() => import('@/pages/ess/EssCompaRatioPage'));
export const EssCurrencyPreferencesPage = lazy(() => import('@/pages/ess/EssCurrencyPreferencesPage'));
export const MyTimeAttendancePage = lazy(() => import('@/pages/ess/MyTimeAttendancePage'));
export const MyTimesheetsPage = lazy(() => import('@/pages/ess/MyTimesheetsPage'));
export const MyExpenseClaimsPage = lazy(() => import('@/pages/ess/MyExpenseClaimsPage'));
export const AnnouncementsPage = lazy(() => import('@/pages/ess/AnnouncementsPage'));
export const TeamCalendarPage = lazy(() => import('@/pages/ess/TeamCalendarPage'));
export const MyCalendarPage = lazy(() => import('@/pages/ess/MyCalendarPage'));
export const MilestonesPage = lazy(() => import('@/pages/ess/MilestonesPage'));
export const MyQualificationsPage = lazy(() => import('@/pages/ess/MyQualificationsPage'));
export const MyCompetenciesPage = lazy(() => import('@/pages/ess/MyCompetenciesPage'));
export const MyInterestsPage = lazy(() => import('@/pages/ess/MyInterestsPage'));
export const MyGovernmentIdsPage = lazy(() => import('@/pages/ess/MyGovernmentIdsPage'));
export const MyImmigrationPage = lazy(() => import('@/pages/ess/MyImmigrationPage'));
export const MyMedicalInfoPage = lazy(() => import('@/pages/ess/MyMedicalInfoPage'));
export const MyEvidencePortfolioPage = lazy(() => import('@/pages/ess/MyEvidencePortfolioPage'));
export const MyCareerPathsPage = lazy(() => import('@/pages/ess/MyCareerPathsPage'));
export const MyCareerPlanPage = lazy(() => import('@/pages/ess/MyCareerPlanPage'));
export const MyMentorshipPage = lazy(() => import('@/pages/ess/MyMentorshipPage'));
export const EssNotificationPreferencesPage = lazy(() => import('@/pages/ess/NotificationPreferencesPage'));
export const MyRemindersPage = lazy(() => import('@/pages/ess/MyRemindersPage'));
export const MyChangeRequestsPage = lazy(() => import('@/pages/ess/MyChangeRequestsPage'));

// MSS pages
export const ManagerSelfServicePage = lazy(() => import('@/pages/mss/ManagerSelfServicePage'));
export const MssAppraisalsPage = lazy(() => import('@/pages/mss/MssAppraisalsPage'));
export const MssAppraisalInterviewsPage = lazy(() => import('@/pages/mss/MssAppraisalInterviewsPage'));
export const MssGoalInterviewsPage = lazy(() => import('@/pages/mss/MssGoalInterviewsPage'));
export const MssReview360Page = lazy(() => import('@/pages/mss/MssReview360Page'));
export const MssGoalsPage = lazy(() => import('@/pages/mss/MssGoalsPage'));
export const MssOnboardingPage = lazy(() => import('@/pages/mss/MssOnboardingPage'));
export const MssOffboardingPage = lazy(() => import('@/pages/mss/MssOffboardingPage'));
export const MssTeamPage = lazy(() => import('@/pages/mss/MssTeamPage'));
export const MssTeamMemberPage = lazy(() => import('@/pages/mss/MssTeamMemberPage'));
export const MssPropertyPage = lazy(() => import('@/pages/mss/MssPropertyPage'));
export const MssEmployeeRelationsPage = lazy(() => import('@/pages/mss/MssEmployeeRelationsPage'));
export const MssLeavePage = lazy(() => import('@/pages/mss/MssLeavePage'));
export const MssBenefitsPage = lazy(() => import('@/pages/mss/MssBenefitsPage'));
export const MssHSEPage = lazy(() => import('@/pages/mss/MssHSEPage'));
export const MssRecruitmentPage = lazy(() => import('@/pages/mss/MssRecruitmentPage'));
export const MssTrainingPage = lazy(() => import('@/pages/mss/MssTrainingPage'));
export const MssDevelopmentPlansPage = lazy(() => import('@/pages/mss/MssDevelopmentPlansPage'));
export const MssFeedbackPage = lazy(() => import('@/pages/mss/MssFeedbackPage'));
export const MssRecognitionPage = lazy(() => import('@/pages/mss/MssRecognitionPage'));
export const MssPipsPage = lazy(() => import('@/pages/mss/MssPipsPage'));
export const MssCalibrationPage = lazy(() => import('@/pages/mss/MssCalibrationPage'));
export const MssCompensationPage = lazy(() => import('@/pages/mss/MssCompensationPage'));
export const MssCompaRatioPage = lazy(() => import('@/pages/mss/MssCompaRatioPage'));
export const MssEquityPage = lazy(() => import('@/pages/mss/MssEquityPage'));
export const MssAnalyticsPage = lazy(() => import('@/pages/mss/MssAnalyticsPage'));
export const MssSuccessionPage = lazy(() => import('@/pages/mss/MssSuccessionPage'));
export const MssTimeAttendancePage = lazy(() => import('@/pages/mss/MssTimeAttendancePage'));
export const MssRemindersPage = lazy(() => import('@/pages/mss/MssRemindersPage'));

// HR Hub pages
export const HRHubDashboardPage = lazy(() => import('@/pages/hr-hub/HRHubDashboardPage'));
export const HRCalendarPage = lazy(() => import('@/pages/hr-hub/HRCalendarPage'));
export const HRTasksPage = lazy(() => import('@/pages/hr-hub/HRTasksPage'));
export const ESSChangeRequestsPage = lazy(() => import('@/pages/hr/ESSChangeRequestsPage'));
export const ESSApprovalPoliciesPage = lazy(() => import('@/pages/hr-hub/ESSApprovalPoliciesPage'));
export const HRMilestonesPage = lazy(() => import('@/pages/hr-hub/HRMilestonesPage'));
export const ComplianceTrackerPage = lazy(() => import('@/pages/hr-hub/ComplianceTrackerPage'));
export const HRRemindersPage = lazy(() => import('@/pages/hr-hub/HRRemindersPage'));
export const SOPManagementPage = lazy(() => import('@/pages/hr-hub/SOPManagementPage'));
export const GovernmentIdTypesPage = lazy(() => import('@/pages/hr-hub/GovernmentIdTypesPage'));
export const HRDataImportPage = lazy(() => import('@/pages/hr-hub/HRDataImportPage'));
export const SentimentMonitoringPage = lazy(() => import('@/pages/hr-hub/SentimentMonitoringPage'));
export const RecognitionAnalyticsPage = lazy(() => import('@/pages/hr-hub/RecognitionAnalyticsPage'));
export const IntegrationDashboardPage = lazy(() => import('@/pages/hr-hub/IntegrationDashboardPage'));
export const TransactionWorkflowSettingsPage = lazy(() => import('@/pages/hr-hub/TransactionWorkflowSettingsPage'));
export const IntranetAdminPage = lazy(() => import('@/pages/hr-hub/IntranetAdminPage'));
export const CompanyCommunicationsPage = lazy(() => import('@/pages/hr-hub/CompanyCommunicationsPage'));

// Strategic Planning pages
export const StrategicPlanningHubPage = lazy(() => import('@/pages/strategic-planning/StrategicPlanningHubPage'));
export const OrgDesignPage = lazy(() => import('@/pages/strategic-planning/OrgDesignPage'));
export const ScenarioPlanningPage = lazy(() => import('@/pages/strategic-planning/ScenarioPlanningPage'));

// Reporting & Analytics pages
export const ReportingHubPage = lazy(() => import('@/pages/reporting/ReportingHubPage'));
export const DashboardsPage = lazy(() => import('@/pages/reporting/DashboardsPage'));
export const ReportBuilderPage = lazy(() => import('@/pages/reporting/ReportBuilderPage'));
export const AIInsightsPage = lazy(() => import('@/pages/reporting/AIInsightsPage'));
export const DataExportPage = lazy(() => import('@/pages/reporting/DataExportPage'));

// Insights pages
export const TalentInsightsPage = lazy(() => import('@/pages/insights/TalentInsightsPage'));
export const CompensationInsightsPage = lazy(() => import('@/pages/insights/CompensationInsightsPage'));
export const OperationalInsightsPage = lazy(() => import('@/pages/insights/OperationalInsightsPage'));

// System & Integration pages
export const SystemHubPage = lazy(() => import('@/pages/system/SystemHubPage'));
export const AgentManagementHubPage = lazy(() => import('@/pages/system/AgentManagementHubPage'));
export const APIManagementPage = lazy(() => import('@/pages/system/APIManagementPage'));
export const SystemAuditLogsPage = lazy(() => import('@/pages/system/AuditLogsPage'));
export const SecuritySettingsPage = lazy(() => import('@/pages/system/SecuritySettingsPage'));
export const SystemConfigPage = lazy(() => import('@/pages/system/SystemConfigPage'));

// Profile pages
export const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
export const MyPermissionsPage = lazy(() => import('@/pages/profile/MyPermissionsPage'));
export const NotificationPreferencesPage = lazy(() => import('@/pages/profile/NotificationPreferencesPage'));
export const PrivacySettingsPage = lazy(() => import('@/pages/profile/PrivacySettingsPage'));

// Help Center pages
export const HelpCenterPage = lazy(() => import('@/pages/help/HelpCenterPage'));
export const HelpChatPage = lazy(() => import('@/pages/help/HelpChatPage'));
export const KnowledgeBasePage = lazy(() => import('@/pages/help/KnowledgeBasePage'));
export const TicketsPage = lazy(() => import('@/pages/help/TicketsPage'));
export const NewTicketPage = lazy(() => import('@/pages/help/NewTicketPage'));
export const TicketDetailPage = lazy(() => import('@/pages/help/TicketDetailPage'));
export const ArticleVersionHistoryPage = lazy(() => import('@/pages/help/ArticleVersionHistoryPage'));

// Messaging pages
export const MessagingPage = lazy(() => import('@/pages/messaging/MessagingPage'));

// Workflow pages
export const MyApprovalsPage = lazy(() => import('@/pages/workflow/MyApprovalsPage'));
export const MyDelegatesPage = lazy(() => import('@/pages/workflow/MyDelegatesPage'));

// Intranet pages
export const IntranetDashboardPage = lazy(() => import('@/pages/intranet/IntranetDashboardPage'));

// Document pages
export const StaffLoanDesignDocumentPage = lazy(() => import('@/pages/documents/StaffLoanDesignDocumentPage'));

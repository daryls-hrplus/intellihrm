import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationsProvider } from "@/components/TranslationsProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnablementAccessGuard } from "@/components/auth/EnablementAccessGuard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import MFAChallengePage from "./pages/auth/MFAChallengePage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Initialize i18n
import "@/i18n";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCompaniesPage from "./pages/admin/AdminCompaniesPage";
import AdminCompanyGroupsPage from "./pages/admin/AdminCompanyGroupsPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminAIUsagePage from "./pages/admin/AdminAIUsagePage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import RoleManagementPage from "./pages/admin/RoleManagementPage";
import RoleDetailPage from "./pages/admin/RoleDetailPage";
import AdminPiiAccessPage from "./pages/admin/AdminPiiAccessPage";
import AISecurityViolationsPage from "./pages/admin/AISecurityViolationsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminPermissionsSummaryPage from "./pages/admin/AdminPermissionsSummaryPage";
import AdminAccessRequestsPage from "./pages/admin/AdminAccessRequestsPage";
import AdminAutoApprovalPage from "./pages/admin/AdminAutoApprovalPage";
import AdminBulkImportPage from "./pages/admin/AdminBulkImportPage";
import OrgStructureConfigPage from "./pages/workforce/OrgStructureConfigPage";
import AdminScheduledReportsPage from "./pages/admin/AdminScheduledReportsPage";
import AdminKnowledgeBasePage from "./pages/admin/AdminKnowledgeBasePage";
import AdminHelpdeskPage from "./pages/admin/AdminHelpdeskPage";
import AdminPolicyDocumentsPage from "./pages/admin/AdminPolicyDocumentsPage";
import AdminLetterTemplatesPage from "./pages/admin/AdminLetterTemplatesPage";
import AdminLookupValuesPage from "./pages/admin/AdminLookupValuesPage";
import AdminLmsManagementPage from "./pages/admin/AdminLmsManagementPage";
import AdminOnboardingPage from "./pages/admin/AdminOnboardingPage";
import AdminOnboardingDetailPage from "./pages/admin/AdminOnboardingDetailPage";
import AdminColorSchemePage from "./pages/admin/AdminColorSchemePage";
import TerritoriesPage from "./pages/admin/TerritoriesPage";
import CompanyTagsPage from "./pages/admin/CompanyTagsPage";
import GranularPermissionsPage from "./pages/admin/GranularPermissionsPage";
import ImplementationHandbookPage from "./pages/admin/ImplementationHandbookPage";
import FeaturesBrochurePage from "./pages/admin/FeaturesBrochurePage";
import AdminCustomFieldsPage from "./pages/admin/AdminCustomFieldsPage";
import ModulesBrochurePage from "./pages/admin/ModulesBrochurePage";
import CurrencyManagementPage from "./pages/admin/CurrencyManagementPage";
import SubscriptionManagementPage from "./pages/admin/SubscriptionManagementPage";
import MFASettingsPage from "./pages/admin/MFASettingsPage";
import SSOSettingsPage from "./pages/admin/SSOSettingsPage";
import PasswordPoliciesPage from "./pages/admin/PasswordPoliciesPage";
import StaffLoanDesignDocumentPage from "./pages/documents/StaffLoanDesignDocumentPage";
import AIGovernancePage from "./pages/admin/AIGovernancePage";
import TranslationsPage from "./pages/admin/TranslationsPage";

// Enablement pages
import EnablementHubPage from "./pages/enablement/EnablementHubPage";
import ApplicationDocsGeneratorPage from "./pages/enablement/ApplicationDocsGeneratorPage";
import FeatureCatalogPage from "./pages/enablement/FeatureCatalogPage";
import FeatureDatabasePage from "./pages/enablement/FeatureDatabasePage";
import TemplateLibraryPage from "./pages/enablement/TemplateLibraryPage";
import EnablementAnalyticsPage from "./pages/enablement/EnablementAnalyticsPage";
import SCORMGeneratorPage from "./pages/enablement/SCORMGeneratorPage";
import ReleaseCalendarPage from "./pages/enablement/ReleaseCalendarPage";
import EnablementSettingsPage from "./pages/enablement/EnablementSettingsPage";
import EnablementAIToolsPage from "./pages/enablement/EnablementAIToolsPage";
import EnablementGuidePage from "./pages/enablement/EnablementGuidePage";
import EnablementArtifactsPage from "./pages/enablement/EnablementArtifactsPage";
import ArtifactEditorPage from "./pages/enablement/ArtifactEditorPage";
import ArtifactDetailPage from "./pages/enablement/ArtifactDetailPage";
import ToursManagementPage from "./pages/enablement/ToursManagementPage";
import FeatureAuditDashboard from "./pages/enablement/FeatureAuditDashboard";
import ImplementationDetailPage from "./pages/enablement/ImplementationDetailPage";

// Subscription pages
import SubscriptionPage from "./pages/subscription/SubscriptionPage";
import UpgradePage from "./pages/subscription/UpgradePage";
// Workforce pages
import WorkforceDashboardPage from "./pages/workforce/WorkforceDashboardPage";
import EmployeesPage from "./pages/workforce/EmployeesPage";
import EmployeeProfilePage from "./pages/workforce/EmployeeProfilePage";
import PositionsPage from "./pages/workforce/PositionsPage";
import OrgStructurePage from "./pages/workforce/OrgStructurePage";
import DepartmentsPage from "./pages/workforce/DepartmentsPage";
import OrgChangesPage from "./pages/workforce/OrgChangesPage";
import EmployeeAssignmentsPage from "./pages/workforce/EmployeeAssignmentsPage";
import EmployeeTransactionsPage from "./pages/workforce/EmployeeTransactionsPage";
import WorkforceForecastingPage from "./pages/workforce/WorkforceForecastingPage";
import IntranetAdminPage from "./pages/hr-hub/IntranetAdminPage";
import JobFamiliesPage from "./pages/workforce/JobFamiliesPage";
import JobsPage from "./pages/workforce/JobsPage";
import CompetenciesPage from "./pages/workforce/CompetenciesPage";
import ResponsibilitiesPage from "./pages/workforce/ResponsibilitiesPage";
import CapabilityRegistryPage from "./pages/workforce/CapabilityRegistryPage";
import OffboardingPage from "./pages/workforce/OffboardingPage";
import WorkforceAnalyticsPage from "./pages/workforce/WorkforceAnalyticsPage";
import QualificationsPage from "./pages/workforce/QualificationsPage";
import CompanyBoardsPage from "./pages/workforce/CompanyBoardsPage";
import GovernancePage from "./pages/workforce/GovernancePage";
import PositionControlVacanciesPage from "./pages/workforce/PositionControlVacanciesPage";
import HeadcountRequestsPage from "./pages/workforce/HeadcountRequestsPage";
import HeadcountAnalyticsPage from "./pages/workforce/HeadcountAnalyticsPage";
import HeadcountForecastPage from "./pages/workforce/HeadcountForecastPage";
import DivisionsPage from "./pages/workforce/DivisionsPage";

// Intranet pages
import IntranetDashboardPage from "./pages/intranet/IntranetDashboardPage";

// Privacy pages
import PrivacySettingsPage from "./pages/profile/PrivacySettingsPage";

// Performance pages
import PerformanceDashboardPage from "./pages/performance/PerformanceDashboardPage";
import GoalsPage from "./pages/performance/GoalsPage";
import Review360Page from "./pages/performance/Review360Page";
import AppraisalsPage from "./pages/performance/AppraisalsPage";
import PerformanceImprovementPlansPage from "./pages/performance/PerformanceImprovementPlansPage";
import ContinuousFeedbackPage from "./pages/performance/ContinuousFeedbackPage";
import RecognitionAwardsPage from "./pages/performance/RecognitionAwardsPage";
import PerformanceAnalyticsPage from "./pages/performance/PerformanceAnalyticsPage";
import CalibrationSessionsPage from "./pages/performance/CalibrationSessionsPage";
import CalibrationWorkspacePage from "./pages/performance/CalibrationWorkspacePage";
import PerformanceSetupPage from "./pages/performance/PerformanceSetupPage";

// Leave pages
import LeaveDashboardPage from "./pages/leave/LeaveDashboardPage";
import LeaveTypesPage from "./pages/leave/LeaveTypesPage";
import LeaveAccrualRulesPage from "./pages/leave/LeaveAccrualRulesPage";
import LeaveRolloverRulesPage from "./pages/leave/LeaveRolloverRulesPage";
import LeaveScheduleConfigPage from "./pages/leave/LeaveScheduleConfigPage";
import MyLeavePage from "./pages/leave/MyLeavePage";
import ApplyLeavePage from "./pages/leave/ApplyLeavePage";
import LeaveApprovalsPage from "./pages/leave/LeaveApprovalsPage";
import LeaveHolidaysPage from "./pages/leave/LeaveHolidaysPage";
import LeaveBalanceRecalculationPage from "./pages/leave/LeaveBalanceRecalculationPage";
import LeaveAnalyticsPage from "./pages/leave/LeaveAnalyticsPage";
import CompensatoryTimePage from "./pages/leave/CompensatoryTimePage";
import CompTimePoliciesPage from "./pages/leave/CompTimePoliciesPage";
import LeaveCalendarPage from "./pages/leave/LeaveCalendarPage";
import LeaveBalanceAdjustmentsPage from "./pages/leave/LeaveBalanceAdjustmentsPage";
import EmployeeLeaveRecordsPage from "./pages/leave/EmployeeLeaveRecordsPage";
import EmployeeLeaveBalancesPage from "./pages/leave/EmployeeLeaveBalancesPage";
import LeaveYearsPage from "./pages/leave/LeaveYearsPage";

// Compensation pages
import CompensationDashboardPage from "./pages/compensation/CompensationDashboardPage";
import PayElementsPage from "./pages/compensation/PayElementsPage";
import SalaryGradesPage from "./pages/compensation/SalaryGradesPage";
import PositionCompensationPage from "./pages/compensation/PositionCompensationPage";
import CompensationHistoryPage from "./pages/compensation/CompensationHistoryPage";
import MeritCyclesPage from "./pages/compensation/MeritCyclesPage";
import BonusManagementPage from "./pages/compensation/BonusManagementPage";
import MarketBenchmarkingPage from "./pages/compensation/MarketBenchmarkingPage";
import PayEquityPage from "./pages/compensation/PayEquityPage";
import TotalRewardsPage from "./pages/compensation/TotalRewardsPage";
import CompensationBudgetsPage from "./pages/compensation/CompensationBudgetsPage";
import EquityManagementPage from "./pages/compensation/EquityManagementPage";
import CompaRatioPage from "./pages/compensation/CompaRatioPage";
import CompensationAnalyticsPage from "./pages/compensation/CompensationAnalyticsPage";
import SpinalPointsPage from "./pages/compensation/SpinalPointsPage";
import EmployeeCompensationPage from "./pages/compensation/EmployeeCompensationPage";
import PositionBudgetDashboardPage from "./pages/compensation/PositionBudgetDashboardPage";
import PositionBudgetPlanPage from "./pages/compensation/PositionBudgetPlanPage";
import PositionBudgetWhatIfPage from "./pages/compensation/PositionBudgetWhatIfPage";
import PositionBudgetApprovalsPage from "./pages/compensation/PositionBudgetApprovalsPage";
import PositionBudgetCostConfigPage from "./pages/compensation/PositionBudgetCostConfigPage";

// Benefits pages
import BenefitsDashboardPage from "./pages/benefits/BenefitsDashboardPage";
import BenefitCategoriesPage from "./pages/benefits/BenefitCategoriesPage";
import BenefitPlansPage from "./pages/benefits/BenefitPlansPage";
import BenefitEnrollmentsPage from "./pages/benefits/BenefitEnrollmentsPage";
import BenefitClaimsPage from "./pages/benefits/BenefitClaimsPage";
import BenefitAnalyticsPage from "./pages/benefits/BenefitAnalyticsPage";
import BenefitCostProjectionsPage from "./pages/benefits/BenefitCostProjectionsPage";
import AutoEnrollmentRulesPage from "./pages/benefits/AutoEnrollmentRulesPage";
import LifeEventManagementPage from "./pages/benefits/LifeEventManagementPage";
import WaitingPeriodTrackingPage from "./pages/benefits/WaitingPeriodTrackingPage";
import OpenEnrollmentTrackerPage from "./pages/benefits/OpenEnrollmentTrackerPage";
import EligibilityAuditPage from "./pages/benefits/EligibilityAuditPage";
import BenefitComplianceReportsPage from "./pages/benefits/BenefitComplianceReportsPage";
import PlanComparisonPage from "./pages/benefits/PlanComparisonPage";
import BenefitCalculatorPage from "./pages/benefits/BenefitCalculatorPage";
import BenefitProvidersPage from "./pages/benefits/BenefitProvidersPage";
import MyBenefitsPage from "./pages/ess/MyBenefitsPage";
import MyBankingPage from "./pages/ess/MyBankingPage";
import MyPersonalInfoPage from "./pages/ess/MyPersonalInfoPage";
import MyDependentsPage from "./pages/ess/MyDependentsPage";
import MyTransactionsPage from "./pages/ess/MyTransactionsPage";

// Training pages
import TrainingDashboardPage from "./pages/training/TrainingDashboardPage";
import CourseCatalogPage from "./pages/training/CourseCatalogPage";
import MyLearningPage from "./pages/training/MyLearningPage";
import CourseViewerPage from "./pages/training/CourseViewerPage";
import QuizPage from "./pages/training/QuizPage";
import CertificationsPage from "./pages/training/CertificationsPage";
import LiveSessionsPage from "./pages/training/LiveSessionsPage";
import TrainingCalendarPage from "./pages/training/TrainingCalendarPage";
import CompetencyGapAnalysisPage from "./pages/training/CompetencyGapAnalysisPage";
import TrainingRequestsPage from "./pages/training/TrainingRequestsPage";
import ExternalTrainingPage from "./pages/training/ExternalTrainingPage";
import TrainingBudgetsPage from "./pages/training/TrainingBudgetsPage";
import InstructorsPage from "./pages/training/InstructorsPage";
import TrainingEvaluationsPage from "./pages/training/TrainingEvaluationsPage";
import LearningPathsPage from "./pages/training/LearningPathsPage";
import ComplianceTrainingPage from "./pages/training/ComplianceTrainingPage";
import CourseCompetenciesPage from "./pages/training/CourseCompetenciesPage";
import RecertificationPage from "./pages/training/RecertificationPage";
import TrainingNeedsPage from "./pages/training/TrainingNeedsPage";
import TrainingAnalyticsPage from "./pages/training/TrainingAnalyticsPage";
import VirtualClassroomPage from "./pages/training/VirtualClassroomPage";
import ContentAuthoringPage from "./pages/training/ContentAuthoringPage";
import EmployeeLearningPage from "./pages/training/EmployeeLearningPage";
import EmployeeCertificationsPage from "./pages/training/EmployeeCertificationsPage";

// Succession pages
import SuccessionDashboardPage from "./pages/succession/SuccessionDashboardPage";
import NineBoxPage from "./pages/succession/NineBoxPage";
import TalentPoolsPage from "./pages/succession/TalentPoolsPage";
import SuccessionPlansPage from "./pages/succession/SuccessionPlansPage";
import KeyPositionsPage from "./pages/succession/KeyPositionsPage";
import CareerDevelopmentPage from "./pages/succession/CareerDevelopmentPage";
import CareerPathsPage from "./pages/succession/CareerPathsPage";
import MentorshipPage from "./pages/succession/MentorshipPage";
import FlightRiskPage from "./pages/succession/FlightRiskPage";
import BenchStrengthPage from "./pages/succession/BenchStrengthPage";
import SuccessionAnalyticsPage from "./pages/succession/SuccessionAnalyticsPage";

// Recruitment pages
import RecruitmentDashboardPage from "./pages/recruitment/RecruitmentDashboardPage";
import RecruitmentFullPage from "./pages/recruitment/RecruitmentFullPage";
import RecruitmentAnalyticsPage from "./pages/recruitment/RecruitmentAnalyticsPage";
import RequisitionsPage from "./pages/recruitment/RequisitionsPage";
import CandidatesPage from "./pages/recruitment/CandidatesPage";
import ApplicationsPage from "./pages/recruitment/ApplicationsPage";
import PipelinePage from "./pages/recruitment/PipelinePage";
import ScorecardsPage from "./pages/recruitment/ScorecardsPage";
import OffersPage from "./pages/recruitment/OffersPage";
import ReferralsPage from "./pages/recruitment/ReferralsPage";
import AssessmentsPage from "./pages/recruitment/AssessmentsPage";
import InterviewPanelsPage from "./pages/recruitment/InterviewPanelsPage";
import EmailTemplatesPage from "./pages/recruitment/EmailTemplatesPage";
import SourcesPage from "./pages/recruitment/SourcesPage";
import JobBoardsPage from "./pages/recruitment/JobBoardsPage";

// HSE pages
import HSEDashboardPage from "./pages/hse/HSEDashboardPage";
import HSEIncidentsPage from "./pages/hse/HSEIncidentsPage";
import HSERiskAssessmentPage from "./pages/hse/HSERiskAssessmentPage";
import HSESafetyTrainingPage from "./pages/hse/HSESafetyTrainingPage";
import HSECompliancePage from "./pages/hse/HSECompliancePage";
import HSESafetyPoliciesPage from "./pages/hse/HSESafetyPoliciesPage";
import HSEWorkersCompPage from "./pages/hse/HSEWorkersCompPage";
import HSEPPEManagementPage from "./pages/hse/HSEPPEManagementPage";
import HSEInspectionsPage from "./pages/hse/HSEInspectionsPage";
import HSEEmergencyResponsePage from "./pages/hse/HSEEmergencyResponsePage";
import HSEChemicalsPage from "./pages/hse/HSEChemicalsPage";
import HSEOshaReportingPage from "./pages/hse/HSEOshaReportingPage";
import HSEPermitToWorkPage from "./pages/hse/HSEPermitToWorkPage";
import HSELotoPage from "./pages/hse/HSELotoPage";
import HSENearMissPage from "./pages/hse/HSENearMissPage";
import HSESafetyObservationsPage from "./pages/hse/HSESafetyObservationsPage";
import HSEToolboxTalksPage from "./pages/hse/HSEToolboxTalksPage";
import HSEFirstAidPage from "./pages/hse/HSEFirstAidPage";
import HSEErgonomicsPage from "./pages/hse/HSEErgonomicsPage";
import HSEAnalyticsPage from "./pages/hse/HSEAnalyticsPage";

// Employee Relations pages
import EmployeeRelationsDashboardPage from "./pages/employee-relations/EmployeeRelationsDashboardPage";
import ERAnalyticsPage from "./pages/employee-relations/ERAnalyticsPage";
import ERCasesPage from "./pages/employee-relations/ERCasesPage";
import ERDisciplinaryPage from "./pages/employee-relations/ERDisciplinaryPage";
import ERRecognitionPage from "./pages/employee-relations/ERRecognitionPage";
import ERExitInterviewsPage from "./pages/employee-relations/ERExitInterviewsPage";
import ERSurveysPage from "./pages/employee-relations/ERSurveysPage";
import ERWellnessPage from "./pages/employee-relations/ERWellnessPage";
import ERUnionsPage from "./pages/employee-relations/ERUnionsPage";
import ERGrievancesPage from "./pages/employee-relations/ERGrievancesPage";
import ERCourtJudgementsPage from "./pages/employee-relations/ERCourtJudgementsPage";
import CBADetailPage from "./pages/employee-relations/CBADetailPage";

// Property pages
import PropertyDashboardPage from "./pages/property/PropertyDashboardPage";
import PropertyAnalyticsPage from "./pages/property/PropertyAnalyticsPage";
import PropertyAssetsPage from "./pages/property/PropertyAssetsPage";
import PropertyAssignmentsPage from "./pages/property/PropertyAssignmentsPage";
import PropertyRequestsPage from "./pages/property/PropertyRequestsPage";
import PropertyMaintenancePage from "./pages/property/PropertyMaintenancePage";
import PropertyCategoriesPage from "./pages/property/PropertyCategoriesPage";
// Payroll pages
import PayrollDashboardPage from "./pages/payroll/PayrollDashboardPage";
import TaxAllowancesPage from "./pages/payroll/TaxAllowancesPage";
import CountryPayrollYearSetupPage from "./pages/payroll/CountryPayrollYearSetupPage";
import BankFileBuilderPage from "./pages/payroll/BankFileBuilderPage";
import PayGroupsPage from "./pages/payroll/PayGroupsPage";
import SemiMonthlyPayrollRulesPage from "./pages/payroll/SemiMonthlyPayrollRulesPage";
import CountryTaxSettingsPage from "./pages/payroll/CountryTaxSettingsPage";
import TipPoolManagementPage from "./pages/payroll/TipPoolManagementPage";
import StatutoryTaxReliefPage from "./pages/payroll/StatutoryTaxReliefPage";
import TaxReliefSchemesPage from "./pages/payroll/TaxReliefSchemesPage";
import PayPeriodsPage from "./pages/payroll/PayPeriodsPage";
import PayrollProcessingPage from "./pages/payroll/PayrollProcessingPage";
import OffCyclePayrollPage from "./pages/payroll/OffCyclePayrollPage";
import TaxConfigPage from "./pages/payroll/TaxConfigPage";
import PayrollReportsPage from "./pages/payroll/PayrollReportsPage";
import YearEndProcessingPage from "./pages/payroll/YearEndProcessingPage";
import YearEndPayrollClosingPage from "./pages/payroll/YearEndPayrollClosingPage";
import StatutoryDeductionTypesPage from "./pages/payroll/StatutoryDeductionTypesPage";
import PayslipsPage from "./pages/payroll/PayslipsPage";
import PayPeriodPayrollEntriesPage from "./pages/payroll/PayPeriodPayrollEntriesPage";
import EmployeeRegularDeductionsPage from "./pages/payroll/EmployeeRegularDeductionsPage";
import OverpaymentRecoveryPage from "./pages/payroll/OverpaymentRecoveryPage";
import LeavePaymentConfigPage from "./pages/payroll/LeavePaymentConfigPage";
import LeaveBalanceBuyoutPage from "./pages/payroll/LeaveBalanceBuyoutPage";
import PayslipTemplateConfigPage from "./pages/payroll/PayslipTemplateConfigPage";
import PayrollExpenseClaimsPage from "./pages/payroll/PayrollExpenseClaimsPage";
import PayrollArchiveSettingsPage from "./pages/payroll/PayrollArchiveSettingsPage";
import BenefitPayrollMappingsPage from "./pages/payroll/BenefitPayrollMappingsPage";
import EmployeeTransactionPayrollMappingsPage from "./pages/payroll/EmployeeTransactionPayrollMappingsPage";
import StatutoryPayElementMappingsPage from "./pages/payroll/StatutoryPayElementMappingsPage";
import PayrollHolidaysPage from "./pages/payroll/PayrollHolidaysPage";
import OpeningBalancesPage from "./pages/payroll/OpeningBalancesPage";
import HistoricalPayrollImportPage from "./pages/payroll/HistoricalPayrollImportPage";
import RetroactivePayConfigPage from "./pages/payroll/RetroactivePayConfigPage";
import RetroactivePayGeneratePage from "./pages/payroll/RetroactivePayGeneratePage";
import PayrollCountryDocumentationPage from "./pages/payroll/PayrollCountryDocumentationPage";
import SalaryAdvancesPage from "./pages/payroll/SalaryAdvancesPage";
import SavingsProgramsPage from "./pages/payroll/SavingsProgramsPage";
import TimePayrollSyncPage from "./pages/payroll/TimePayrollSyncPage";
import PaymentRulesConfigPage from "./pages/payroll/PaymentRulesConfigPage";
import GLDashboardPage from "./pages/payroll/gl/GLDashboardPage";
import GLAccountsPage from "./pages/payroll/gl/GLAccountsPage";
import CostCenterSegmentsPage from "./pages/payroll/gl/CostCenterSegmentsPage";
import CostCentersPage from "./pages/payroll/gl/CostCentersPage";
import CostReallocationsPage from "./pages/payroll/gl/CostReallocationsPage";
import GLAccountMappingsPage from "./pages/payroll/gl/GLAccountMappingsPage";
import GLJournalBatchesPage from "./pages/payroll/gl/GLJournalBatchesPage";
import EntitySegmentMappingsPage from "./pages/payroll/gl/EntitySegmentMappingsPage";
import GLOverrideRulesPage from "./pages/payroll/gl/GLOverrideRulesPage";

// Time & Attendance pages
import TimeAttendanceDashboardPage from "./pages/time-attendance/TimeAttendanceDashboardPage";
import TimeTrackingPage from "./pages/time-attendance/TimeTrackingPage";
import AttendanceRecordsPage from "./pages/time-attendance/AttendanceRecordsPage";
import SchedulesPage from "./pages/time-attendance/SchedulesPage";
import OvertimeManagementPage from "./pages/time-attendance/OvertimeManagementPage";
import ShiftManagementPage from "./pages/time-attendance/ShiftManagementPage";
import ShiftsPage from "./pages/time-attendance/shifts/ShiftsPage";
import RoundingRulesPage from "./pages/time-attendance/shifts/RoundingRulesPage";
import PaymentRulesPage from "./pages/time-attendance/shifts/PaymentRulesPage";
import ShiftAssignmentsPage from "./pages/time-attendance/shifts/ShiftAssignmentsPage";
import ShiftCalendarPage from "./pages/time-attendance/shifts/ShiftCalendarPage";
import ShiftSwapRequestsPage from "./pages/time-attendance/shifts/ShiftSwapRequestsPage";
import OpenShiftBoardPage from "./pages/time-attendance/shifts/OpenShiftBoardPage";
import ShiftTemplatesPage from "./pages/time-attendance/shifts/ShiftTemplatesPage";
import RotationPatternsPage from "./pages/time-attendance/shifts/RotationPatternsPage";
import FatigueManagementPage from "./pages/time-attendance/shifts/FatigueManagementPage";
import ShiftCoveragePage from "./pages/time-attendance/shifts/ShiftCoveragePage";
import ShiftBiddingPage from "./pages/time-attendance/shifts/ShiftBiddingPage";
import AISchedulerPage from "./pages/time-attendance/shifts/AISchedulerPage";
import MultiLocationSchedulePage from "./pages/time-attendance/shifts/MultiLocationSchedulePage";
import GeofenceManagementPage from "./pages/time-attendance/GeofenceManagementPage";
import ProjectTimeTrackingPage from "./pages/time-attendance/ProjectTimeTrackingPage";
import TimesheetApprovalsPage from "./pages/time-attendance/TimesheetApprovalsPage";
import TimeclockDevicesPage from "./pages/time-attendance/TimeclockDevicesPage";
import AttendancePoliciesPage from "./pages/time-attendance/AttendancePoliciesPage";
import AttendanceExceptionsPage from "./pages/time-attendance/AttendanceExceptionsPage";
import LiveAttendancePage from "./pages/time-attendance/LiveAttendancePage";
import PunchImportPage from "./pages/time-attendance/PunchImportPage";
import AttendanceAnalyticsPage from "./pages/time-attendance/AttendanceAnalyticsPage";
import AbsenteeismCostPage from "./pages/time-attendance/AbsenteeismCostPage";
import ShiftDifferentialsPage from "./pages/time/ShiftDifferentialsPage";
import GeofenceLocationsPage from "./pages/time/GeofenceLocationsPage";
import FaceVerificationPage from "./pages/time/FaceVerificationPage";
import ProjectCostDashboardPage from "./pages/time/ProjectCostDashboardPage";
import ProjectCostConfigPage from "./pages/time/ProjectCostConfigPage";
import CostAllocationPage from "./pages/time/CostAllocationPage";

import EmployeeSelfServicePage from "./pages/ess/EmployeeSelfServicePage";
import MyLettersPage from "./pages/ess/MyLettersPage";
import MyGoalsPage from "./pages/ess/MyGoalsPage";
import MyOnboardingPage from "./pages/ess/MyOnboardingPage";
import MyOffboardingPage from "./pages/ess/MyOffboardingPage";
import MyPropertyPage from "./pages/ess/MyPropertyPage";
import MyEmployeeRelationsPage from "./pages/ess/MyEmployeeRelationsPage";
import EssLeavePage from "./pages/ess/EssLeavePage";
import EssJobOpeningsPage from "./pages/ess/EssJobOpeningsPage";
import MyHSEPage from "./pages/ess/MyHSEPage";
import MyTrainingPage from "./pages/ess/MyTrainingPage";
import EssAppraisalInterviewsPage from "./pages/ess/EssAppraisalInterviewsPage";
import EssGoalInterviewsPage from "./pages/ess/EssGoalInterviewsPage";
import ManagerSelfServicePage from "./pages/mss/ManagerSelfServicePage";
import MssAppraisalsPage from "./pages/mss/MssAppraisalsPage";
import MssAppraisalInterviewsPage from "./pages/mss/MssAppraisalInterviewsPage";
import MssGoalInterviewsPage from "./pages/mss/MssGoalInterviewsPage";
import MssReview360Page from "./pages/mss/MssReview360Page";
import MssGoalsPage from "./pages/mss/MssGoalsPage";
import MssOnboardingPage from "./pages/mss/MssOnboardingPage";
import MssOffboardingPage from "./pages/mss/MssOffboardingPage";
import MssTeamPage from "./pages/mss/MssTeamPage";
import MssTeamMemberPage from "./pages/mss/MssTeamMemberPage";
import MssPropertyPage from "./pages/mss/MssPropertyPage";
import MssEmployeeRelationsPage from "./pages/mss/MssEmployeeRelationsPage";
import MssLeavePage from "./pages/mss/MssLeavePage";
import MssBenefitsPage from "./pages/mss/MssBenefitsPage";
import MssHSEPage from "./pages/mss/MssHSEPage";
import MssRecruitmentPage from "./pages/mss/MssRecruitmentPage";
import MssTrainingPage from "./pages/mss/MssTrainingPage";
import MyDevelopmentPlanPage from "./pages/ess/MyDevelopmentPlanPage";
import MssDevelopmentPlansPage from "./pages/mss/MssDevelopmentPlansPage";
import MyFeedbackPage from "./pages/ess/MyFeedbackPage";
import MyRecognitionPage from "./pages/ess/MyRecognitionPage";
import MssFeedbackPage from "./pages/mss/MssFeedbackPage";
import MssRecognitionPage from "./pages/mss/MssRecognitionPage";
import MssPipsPage from "./pages/mss/MssPipsPage";
import MssCalibrationPage from "./pages/mss/MssCalibrationPage";
import EssCompensationPage from "./pages/ess/EssCompensationPage";
import EssCompensationHistoryPage from "./pages/ess/EssCompensationHistoryPage";
import EssTotalRewardsPage from "./pages/ess/EssTotalRewardsPage";
import EssEquityPage from "./pages/ess/EssEquityPage";
import EssCompaRatioPage from "./pages/ess/EssCompaRatioPage";
import EssCurrencyPreferencesPage from "./pages/ess/EssCurrencyPreferencesPage";
import MssCompensationPage from "./pages/mss/MssCompensationPage";
import MssCompaRatioPage from "./pages/mss/MssCompaRatioPage";
import MssEquityPage from "./pages/mss/MssEquityPage";
import MssAnalyticsPage from "./pages/mss/MssAnalyticsPage";
import MssSuccessionPage from "./pages/mss/MssSuccessionPage";
import MyTimeAttendancePage from "./pages/ess/MyTimeAttendancePage";
import MssTimeAttendancePage from "./pages/mss/MssTimeAttendancePage";
import MyTimesheetsPage from "./pages/ess/MyTimesheetsPage";
import MyExpenseClaimsPage from "./pages/ess/MyExpenseClaimsPage";
import AnnouncementsPage from "./pages/ess/AnnouncementsPage";
import TeamCalendarPage from "./pages/ess/TeamCalendarPage";
import MyCalendarPage from "./pages/ess/MyCalendarPage";
import MilestonesPage from "./pages/ess/MilestonesPage";
import EmployeeDirectoryPage from "./pages/admin/EmployeeDirectoryPage";
import CompanyAnnouncementsPage from "./pages/admin/CompanyAnnouncementsPage";
import ApprovalDelegationsPage from "./pages/admin/ApprovalDelegationsPage";
import CompanyDocumentsPage from "./pages/admin/CompanyDocumentsPage";

// HR Hub pages
import HRHubDashboardPage from "./pages/hr-hub/HRHubDashboardPage";
import HRCalendarPage from "./pages/hr-hub/HRCalendarPage";
import HRTasksPage from "./pages/hr-hub/HRTasksPage";
import ESSChangeRequestsPage from "./pages/hr/ESSChangeRequestsPage";
import HRMilestonesPage from "./pages/hr-hub/HRMilestonesPage";
import ComplianceTrackerPage from "./pages/hr-hub/ComplianceTrackerPage";
import HRRemindersPage from "./pages/hr-hub/HRRemindersPage";
import SOPManagementPage from "./pages/hr-hub/SOPManagementPage";
import GovernmentIdTypesPage from "./pages/hr-hub/GovernmentIdTypesPage";
import HRDataImportPage from "./pages/hr-hub/HRDataImportPage";
import SentimentMonitoringPage from "./pages/hr-hub/SentimentMonitoringPage";

// Admin Reminders
import AdminRemindersPage from "./pages/admin/AdminRemindersPage";

// ESS & MSS Reminders
import MyRemindersPage from "./pages/ess/MyRemindersPage";
import MssRemindersPage from "./pages/mss/MssRemindersPage";

import AdminWorkflowTemplatesPage from "./pages/admin/AdminWorkflowTemplatesPage";
import MyApprovalsPage from "./pages/workflow/MyApprovalsPage";
import MyDelegatesPage from "./pages/workflow/MyDelegatesPage";

// Strategic Planning pages
import StrategicPlanningHubPage from "./pages/strategic-planning/StrategicPlanningHubPage";
import OrgDesignPage from "./pages/strategic-planning/OrgDesignPage";
import ScenarioPlanningPage from "./pages/strategic-planning/ScenarioPlanningPage";

// Reporting & Analytics pages
import ReportingHubPage from "./pages/reporting/ReportingHubPage";
import DashboardsPage from "./pages/reporting/DashboardsPage";
import ReportBuilderPage from "./pages/reporting/ReportBuilderPage";
import AIInsightsPage from "./pages/reporting/AIInsightsPage";
import DataExportPage from "./pages/reporting/DataExportPage";

// Insights pages
import TalentInsightsPage from "./pages/insights/TalentInsightsPage";
import CompensationInsightsPage from "./pages/insights/CompensationInsightsPage";
import OperationalInsightsPage from "./pages/insights/OperationalInsightsPage";



// System & Integration pages
import SystemHubPage from "./pages/system/SystemHubPage";
import APIManagementPage from "./pages/system/APIManagementPage";
import SystemAuditLogsPage from "./pages/system/AuditLogsPage";
import SecuritySettingsPage from "./pages/system/SecuritySettingsPage";
import SystemConfigPage from "./pages/system/SystemConfigPage";

// Other pages
import ProfilePage from "./pages/profile/ProfilePage";
import MyPermissionsPage from "./pages/profile/MyPermissionsPage";
import NotificationPreferencesPage from "./pages/profile/NotificationPreferencesPage";

// Help Center pages
import HelpCenterPage from "./pages/help/HelpCenterPage";
import HelpChatPage from "./pages/help/HelpChatPage";
import KnowledgeBasePage from "./pages/help/KnowledgeBasePage";
import TicketsPage from "./pages/help/TicketsPage";
import NewTicketPage from "./pages/help/NewTicketPage";
import TicketDetailPage from "./pages/help/TicketDetailPage";

// Messaging pages
import MessagingPage from "./pages/messaging/MessagingPage";

const queryClient = new QueryClient();

import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TranslationsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/mfa" element={<MFAChallengePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Subscription Routes */}
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/subscription/upgrade" element={<UpgradePage />} />
            
            {/* Protected Routes with Layout */}
            <Route element={<ProtectedLayout />}>
              {/* Main Dashboard */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />

            {/* Employee Self Service Routes */}
            <Route
              path="/ess"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EmployeeSelfServicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/letters"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyLettersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/goals"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyGoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/onboarding"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/offboarding"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyOffboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/property"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/relations"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyEmployeeRelationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/jobs"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssJobOpeningsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/*"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EmployeeSelfServicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/leave"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssLeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/hse"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyHSEPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/training"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyTrainingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/appraisal-interviews"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssAppraisalInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/goal-interviews"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssGoalInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/development"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyDevelopmentPlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/feedback"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyFeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/recognition"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyRecognitionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/compensation"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssCompensationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/compensation/history"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssCompensationHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/compensation/total-rewards"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssTotalRewardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/compensation/equity"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssEquityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/compensation/currency-preferences"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssCurrencyPreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/compensation/compa-ratio"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EssCompaRatioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/banking"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyBankingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/personal-info"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyPersonalInfoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/dependents"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyDependentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/transactions"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyTransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/reminders"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyRemindersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/time-attendance"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyTimeAttendancePage />
                </ProtectedRoute>
              }
            />
            {/* Manager Self Service Routes */}
            <Route
              path="/mss"
              element={
                <ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}>
                  <ManagerSelfServicePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/team"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssTeamPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/team/:id"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssTeamMemberPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/appraisals"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssAppraisalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/appraisal-interviews"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssAppraisalInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/360"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssReview360Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/goals"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssGoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/goal-interviews"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssGoalInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/calibration"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssCalibrationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/onboarding"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/offboarding"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssOffboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/property"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/leave-approvals"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssLeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/relations"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssEmployeeRelationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/benefits"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssBenefitsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/hse"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssHSEPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/recruitment"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssRecruitmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/training"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssTrainingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/development"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssDevelopmentPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/feedback"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssFeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/recognition"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssRecognitionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/pips"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssPipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/compensation"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssCompensationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/compensation/compa-ratio"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssCompaRatioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/compensation/equity"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssEquityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/time-attendance"
              element={
                <ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}>
                  <MssTimeAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/reminders"
              element={
                <ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}>
                  <MssRemindersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/analytics"
              element={
                <ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}>
                  <MssAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/succession"
              element={
                <ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}>
                  <MssSuccessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mss/*"
              element={
                <ProtectedRoute moduleCode="mss">
                  <ManagerSelfServicePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/custom-fields"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCustomFieldsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/company-groups"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCompanyGroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminAuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ai-usage"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminAIUsagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <RoleManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles/:id"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <RoleDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pii-access"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminPiiAccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ai-security-violations"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AISecurityViolationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ai-governance"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AIGovernancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/currencies"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <CurrencyManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/color-scheme"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminColorSchemePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/territories"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <TerritoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/company-tags"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <CompanyTagsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/granular-permissions"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <GranularPermissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reminders"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminRemindersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminPermissionsSummaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/access-requests"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminAccessRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/auto-approval"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminAutoApprovalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bulk-import"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminBulkImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/translations"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <TranslationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/languages"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <TranslationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/org-structure"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <OrgStructureConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/position-control-vacancies"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <PositionControlVacanciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/headcount-requests"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <HeadcountRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/headcount-analytics"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <HeadcountAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/headcount-forecast"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <HeadcountForecastPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/divisions"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <DivisionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/scheduled-reports"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminScheduledReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/knowledge-base"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminKnowledgeBasePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/helpdesk"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminHelpdeskPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/policy-documents"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminPolicyDocumentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/letter-templates"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminLetterTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/workflow-templates"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminWorkflowTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lookup-values"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminLookupValuesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/implementation-handbook"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ImplementationHandbookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/features-brochure"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <FeaturesBrochurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/modules-brochure"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ModulesBrochurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/lms"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AdminLmsManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SubscriptionManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/mfa-settings"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <MFASettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sso-settings"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SSOSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/password-policies"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <PasswordPoliciesPage />
                </ProtectedRoute>
              }
            />
            {/* Workforce Routes */}
            <Route
              path="/workforce"
              element={
                <ProtectedRoute>
                  <WorkforceDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/company-groups"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCompanyGroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/companies"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/employees"
              element={
                <ProtectedRoute>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/employees/:id"
              element={
                <ProtectedRoute>
                  <EmployeeProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/positions"
              element={
                <ProtectedRoute>
                  <PositionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/org-chart"
              element={
                <ProtectedRoute>
                  <OrgStructurePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/departments"
              element={
                <ProtectedRoute>
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/org-changes"
              element={
                <ProtectedRoute>
                  <OrgChangesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/assignments"
              element={
                <ProtectedRoute>
                  <EmployeeAssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/transactions"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeTransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/forecasting"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <WorkforceForecastingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <WorkforceAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/qualifications"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <QualificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/company-boards"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompanyBoardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/governance"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <GovernancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/intranet-admin"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <IntranetAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/job-families"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <JobFamiliesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/jobs"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <JobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/competencies"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompetenciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/capabilities"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CapabilityRegistryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/capability-registry"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CapabilityRegistryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/responsibilities"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ResponsibilitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/onboarding"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AdminOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/onboarding/:id"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AdminOnboardingDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/offboarding"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <OffboardingPage />
                </ProtectedRoute>
              }
            />

            {/* Time & Attendance Routes */}
            <Route
              path="/time-attendance"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <TimeAttendanceDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/tracking"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <TimeTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/records"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <AttendanceRecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/schedules"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <SchedulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/overtime"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <OvertimeManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/list"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/rounding-rules"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <RoundingRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/payment-rules"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <PaymentRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/assignments"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftAssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/calendar"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/swap-requests"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftSwapRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/open-shifts"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <OpenShiftBoardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/templates"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/rotations"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <RotationPatternsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/fatigue"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <FatigueManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/coverage"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftCoveragePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/bidding"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ShiftBiddingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/ai-scheduler"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <AISchedulerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/shifts/multi-location"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <MultiLocationSchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/geofencing"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <GeofenceManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/projects"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <ProjectTimeTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/timesheet-approvals"
              element={
                <ProtectedRoute moduleCode="time_attendance">
                  <TimesheetApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/devices"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <TimeclockDevicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/policies"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <AttendancePoliciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/exceptions"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <AttendanceExceptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/live"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <LiveAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/import"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <PunchImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/analytics"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <AttendanceAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time-attendance/absenteeism-cost"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <AbsenteeismCostPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time/shift-differentials"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <ShiftDifferentialsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time/geofence-locations"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <GeofenceLocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time/face-verification"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <FaceVerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time/project-costs"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <ProjectCostDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time/project-cost-config"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <ProjectCostConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/time/cost-allocation"
              element={
                <ProtectedRoute moduleCode="time_attendance" requiredRoles={["admin", "hr_manager"]}>
                  <CostAllocationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leave"
              element={
                <ProtectedRoute>
                  <LeaveDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/employee-records"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeLeaveRecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/employee-balances"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeLeaveBalancesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/years"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveYearsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/my-leave"
              element={
                <ProtectedRoute>
                  <MyLeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/apply"
              element={
                <ProtectedRoute>
                  <ApplyLeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/approvals"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/types"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/accrual-rules"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveAccrualRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/schedule-config"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveScheduleConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/rollover-rules"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveRolloverRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/holidays"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveHolidaysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/balance-recalculation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveBalanceRecalculationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LeaveAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/compensatory-time"
              element={
                <ProtectedRoute moduleCode="leave">
                  <CompensatoryTimePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/comp-time-policies"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompTimePoliciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/calendar"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="leave">
                  <LeaveCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave/balance-adjustments"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="leave">
                  <LeaveBalanceAdjustmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/pay-groups"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayGroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/semimonthly-rules"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <SemiMonthlyPayrollRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/tip-pools"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <TipPoolManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/statutory-tax-relief"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <StatutoryTaxReliefPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/tax-relief-schemes"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <TaxReliefSchemesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/pay-periods"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayPeriodsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/processing"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollProcessingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/off-cycle"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <OffCyclePayrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/retroactive-pay"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <RetroactivePayConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/retroactive-pay/generate/:configId"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <RetroactivePayGeneratePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/tax-config"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <TaxConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/statutory-deduction-types"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <StatutoryDeductionTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/country-documentation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollCountryDocumentationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/statutory-pay-element-mappings"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <StatutoryPayElementMappingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/reports"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/year-end"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <YearEndProcessingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/year-end-closing"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <YearEndPayrollClosingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/salary-overtime"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayPeriodPayrollEntriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/regular-deductions"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <EmployeeRegularDeductionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/overpayment-recovery"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <OverpaymentRecoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/salary-advances"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <SalaryAdvancesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/savings-programs"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <SavingsProgramsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/holidays"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollHolidaysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/opening-balances"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <OpeningBalancesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/historical-import"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <HistoricalPayrollImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/pay-elements"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayElementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/leave-payment-config"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <LeavePaymentConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/benefit-mappings"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <BenefitPayrollMappingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/transaction-mappings"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <EmployeeTransactionPayrollMappingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/leave-buyout"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <LeaveBalanceBuyoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/time-sync"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <TimePayrollSyncPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/payment-rules"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PaymentRulesConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/templates"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayslipTemplateConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/expense-claims"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollExpenseClaimsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/archive-settings"
              element={
                <ProtectedRoute requiredRoles={["admin"]} moduleCode="payroll">
                  <PayrollArchiveSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/tax-allowances"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <TaxAllowancesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/bank-file-builder"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <BankFileBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/country-year-setup"
              element={
                <ProtectedRoute requiredRoles={["admin"]} moduleCode="payroll">
                  <CountryPayrollYearSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <GLDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/accounts"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <GLAccountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/segments"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <CostCenterSegmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/cost-centers"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <CostCentersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/reallocations"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <CostReallocationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/mappings"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <GLAccountMappingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/batches"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <GLJournalBatchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/entity-mappings"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <EntitySegmentMappingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll/gl/override-rules"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <GLOverrideRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/payslips"
              element={
                <ProtectedRoute moduleCode="ess">
                  <PayslipsPage />
                </ProtectedRoute>
              }
            />

            {/* Compensation Routes */}
            <Route
              path="/compensation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompensationDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/pay-elements"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PayElementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/salary-grades"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SalaryGradesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/position-compensation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PositionCompensationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/employee-compensation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeCompensationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/history"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompensationHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/merit-cycles"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <MeritCyclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/bonus"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BonusManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/market-benchmarking"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <MarketBenchmarkingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/pay-equity"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PayEquityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/total-rewards"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <TotalRewardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/budgets"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompensationBudgetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/equity"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EquityManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/compa-ratio"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompaRatioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompensationAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/spinal-points"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SpinalPointsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/position-budgeting"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PositionBudgetDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/position-budgeting/plans"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PositionBudgetPlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/position-budgeting/what-if"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PositionBudgetWhatIfPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/position-budgeting/approvals"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PositionBudgetApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compensation/position-budgeting/cost-config"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PositionBudgetCostConfigPage />
                </ProtectedRoute>
              }
            />

            {/* Benefits Routes */}
            <Route
              path="/benefits"
              element={
                <ProtectedRoute>
                  <BenefitsDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/categories"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitCategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/plans"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/enrollments"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitEnrollmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/claims"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitClaimsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/providers"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitProvidersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/cost-projections"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitCostProjectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/auto-enrollment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AutoEnrollmentRulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/life-events"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <LifeEventManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/waiting-periods"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <WaitingPeriodTrackingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/open-enrollment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <OpenEnrollmentTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/eligibility-audit"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EligibilityAuditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/compliance"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <BenefitComplianceReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/compare"
              element={
                <ProtectedRoute>
                  <PlanComparisonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/benefits/calculator"
              element={
                <ProtectedRoute>
                  <BenefitCalculatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/benefits"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyBenefitsPage />
                </ProtectedRoute>
              }
            />

            {/* Performance Routes */}
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformanceDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/goals"
              element={
                <ProtectedRoute>
                  <GoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/360"
              element={
                <ProtectedRoute>
                  <Review360Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/appraisals"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AppraisalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/pips"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PerformanceImprovementPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/feedback"
              element={
                <ProtectedRoute>
                  <ContinuousFeedbackPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/recognition"
              element={
                <ProtectedRoute>
                  <RecognitionAwardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/setup"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PerformanceSetupPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <PerformanceAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/calibration"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CalibrationSessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance/calibration/:sessionId"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CalibrationWorkspacePage />
                </ProtectedRoute>
              }
            />

            {/* Training Routes */}
            <Route
              path="/training"
              element={
                <ProtectedRoute>
                  <TrainingDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/catalog"
              element={
                <ProtectedRoute>
                  <CourseCatalogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/my-learning"
              element={
                <ProtectedRoute>
                  <MyLearningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/course/:courseId"
              element={
                <ProtectedRoute>
                  <CourseViewerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/certifications"
              element={
                <ProtectedRoute>
                  <CertificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/employee-learning"
              element={
                <ProtectedRoute>
                  <EmployeeLearningPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/employee-certifications"
              element={
                <ProtectedRoute>
                  <EmployeeCertificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/sessions"
              element={
                <ProtectedRoute>
                  <LiveSessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/calendar"
              element={
                <ProtectedRoute>
                  <TrainingCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/gap-analysis"
              element={
                <ProtectedRoute>
                  <CompetencyGapAnalysisPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/requests"
              element={
                <ProtectedRoute>
                  <TrainingRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/external"
              element={
                <ProtectedRoute>
                  <ExternalTrainingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/budgets"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <TrainingBudgetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/instructors"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <InstructorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/evaluations"
              element={
                <ProtectedRoute>
                  <TrainingEvaluationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/learning-paths"
              element={
                <ProtectedRoute>
                  <LearningPathsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/compliance"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ComplianceTrainingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/course-competencies"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CourseCompetenciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/recertification"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecertificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/needs"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <TrainingNeedsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <TrainingAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/virtual-classroom"
              element={
                <ProtectedRoute>
                  <VirtualClassroomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/training/content-authoring"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ContentAuthoringPage />
                </ProtectedRoute>
              }
            />

            {/* Succession Routes */}
            <Route
              path="/succession"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SuccessionDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/succession/nine-box" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><NineBoxPage /></ProtectedRoute>} />
            <Route path="/succession/talent-pools" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><TalentPoolsPage /></ProtectedRoute>} />
            <Route path="/succession/plans" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><SuccessionPlansPage /></ProtectedRoute>} />
            <Route path="/succession/key-positions" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><KeyPositionsPage /></ProtectedRoute>} />
            <Route path="/succession/career-development" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><CareerDevelopmentPage /></ProtectedRoute>} />
            <Route path="/succession/career-paths" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><CareerPathsPage /></ProtectedRoute>} />
            <Route path="/succession/mentorship" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><MentorshipPage /></ProtectedRoute>} />
            <Route path="/succession/flight-risk" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><FlightRiskPage /></ProtectedRoute>} />
            <Route path="/succession/bench-strength" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><BenchStrengthPage /></ProtectedRoute>} />
            <Route path="/succession/analytics" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><SuccessionAnalyticsPage /></ProtectedRoute>} />

            {/* Recruitment Routes */}
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecruitmentDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment/manage"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecruitmentFullPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecruitmentAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/recruitment/requisitions" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><RequisitionsPage /></ProtectedRoute>} />
            <Route path="/recruitment/candidates" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><CandidatesPage /></ProtectedRoute>} />
            <Route path="/recruitment/applications" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><ApplicationsPage /></ProtectedRoute>} />
            <Route path="/recruitment/pipeline" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><PipelinePage /></ProtectedRoute>} />
            <Route path="/recruitment/scorecards" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><ScorecardsPage /></ProtectedRoute>} />
            <Route path="/recruitment/offers" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><OffersPage /></ProtectedRoute>} />
            <Route path="/recruitment/referrals" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><ReferralsPage /></ProtectedRoute>} />
            <Route path="/recruitment/assessments" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><AssessmentsPage /></ProtectedRoute>} />
            <Route path="/recruitment/panels" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><InterviewPanelsPage /></ProtectedRoute>} />
            <Route path="/recruitment/email-templates" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><EmailTemplatesPage /></ProtectedRoute>} />
            <Route path="/recruitment/sources" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><SourcesPage /></ProtectedRoute>} />
            <Route path="/recruitment/job-boards" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><JobBoardsPage /></ProtectedRoute>} />

            {/* HSE Routes */}
            <Route
              path="/hse"
              element={
                <ProtectedRoute>
                  <HSEDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/incidents"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEIncidentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/risk-assessment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSERiskAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/safety-training"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSESafetyTrainingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/compliance"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSECompliancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/safety-policies"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSESafetyPoliciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/workers-comp"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEWorkersCompPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/ppe"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEPPEManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/inspections"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEInspectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/emergency-response"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEEmergencyResponsePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/chemicals"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEChemicalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/osha-reporting"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEOshaReportingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/permit-to-work"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEPermitToWorkPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/loto"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSELotoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/near-miss"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSENearMissPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/safety-observations"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSESafetyObservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/toolbox-talks"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEToolboxTalksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/first-aid"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEFirstAidPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/ergonomics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEErgonomicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hse/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HSEAnalyticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-relations"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeRelationsDashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-relations/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/cases"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERCasesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/disciplinary"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERDisciplinaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/recognition"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERRecognitionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/exit-interviews"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERExitInterviewsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/surveys"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERSurveysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/wellness"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERWellnessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/unions"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERUnionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/grievances"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERGrievancesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/court-judgements"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ERCourtJudgementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-relations/cba/:id"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CBADetailPage />
                </ProtectedRoute>
              }
            />

            {/* Property Routes */}
            <Route
              path="/property"
              element={
                <ProtectedRoute>
                  <PropertyDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/analytics"
              element={
                <ProtectedRoute>
                  <PropertyAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/assets"
              element={
                <ProtectedRoute>
                  <PropertyAssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/assignments"
              element={
                <ProtectedRoute>
                  <PropertyAssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/requests"
              element={
                <ProtectedRoute>
                  <PropertyRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/maintenance"
              element={
                <ProtectedRoute>
                  <PropertyMaintenancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/property/categories"
              element={
                <ProtectedRoute>
                  <PropertyCategoriesPage />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/permissions"
              element={
                <ProtectedRoute>
                  <MyPermissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/notifications"
              element={
                <ProtectedRoute>
                  <NotificationPreferencesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/privacy"
              element={
                <ProtectedRoute>
                  <PrivacySettingsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Intranet Routes */}
            <Route
              path="/intranet"
              element={
                <ProtectedRoute>
                  <IntranetDashboardPage />
                </ProtectedRoute>
              }
            />
            
            {/* Help Center Routes */}
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpCenterPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help/knowledge-base"
              element={
                <ProtectedRoute>
                  <KnowledgeBasePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help/chat"
              element={
                <ProtectedRoute>
                  <HelpChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help/tickets"
              element={
                <ProtectedRoute>
                  <TicketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help/tickets/new"
              element={
                <ProtectedRoute>
                  <NewTicketPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help/tickets/:ticketId"
              element={
                <ProtectedRoute>
                  <TicketDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Workflow Routes */}
            <Route
              path="/workflow/approvals"
              element={
                <ProtectedRoute>
                  <MyApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workflow/delegates"
              element={
                <ProtectedRoute>
                  <MyDelegatesPage />
                </ProtectedRoute>
              }
            />

            {/* Messaging Routes */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagingPage />
                </ProtectedRoute>
              }
            />

            {/* ESS New Routes */}
            <Route
              path="/ess/timesheets"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyTimesheetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/expenses"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyExpenseClaimsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/announcements"
              element={
                <ProtectedRoute moduleCode="ess">
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/calendar"
              element={
                <ProtectedRoute moduleCode="ess">
                  <TeamCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/my-calendar"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MyCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/milestones"
              element={
                <ProtectedRoute moduleCode="ess">
                  <MilestonesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ess/directory"
              element={
                <ProtectedRoute moduleCode="ess">
                  <EmployeeDirectoryPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin New Routes */}
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompanyAnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/delegations"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ApprovalDelegationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/documents"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompanyDocumentsPage />
                </ProtectedRoute>
              }
            />

            {/* HR Hub Routes */}
            <Route
              path="/hr-hub"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HRHubDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/ess-change-requests"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ESSChangeRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/calendar"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HRCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/tasks"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HRTasksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/milestones"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HRMilestonesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/compliance"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ComplianceTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/reminders"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HRRemindersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/sop-management"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SOPManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/government-id-types"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <GovernmentIdTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/data-import"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <HRDataImportPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/documents/staff-loan-design"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <StaffLoanDesignDocumentPage />
                </ProtectedRoute>
              }
            />

            {/* Strategic Planning Routes */}
            <Route
              path="/strategic-planning"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <StrategicPlanningHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/org-design"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <OrgDesignPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scenario-planning"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ScenarioPlanningPage />
                </ProtectedRoute>
              }
            />

            {/* Reporting & Analytics Routes */}
            <Route
              path="/reporting"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ReportingHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboards"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <DashboardsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-builder"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <ReportBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-insights"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AIInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/data-export"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <DataExportPage />
                </ProtectedRoute>
              }
            />

            {/* Insights Routes */}
            <Route
              path="/insights/talent"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <TalentInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights/compensation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompensationInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights/operational"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <OperationalInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/implementation/:id"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <ImplementationDetailPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr-hub/sentiment-monitoring"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SentimentMonitoringPage />
                </ProtectedRoute>
              }
            />



            {/* System & Integration Routes */}
            <Route
              path="/system"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SystemHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/api-management"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <APIManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/audit-logs"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SystemAuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/security"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SecuritySettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system/config"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <SystemConfigPage />
                </ProtectedRoute>
              }
            />

            {/* Enablement Module Routes */}
            <Route
              path="/enablement"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <EnablementHubPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/feature-catalog"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <FeatureCatalogPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/feature-database"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <FeatureDatabasePage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/audit"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <FeatureAuditDashboard />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/docs-generator"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <ApplicationDocsGeneratorPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/template-library"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <TemplateLibraryPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/analytics"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <EnablementAnalyticsPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/scorm-generator"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <SCORMGeneratorPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/release-calendar"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <ReleaseCalendarPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/settings"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <EnablementSettingsPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/ai-tools"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <EnablementAIToolsPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/guide"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <EnablementGuidePage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/artifacts"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <EnablementArtifactsPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/artifacts/new"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <ArtifactEditorPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/artifacts/:id"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <ArtifactDetailPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/artifacts/:id/edit"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <ArtifactEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/enablement/tours"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <EnablementAccessGuard>
                    <ToursManagementPage />
                  </EnablementAccessGuard>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TranslationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

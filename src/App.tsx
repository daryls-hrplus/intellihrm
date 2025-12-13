import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Initialize i18n
import "@/i18n";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCompaniesPage from "./pages/admin/AdminCompaniesPage";
import AdminCompanyGroupsPage from "./pages/admin/AdminCompanyGroupsPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import AdminPiiAccessPage from "./pages/admin/AdminPiiAccessPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminPermissionsSummaryPage from "./pages/admin/AdminPermissionsSummaryPage";
import AdminAccessRequestsPage from "./pages/admin/AdminAccessRequestsPage";
import AdminAutoApprovalPage from "./pages/admin/AdminAutoApprovalPage";
import AdminBulkImportPage from "./pages/admin/AdminBulkImportPage";
import AdminOrgStructurePage from "./pages/admin/AdminOrgStructurePage";
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
import IntranetAdminPage from "./pages/workforce/IntranetAdminPage";
import JobFamiliesPage from "./pages/workforce/JobFamiliesPage";
import JobsPage from "./pages/workforce/JobsPage";
import CompetenciesPage from "./pages/workforce/CompetenciesPage";
import ResponsibilitiesPage from "./pages/workforce/ResponsibilitiesPage";
import OffboardingPage from "./pages/workforce/OffboardingPage";

// Intranet pages
import IntranetDashboardPage from "./pages/intranet/IntranetDashboardPage";

// Privacy pages
import PrivacySettingsPage from "./pages/profile/PrivacySettingsPage";

// Performance pages
import PerformanceDashboardPage from "./pages/performance/PerformanceDashboardPage";
import GoalsPage from "./pages/performance/GoalsPage";
import Review360Page from "./pages/performance/Review360Page";
import AppraisalsPage from "./pages/performance/AppraisalsPage";

// Leave pages
import LeaveDashboardPage from "./pages/leave/LeaveDashboardPage";
import LeaveTypesPage from "./pages/leave/LeaveTypesPage";
import LeaveAccrualRulesPage from "./pages/leave/LeaveAccrualRulesPage";
import LeaveRolloverRulesPage from "./pages/leave/LeaveRolloverRulesPage";
import MyLeavePage from "./pages/leave/MyLeavePage";
import ApplyLeavePage from "./pages/leave/ApplyLeavePage";
import LeaveApprovalsPage from "./pages/leave/LeaveApprovalsPage";
import LeaveHolidaysPage from "./pages/leave/LeaveHolidaysPage";
import LeaveBalanceRecalculationPage from "./pages/leave/LeaveBalanceRecalculationPage";
import CompensatoryTimePage from "./pages/leave/CompensatoryTimePage";
import CompTimePoliciesPage from "./pages/leave/CompTimePoliciesPage";

// Compensation pages
import CompensationDashboardPage from "./pages/compensation/CompensationDashboardPage";
import PayElementsPage from "./pages/compensation/PayElementsPage";
import SalaryGradesPage from "./pages/compensation/SalaryGradesPage";
import PositionCompensationPage from "./pages/compensation/PositionCompensationPage";

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

// Succession pages
import SuccessionDashboardPage from "./pages/succession/SuccessionDashboardPage";

// Recruitment pages
import RecruitmentDashboardPage from "./pages/recruitment/RecruitmentDashboardPage";

// HSE pages
import HSEDashboardPage from "./pages/hse/HSEDashboardPage";

// Employee Relations pages
import EmployeeRelationsDashboardPage from "./pages/employee-relations/EmployeeRelationsDashboardPage";

// Property pages
import PropertyDashboardPage from "./pages/property/PropertyDashboardPage";

// Payroll pages
import PayrollDashboardPage from "./pages/payroll/PayrollDashboardPage";

// Time & Attendance pages
import TimeAttendanceDashboardPage from "./pages/time-attendance/TimeAttendanceDashboardPage";

// ESS & MSS pages
import EmployeeSelfServicePage from "./pages/ess/EmployeeSelfServicePage";
import MyLettersPage from "./pages/ess/MyLettersPage";
import MyGoalsPage from "./pages/ess/MyGoalsPage";
import MyOnboardingPage from "./pages/ess/MyOnboardingPage";
import MyOffboardingPage from "./pages/ess/MyOffboardingPage";
import MyPropertyPage from "./pages/ess/MyPropertyPage";
import MyEmployeeRelationsPage from "./pages/ess/MyEmployeeRelationsPage";
import EssLeavePage from "./pages/ess/EssLeavePage";
import ManagerSelfServicePage from "./pages/mss/ManagerSelfServicePage";
import MssAppraisalsPage from "./pages/mss/MssAppraisalsPage";
import MssReview360Page from "./pages/mss/MssReview360Page";
import MssGoalsPage from "./pages/mss/MssGoalsPage";
import MssOnboardingPage from "./pages/mss/MssOnboardingPage";
import MssOffboardingPage from "./pages/mss/MssOffboardingPage";
import MssPropertyPage from "./pages/mss/MssPropertyPage";
import MssEmployeeRelationsPage from "./pages/mss/MssEmployeeRelationsPage";
import MssLeavePage from "./pages/mss/MssLeavePage";

// Workflow pages
import AdminWorkflowTemplatesPage from "./pages/admin/AdminWorkflowTemplatesPage";
import MyApprovalsPage from "./pages/workflow/MyApprovalsPage";
import MyDelegatesPage from "./pages/workflow/MyDelegatesPage";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
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
              path="/mss/appraisals"
              element={
                <ProtectedRoute moduleCode="mss">
                  <MssAppraisalsPage />
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
              path="/admin/roles"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminRolesPage />
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
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminSettingsPage />
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
              path="/admin/org-structure"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminOrgStructurePage />
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
              path="/admin/lms"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <AdminLmsManagementPage />
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
              path="/workforce/org-structure"
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
              path="/workforce/intranet-admin"
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

            {/* Leave Routes */}
            <Route
              path="/leave"
              element={
                <ProtectedRoute>
                  <LeaveDashboardPage />
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
              path="/payroll"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]} moduleCode="payroll">
                  <PayrollDashboardPage />
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

            {/* Succession Routes */}
            <Route
              path="/succession"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SuccessionDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Recruitment Routes */}
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecruitmentDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* HSE Routes */}
            <Route
              path="/hse"
              element={
                <ProtectedRoute>
                  <HSEDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Employee Relations Routes */}
            <Route
              path="/employee-relations"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeRelationsDashboardPage />
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

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

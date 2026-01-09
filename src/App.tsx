import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationsProvider } from "@/components/TranslationsProvider";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnablementAccessGuard } from "@/components/auth/EnablementAccessGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Loader2 } from "lucide-react";

// Initialize i18n
import "@/i18n";

// Import all lazy-loaded pages
import * as Pages from "@/routes/lazyPages";

// Core pages (synchronous for fast initial load)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

const queryClient = new QueryClient();

// Suspense fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Wrapper component for lazy-loaded pages
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <TranslationsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
            <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/mfa" element={<LazyPage><Pages.MFAChallengePage /></LazyPage>} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Demo Routes (public) */}
            <Route path="/demo/login" element={<LazyPage><Pages.DemoLoginPage /></LazyPage>} />
            <Route path="/demo/expired" element={<LazyPage><Pages.DemoExpiredPage /></LazyPage>} />
            <Route path="/demo/convert" element={<LazyPage><Pages.DemoConversionPage /></LazyPage>} />

            {/* Subscription Routes */}
            <Route path="/subscription" element={<LazyPage><Pages.SubscriptionPage /></LazyPage>} />
            <Route path="/subscription/upgrade" element={<LazyPage><Pages.UpgradePage /></LazyPage>} />
            
            {/* Protected Routes with Layout */}
            <Route element={<ProtectedLayout />}>
              {/* Main Dashboard */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />

            {/* Employee Self Service Routes */}
            <Route path="/ess" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EmployeeSelfServicePage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/letters" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyLettersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/goals" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyGoalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/onboarding" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyOnboardingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/offboarding" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyOffboardingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/property" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyPropertyPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/relations" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyEmployeeRelationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/jobs" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssJobOpeningsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/leave" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssLeavePage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/hse" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyHSEPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/training" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyTrainingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/appraisal-interviews" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssAppraisalInterviewsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/goal-interviews" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssGoalInterviewsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/development-plan" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyDevelopmentPlanPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/appraisals" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyAppraisalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/skill-gaps" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MySkillGapsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/feedback" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyFeedbackPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/recognition" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyRecognitionPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/compensation" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssCompensationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/compensation/history" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssCompensationHistoryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/compensation/total-rewards" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssTotalRewardsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/compensation/equity" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssEquityPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/compensation/currency-preferences" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssCurrencyPreferencesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/compensation/compa-ratio" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssCompaRatioPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/banking" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyBankingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/personal-info" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyPersonalInfoPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/dependents" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyDependentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/transactions" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyTransactionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/reminders" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyRemindersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/my-change-requests" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyChangeRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/time-attendance" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyTimeAttendancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/timesheets" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyTimesheetsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/expense-claims" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyExpenseClaimsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/announcements" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.AnnouncementsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/team-calendar" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.TeamCalendarPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/my-calendar" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyCalendarPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/milestones" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MilestonesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/qualifications" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyQualificationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/competencies" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyCompetenciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/interests" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyInterestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/government-ids" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyGovernmentIdsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/immigration" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyImmigrationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/medical-info" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyMedicalInfoPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/evidence-portfolio" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyEvidencePortfolioPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/career-paths" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyCareerPathsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/career-plan" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyCareerPlanPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/mentorship" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyMentorshipPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/notification-preferences" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EssNotificationPreferencesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/benefits" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyBenefitsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/inbox" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.MyInboxPage /></LazyPage></ProtectedRoute>} />
            <Route path="/ess/*" element={<ProtectedRoute moduleCode="ess"><LazyPage><Pages.EmployeeSelfServicePage /></LazyPage></ProtectedRoute>} />

            {/* Manager Self Service Routes */}
            <Route path="/mss" element={<ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.ManagerSelfServicePage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/team" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssTeamPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/team/:id" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssTeamMemberPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/appraisals" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssAppraisalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/appraisal-interviews" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssAppraisalInterviewsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/360" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssReview360Page /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/goals" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssGoalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/goal-interviews" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssGoalInterviewsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/calibration" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssCalibrationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/onboarding" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssOnboardingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/offboarding" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssOffboardingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/property" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssPropertyPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/leave-approvals" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssLeavePage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/relations" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssEmployeeRelationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/benefits" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssBenefitsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/hse" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssHSEPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/recruitment" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssRecruitmentPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/training" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssTrainingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/development" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssDevelopmentPlansPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/feedback" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssFeedbackPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/recognition" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssRecognitionPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/pips" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssPipsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/compensation" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssCompensationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/compensation/compa-ratio" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssCompaRatioPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/compensation/equity" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.MssEquityPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/time-attendance" element={<ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.MssTimeAttendancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/reminders" element={<ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.MssRemindersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/analytics" element={<ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.MssAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/succession" element={<ProtectedRoute moduleCode="mss" requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.MssSuccessionPage /></LazyPage></ProtectedRoute>} />
            <Route path="/mss/*" element={<ProtectedRoute moduleCode="mss"><LazyPage><Pages.ManagerSelfServicePage /></LazyPage></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/custom-fields" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminCustomFieldsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminUsersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminCompaniesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/client-registry" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.ClientRegistryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/client-registry/:id" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.ClientDetailPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/client-registry/:id/provisioning" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.ClientProvisioningPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/company-groups" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminCompanyGroupsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminAuditLogsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/audit-coverage" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AuditCoveragePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/investigation-requests" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.InvestigationRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/ai-usage" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminAIUsagePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.RoleManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/roles/:id" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.RoleDetailPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/pii-access" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminPiiAccessPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/ai-security-violations" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AISecurityViolationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/ai-governance" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AIGovernancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminSettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/currencies" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.CurrencyManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/color-scheme" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminColorSchemePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/territories" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.TerritoriesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/company-tags" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.CompanyTagsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/granular-permissions" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.GranularPermissionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/company-values" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.CompanyValuesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/reminders" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminRemindersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/permissions" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminPermissionsSummaryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/access-requests" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminAccessRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/auto-approval" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminAutoApprovalPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/bulk-import" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminBulkImportPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/translations" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.TranslationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/languages" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.TranslationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/scheduled-reports" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminScheduledReportsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/knowledge-base" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminKnowledgeBasePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/helpdesk" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminHelpdeskPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/policy-documents" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminPolicyDocumentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/letter-templates" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminLetterTemplatesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/workflow-templates" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminWorkflowTemplatesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/lookup-values" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminLookupValuesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/implementation-handbook" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.ImplementationHandbookPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/features-brochure" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.FeaturesBrochurePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/modules-brochure" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.ModulesBrochurePage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/lms" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.AdminLmsManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/demo-management" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.DemoManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/demo-analytics" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.DemoAnalyticsDashboard /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/demo-analytics/prospect/:sessionId" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.ProspectJourneyPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SubscriptionManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/mfa-settings" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.MFASettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/sso-settings" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SSOSettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/password-policies" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.PasswordPoliciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/session-management" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SessionManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/employee-directory" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.EmployeeDirectoryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/company-announcements" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CompanyAnnouncementsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/approval-delegations" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.ApprovalDelegationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/admin/company-documents" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CompanyDocumentsPage /></LazyPage></ProtectedRoute>} />

            {/* Workforce Routes */}
            <Route path="/workforce" element={<ProtectedRoute><LazyPage><Pages.WorkforceDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/company-groups" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminCompanyGroupsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/companies" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AdminCompaniesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/employees" element={<ProtectedRoute><LazyPage><Pages.EmployeesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/employees/:id" element={<ProtectedRoute><LazyPage><Pages.EmployeeProfilePage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/positions" element={<ProtectedRoute><LazyPage><Pages.PositionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/org-chart" element={<ProtectedRoute><LazyPage><Pages.OrgStructurePage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/org-structure" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.OrgStructureConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/departments" element={<ProtectedRoute><LazyPage><Pages.DepartmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/org-changes" element={<ProtectedRoute><LazyPage><Pages.OrgChangesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/assignments" element={<ProtectedRoute><LazyPage><Pages.EmployeeAssignmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/transactions" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.EmployeeTransactionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/forecasting" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.WorkforceForecastingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/analytics" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.WorkforceAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/qualifications" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.QualificationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/company-boards" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CompanyBoardsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/governance" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.GovernancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/job-families" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.JobFamiliesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/jobs" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.JobsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/competencies" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CompetenciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/capabilities" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CapabilityRegistryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/capability-registry" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CapabilityRegistryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/responsibilities" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.ResponsibilitiesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/onboarding" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.AdminOnboardingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/onboarding/:id" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.AdminOnboardingDetailPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/offboarding" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.OffboardingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/position-control-vacancies" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.PositionControlVacanciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/headcount-requests" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.HeadcountRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/headcount-analytics" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.HeadcountAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/headcount-forecast" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.HeadcountForecastPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workforce/divisions" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.DivisionsPage /></LazyPage></ProtectedRoute>} />

            {/* Time & Attendance Routes */}
            <Route path="/time-attendance" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.TimeAttendanceDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/tracking" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.TimeTrackingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/records" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AttendanceRecordsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/schedules" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.SchedulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/overtime" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.OvertimeManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/list" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/rounding-rules" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.RoundingRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/payment-rules" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.PaymentRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/assignments" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftAssignmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/calendar" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftCalendarPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/swap-requests" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftSwapRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/open-shifts" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.OpenShiftBoardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/templates" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftTemplatesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/rotations" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.RotationPatternsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/fatigue" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.FatigueManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/coverage" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftCoveragePage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/bidding" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftBiddingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/ai-scheduler" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AISchedulerPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shifts/multi-location" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.MultiLocationSchedulePage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/geofencing" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.GeofenceManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/projects" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ProjectTimeTrackingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/timesheet-approvals" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.TimesheetApprovalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/timeclock-devices" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.TimeclockDevicesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/policies" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AttendancePoliciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/exceptions" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AttendanceExceptionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/live" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.LiveAttendancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/punch-import" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.PunchImportPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/analytics" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AttendanceAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/absenteeism-cost" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AbsenteeismCostPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/wellness" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.WellnessMonitoringPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/overtime-alerts" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.OvertimeAlertsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/labor-compliance" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.LaborCompliancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/flex-time" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.FlexTimePage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/regularization" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.AttendanceRegularizationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/cba-time-rules" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.CBATimeRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/cba-extensions" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.CBAExtensionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/audit-trail" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.TimeAuditTrailPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time-attendance/shift-swaps" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftSwapsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time/shift-differentials" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ShiftDifferentialsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time/geofence-locations" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.GeofenceLocationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time/face-verification" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.FaceVerificationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time/project-costs" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ProjectCostDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time/project-costs/config" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.ProjectCostConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/time/cost-allocation" element={<ProtectedRoute moduleCode="time_attendance"><LazyPage><Pages.CostAllocationPage /></LazyPage></ProtectedRoute>} />

            {/* Performance Routes */}
            <Route path="/performance" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.PerformanceDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/goals" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.GoalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/360" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.Review360Page /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/appraisals" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.AppraisalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/pips" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.PerformanceImprovementPlansPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/feedback" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.ContinuousFeedbackPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/recognition" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.RecognitionAwardsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/intelligence" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.PerformanceIntelligenceHub /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/calibration" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.CalibrationSessionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/calibration/:id" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.CalibrationWorkspacePage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/setup" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.PerformanceSetupPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/talent-dashboard" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.TalentUnifiedDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/performance/feedback/themes" element={<ProtectedRoute moduleCode="performance"><LazyPage><Pages.MyDevelopmentThemesPage /></LazyPage></ProtectedRoute>} />

            {/* Leave Routes */}
            <Route path="/leave" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/types" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveTypesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/accrual-rules" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveAccrualRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/rollover-rules" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveRolloverRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/schedule-config" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveScheduleConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/my-leave" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.MyLeavePage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/apply" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.ApplyLeavePage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/approvals" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveApprovalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/holidays" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveHolidaysPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/recalculation" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveBalanceRecalculationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/analytics" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/compensatory-time" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.CompensatoryTimePage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/comp-time-policies" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.CompTimePoliciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/calendar" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveCalendarPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/balance-adjustments" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveBalanceAdjustmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/employee-records" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.EmployeeLeaveRecordsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/employee-balances" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.EmployeeLeaveBalancesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/years" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveYearsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/blackout-periods" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveBlackoutPeriodsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/conflict-rules" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveConflictRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/encashment" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveEncashmentPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/liability" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveLiabilityPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/prorata-settings" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveProrataSettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/maternity" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.MaternityLeavePage /></LazyPage></ProtectedRoute>} />
            <Route path="/leave/compliance" element={<ProtectedRoute moduleCode="leave"><LazyPage><Pages.LeaveCompliancePage /></LazyPage></ProtectedRoute>} />

            {/* Compensation Routes */}
            <Route path="/compensation" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.CompensationDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/pay-elements" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PayElementsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/salary-grades" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.SalaryGradesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/position" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PositionCompensationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/history" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.CompensationHistoryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/merit-cycles" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.MeritCyclesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/bonuses" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.BonusManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/benchmarking" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.MarketBenchmarkingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/pay-equity" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PayEquityPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/total-rewards" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.TotalRewardsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/budgets" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.CompensationBudgetsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/equity" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.EquityManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/compa-ratio" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.CompaRatioPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/analytics" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.CompensationAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/spinal-points" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.SpinalPointsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/employee" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.EmployeeCompensationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/position-budget" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PositionBudgetDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/position-budget/plan" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PositionBudgetPlanPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/position-budget/what-if" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PositionBudgetWhatIfPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/position-budget/approvals" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PositionBudgetApprovalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/position-budget/cost-config" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.PositionBudgetCostConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/minimum-wage" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.MinimumWageCompliancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/compensation/minimum-wage/config" element={<ProtectedRoute moduleCode="compensation"><LazyPage><Pages.MinimumWageConfigPage /></LazyPage></ProtectedRoute>} />

            {/* Benefits Routes */}
            <Route path="/benefits" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitsDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/categories" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitCategoriesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/plans" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitPlansPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/enrollments" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitEnrollmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/claims" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitClaimsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/analytics" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/cost-projections" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitCostProjectionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/auto-enrollment" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.AutoEnrollmentRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/life-events" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.LifeEventManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/waiting-periods" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.WaitingPeriodTrackingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/open-enrollment" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.OpenEnrollmentTrackerPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/eligibility-audit" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.EligibilityAuditPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/compliance-reports" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitComplianceReportsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/plan-comparison" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.PlanComparisonPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/calculator" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitCalculatorPage /></LazyPage></ProtectedRoute>} />
            <Route path="/benefits/providers" element={<ProtectedRoute moduleCode="benefits"><LazyPage><Pages.BenefitProvidersPage /></LazyPage></ProtectedRoute>} />

            {/* Training Routes */}
            <Route path="/training" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/catalog" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.CourseCatalogPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/my-learning" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.MyLearningPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/course/:courseId" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.CourseViewerPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/quiz/:quizId" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.QuizPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/certifications" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.CertificationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/live-sessions" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.LiveSessionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/calendar" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingCalendarPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/competency-gap" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.CompetencyGapAnalysisPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/requests" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/external" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.ExternalTrainingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/budgets" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingBudgetsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/instructors" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.InstructorsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/evaluations" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingEvaluationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/learning-paths" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.LearningPathsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/compliance" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.ComplianceTrainingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/interactive" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.InteractiveTrainingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/interactive/admin" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.InteractiveTrainingAdminPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/course-competencies" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.CourseCompetenciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/recertification" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.RecertificationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/needs" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingNeedsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/analytics" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/virtual-classroom" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.VirtualClassroomPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/content-authoring" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.ContentAuthoringPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/employee-learning" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.EmployeeLearningPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/employee-certifications" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.EmployeeCertificationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/career-paths" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingCareerPathsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/training/mentorship" element={<ProtectedRoute moduleCode="training"><LazyPage><Pages.TrainingMentorshipPage /></LazyPage></ProtectedRoute>} />

            {/* Succession Routes */}
            <Route path="/succession" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.SuccessionDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/nine-box" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.NineBoxPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/nine-box/config" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.NineBoxConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/talent-pools" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.TalentPoolsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/plans" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.SuccessionPlansPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/key-positions" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.KeyPositionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/career-development" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.CareerDevelopmentPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/career-paths" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.CareerPathsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/mentorship" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.MentorshipPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/flight-risk" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.FlightRiskPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/bench-strength" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.BenchStrengthPage /></LazyPage></ProtectedRoute>} />
            <Route path="/succession/analytics" element={<ProtectedRoute moduleCode="succession"><LazyPage><Pages.SuccessionAnalyticsPage /></LazyPage></ProtectedRoute>} />

            {/* Recruitment Routes */}
            <Route path="/recruitment" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.RecruitmentDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/full" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.RecruitmentFullPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/analytics" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.RecruitmentAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/requisitions" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.RequisitionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/candidates" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.CandidatesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/applications" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.ApplicationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/pipeline" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.PipelinePage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/scorecards" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.ScorecardsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/offers" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.OffersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/referrals" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.ReferralsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/assessments" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.AssessmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/interview-panels" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.InterviewPanelsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/email-templates" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.EmailTemplatesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/sources" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.SourcesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/recruitment/job-boards" element={<ProtectedRoute moduleCode="recruitment"><LazyPage><Pages.JobBoardsPage /></LazyPage></ProtectedRoute>} />

            {/* HSE Routes */}
            <Route path="/hse" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/incidents" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEIncidentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/risk-assessment" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSERiskAssessmentPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/safety-training" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSESafetyTrainingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/compliance" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSECompliancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/safety-policies" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSESafetyPoliciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/workers-comp" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEWorkersCompPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/ppe" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEPPEManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/inspections" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEInspectionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/emergency-response" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEEmergencyResponsePage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/chemicals" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEChemicalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/osha-reporting" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEOshaReportingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/permit-to-work" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEPermitToWorkPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/loto" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSELotoPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/near-miss" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSENearMissPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/safety-observations" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSESafetyObservationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/toolbox-talks" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEToolboxTalksPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/first-aid" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEFirstAidPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/ergonomics" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEErgonomicsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hse/analytics" element={<ProtectedRoute moduleCode="hse"><LazyPage><Pages.HSEAnalyticsPage /></LazyPage></ProtectedRoute>} />

            {/* Employee Relations Routes */}
            <Route path="/employee-relations" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.EmployeeRelationsDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/analytics" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/cases" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERCasesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/disciplinary" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERDisciplinaryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/recognition" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERRecognitionPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/exit-interviews" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERExitInterviewsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/surveys" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERSurveysPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/wellness" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERWellnessPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/unions" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERUnionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/unions/:id" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.CBADetailPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/grievances" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERGrievancesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/employee-relations/court-judgements" element={<ProtectedRoute moduleCode="employee_relations"><LazyPage><Pages.ERCourtJudgementsPage /></LazyPage></ProtectedRoute>} />

            {/* Property Routes */}
            <Route path="/property" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/property/analytics" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/property/assets" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyAssetsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/property/assignments" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyAssignmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/property/requests" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/property/maintenance" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyMaintenancePage /></LazyPage></ProtectedRoute>} />
            <Route path="/property/categories" element={<ProtectedRoute moduleCode="property"><LazyPage><Pages.PropertyCategoriesPage /></LazyPage></ProtectedRoute>} />

            {/* Payroll Routes */}
            <Route path="/payroll" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/tax-allowances" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.TaxAllowancesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/country-year-setup" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.CountryPayrollYearSetupPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/bank-file-builder" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.BankFileBuilderPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/pay-groups" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayGroupsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/semi-monthly-rules" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.SemiMonthlyPayrollRulesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/country-tax-settings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.CountryTaxSettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/tip-pool" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.TipPoolManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/statutory-tax-relief" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.StatutoryTaxReliefPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/tax-relief-schemes" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.TaxReliefSchemesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/pay-periods" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayPeriodsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/processing" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollProcessingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/off-cycle" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.OffCyclePayrollPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/tax-config" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.TaxConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/reports" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollReportsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/year-end" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.YearEndProcessingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/year-end-closing" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.YearEndPayrollClosingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/statutory-deduction-types" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.StatutoryDeductionTypesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/payslips" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayslipsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/entries" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayPeriodPayrollEntriesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/regular-deductions" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.EmployeeRegularDeductionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/overpayment-recovery" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.OverpaymentRecoveryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/leave-payment-config" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.LeavePaymentConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/leave-balance-buyout" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.LeaveBalanceBuyoutPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/payslip-template" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayslipTemplateConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/expense-claims" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollExpenseClaimsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/archive-settings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollArchiveSettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/mexico" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.MexicoPayrollPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/benefit-mappings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.BenefitPayrollMappingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/transaction-mappings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.EmployeeTransactionPayrollMappingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/statutory-pay-element-mappings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.StatutoryPayElementMappingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/holidays" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollHolidaysPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/opening-balances" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.OpeningBalancesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/historical-import" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.HistoricalPayrollImportPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/retroactive-pay" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.RetroactivePayConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/retroactive-pay/generate" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.RetroactivePayGeneratePage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/country-documentation" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollCountryDocumentationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/salary-advances" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.SalaryAdvancesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/savings-programs" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.SavingsProgramsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/time-sync" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.TimePayrollSyncPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/payment-rules" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PaymentRulesConfigPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/multi-company" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.MultiCompanyConsolidationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/loans" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollLoansPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/variable-compensation" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.VariableCompensationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/time-integration" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.TimeAttendanceIntegrationPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/budgeting" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollBudgetingPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/simulations" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollSimulationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/batch-operations" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.BatchOperationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/vacation-manager" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.VacationManagerPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/severance-calculator" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.SeveranceCalculatorPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/templates" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.PayrollTemplatesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/webhooks" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.IntegrationWebhooksPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.GLDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/accounts" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.GLAccountsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/cost-center-segments" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.CostCenterSegmentsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/cost-centers" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.CostCentersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/cost-reallocations" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.CostReallocationsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/account-mappings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.GLAccountMappingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/journal-batches" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.GLJournalBatchesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/entity-segment-mappings" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.EntitySegmentMappingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/payroll/gl/override-rules" element={<ProtectedRoute moduleCode="payroll"><LazyPage><Pages.GLOverrideRulesPage /></LazyPage></ProtectedRoute>} />

            {/* HR Hub Routes */}
            <Route path="/hr-hub" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.HRHubDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/calendar" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.HRCalendarPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/tasks" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.HRTasksPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/ess-change-requests" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.ESSChangeRequestsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/ess-approval-policies" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.ESSApprovalPoliciesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/milestones" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.HRMilestonesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/compliance-tracker" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.ComplianceTrackerPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/reminders" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.HRRemindersPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/sop-management" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.SOPManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/government-id-types" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.GovernmentIdTypesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/data-import" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.HRDataImportPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/sentiment-monitoring" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.SentimentMonitoringPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/recognition-analytics" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.RecognitionAnalyticsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/integration-dashboard" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.IntegrationDashboardPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/transaction-workflow-settings" element={<ProtectedRoute moduleCode="hr_hub"><LazyPage><Pages.TransactionWorkflowSettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/intranet-admin" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.IntranetAdminPage /></LazyPage></ProtectedRoute>} />
            <Route path="/hr-hub/company-communications" element={<ProtectedRoute requiredRoles={["admin", "hr_manager"]}><LazyPage><Pages.CompanyCommunicationsPage /></LazyPage></ProtectedRoute>} />

            {/* Enablement Routes */}
            <Route path="/enablement" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.EnablementHubPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/docs-generator" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ApplicationDocsGeneratorPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/feature-catalog" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.FeatureCatalogPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/feature-database" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.FeatureDatabasePage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/template-library" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.TemplateLibraryPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/analytics" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.EnablementAnalyticsPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/scorm-generator" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.SCORMGeneratorPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/release-calendar" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ReleaseCalendarPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/settings" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.EnablementSettingsPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/ai-tools" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.EnablementAIToolsPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/guide" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.EnablementGuidePage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/artifacts" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.EnablementArtifactsPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/artifacts/:id" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ArtifactDetailPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/artifacts/:id/edit" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ArtifactEditorPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/tours-management" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ToursManagementPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/feature-audit" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.FeatureAuditDashboard /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/implementation/:moduleCode" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ImplementationDetailPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ManualsIndexPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/appraisals" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.AppraisalsManualPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/admin-security" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.AdminSecurityManualPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/goals" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.GoalsManualPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/workforce" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.WorkforceManualPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/hr-hub" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.HRHubManualPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/benefits" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.BenefitsManualPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/client-provisioning" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ClientProvisioningGuidePage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/client-provisioning/testing" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ClientProvisioningTestingPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/manuals/publishing" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ManualPublishingPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/content-lifecycle" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ContentLifecyclePage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />
            <Route path="/enablement/product-capabilities" element={<ProtectedRoute><EnablementAccessGuard><LazyPage><Pages.ProductCapabilitiesPage /></LazyPage></EnablementAccessGuard></ProtectedRoute>} />

            {/* Strategic Planning Routes */}
            <Route path="/strategic-planning" element={<ProtectedRoute><LazyPage><Pages.StrategicPlanningHubPage /></LazyPage></ProtectedRoute>} />
            <Route path="/strategic-planning/org-design" element={<ProtectedRoute><LazyPage><Pages.OrgDesignPage /></LazyPage></ProtectedRoute>} />
            <Route path="/strategic-planning/scenario-planning" element={<ProtectedRoute><LazyPage><Pages.ScenarioPlanningPage /></LazyPage></ProtectedRoute>} />

            {/* Reporting & Analytics Routes */}
            <Route path="/reporting" element={<ProtectedRoute><LazyPage><Pages.ReportingHubPage /></LazyPage></ProtectedRoute>} />
            <Route path="/reporting/dashboards" element={<ProtectedRoute><LazyPage><Pages.DashboardsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/reporting/report-builder" element={<ProtectedRoute><LazyPage><Pages.ReportBuilderPage /></LazyPage></ProtectedRoute>} />
            <Route path="/reporting/ai-insights" element={<ProtectedRoute><LazyPage><Pages.AIInsightsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/reporting/data-export" element={<ProtectedRoute><LazyPage><Pages.DataExportPage /></LazyPage></ProtectedRoute>} />

            {/* Insights Routes */}
            <Route path="/insights/talent" element={<ProtectedRoute><LazyPage><Pages.TalentInsightsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/insights/compensation" element={<ProtectedRoute><LazyPage><Pages.CompensationInsightsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/insights/operational" element={<ProtectedRoute><LazyPage><Pages.OperationalInsightsPage /></LazyPage></ProtectedRoute>} />

            {/* System & Integration Routes */}
            <Route path="/system" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SystemHubPage /></LazyPage></ProtectedRoute>} />
            <Route path="/system/agents" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.AgentManagementHubPage /></LazyPage></ProtectedRoute>} />
            <Route path="/system/api" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.APIManagementPage /></LazyPage></ProtectedRoute>} />
            <Route path="/system/audit-logs" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SystemAuditLogsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/system/security" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SecuritySettingsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/system/config" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.SystemConfigPage /></LazyPage></ProtectedRoute>} />

            {/* Profile Routes */}
            <Route path="/profile" element={<ProtectedRoute><LazyPage><Pages.ProfilePage /></LazyPage></ProtectedRoute>} />
            <Route path="/profile/permissions" element={<ProtectedRoute><LazyPage><Pages.MyPermissionsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/profile/notifications" element={<ProtectedRoute><LazyPage><Pages.NotificationPreferencesPage /></LazyPage></ProtectedRoute>} />
            <Route path="/profile/privacy" element={<ProtectedRoute><LazyPage><Pages.PrivacySettingsPage /></LazyPage></ProtectedRoute>} />

            {/* Help Center Routes */}
            <Route path="/help" element={<ProtectedRoute><LazyPage><Pages.HelpCenterPage /></LazyPage></ProtectedRoute>} />
            <Route path="/help/chat" element={<ProtectedRoute><LazyPage><Pages.HelpChatPage /></LazyPage></ProtectedRoute>} />
            <Route path="/help/kb" element={<ProtectedRoute><LazyPage><Pages.KnowledgeBasePage /></LazyPage></ProtectedRoute>} />
            <Route path="/help/kb/articles/:articleId/history" element={<ProtectedRoute requiredRoles={["admin"]}><LazyPage><Pages.ArticleVersionHistoryPage /></LazyPage></ProtectedRoute>} />
            <Route path="/help/tickets" element={<ProtectedRoute><LazyPage><Pages.TicketsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/help/tickets/new" element={<ProtectedRoute><LazyPage><Pages.NewTicketPage /></LazyPage></ProtectedRoute>} />
            <Route path="/help/tickets/:id" element={<ProtectedRoute><LazyPage><Pages.TicketDetailPage /></LazyPage></ProtectedRoute>} />

            {/* Messaging Routes */}
            <Route path="/messaging" element={<ProtectedRoute><LazyPage><Pages.MessagingPage /></LazyPage></ProtectedRoute>} />

            {/* Workflow Routes */}
            <Route path="/workflow/approvals" element={<ProtectedRoute><LazyPage><Pages.MyApprovalsPage /></LazyPage></ProtectedRoute>} />
            <Route path="/workflow/delegates" element={<ProtectedRoute><LazyPage><Pages.MyDelegatesPage /></LazyPage></ProtectedRoute>} />

            {/* Intranet Routes */}
            <Route path="/intranet" element={<ProtectedRoute><LazyPage><Pages.IntranetDashboardPage /></LazyPage></ProtectedRoute>} />

            {/* Document Routes */}
            <Route path="/documents/staff-loan-design" element={<ProtectedRoute><LazyPage><Pages.StaffLoanDesignDocumentPage /></LazyPage></ProtectedRoute>} />

            </Route>

            {/* Marketing Routes (Public) */}
            <Route element={<MarketingLayout />}>
              <Route path="/landing" element={<LazyPage><Pages.LandingPage /></LazyPage>} />
              <Route path="/register-demo" element={<LazyPage><Pages.RegisterDemoPage /></LazyPage>} />
              <Route path="/register-demo/success" element={<LazyPage><Pages.RegisterDemoSuccessPage /></LazyPage>} />
              <Route path="/features" element={<LazyPage><Pages.FeaturesPage /></LazyPage>} />
              <Route path="/about" element={<LazyPage><Pages.AboutPage /></LazyPage>} />
            </Route>

            {/* Product Tour Routes (Public) */}
            <Route path="/product-tour" element={<LazyPage><Pages.ProductTourLandingPage /></LazyPage>} />
            <Route path="/product-tour/:experienceCode" element={<LazyPage><Pages.ProductTourPlayerPage /></LazyPage>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
        </TranslationsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

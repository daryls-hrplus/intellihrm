import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const EmployeeSelfServicePage = lazy(() => import("@/pages/ess/EmployeeSelfServicePage"));
const MyLettersPage = lazy(() => import("@/pages/ess/MyLettersPage"));
const MyGoalsPage = lazy(() => import("@/pages/ess/MyGoalsPage"));
const MyOnboardingPage = lazy(() => import("@/pages/ess/MyOnboardingPage"));
const MyOffboardingPage = lazy(() => import("@/pages/ess/MyOffboardingPage"));
const MyPropertyPage = lazy(() => import("@/pages/ess/MyPropertyPage"));
const MyEmployeeRelationsPage = lazy(() => import("@/pages/ess/MyEmployeeRelationsPage"));
const EssJobOpeningsPage = lazy(() => import("@/pages/ess/EssJobOpeningsPage"));
const EssLeavePage = lazy(() => import("@/pages/ess/EssLeavePage"));
const MyHSEPage = lazy(() => import("@/pages/ess/MyHSEPage"));
const MyTrainingPage = lazy(() => import("@/pages/ess/MyTrainingPage"));
const EssAppraisalInterviewsPage = lazy(() => import("@/pages/ess/EssAppraisalInterviewsPage"));
const EssGoalInterviewsPage = lazy(() => import("@/pages/ess/EssGoalInterviewsPage"));
const MyDevelopmentPlanPage = lazy(() => import("@/pages/ess/MyDevelopmentPlanPage"));
const MyAppraisalsPage = lazy(() => import("@/pages/ess/MyAppraisalsPage"));
const MySkillGapsPage = lazy(() => import("@/pages/ess/MySkillGapsPage"));
const MyPerformanceTargetsPage = lazy(() => import("@/pages/ess/MyPerformanceTargetsPage"));
const MyFeedbackPage = lazy(() => import("@/pages/ess/MyFeedbackPage"));
const MyRecognitionPage = lazy(() => import("@/pages/ess/MyRecognitionPage"));
const EssCompensationPage = lazy(() => import("@/pages/ess/EssCompensationPage"));
const EssCompensationHistoryPage = lazy(() => import("@/pages/ess/EssCompensationHistoryPage"));
const EssTotalRewardsPage = lazy(() => import("@/pages/ess/EssTotalRewardsPage"));
const EssEquityPage = lazy(() => import("@/pages/ess/EssEquityPage"));
const EssCurrencyPreferencesPage = lazy(() => import("@/pages/ess/EssCurrencyPreferencesPage"));
const EssCompaRatioPage = lazy(() => import("@/pages/ess/EssCompaRatioPage"));
const PayslipsPage = lazy(() => import("@/pages/payroll/PayslipsPage"));
const MyBankingPage = lazy(() => import("@/pages/ess/MyBankingPage"));
const MyPersonalInfoPage = lazy(() => import("@/pages/ess/MyPersonalInfoPage"));
const MyDependentsPage = lazy(() => import("@/pages/ess/MyDependentsPage"));
const MyTransactionsPage = lazy(() => import("@/pages/ess/MyTransactionsPage"));
const MyRemindersPage = lazy(() => import("@/pages/ess/MyRemindersPage"));
const MyChangeRequestsPage = lazy(() => import("@/pages/ess/MyChangeRequestsPage"));
const MyTimeAttendancePage = lazy(() => import("@/pages/ess/MyTimeAttendancePage"));
const MyTimesheetsPage = lazy(() => import("@/pages/ess/MyTimesheetsPage"));
const MyExpenseClaimsPage = lazy(() => import("@/pages/ess/MyExpenseClaimsPage"));
const AnnouncementsPage = lazy(() => import("@/pages/ess/AnnouncementsPage"));
const TeamCalendarPage = lazy(() => import("@/pages/ess/TeamCalendarPage"));
const MyCalendarPage = lazy(() => import("@/pages/ess/MyCalendarPage"));
const MilestonesPage = lazy(() => import("@/pages/ess/MilestonesPage"));
const MyQualificationsPage = lazy(() => import("@/pages/ess/MyQualificationsPage"));
const MyCompetenciesPage = lazy(() => import("@/pages/ess/MyCompetenciesPage"));
const MyInterestsPage = lazy(() => import("@/pages/ess/MyInterestsPage"));
const MyGovernmentIdsPage = lazy(() => import("@/pages/ess/MyGovernmentIdsPage"));
const MyImmigrationPage = lazy(() => import("@/pages/ess/MyImmigrationPage"));
const MyMedicalInfoPage = lazy(() => import("@/pages/ess/MyMedicalInfoPage"));
const MyEvidencePortfolioPage = lazy(() => import("@/pages/ess/MyEvidencePortfolioPage"));
const MyCareerPathsPage = lazy(() => import("@/pages/ess/MyCareerPathsPage"));
const MyCareerPlanPage = lazy(() => import("@/pages/ess/MyCareerPlanPage"));
const MyMentorshipPage = lazy(() => import("@/pages/ess/MyMentorshipPage"));
 const EssNotificationPreferencesPage = lazy(() => import("@/pages/ess/NotificationPreferencesPage"));
const MyBenefitsPage = lazy(() => import("@/pages/ess/MyBenefitsPage"));
const MyInboxPage = lazy(() => import("@/pages/ess/MyInboxPage"));
const EmployeeDirectoryPage = lazy(() => import("@/pages/admin/EmployeeDirectoryPage"));

export function EssRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/ess", moduleCode: "ess", Component: EmployeeSelfServicePage },
        { path: "/ess/letters", moduleCode: "ess", Component: MyLettersPage },
        { path: "/ess/goals", moduleCode: "ess", Component: MyGoalsPage },
        { path: "/ess/onboarding", moduleCode: "ess", Component: MyOnboardingPage },
        { path: "/ess/offboarding", moduleCode: "ess", Component: MyOffboardingPage },
        { path: "/ess/property", moduleCode: "ess", Component: MyPropertyPage },
        { path: "/ess/relations", moduleCode: "ess", Component: MyEmployeeRelationsPage },
        { path: "/ess/jobs", moduleCode: "ess", Component: EssJobOpeningsPage },
        { path: "/ess/leave", moduleCode: "ess", Component: EssLeavePage },
        { path: "/ess/hse", moduleCode: "ess", Component: MyHSEPage },
        { path: "/ess/training", moduleCode: "ess", Component: MyTrainingPage },
        { path: "/ess/appraisal-interviews", moduleCode: "ess", Component: EssAppraisalInterviewsPage },
        { path: "/ess/goal-interviews", moduleCode: "ess", Component: EssGoalInterviewsPage },
        { path: "/ess/development-plan", moduleCode: "ess", Component: MyDevelopmentPlanPage },
        { path: "/ess/appraisals", moduleCode: "ess", Component: MyAppraisalsPage },
        { path: "/ess/skill-gaps", moduleCode: "ess", Component: MySkillGapsPage },
        { path: "/ess/performance-targets", moduleCode: "ess", Component: MyPerformanceTargetsPage },
        { path: "/ess/feedback", moduleCode: "ess", Component: MyFeedbackPage },
        { path: "/ess/recognition", moduleCode: "ess", Component: MyRecognitionPage },
        { path: "/ess/compensation", moduleCode: "ess", Component: EssCompensationPage },
        { path: "/ess/compensation/history", moduleCode: "ess", Component: EssCompensationHistoryPage },
        { path: "/ess/compensation/total-rewards", moduleCode: "ess", Component: EssTotalRewardsPage },
        { path: "/ess/compensation/equity", moduleCode: "ess", Component: EssEquityPage },
        { path: "/ess/compensation/currency-preferences", moduleCode: "ess", Component: EssCurrencyPreferencesPage },
        { path: "/ess/compensation/compa-ratio", moduleCode: "ess", Component: EssCompaRatioPage },
        { path: "/ess/payslips", moduleCode: "ess", Component: PayslipsPage },
        { path: "/ess/banking", moduleCode: "ess", Component: MyBankingPage },
        { path: "/ess/personal-info", moduleCode: "ess", Component: MyPersonalInfoPage },
        { path: "/ess/dependents", moduleCode: "ess", Component: MyDependentsPage },
        { path: "/ess/transactions", moduleCode: "ess", Component: MyTransactionsPage },
        { path: "/ess/reminders", moduleCode: "ess", Component: MyRemindersPage },
        { path: "/ess/my-change-requests", moduleCode: "ess", Component: MyChangeRequestsPage },
        { path: "/ess/time-attendance", moduleCode: "ess", Component: MyTimeAttendancePage },
        { path: "/ess/timesheets", moduleCode: "ess", Component: MyTimesheetsPage },
        { path: "/ess/expense-claims", moduleCode: "ess", Component: MyExpenseClaimsPage },
        { path: "/ess/announcements", moduleCode: "ess", Component: AnnouncementsPage },
        { path: "/ess/team-calendar", moduleCode: "ess", Component: TeamCalendarPage },
        { path: "/ess/my-calendar", moduleCode: "ess", Component: MyCalendarPage },
        { path: "/ess/milestones", moduleCode: "ess", Component: MilestonesPage },
        { path: "/ess/qualifications", moduleCode: "ess", Component: MyQualificationsPage },
        { path: "/ess/competencies", moduleCode: "ess", Component: MyCompetenciesPage },
        { path: "/ess/interests", moduleCode: "ess", Component: MyInterestsPage },
        { path: "/ess/government-ids", moduleCode: "ess", Component: MyGovernmentIdsPage },
        { path: "/ess/immigration", moduleCode: "ess", Component: MyImmigrationPage },
        { path: "/ess/medical-info", moduleCode: "ess", Component: MyMedicalInfoPage },
        { path: "/ess/evidence-portfolio", moduleCode: "ess", Component: MyEvidencePortfolioPage },
        { path: "/ess/career-paths", moduleCode: "ess", Component: MyCareerPathsPage },
        { path: "/ess/career-plan", moduleCode: "ess", Component: MyCareerPlanPage },
        { path: "/ess/mentorship", moduleCode: "ess", Component: MyMentorshipPage },
        { path: "/ess/notification-preferences", moduleCode: "ess", Component: EssNotificationPreferencesPage },
        { path: "/ess/benefits", moduleCode: "ess", Component: MyBenefitsPage },
        { path: "/ess/inbox", moduleCode: "ess", Component: MyInboxPage },
        { path: "/ess/employee-directory", moduleCode: "ess", Component: EmployeeDirectoryPage },
        { path: "/ess/*", moduleCode: "ess", Component: EmployeeSelfServicePage },
      ])}
    </>
  );
}

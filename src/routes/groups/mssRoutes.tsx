import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const ManagerSelfServicePage = lazy(() => import("@/pages/mss/ManagerSelfServicePage"));
const MssTeamPage = lazy(() => import("@/pages/mss/MssTeamPage"));
const MssTeamMemberPage = lazy(() => import("@/pages/mss/MssTeamMemberPage"));
const MssAppraisalsPage = lazy(() => import("@/pages/mss/MssAppraisalsPage"));
const MssAppraisalInterviewsPage = lazy(() => import("@/pages/mss/MssAppraisalInterviewsPage"));
const MssReview360Page = lazy(() => import("@/pages/mss/MssReview360Page"));
const MssGoalsPage = lazy(() => import("@/pages/mss/MssGoalsPage"));
const MssGoalInterviewsPage = lazy(() => import("@/pages/mss/MssGoalInterviewsPage"));
const MssCalibrationPage = lazy(() => import("@/pages/mss/MssCalibrationPage"));
const MssOnboardingPage = lazy(() => import("@/pages/mss/MssOnboardingPage"));
const MssOffboardingPage = lazy(() => import("@/pages/mss/MssOffboardingPage"));
const MssPropertyPage = lazy(() => import("@/pages/mss/MssPropertyPage"));
const MssLeavePage = lazy(() => import("@/pages/mss/MssLeavePage"));
const MssEmployeeRelationsPage = lazy(() => import("@/pages/mss/MssEmployeeRelationsPage"));
const MssBenefitsPage = lazy(() => import("@/pages/mss/MssBenefitsPage"));
const MssHSEPage = lazy(() => import("@/pages/mss/MssHSEPage"));
const MssRecruitmentPage = lazy(() => import("@/pages/mss/MssRecruitmentPage"));
const MssTrainingPage = lazy(() => import("@/pages/mss/MssTrainingPage"));
const MssDevelopmentPlansPage = lazy(() => import("@/pages/mss/MssDevelopmentPlansPage"));
const MssFeedbackPage = lazy(() => import("@/pages/mss/MssFeedbackPage"));
const MssRecognitionPage = lazy(() => import("@/pages/mss/MssRecognitionPage"));
const MssPipsPage = lazy(() => import("@/pages/mss/MssPipsPage"));
const MssCompensationPage = lazy(() => import("@/pages/mss/MssCompensationPage"));
const MssCompaRatioPage = lazy(() => import("@/pages/mss/MssCompaRatioPage"));
const MssEquityPage = lazy(() => import("@/pages/mss/MssEquityPage"));
const MssTimeAttendancePage = lazy(() => import("@/pages/mss/MssTimeAttendancePage"));
const MssRemindersPage = lazy(() => import("@/pages/mss/MssRemindersPage"));
const MssAnalyticsPage = lazy(() => import("@/pages/mss/MssAnalyticsPage"));
const MssSuccessionPage = lazy(() => import("@/pages/mss/MssSuccessionPage"));
const MssReadinessAssessmentPage = lazy(() => import("@/pages/mss/MssReadinessAssessmentPage"));
const MssNominateTalentPoolPage = lazy(() => import("@/pages/mss/MssNominateTalentPoolPage"));

export function MssRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        {
          path: "/mss",
          moduleCode: "mss",
          requiredRoles: ["admin", "hr_manager"],
          Component: ManagerSelfServicePage,
        },
        { path: "/mss/team", moduleCode: "mss", Component: MssTeamPage },
        { path: "/mss/team/:id", moduleCode: "mss", Component: MssTeamMemberPage },
        { path: "/mss/appraisals", moduleCode: "mss", Component: MssAppraisalsPage },
        { path: "/mss/appraisal-interviews", moduleCode: "mss", Component: MssAppraisalInterviewsPage },
        { path: "/mss/360", moduleCode: "mss", Component: MssReview360Page },
        { path: "/mss/goals", moduleCode: "mss", Component: MssGoalsPage },
        { path: "/mss/goal-interviews", moduleCode: "mss", Component: MssGoalInterviewsPage },
        { path: "/mss/calibration", moduleCode: "mss", Component: MssCalibrationPage },
        { path: "/mss/onboarding", moduleCode: "mss", Component: MssOnboardingPage },
        { path: "/mss/offboarding", moduleCode: "mss", Component: MssOffboardingPage },
        { path: "/mss/property", moduleCode: "mss", Component: MssPropertyPage },
        { path: "/mss/leave-approvals", moduleCode: "mss", Component: MssLeavePage },
        { path: "/mss/relations", moduleCode: "mss", Component: MssEmployeeRelationsPage },
        { path: "/mss/benefits", moduleCode: "mss", Component: MssBenefitsPage },
        { path: "/mss/hse", moduleCode: "mss", Component: MssHSEPage },
        { path: "/mss/recruitment", moduleCode: "mss", Component: MssRecruitmentPage },
        { path: "/mss/training", moduleCode: "mss", Component: MssTrainingPage },
        { path: "/mss/development", moduleCode: "mss", Component: MssDevelopmentPlansPage },
        { path: "/mss/feedback", moduleCode: "mss", Component: MssFeedbackPage },
        { path: "/mss/recognition", moduleCode: "mss", Component: MssRecognitionPage },
        { path: "/mss/pips", moduleCode: "mss", Component: MssPipsPage },
        { path: "/mss/compensation", moduleCode: "mss", Component: MssCompensationPage },
        { path: "/mss/compensation/compa-ratio", moduleCode: "mss", Component: MssCompaRatioPage },
        { path: "/mss/compensation/equity", moduleCode: "mss", Component: MssEquityPage },
        {
          path: "/mss/time-attendance",
          moduleCode: "mss",
          requiredRoles: ["admin", "hr_manager"],
          Component: MssTimeAttendancePage,
        },
        {
          path: "/mss/reminders",
          moduleCode: "mss",
          requiredRoles: ["admin", "hr_manager"],
          Component: MssRemindersPage,
        },
        {
          path: "/mss/analytics",
          moduleCode: "mss",
          requiredRoles: ["admin", "hr_manager"],
          Component: MssAnalyticsPage,
        },
        {
          path: "/mss/succession",
          moduleCode: "mss",
          requiredRoles: ["admin", "hr_manager"],
          Component: MssSuccessionPage,
        },
        {
          path: "/mss/readiness-assessments",
          moduleCode: "mss",
          requiredRoles: ["admin", "hr_manager"],
          Component: MssReadinessAssessmentPage,
        },
        { path: "/mss/talent-nomination", moduleCode: "mss", Component: MssNominateTalentPoolPage },
        { path: "/mss/*", moduleCode: "mss", Component: ManagerSelfServicePage },
      ])}
    </>
  );
}

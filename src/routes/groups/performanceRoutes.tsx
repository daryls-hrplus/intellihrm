import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const PerformanceDashboardPage = lazy(() => import("@/pages/performance/PerformanceDashboardPage"));
const GoalsPage = lazy(() => import("@/pages/performance/GoalsPage"));
const Review360Page = lazy(() => import("@/pages/performance/Review360Page"));
const AppraisalsPage = lazy(() => import("@/pages/performance/AppraisalsPage"));
const PerformanceImprovementPlansPage = lazy(() => import("@/pages/performance/PerformanceImprovementPlansPage"));
const ContinuousFeedbackPage = lazy(() => import("@/pages/performance/ContinuousFeedbackPage"));
const RecognitionAwardsPage = lazy(() => import("@/pages/performance/RecognitionAwardsPage"));
const PerformanceIntelligenceHub = lazy(() => import("@/pages/performance/PerformanceIntelligenceHub"));
const CalibrationSessionsPage = lazy(() => import("@/pages/performance/CalibrationSessionsPage"));
const CalibrationWorkspacePage = lazy(() => import("@/pages/performance/CalibrationWorkspacePage"));
const PerformanceSetupPage = lazy(() => import("@/pages/performance/PerformanceSetupPage"));
const TalentUnifiedDashboardPage = lazy(() => import("@/pages/performance/TalentUnifiedDashboardPage"));
const MyDevelopmentThemesPage = lazy(() => import("@/pages/performance/feedback/MyDevelopmentThemesPage"));
const AppraisalFormPreviewPage = lazy(() => import("@/pages/performance/AppraisalFormPreviewPage"));

export function PerformanceRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/performance", moduleCode: "performance", Component: PerformanceDashboardPage },
        { path: "/performance/goals", moduleCode: "performance", Component: GoalsPage },
        { path: "/performance/360", moduleCode: "performance", Component: Review360Page },
        { path: "/performance/appraisals", moduleCode: "performance", Component: AppraisalsPage },
        { path: "/performance/pips", moduleCode: "performance", Component: PerformanceImprovementPlansPage },
        { path: "/performance/feedback", moduleCode: "performance", Component: ContinuousFeedbackPage },
        { path: "/performance/recognition", moduleCode: "performance", Component: RecognitionAwardsPage },
        { path: "/performance/intelligence", moduleCode: "performance", Component: PerformanceIntelligenceHub },
        { path: "/performance/calibration", moduleCode: "performance", Component: CalibrationSessionsPage },
        { path: "/performance/calibration/:id", moduleCode: "performance", Component: CalibrationWorkspacePage },
        { path: "/performance/setup", moduleCode: "performance", Component: PerformanceSetupPage },
        { path: "/performance/talent-dashboard", moduleCode: "performance", Component: TalentUnifiedDashboardPage },
        { path: "/performance/feedback/themes", moduleCode: "performance", Component: MyDevelopmentThemesPage },
        { path: "/performance/appraisal-preview/:templateId", moduleCode: "performance", Component: AppraisalFormPreviewPage },
      ])}
    </>
  );
}

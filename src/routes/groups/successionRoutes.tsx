import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const SuccessionDashboardPage = lazy(() => import("@/pages/succession/SuccessionDashboardPage"));
const SuccessionSetupPage = lazy(() => import("@/pages/succession/SuccessionSetupPage"));
const NineBoxPage = lazy(() => import("@/pages/succession/NineBoxPage"));
const NineBoxConfigPage = lazy(() => import("@/pages/succession/NineBoxConfigPage"));
const TalentPoolsPage = lazy(() => import("@/pages/succession/TalentPoolsPage"));
const SuccessionPlansPage = lazy(() => import("@/pages/succession/SuccessionPlansPage"));
const KeyPositionsPage = lazy(() => import("@/pages/succession/KeyPositionsPage"));
const CareerDevelopmentPage = lazy(() => import("@/pages/succession/CareerDevelopmentPage"));
const CareerPathsPage = lazy(() => import("@/pages/succession/CareerPathsPage"));
const MentorshipPage = lazy(() => import("@/pages/succession/MentorshipPage"));
const FlightRiskPage = lazy(() => import("@/pages/succession/FlightRiskPage"));
const BenchStrengthPage = lazy(() => import("@/pages/succession/BenchStrengthPage"));
const SuccessionAnalyticsPage = lazy(() => import("@/pages/succession/SuccessionAnalyticsPage"));

export function SuccessionRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/succession", moduleCode: "succession", Component: SuccessionDashboardPage },
        { path: "/succession/setup", moduleCode: "succession", Component: SuccessionSetupPage },
        { path: "/succession/nine-box", moduleCode: "succession", Component: NineBoxPage },
        { path: "/succession/nine-box/config", moduleCode: "succession", Component: NineBoxConfigPage },
        { path: "/succession/talent-pools", moduleCode: "succession", Component: TalentPoolsPage },
        { path: "/succession/plans", moduleCode: "succession", Component: SuccessionPlansPage },
        { path: "/succession/key-positions", moduleCode: "succession", Component: KeyPositionsPage },
        { path: "/succession/career-development", moduleCode: "succession", Component: CareerDevelopmentPage },
        { path: "/succession/career-paths", moduleCode: "succession", Component: CareerPathsPage },
        { path: "/succession/mentorship", moduleCode: "succession", Component: MentorshipPage },
        { path: "/succession/flight-risk", moduleCode: "succession", Component: FlightRiskPage },
        { path: "/succession/bench-strength", moduleCode: "succession", Component: BenchStrengthPage },
        { path: "/succession/analytics", moduleCode: "succession", Component: SuccessionAnalyticsPage },
      ])}
    </>
  );
}

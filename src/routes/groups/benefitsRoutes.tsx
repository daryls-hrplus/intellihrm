import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const BenefitsDashboardPage = lazy(() => import("@/pages/benefits/BenefitsDashboardPage"));
const BenefitCategoriesPage = lazy(() => import("@/pages/benefits/BenefitCategoriesPage"));
const BenefitPlansPage = lazy(() => import("@/pages/benefits/BenefitPlansPage"));
const BenefitEnrollmentsPage = lazy(() => import("@/pages/benefits/BenefitEnrollmentsPage"));
const BenefitClaimsPage = lazy(() => import("@/pages/benefits/BenefitClaimsPage"));
const BenefitAnalyticsPage = lazy(() => import("@/pages/benefits/BenefitAnalyticsPage"));
const BenefitCostProjectionsPage = lazy(() => import("@/pages/benefits/BenefitCostProjectionsPage"));
const AutoEnrollmentRulesPage = lazy(() => import("@/pages/benefits/AutoEnrollmentRulesPage"));
const LifeEventManagementPage = lazy(() => import("@/pages/benefits/LifeEventManagementPage"));
const WaitingPeriodTrackingPage = lazy(() => import("@/pages/benefits/WaitingPeriodTrackingPage"));
const OpenEnrollmentTrackerPage = lazy(() => import("@/pages/benefits/OpenEnrollmentTrackerPage"));
const EligibilityAuditPage = lazy(() => import("@/pages/benefits/EligibilityAuditPage"));
const BenefitComplianceReportsPage = lazy(() => import("@/pages/benefits/BenefitComplianceReportsPage"));
const PlanComparisonPage = lazy(() => import("@/pages/benefits/PlanComparisonPage"));
const BenefitCalculatorPage = lazy(() => import("@/pages/benefits/BenefitCalculatorPage"));
const BenefitProvidersPage = lazy(() => import("@/pages/benefits/BenefitProvidersPage"));

export function BenefitsRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/benefits", moduleCode: "benefits", Component: BenefitsDashboardPage },
        { path: "/benefits/categories", moduleCode: "benefits", Component: BenefitCategoriesPage },
        { path: "/benefits/plans", moduleCode: "benefits", Component: BenefitPlansPage },
        { path: "/benefits/enrollments", moduleCode: "benefits", Component: BenefitEnrollmentsPage },
        { path: "/benefits/claims", moduleCode: "benefits", Component: BenefitClaimsPage },
        { path: "/benefits/analytics", moduleCode: "benefits", Component: BenefitAnalyticsPage },
        { path: "/benefits/cost-projections", moduleCode: "benefits", Component: BenefitCostProjectionsPage },
        { path: "/benefits/auto-enrollment", moduleCode: "benefits", Component: AutoEnrollmentRulesPage },
        { path: "/benefits/life-events", moduleCode: "benefits", Component: LifeEventManagementPage },
        { path: "/benefits/waiting-periods", moduleCode: "benefits", Component: WaitingPeriodTrackingPage },
        { path: "/benefits/open-enrollment", moduleCode: "benefits", Component: OpenEnrollmentTrackerPage },
        { path: "/benefits/eligibility-audit", moduleCode: "benefits", Component: EligibilityAuditPage },
        { path: "/benefits/compliance-reports", moduleCode: "benefits", Component: BenefitComplianceReportsPage },
        { path: "/benefits/plan-comparison", moduleCode: "benefits", Component: PlanComparisonPage },
        { path: "/benefits/calculator", moduleCode: "benefits", Component: BenefitCalculatorPage },
        { path: "/benefits/providers", moduleCode: "benefits", Component: BenefitProvidersPage },
      ])}
    </>
  );
}

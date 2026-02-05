import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const CompensationDashboardPage = lazy(() => import("@/pages/compensation/CompensationDashboardPage"));
const PayElementsPage = lazy(() => import("@/pages/compensation/PayElementsPage"));
const SalaryGradesPage = lazy(() => import("@/pages/compensation/SalaryGradesPage"));
const PositionCompensationPage = lazy(() => import("@/pages/compensation/PositionCompensationPage"));
const CompensationHistoryPage = lazy(() => import("@/pages/compensation/CompensationHistoryPage"));
const MeritCyclesPage = lazy(() => import("@/pages/compensation/MeritCyclesPage"));
const BonusManagementPage = lazy(() => import("@/pages/compensation/BonusManagementPage"));
const MarketBenchmarkingPage = lazy(() => import("@/pages/compensation/MarketBenchmarkingPage"));
const PayEquityPage = lazy(() => import("@/pages/compensation/PayEquityPage"));
const TotalRewardsPage = lazy(() => import("@/pages/compensation/TotalRewardsPage"));
const CompensationBudgetsPage = lazy(() => import("@/pages/compensation/CompensationBudgetsPage"));
const EquityManagementPage = lazy(() => import("@/pages/compensation/EquityManagementPage"));
const CompaRatioPage = lazy(() => import("@/pages/compensation/CompaRatioPage"));
const CompensationAnalyticsPage = lazy(() => import("@/pages/compensation/CompensationAnalyticsPage"));
const SpinalPointsPage = lazy(() => import("@/pages/compensation/SpinalPointsPage"));
const EmployeeCompensationPage = lazy(() => import("@/pages/compensation/EmployeeCompensationPage"));
const PositionBudgetDashboardPage = lazy(() => import("@/pages/compensation/PositionBudgetDashboardPage"));
const PositionBudgetPlanPage = lazy(() => import("@/pages/compensation/PositionBudgetPlanPage"));
const PositionBudgetWhatIfPage = lazy(() => import("@/pages/compensation/PositionBudgetWhatIfPage"));
const PositionBudgetApprovalsPage = lazy(() => import("@/pages/compensation/PositionBudgetApprovalsPage"));
const PositionBudgetCostConfigPage = lazy(() => import("@/pages/compensation/PositionBudgetCostConfigPage"));
const MinimumWageCompliancePage = lazy(() => import("@/pages/compensation/MinimumWageCompliancePage"));
const MinimumWageConfigPage = lazy(() => import("@/pages/compensation/MinimumWageConfigPage"));
const CompensationFTEReconciliationPage = lazy(() => import("@/pages/compensation/CompensationFTEReconciliationPage"));
const CompensationReviewFlagsPage = lazy(() => import("@/pages/compensation/CompensationReviewFlagsPage"));

export function CompensationRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/compensation", moduleCode: "compensation", Component: CompensationDashboardPage },
        { path: "/compensation/pay-elements", moduleCode: "compensation", Component: PayElementsPage },
        { path: "/payroll/pay-elements", moduleCode: "payroll", Component: PayElementsPage },
        { path: "/compensation/salary-grades", moduleCode: "compensation", Component: SalaryGradesPage },
        { path: "/compensation/position", moduleCode: "compensation", Component: PositionCompensationPage },
        { path: "/compensation/history", moduleCode: "compensation", Component: CompensationHistoryPage },
        { path: "/compensation/merit-cycles", moduleCode: "compensation", Component: MeritCyclesPage },
        { path: "/compensation/bonuses", moduleCode: "compensation", Component: BonusManagementPage },
        { path: "/compensation/benchmarking", moduleCode: "compensation", Component: MarketBenchmarkingPage },
        { path: "/compensation/pay-equity", moduleCode: "compensation", Component: PayEquityPage },
        { path: "/compensation/total-rewards", moduleCode: "compensation", Component: TotalRewardsPage },
        { path: "/compensation/budgets", moduleCode: "compensation", Component: CompensationBudgetsPage },
        { path: "/compensation/equity", moduleCode: "compensation", Component: EquityManagementPage },
        { path: "/compensation/compa-ratio", moduleCode: "compensation", Component: CompaRatioPage },
        { path: "/compensation/analytics", moduleCode: "compensation", Component: CompensationAnalyticsPage },
        { path: "/compensation/spinal-points", moduleCode: "compensation", Component: SpinalPointsPage },
        { path: "/compensation/employee", moduleCode: "compensation", Component: EmployeeCompensationPage },
        { path: "/compensation/position-budget", moduleCode: "compensation", Component: PositionBudgetDashboardPage },
        { path: "/compensation/position-budget/plan", moduleCode: "compensation", Component: PositionBudgetPlanPage },
        { path: "/compensation/position-budget/what-if", moduleCode: "compensation", Component: PositionBudgetWhatIfPage },
        { path: "/compensation/position-budget/approvals", moduleCode: "compensation", Component: PositionBudgetApprovalsPage },
        { path: "/compensation/position-budget/cost-config", moduleCode: "compensation", Component: PositionBudgetCostConfigPage },
        { path: "/compensation/minimum-wage", moduleCode: "compensation", Component: MinimumWageCompliancePage },
        { path: "/compensation/minimum-wage/config", moduleCode: "compensation", Component: MinimumWageConfigPage },
        { path: "/compensation/fte-reconciliation", moduleCode: "compensation", Component: CompensationFTEReconciliationPage },
        { path: "/compensation/review-flags", moduleCode: "compensation", Component: CompensationReviewFlagsPage },
      ])}
    </>
  );
}

import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const LeaveDashboardPage = lazy(() => import("@/pages/leave/LeaveDashboardPage"));
const LeaveTypesPage = lazy(() => import("@/pages/leave/LeaveTypesPage"));
const LeaveAccrualRulesPage = lazy(() => import("@/pages/leave/LeaveAccrualRulesPage"));
const LeaveRolloverRulesPage = lazy(() => import("@/pages/leave/LeaveRolloverRulesPage"));
const LeaveScheduleConfigPage = lazy(() => import("@/pages/leave/LeaveScheduleConfigPage"));
const MyLeavePage = lazy(() => import("@/pages/leave/MyLeavePage"));
const ApplyLeavePage = lazy(() => import("@/pages/leave/ApplyLeavePage"));
const LeaveApprovalsPage = lazy(() => import("@/pages/leave/LeaveApprovalsPage"));
const LeaveHolidaysPage = lazy(() => import("@/pages/leave/LeaveHolidaysPage"));
const LeaveBalanceRecalculationPage = lazy(() => import("@/pages/leave/LeaveBalanceRecalculationPage"));
const LeaveAnalyticsPage = lazy(() => import("@/pages/leave/LeaveAnalyticsPage"));
const CompensatoryTimePage = lazy(() => import("@/pages/leave/CompensatoryTimePage"));
const CompTimePoliciesPage = lazy(() => import("@/pages/leave/CompTimePoliciesPage"));
const LeaveCalendarPage = lazy(() => import("@/pages/leave/LeaveCalendarPage"));
const LeaveBalanceAdjustmentsPage = lazy(() => import("@/pages/leave/LeaveBalanceAdjustmentsPage"));
const EmployeeLeaveRecordsPage = lazy(() => import("@/pages/leave/EmployeeLeaveRecordsPage"));
const EmployeeLeaveBalancesPage = lazy(() => import("@/pages/leave/EmployeeLeaveBalancesPage"));
const LeaveYearsPage = lazy(() => import("@/pages/leave/LeaveYearsPage"));
const LeaveBlackoutPeriodsPage = lazy(() => import("@/pages/leave/LeaveBlackoutPeriodsPage"));
const LeaveConflictRulesPage = lazy(() => import("@/pages/leave/LeaveConflictRulesPage"));
const LeaveEncashmentPage = lazy(() => import("@/pages/leave/LeaveEncashmentPage"));
const LeaveLiabilityPage = lazy(() => import("@/pages/leave/LeaveLiabilityPage"));
const LeaveProrataSettingsPage = lazy(() => import("@/pages/leave/LeaveProrataSettingsPage"));
const MaternityLeavePage = lazy(() => import("@/pages/leave/MaternityLeavePage"));
const LeaveCompliancePage = lazy(() => import("@/pages/leave/LeaveCompliancePage"));

export function LeaveRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/leave", moduleCode: "leave", Component: LeaveDashboardPage },
        { path: "/leave/types", moduleCode: "leave", Component: LeaveTypesPage },
        { path: "/leave/accrual-rules", moduleCode: "leave", Component: LeaveAccrualRulesPage },
        { path: "/leave/rollover-rules", moduleCode: "leave", Component: LeaveRolloverRulesPage },
        { path: "/leave/schedule-config", moduleCode: "leave", Component: LeaveScheduleConfigPage },
        { path: "/leave/my-leave", moduleCode: "leave", Component: MyLeavePage },
        { path: "/leave/apply", moduleCode: "leave", Component: ApplyLeavePage },
        { path: "/leave/approvals", moduleCode: "leave", Component: LeaveApprovalsPage },
        { path: "/leave/holidays", moduleCode: "leave", Component: LeaveHolidaysPage },
        { path: "/leave/recalculation", moduleCode: "leave", Component: LeaveBalanceRecalculationPage },
        { path: "/leave/analytics", moduleCode: "leave", Component: LeaveAnalyticsPage },
        { path: "/leave/compensatory-time", moduleCode: "leave", Component: CompensatoryTimePage },
        { path: "/leave/comp-time-policies", moduleCode: "leave", Component: CompTimePoliciesPage },
        { path: "/leave/calendar", moduleCode: "leave", Component: LeaveCalendarPage },
        { path: "/leave/balance-adjustments", moduleCode: "leave", Component: LeaveBalanceAdjustmentsPage },
        { path: "/leave/employee-records", moduleCode: "leave", Component: EmployeeLeaveRecordsPage },
        { path: "/leave/employee-balances", moduleCode: "leave", Component: EmployeeLeaveBalancesPage },
        { path: "/leave/years", moduleCode: "leave", Component: LeaveYearsPage },
        { path: "/leave/blackout-periods", moduleCode: "leave", Component: LeaveBlackoutPeriodsPage },
        { path: "/leave/conflict-rules", moduleCode: "leave", Component: LeaveConflictRulesPage },
        { path: "/leave/encashment", moduleCode: "leave", Component: LeaveEncashmentPage },
        { path: "/leave/liability", moduleCode: "leave", Component: LeaveLiabilityPage },
        { path: "/leave/prorata-settings", moduleCode: "leave", Component: LeaveProrataSettingsPage },
        { path: "/leave/maternity", moduleCode: "leave", Component: MaternityLeavePage },
        { path: "/leave/compliance", moduleCode: "leave", Component: LeaveCompliancePage },
      ])}
    </>
  );
}

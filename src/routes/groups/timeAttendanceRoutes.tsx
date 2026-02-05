import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const TimeAttendanceDashboardPage = lazy(() => import("@/pages/time-attendance/TimeAttendanceDashboardPage"));
const TimeTrackingPage = lazy(() => import("@/pages/time-attendance/TimeTrackingPage"));
const AttendanceRecordsPage = lazy(() => import("@/pages/time-attendance/AttendanceRecordsPage"));
const SchedulesPage = lazy(() => import("@/pages/time-attendance/SchedulesPage"));
const OvertimeManagementPage = lazy(() => import("@/pages/time-attendance/OvertimeManagementPage"));
const ShiftManagementPage = lazy(() => import("@/pages/time-attendance/ShiftManagementPage"));
 const ShiftsPage = lazy(() => import("@/pages/time-attendance/shifts/ShiftsPage"));
 const RoundingRulesPage = lazy(() => import("@/pages/time-attendance/shifts/RoundingRulesPage"));
 const PaymentRulesPage = lazy(() => import("@/pages/time-attendance/shifts/PaymentRulesPage"));
 const ShiftAssignmentsPage = lazy(() => import("@/pages/time-attendance/shifts/ShiftAssignmentsPage"));
 const ShiftCalendarPage = lazy(() => import("@/pages/time-attendance/shifts/ShiftCalendarPage"));
 const ShiftSwapRequestsPage = lazy(() => import("@/pages/time-attendance/shifts/ShiftSwapRequestsPage"));
 const OpenShiftBoardPage = lazy(() => import("@/pages/time-attendance/shifts/OpenShiftBoardPage"));
 const ShiftTemplatesPage = lazy(() => import("@/pages/time-attendance/shifts/ShiftTemplatesPage"));
 const RotationPatternsPage = lazy(() => import("@/pages/time-attendance/shifts/RotationPatternsPage"));
 const FatigueManagementPage = lazy(() => import("@/pages/time-attendance/shifts/FatigueManagementPage"));
 const ShiftCoveragePage = lazy(() => import("@/pages/time-attendance/shifts/ShiftCoveragePage"));
 const ShiftBiddingPage = lazy(() => import("@/pages/time-attendance/shifts/ShiftBiddingPage"));
 const AISchedulerPage = lazy(() => import("@/pages/time-attendance/shifts/AISchedulerPage"));
 const MultiLocationSchedulePage = lazy(() => import("@/pages/time-attendance/shifts/MultiLocationSchedulePage"));
const GeofenceManagementPage = lazy(() => import("@/pages/time-attendance/GeofenceManagementPage"));
const ProjectTimeTrackingPage = lazy(() => import("@/pages/time-attendance/ProjectTimeTrackingPage"));
const TimesheetApprovalsPage = lazy(() => import("@/pages/time-attendance/TimesheetApprovalsPage"));
const TimeclockDevicesPage = lazy(() => import("@/pages/time-attendance/TimeclockDevicesPage"));
const AttendancePoliciesPage = lazy(() => import("@/pages/time-attendance/AttendancePoliciesPage"));
const AttendanceExceptionsPage = lazy(() => import("@/pages/time-attendance/AttendanceExceptionsPage"));
const LiveAttendancePage = lazy(() => import("@/pages/time-attendance/LiveAttendancePage"));
const PunchImportPage = lazy(() => import("@/pages/time-attendance/PunchImportPage"));
const AttendanceAnalyticsPage = lazy(() => import("@/pages/time-attendance/AttendanceAnalyticsPage"));
const AbsenteeismCostPage = lazy(() => import("@/pages/time-attendance/AbsenteeismCostPage"));
const WellnessMonitoringPage = lazy(() => import("@/pages/time-attendance/WellnessMonitoringPage"));
const OvertimeAlertsPage = lazy(() => import("@/pages/time-attendance/OvertimeAlertsPage"));
const LaborCompliancePage = lazy(() => import("@/pages/time-attendance/LaborCompliancePage"));
const FlexTimePage = lazy(() => import("@/pages/time-attendance/FlexTimePage"));
const AttendanceRegularizationPage = lazy(() => import("@/pages/time-attendance/AttendanceRegularizationPage"));
const CBATimeRulesPage = lazy(() => import("@/pages/time-attendance/CBATimeRulesPage"));
const CBAExtensionsPage = lazy(() => import("@/pages/time-attendance/CBAExtensionsPage"));
const TimeAuditTrailPage = lazy(() => import("@/pages/time-attendance/TimeAuditTrailPage"));
const ShiftSwapsPage = lazy(() => import("@/pages/time-attendance/ShiftSwapsPage"));
 const ShiftDifferentialsPage = lazy(() => import("@/pages/time/ShiftDifferentialsPage"));
 const GeofenceLocationsPage = lazy(() => import("@/pages/time/GeofenceLocationsPage"));
 const FaceVerificationPage = lazy(() => import("@/pages/time/FaceVerificationPage"));
 const ProjectCostDashboardPage = lazy(() => import("@/pages/time/ProjectCostDashboardPage"));
 const ProjectCostConfigPage = lazy(() => import("@/pages/time/ProjectCostConfigPage"));
 const CostAllocationPage = lazy(() => import("@/pages/time/CostAllocationPage"));

export function TimeAttendanceRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/time-attendance", moduleCode: "time_attendance", Component: TimeAttendanceDashboardPage },
        { path: "/time-attendance/tracking", moduleCode: "time_attendance", Component: TimeTrackingPage },
        { path: "/time-attendance/records", moduleCode: "time_attendance", Component: AttendanceRecordsPage },
        { path: "/time-attendance/schedules", moduleCode: "time_attendance", Component: SchedulesPage },
        { path: "/time-attendance/overtime", moduleCode: "time_attendance", Component: OvertimeManagementPage },
        { path: "/time-attendance/shifts", moduleCode: "time_attendance", Component: ShiftManagementPage },
        { path: "/time-attendance/shifts/list", moduleCode: "time_attendance", Component: ShiftsPage },
        { path: "/time-attendance/shifts/rounding-rules", moduleCode: "time_attendance", Component: RoundingRulesPage },
        { path: "/time-attendance/shifts/payment-rules", moduleCode: "time_attendance", Component: PaymentRulesPage },
        { path: "/time-attendance/shifts/assignments", moduleCode: "time_attendance", Component: ShiftAssignmentsPage },
        { path: "/time-attendance/shifts/calendar", moduleCode: "time_attendance", Component: ShiftCalendarPage },
        { path: "/time-attendance/shifts/swap-requests", moduleCode: "time_attendance", Component: ShiftSwapRequestsPage },
        { path: "/time-attendance/shifts/open-shifts", moduleCode: "time_attendance", Component: OpenShiftBoardPage },
        { path: "/time-attendance/shifts/templates", moduleCode: "time_attendance", Component: ShiftTemplatesPage },
        { path: "/time-attendance/shifts/rotations", moduleCode: "time_attendance", Component: RotationPatternsPage },
        { path: "/time-attendance/shifts/fatigue", moduleCode: "time_attendance", Component: FatigueManagementPage },
        { path: "/time-attendance/shifts/coverage", moduleCode: "time_attendance", Component: ShiftCoveragePage },
        { path: "/time-attendance/shifts/bidding", moduleCode: "time_attendance", Component: ShiftBiddingPage },
        { path: "/time-attendance/shifts/ai-scheduler", moduleCode: "time_attendance", Component: AISchedulerPage },
        { path: "/time-attendance/shifts/multi-location", moduleCode: "time_attendance", Component: MultiLocationSchedulePage },
        { path: "/time-attendance/geofencing", moduleCode: "time_attendance", Component: GeofenceManagementPage },
        { path: "/time-attendance/projects", moduleCode: "time_attendance", Component: ProjectTimeTrackingPage },
        { path: "/time-attendance/timesheet-approvals", moduleCode: "time_attendance", Component: TimesheetApprovalsPage },
        { path: "/time-attendance/timeclock-devices", moduleCode: "time_attendance", Component: TimeclockDevicesPage },
        { path: "/time-attendance/policies", moduleCode: "time_attendance", Component: AttendancePoliciesPage },
        { path: "/time-attendance/exceptions", moduleCode: "time_attendance", Component: AttendanceExceptionsPage },
        { path: "/time-attendance/live", moduleCode: "time_attendance", Component: LiveAttendancePage },
        { path: "/time-attendance/punch-import", moduleCode: "time_attendance", Component: PunchImportPage },
        { path: "/time-attendance/analytics", moduleCode: "time_attendance", Component: AttendanceAnalyticsPage },
        { path: "/time-attendance/absenteeism-cost", moduleCode: "time_attendance", Component: AbsenteeismCostPage },
        { path: "/time-attendance/wellness", moduleCode: "time_attendance", Component: WellnessMonitoringPage },
        { path: "/time-attendance/overtime-alerts", moduleCode: "time_attendance", Component: OvertimeAlertsPage },
        { path: "/time-attendance/labor-compliance", moduleCode: "time_attendance", Component: LaborCompliancePage },
        { path: "/time-attendance/flex-time", moduleCode: "time_attendance", Component: FlexTimePage },
        { path: "/time-attendance/regularization", moduleCode: "time_attendance", Component: AttendanceRegularizationPage },
        { path: "/time-attendance/cba-time-rules", moduleCode: "time_attendance", Component: CBATimeRulesPage },
        { path: "/time-attendance/cba-extensions", moduleCode: "time_attendance", Component: CBAExtensionsPage },
        { path: "/time-attendance/audit-trail", moduleCode: "time_attendance", Component: TimeAuditTrailPage },
        { path: "/time-attendance/shift-swaps", moduleCode: "time_attendance", Component: ShiftSwapsPage },
        { path: "/time/shift-differentials", moduleCode: "time_attendance", Component: ShiftDifferentialsPage },
        { path: "/time/geofence-locations", moduleCode: "time_attendance", Component: GeofenceLocationsPage },
        { path: "/time/face-verification", moduleCode: "time_attendance", Component: FaceVerificationPage },
        { path: "/time/project-costs", moduleCode: "time_attendance", Component: ProjectCostDashboardPage },
        { path: "/time/project-costs/config", moduleCode: "time_attendance", Component: ProjectCostConfigPage },
        { path: "/time/cost-allocation", moduleCode: "time_attendance", Component: CostAllocationPage },
      ])}
    </>
  );
}

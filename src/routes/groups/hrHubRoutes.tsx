import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const HRHubDashboardPage = lazy(() => import("@/pages/hr-hub/HRHubDashboardPage"));
const HRCalendarPage = lazy(() => import("@/pages/hr-hub/HRCalendarPage"));
const HRTasksPage = lazy(() => import("@/pages/hr-hub/HRTasksPage"));
 const ESSChangeRequestsPage = lazy(() => import("@/pages/hr/ESSChangeRequestsPage"));
const HRMilestonesPage = lazy(() => import("@/pages/hr-hub/HRMilestonesPage"));
const ComplianceTrackerPage = lazy(() => import("@/pages/hr-hub/ComplianceTrackerPage"));
const HRRemindersPage = lazy(() => import("@/pages/hr-hub/HRRemindersPage"));
const SOPManagementPage = lazy(() => import("@/pages/hr-hub/SOPManagementPage"));
const GovernmentIdTypesPage = lazy(() => import("@/pages/hr-hub/GovernmentIdTypesPage"));
const HRDataImportPage = lazy(() => import("@/pages/hr-hub/HRDataImportPage"));
const ReferenceDataCatalogPage = lazy(() => import("@/pages/hr-hub/ReferenceDataCatalogPage"));
const SentimentMonitoringPage = lazy(() => import("@/pages/hr-hub/SentimentMonitoringPage"));
const RecognitionAnalyticsPage = lazy(() => import("@/pages/hr-hub/RecognitionAnalyticsPage"));
const IntegrationDashboardPage = lazy(() => import("@/pages/hr-hub/IntegrationDashboardPage"));
const TransactionWorkflowSettingsPage = lazy(() => import("@/pages/hr-hub/TransactionWorkflowSettingsPage"));
const DirectoryPrivacyConfigPage = lazy(() => import("@/pages/hr-hub/DirectoryPrivacyConfigPage"));
const IntranetAdminPage = lazy(() => import("@/pages/hr-hub/IntranetAdminPage"));
const CompanyCommunicationsPage = lazy(() => import("@/pages/hr-hub/CompanyCommunicationsPage"));

export function HrHubRoutes() {
  const routes = renderProtectedLazyRoutes([
    { path: "/hr-hub", moduleCode: "hr_hub", Component: HRHubDashboardPage },
    { path: "/hr-hub/calendar", moduleCode: "hr_hub", Component: HRCalendarPage },
    { path: "/hr-hub/tasks", moduleCode: "hr_hub", Component: HRTasksPage },
    { path: "/hr-hub/ess-change-requests", moduleCode: "hr_hub", Component: ESSChangeRequestsPage },
    { path: "/hr-hub/milestones", moduleCode: "hr_hub", Component: HRMilestonesPage },
    { path: "/hr-hub/compliance-tracker", moduleCode: "hr_hub", Component: ComplianceTrackerPage },
    { path: "/hr-hub/reminders", moduleCode: "hr_hub", Component: HRRemindersPage },
    { path: "/hr-hub/sop-management", moduleCode: "hr_hub", Component: SOPManagementPage },
    { path: "/hr-hub/government-id-types", moduleCode: "hr_hub", Component: GovernmentIdTypesPage },
    { path: "/hr-hub/data-import", moduleCode: "hr_hub", Component: HRDataImportPage },
    { path: "/hr-hub/reference-data", moduleCode: "hr_hub", Component: ReferenceDataCatalogPage },
    { path: "/hr-hub/sentiment-monitoring", moduleCode: "hr_hub", Component: SentimentMonitoringPage },
    { path: "/hr-hub/recognition-analytics", moduleCode: "hr_hub", Component: RecognitionAnalyticsPage },
    { path: "/hr-hub/integrations", moduleCode: "hr_hub", Component: IntegrationDashboardPage },
    { path: "/hr-hub/transaction-workflow-settings", moduleCode: "hr_hub", Component: TransactionWorkflowSettingsPage },
    { path: "/hr-hub/directory-privacy", requiredRoles: ["admin", "hr_manager"], Component: DirectoryPrivacyConfigPage },
    { path: "/hr-hub/intranet-admin", requiredRoles: ["admin", "hr_manager"], Component: IntranetAdminPage },
    { path: "/hr-hub/company-communications", requiredRoles: ["admin", "hr_manager"], Component: CompanyCommunicationsPage },
  ]);

  return (
    <>
      {routes}
      <Route path="/hr-hub/ess-approval-policies" element={<Navigate to="/admin/ess-administration?tab=policies" replace />} />
    </>
  );
}

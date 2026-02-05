import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const HSEDashboardPage = lazy(() => import("@/pages/hse/HSEDashboardPage"));
const HSEIncidentsPage = lazy(() => import("@/pages/hse/HSEIncidentsPage"));
const HSERiskAssessmentPage = lazy(() => import("@/pages/hse/HSERiskAssessmentPage"));
const HSESafetyTrainingPage = lazy(() => import("@/pages/hse/HSESafetyTrainingPage"));
const HSECompliancePage = lazy(() => import("@/pages/hse/HSECompliancePage"));
const HSESafetyPoliciesPage = lazy(() => import("@/pages/hse/HSESafetyPoliciesPage"));
const HSEWorkersCompPage = lazy(() => import("@/pages/hse/HSEWorkersCompPage"));
const HSEPPEManagementPage = lazy(() => import("@/pages/hse/HSEPPEManagementPage"));
const HSEInspectionsPage = lazy(() => import("@/pages/hse/HSEInspectionsPage"));
const HSEEmergencyResponsePage = lazy(() => import("@/pages/hse/HSEEmergencyResponsePage"));
const HSEChemicalsPage = lazy(() => import("@/pages/hse/HSEChemicalsPage"));
const HSEOshaReportingPage = lazy(() => import("@/pages/hse/HSEOshaReportingPage"));
const HSEPermitToWorkPage = lazy(() => import("@/pages/hse/HSEPermitToWorkPage"));
const HSELotoPage = lazy(() => import("@/pages/hse/HSELotoPage"));
const HSENearMissPage = lazy(() => import("@/pages/hse/HSENearMissPage"));
const HSESafetyObservationsPage = lazy(() => import("@/pages/hse/HSESafetyObservationsPage"));
const HSEToolboxTalksPage = lazy(() => import("@/pages/hse/HSEToolboxTalksPage"));
const HSEFirstAidPage = lazy(() => import("@/pages/hse/HSEFirstAidPage"));
const HSEErgonomicsPage = lazy(() => import("@/pages/hse/HSEErgonomicsPage"));
const HSEAnalyticsPage = lazy(() => import("@/pages/hse/HSEAnalyticsPage"));

export function HseRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/hse", moduleCode: "hse", Component: HSEDashboardPage },
        { path: "/hse/incidents", moduleCode: "hse", Component: HSEIncidentsPage },
        { path: "/hse/risk-assessment", moduleCode: "hse", Component: HSERiskAssessmentPage },
        { path: "/hse/safety-training", moduleCode: "hse", Component: HSESafetyTrainingPage },
        { path: "/hse/compliance", moduleCode: "hse", Component: HSECompliancePage },
        { path: "/hse/safety-policies", moduleCode: "hse", Component: HSESafetyPoliciesPage },
        { path: "/hse/workers-comp", moduleCode: "hse", Component: HSEWorkersCompPage },
        { path: "/hse/ppe", moduleCode: "hse", Component: HSEPPEManagementPage },
        { path: "/hse/inspections", moduleCode: "hse", Component: HSEInspectionsPage },
        { path: "/hse/emergency-response", moduleCode: "hse", Component: HSEEmergencyResponsePage },
        { path: "/hse/chemicals", moduleCode: "hse", Component: HSEChemicalsPage },
        { path: "/hse/osha-reporting", moduleCode: "hse", Component: HSEOshaReportingPage },
        { path: "/hse/permit-to-work", moduleCode: "hse", Component: HSEPermitToWorkPage },
        { path: "/hse/loto", moduleCode: "hse", Component: HSELotoPage },
        { path: "/hse/near-miss", moduleCode: "hse", Component: HSENearMissPage },
        { path: "/hse/safety-observations", moduleCode: "hse", Component: HSESafetyObservationsPage },
        { path: "/hse/toolbox-talks", moduleCode: "hse", Component: HSEToolboxTalksPage },
        { path: "/hse/first-aid", moduleCode: "hse", Component: HSEFirstAidPage },
        { path: "/hse/ergonomics", moduleCode: "hse", Component: HSEErgonomicsPage },
        { path: "/hse/analytics", moduleCode: "hse", Component: HSEAnalyticsPage },
      ])}
    </>
  );
}

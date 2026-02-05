import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const WorkforceDashboardPage = lazy(() => import("@/pages/workforce/WorkforceDashboardPage"));
const AdminCompanyGroupsPage = lazy(() => import("@/pages/admin/AdminCompanyGroupsPage"));
const AdminCompaniesPage = lazy(() => import("@/pages/admin/AdminCompaniesPage"));
const EmployeesPage = lazy(() => import("@/pages/workforce/EmployeesPage"));
const EmployeeProfilePage = lazy(() => import("@/pages/workforce/EmployeeProfilePage"));
const PositionsPage = lazy(() => import("@/pages/workforce/PositionsPage"));
const OrgStructurePage = lazy(() => import("@/pages/workforce/OrgStructurePage"));
const OrgStructureConfigPage = lazy(() => import("@/pages/workforce/OrgStructureConfigPage"));
const DepartmentsPage = lazy(() => import("@/pages/workforce/DepartmentsPage"));
const OrgChangesPage = lazy(() => import("@/pages/workforce/OrgChangesPage"));
const EmployeeAssignmentsPage = lazy(() => import("@/pages/workforce/EmployeeAssignmentsPage"));
const EmployeeTransactionsPage = lazy(() => import("@/pages/workforce/EmployeeTransactionsPage"));
const WorkforceForecastingPage = lazy(() => import("@/pages/workforce/WorkforceForecastingPage"));
const WorkforceAnalyticsPage = lazy(() => import("@/pages/workforce/WorkforceAnalyticsPage"));
const QualificationsPage = lazy(() => import("@/pages/workforce/QualificationsPage"));
const CompanyBoardsPage = lazy(() => import("@/pages/workforce/CompanyBoardsPage"));
const GovernancePage = lazy(() => import("@/pages/workforce/GovernancePage"));
const JobFamiliesPage = lazy(() => import("@/pages/workforce/JobFamiliesPage"));
const JobsPage = lazy(() => import("@/pages/workforce/JobsPage"));
const CompetenciesPage = lazy(() => import("@/pages/workforce/CompetenciesPage"));
const CapabilityRegistryPage = lazy(() => import("@/pages/workforce/CapabilityRegistryPage"));
const ResponsibilitiesPage = lazy(() => import("@/pages/workforce/ResponsibilitiesPage"));
const AdminOnboardingPage = lazy(() => import("@/pages/admin/AdminOnboardingPage"));
const AdminOnboardingDetailPage = lazy(() => import("@/pages/admin/AdminOnboardingDetailPage"));
const OffboardingPage = lazy(() => import("@/pages/workforce/OffboardingPage"));
const PositionControlVacanciesPage = lazy(() => import("@/pages/workforce/PositionControlVacanciesPage"));
const HeadcountRequestsPage = lazy(() => import("@/pages/workforce/HeadcountRequestsPage"));
const HeadcountAnalyticsPage = lazy(() => import("@/pages/workforce/HeadcountAnalyticsPage"));
const HeadcountForecastPage = lazy(() => import("@/pages/workforce/HeadcountForecastPage"));
const DivisionsPage = lazy(() => import("@/pages/workforce/DivisionsPage"));

export function WorkforceRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/workforce", Component: WorkforceDashboardPage },
        { path: "/workforce/company-groups", requiredRoles: ["admin"], Component: AdminCompanyGroupsPage },
        { path: "/workforce/companies", requiredRoles: ["admin"], Component: AdminCompaniesPage },
        { path: "/workforce/employees", Component: EmployeesPage },
        { path: "/workforce/employees/:id", Component: EmployeeProfilePage },
        { path: "/workforce/positions", Component: PositionsPage },
        { path: "/workforce/org-chart", Component: OrgStructurePage },
        { path: "/workforce/org-structure", requiredRoles: ["admin"], Component: OrgStructureConfigPage },
        { path: "/workforce/departments", Component: DepartmentsPage },
        { path: "/workforce/org-changes", Component: OrgChangesPage },
        { path: "/workforce/assignments", Component: EmployeeAssignmentsPage },
        { path: "/workforce/transactions", requiredRoles: ["admin", "hr_manager"], Component: EmployeeTransactionsPage },
        { path: "/workforce/forecasting", requiredRoles: ["admin", "hr_manager"], Component: WorkforceForecastingPage },
        { path: "/workforce/analytics", requiredRoles: ["admin", "hr_manager"], Component: WorkforceAnalyticsPage },
        { path: "/workforce/qualifications", requiredRoles: ["admin", "hr_manager"], Component: QualificationsPage },
        { path: "/workforce/company-boards", requiredRoles: ["admin", "hr_manager"], Component: CompanyBoardsPage },
        { path: "/workforce/governance", requiredRoles: ["admin", "hr_manager"], Component: GovernancePage },
        { path: "/workforce/job-families", requiredRoles: ["admin", "hr_manager"], Component: JobFamiliesPage },
        { path: "/workforce/jobs", requiredRoles: ["admin", "hr_manager"], Component: JobsPage },
        { path: "/workforce/competencies", requiredRoles: ["admin", "hr_manager"], Component: CompetenciesPage },
        { path: "/workforce/capabilities", requiredRoles: ["admin", "hr_manager"], Component: CapabilityRegistryPage },
        { path: "/workforce/capability-registry", requiredRoles: ["admin", "hr_manager"], Component: CapabilityRegistryPage },
        { path: "/workforce/responsibilities", requiredRoles: ["admin", "hr_manager"], Component: ResponsibilitiesPage },
        { path: "/workforce/onboarding", requiredRoles: ["admin", "hr_manager"], Component: AdminOnboardingPage },
        { path: "/workforce/onboarding/:id", requiredRoles: ["admin", "hr_manager"], Component: AdminOnboardingDetailPage },
        { path: "/workforce/offboarding", requiredRoles: ["admin", "hr_manager"], Component: OffboardingPage },
        { path: "/workforce/position-control-vacancies", requiredRoles: ["admin"], Component: PositionControlVacanciesPage },
        { path: "/workforce/headcount-requests", requiredRoles: ["admin"], Component: HeadcountRequestsPage },
        { path: "/workforce/headcount-analytics", requiredRoles: ["admin"], Component: HeadcountAnalyticsPage },
        { path: "/workforce/headcount-forecast", requiredRoles: ["admin"], Component: HeadcountForecastPage },
        { path: "/workforce/divisions", requiredRoles: ["admin"], Component: DivisionsPage },
      ])}
    </>
  );
}

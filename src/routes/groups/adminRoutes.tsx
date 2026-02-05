import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminCustomFieldsPage = lazy(() => import("@/pages/admin/AdminCustomFieldsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminCompaniesPage = lazy(() => import("@/pages/admin/AdminCompaniesPage"));
const ClientRegistryPage = lazy(() => import("@/pages/admin/ClientRegistryPage"));
const ClientDetailPage = lazy(() => import("@/pages/admin/ClientDetailPage"));
const ClientProvisioningPage = lazy(() => import("@/pages/admin/ClientProvisioningPage"));
const AdminCompanyGroupsPage = lazy(() => import("@/pages/admin/AdminCompanyGroupsPage"));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/AdminAuditLogsPage"));
const AuditCoveragePage = lazy(() => import("@/pages/admin/AuditCoveragePage"));
const InvestigationRequestsPage = lazy(() => import("@/pages/admin/InvestigationRequestsPage"));
const AdminAIUsagePage = lazy(() => import("@/pages/admin/AdminAIUsagePage"));
const RoleManagementPage = lazy(() => import("@/pages/admin/RoleManagementPage"));
const RoleDetailPage = lazy(() => import("@/pages/admin/RoleDetailPage"));
const AdminPiiAccessPage = lazy(() => import("@/pages/admin/AdminPiiAccessPage"));
const AISecurityViolationsPage = lazy(() => import("@/pages/admin/AISecurityViolationsPage"));
const AIGovernancePage = lazy(() => import("@/pages/admin/AIGovernancePage"));
const CompanyRelationshipsPage = lazy(() => import("@/pages/admin/CompanyRelationshipsPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));
const CurrencyManagementPage = lazy(() => import("@/pages/admin/CurrencyManagementPage"));
const AdminColorSchemePage = lazy(() => import("@/pages/admin/AdminColorSchemePage"));
const TerritoriesPage = lazy(() => import("@/pages/admin/TerritoriesPage"));
const CompanyTagsPage = lazy(() => import("@/pages/admin/CompanyTagsPage"));
const GranularPermissionsPage = lazy(() => import("@/pages/admin/GranularPermissionsPage"));
const CompanyValuesPage = lazy(() => import("@/pages/admin/CompanyValuesPage"));
const AdminRemindersPage = lazy(() => import("@/pages/admin/AdminRemindersPage"));
const PermissionsOverviewPage = lazy(() => import("@/pages/admin/PermissionsOverviewPage"));
const AdminAccessRequestsPage = lazy(() => import("@/pages/admin/AdminAccessRequestsPage"));
const AdminAutoApprovalPage = lazy(() => import("@/pages/admin/AdminAutoApprovalPage"));
const AdminBulkImportPage = lazy(() => import("@/pages/admin/AdminBulkImportPage"));
const TranslationsPage = lazy(() => import("@/pages/admin/TranslationsPage"));
const AdminScheduledReportsPage = lazy(() => import("@/pages/admin/AdminScheduledReportsPage"));
const AdminKnowledgeBasePage = lazy(() => import("@/pages/admin/AdminKnowledgeBasePage"));
const AdminHelpdeskPage = lazy(() => import("@/pages/admin/AdminHelpdeskPage"));
const AdminPolicyDocumentsPage = lazy(() => import("@/pages/admin/AdminPolicyDocumentsPage"));
const AdminLetterTemplatesPage = lazy(() => import("@/pages/admin/AdminLetterTemplatesPage"));
const AdminWorkflowTemplatesPage = lazy(() => import("@/pages/admin/AdminWorkflowTemplatesPage"));
const AdminLookupValuesPage = lazy(() => import("@/pages/admin/AdminLookupValuesPage"));
const ImplementationHandbookPage = lazy(() => import("@/pages/admin/ImplementationHandbookPage"));
const FeaturesBrochurePage = lazy(() => import("@/pages/admin/FeaturesBrochurePage"));
const ModulesBrochurePage = lazy(() => import("@/pages/admin/ModulesBrochurePage"));
const AdminLmsManagementPage = lazy(() => import("@/pages/admin/AdminLmsManagementPage"));
const DemoManagementPage = lazy(() => import("@/pages/admin/DemoManagementPage"));
const DataManagementPage = lazy(() => import("@/pages/admin/DataManagementPage"));
const DemoAnalyticsDashboard = lazy(() => import("@/pages/admin/DemoAnalyticsDashboard"));
const ProspectJourneyPage = lazy(() => import("@/pages/admin/ProspectJourneyPage"));
const SubscriptionManagementPage = lazy(() => import("@/pages/admin/SubscriptionManagementPage"));
const MFASettingsPage = lazy(() => import("@/pages/admin/MFASettingsPage"));
const SSOSettingsPage = lazy(() => import("@/pages/admin/SSOSettingsPage"));
const PasswordPoliciesPage = lazy(() => import("@/pages/admin/PasswordPoliciesPage"));
const SessionManagementPage = lazy(() => import("@/pages/admin/SessionManagementPage"));
const EmployeeDirectoryPage = lazy(() => import("@/pages/admin/EmployeeDirectoryPage"));
const CompanyAnnouncementsPage = lazy(() => import("@/pages/admin/CompanyAnnouncementsPage"));
const ApprovalDelegationsPage = lazy(() => import("@/pages/admin/ApprovalDelegationsPage"));
const CompanyDocumentsPage = lazy(() => import("@/pages/admin/CompanyDocumentsPage"));
const ESSAdministrationPage = lazy(() => import("@/pages/admin/ESSAdministrationPage"));

export function AdminRoutes() {
  const baseRoutes = renderProtectedLazyRoutes([
    { path: "/admin", requiredRoles: ["admin"], Component: AdminDashboardPage },
    { path: "/admin/custom-fields", requiredRoles: ["admin"], Component: AdminCustomFieldsPage },
    { path: "/admin/users", requiredRoles: ["admin"], Component: AdminUsersPage },
    { path: "/admin/companies", requiredRoles: ["admin"], Component: AdminCompaniesPage },
    { path: "/admin/client-registry", requiredRoles: ["admin"], Component: ClientRegistryPage },
    { path: "/admin/client-registry/:id", requiredRoles: ["admin"], Component: ClientDetailPage },
    { path: "/admin/client-registry/:id/provisioning", requiredRoles: ["admin"], Component: ClientProvisioningPage },
    { path: "/admin/company-groups", requiredRoles: ["admin"], Component: AdminCompanyGroupsPage },
    { path: "/admin/audit-logs", requiredRoles: ["admin"], Component: AdminAuditLogsPage },
    { path: "/admin/audit-coverage", requiredRoles: ["admin"], Component: AuditCoveragePage },
    { path: "/admin/investigation-requests", requiredRoles: ["admin", "hr_manager"], Component: InvestigationRequestsPage },
    { path: "/admin/ai-usage", requiredRoles: ["admin"], Component: AdminAIUsagePage },
    { path: "/admin/roles", requiredRoles: ["admin"], Component: RoleManagementPage },
    { path: "/admin/roles/:id", requiredRoles: ["admin"], Component: RoleDetailPage },
    { path: "/admin/pii-access", requiredRoles: ["admin"], Component: AdminPiiAccessPage },
    { path: "/admin/ai-security-violations", requiredRoles: ["admin"], Component: AISecurityViolationsPage },
    { path: "/admin/ai-governance", requiredRoles: ["admin"], Component: AIGovernancePage },
    { path: "/admin/company-relationships", requiredRoles: ["admin"], Component: CompanyRelationshipsPage },
    { path: "/admin/settings", requiredRoles: ["admin"], Component: AdminSettingsPage },
    { path: "/admin/currencies", requiredRoles: ["admin"], Component: CurrencyManagementPage },
    { path: "/admin/color-scheme", requiredRoles: ["admin"], Component: AdminColorSchemePage },
    { path: "/admin/territories", requiredRoles: ["admin"], Component: TerritoriesPage },
    { path: "/admin/company-tags", requiredRoles: ["admin"], Component: CompanyTagsPage },
    { path: "/admin/granular-permissions", requiredRoles: ["admin"], Component: GranularPermissionsPage },
    { path: "/admin/company-values", requiredRoles: ["admin"], Component: CompanyValuesPage },
    { path: "/admin/reminders", requiredRoles: ["admin"], Component: AdminRemindersPage },
    { path: "/admin/permissions", requiredRoles: ["admin"], Component: PermissionsOverviewPage },
    { path: "/admin/access-requests", requiredRoles: ["admin"], Component: AdminAccessRequestsPage },
    { path: "/admin/auto-approval", requiredRoles: ["admin"], Component: AdminAutoApprovalPage },
    { path: "/admin/bulk-import", requiredRoles: ["admin"], Component: AdminBulkImportPage },
    { path: "/admin/translations", requiredRoles: ["admin"], Component: TranslationsPage },
    { path: "/admin/languages", requiredRoles: ["admin"], Component: TranslationsPage },
    { path: "/admin/scheduled-reports", requiredRoles: ["admin"], Component: AdminScheduledReportsPage },
    { path: "/admin/knowledge-base", requiredRoles: ["admin"], Component: AdminKnowledgeBasePage },
    { path: "/admin/helpdesk", requiredRoles: ["admin"], Component: AdminHelpdeskPage },
    { path: "/admin/policy-documents", requiredRoles: ["admin"], Component: AdminPolicyDocumentsPage },
    { path: "/admin/letter-templates", requiredRoles: ["admin"], Component: AdminLetterTemplatesPage },
    { path: "/admin/workflow-templates", requiredRoles: ["admin"], Component: AdminWorkflowTemplatesPage },
    { path: "/admin/lookup-values", requiredRoles: ["admin"], Component: AdminLookupValuesPage },
    { path: "/admin/implementation-handbook", requiredRoles: ["admin", "hr_manager"], Component: ImplementationHandbookPage },
    { path: "/admin/features-brochure", requiredRoles: ["admin", "hr_manager"], Component: FeaturesBrochurePage },
    { path: "/admin/modules-brochure", requiredRoles: ["admin", "hr_manager"], Component: ModulesBrochurePage },
    { path: "/admin/lms", requiredRoles: ["admin", "hr_manager"], Component: AdminLmsManagementPage },
    { path: "/admin/demo-management", requiredRoles: ["admin", "hr_manager"], Component: DemoManagementPage },
    { path: "/admin/data-management", requiredRoles: ["admin"], Component: DataManagementPage },
    { path: "/admin/demo-analytics", requiredRoles: ["admin", "hr_manager"], Component: DemoAnalyticsDashboard },
    { path: "/admin/demo-analytics/prospect/:sessionId", requiredRoles: ["admin", "hr_manager"], Component: ProspectJourneyPage },
    { path: "/admin/subscriptions", requiredRoles: ["admin"], Component: SubscriptionManagementPage },
    { path: "/admin/mfa-settings", requiredRoles: ["admin"], Component: MFASettingsPage },
    { path: "/admin/sso-settings", requiredRoles: ["admin"], Component: SSOSettingsPage },
    { path: "/admin/password-policies", requiredRoles: ["admin"], Component: PasswordPoliciesPage },
    { path: "/admin/session-management", requiredRoles: ["admin"], Component: SessionManagementPage },
    { path: "/admin/employee-directory", requiredRoles: ["admin", "hr_manager"], Component: EmployeeDirectoryPage },
    { path: "/admin/company-announcements", requiredRoles: ["admin", "hr_manager"], Component: CompanyAnnouncementsPage },
    { path: "/admin/approval-delegations", requiredRoles: ["admin", "hr_manager"], Component: ApprovalDelegationsPage },
    { path: "/admin/company-documents", requiredRoles: ["admin", "hr_manager"], Component: CompanyDocumentsPage },
    { path: "/admin/ess-administration", requiredRoles: ["admin", "hr_manager"], Component: ESSAdministrationPage },
  ]);

  return (
    <>
      {baseRoutes}
      <Route path="/admin/ess-configuration" element={<Navigate to="/admin/ess-administration" replace />} />
    </>
  );
}

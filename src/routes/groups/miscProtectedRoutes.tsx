import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const StrategicPlanningHubPage = lazy(() => import("@/pages/strategic-planning/StrategicPlanningHubPage"));
const OrgDesignPage = lazy(() => import("@/pages/strategic-planning/OrgDesignPage"));
const ScenarioPlanningPage = lazy(() => import("@/pages/strategic-planning/ScenarioPlanningPage"));

const ReportingHubPage = lazy(() => import("@/pages/reporting/ReportingHubPage"));
const DashboardsPage = lazy(() => import("@/pages/reporting/DashboardsPage"));
const ReportBuilderPage = lazy(() => import("@/pages/reporting/ReportBuilderPage"));
const AIInsightsPage = lazy(() => import("@/pages/reporting/AIInsightsPage"));
const DataExportPage = lazy(() => import("@/pages/reporting/DataExportPage"));

const TalentInsightsPage = lazy(() => import("@/pages/insights/TalentInsightsPage"));
const CompensationInsightsPage = lazy(() => import("@/pages/insights/CompensationInsightsPage"));
const OperationalInsightsPage = lazy(() => import("@/pages/insights/OperationalInsightsPage"));

const SystemHubPage = lazy(() => import("@/pages/system/SystemHubPage"));
const AgentManagementHubPage = lazy(() => import("@/pages/system/AgentManagementHubPage"));
const APIManagementPage = lazy(() => import("@/pages/system/APIManagementPage"));
 const SystemAuditLogsPage = lazy(() => import("@/pages/system/AuditLogsPage"));
const SecuritySettingsPage = lazy(() => import("@/pages/system/SecuritySettingsPage"));
const SystemConfigPage = lazy(() => import("@/pages/system/SystemConfigPage"));

const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const MyPermissionsPage = lazy(() => import("@/pages/profile/MyPermissionsPage"));
const NotificationPreferencesPage = lazy(() => import("@/pages/profile/NotificationPreferencesPage"));
const PrivacySettingsPage = lazy(() => import("@/pages/profile/PrivacySettingsPage"));

const HelpCenterPage = lazy(() => import("@/pages/help/HelpCenterPage"));
const HelpChatPage = lazy(() => import("@/pages/help/HelpChatPage"));
const KnowledgeBasePage = lazy(() => import("@/pages/help/KnowledgeBasePage"));
const ArticleVersionHistoryPage = lazy(() => import("@/pages/help/ArticleVersionHistoryPage"));
const TicketsPage = lazy(() => import("@/pages/help/TicketsPage"));
const NewTicketPage = lazy(() => import("@/pages/help/NewTicketPage"));
const TicketDetailPage = lazy(() => import("@/pages/help/TicketDetailPage"));

const MessagingPage = lazy(() => import("@/pages/messaging/MessagingPage"));
const MyApprovalsPage = lazy(() => import("@/pages/workflow/MyApprovalsPage"));
const MyDelegatesPage = lazy(() => import("@/pages/workflow/MyDelegatesPage"));
const IntranetDashboardPage = lazy(() => import("@/pages/intranet/IntranetDashboardPage"));
const StaffLoanDesignDocumentPage = lazy(() => import("@/pages/documents/StaffLoanDesignDocumentPage"));

export function MiscProtectedRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/strategic-planning", Component: StrategicPlanningHubPage },
        { path: "/strategic-planning/org-design", Component: OrgDesignPage },
        { path: "/strategic-planning/scenario-planning", Component: ScenarioPlanningPage },

        { path: "/reporting", Component: ReportingHubPage },
        { path: "/reporting/dashboards", Component: DashboardsPage },
        { path: "/reporting/report-builder", Component: ReportBuilderPage },
        { path: "/reporting/ai-insights", Component: AIInsightsPage },
        { path: "/reporting/data-export", Component: DataExportPage },

        { path: "/insights/talent", Component: TalentInsightsPage },
        { path: "/insights/compensation", Component: CompensationInsightsPage },
        { path: "/insights/operational", Component: OperationalInsightsPage },

        { path: "/system", requiredRoles: ["admin"], Component: SystemHubPage },
        { path: "/system/agents", requiredRoles: ["admin"], Component: AgentManagementHubPage },
        { path: "/system/api", requiredRoles: ["admin"], Component: APIManagementPage },
        { path: "/system/audit-logs", requiredRoles: ["admin"], Component: SystemAuditLogsPage },
        { path: "/system/security", requiredRoles: ["admin"], Component: SecuritySettingsPage },
        { path: "/system/config", requiredRoles: ["admin"], Component: SystemConfigPage },

        { path: "/profile", Component: ProfilePage },
        { path: "/profile/permissions", Component: MyPermissionsPage },
        { path: "/profile/notifications", Component: NotificationPreferencesPage },
        { path: "/profile/privacy", Component: PrivacySettingsPage },

        { path: "/help", Component: HelpCenterPage },
        { path: "/help/chat", Component: HelpChatPage },
        { path: "/help/kb", Component: KnowledgeBasePage },
        { path: "/help/kb/articles/:articleId/history", requiredRoles: ["admin"], Component: ArticleVersionHistoryPage },
        { path: "/help/tickets", Component: TicketsPage },
        { path: "/help/tickets/new", Component: NewTicketPage },
        { path: "/help/tickets/:id", Component: TicketDetailPage },

        { path: "/messaging", Component: MessagingPage },

        { path: "/workflow/approvals", Component: MyApprovalsPage },
        { path: "/workflow/delegates", Component: MyDelegatesPage },

        { path: "/intranet", Component: IntranetDashboardPage },

        { path: "/documents/staff-loan-design", Component: StaffLoanDesignDocumentPage },
      ])}
    </>
  );
}

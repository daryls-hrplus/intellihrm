import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Headset,
  FileText,
  BookOpen,
  Megaphone,
  FolderOpen,
  UserCheck,
  ClipboardList,
  Calendar,
  CheckSquare,
  ShieldCheck,
  FileStack,
  Gift,
  Zap,
  BarChart3,
  FolderTree,
  List,
  IdCard,
  GitBranch,
  Bot,
  Users,
  Upload,
  Brain,
  UserCog,
  Settings,
  Mail,
} from "lucide-react";

// Hub sections and quick actions are now defined inside the component for i18n

export default function HRHubDashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { company } = useAuth();

  // Fetch pending ESS change requests count
  const { data: pendingESSCount = 0 } = useQuery({
    queryKey: ["pending-ess-change-requests-count", company?.id],
    queryFn: async () => {
      const query = supabase
        .from("employee_data_change_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      
      if (company?.id) {
        query.eq("company_id", company.id);
      }
      
      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
    enabled: true,
  });

  const hubSections = [
    // Section 1: Tasks, Events & Approvals (Daily actions - most used)
    {
      titleKey: "hrHub.tasksEventsApprovals",
      items: [
        { titleKey: "hrHub.essChangeRequests", descKey: "hrHub.essChangeRequestsDesc", icon: UserCog, href: "/hr-hub/ess-change-requests", badge: null, pendingCount: pendingESSCount },
        { titleKey: "hrHub.tasks", descKey: "hrHub.tasksDesc", icon: CheckSquare, href: "/hr-hub/tasks", badge: null },
        { titleKey: "hrHub.calendar", descKey: "hrHub.calendarDesc", icon: Calendar, href: "/hr-hub/calendar", badge: null },
        { titleKey: "hrHub.milestones", descKey: "hrHub.milestonesDesc", icon: Gift, href: "/hr-hub/milestones", badge: null },
      ],
    },
    // Section 2: Communication & Support Center
    {
      titleKey: "hrHub.communicationSupportCenter",
      items: [
        { titleKey: "hrHub.communicationsReminders", descKey: "hrHub.communicationsRemindersDesc", icon: Mail, href: "/hr-hub/reminders", badge: null },
        { titleKey: "hrHub.employeeDirectory", descKey: "hrHub.employeeDirectoryDesc", icon: Users, href: "/ess/directory?from=hr-hub", badge: null },
        { titleKey: "hrHub.helpDesk", descKey: "hrHub.helpDeskDesc", icon: Headset, href: "/admin/helpdesk", badge: null },
        { titleKey: "hrHub.announcements", descKey: "hrHub.announcementsDesc", icon: Megaphone, href: "/admin/announcements", badge: null },
        { titleKey: "hrHub.knowledgeBase", descKey: "hrHub.knowledgeBaseDesc", icon: BookOpen, href: "/admin/knowledge-base", badge: null },
      ],
    },
    // Section 3: Publishing & Content (NEW - content management)
    {
      titleKey: "hrHub.publishingContent",
      items: [
        { titleKey: "hrHub.intranetAdmin.title", descKey: "hrHub.intranetAdmin.description", icon: Megaphone, href: "/hr-hub/intranet-admin", badge: null },
        { titleKey: "hrHub.companyDocuments", descKey: "hrHub.companyDocumentsDesc", icon: FolderOpen, href: "/admin/documents", badge: null },
        { titleKey: "hrHub.policyDocuments", descKey: "hrHub.policyDocumentsDesc", icon: FileStack, href: "/admin/policy-documents", badge: null },
        { titleKey: "hrHub.letterTemplates", descKey: "hrHub.letterTemplatesDesc", icon: FileText, href: "/admin/letter-templates", badge: null },
        { titleKey: "hrHub.formsLibrary", descKey: "hrHub.formsLibraryDesc", icon: ClipboardList, href: "/hr-hub/forms", badge: "hrHub.comingSoon" },
      ],
    },
    // Section 4: Compliance & Governance
    {
      titleKey: "hrHub.complianceGovernance",
      items: [
        { titleKey: "hrHub.compliance", descKey: "hrHub.complianceDesc", icon: ShieldCheck, href: "/hr-hub/compliance", badge: null },
        { titleKey: "hrHub.integrationHub", descKey: "hrHub.integrationHubDesc", icon: GitBranch, href: "/hr-hub/integrations", badge: null },
      ],
    },
    // Section 5: Workflow Configuration
    {
      titleKey: "hrHub.workflowConfiguration",
      items: [
        { titleKey: "hrHub.workflowTemplates", descKey: "hrHub.workflowTemplatesDesc", icon: GitBranch, href: "/admin/workflow-templates", badge: null },
        { titleKey: "hrHub.transactionWorkflowSettings.title", descKey: "hrHub.transactionWorkflowSettings.shortDesc", icon: FileText, href: "/hr-hub/transaction-workflow-settings", badge: null },
        { titleKey: "hrHub.approvalDelegations", descKey: "hrHub.approvalDelegationsDesc", icon: UserCheck, href: "/admin/delegations", badge: null },
        { titleKey: "hrHub.sopManagement.title", descKey: "hrHub.sopManagement.description", icon: Bot, href: "/hr-hub/sop-management", badge: null },
        { titleKey: "hrHub.essApprovalPolicies.title", descKey: "hrHub.essApprovalPolicies.shortDesc", icon: Settings, href: "/hr-hub/ess-approval-policies", badge: null },
      ],
    },
    // Section 6: Organization & Configuration
    {
      titleKey: "hrHub.organizationConfiguration",
      items: [
        { titleKey: "hrHub.orgStructure", descKey: "hrHub.orgStructureDesc", icon: FolderTree, href: "/workforce/org-structure", badge: null },
        { titleKey: "hrHub.lookupValues", descKey: "hrHub.lookupValuesDesc", icon: List, href: "/admin/lookup-values", badge: null },
        { titleKey: "hrHub.governmentIdTypes", descKey: "hrHub.governmentIdTypesDesc", icon: IdCard, href: "/hr-hub/government-id-types", badge: null },
        { titleKey: "hrHub.dataImport.title", descKey: "hrHub.dataImport.shortDesc", icon: Upload, href: "/hr-hub/data-import", badge: null },
      ],
    },
    // Section 7: Analytics & Insights
    {
      titleKey: "hrHub.analyticsInsights",
      items: [
        { titleKey: "hrHub.sentimentMonitoring", descKey: "hrHub.sentimentMonitoringDesc", icon: Brain, href: "/hr-hub/sentiment-monitoring", badge: null },
        { titleKey: "hrHub.recognitionAnalytics", descKey: "hrHub.recognitionAnalyticsDesc", icon: Gift, href: "/hr-hub/recognition-analytics", badge: null },
        { titleKey: "hrHub.scheduledReports", descKey: "hrHub.scheduledReportsDesc", icon: BarChart3, href: "/admin/scheduled-reports", badge: null },
      ],
    },
  ];

  const quickActions = [
    { titleKey: "hrHub.newAnnouncement", icon: Megaphone, href: "/admin/announcements" },
    { titleKey: "hrHub.createLetter", icon: FileText, href: "/admin/letter-templates" },
    { titleKey: "hrHub.viewTickets", icon: Headset, href: "/admin/helpdesk" },
    { titleKey: "hrHub.addEvent", icon: Calendar, href: "/hr-hub/calendar" },
    { titleKey: "hrHub.sentimentMonitoring", icon: Brain, href: "/hr-hub/sentiment-monitoring" },
  ];

  const breadcrumbItems = [{ label: t("hrHub.title") }];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("hrHub.commandCenter")}</h1>
            <p className="text-muted-foreground">{t("hrHub.commandCenterSubtitle")}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t("hrHub.quickActions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.titleKey}
                  onClick={() => navigate(action.href)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border hover:bg-muted transition-colors"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t(action.titleKey)}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hub Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hubSections.map((section) => (
            <Card key={section.titleKey}>
              <CardHeader>
                <CardTitle className="text-lg">{t(section.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.titleKey}
                    onClick={() => !item.badge && navigate(item.href)}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      item.badge
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-muted cursor-pointer"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{t(item.titleKey)}</h3>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {t(item.badge)}
                          </Badge>
                        )}
                        {"pendingCount" in item && item.pendingCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {item.pendingCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

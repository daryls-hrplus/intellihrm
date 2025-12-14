import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
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
  GitBranch,
} from "lucide-react";

const hubSections = [
  {
    title: "Communication & Support",
    items: [
      { title: "Help Desk", description: "Manage employee tickets and support requests", icon: Headset, href: "/admin/helpdesk", badge: null },
      { title: "Announcements", description: "Create and manage company-wide announcements", icon: Megaphone, href: "/admin/announcements", badge: null },
      { title: "Knowledge Base", description: "Manage help articles and documentation", icon: BookOpen, href: "/admin/knowledge-base", badge: null },
    ],
  },
  {
    title: "Documents & Templates",
    items: [
      { title: "Letter Templates", description: "Manage form letters and document templates", icon: FileText, href: "/admin/letter-templates", badge: null },
      { title: "Company Documents", description: "Manage shared company documents", icon: FolderOpen, href: "/admin/documents", badge: null },
      { title: "Policy Documents", description: "Manage policy and procedure documents", icon: FileStack, href: "/admin/policy-documents", badge: null },
      { title: "Forms Library", description: "HR forms and request templates", icon: ClipboardList, href: "/hr-hub/forms", badge: "Coming Soon" },
    ],
  },
  {
    title: "Tasks & Events",
    items: [
      { title: "HR Calendar", description: "View and manage HR events and deadlines", icon: Calendar, href: "/hr-hub/calendar", badge: null },
      { title: "HR Tasks", description: "Track and manage HR department tasks", icon: CheckSquare, href: "/hr-hub/tasks", badge: null },
      { title: "Milestones Dashboard", description: "Track birthdays, anniversaries, and milestones", icon: Gift, href: "/hr-hub/milestones", badge: null },
    ],
  },
  {
    title: "Compliance & Workflows",
    items: [
      { title: "Compliance Tracker", description: "Track compliance deadlines and requirements", icon: ShieldCheck, href: "/hr-hub/compliance", badge: null },
      { title: "Workflow Templates", description: "Configure approval workflow templates", icon: GitBranch, href: "/admin/workflow-templates", badge: null },
      { title: "Approval Delegations", description: "Manage approval delegation settings", icon: UserCheck, href: "/admin/delegations", badge: null },
      { title: "Scheduled Reports", description: "Configure automated report delivery", icon: BarChart3, href: "/admin/scheduled-reports", badge: null },
    ],
  },
  {
    title: "Organization & Configuration",
    items: [
      { title: "Organisational Structure", description: "Manage company org structure and hierarchy", icon: FolderTree, href: "/admin/org-structure", badge: null },
      { title: "Lookup Values", description: "Manage system lookup values and codes", icon: List, href: "/admin/lookup-values", badge: null },
    ],
  },
];

const quickActions = [
  { title: "New Announcement", icon: Megaphone, href: "/admin/announcements" },
  { title: "Create Letter", icon: FileText, href: "/admin/letter-templates" },
  { title: "View Tickets", icon: Headset, href: "/admin/helpdesk" },
  { title: "Add Event", icon: Calendar, href: "/hr-hub/calendar" },
];

export default function HRHubDashboardPage() {
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "HR Hub" }];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">HR Command Center</h1>
            <p className="text-muted-foreground">Central hub for all HR utilities and tasks</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.href)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border hover:bg-muted transition-colors"
                >
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hub Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hubSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.items.map((item) => (
                  <div
                    key={item.title}
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
                        <h3 className="font-medium">{item.title}</h3>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
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

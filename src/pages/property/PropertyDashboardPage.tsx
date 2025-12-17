import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { useLanguage } from "@/hooks/useLanguage";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  Package,
  Laptop,
  Users,
  Clipboard,
  Wrench,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

export default function PropertyDashboardPage() {
  const { t } = useLanguage();
  const { hasTabAccess } = useGranularPermissions();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const {
    items,
    assignments,
    requests,
    maintenance,
  } = usePropertyManagement(selectedCompanyId);

  const totalAssets = items?.length || 0;
  const assignedAssets = items?.filter(item => item.status === 'assigned').length || 0;
  const pendingRequests = requests?.filter(req => req.status === 'pending').length || 0;
  const maintenanceDue = maintenance?.filter(m => m.status === 'scheduled').length || 0;

  const allModules = {
    analytics: { title: t("companyProperty.tabs.analytics"), description: t("companyProperty.modules.analyticsDesc", "View property analytics and insights"), href: "/property/analytics", icon: BarChart3, color: "bg-chart-1/10 text-chart-1", tabCode: "analytics" },
    assets: { title: t("companyProperty.tabs.assets"), description: t("companyProperty.modules.assetsDesc", "Manage company assets and inventory"), href: "/property/assets", icon: Laptop, color: "bg-chart-2/10 text-chart-2", tabCode: "assets" },
    categories: { title: t("companyProperty.tabs.categories"), description: t("companyProperty.modules.categoriesDesc", "Organize assets by category"), href: "/property/categories", icon: FolderOpen, color: "bg-primary/10 text-primary", tabCode: "categories" },
    assignments: { title: t("companyProperty.tabs.assignments"), description: t("companyProperty.modules.assignmentsDesc", "Track asset assignments to employees"), href: "/property/assignments", icon: Users, color: "bg-chart-3/10 text-chart-3", tabCode: "assignments" },
    requests: { title: t("companyProperty.tabs.requests"), description: t("companyProperty.modules.requestsDesc", "Handle property requests from employees"), href: "/property/requests", icon: Clipboard, color: "bg-chart-4/10 text-chart-4", tabCode: "requests" },
    maintenance: { title: t("companyProperty.tabs.maintenance"), description: t("companyProperty.modules.maintenanceDesc", "Schedule and track maintenance tasks"), href: "/property/maintenance", icon: Wrench, color: "bg-chart-5/10 text-chart-5", tabCode: "maintenance" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("property", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "property.groups.inventory",
      items: filterByAccess([allModules.assets, allModules.categories]),
    },
    {
      titleKey: "property.groups.allocation",
      items: filterByAccess([allModules.assignments, allModules.requests]),
    },
    {
      titleKey: "property.groups.maintenance",
      items: filterByAccess([allModules.maintenance]),
    },
    {
      titleKey: "property.groups.analytics",
      items: filterByAccess([allModules.analytics]),
    },
  ];

  const statCards = [
    { label: t("companyProperty.stats.totalAssets"), value: totalAssets, icon: Package, color: "bg-primary/10 text-primary" },
    { label: t("companyProperty.stats.assigned"), value: assignedAssets, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: t("companyProperty.stats.pendingRequests"), value: pendingRequests, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: t("companyProperty.stats.maintenanceDue"), value: maintenanceDue, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("companyProperty.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("companyProperty.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter 
                selectedCompanyId={selectedCompanyId} 
                onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
              />
              <DepartmentFilter
                companyId={selectedCompanyId}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
              <ModuleBIButton module="property" />
              <ModuleReportsButton module="property" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <GroupedModuleCards sections={sections} />
      </div>
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import PropertyCategoriesTab from "@/components/property/PropertyCategoriesTab";
import PropertyItemsTab from "@/components/property/PropertyItemsTab";
import PropertyAssignmentsTab from "@/components/property/PropertyAssignmentsTab";
import PropertyRequestsTab from "@/components/property/PropertyRequestsTab";
import PropertyMaintenanceTab from "@/components/property/PropertyMaintenanceTab";
import { PropertyAnalytics } from "@/components/property/PropertyAnalytics";
import { useLanguage } from "@/hooks/useLanguage";
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
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const {
    items,
    assignments,
    requests,
    maintenance,
    categories,
  } = usePropertyManagement(selectedCompanyId);

  const totalAssets = items?.length || 0;
  const assignedAssets = items?.filter(item => item.status === 'assigned').length || 0;
  const pendingRequests = requests?.filter(req => req.status === 'pending').length || 0;
  const maintenanceDue = maintenance?.filter(m => m.status === 'scheduled').length || 0;

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

        {/* Tabs for Property Management */}
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("companyProperty.tabs.analytics")}</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              <span className="hidden sm:inline">{t("companyProperty.tabs.assets")}</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t("companyProperty.tabs.assignments")}</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span className="hidden sm:inline">{t("companyProperty.tabs.requests")}</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">{t("companyProperty.tabs.maintenance")}</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t("companyProperty.tabs.categories")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <PropertyAnalytics 
              items={items}
              assignments={assignments}
              requests={requests}
              maintenance={maintenance}
              categories={categories}
            />
          </TabsContent>
          <TabsContent value="items">
            <PropertyItemsTab companyId={selectedCompanyId} />
          </TabsContent>
          <TabsContent value="assignments">
            <PropertyAssignmentsTab companyId={selectedCompanyId} />
          </TabsContent>
          <TabsContent value="requests">
            <PropertyRequestsTab companyId={selectedCompanyId} />
          </TabsContent>
          <TabsContent value="maintenance">
            <PropertyMaintenanceTab companyId={selectedCompanyId} />
          </TabsContent>
          <TabsContent value="categories">
            <PropertyCategoriesTab companyId={selectedCompanyId} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

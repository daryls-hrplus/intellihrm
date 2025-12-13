import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import PropertyCategoriesTab from "@/components/property/PropertyCategoriesTab";
import PropertyItemsTab from "@/components/property/PropertyItemsTab";
import PropertyAssignmentsTab from "@/components/property/PropertyAssignmentsTab";
import PropertyRequestsTab from "@/components/property/PropertyRequestsTab";
import PropertyMaintenanceTab from "@/components/property/PropertyMaintenanceTab";
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
} from "lucide-react";

export default function PropertyDashboardPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const {
    items,
    requests,
    maintenance,
  } = usePropertyManagement(selectedCompanyId);

  const totalAssets = items?.length || 0;
  const assignedAssets = items?.filter(item => item.status === 'assigned').length || 0;
  const pendingRequests = requests?.filter(req => req.status === 'pending').length || 0;
  const maintenanceDue = maintenance?.filter(m => m.status === 'scheduled').length || 0;

  const statCards = [
    { label: "Total Assets", value: totalAssets, icon: Package, color: "bg-primary/10 text-primary" },
    { label: "Assigned", value: assignedAssets, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Pending Requests", value: pendingRequests, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Maintenance Due", value: maintenanceDue, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
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
                  Company Property
                </h1>
                <p className="text-muted-foreground">
                  Asset management and tracking
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter 
                selectedCompanyId={selectedCompanyId} 
                onCompanyChange={setSelectedCompanyId} 
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
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Laptop className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Categories</span>
            </TabsTrigger>
          </TabsList>

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

import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTabState } from "@/hooks/useTabState";
import { useAuth } from "@/contexts/AuthContext";
import PropertyMaintenanceTab from "@/components/property/PropertyMaintenanceTab";
import { useLanguage } from "@/hooks/useLanguage";
import { Wrench } from "lucide-react";

export default function PropertyMaintenancePage() {
  const { t } = useLanguage();
  const { company } = useAuth();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedCompanyId: "",
    },
    syncToUrl: ["selectedCompanyId"],
  });

  const { selectedCompanyId } = tabState;

  // Initialize company from auth context if not set
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setTabState({ selectedCompanyId: company.id });
    }
  }, [company?.id, selectedCompanyId, setTabState]);

  const breadcrumbItems = [
    { label: t("companyProperty.title"), href: "/property" },
    { label: t("companyProperty.tabs.maintenance") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("companyProperty.tabs.maintenance")}
              </h1>
              <p className="text-muted-foreground">
                {t("companyProperty.modules.maintenanceDesc", "Schedule and track maintenance tasks")}
              </p>
            </div>
          </div>
          <LeaveCompanyFilter 
            selectedCompanyId={selectedCompanyId} 
            onCompanyChange={(id) => setTabState({ selectedCompanyId: id })} 
          />
        </div>

        <PropertyMaintenanceTab companyId={selectedCompanyId} />
      </div>
    </AppLayout>
  );
}

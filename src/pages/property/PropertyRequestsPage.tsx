import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTabState } from "@/hooks/useTabState";
import { useAuth } from "@/contexts/AuthContext";
import PropertyRequestsTab from "@/components/property/PropertyRequestsTab";
import { useLanguage } from "@/hooks/useLanguage";
import { Clipboard } from "lucide-react";

export default function PropertyRequestsPage() {
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
    { label: t("companyProperty.tabs.requests") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clipboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("companyProperty.tabs.requests")}
              </h1>
              <p className="text-muted-foreground">
                {t("companyProperty.modules.requestsDesc", "Handle property requests from employees")}
              </p>
            </div>
          </div>
          <LeaveCompanyFilter 
            selectedCompanyId={selectedCompanyId} 
            onCompanyChange={(id) => setTabState({ selectedCompanyId: id })} 
          />
        </div>

        <PropertyRequestsTab companyId={selectedCompanyId} />
      </div>
    </AppLayout>
  );
}

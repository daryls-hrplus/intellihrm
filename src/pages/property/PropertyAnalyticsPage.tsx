import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePropertyManagement } from "@/hooks/usePropertyManagement";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PropertyAnalytics } from "@/components/property/PropertyAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { useTabState } from "@/hooks/useTabState";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3 } from "lucide-react";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";

export default function PropertyAnalyticsPage() {
  const { t } = useLanguage();
  const { company } = useAuth();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedCompanyId: "",
      activeTab: "charts",
    },
    syncToUrl: ["selectedCompanyId", "activeTab"],
  });

  const { selectedCompanyId, activeTab } = tabState;

  // Initialize company from auth context if not set
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setTabState({ selectedCompanyId: company.id });
    }
  }, [company?.id, selectedCompanyId, setTabState]);

  const {
    items,
    assignments,
    requests,
    maintenance,
    categories,
  } = usePropertyManagement(selectedCompanyId);

  const breadcrumbItems = [
    { label: t("companyProperty.title"), href: "/property" },
    { label: t("companyProperty.tabs.analytics") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("companyProperty.tabs.analytics")}
              </h1>
              <p className="text-muted-foreground">
                {t("companyProperty.modules.analyticsDesc", "View property analytics and insights")}
              </p>
            </div>
          </div>
          <LeaveCompanyFilter 
            selectedCompanyId={selectedCompanyId} 
            onCompanyChange={(id) => setTabState({ selectedCompanyId: id })} 
          />
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setTabState({ activeTab: v })} 
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="charts">{t("common.charts")}</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            <PropertyAnalytics 
              items={items}
              assignments={assignments}
              requests={requests}
              maintenance={maintenance}
              categories={categories}
            />
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="property" reportType="banded" companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="property" reportType="bi" companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

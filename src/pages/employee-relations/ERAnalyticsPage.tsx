import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ERAnalytics } from "@/components/employee-relations/ERAnalytics";
import { useTabState } from "@/hooks/useTabState";
import { BarChart3 } from "lucide-react";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";

export default function ERAnalyticsPage() {
  const { t } = useTranslation();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedCompanyId: "",
      selectedDepartmentId: "all",
      activeTab: "charts",
    },
    syncToUrl: ["selectedCompanyId", "activeTab"],
  });

  const { selectedCompanyId, selectedDepartmentId, activeTab } = tabState;

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name, code").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("id, name").eq("company_id", selectedCompanyId).eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setTabState({ selectedCompanyId: companies[0].id });
    }
  }, [companies, selectedCompanyId, setTabState]);

  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: t("employeeRelationsModule.title"), href: "/employee-relations" },
    { label: t("employeeRelationsModule.analytics.title") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <BarChart3 className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("employeeRelationsModule.analytics.title")}</h1>
              <p className="text-muted-foreground">{t("employeeRelationsModule.analytics.description")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={(v) => setTabState({ selectedCompanyId: v, selectedDepartmentId: "all" })}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("common.selectCompany")} /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartmentId} onValueChange={(v) => setTabState({ selectedDepartmentId: v })}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("common.selectDepartment")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("workforce.allDepartments")}</SelectItem>
                {departments.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setTabState({ activeTab: v })} className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">{t("common.charts")}</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            {selectedCompanyId && <ERAnalytics companyId={selectedCompanyId} />}
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="employee-relations" reportType="banded" companyId={selectedCompanyId || undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="employee-relations" reportType="bi" companyId={selectedCompanyId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

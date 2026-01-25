import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { TrainingAnalytics } from "@/components/training/TrainingAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";
import { useTabState } from "@/hooks/useTabState";

export default function TrainingAnalyticsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");

  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "charts",
    },
    syncToUrl: ["activeTab"],
  });

  const { activeTab } = tabState;

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (data?.company_id) setCompanyId(data.company_id);
    };
    fetchCompany();
  }, [user]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("training.dashboard.title"), href: "/training" },
            { label: t("training.modules.analytics.title") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("training.modules.analytics.title")}</h1>
            <p className="text-muted-foreground">{t("training.modules.analytics.description")}</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setTabState({ activeTab: v })} className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">{t("common.charts")}</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            {companyId && <TrainingAnalytics companyId={companyId} />}
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="training" reportType="banded" companyId={companyId || undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="training" reportType="bi" companyId={companyId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

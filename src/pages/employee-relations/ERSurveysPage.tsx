import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PulseSurveysTab } from "@/components/employee-relations/pulse-surveys/PulseSurveysTab";
import { useTabState } from "@/hooks/useTabState";
import { Activity } from "lucide-react";

export default function ERSurveysPage() {
  const { t } = useTranslation();

  const [tabState, setTabState] = useTabState({
    defaultState: {
      selectedCompanyId: "",
      activeTab: "surveys",
    },
    syncToUrl: ["selectedCompanyId", "activeTab"],
  });

  const { selectedCompanyId, activeTab } = tabState;

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id, name, code").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setTabState({ selectedCompanyId: companies[0].id });
    }
  }, [companies, selectedCompanyId, setTabState]);

  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: t("employeeRelationsModule.title"), href: "/employee-relations" },
    { label: "Pulse Surveys & Sentiment" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <Activity className="h-5 w-5 text-info" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pulse Surveys & Sentiment Analysis</h1>
              <p className="text-muted-foreground">AI-powered employee sentiment tracking and insights</p>
            </div>
          </div>
          <Select value={selectedCompanyId} onValueChange={(v) => setTabState({ selectedCompanyId: v })}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("common.selectCompany")} /></SelectTrigger>
            <SelectContent>
              {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        {selectedCompanyId && (
          <PulseSurveysTab 
            companyId={selectedCompanyId} 
            activeTab={activeTab}
            onTabChange={(v) => setTabState({ activeTab: v })}
          />
        )}
      </div>
    </AppLayout>
  );
}

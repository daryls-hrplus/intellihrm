import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ERAnalytics } from "@/components/employee-relations/ERAnalytics";
import { BarChart3 } from "lucide-react";

export default function ERAnalyticsPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(searchParams.get("company") || "");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(searchParams.get("department") || "all");

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
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const breadcrumbItems = [
    { label: t("common.home"), path: "/" },
    { label: t("employeeRelationsModule.title"), path: "/employee-relations" },
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
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("common.selectCompany")} /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={t("common.selectDepartment")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("workforce.allDepartments")}</SelectItem>
                {departments.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedCompanyId && <ERAnalytics companyId={selectedCompanyId} />}
      </div>
    </AppLayout>
  );
}

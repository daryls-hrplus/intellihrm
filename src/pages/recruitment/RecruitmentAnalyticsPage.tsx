import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Loader2 } from "lucide-react";
import { RecruitmentAnalytics } from "@/components/recruitment/RecruitmentAnalytics";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function RecruitmentAnalyticsPage() {
  const { company, isAdmin, hasRole } = useAuth();
  const { t } = useLanguage();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // Fetch companies
  useEffect(() => {
    if (isAdminOrHR) {
      supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data);
        });
    }
  }, [isAdminOrHR]);

  // Set default company
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id, selectedCompanyId]);

  // Fetch analytics data
  useEffect(() => {
    if (selectedCompanyId) {
      fetchAnalyticsData();
    }
  }, [selectedCompanyId]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch requisitions
      const { data: reqData } = await supabase
        .from("job_requisitions")
        .select("*")
        .eq("company_id", selectedCompanyId);
      
      setRequisitions(reqData || []);

      // Fetch candidates
      const { data: candData } = await supabase
        .from("candidates")
        .select("*")
        .eq("company_id", selectedCompanyId);
      
      setCandidates(candData || []);

      // Fetch applications with requisition info
      const requisitionIds = (reqData || []).map(r => r.id);
      
      if (requisitionIds.length > 0) {
        const { data: appData } = await supabase
          .from("applications")
          .select("*")
          .in("requisition_id", requisitionIds);
        
        setApplications(appData || []);
      } else {
        setApplications([]);
      }

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("recruitment.dashboard.title"), href: "/recruitment" },
          { label: t("succession.tabs.analytics") }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("recruitment.modules.analytics.title")}</h1>
            <p className="text-muted-foreground">{t("recruitment.modules.analytics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdminOrHR && companies.length > 1 && (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("common.company")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">{t("common.charts")}</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            {!selectedCompanyId ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                {t("succession.dashboard.selectCompany")}
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <RecruitmentAnalytics
                requisitions={requisitions}
                candidates={candidates}
                applications={applications}
                isLoading={isLoading}
              />
            )}
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="recruitment" reportType="banded" companyId={selectedCompanyId || undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="recruitment" reportType="bi" companyId={selectedCompanyId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuccessionAnalytics } from "@/components/succession/SuccessionAnalytics";
import { useSuccession } from "@/hooks/useSuccession";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function SuccessionAnalyticsPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [assessments, setAssessments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [keyPositions, setKeyPositions] = useState<any[]>([]);
  const [talentPools, setTalentPools] = useState<any[]>([]);

  const { 
    fetchNineBoxAssessments,
    fetchTalentPools,
    fetchSuccessionPlans,
    fetchKeyPositionRisks,
  } = useSuccession(selectedCompanyId);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadAllData();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    
    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadAllData = async () => {
    const [assessmentsData, poolsData, plansData, positionsData] = await Promise.all([
      fetchNineBoxAssessments(),
      fetchTalentPools(),
      fetchSuccessionPlans(),
      fetchKeyPositionRisks(),
    ]);
    setAssessments(assessmentsData);
    setTalentPools(poolsData);
    setPlans(plansData);
    setKeyPositions(positionsData);
  };

  const breadcrumbItems = [
    { label: t("succession.dashboard.title"), href: "/succession" },
    { label: t("succession.tabs.analytics") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("succession.tabs.analytics")}
            </h1>
            <p className="text-muted-foreground">
              {t("succession.analytics.description")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="charts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="charts">{t("common.charts")}</TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            {selectedCompanyId ? (
              <SuccessionAnalytics 
                assessments={assessments}
                plans={plans}
                keyPositions={keyPositions}
                talentPools={talentPools}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">{t("succession.dashboard.selectCompany")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="succession" reportType="banded" companyId={selectedCompanyId || undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="succession" reportType="bi" companyId={selectedCompanyId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

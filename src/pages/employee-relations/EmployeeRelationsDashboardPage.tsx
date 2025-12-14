import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  MessageSquare,
  AlertTriangle,
  Scale,
  Award,
  DoorOpen,
  Activity,
  BarChart3,
} from "lucide-react";
import { ERCasesTab } from "@/components/employee-relations/ERCasesTab";
import { ERDisciplinaryTab } from "@/components/employee-relations/ERDisciplinaryTab";
import { ERRecognitionTab } from "@/components/employee-relations/ERRecognitionTab";
import { ERExitInterviewsTab } from "@/components/employee-relations/ERExitInterviewsTab";
import { ERSurveysTab } from "@/components/employee-relations/ERSurveysTab";
import { ERWellnessTab } from "@/components/employee-relations/ERWellnessTab";
import { ERAnalytics } from "@/components/employee-relations/ERAnalytics";

export default function EmployeeRelationsDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Fetch companies for filter
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Set default company
  if (companies.length > 0 && !selectedCompanyId) {
    setSelectedCompanyId(companies[0].id);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t('employeeRelationsModule.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('employeeRelationsModule.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('employeeRelationsModule.selectCompany')} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ModuleBIButton module="employee_relations" />
              <ModuleReportsButton module="employee_relations" />
            </div>
          </div>
        </div>

        {selectedCompanyId && (
          <Tabs defaultValue="analytics" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('employeeRelationsModule.analytics.title')}
              </TabsTrigger>
              <TabsTrigger value="cases" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t('employeeRelationsModule.cases.title')}
              </TabsTrigger>
              <TabsTrigger value="disciplinary" className="gap-2">
                <Scale className="h-4 w-4" />
                {t('employeeRelationsModule.disciplinary.title')}
              </TabsTrigger>
              <TabsTrigger value="recognition" className="gap-2">
                <Award className="h-4 w-4" />
                {t('employeeRelationsModule.recognition.title')}
              </TabsTrigger>
              <TabsTrigger value="exit-interviews" className="gap-2">
                <DoorOpen className="h-4 w-4" />
                {t('employeeRelationsModule.exitInterviews.title')}
              </TabsTrigger>
              <TabsTrigger value="surveys" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {t('employeeRelationsModule.surveys.title')}
              </TabsTrigger>
              <TabsTrigger value="wellness" className="gap-2">
                <Activity className="h-4 w-4" />
                {t('employeeRelationsModule.wellness.title')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <ERAnalytics companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="cases">
              <ERCasesTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="disciplinary">
              <ERDisciplinaryTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="recognition">
              <ERRecognitionTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="exit-interviews">
              <ERExitInterviewsTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="surveys">
              <ERSurveysTab companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="wellness">
              <ERWellnessTab companyId={selectedCompanyId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

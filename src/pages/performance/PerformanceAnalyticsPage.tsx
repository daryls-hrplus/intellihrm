import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { PerformanceAnalyticsDashboard } from "@/components/performance/PerformanceAnalyticsDashboard";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, ChevronLeft, TrendingUp, CheckCircle, Network, Users, GitBranch, Target, ShieldAlert, TrendingDown } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";
import { CompletionRatesTrend } from "@/components/performance/insights/CompletionRatesTrend";
import { GoalQualityReport } from "@/components/performance/insights/GoalQualityReport";
import { AlignmentCascadeChart } from "@/components/performance/insights/AlignmentCascadeChart";
import { EmployeeWorkloadHeatmap } from "@/components/performance/insights/EmployeeWorkloadHeatmap";
import { OverloadedEmployeesList } from "@/components/performance/insights/OverloadedEmployeesList";
import { RoleChangeImpactAnalysis } from "@/components/performance/insights/RoleChangeImpactAnalysis";
import { LevelExpectationGapReport } from "@/components/performance/insights/LevelExpectationGapReport";
import { PerformanceRiskDashboard } from "@/components/performance/PerformanceRiskDashboard";
import { SkillGapsAnalysis } from "@/components/performance/insights/SkillGapsAnalysis";

export default function PerformanceAnalyticsPage() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <NavLink to="/performance" className="hover:text-foreground transition-colors">
              {t('performance.title')}
            </NavLink>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">{t('performance.modules.analytics')}</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t('performance.analytics.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('performance.analytics.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }}
              />
              <DepartmentFilter
                companyId={selectedCompanyId}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              {t("common.overview")}
            </TabsTrigger>
            <TabsTrigger value="completion" className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              {t("performance.insights.completionRates")}
            </TabsTrigger>
            <TabsTrigger value="quality" className="gap-1.5">
              <CheckCircle className="h-4 w-4" />
              {t("performance.insights.goalQuality")}
            </TabsTrigger>
            <TabsTrigger value="alignment" className="gap-1.5">
              <Network className="h-4 w-4" />
              {t("performance.insights.alignment")}
            </TabsTrigger>
            <TabsTrigger value="workload" className="gap-1.5">
              <Users className="h-4 w-4" />
              {t("performance.insights.workload")}
            </TabsTrigger>
            <TabsTrigger value="role-impact" className="gap-1.5">
              <GitBranch className="h-4 w-4" />
              Role Impact
            </TabsTrigger>
            <TabsTrigger value="level-gaps" className="gap-1.5">
              <Target className="h-4 w-4" />
              Level Gaps
            </TabsTrigger>
            <TabsTrigger value="performance-risks" className="gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              Performance Risks
            </TabsTrigger>
            <TabsTrigger value="skill-gaps" className="gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Skill Gaps
            </TabsTrigger>
            <TabsTrigger value="ai-banded">{t("reports.aiBandedReports")}</TabsTrigger>
            <TabsTrigger value="ai-bi">{t("reports.aiBIReports")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {selectedCompanyId && <PerformanceAnalyticsDashboard companyId={selectedCompanyId} />}
          </TabsContent>

          <TabsContent value="completion">
            {selectedCompanyId && (
              <CompletionRatesTrend 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} 
              />
            )}
          </TabsContent>

          <TabsContent value="quality">
            {selectedCompanyId && (
              <GoalQualityReport 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} 
              />
            )}
          </TabsContent>

          <TabsContent value="alignment">
            {selectedCompanyId && (
              <AlignmentCascadeChart 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} 
              />
            )}
          </TabsContent>

          <TabsContent value="workload" className="space-y-6">
            {selectedCompanyId && (
              <>
                <EmployeeWorkloadHeatmap 
                  companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined}
                  departmentId={selectedDepartmentId !== "all" ? selectedDepartmentId : undefined}
                />
                <OverloadedEmployeesList 
                  companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined}
                  departmentId={selectedDepartmentId !== "all" ? selectedDepartmentId : undefined}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="role-impact">
            {selectedCompanyId && (
              <RoleChangeImpactAnalysis 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} 
              />
            )}
          </TabsContent>

          <TabsContent value="level-gaps">
            {selectedCompanyId && (
              <LevelExpectationGapReport 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} 
              />
            )}
          </TabsContent>

          <TabsContent value="performance-risks">
            {selectedCompanyId && (
              <PerformanceRiskDashboard 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} 
              />
            )}
          </TabsContent>

          <TabsContent value="skill-gaps">
            {selectedCompanyId && (
              <SkillGapsAnalysis 
                companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined}
                departmentId={selectedDepartmentId !== "all" ? selectedDepartmentId : undefined}
              />
            )}
          </TabsContent>

          <TabsContent value="ai-banded">
            <AIModuleReportBuilder moduleName="performance" reportType="banded" companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
          </TabsContent>

          <TabsContent value="ai-bi">
            <AIModuleReportBuilder moduleName="performance" reportType="bi" companyId={selectedCompanyId !== "all" ? selectedCompanyId : undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { AppraisalCycleFilter, useAppraisalCycleFilter } from "@/components/filters/AppraisalCycleFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  ChevronLeft, 
  Brain,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Network,
  Users,
  GitBranch,
  Target,
  ShieldAlert,
  TrendingDown,
  MessageSquare,
  PieChart,
  Grid3X3,
  Star,
  AlertTriangle,
  Briefcase,
  FileText,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

// Operations Analytics components
import { PerformanceAnalyticsDashboard } from "@/components/performance/PerformanceAnalyticsDashboard";
import { CompletionRatesTrend } from "@/components/performance/insights/CompletionRatesTrend";
import { GoalQualityReport } from "@/components/performance/insights/GoalQualityReport";
import { AlignmentCascadeChart } from "@/components/performance/insights/AlignmentCascadeChart";
import { EmployeeWorkloadHeatmap } from "@/components/performance/insights/EmployeeWorkloadHeatmap";
import { OverloadedEmployeesList } from "@/components/performance/insights/OverloadedEmployeesList";

// Workforce Insights components
import { RoleChangeImpactAnalysis } from "@/components/performance/insights/RoleChangeImpactAnalysis";
import { LevelExpectationGapReport } from "@/components/performance/insights/LevelExpectationGapReport";
import { SkillGapsAnalysis } from "@/components/performance/insights/SkillGapsAnalysis";
import { EmployeeResponseAnalytics } from "@/components/performance/EmployeeResponseAnalytics";

// Appraisal Outcomes components
import {
  PerformanceDistributionChart,
  CompetencyHeatmap,
  ManagerScoringPatterns,
  IntegrationAnalytics,
} from '@/components/performance/analytics';

// Predictive Intelligence components
import { PerformanceRiskDashboard } from "@/components/performance/PerformanceRiskDashboard";
import {
  HighPotentialIdentification,
  AppraisalPredictiveInsights,
  AppraisalRiskFlags,
} from '@/components/performance/analytics';

// AI Reports & Insights
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";
import { ExportIntelligenceReport } from "@/components/performance/intelligence/ExportIntelligenceReport";
import { KeyInsightsAIPanel } from "@/components/performance/intelligence/KeyInsightsAIPanel";

type Section = 'operations' | 'workforce' | 'appraisals' | 'integrations' | 'predictive' | 'reports';

interface SectionConfig {
  id: Section;
  label: string;
  icon: React.ElementType;
  description: string;
}

const sections: SectionConfig[] = [
  { id: 'operations', label: 'Operations', icon: BarChart3, description: 'Goals & workflow analytics' },
  { id: 'workforce', label: 'Workforce', icon: Users, description: 'Role & skill insights' },
  { id: 'appraisals', label: 'Appraisals', icon: PieChart, description: 'Cycle-based outcomes' },
  { id: 'integrations', label: 'Integrations', icon: GitBranch, description: 'Cross-module activity' },
  { id: 'predictive', label: 'Predictive AI', icon: Brain, description: 'AI-powered predictions' },
  { id: 'reports', label: 'AI Reports', icon: FileText, description: 'Generated reports' },
];

export default function PerformanceIntelligenceHub() {
  const { t } = useLanguage();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const { selectedCycleId, setSelectedCycleId, cycleId } = useAppraisalCycleFilter();
  const [activeSection, setActiveSection] = useState<Section>('operations');

  const companyId = selectedCompanyId !== "all" ? selectedCompanyId : undefined;
  const departmentId = selectedDepartmentId !== "all" ? selectedDepartmentId : undefined;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <NavLink to="/performance" className="hover:text-foreground transition-colors">
              {t('performance.title')}
            </NavLink>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">Performance Intelligence Hub</span>
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Performance Intelligence Hub
                </h1>
                <p className="text-muted-foreground">
                  Unified analytics, insights, and AI-powered predictions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }}
              />
              {(activeSection === 'operations' || activeSection === 'workforce') && (
                <DepartmentFilter
                  companyId={selectedCompanyId}
                  selectedDepartmentId={selectedDepartmentId}
                  onDepartmentChange={setSelectedDepartmentId}
                />
              )}
              {(activeSection === 'appraisals' || activeSection === 'integrations') && (
                <AppraisalCycleFilter
                  companyId={selectedCompanyId}
                  selectedCycleId={selectedCycleId}
                  onCycleChange={setSelectedCycleId}
                />
              )}
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

        {/* Key Insights AI Panel */}
        <KeyInsightsAIPanel companyId={companyId} />

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
                {section.id === 'predictive' && (
                  <span className="ml-1 text-xs bg-primary-foreground/20 px-1.5 py-0.5 rounded">AI</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        {activeSection === 'operations' && (
          <OperationsSection companyId={companyId} departmentId={departmentId} />
        )}
        
        {activeSection === 'workforce' && (
          <WorkforceSection companyId={companyId} departmentId={departmentId} />
        )}
        
        {activeSection === 'appraisals' && (
          <AppraisalsSection companyId={companyId} cycleId={cycleId} />
        )}

        {activeSection === 'integrations' && (
          <IntegrationAnalytics companyId={companyId} cycleId={cycleId} />
        )}
        
        {activeSection === 'predictive' && (
          <PredictiveSection companyId={companyId} />
        )}
        
        {activeSection === 'reports' && (
          <ReportsSection companyId={companyId} />
        )}
      </div>
    </AppLayout>
  );
}

// Operations Analytics Section
function OperationsSection({ companyId, departmentId }: { companyId?: string; departmentId?: string }) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="overview" className="gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="completion" className="gap-1.5">
          <TrendingUp className="h-4 w-4" />
          Completion Rates
        </TabsTrigger>
        <TabsTrigger value="quality" className="gap-1.5">
          <CheckCircle className="h-4 w-4" />
          Goal Quality
        </TabsTrigger>
        <TabsTrigger value="alignment" className="gap-1.5">
          <Network className="h-4 w-4" />
          Alignment
        </TabsTrigger>
        <TabsTrigger value="workload" className="gap-1.5">
          <Users className="h-4 w-4" />
          Workload
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {companyId && <PerformanceAnalyticsDashboard companyId={companyId} />}
      </TabsContent>
      <TabsContent value="completion">
        {companyId && <CompletionRatesTrend companyId={companyId} />}
      </TabsContent>
      <TabsContent value="quality">
        {companyId && <GoalQualityReport companyId={companyId} />}
      </TabsContent>
      <TabsContent value="alignment">
        {companyId && <AlignmentCascadeChart companyId={companyId} />}
      </TabsContent>
      <TabsContent value="workload" className="space-y-6">
        {companyId && (
          <>
            <EmployeeWorkloadHeatmap companyId={companyId} departmentId={departmentId} />
            <OverloadedEmployeesList companyId={companyId} departmentId={departmentId} />
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}

// Workforce Insights Section
function WorkforceSection({ companyId, departmentId }: { companyId?: string; departmentId?: string }) {
  return (
    <Tabs defaultValue="role-impact" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="role-impact" className="gap-1.5">
          <GitBranch className="h-4 w-4" />
          Role Impact
        </TabsTrigger>
        <TabsTrigger value="level-gaps" className="gap-1.5">
          <Target className="h-4 w-4" />
          Level Gaps
        </TabsTrigger>
        <TabsTrigger value="skill-gaps" className="gap-1.5">
          <TrendingDown className="h-4 w-4" />
          Skill Gaps
        </TabsTrigger>
        <TabsTrigger value="employee-voice" className="gap-1.5">
          <MessageSquare className="h-4 w-4" />
          Employee Voice
        </TabsTrigger>
      </TabsList>

      <TabsContent value="role-impact">
        {companyId && <RoleChangeImpactAnalysis companyId={companyId} />}
      </TabsContent>
      <TabsContent value="level-gaps">
        {companyId && <LevelExpectationGapReport companyId={companyId} />}
      </TabsContent>
      <TabsContent value="skill-gaps">
        {companyId && <SkillGapsAnalysis companyId={companyId} departmentId={departmentId} />}
      </TabsContent>
      <TabsContent value="employee-voice">
        {companyId && <EmployeeResponseAnalytics companyId={companyId} />}
      </TabsContent>
    </Tabs>
  );
}

// Appraisal Outcomes Section
function AppraisalsSection({ companyId, cycleId }: { companyId?: string; cycleId?: string }) {
  return (
    <Tabs defaultValue="distribution" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="distribution" className="gap-1.5">
          <PieChart className="h-4 w-4" />
          Distribution
        </TabsTrigger>
        <TabsTrigger value="competency-heatmap" className="gap-1.5">
          <Grid3X3 className="h-4 w-4" />
          Competency Heatmap
        </TabsTrigger>
        <TabsTrigger value="manager-patterns" className="gap-1.5">
          <Users className="h-4 w-4" />
          Manager Patterns
        </TabsTrigger>
      </TabsList>

      <TabsContent value="distribution">
        {companyId && <PerformanceDistributionChart companyId={companyId} cycleId={cycleId} />}
      </TabsContent>
      <TabsContent value="competency-heatmap">
        {companyId && <CompetencyHeatmap companyId={companyId} cycleId={cycleId} />}
      </TabsContent>
      <TabsContent value="manager-patterns">
        {companyId && <ManagerScoringPatterns companyId={companyId} cycleId={cycleId} />}
      </TabsContent>
    </Tabs>
  );
}

// Predictive Intelligence Section
function PredictiveSection({ companyId }: { companyId?: string }) {
  return (
    <Tabs defaultValue="risks" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="risks" className="gap-1.5">
          <ShieldAlert className="h-4 w-4" />
          Performance Risks
        </TabsTrigger>
        <TabsTrigger value="high-potentials" className="gap-1.5">
          <Star className="h-4 w-4" />
          High Potentials
        </TabsTrigger>
        <TabsTrigger value="predictive" className="gap-1.5">
          <Brain className="h-4 w-4" />
          Predictive Insights
        </TabsTrigger>
        <TabsTrigger value="risk-flags" className="gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          Risk Flags
        </TabsTrigger>
      </TabsList>

      <TabsContent value="risks">
        {companyId && <PerformanceRiskDashboard companyId={companyId} />}
      </TabsContent>
      <TabsContent value="high-potentials">
        {companyId && <HighPotentialIdentification companyId={companyId} />}
      </TabsContent>
      <TabsContent value="predictive">
        {companyId && <AppraisalPredictiveInsights companyId={companyId} />}
      </TabsContent>
      <TabsContent value="risk-flags">
        {companyId && <AppraisalRiskFlags companyId={companyId} />}
      </TabsContent>
    </Tabs>
  );
}

// AI Reports Section
function ReportsSection({ companyId }: { companyId?: string }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      {/* Export Intelligence Report - Prominent at top */}
      <ExportIntelligenceReport companyId={companyId} />
      
      {/* AI Report Builder Tabs */}
      <Tabs defaultValue="banded" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="banded" className="gap-1.5">
            <Layers className="h-4 w-4" />
            {t("reports.aiBandedReports")}
          </TabsTrigger>
          <TabsTrigger value="bi" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {t("reports.aiBIReports")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banded">
          <AIModuleReportBuilder moduleName="performance" reportType="banded" companyId={companyId} />
        </TabsContent>
        <TabsContent value="bi">
          <AIModuleReportBuilder moduleName="performance" reportType="bi" companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

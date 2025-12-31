import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaveCompanyFilter, useLeaveCompanyFilter } from '@/components/leave/LeaveCompanyFilter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft, 
  BarChart3, 
  Grid3X3, 
  Users, 
  Star, 
  Brain, 
  AlertTriangle,
  PieChart
} from 'lucide-react';
import { ModuleBIButton } from '@/components/bi/ModuleBIButton';
import { ModuleReportsButton } from '@/components/reports/ModuleReportsButton';
import {
  PerformanceDistributionChart,
  CompetencyHeatmap,
  ManagerScoringPatterns,
  HighPotentialIdentification,
  AppraisalPredictiveInsights,
  AppraisalRiskFlags,
} from '@/components/performance/analytics';

export default function AppraisalAnalyticsPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const [selectedCycleId, setSelectedCycleId] = useState<string | undefined>();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <NavLink to="/performance" className="hover:text-foreground transition-colors">
              Performance
            </NavLink>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-foreground">Appraisal Analytics</span>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Appraisal Reporting & Analytics
                </h1>
                <p className="text-muted-foreground">
                  Performance distribution, scoring patterns, and predictive insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
              />
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
          </div>
        </div>

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
            <TabsTrigger value="high-potentials" className="gap-1.5">
              <Star className="h-4 w-4" />
              High Potentials
            </TabsTrigger>
            <TabsTrigger value="predictive" className="gap-1.5">
              <Brain className="h-4 w-4" />
              Predictive AI
            </TabsTrigger>
            <TabsTrigger value="risk-flags" className="gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Risk Flags
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            {selectedCompanyId && (
              <PerformanceDistributionChart 
                companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
                cycleId={selectedCycleId}
              />
            )}
          </TabsContent>

          <TabsContent value="competency-heatmap">
            {selectedCompanyId && (
              <CompetencyHeatmap 
                companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
                cycleId={selectedCycleId}
              />
            )}
          </TabsContent>

          <TabsContent value="manager-patterns">
            {selectedCompanyId && (
              <ManagerScoringPatterns 
                companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
                cycleId={selectedCycleId}
              />
            )}
          </TabsContent>

          <TabsContent value="high-potentials">
            {selectedCompanyId && (
              <HighPotentialIdentification 
                companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
              />
            )}
          </TabsContent>

          <TabsContent value="predictive">
            {selectedCompanyId && (
              <AppraisalPredictiveInsights 
                companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
              />
            )}
          </TabsContent>

          <TabsContent value="risk-flags">
            {selectedCompanyId && (
              <AppraisalRiskFlags 
                companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

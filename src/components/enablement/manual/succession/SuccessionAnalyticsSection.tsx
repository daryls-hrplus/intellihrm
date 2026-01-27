import { BarChart3, Clock } from 'lucide-react';
import {
  AnalyticsArchitectureOverview,
  SuccessionHealthScorecard,
  BenchStrengthAnalysis,
  FlightRiskRetentionReporting,
  NineBoxDistributionReports,
  TalentPipelineMetrics,
  ReadinessTrendAnalysis,
  DiversityInclusionAnalytics,
  ExecutiveSummaryReports,
  AIPoweredInsights,
  ReportConfigurationScheduling,
  AnalyticsTroubleshooting,
} from './sections/analytics';

export function SuccessionAnalyticsSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-10" data-manual-anchor="part-10" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">10. Reporting & Analytics</h2>
            <p className="text-muted-foreground">
              Industry-aligned succession analytics following SAP SuccessFactors, Workday, and Oracle HCM patterns
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~45 min read
          </span>
          <span>Target: Admin, HR Partner, Executive</span>
        </div>
      </section>

      {/* 12 Modular Analytics Sections */}
      <AnalyticsArchitectureOverview />
      <SuccessionHealthScorecard />
      <BenchStrengthAnalysis />
      <FlightRiskRetentionReporting />
      <NineBoxDistributionReports />
      <TalentPipelineMetrics />
      <ReadinessTrendAnalysis />
      <DiversityInclusionAnalytics />
      <ExecutiveSummaryReports />
      <AIPoweredInsights />
      <ReportConfigurationScheduling />
      <AnalyticsTroubleshooting />
    </div>
  );
}

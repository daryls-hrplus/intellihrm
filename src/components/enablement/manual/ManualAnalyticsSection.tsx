import {
  AppraisalAnalyticsDashboard,
  PerformanceDistributionAnalysis,
  ManagerScoringPatternsSection,
  TrendAnalysisPredictions,
  PerformanceIntelligenceHubSection,
  TalentUnifiedDashboardSection
} from './sections/analytics';

export function ManualAnalyticsSection() {
  return (
    <div className="space-y-8">
      <AppraisalAnalyticsDashboard />
      <PerformanceDistributionAnalysis />
      <ManagerScoringPatternsSection />
      <TrendAnalysisPredictions />
      <PerformanceIntelligenceHubSection />
      <TalentUnifiedDashboardSection />
    </div>
  );
}

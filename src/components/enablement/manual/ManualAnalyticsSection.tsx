import {
  AppraisalAnalyticsDashboard,
  PerformanceDistributionAnalysis,
  ManagerScoringPatternsSection,
  TrendAnalysisPredictions
} from './sections/analytics';

export function ManualAnalyticsSection() {
  return (
    <div className="space-y-8">
      <AppraisalAnalyticsDashboard />
      <PerformanceDistributionAnalysis />
      <ManagerScoringPatternsSection />
      <TrendAnalysisPredictions />
    </div>
  );
}

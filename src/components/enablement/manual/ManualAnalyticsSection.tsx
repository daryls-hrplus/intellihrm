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
      <section id="sec-6-1" data-manual-anchor="sec-6-1" className="scroll-mt-32">
        <AppraisalAnalyticsDashboard />
      </section>
      <section id="sec-6-2" data-manual-anchor="sec-6-2" className="scroll-mt-32">
        <PerformanceDistributionAnalysis />
      </section>
      <section id="sec-6-3" data-manual-anchor="sec-6-3" className="scroll-mt-32">
        <ManagerScoringPatternsSection />
      </section>
      <section id="sec-6-4" data-manual-anchor="sec-6-4" className="scroll-mt-32">
        <TrendAnalysisPredictions />
      </section>
      <section id="sec-6-5" data-manual-anchor="sec-6-5" className="scroll-mt-32">
        <PerformanceIntelligenceHubSection />
      </section>
      <section id="sec-6-6" data-manual-anchor="sec-6-6" className="scroll-mt-32">
        <TalentUnifiedDashboardSection />
      </section>
    </div>
  );
}

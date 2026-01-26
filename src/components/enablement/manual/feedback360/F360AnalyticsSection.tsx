import {
  AnalyticsReportTemplateSystem,
  AnalyticsAudienceSpecificReports,
  AnalyticsVisualizationsCharts,
  AnalyticsWorkforceDashboard,
  AnalyticsResponseMonitoring,
  AnalyticsResultsReleaseAudit,
  AnalyticsPDFExportConfiguration,
  AnalyticsBenchmarkingTrends,
} from './sections/analytics';

export function F360AnalyticsSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-6" id="part-6">
        <h2 className="text-2xl font-bold mb-4">6. Reports & Analytics</h2>
        <p className="text-muted-foreground mb-6">
          Report generation, audience-specific templates, visualizations, workforce analytics, 
          response monitoring, and compliance auditing.
        </p>
      </div>

      <AnalyticsReportTemplateSystem />
      <AnalyticsAudienceSpecificReports />
      <AnalyticsVisualizationsCharts />
      <AnalyticsWorkforceDashboard />
      <AnalyticsResponseMonitoring />
      <AnalyticsResultsReleaseAudit />
      <AnalyticsPDFExportConfiguration />
      <AnalyticsBenchmarkingTrends />
    </div>
  );
}

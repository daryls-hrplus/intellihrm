import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Activity, PieChart, TrendingUp, BarChart3 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout } from '@/components/enablement/manual/components';

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The Workforce Analytics Dashboard provides real-time visibility into key HR metrics. 
          Executive-level insights on headcount, turnover, diversity, and workforce composition 
          enable data-driven decisions across the organization.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Key Metrics Categories</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={Users} title="Headcount Metrics">
            <ul className="space-y-1 mt-2">
              <li>• Total headcount by entity</li>
              <li>• FTE vs contractor ratio</li>
              <li>• Headcount trend (YoY)</li>
              <li>• New hires vs terminations</li>
            </ul>
          </FeatureCard>

          <FeatureCard variant="warning" icon={Activity} title="Turnover Analytics">
            <ul className="space-y-1 mt-2">
              <li>• Voluntary vs involuntary</li>
              <li>• Regretted attrition rate</li>
              <li>• Turnover by department</li>
              <li>• Tenure distribution</li>
            </ul>
          </FeatureCard>

          <FeatureCard variant="success" icon={PieChart} title="Diversity Metrics">
            <ul className="space-y-1 mt-2">
              <li>• Gender distribution</li>
              <li>• Age demographics</li>
              <li>• Ethnicity representation</li>
              <li>• Leadership diversity</li>
            </ul>
          </FeatureCard>

          <FeatureCard variant="info" icon={TrendingUp} title="Movement Metrics">
            <ul className="space-y-1 mt-2">
              <li>• Internal mobility rate</li>
              <li>• Promotion velocity</li>
              <li>• Transfer patterns</li>
              <li>• Career progression</li>
            </ul>
          </FeatureCard>

          <FeatureCard variant="purple" icon={BarChart3} title="Compensation Insights">
            <ul className="space-y-1 mt-2">
              <li>• Compa-ratio distribution</li>
              <li>• Pay equity analysis</li>
              <li>• Cost per employee</li>
              <li>• Budget utilization</li>
            </ul>
          </FeatureCard>

          <FeatureCard variant="orange" icon={Users} title="Span of Control">
            <ul className="space-y-1 mt-2">
              <li>• Manager-to-IC ratio</li>
              <li>• Org depth analysis</li>
              <li>• Team size distribution</li>
              <li>• Reporting structure</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.1.1: Workforce Analytics Dashboard with key metrics and trend visualizations"
        alt="Dashboard view showing headcount, turnover, and diversity charts with drill-down capabilities"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Dashboard Configuration</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Widget Customization</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Users can personalize their dashboard layout by:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Drag-and-drop widget arrangement</li>
              <li>• Adding/removing metric cards</li>
              <li>• Configuring date ranges and filters</li>
              <li>• Saving multiple dashboard views</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Filter Dimensions</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Company</Badge>
              <Badge variant="outline">Department</Badge>
              <Badge variant="outline">Location</Badge>
              <Badge variant="outline">Job Family</Badge>
              <Badge variant="outline">Grade Level</Badge>
              <Badge variant="outline">Employment Type</Badge>
              <Badge variant="outline">Date Range</Badge>
            </div>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.1.2: Dashboard filter configuration and widget customization panel"
        alt="Filter panel showing dimension selectors and widget arrangement options"
      />

      <InfoCallout title="Executive View">
        Role-based dashboard views ensure executives see strategic metrics while 
        HR partners access operational details. Configure view permissions in 
        Admin → Analytics → Dashboard Access.
      </InfoCallout>
    </div>
  );
}

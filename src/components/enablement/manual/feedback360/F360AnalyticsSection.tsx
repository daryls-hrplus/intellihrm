import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText, PieChart, TrendingUp } from 'lucide-react';

export function F360AnalyticsSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-6" id="part-6">
        <h2 className="text-2xl font-bold mb-4">6. Reports & Analytics</h2>
        <p className="text-muted-foreground mb-6">
          Report generation, audience-specific templates, visualizations, and workforce analytics.
        </p>
      </div>

      {[
        { id: 'sec-6-1', num: '6.1', title: 'Report Template System', icon: FileText, desc: 'Understanding the report template architecture and customization options' },
        { id: 'sec-6-2', num: '6.2', title: 'Audience-Specific Reports', icon: FileText, desc: 'Executive, Manager, IC, and HR report configurations' },
        { id: 'sec-6-3', num: '6.3', title: 'Visualizations & Charts', icon: PieChart, desc: 'Radar charts, bar charts, benchmarks, and trend analysis' },
        { id: 'sec-6-4', num: '6.4', title: 'Workforce Analytics Dashboard', icon: TrendingUp, desc: 'Organization-wide 360 feedback insights' },
        { id: 'sec-6-5', num: '6.5', title: 'Response Monitoring Dashboard', icon: BarChart3, desc: 'Real-time completion tracking and quality monitoring' },
        { id: 'sec-6-6', num: '6.6', title: 'Results Release Audit', icon: FileText, desc: 'Tracking report generation, distribution, and acknowledgment' },
      ].map((section) => (
        <Card key={section.id} data-manual-anchor={section.id} id={section.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <section.icon className="h-5 w-5" />
              {section.num} {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent><p className="text-muted-foreground">{section.desc}</p></CardContent>
        </Card>
      ))}
    </div>
  );
}

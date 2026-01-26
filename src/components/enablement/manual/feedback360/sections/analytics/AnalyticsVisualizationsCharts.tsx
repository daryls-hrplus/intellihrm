import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PieChart, BarChart3, TrendingUp, Palette, CheckCircle2, Info } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const visualizationConfigFields: FieldDefinition[] = [
  { name: 'chart_types', required: true, type: 'text[]', description: 'Enabled chart types for the report', defaultValue: '["radar", "bar", "line"]' },
  { name: 'show_benchmarks', required: true, type: 'boolean', description: 'Display organization benchmarks on charts', defaultValue: 'true' },
  { name: 'color_scheme', required: true, type: 'text', description: 'Color palette for visualizations', defaultValue: 'default', validation: 'default | accessible | monochrome | brand' },
];

const chartTypes = [
  {
    name: 'Radar Chart',
    icon: PieChart,
    useCase: 'Competency comparison across categories',
    dataSource: 'Category-level scores aggregated by rater type',
    rechartsComponent: 'RadarChart with PolarGrid, PolarAngleAxis',
  },
  {
    name: 'Bar Chart',
    icon: BarChart3,
    useCase: 'Score distribution and rater category comparison',
    dataSource: 'Question or category scores by rater group',
    rechartsComponent: 'BarChart with grouped bars per rater category',
  },
  {
    name: 'Line Chart',
    icon: TrendingUp,
    useCase: 'Trend analysis across multiple cycles',
    dataSource: 'Historical scores from previous 360 cycles',
    rechartsComponent: 'LineChart with multiple series per category',
  },
  {
    name: 'Gauge Chart',
    icon: PieChart,
    useCase: 'Overall score visualization with benchmarks',
    dataSource: 'Aggregate score vs. organization benchmark',
    rechartsComponent: 'Custom gauge using RadialBarChart',
  },
];

export function AnalyticsVisualizationsCharts() {
  return (
    <section id="sec-6-3" data-manual-anchor="sec-6-3" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            6.3 Visualizations & Charts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Admin</Badge>
            <span>→</span>
            <Badge variant="outline">Performance</Badge>
            <span>→</span>
            <Badge variant="outline">360 Feedback</Badge>
            <span>→</span>
            <Badge variant="secondary">Report Templates</Badge>
            <span>→</span>
            <Badge variant="secondary">Visualization Settings</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Understand available chart types and their appropriate use cases</li>
                <li>Configure visualization preferences for report templates</li>
                <li>Apply accessible color schemes meeting WCAG 2.1 standards</li>
                <li>Integrate benchmark visualization with organization data</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Data Visualization Strategy</h4>
            <p className="text-muted-foreground">
              Effective 360 feedback reports use visualizations to communicate complex multi-rater data clearly. 
              The system uses Recharts for interactive, accessible charts that work across all devices. 
              Each chart type serves a specific purpose in helping recipients understand their feedback.
            </p>
          </div>

          {/* Chart Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartTypes.map((chart) => {
              const Icon = chart.icon;
              return (
                <Card key={chart.name} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {chart.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Use Case:</span>
                      <p className="text-sm">{chart.useCase}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Data Source:</span>
                      <p className="text-sm text-muted-foreground">{chart.dataSource}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Implementation:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{chart.rechartsComponent}</code>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="visualization_config JSONB Structure" 
            fields={visualizationConfigFields} 
          />

          {/* Color Schemes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Scheme Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Default</h5>
                  <p className="text-muted-foreground text-xs">
                    Standard color palette using semantic tokens from design system. 
                    Balanced for general use.
                  </p>
                  <div className="flex gap-1 mt-2">
                    <div className="w-6 h-6 rounded bg-primary" />
                    <div className="w-6 h-6 rounded bg-secondary" />
                    <div className="w-6 h-6 rounded bg-accent" />
                    <div className="w-6 h-6 rounded bg-muted" />
                  </div>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Accessible (WCAG 2.1)</h5>
                  <p className="text-muted-foreground text-xs">
                    High-contrast colors meeting WCAG 2.1 AA standards. 
                    4.5:1 contrast ratio minimum.
                  </p>
                  <Badge variant="outline" className="mt-2">Recommended for PDF exports</Badge>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Monochrome</h5>
                  <p className="text-muted-foreground text-xs">
                    Grayscale palette for print optimization. 
                    Uses patterns for differentiation.
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Brand</h5>
                  <p className="text-muted-foreground text-xs">
                    Custom colors from company branding configuration. 
                    Requires brand colors to be set.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Visualization Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Radar charts require minimum 3 data points (categories) to render</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Trend charts only appear when 2+ historical cycles exist</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Benchmark lines hidden when sample size below threshold</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>Use accessible color scheme for external-facing reports</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Charts not rendering:</strong> Check if data meets minimum points requirement</li>
                <li><strong>Colors not matching brand:</strong> Verify brand colors are configured in company settings</li>
                <li><strong>Benchmarks missing:</strong> Ensure org_signal_aggregates has data for the dimension</li>
                <li><strong>Trend lines flat:</strong> Historical data may not exist for compared periods</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}

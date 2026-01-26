import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Filter, Eye, CheckCircle2, Info, Shield } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const signalAggregateFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique aggregate record identifier' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company for this aggregate' },
  { name: 'signal_definition_id', required: true, type: 'UUID', description: 'Signal being aggregated' },
  { name: 'dimension_type', required: true, type: 'text', description: 'Grouping dimension', validation: 'department | location | job_level | tenure_band | company' },
  { name: 'dimension_value', required: false, type: 'text', description: 'Specific value within dimension (e.g., "Engineering")' },
  { name: 'period_type', required: true, type: 'text', description: 'Time period granularity', validation: 'cycle | quarter | year' },
  { name: 'period_value', required: true, type: 'text', description: 'Specific period (e.g., "2024-Q1")' },
  { name: 'avg_score', required: true, type: 'numeric', description: 'Average signal score for the group' },
  { name: 'sample_size', required: true, type: 'integer', description: 'Number of participants in aggregate' },
  { name: 'anonymity_threshold_met', required: true, type: 'boolean', description: 'Whether minimum sample size is met for display', defaultValue: 'false' },
  { name: 'score_distribution', required: false, type: 'JSONB', description: 'Histogram of score distribution' },
  { name: 'benchmark_comparison', required: false, type: 'numeric', description: 'Difference from organization benchmark' },
];

const reportingDimensionsFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Dimension definition ID' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company owning this dimension' },
  { name: 'dimension_name', required: true, type: 'text', description: 'Display name for the dimension' },
  { name: 'dimension_type', required: true, type: 'text', description: 'Type of dimension', validation: 'standard | custom' },
  { name: 'source_field', required: true, type: 'text', description: 'Database field to aggregate on' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Whether dimension is available for filtering' },
  { name: 'display_order', required: false, type: 'integer', description: 'Order in filter dropdowns' },
];

export function AnalyticsWorkforceDashboard() {
  return (
    <section id="sec-6-4" data-manual-anchor="sec-6-4" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            6.4 Workforce Analytics Dashboard
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
            <Badge variant="secondary">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Workforce Dashboard</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Navigate the organization-wide 360 feedback analytics dashboard</li>
                <li>Apply dimension filters to segment workforce insights</li>
                <li>Interpret signal aggregates and benchmark comparisons</li>
                <li>Understand anonymity thresholds for group-level data</li>
                <li>Export analytics data for external reporting</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Organization-Wide Intelligence</h4>
            <p className="text-muted-foreground">
              The Workforce Analytics Dashboard aggregates 360 feedback signals across the organization, 
              enabling HR and leadership to identify patterns, benchmark performance, and make data-driven 
              talent decisions. All data is anonymized and only displayed when minimum sample sizes are met.
            </p>
          </div>

          {/* Dashboard Components */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Signal Performance Radar</h5>
                  <p className="text-muted-foreground text-xs">
                    Organization-level radar chart showing average scores across all signals. 
                    Filterable by dimension to compare groups.
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Dimension Heatmap</h5>
                  <p className="text-muted-foreground text-xs">
                    Grid showing signal scores by department, location, or job level. 
                    Color-coded for quick identification of outliers.
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Trend Analysis</h5>
                  <p className="text-muted-foreground text-xs">
                    Year-over-year and cycle-over-cycle trend charts. 
                    Direction indicators show improvement or decline.
                  </p>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Distribution Charts</h5>
                  <p className="text-muted-foreground text-xs">
                    Histogram of score distributions showing organizational spread. 
                    Useful for identifying bimodal patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimension Filtering */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Dimension Filtering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Analytics can be segmented by the following standard dimensions:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <Badge variant="outline">Department</Badge>
                  <Badge variant="outline">Location</Badge>
                  <Badge variant="outline">Job Level</Badge>
                  <Badge variant="outline">Tenure Band</Badge>
                  <Badge variant="outline">Manager</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Custom dimensions can be configured in <code>feedback_reporting_dimensions</code> 
                  to enable additional segmentation based on organization-specific attributes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="org_signal_aggregates Table Reference" 
            fields={signalAggregateFields} 
          />

          <FieldReferenceTable 
            title="feedback_reporting_dimensions Table Reference" 
            fields={reportingDimensionsFields} 
          />

          {/* Anonymity Protection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Anonymity Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  To protect individual identity in aggregate reports, data is only displayed when 
                  minimum sample sizes are met:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-background rounded border">
                    <h5 className="font-medium">Dimension Aggregates</h5>
                    <p className="text-2xl font-bold text-primary">5+</p>
                    <p className="text-xs text-muted-foreground">Minimum participants per group</p>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <h5 className="font-medium">Cross-Dimension</h5>
                    <p className="text-2xl font-bold text-primary">10+</p>
                    <p className="text-xs text-muted-foreground">For multi-dimension filtering</p>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <h5 className="font-medium">Trend Comparison</h5>
                    <p className="text-2xl font-bold text-primary">5+</p>
                    <p className="text-xs text-muted-foreground">Per period in trend analysis</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Benchmark */}
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertTitle>Industry Context: SHRM Benchmarks</AlertTitle>
            <AlertDescription>
              <p className="text-sm mt-1">
                The dashboard supports external benchmark integration. Standard SHRM benchmarks suggest:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Average 360 score across organizations: 3.5-3.8 on 5-point scale</li>
                <li>Top performers typically score 4.0+ consistently</li>
                <li>Self-other gap of 0.2-0.4 points is considered normal</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Troubleshooting */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Data not appearing:</strong> Check if sample_size meets anonymity_threshold</li>
                <li><strong>Dimension filter empty:</strong> Verify dimension is active in reporting_dimensions</li>
                <li><strong>Benchmarks missing:</strong> Org-wide aggregate may not exist for signal</li>
                <li><strong>Trends flat:</strong> Historical period data may not be aggregated yet</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}

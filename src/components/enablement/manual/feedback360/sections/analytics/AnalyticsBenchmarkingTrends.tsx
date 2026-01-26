import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Target, CheckCircle2, Info, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { FieldReferenceTable, type FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';

const benchmarkFields: FieldDefinition[] = [
  { name: 'signal_definition_id', required: true, type: 'UUID', description: 'Signal being benchmarked' },
  { name: 'dimension_type', required: true, type: 'text', description: 'Benchmark scope', validation: 'company | department | job_level' },
  { name: 'period_value', required: true, type: 'text', description: 'Time period for benchmark', validation: 'e.g., "2024", "2024-Q1"' },
  { name: 'avg_score', required: true, type: 'numeric', description: 'Benchmark average score' },
  { name: 'percentile_25', required: false, type: 'numeric', description: '25th percentile score' },
  { name: 'percentile_50', required: false, type: 'numeric', description: 'Median score' },
  { name: 'percentile_75', required: false, type: 'numeric', description: '75th percentile score' },
  { name: 'sample_size', required: true, type: 'integer', description: 'Number of participants in benchmark' },
  { name: 'calculated_at', required: true, type: 'timestamptz', description: 'When benchmark was last calculated' },
];

const trendIndicators = [
  { direction: 'up', icon: ArrowUp, label: 'Improving', threshold: '+0.2', color: 'text-green-600' },
  { direction: 'stable', icon: Minus, label: 'Stable', threshold: '±0.2', color: 'text-gray-500' },
  { direction: 'down', icon: ArrowDown, label: 'Declining', threshold: '-0.2', color: 'text-red-600' },
];

export function AnalyticsBenchmarkingTrends() {
  return (
    <section id="sec-6-8" data-manual-anchor="sec-6-8" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            6.8 Benchmarking & Trend Analysis
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
            <Badge variant="secondary">Benchmarks & Trends</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure organization-level benchmarks for 360 signals</li>
                <li>Interpret year-over-year and cycle-over-cycle trends</li>
                <li>Understand trend direction indicators and thresholds</li>
                <li>Apply historical comparison for talent development insights</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Overview */}
          <div className="prose prose-sm max-w-none">
            <h4 className="text-base font-semibold">Longitudinal Analysis</h4>
            <p className="text-muted-foreground">
              Benchmarking and trend analysis enable organizations to track 360 feedback outcomes 
              over time. Compare individual scores against organization benchmarks, monitor improvement 
              trajectories, and identify patterns that inform talent strategy.
            </p>
          </div>

          {/* Benchmark Types */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Benchmark Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Organization Benchmark</h5>
                  <p className="text-xs text-muted-foreground">
                    Company-wide average for each signal. Provides the primary comparison point 
                    for individual reports.
                  </p>
                  <Badge variant="outline" className="mt-2">dimension_type = 'company'</Badge>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Department Benchmark</h5>
                  <p className="text-xs text-muted-foreground">
                    Average within functional area. Enables peer comparison within similar roles.
                  </p>
                  <Badge variant="outline" className="mt-2">dimension_type = 'department'</Badge>
                </div>
                <div className="p-3 bg-background rounded border">
                  <h5 className="font-medium mb-2">Job Level Benchmark</h5>
                  <p className="text-xs text-muted-foreground">
                    Average by seniority level. Accounts for role complexity expectations.
                  </p>
                  <Badge variant="outline" className="mt-2">dimension_type = 'job_level'</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Indicators */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Trend Direction Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {trendIndicators.map((indicator) => {
                  const Icon = indicator.icon;
                  return (
                    <div key={indicator.direction} className="p-4 bg-muted/30 rounded border text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${indicator.color}`} />
                      <p className="font-medium">{indicator.label}</p>
                      <p className="text-xs text-muted-foreground">Threshold: {indicator.threshold}</p>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Trend direction is calculated by comparing the current period's average score 
                against the previous period. A change of ±0.2 points (on a 5-point scale) is 
                considered stable.
              </p>
            </CardContent>
          </Card>

          {/* Field Reference */}
          <FieldReferenceTable 
            title="org_signal_aggregates Benchmark Fields" 
            fields={benchmarkFields} 
          />

          {/* Trend Analysis Features */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trend Analysis Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Cycle-over-Cycle Comparison</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Compare consecutive 360 cycles</li>
                    <li>• Identify signals with largest movement</li>
                    <li>• Highlight statistically significant changes</li>
                    <li>• Track individual development trajectories</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Year-over-Year Analysis</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Annual trend lines for strategic planning</li>
                    <li>• Account for seasonal variations</li>
                    <li>• Align with performance review cycles</li>
                    <li>• Export for board reporting</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Cohort Tracking</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Track specific employee groups over time</li>
                    <li>• New hire cohort development</li>
                    <li>• Promotion candidate progression</li>
                    <li>• High-potential talent trajectories</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <h5 className="font-medium mb-2">Percentile Distribution</h5>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• 25th, 50th, 75th percentile tracking</li>
                    <li>• Identify distribution shape changes</li>
                    <li>• Spot bimodal patterns</li>
                    <li>• Tail risk identification</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Rules */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Benchmark Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Benchmarks recalculated nightly after cycle closes</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="shrink-0">System</Badge>
                  <span>Minimum 10 participants required for reliable benchmark</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Trend requires at least 2 cycles with valid data</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary" className="shrink-0">Policy</Badge>
                  <span>Percentiles hidden when sample size below 20</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">Advisory</Badge>
                  <span>3+ cycles recommended for meaningful trend analysis</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Industry Context */}
          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Industry Benchmarks (SHRM Research)</AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p className="font-medium">Average 360 Scores</p>
                  <ul className="list-disc list-inside text-xs">
                    <li>Overall: 3.5-3.8 (5-point scale)</li>
                    <li>Top performers: 4.0+</li>
                    <li>Development needed: &lt;3.0</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Typical Self-Other Gap</p>
                  <ul className="list-disc list-inside text-xs">
                    <li>Normal range: 0.2-0.4 points</li>
                    <li>Self-inflation common at +0.3</li>
                    <li>Leaders often underrate selves</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Troubleshooting */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Troubleshooting</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>No benchmark displayed:</strong> Sample size may be below minimum threshold</li>
                <li><strong>Trend data missing:</strong> Requires 2+ cycles with matching signals</li>
                <li><strong>Percentiles not showing:</strong> Need 20+ participants in benchmark group</li>
                <li><strong>Stale benchmarks:</strong> Check nightly recalculation job status</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}

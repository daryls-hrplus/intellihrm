import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { TroubleshootingSection, type TroubleshootingItem } from '@/components/enablement/manual/components/TroubleshootingSection';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const analyticsTroubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Coverage score shows 0% despite having successors',
    cause: 'Candidate status is not "active" or readiness_level is not recognized',
    solution: 'Verify succession_candidates.status = "active" and readiness_level matches expected enum values (ready_now, ready_1_2_years, ready_3_plus_years, developing)',
  },
  {
    issue: 'Nine-Box distribution counts are incorrect',
    cause: 'Stale assessments where is_current = false are being counted',
    solution: 'Ensure queries filter by nine_box_assessments.is_current = true to show only current placements',
  },
  {
    issue: 'Flight risk data not appearing in analytics',
    cause: 'Assessment is_current flag not set or company_id mismatch',
    solution: 'Check flight_risk_assessments.is_current = true and company_id matches selected company filter',
  },
  {
    issue: 'Bench strength progress bar shows wrong color',
    cause: 'Coverage score calculation not aligned with threshold configuration',
    solution: 'Verify thresholds: ≥80 (green), ≥50 (yellow), ≥20 (orange), <20 (red). Check calculateCoverageScore algorithm',
  },
  {
    issue: 'Diversity data incomplete or showing N/A',
    cause: 'Employee profile demographic fields are not populated (voluntary disclosure)',
    solution: 'DEI metrics require profiles.gender/ethnicity to be filled. Encourage voluntary disclosure. Aggregation minimums may suppress small group data',
  },
  {
    issue: 'Benchmark comparisons not displaying',
    cause: 'Sample size below minimum threshold for statistical validity',
    solution: 'Benchmarks require minimum 10 data points per category. Expand date range or include more employees',
  },
  {
    issue: 'Trend analysis missing historical data',
    cause: 'Requires at least 2 assessment cycles to calculate trends',
    solution: 'Trend reports require historical data from readiness_assessment_events across multiple periods. Ensure cycle completion',
  },
  {
    issue: 'AI report builder returns empty results',
    cause: 'No data matches the applied filters or company scope is incorrect',
    solution: 'Verify company_id parameter is passed correctly. Check that data exists for the selected date range and filters',
  },
  {
    issue: 'Scheduled reports not being delivered',
    cause: 'Email delivery configuration issues or recipient permissions',
    solution: 'Verify recipient email addresses are valid. Check scheduled job logs. Ensure recipients have report access permissions',
  },
  {
    issue: 'Export to PDF/Excel fails or produces empty file',
    cause: 'Browser blocking downloads or data size exceeding limits',
    solution: 'Check browser download permissions. For large datasets, apply filters to reduce row count. Maximum 10,000 rows for Excel export',
  },
];

export function AnalyticsTroubleshooting() {
  return (
    <section id="sec-10-12" data-manual-anchor="sec-10-12" className="scroll-mt-32 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            10.12 Analytics Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Path */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">Succession</Badge>
            <span>→</span>
            <Badge variant="outline">Analytics</Badge>
            <span>→</span>
            <Badge variant="secondary">Troubleshooting</Badge>
          </div>

          {/* Learning Objectives */}
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Learning Objectives</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Diagnose common analytics data quality issues</li>
                <li>Resolve calculation discrepancies in coverage and distribution reports</li>
                <li>Fix report delivery and export problems</li>
                <li>Understand data refresh timing and caching behavior</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Troubleshooting Section */}
          <TroubleshootingSection 
            items={analyticsTroubleshootingItems}
            title="Common Analytics Issues & Solutions"
          />

          {/* Data Quality Checklist */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Data Quality Diagnostic Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Verify <code className="bg-muted px-1 rounded">is_current = true</code> filters on assessment queries</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Check <code className="bg-muted px-1 rounded">status = 'active'</code> for succession candidates and pool members</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Confirm <code className="bg-muted px-1 rounded">company_id</code> matches the selected company filter</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Validate readiness_level enum values match configuration</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Check date ranges include expected assessment periods</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Verify aggregation minimums for DEI/sensitive data</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cache & Refresh Timing */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cache & Refresh Timing Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Real-Time Data</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Nine-Box assessments (on save)</li>
                    <li>• Flight risk assessments (on save)</li>
                    <li>• Candidate status changes</li>
                    <li>• Plan creation/updates</li>
                  </ul>
                </div>
                <div className="p-3 bg-muted/50 rounded border">
                  <h5 className="font-medium mb-2">Cached/Aggregated Data</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Coverage scores (5-minute cache)</li>
                    <li>• Pipeline metrics (hourly rollup)</li>
                    <li>• Trend analysis (daily rollup)</li>
                    <li>• Benchmarks (weekly refresh)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalation */}
          <Alert variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Escalation Path</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li><strong>Level 1:</strong> Self-service troubleshooting using this checklist</li>
                <li><strong>Level 2:</strong> HR Admin review of data configuration</li>
                <li><strong>Level 3:</strong> Technical support for system-level issues</li>
                <li><strong>Level 4:</strong> Engineering escalation for data integrity problems</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </section>
  );
}

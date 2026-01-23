import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Database, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function PerformanceRiskTroubleshootingSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          <CardTitle>Performance Risk & Analytics Troubleshooting</CardTitle>
          <Badge variant="outline">Section 8.11</Badge>
        </div>
        <CardDescription>
          Resolving risk detection, trajectory prediction, and performance index issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sensitivity Notice</AlertTitle>
          <AlertDescription>
            Performance risk data is highly sensitive. Ensure proper authorization before sharing 
            risk reports. All access is logged for audit purposes.
          </AlertDescription>
        </Alert>

        {/* Risk Detection Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Risk Detection Issues</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="font-medium">False Positive Risks</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Insufficient historical data (new employee)</li>
                  <li>Role change not reflected in baseline</li>
                  <li>Seasonal patterns misinterpreted</li>
                  <li>External factors not captured</li>
                </ul>
                <p className="mt-2"><strong>Resolution:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Review <code>employee_performance_risks.confidence_score</code></li>
                  <li>Update baseline after role changes</li>
                  <li>Mark as resolved with notes in <code>resolved_by</code></li>
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="font-medium">Missed Risk Detection</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Risk type not enabled in configuration</li>
                  <li>Threshold set too high</li>
                  <li>Data gaps in appraisal history</li>
                  <li>AI detection job not running</li>
                </ul>
                <p className="mt-2"><strong>Resolution:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Review <code>performance_index_settings</code></li>
                  <li>Check scheduled job status</li>
                  <li>Manually create risk record if confirmed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Types Reference */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Risk Type Reference</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Risk Type</th>
                  <th className="text-left p-2">Detection Logic</th>
                  <th className="text-left p-2">Common Issues</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">declining_trend</td>
                  <td className="p-2 text-muted-foreground">3+ consecutive score decreases</td>
                  <td className="p-2">May trigger on seasonal work patterns</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">toxic_high_performer</td>
                  <td className="p-2 text-muted-foreground">High goals + low values/behavior</td>
                  <td className="p-2">Values assessment must be enabled</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">skills_decay</td>
                  <td className="p-2 text-muted-foreground">Expired certifications without renewal</td>
                  <td className="p-2">Requires Skills module integration</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">disengagement</td>
                  <td className="p-2 text-muted-foreground">Declining participation + late submissions</td>
                  <td className="p-2">May false positive during leave periods</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">manager_relationship</td>
                  <td className="p-2 text-muted-foreground">Pattern of disagreements + low ratings</td>
                  <td className="p-2">Consider recent manager changes</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">competency_gap</td>
                  <td className="p-2 text-muted-foreground">Widening gap vs job requirements</td>
                  <td className="p-2">May need IDP intervention vs PIP</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">overperformance_burnout</td>
                  <td className="p-2 text-muted-foreground">Sustained high performance + overtime</td>
                  <td className="p-2">Requires time tracking integration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Trajectory Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Performance Trajectory Prediction Errors</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Symptom: Trajectory predictions seem inaccurate</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Diagnostic Steps:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Check <code>performance_trajectory</code> for model confidence</li>
                    <li>Verify sufficient history in <code>performance_trajectory_scores</code></li>
                    <li>Review <code>performance_index_settings</code> for lookback period</li>
                    <li>Confirm no major organizational changes affecting baseline</li>
                  </ol>
                  <p className="mt-2"><strong>Required Data Points:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Minimum 2 completed appraisal cycles for 3-month prediction</li>
                    <li>Minimum 3 cycles for 6-month prediction</li>
                    <li>Minimum 4 cycles for 12-month prediction</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Index Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Performance Index Calculation Mismatches</h4>
          
          <div className="p-4 border-2 border-primary bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-primary" />
              <p className="font-medium">Index Calculation Components</p>
            </div>
            <div className="text-sm space-y-3">
              <p className="text-muted-foreground">
                The Employee Performance Index is calculated from multiple sources. 
                Check these when values seem incorrect:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Input Sources</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li><code>appraisal_scores</code> (weighted scores)</li>
                    <li><code>appraisal_participants</code> (calibrated scores)</li>
                    <li>Goal completion rates</li>
                    <li>Competency ratings over time</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Configuration</p>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li><code>lookback_months</code> (12/24/36)</li>
                    <li><code>recent_weight</code> (weight for latest cycle)</li>
                    <li><code>trend_impact</code> (bonus/penalty for trend)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intervention Tracking */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Risk Intervention Tracking</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              When risks are detected but interventions aren't tracked properly:
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>
                <strong>Verify Intervention Recording:</strong> Check <code>employee_performance_risks</code> fields:
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li><code>intervention_status</code> (none, planned, in_progress, completed)</li>
                  <li><code>intervention_type</code> (coaching, idp, pip, training)</li>
                  <li><code>intervention_started_at</code> timestamp</li>
                </ul>
              </li>
              <li>
                <strong>Link to Action Plans:</strong> Ensure related IDP/PIP is linked via:
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li><code>linked_idp_id</code> if development plan created</li>
                  <li><code>linked_pip_id</code> if improvement plan created</li>
                </ul>
              </li>
              <li>
                <strong>Resolution Tracking:</strong> Update when risk is addressed:
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li><code>is_resolved = true</code></li>
                  <li><code>resolved_at</code> timestamp</li>
                  <li><code>resolution_notes</code> with outcome details</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>

        {/* Common Error Patterns */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Common Error Patterns</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Error</th>
                  <th className="text-left p-2">Cause</th>
                  <th className="text-left p-2">Resolution</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Index shows null</td>
                  <td className="p-2 text-muted-foreground">Insufficient appraisal history</td>
                  <td className="p-2">Wait for 2+ completed cycles</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Trajectory flat despite changes</td>
                  <td className="p-2 text-muted-foreground">Prediction job not running</td>
                  <td className="p-2">Check scheduled job status</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Risk severity incorrect</td>
                  <td className="p-2 text-muted-foreground">Threshold configuration</td>
                  <td className="p-2">Adjust in index settings</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Duplicate risk records</td>
                  <td className="p-2 text-muted-foreground">Manual + automated creation</td>
                  <td className="p-2">Merge records, keep most complete</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Resolution Checklist */}
        <div className="p-4 border-2 border-green-500 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-semibold">Performance Risk Issue Resolution Checklist</p>
          </div>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              'Verify sufficient appraisal history exists',
              'Check risk detection job is running',
              'Review confidence scores for accuracy',
              'Confirm index settings are appropriate',
              'Validate trajectory data sources',
              'Check intervention linkages (IDP/PIP)',
              'Update resolution status when addressed',
              'Document false positives for model improvement'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border rounded flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

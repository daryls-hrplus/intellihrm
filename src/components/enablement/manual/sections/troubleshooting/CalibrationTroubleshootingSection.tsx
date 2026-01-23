import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Database, Scale, Shield, XCircle, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function CalibrationTroubleshootingSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <CardTitle>Calibration Session Troubleshooting</CardTitle>
          <Badge variant="outline">Section 8.10</Badge>
        </div>
        <CardDescription>
          Resolving calibration access, scoring, governance, and alignment issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Audit Compliance</AlertTitle>
          <AlertDescription>
            All calibration adjustments are tracked in <code className="mx-1 px-1 bg-muted rounded">calibration_override_audit</code> 
            for EEOC compliance and internal governance.
          </AlertDescription>
        </Alert>

        {/* Session Access Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Session Access & Permission Issues</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Symptom: User cannot access calibration session</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Possible Causes:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>User not added as participant in <code>calibration_participants</code></li>
                    <li>Session status is not 'in_progress' or 'scheduled'</li>
                    <li>User role does not have calibration permissions</li>
                    <li>Department scope restriction not met</li>
                  </ul>
                  <p className="mt-2"><strong>Resolution Steps:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Verify user is in <code>calibration_participants</code> with correct session_id</li>
                    <li>Check <code>calibration_sessions.status</code> is active</li>
                    <li>Confirm user role includes 'calibration_facilitator' or 'calibration_viewer'</li>
                    <li>Verify department_id alignment if session is department-scoped</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Adjustment Failures */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Score Adjustment Failures</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="font-medium">Adjustment Rejected</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Change exceeds <code>max_score_change</code> governance rule</li>
                  <li>Required justification not provided</li>
                  <li>User lacks adjustment authority</li>
                  <li>Session is in read-only mode</li>
                </ul>
                <p className="mt-2"><strong>Resolution:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check <code>calibration_governance_rules</code> for limits</li>
                  <li>Ensure adjustment_reason is populated</li>
                  <li>Request approval for large adjustments</li>
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="font-medium">Adjustment Not Saved</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Common Causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Session lock by another facilitator</li>
                  <li>Concurrent edit conflict</li>
                  <li>Network connectivity issues</li>
                </ul>
                <p className="mt-2"><strong>Resolution:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Refresh session to resolve conflicts</li>
                  <li>Check <code>calibration_adjustments</code> for existing records</li>
                  <li>Verify session is not locked by viewing participants</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Governance Rule Violations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Governance Rule Violations</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rule Type</th>
                  <th className="text-left p-2">Violation Symptom</th>
                  <th className="text-left p-2">Resolution</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">max_score_change</td>
                  <td className="p-2 text-muted-foreground">Adjustment blocked with limit error</td>
                  <td className="p-2">Request exception approval or apply smaller adjustment</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">require_justification</td>
                  <td className="p-2 text-muted-foreground">Save blocked until reason provided</td>
                  <td className="p-2">Enter detailed justification in adjustment form</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">approval_threshold</td>
                  <td className="p-2 text-muted-foreground">Adjustment pending approval</td>
                  <td className="p-2">Route to approver via workflow</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">distribution_target</td>
                  <td className="p-2 text-muted-foreground">Warning about distribution deviation</td>
                  <td className="p-2">Review against benchmark percentages</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Trail Gaps */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Audit Trail Issues</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Missing Audit Records</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Diagnostic Query:</strong></p>
                  <div className="p-2 bg-muted rounded font-mono text-xs">
                    <code>
                      SELECT * FROM calibration_override_audit<br/>
                      WHERE session_id = '[session_id]'<br/>
                      ORDER BY created_at DESC;
                    </code>
                  </div>
                  <p className="mt-2"><strong>Common Gaps:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Adjustment made before audit trigger was active</li>
                    <li>Direct database update bypassed application layer</li>
                    <li>Session restored from backup without audit data</li>
                  </ul>
                  <p className="mt-2"><strong>Resolution:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Reconstruct from <code>calibration_adjustments</code> timestamps</li>
                    <li>Document gap in session notes for compliance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manager Alignment Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Manager Alignment Drift Detection</h4>
          
          <div className="p-4 border-2 border-primary bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" />
              <p className="font-medium">Alignment Score Interpretation</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded bg-green-50 dark:bg-green-900/20">
                <Badge className="bg-green-600 text-white mb-2">85-100%</Badge>
                <p className="font-medium">Well Aligned</p>
                <p className="text-muted-foreground text-xs">
                  Manager ratings consistently match calibration outcomes
                </p>
              </div>
              <div className="p-3 border rounded bg-amber-50 dark:bg-amber-900/20">
                <Badge className="bg-amber-600 text-white mb-2">60-84%</Badge>
                <p className="font-medium">Moderate Drift</p>
                <p className="text-muted-foreground text-xs">
                  Consider coaching on calibration standards
                </p>
              </div>
              <div className="p-3 border rounded bg-red-50 dark:bg-red-900/20">
                <Badge className="bg-red-600 text-white mb-2">&lt;60%</Badge>
                <p className="font-medium">Significant Drift</p>
                <p className="text-muted-foreground text-xs">
                  Mandatory training and HR review required
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Track in <code>manager_calibration_alignment</code> - review <code>alignment_score</code>, <code>adjustment_frequency</code>, 
              and <code>average_adjustment_magnitude</code> for patterns.
            </p>
          </div>
        </div>

        {/* Nine-Box Sync Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Nine-Box Synchronization Issues</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Symptom: Nine-Box placement doesn't reflect calibration changes</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Diagnostic Steps:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Check <code>appraisal_participants.post_calibration_score</code> is updated</li>
                    <li>Verify <code>nine_box_assessments</code> has matching timestamp</li>
                    <li>Confirm <code>nine_box_rating_sources</code> includes calibrated scores</li>
                    <li>Check for pending recalculation jobs</li>
                  </ol>
                  <p className="mt-2"><strong>Resolution:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Trigger Nine-Box recalculation from Talent module</li>
                    <li>Verify integration rule is active for calibration → nine-box</li>
                    <li>Check <code>nine_box_signal_mappings</code> configuration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Checklist */}
        <div className="p-4 border-2 border-green-500 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-semibold">Calibration Issue Resolution Checklist</p>
          </div>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              'Verify participant access and permissions',
              'Check session status is active',
              'Review governance rules for adjustment limits',
              'Confirm justification requirements met',
              'Verify audit trail completeness',
              'Check manager alignment scores',
              'Validate Nine-Box synchronization',
              'Document any exceptions for compliance'
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  AlertTriangle,
  CheckCircle2,
  Search,
  Phone
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  TroubleshootingSection,
  type TroubleshootingItem
} from '@/components/enablement/manual/components';

const commonIssues: TroubleshootingItem[] = [
  {
    issue: 'Rule matches but action does not execute',
    cause: 'requires_approval=true but no approver available, or auto_execute=false with no workflow',
    solution: 'Check appraisal_integration_log for pending status. Verify approval workflow is configured or set auto_execute=true'
  },
  {
    issue: 'Nine-Box not updating after appraisal finalization',
    cause: 'Missing integration rule for appraisal_finalized trigger, or rule is_active=false',
    solution: 'Verify rule exists with trigger_event=appraisal_finalized and target_module=nine_box. Enable rule if inactive'
  },
  {
    issue: 'Duplicate integration log entries',
    cause: 'Multiple rules matching same trigger with same action, or event firing multiple times',
    solution: 'Review rules for overlapping conditions. Check execution_order to ensure first-match behavior'
  },
  {
    issue: 'Target record not found error',
    cause: 'Employee record deleted, transferred, or succession candidate removed between trigger and execution',
    solution: 'Check employee status in Workforce. Retry execution if employee restored, or cancel if legitimately removed'
  },
  {
    issue: '360 signals not feeding Potential axis',
    cause: 'Signal confidence below threshold, K-anonymity not met, or signal_generation_enabled=false',
    solution: 'Check talent_signal_snapshots for employee. Verify cycle has ≥5 responses. Enable signal generation in cycle config'
  },
  {
    issue: 'Training request not created from succession gap',
    cause: 'Missing competency_course_mapping for the gap competency, or gap_severity below rule threshold',
    solution: 'Verify competency has course mappings in Learning → Setup. Adjust rule condition_value to match gap severity'
  },
  {
    issue: 'Approval queue shows no succession items',
    cause: 'Workflow not enabled for succession transaction types, or user lacks approval permissions',
    solution: 'Enable workflows in HR Hub → Settings → Workflow Configuration. Verify user has hr_approver permission'
  },
  {
    issue: 'Integration actions timing out',
    cause: 'Large batch of actions from cycle completion, or edge function resource limits',
    solution: 'Actions are queued and processed sequentially. Wait for completion. Check edge function logs for errors'
  }
];

const diagnosticSteps = [
  'Check appraisal_integration_log for the employee - what was the last trigger_event and action_result?',
  'Verify integration rule exists: is_active=true, correct trigger_event, conditions match',
  'Review trigger_data in log entry - does it contain expected values (scores, categories)?',
  'Check target_module logs - did the action reach the target (e.g., nine_box_assessments)?',
  'Verify employee eligibility - active status, correct company, has required data',
  'Test rule with lower condition threshold to confirm basic execution works'
];

export function IntegrationTroubleshooting() {
  return (
    <section id="sec-9-12" data-manual-anchor="sec-9-12" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <HelpCircle className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.12 Troubleshooting Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Common issues, diagnostic procedures, and escalation paths
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Diagnose common integration failures',
        'Use integration logs for root cause analysis',
        'Resolve configuration and data issues',
        'Know when to escalate to technical support'
      ]} />

      <TroubleshootingSection items={commonIssues} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Diagnostic Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Follow this checklist when integration actions are not executing as expected:
          </p>

          <div className="p-4 border rounded-lg">
            <ol className="space-y-3 text-sm">
              {diagnosticSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Circular Dependency Prevention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The integration engine prevents circular dependencies where actions trigger each other infinitely:
          </p>

          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Example Circular Pattern</h4>
            <div className="text-sm font-mono space-y-1">
              <p>Rule A: appraisal_finalized → update_nine_box</p>
              <p>Rule B: nine_box_updated → refresh_appraisal</p>
              <p>Rule C: appraisal_updated → update_nine_box ← Circular!</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Prevention Mechanisms</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>Execution depth limit:</strong> Maximum 3 chained triggers per source event</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>Same-record skip:</strong> If target record was just modified by same chain, skip</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <span><strong>Cooldown period:</strong> Same trigger+employee blocked for 5 seconds</span>
              </li>
            </ul>
          </div>

          <TipCallout>
            If you need actions that would create a circular pattern, use a time-delayed approach: 
            schedule the second action for batch execution rather than immediate trigger.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Escalation Path
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Escalate to technical support when:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Escalate Immediately</h4>
              <ul className="text-sm space-y-1">
                <li>• Data corruption suspected</li>
                <li>• Security concern identified</li>
                <li>• System-wide integration failure</li>
                <li>• Edge function not responding</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Escalate After Self-Service</h4>
              <ul className="text-sm space-y-1">
                <li>• Persistent errors after retry</li>
                <li>• Configuration issue unclear</li>
                <li>• Unexpected behavior patterns</li>
                <li>• Performance degradation</li>
              </ul>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Information to Include</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Integration log entry IDs (from appraisal_integration_log)</li>
              <li>• Rule IDs involved</li>
              <li>• Employee IDs affected</li>
              <li>• Timestamp range of issue</li>
              <li>• Steps to reproduce if possible</li>
              <li>• Screenshots of error messages</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Health Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Run this weekly health check to catch issues proactively:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Check</th>
                  <th className="text-left py-2 px-3">Query/Location</th>
                  <th className="text-left py-2 px-3">Healthy Threshold</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Failed executions (7 days)</td>
                  <td className="py-2 px-3 font-mono text-xs">action_result = 'failed'</td>
                  <td className="py-2 px-3"><Badge variant="secondary">&lt; 5%</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Pending approvals (&gt; 48h)</td>
                  <td className="py-2 px-3">HR Hub → Pending Approvals</td>
                  <td className="py-2 px-3"><Badge variant="secondary">0</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Stale signal snapshots</td>
                  <td className="py-2 px-3 font-mono text-xs">data_freshness_days &gt; 90</td>
                  <td className="py-2 px-3"><Badge variant="secondary">&lt; 10%</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Inactive rules</td>
                  <td className="py-2 px-3 font-mono text-xs">is_active = false</td>
                  <td className="py-2 px-3"><Badge variant="outline">Review monthly</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <InfoCallout>
        Document resolved issues in your organization's knowledge base. Recurring issues often 
        indicate training needs or configuration improvements that benefit other administrators.
      </InfoCallout>
    </section>
  );
}

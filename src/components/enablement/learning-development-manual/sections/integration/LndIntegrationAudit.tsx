import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileSearch, 
  Database,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

const integrationLogFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique log identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'rule_id', required: false, type: 'UUID', description: 'Source integration rule', defaultValue: 'null', validation: 'References appraisal_integration_rules.id' },
  { name: 'participant_id', required: false, type: 'UUID', description: 'Source appraisal participant', defaultValue: 'null', validation: 'References appraisal_participants.id' },
  { name: 'employee_id', required: true, type: 'UUID', description: 'Target employee', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company context', defaultValue: '—', validation: 'References companies.id' },
  { name: 'trigger_event', required: true, type: 'text', description: 'Event that triggered the action', defaultValue: '—', validation: 'e.g., appraisal_finalized' },
  { name: 'trigger_data', required: false, type: 'jsonb', description: 'Event payload data', defaultValue: '{}', validation: 'JSON object' },
  { name: 'target_module', required: true, type: 'text', description: 'Target integration module', defaultValue: '—', validation: 'training, succession, nine_box, etc.' },
  { name: 'action_type', required: true, type: 'text', description: 'Action executed', defaultValue: '—', validation: 'create_request, auto_enroll, recommend, etc.' },
  { name: 'action_result', required: true, type: 'text', description: 'Execution status', defaultValue: 'pending', validation: 'pending, success, failed, pending_approval, cancelled' },
  { name: 'target_record_id', required: false, type: 'UUID', description: 'Created record ID', defaultValue: 'null', validation: 'ID of created enrollment/request' },
  { name: 'target_record_type', required: false, type: 'text', description: 'Created record type', defaultValue: 'null', validation: 'training_request, lms_enrollment, etc.' },
  { name: 'error_message', required: false, type: 'text', description: 'Error details if failed', defaultValue: 'null', validation: 'Error description' },
  { name: 'executed_at', required: false, type: 'timestamptz', description: 'When action was executed', defaultValue: 'null', validation: 'Timestamp' },
  { name: 'requires_approval', required: false, type: 'boolean', description: 'Pending HR approval', defaultValue: 'false', validation: 'true/false' },
  { name: 'approved_at', required: false, type: 'timestamptz', description: 'When approved', defaultValue: 'null', validation: 'Timestamp' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Log creation time', defaultValue: 'now()', validation: 'Auto-set' }
];

export function LndIntegrationAudit() {
  return (
    <section id="sec-8-11" data-manual-anchor="sec-8-11" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileSearch className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.11 Integration Audit & Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Track integration execution, diagnose failures, and monitor automation health
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Query the appraisal_integration_log for execution history',
        'Diagnose failed integration actions with error messages',
        'Monitor pending approval queue for integration-triggered requests',
        'Generate compliance reports for automated training assignments'
      ]} />

      <FieldReferenceTable 
        fields={integrationLogFields} 
        title="appraisal_integration_log Table" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Diagnostic Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Recent Training Integration Executions</h4>
            <div className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
              <pre>{`SELECT 
  ail.id,
  ail.trigger_event,
  ail.action_type,
  ail.action_result,
  ail.error_message,
  ail.executed_at,
  p.full_name as employee_name
FROM appraisal_integration_log ail
JOIN profiles p ON ail.employee_id = p.id
WHERE ail.target_module = 'training'
  AND ail.created_at > NOW() - INTERVAL '7 days'
ORDER BY ail.created_at DESC
LIMIT 50;`}</pre>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Failed Integrations</h4>
            <div className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
              <pre>{`SELECT 
  ail.trigger_event,
  ail.action_type,
  ail.error_message,
  COUNT(*) as failure_count
FROM appraisal_integration_log ail
WHERE ail.target_module = 'training'
  AND ail.action_result = 'failed'
  AND ail.created_at > NOW() - INTERVAL '30 days'
GROUP BY ail.trigger_event, ail.action_type, ail.error_message
ORDER BY failure_count DESC;`}</pre>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Pending Approval Queue</h4>
            <div className="text-xs font-mono bg-muted/50 p-3 rounded overflow-x-auto">
              <pre>{`SELECT 
  ail.id,
  p.full_name as employee_name,
  ail.action_type,
  ail.created_at,
  EXTRACT(hours FROM NOW() - ail.created_at) as hours_pending
FROM appraisal_integration_log ail
JOIN profiles p ON ail.employee_id = p.id
WHERE ail.target_module = 'training'
  AND ail.action_result = 'pending_approval'
ORDER BY ail.created_at ASC;`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Execution Status Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <Badge variant="outline">success</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Action completed successfully. Target record created/updated.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <Badge variant="secondary">pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Action queued for execution. Waiting for scheduled job.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <Badge>pending_approval</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Action requires HR approval before execution.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <Badge variant="destructive">failed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Action failed. Check error_message for details.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <Badge variant="outline">cancelled</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Action cancelled by user or rejected in approval.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <Badge variant="outline">skipped</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Action skipped due to duplicate or condition not met.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monitoring Dashboard Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">95%</p>
              <p className="text-sm text-muted-foreground">Success Rate (30d)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-amber-600">12</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">3</p>
              <p className="text-sm text-muted-foreground">Failed (7d)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">247</p>
              <p className="text-sm text-muted-foreground">Total Executions (30d)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScreenshotPlaceholder 
        title="Integration Audit Log"
        description="Shows the audit log viewer with filtering by status, date range, and action type"
      />

      <TipCallout>
        <strong>Proactive Monitoring:</strong> Set up alerts for failed integrations and 
        approval queue backlogs. A healthy integration should maintain &gt;95% success rate 
        and &lt;24 hour average approval time.
      </TipCallout>

      <InfoCallout>
        For SOC 2 compliance, integration logs are retained for 7 years. The 
        <code>appraisal_integration_log</code> table is append-only with no deletion 
        capability via the application.
      </InfoCallout>
    </section>
  );
}

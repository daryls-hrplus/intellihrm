import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileSearch, 
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';

const integrationLogFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'rule_id', required: false, type: 'uuid', description: 'Integration rule that triggered action', defaultValue: 'null', validation: 'References appraisal_integration_rules.id' },
  { name: 'participant_id', required: false, type: 'uuid', description: 'Appraisal participant if applicable', defaultValue: 'null', validation: 'References appraisal_participants.id' },
  { name: 'employee_id', required: true, type: 'uuid', description: 'Employee affected by action', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company context', defaultValue: '—', validation: 'References companies.id' },
  { name: 'trigger_event', required: true, type: 'text', description: 'Event that triggered execution', defaultValue: '—', validation: 'e.g., appraisal_finalized' },
  { name: 'trigger_data', required: false, type: 'jsonb', description: 'Data from trigger source', defaultValue: '{}', validation: 'Scores, categories, etc.' },
  { name: 'target_module', required: true, type: 'text', description: 'Module receiving action', defaultValue: '—', validation: 'nine_box, succession, training, etc.' },
  { name: 'action_type', required: true, type: 'text', description: 'Action performed', defaultValue: '—', validation: 'Depends on target_module' },
  { name: 'action_config', required: false, type: 'jsonb', description: 'Action configuration snapshot at execution time', defaultValue: '{}', validation: 'Captured from rule' },
  { name: 'action_result', required: true, type: 'text', description: 'Execution outcome', defaultValue: 'pending', validation: 'pending, success, failed, cancelled' },
  { name: 'target_record_id', required: false, type: 'uuid', description: 'Record created/modified', defaultValue: 'null', validation: 'e.g., nine_box_assessment.id' },
  { name: 'target_record_type', required: false, type: 'text', description: 'Type of target record', defaultValue: 'null', validation: 'Table name' },
  { name: 'error_message', required: false, type: 'text', description: 'Error details if failed', defaultValue: 'null', validation: '—' },
  { name: 'executed_at', required: false, type: 'timestamptz', description: 'When action executed', defaultValue: 'null', validation: 'Null until executed' },
  { name: 'executed_by', required: false, type: 'uuid', description: 'User who executed the action (null for auto-execute)', defaultValue: 'null', validation: 'References profiles.id' },
  { name: 'requires_approval', required: false, type: 'boolean', description: 'Whether approval was needed', defaultValue: 'false', validation: '—' },
  { name: 'approved_at', required: false, type: 'timestamptz', description: 'When approval granted', defaultValue: 'null', validation: 'Null if auto-executed or pending' },
  { name: 'approved_by', required: false, type: 'uuid', description: 'User who approved the action', defaultValue: 'null', validation: 'References profiles.id' },
  { name: 'rejection_reason', required: false, type: 'text', description: 'Reason provided if action was rejected', defaultValue: 'null', validation: 'Required when cancelled' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Log entry creation', defaultValue: 'now()', validation: 'Auto-set' }
];

const statusLifecycle = [
  { status: 'pending', description: 'Action created, awaiting execution or approval', color: 'bg-amber-500' },
  { status: 'success', description: 'Action executed successfully', color: 'bg-green-500' },
  { status: 'failed', description: 'Execution failed with error', color: 'bg-red-500' },
  { status: 'cancelled', description: 'Action rejected or cancelled', color: 'bg-gray-500' }
];

export function IntegrationExecutionAudit() {
  return (
    <section id="sec-9-11" data-manual-anchor="sec-9-11" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <FileSearch className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.11 Integration Execution & Audit</h3>
          <p className="text-sm text-muted-foreground">
            Monitor execution logs, handle errors, and maintain SOC 2 compliance
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the appraisal_integration_log table structure (21 fields)',
        'Monitor execution states and handle failures',
        'Process approval workflows for flagged actions',
        'Maintain audit trails for SOC 2 compliance'
      ]} />

      <FieldReferenceTable 
        fields={integrationLogFields} 
        title="appraisal_integration_log Table (21 Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Execution Status Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            {statusLifecycle.map(s => (
              <div key={s.status} className="p-4 border rounded-lg text-center">
                <div className={`w-4 h-4 rounded-full ${s.color} mx-auto mb-2`} />
                <p className="font-mono text-sm font-medium">{s.status}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Status Transitions</h4>
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
              <Badge variant="secondary">pending</Badge>
              <span>→</span>
              <div className="flex gap-2">
                <Badge className="bg-green-500">success</Badge>
                <span className="text-muted-foreground">or</span>
                <Badge variant="destructive">failed</Badge>
                <span className="text-muted-foreground">or</span>
                <Badge variant="outline">cancelled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Handling & Retry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Failed integrations are logged with error details and can be retried:
          </p>

          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950/20">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Common Failure Causes</h4>
            <ul className="text-sm space-y-2">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium">Target record not found:</span>
                  <span className="text-muted-foreground ml-1">Employee deleted or transferred before execution</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium">Validation failure:</span>
                  <span className="text-muted-foreground ml-1">Action config missing required fields</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium">Permission denied:</span>
                  <span className="text-muted-foreground ml-1">Rule attempts action on protected record</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <span className="font-medium">Circular dependency:</span>
                  <span className="text-muted-foreground ml-1">Action would trigger infinite loop</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Retry Procedure</h4>
            <ol className="text-sm space-y-2">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <span>Review error_message in log entry for root cause</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <span>Fix underlying issue (data, permissions, config)</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <span>Navigate to log entry and click "Retry Execution"</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <span>System re-evaluates rule and re-executes action</span>
              </li>
            </ol>
          </div>

          <WarningCallout>
            Failed integrations should be reviewed daily. Persistent failures may indicate 
            configuration issues that affect multiple employees.
          </WarningCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            SOC 2 Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The integration log provides a complete audit trail for SOC 2 compliance:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">What's Logged</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Every rule evaluation (matching or not)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Trigger data at execution time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Approval decisions and approvers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Target records created/modified
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Error details and retry attempts
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Retention Policy</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                  Logs retained for 7 years minimum
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                  Immutable once created (no deletions)
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                  Timestamps in UTC with timezone
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                  Cross-referenced with source records
                </li>
              </ul>
            </div>
          </div>

          <TipCallout>
            Export integration logs monthly for off-system archival. Use the 
            <strong>HR Hub → Reports → Integration Audit Report</strong> to generate 
            compliance-ready exports filtered by date range and action type.
          </TipCallout>
        </CardContent>
      </Card>

      <InfoCallout>
        Integration logs are accessible to users with the <code>integration_admin</code> or 
        <code>hr_admin</code> permission. Configure role permissions in 
        <strong>Governance → Permissions → Module Permissions</strong>.
      </InfoCallout>
    </section>
  );
}

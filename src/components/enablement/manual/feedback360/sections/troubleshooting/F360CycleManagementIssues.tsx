import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Lightbulb, Clock, Database } from 'lucide-react';
import { FieldReferenceTable } from '../../../components/FieldReferenceTable';

const LIFECYCLE_ISSUES = [
  {
    id: 'cyc-001',
    title: 'Cycle stuck in "Processing" status',
    severity: 'high',
    symptoms: ['Status shows "Processing" for > 24 hours', 'Reports not generating', 'No signal extraction occurring'],
    causes: ['Background job failed', 'Insufficient data for processing', 'Database lock on aggregation'],
    resolution: [
      'Check Admin → Background Jobs for failed tasks',
      'Verify minimum response thresholds met per category',
      'Contact support if job retry fails after 3 attempts',
      'For urgent cycles, use manual processing override (Admin → Cycles → Force Process)'
    ],
    affectedTable: 'feedback_360_cycles',
    affectedFields: 'status, signal_processing_status, processed_at'
  },
  {
    id: 'cyc-002',
    title: 'Cannot transition from Nomination to Collection',
    severity: 'high',
    symptoms: ['Activate button disabled', 'Error: "Validation failed"', 'Transition blocked'],
    causes: ['Not all participants have minimum raters', 'Pending nomination approvals exist', 'Self-assessment not enabled'],
    resolution: [
      'Run Admin → Cycles → Readiness Check to identify blockers',
      'Review participants with < minimum raters',
      'Process pending manager approvals',
      'Optionally lower min_raters temporarily (document exception)'
    ],
    affectedTable: 'feedback_360_participants',
    affectedFields: 'status, rater_count, nominations_approved_at'
  },
  {
    id: 'cyc-003',
    title: 'Participant not receiving nominations',
    severity: 'medium',
    symptoms: ['Employee not in participant list', 'Manager cannot see employee for 360', 'No self-assessment prompt'],
    causes: ['Employee not enrolled in cycle', 'Employment status inactive', 'Excluded by filter criteria'],
    resolution: [
      'Check participant enrollment in cycle settings',
      'Verify employee profile status is "active"',
      'Review cycle inclusion/exclusion filters',
      'Manually enroll participant if within nomination window'
    ],
    affectedTable: 'feedback_360_participants',
    affectedFields: 'cycle_id, employee_id, enrollment_status'
  },
  {
    id: 'cyc-004',
    title: 'Deadline extension not applying',
    severity: 'medium',
    symptoms: ['Raters still see old deadline', 'System closed collection early', 'Extension saved but not reflected'],
    causes: ['Cache not refreshed', 'Notification not sent for extension', 'Extension saved to wrong cycle'],
    resolution: [
      'Verify extension saved on correct cycle record',
      'Trigger notification resend for extended deadline',
      'Clear participant/rater session cache',
      'Confirm extension date is future-dated'
    ],
    affectedTable: 'feedback_360_cycles',
    affectedFields: 'feedback_end_date, extended_at, extended_by'
  },
  {
    id: 'cyc-005',
    title: 'Rater assignment not saving',
    severity: 'medium',
    symptoms: ['Selected raters disappear after save', 'Assignment confirmation not received', 'Rater count shows 0'],
    causes: ['Validation error (duplicate rater)', 'Rater category max exceeded', 'Network timeout on save'],
    resolution: [
      'Check browser console for validation errors',
      'Verify rater not already assigned in another category',
      'Ensure max_raters limit not exceeded for category',
      'Retry save with stable network connection'
    ],
    affectedTable: 'feedback_360_raters',
    affectedFields: 'participant_id, rater_id, rater_category, status'
  },
  {
    id: 'cyc-006',
    title: 'Self-assessment not appearing',
    severity: 'high',
    symptoms: ['Participant cannot complete self-review', 'Self-Assessment tab missing', 'Self score not included'],
    causes: ['Self-assessment disabled for cycle', 'Self rater category not configured', 'Employee already submitted'],
    resolution: [
      'Check cycle settings: "Self-Assessment Required" flag',
      'Verify SELF rater category is enabled and has weight > 0',
      'Check if participant already submitted (status = completed)',
      'If disabled by error, enable and notify participant'
    ],
    affectedTable: 'feedback_360_rater_categories',
    affectedFields: 'category_code = SELF, is_enabled, is_required'
  },
  {
    id: 'cyc-007',
    title: 'Cycle cannot be closed',
    severity: 'low',
    symptoms: ['Close button disabled', 'Warning: "Pending actions remain"', 'Status stuck at Released'],
    causes: ['Unreleased reports exist', 'Pending acknowledgments required', 'Integration sync incomplete'],
    resolution: [
      'Release all pending reports or mark as N/A',
      'Process or waive remaining acknowledgments',
      'Check integration queue for pending syncs',
      'Use force-close option with documented reason'
    ],
    affectedTable: 'feedback_360_cycles',
    affectedFields: 'status, closed_at, closed_by, close_reason'
  }
];

const STATUS_TRANSITIONS = [
  { from: 'Draft', to: 'Nomination', requirements: 'Questions configured, dates set, participants enrolled' },
  { from: 'Nomination', to: 'Collection', requirements: 'All participants have minimum raters assigned, approvals complete' },
  { from: 'Collection', to: 'Processing', requirements: 'Deadline reached or manually triggered, minimum responses received' },
  { from: 'Processing', to: 'Review', requirements: 'Aggregation complete, reports generated, signals extracted' },
  { from: 'Review', to: 'Released', requirements: 'HR review approved, release schedule configured' },
  { from: 'Released', to: 'Closed', requirements: 'All audiences notified, integrations synced, retention policy set' }
];

import { FieldDefinition } from '../../../components/FieldReferenceTable';

const FIELD_REFERENCES: FieldDefinition[] = [
  { name: 'feedback_360_cycles.status', required: true, type: 'enum', description: 'Current lifecycle state controlling available actions' },
  { name: 'feedback_360_cycles.activated_at', required: false, type: 'timestamp', description: 'Timestamp when cycle moved from draft to nomination' },
  { name: 'feedback_360_cycles.signal_processing_status', required: true, type: 'enum', description: 'AI processing state: pending, processing, completed, failed' },
  { name: 'feedback_360_participants.rater_count', required: false, type: 'integer', description: 'Number of assigned raters across all categories' },
  { name: 'feedback_360_participants.nominations_approved_at', required: false, type: 'timestamp', description: 'When manager approved participant rater nominations' },
  { name: 'feedback_360_cycles.is_locked', required: true, type: 'boolean', description: 'Prevents further modifications when true' }
];

export function F360CycleManagementIssues() {
  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold">8.2 Cycle Management Issues</h3>
        </div>
        <p className="text-muted-foreground">
          Handling lifecycle transitions, nomination failures, deadline adjustments, status stuck states, 
          and participant enrollment problems.
        </p>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg flex flex-wrap gap-4 text-sm">
          <span><strong>Read Time:</strong> 15 minutes</span>
          <span><strong>Target Roles:</strong> Admin, HR Partner</span>
          <span><strong>Issues Covered:</strong> 10+</span>
        </div>
      </div>

      {/* Learning Objectives */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Learning Objectives</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Understand the 360 cycle lifecycle and valid transitions</li>
            <li>Diagnose and resolve status transition failures</li>
            <li>Handle nomination and deadline management issues</li>
            <li>Apply emergency procedures for stuck cycles</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Lifecycle State Machine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cycle Lifecycle Transitions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-center p-4 bg-muted/30 rounded-lg text-sm">
              {['Draft', 'Nomination', 'Collection', 'Processing', 'Review', 'Released', 'Closed'].map((status, i, arr) => (
                <span key={status} className="flex items-center gap-2">
                  <Badge variant={i === 0 ? 'outline' : i === arr.length - 1 ? 'secondary' : 'default'}>
                    {status}
                  </Badge>
                  {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">From</th>
                    <th className="text-left p-2">To</th>
                    <th className="text-left p-2">Requirements</th>
                  </tr>
                </thead>
                <tbody>
                  {STATUS_TRANSITIONS.map((t, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2"><Badge variant="outline">{t.from}</Badge></td>
                      <td className="p-2"><Badge variant="outline">{t.to}</Badge></td>
                      <td className="p-2 text-muted-foreground">{t.requirements}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Cycle Management Issue Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {LIFECYCLE_ISSUES.map((issue) => (
            <div key={issue.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">{issue.id}</Badge>
                  <div>
                    <h4 className="font-semibold">{issue.title}</h4>
                    <Badge variant="outline" className={`mt-1 ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Symptoms
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {issue.symptoms.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Causes
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {issue.causes.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Resolution Steps
                </h5>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  {issue.resolution.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-wrap gap-4 pt-2 border-t text-xs">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <code className="bg-muted px-1 rounded">{issue.affectedTable}</code>
                </span>
                <span className="text-muted-foreground">
                  Fields: <code className="bg-muted px-1 rounded">{issue.affectedFields}</code>
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Field Reference */}
      <FieldReferenceTable 
        title="Cycle Management Field Reference"
        fields={FIELD_REFERENCES}
      />

      {/* Emergency Procedures */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Emergency Procedures</AlertTitle>
        <AlertDescription>
          <p className="mb-2">For cycles that require immediate intervention:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Stuck Processing:</strong> Admin → Cycles → Force Process (requires Admin role)</li>
            <li><strong>Stuck Transition:</strong> Use SQL console with cycle_force_transition() function</li>
            <li><strong>Data Corruption:</strong> Contact support; do not modify cycle directly</li>
            <li><strong>Urgent Closure:</strong> Admin → Cycles → Emergency Close (all data archived)</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}

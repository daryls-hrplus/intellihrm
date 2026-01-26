import { LearningObjectives } from '../../../components/LearningObjectives';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { MessageSquare, AlertTriangle, Clock, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Diagnose and resolve low response rate issues',
  'Troubleshoot declined rater scenarios',
  'Fix external rater access problems',
  'Handle timeout and session issues'
];

const lowResponseIssues: TroubleshootingItem[] = [
  {
    issue: 'Response rate below 50% threshold',
    cause: 'Insufficient reminders, unclear deadlines, or rater fatigue from multiple concurrent cycles',
    solution: 'Enable automated reminders (3-5 over cycle period), send manager escalation notices, and stagger cycle launches across departments to reduce survey fatigue.'
  },
  {
    issue: 'Raters not receiving invitation emails',
    cause: 'Email addresses invalid, spam filtering, or notification settings disabled',
    solution: 'Verify email addresses in profiles, check spam/junk folders, add system email to allowed senders list, and confirm notification_preferences.feedback_requests is enabled.'
  },
  {
    issue: 'Self-assessment completion rate low',
    cause: 'Employees unaware of requirement, unclear instructions, or technical access issues',
    solution: 'Send targeted reminders specifically for self-assessment, provide in-app guidance, and ensure employees have portal access with correct permissions.'
  },
  {
    issue: 'Manager raters not responding',
    cause: 'Manager workload, unclear responsibility, or delegation confusion',
    solution: 'Escalate to skip-level manager, include completion in manager KPIs, provide manager-specific completion dashboard, and clarify that manager feedback is mandatory.'
  }
];

const declinedRaterIssues: TroubleshootingItem[] = [
  {
    issue: 'High decline rate for peer nominations',
    cause: 'Raters feel unqualified, workload concerns, or relationship with subject is insufficient',
    solution: 'Allow decline with reason, auto-suggest replacement raters, extend nomination pool, and communicate minimum interaction requirements (e.g., 3+ months working together).'
  },
  {
    issue: 'Declined rater not replaced before deadline',
    cause: 'No replacement workflow configured, or participant unaware of decline',
    solution: 'Enable automatic participant notification on decline, configure replacement nomination window, and set up manager backup assignment if participant doesn\'t respond.'
  },
  {
    issue: 'External rater declined but still showing in pending list',
    cause: 'Decline status not properly synchronized, or request record not updated',
    solution: 'Check feedback_360_requests.status = \'declined\', verify decline webhook processed, and manually update status if sync failed.'
  }
];

const externalRaterIssues: TroubleshootingItem[] = [
  {
    issue: 'External rater cannot access feedback form',
    cause: 'Token expired, incorrect URL, or IP restrictions blocking access',
    solution: 'Regenerate access token (extends validity 14 days), verify external_rater_tokens.is_valid = true, check for corporate firewall blocks, and provide alternative access method.'
  },
  {
    issue: 'External rater submission not saved',
    cause: 'Session timeout during completion, network interruption, or form validation failure',
    solution: 'Enable auto-save every 30 seconds, provide session timeout warning, validate all required fields client-side before submission, and log partial responses for recovery.'
  },
  {
    issue: 'External rater identity cannot be verified',
    cause: 'Email mismatch, token reused, or unauthorized access attempt',
    solution: 'Log access attempts in security_audit_logs, require email verification on first access, implement rate limiting, and alert admin on suspicious patterns.'
  }
];

const timeoutIssues: TroubleshootingItem[] = [
  {
    issue: 'Form submission fails with timeout error',
    cause: 'Large comment text, slow network, or server processing delay',
    solution: 'Implement chunked submission for large responses, add client-side retry logic with exponential backoff, and increase server timeout for feedback endpoints to 60 seconds.'
  },
  {
    issue: 'Session expired during feedback entry',
    cause: 'User inactive too long, or token refresh failed',
    solution: 'Implement auto-save to local storage, show session expiry countdown, provide "Save Draft" functionality, and enable session extension with activity detection.'
  },
  {
    issue: 'Progress lost after browser refresh',
    cause: 'No draft persistence, or draft not linked to user session',
    solution: 'Store draft responses in feedback_360_response_drafts table, link to user_id and request_id, and restore on next access with "Resume" prompt.'
  }
];

const diagnosticSteps: Step[] = [
  {
    title: 'Check Response Metrics',
    description: 'Review overall and per-category response rates.',
    substeps: [
      'Navigate to cycle dashboard → Response Monitoring',
      'Check completion percentage by rater category',
      'Identify categories below threshold',
      'Note time remaining vs expected completion'
    ],
    expectedResult: 'Clear view of which rater groups need intervention'
  },
  {
    title: 'Review Pending Requests',
    description: 'Analyze individual pending request statuses.',
    substeps: [
      'Export pending requests list',
      'Check feedback_360_requests.status for each',
      'Verify last_reminded_at timestamp',
      'Identify stuck or failed notifications'
    ],
    expectedResult: 'List of requests requiring manual intervention'
  },
  {
    title: 'Verify Notification Delivery',
    description: 'Check notification system logs for delivery issues.',
    substeps: [
      'Check notifications table for feedback_request events',
      'Verify delivery_status for each notification',
      'Check email bounce/complaint logs',
      'Review notification_preferences for affected users'
    ],
    expectedResult: 'Identification of notification failures'
  },
  {
    title: 'Trigger Recovery Actions',
    description: 'Execute remediation based on findings.',
    substeps: [
      'Resend failed notifications manually',
      'Update invalid email addresses',
      'Extend deadline if widespread issues',
      'Notify managers of low completion in their teams'
    ],
    expectedResult: 'Improved response rates within 48-72 hours'
  }
];

const databaseFields: FieldDefinition[] = [
  { name: 'feedback_360_requests.status', required: true, type: 'enum', description: 'Request status (pending, in_progress, completed, declined)' },
  { name: 'feedback_360_requests.due_date', required: true, type: 'timestamp', description: 'Response deadline' },
  { name: 'feedback_360_requests.last_reminded_at', required: false, type: 'timestamp', description: 'Last reminder timestamp' },
  { name: 'feedback_360_requests.reminder_count', required: false, type: 'integer', description: 'Number of reminders sent' },
  { name: 'feedback_360_responses.submitted_at', required: false, type: 'timestamp', description: 'Response submission timestamp' },
  { name: 'feedback_360_response_drafts.draft_data', required: false, type: 'jsonb', description: 'Auto-saved draft content' },
  { name: 'external_rater_tokens.is_valid', required: true, type: 'boolean', description: 'Token validity status' },
  { name: 'external_rater_tokens.expires_at', required: true, type: 'timestamp', description: 'Token expiration date' },
  { name: 'notification_preferences.feedback_requests', required: true, type: 'boolean', description: 'User notification preference' },
  { name: 'notifications.delivery_status', required: true, type: 'enum', description: 'Email delivery status' },
];

export function F360ResponseCollectionIssues() {
  return (
    <section id="sec-8-4" data-manual-anchor="sec-8-4" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          8.4 Response Collection Issues
        </h3>
        <p className="text-muted-foreground mt-2">
          Troubleshooting response rates, declined raters, external rater access, and submission problems.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Response Rate Benchmark</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Industry standard (SHRM/CCL) recommends minimum <strong>70% response rate</strong> for statistically valid 360 results.
          Below 50% may require cycle extension or result qualification.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Low Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-xs">High Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Below 50% completion requiring immediate intervention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Declined Raters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Rater declined but replacement not assigned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              External Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-xs">Medium Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              External raters unable to access forms
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Timeout Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xs">Low Priority</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Session or submission timeout failures
            </p>
          </CardContent>
        </Card>
      </div>

      <TroubleshootingSection
        items={lowResponseIssues}
        title="Low Response Rate Issues"
      />

      <TroubleshootingSection
        items={declinedRaterIssues}
        title="Declined Rater Scenarios"
      />

      <TroubleshootingSection
        items={externalRaterIssues}
        title="External Rater Access Problems"
      />

      <TroubleshootingSection
        items={timeoutIssues}
        title="Timeout & Session Issues"
      />

      <StepByStep
        steps={diagnosticSteps}
        title="Response Collection Diagnostic Procedure"
      />

      <FieldReferenceTable
        fields={databaseFields}
        title="Response Collection Database Fields"
      />
    </section>
  );
}

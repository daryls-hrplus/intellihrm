import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout, FutureCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Bell, Clock, Mail, Settings } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand the reminder configuration fields available in the database',
  'Send manual reminders through the monitoring dashboard',
  'Track reminder counts and delivery status',
  'Manage reminder fatigue and recipient preferences',
  'Know the roadmap for automated reminder processing'
];

const REMINDER_DIAGRAM = `
flowchart TD
    subgraph Config["Reminder Configuration"]
        A[Cycle Settings] --> B[Set reminder_days_before]
        B --> C[Default: 7, 3, 1 days]
    end
    
    subgraph Current["Current: Manual Reminders"]
        C --> D[HR Monitors Dashboard]
        D --> E[Identify Pending Raters]
        E --> F[Select Raters]
        F --> G[Click Send Reminder]
        G --> H[Email Sent via Edge Function]
    end
    
    subgraph Future["Future: Automated Reminders"]
        C -.->|Planned| I[Scheduled Job Checks Dates]
        I -.-> J{Today = Deadline - N days?}
        J -.->|Yes| K[Auto-Queue Reminders]
        J -.->|No| L[Skip]
    end
    
    subgraph Tracking["Tracking"]
        H --> M[Update last_reminder_sent]
        M --> N[Increment reminder_count]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style H fill:#10b981,stroke:#059669,color:#fff
    style I fill:#f1f5f9,stroke:#64748b,stroke-dasharray: 5 5
    style J fill:#f1f5f9,stroke:#64748b,stroke-dasharray: 5 5
    style K fill:#f1f5f9,stroke:#64748b,stroke-dasharray: 5 5
    style L fill:#f1f5f9,stroke:#64748b,stroke-dasharray: 5 5
`;

const REMINDER_TYPES = [
  { type: 'Cycle Activation', trigger: 'When cycle status changes to Active', recipients: 'All assigned raters', timing: 'Immediate' },
  { type: 'Nomination Open', trigger: 'When nomination window opens', recipients: 'Participants who can nominate', timing: 'Immediate' },
  { type: 'Nomination Deadline', trigger: 'reminder_days_before nomination end', recipients: 'Participants with incomplete nominations', timing: 'Scheduled' },
  { type: 'Feedback Deadline', trigger: 'reminder_days_before cycle end', recipients: 'Raters with pending requests', timing: 'Scheduled' },
  { type: 'Manager Approval', trigger: 'Daily during nomination window', recipients: 'Managers with pending approvals', timing: 'Daily batch' },
  { type: 'Manual Reminder', trigger: 'HR sends manually', recipients: 'Selected raters', timing: 'On demand' }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'reminder_days_before',
    required: true,
    type: 'integer[]',
    description: 'Days before deadline to send automated reminders',
    defaultValue: '[7, 3, 1]',
    validation: 'Array of positive integers, descending order'
  },
  {
    name: 'last_reminder_sent_at',
    required: false,
    type: 'timestamp',
    description: 'When last reminder was sent to this rater',
    defaultValue: 'null',
    validation: 'Per-request tracking'
  },
  {
    name: 'reminder_count',
    required: true,
    type: 'integer',
    description: 'Total reminders sent to this rater for this request',
    defaultValue: '0',
    validation: 'Incremented on each send'
  },
  {
    name: 'max_reminders',
    required: true,
    type: 'integer',
    description: 'Maximum reminders allowed per rater (system setting)',
    defaultValue: '5',
    validation: 'Configurable 3-10'
  },
  {
    name: 'reminder_opt_out',
    required: true,
    type: 'boolean',
    description: 'Whether rater has opted out of reminders',
    defaultValue: 'false',
    validation: 'Respects opt-out preference'
  }
];

const STEPS: Step[] = [
  {
    title: 'Configure Reminder Days (Optional)',
    description: 'Set the reminder_days_before array during cycle creation for future automated processing.',
    substeps: [
      'Open cycle configuration (Draft status)',
      'Navigate to "Notifications" section',
      'Set reminder_days_before values (default: 7, 3, 1)',
      'Note: These values are stored for future automation',
      'Save configuration'
    ],
    expectedResult: 'Reminder schedule configured in database for future use'
  },
  {
    title: 'Monitor Response Progress',
    description: 'Use the Response Monitoring dashboard to identify raters who need reminders.',
    substeps: [
      'Navigate to cycle → "Response Monitoring" tab',
      'Filter to show pending or in-progress requests',
      'Sort by days remaining to deadline',
      'Identify raters who have not responded',
      'Check how many reminders each rater has already received'
    ],
    expectedResult: 'Clear visibility of who needs a reminder'
  },
  {
    title: 'Send Manual Reminders',
    description: 'Use the monitoring dashboard to send targeted reminder emails.',
    substeps: [
      'Select specific raters using checkboxes',
      'Click "Send Reminder" button',
      'System calls send-360-activation-notifications edge function',
      'Optionally add custom message context',
      'Confirm send'
    ],
    expectedResult: 'Selected raters receive reminder email, counts updated'
  },
  {
    title: 'Track Reminder History',
    description: 'Review reminder counts to avoid over-messaging.',
    substeps: [
      'View reminder_count column in rater list',
      'Respect max reminder limits (recommended: 5 per rater)',
      'Consider escalation for persistent non-responders',
      'Document any exceptions in notes'
    ],
    expectedResult: 'Balanced reminder frequency without harassment'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Automated reminders not being sent',
    cause: 'Reminder rules may not be configured, or the cron job may not be running',
    solution: 'Check that reminder rules exist with event types 360_FEEDBACK_DUE or 360_SELF_REVIEW_DUE. Verify cron job schedule for process-reminders. Check edge function logs.'
  },
  {
    issue: 'Manual reminder button is disabled',
    cause: 'Rater may have already reached max reminder count, or cycle is not Active',
    solution: 'Check reminder_count for the rater. Verify cycle status is Active. For urgent cases, consider direct email outreach.'
  },
  {
    issue: 'Raters complaining about reminder emails',
    cause: 'May be receiving multiple manual reminders in short succession',
    solution: 'Check reminder_count and last_reminder_sent timestamps. Establish minimum days between reminders (recommended: 2-3 days).'
  },
  {
    issue: 'Reminder emails going to spam',
    cause: 'Email domain reputation or content flagging',
    solution: 'Work with IT to verify email domain settings. Review email content for spam trigger words. Consider sender reputation improvement.'
  },
];

export function WorkflowReminderManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.9</Badge>
          <Badge variant="secondary">~10 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Reminder Management
        </CardTitle>
        <CardDescription>
          Automated reminder schedules, manual bulk reminders, and tracking effectiveness
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Notifications']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Reminder Scheduling & Delivery Flow"
          description="Automated and manual reminder processes with tracking"
          diagram={REMINDER_DIAGRAM}
        />

        {/* Reminder Types */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Reminder Types
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Trigger</th>
                  <th className="text-left p-3 font-medium">Recipients</th>
                  <th className="text-left p-3 font-medium">Timing</th>
                </tr>
              </thead>
              <tbody>
                {REMINDER_TYPES.map((reminder, index) => (
                  <tr key={reminder.type} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{reminder.type}</td>
                    <td className="p-3 text-muted-foreground">{reminder.trigger}</td>
                    <td className="p-3">{reminder.recipients}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs">{reminder.timing}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Reminder Fatigue">
          Balance reminder frequency with effectiveness. Research shows diminishing returns after 3-4
          reminders. Focus on quality and timing rather than quantity.
        </TipCallout>

        <StepByStep steps={STEPS} title="Manual Reminder Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Reminder Configuration Fields" 
        />

        <TipCallout title="Automated Reminders Now Available">
          <p>
            The system now supports automated reminders for 360 feedback deadlines. Configure the 
            <code className="text-xs bg-muted px-1 rounded mx-1">reminder_days_before</code> array 
            during cycle setup, and reminders will be automatically sent at those intervals before the due date.
            Event types: <code className="text-xs bg-muted px-1 rounded mx-1">360_FEEDBACK_DUE</code> and 
            <code className="text-xs bg-muted px-1 rounded mx-1">360_SELF_REVIEW_DUE</code>.
          </p>
        </TipCallout>

        <WarningCallout title="Respect Opt-Out Preferences">
          Some jurisdictions require respecting email opt-out preferences. Always honor reminder_opt_out
          settings and provide alternative communication channels when needed.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

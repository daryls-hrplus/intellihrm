import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Bell, Clock, Mail, Settings } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Configure automated reminder schedules for 360 feedback cycles',
  'Understand reminder triggers and timing logic',
  'Send manual bulk reminders when needed',
  'Track reminder delivery and effectiveness',
  'Manage reminder fatigue and recipient preferences'
];

const REMINDER_DIAGRAM = `
flowchart TD
    subgraph Config["Reminder Configuration"]
        A[Cycle Settings] --> B[Set reminder_days_before]
        B --> C[Default: 7, 3, 1 days]
    end
    
    subgraph Schedule["Scheduled Reminders"]
        C --> D[Deadline - 7 days]
        D --> E{Pending Requests?}
        E -->|Yes| F[Queue Reminder Job]
        E -->|No| G[Skip - All Complete]
        
        F --> H[Send Reminder Emails]
        H --> I[Update last_reminder_sent]
        I --> J[Increment reminder_count]
    end
    
    subgraph Manual["Manual Reminders"]
        K[HR Selects Raters] --> L[Click Send Reminder]
        L --> M{Within Limit?}
        M -->|Yes| N[Send Reminder]
        M -->|No| O[Show Warning: Max Reached]
        N --> I
    end
    
    subgraph Tracking["Tracking & Analytics"]
        J --> P[Reminder Log]
        P --> Q[Open Rate Tracking]
        Q --> R[Conversion Analysis]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style H fill:#10b981,stroke:#059669,color:#fff
    style O fill:#f59e0b,stroke:#d97706
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
    title: 'Configure Automated Reminders',
    description: 'Set up the reminder schedule during cycle creation.',
    substeps: [
      'Open cycle configuration (Draft status)',
      'Navigate to "Notifications" section',
      'Set reminder_days_before values (default: 7, 3, 1)',
      'Optionally customize reminder email template',
      'Enable or disable each reminder type',
      'Save configuration'
    ],
    expectedResult: 'Automated reminders will trigger at specified intervals before deadline'
  },
  {
    title: 'Monitor Scheduled Reminders',
    description: 'Verify automated reminders are being sent.',
    substeps: [
      'Navigate to cycle → "Notifications" tab',
      'View scheduled reminder jobs',
      'Check execution history for past reminders',
      'Review delivery status (sent, failed, bounced)',
      'Verify open rates if tracking enabled'
    ],
    expectedResult: 'Visibility into automated reminder performance'
  },
  {
    title: 'Send Manual Reminders',
    description: 'Supplement automated reminders with targeted follow-ups.',
    substeps: [
      'Go to Response Monitoring dashboard',
      'Filter to show pending or in-progress requests',
      'Select specific raters using checkboxes',
      'Click "Send Reminder" button',
      'Optionally add custom message',
      'Confirm send'
    ],
    expectedResult: 'Selected raters receive reminder, counts updated'
  },
  {
    title: 'Handle Reminder Limits',
    description: 'Manage situations where max reminders is reached.',
    substeps: [
      'System prevents sending when reminder_count >= max_reminders',
      'Review raters at reminder limit',
      'Consider escalation to participant\'s manager',
      'If justified, admin can increase max_reminders setting',
      'Document exception in audit trail'
    ],
    expectedResult: 'Appropriate handling without harassment'
  },
  {
    title: 'Analyze Reminder Effectiveness',
    description: 'Use data to optimize future reminder strategies.',
    substeps: [
      'Review completion rates before/after each reminder wave',
      'Calculate conversion rate (reminders → submissions)',
      'Identify optimal reminder timing',
      'Note any patterns (day of week, time of day)',
      'Apply learnings to future cycle configuration'
    ],
    expectedResult: 'Data-driven insights for reminder optimization'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Automated reminders not being sent',
    cause: 'Scheduled job may have failed, or reminder_days_before not configured',
    solution: 'Check notification job logs. Verify reminder configuration in cycle settings. Ensure cycle is in Active or In Progress status.'
  },
  {
    issue: 'Raters complaining about too many reminders',
    cause: 'May be receiving both automated and manual reminders',
    solution: 'Check reminder_count for affected raters. Coordinate manual reminders with automated schedule. Consider reducing automated frequency.'
  },
  {
    issue: 'Reminder emails going to spam',
    cause: 'Email domain reputation or content flagging',
    solution: 'Work with IT to verify email domain settings. Review email content for spam trigger words. Consider sender reputation improvement.'
  },
  {
    issue: 'Cannot send reminder - "Opted out" message',
    cause: 'Rater has exercised opt-out preference',
    solution: 'Respect opt-out preference. If critical, escalate through manager or HR Partner for personal outreach instead.'
  }
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

        <StepByStep steps={STEPS} title="Reminder Management Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Reminder Configuration Fields" 
        />

        <WarningCallout title="Respect Opt-Out Preferences">
          Some jurisdictions require respecting email opt-out preferences. Always honor reminder_opt_out
          settings and provide alternative communication channels when needed.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

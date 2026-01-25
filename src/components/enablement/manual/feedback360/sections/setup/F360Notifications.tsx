import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { ConfigurationExample, ExampleConfig } from '@/components/enablement/manual/components/ConfigurationExample';
import { PrerequisiteAlert } from '@/components/enablement/manual/components/PrerequisiteAlert';
import { Callout, TipCallout, WarningCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Bell, 
  Mail, 
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

export function F360Notifications() {
  const eventTypeFields: FieldDefinition[] = [
    {
      name: 'code',
      required: true,
      type: 'Text',
      description: 'Unique event identifier (e.g., F360_CYCLE_LAUNCH)',
      defaultValue: '—',
      validation: 'Max 50 chars, uppercase with underscores',
    },
    {
      name: 'name',
      required: true,
      type: 'Text',
      description: 'Human-readable event name',
      defaultValue: '—',
      validation: 'Max 100 characters',
    },
    {
      name: 'category',
      required: true,
      type: 'Enum',
      description: 'Event category: performance_360',
      defaultValue: 'performance_360',
      validation: 'Must be performance_360 for 360 events',
    },
    {
      name: 'source_table',
      required: false,
      type: 'Text',
      description: 'Table that triggers the event',
      defaultValue: 'feedback_360_cycles',
      validation: 'Valid table name',
    },
    {
      name: 'date_field',
      required: false,
      type: 'Text',
      description: 'Date column used for reminder scheduling',
      defaultValue: 'response_deadline',
      validation: 'Must be timestamp/date column',
    },
    {
      name: 'is_system',
      required: true,
      type: 'Boolean',
      description: 'System-managed event type (read-only)',
      defaultValue: 'true for system events',
      validation: '—',
    },
    {
      name: 'is_active',
      required: true,
      type: 'Boolean',
      description: 'Whether event type is currently active',
      defaultValue: 'true',
      validation: '—',
    },
  ];

  const reminderRuleFields: FieldDefinition[] = [
    {
      name: 'event_type_id',
      required: true,
      type: 'UUID',
      description: 'Reference to reminder_event_types',
      defaultValue: '—',
      validation: 'Must exist in event types table',
    },
    {
      name: 'name',
      required: true,
      type: 'Text',
      description: 'Rule name for identification',
      defaultValue: '—',
      validation: 'Max 100 characters',
    },
    {
      name: 'days_before',
      required: true,
      type: 'Number',
      description: 'Days before event date to send reminder',
      defaultValue: '7',
      validation: 'Range: 0-90',
    },
    {
      name: 'reminder_intervals',
      required: false,
      type: 'Number[]',
      description: 'Additional reminder days (e.g., [3, 1])',
      defaultValue: '[]',
      validation: 'Array of positive integers',
    },
    {
      name: 'send_to_employee',
      required: true,
      type: 'Boolean',
      description: 'Send to the subject employee',
      defaultValue: 'true',
      validation: '—',
    },
    {
      name: 'send_to_manager',
      required: true,
      type: 'Boolean',
      description: 'Send to employee\'s manager',
      defaultValue: 'false',
      validation: '—',
    },
    {
      name: 'send_to_hr',
      required: true,
      type: 'Boolean',
      description: 'Send to HR representative',
      defaultValue: 'false',
      validation: '—',
    },
    {
      name: 'notification_method',
      required: true,
      type: 'Enum',
      description: 'in_app, email, or both',
      defaultValue: 'both',
      validation: '—',
    },
    {
      name: 'priority',
      required: true,
      type: 'Enum',
      description: 'low, medium, high, critical',
      defaultValue: 'medium',
      validation: '—',
    },
  ];

  const templateVariables = [
    { variable: '{{employee_name}}', description: 'Full name of the subject employee' },
    { variable: '{{cycle_name}}', description: 'Name of the 360 feedback cycle' },
    { variable: '{{deadline}}', description: 'Response deadline formatted date' },
    { variable: '{{days_remaining}}', description: 'Days until deadline' },
    { variable: '{{rater_name}}', description: 'Name of the rater (for rater-specific emails)' },
    { variable: '{{subject_name}}', description: 'Employee being rated' },
    { variable: '{{feedback_link}}', description: 'Direct link to feedback form' },
    { variable: '{{results_link}}', description: 'Direct link to view results' },
    { variable: '{{nomination_count}}', description: 'Number of pending nominations' },
    { variable: '{{completion_rate}}', description: 'Percentage of completed responses' },
    { variable: '{{manager_name}}', description: 'Name of direct manager' },
    { variable: '{{company_name}}', description: 'Organization name' },
  ];

  const notificationExamples: ExampleConfig[] = [
    {
      title: 'Rater Invitation Email',
      context: 'Sent when a rater is invited to provide feedback for an employee.',
      values: [
        { field: 'Event Type', value: 'F360_RATER_INVITATION' },
        { field: 'Subject', value: 'You\'ve been asked to provide 360 feedback for {{subject_name}}' },
        { field: 'Method', value: 'email' },
        { field: 'Priority', value: 'high' },
      ],
      outcome: 'Rater receives email with direct link to feedback form and deadline information.',
    },
    {
      title: 'Response Deadline Reminder',
      context: 'Multi-stage reminder for pending feedback responses.',
      values: [
        { field: 'Event Type', value: 'F360_RESPONSE_DEADLINE' },
        { field: 'days_before', value: '7' },
        { field: 'reminder_intervals', value: '[3, 1]' },
        { field: 'Method', value: 'both' },
        { field: 'Priority', value: 'medium → high → critical' },
      ],
      outcome: 'Raters receive 3 reminders: 7 days, 3 days, and 1 day before deadline. Priority escalates.',
    },
    {
      title: 'Results Available Notification',
      context: 'Notify employees when their 360 feedback results are released.',
      values: [
        { field: 'Event Type', value: 'F360_RESULTS_RELEASED' },
        { field: 'send_to_employee', value: 'true' },
        { field: 'send_to_manager', value: 'true' },
        { field: 'Method', value: 'both' },
        { field: 'Priority', value: 'high' },
      ],
      outcome: 'Employee and manager both notified with links to view the feedback report.',
    },
    {
      title: 'Manager Completion Summary',
      context: 'Daily digest for managers showing team response rates.',
      values: [
        { field: 'Event Type', value: 'F360_MANAGER_DIGEST' },
        { field: 'send_to_manager', value: 'true' },
        { field: 'Schedule', value: 'Daily at 9:00 AM (company timezone)' },
        { field: 'Method', value: 'email' },
      ],
      outcome: 'Managers receive daily summary of pending rater responses with nudge capabilities.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Bell className="h-5 w-5 text-primary" />
        2.0b Notifications & Reminders for 360 Feedback
      </h3>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Configure 360-specific notification event types and triggers',
          'Set up multi-stage reminder cadences for feedback collection',
          'Customize email templates with 360-specific variables',
          'Understand integration with the centralized Reminders module',
        ]}
      />

      {/* Prerequisites */}
      <PrerequisiteAlert
        items={[
          'Core Framework → Notifications tab accessed (Performance → Setup → Core Framework → Notifications)',
          'Email delivery configured in System Settings',
          'SMTP or email service integration active',
        ]}
      />

      {/* Navigation Path */}
      <Callout variant="info" title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Setup → Core Framework → Notifications
        </code>
        <span className="mx-2 text-muted-foreground">OR</span>
        <code className="text-xs bg-muted px-2 py-1 rounded">
          HR Hub → Reminders → Event Types → Filter: performance_360
        </code>
      </Callout>

      {/* 360 Event Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            360 Feedback Event Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { code: 'F360_CYCLE_LAUNCH', name: 'Cycle Activation', icon: Send, color: 'emerald' },
              { code: 'F360_NOMINATION_OPEN', name: 'Nominations Open', icon: Users, color: 'blue' },
              { code: 'F360_NOMINATION_DEADLINE', name: 'Nomination Deadline', icon: Clock, color: 'amber' },
              { code: 'F360_RATER_INVITATION', name: 'Rater Invitation', icon: Mail, color: 'violet' },
              { code: 'F360_RESPONSE_DEADLINE', name: 'Response Deadline', icon: AlertTriangle, color: 'rose' },
              { code: 'F360_SELF_REVIEW_REMINDER', name: 'Self-Review Reminder', icon: RefreshCw, color: 'cyan' },
              { code: 'F360_COLLECTION_COMPLETE', name: 'Collection Complete', icon: CheckCircle2, color: 'green' },
              { code: 'F360_RESULTS_RELEASED', name: 'Results Released', icon: MessageSquare, color: 'indigo' },
              { code: 'F360_MANAGER_DIGEST', name: 'Manager Daily Digest', icon: Users, color: 'slate' },
            ].map((event) => (
              <div key={event.code} className={`p-3 rounded-lg border bg-${event.color}-500/5`}>
                <div className="flex items-center gap-2 mb-1">
                  <event.icon className={`h-4 w-4 text-${event.color}-600`} />
                  <span className="font-medium text-sm">{event.name}</span>
                </div>
                <code className="text-xs text-muted-foreground">{event.code}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2">
                <code className="bg-primary/10 text-primary px-2 py-0.5 rounded">reminder_event_types</code>
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Defines all triggerable event types. Filter by <code>category = 'performance_360'</code> for 360-specific events.
              </p>
              <Badge variant="outline" className="text-xs">System-managed for core events</Badge>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2">
                <code className="bg-primary/10 text-primary px-2 py-0.5 rounded">reminder_rules</code>
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Company-specific rules defining when and how reminders are sent for each event type.
              </p>
              <Badge variant="outline" className="text-xs">Configurable per company</Badge>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2">
                <code className="bg-primary/10 text-primary px-2 py-0.5 rounded">employee_reminders</code>
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Individual reminder instances scheduled for specific employees and dates.
              </p>
              <Badge variant="outline" className="text-xs">Auto-generated from rules</Badge>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-semibold text-sm mb-2">
                <code className="bg-primary/10 text-primary px-2 py-0.5 rounded">reminder_delivery_log</code>
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Audit trail of all sent notifications with delivery status and timestamps.
              </p>
              <Badge variant="outline" className="text-xs">Audit & Debugging</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Reference - Event Types */}
      <FieldReferenceTable
        title="Event Type Configuration"
        fields={eventTypeFields}
      />

      {/* Field Reference - Reminder Rules */}
      <FieldReferenceTable
        title="Reminder Rule Configuration"
        fields={reminderRuleFields}
      />

      {/* Template Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Template Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-2">
            {templateVariables.map((item) => (
              <div key={item.variable} className="flex items-start gap-2 p-2 rounded border text-sm">
                <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono flex-shrink-0">
                  {item.variable}
                </code>
                <span className="text-muted-foreground text-xs">{item.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Configuring Response Deadline Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">1</span>
              <div>
                <p className="font-medium">Navigate to Notifications Configuration</p>
                <p className="text-sm text-muted-foreground">Performance → Setup → Core Framework → Notifications</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">2</span>
              <div>
                <p className="font-medium">Click "Add Reminder Rule"</p>
                <p className="text-sm text-muted-foreground">Opens the rule creation dialog</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">3</span>
              <div>
                <p className="font-medium">Select Event Type: "F360_RESPONSE_DEADLINE"</p>
                <p className="text-sm text-muted-foreground">Links rule to response deadline event</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">4</span>
              <div>
                <p className="font-medium">Configure Timing</p>
                <p className="text-sm text-muted-foreground">
                  Set <code>days_before = 7</code> for initial reminder.<br />
                  Add <code>reminder_intervals = [3, 1]</code> for follow-ups.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">5</span>
              <div>
                <p className="font-medium">Configure Recipients</p>
                <p className="text-sm text-muted-foreground">
                  Enable <code>send_to_employee</code> (the rater).<br />
                  Optionally enable <code>send_to_manager</code> for the rater's manager.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">6</span>
              <div>
                <p className="font-medium">Set Notification Method</p>
                <p className="text-sm text-muted-foreground">Choose "both" for in-app and email delivery</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">7</span>
              <div>
                <p className="font-medium">Configure Priority Escalation</p>
                <p className="text-sm text-muted-foreground">
                  Initial: medium → 3 days: high → 1 day: critical
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">8</span>
              <div>
                <p className="font-medium">Save and Activate</p>
                <p className="text-sm text-muted-foreground">Rule becomes active for current and future cycles</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <ConfigurationExample examples={notificationExamples} />

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <h4 className="font-semibold text-sm text-emerald-700 mb-2">Optimal Reminder Cadence</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Initial reminder: 7 days before deadline</li>
                <li>• Follow-up: 3 days before deadline</li>
                <li>• Final reminder: 1 day before deadline</li>
                <li>• Overdue notice: Day of deadline + 1</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-blue-500/5">
              <h4 className="font-semibold text-sm text-blue-700 mb-2">Manager Engagement</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Enable daily digest for managers during active cycles</li>
                <li>• Include team completion rates in digest</li>
                <li>• Provide "nudge" button for one-click reminders</li>
                <li>• Escalate to skip-level if &lt;50% completion at 3 days</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm">Emails not being sent?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Check reminder_delivery_log for error status</li>
                <li>• Verify SMTP configuration in System Settings</li>
                <li>• Confirm recipient has valid email address</li>
                <li>• Check employee_reminder_preferences for opt-outs</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm">Reminder scheduled but not appearing?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Verify reminder_rules.is_active = true</li>
                <li>• Check effective_from / effective_to dates</li>
                <li>• Confirm cycle dates are correctly set</li>
                <li>• Review employee_reminders table for scheduled records</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm">Duplicate reminders being sent?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Check for overlapping rules on same event type</li>
                <li>• Verify reminder_intervals don't conflict with days_before</li>
                <li>• Review reminder_delivery_log for duplicate entries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HR Hub Integration */}
      <InfoCallout title="HR Hub Integration">
        <p className="text-sm">
          All 360 notification rules are accessible from <strong>HR Hub → Reminders</strong>. 
          Filter by category "Performance: 360 Feedback" to see all rules. Changes made in either 
          location are synchronized.
        </p>
      </InfoCallout>

      {/* Cross-Reference */}
      <TipCallout title="Cross-Reference">
        For the centralized Reminders module architecture, see the HR Hub Manual → Reminders Chapter. 
        The same reminder engine powers notifications across all Performance modules.
      </TipCallout>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  Bell, 
  Settings, 
  ChevronRight, 
  Clock,
  CalendarClock,
  AlertTriangle,
  CheckCircle,
  Info,
  Mail,
  Send,
  RefreshCw
} from 'lucide-react';

export function TalentPoolNotifications() {
  const reminderEventFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'event_type', required: true, type: 'Text', description: 'Unique event type code', validation: 'Must match defined event codes' },
    { name: 'event_name', required: true, type: 'Text', description: 'Human-readable event name', validation: 'Required, max 100 chars' },
    { name: 'event_name_en', required: false, type: 'Text', description: 'English translation of event name', defaultValue: 'Same as event_name' },
    { name: 'description', required: false, type: 'Text', description: 'Detailed description of when this event triggers' },
    { name: 'category', required: true, type: 'Text', description: 'Event category for grouping', defaultValue: 'performance_succession', validation: 'performance_succession for talent pool events' },
    { name: 'source_table', required: false, type: 'Text', description: 'Database table that triggers this event', validation: 'Must be valid table name' },
    { name: 'date_field', required: false, type: 'Text', description: 'Column name for the date to track', validation: 'Must be valid column in source_table' },
    { name: 'is_active', required: true, type: 'Boolean', description: 'Whether event type is enabled', defaultValue: 'true' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const reminderRuleFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'event_type_id', required: true, type: 'UUID', description: 'Reference to reminder_event_types', validation: 'Must be valid event type' },
    { name: 'rule_name', required: true, type: 'Text', description: 'Human-readable rule name', validation: 'Required, max 100 chars' },
    { name: 'days_before', required: false, type: 'Integer', description: 'Days before event date to send reminder', validation: 'Positive integer, null for after' },
    { name: 'days_after', required: false, type: 'Integer', description: 'Days after event date to send reminder', validation: 'Positive integer, null for before' },
    { name: 'recipient_type', required: true, type: 'Text', description: 'Who receives the reminder', validation: 'employee, manager, hr, admin' },
    { name: 'email_template_id', required: false, type: 'UUID', description: 'Reference to email template', validation: 'Must be valid template if set' },
    { name: 'notification_type', required: true, type: 'Text', description: 'How to deliver notification', defaultValue: 'both', validation: 'email, in_app, both' },
    { name: 'is_active', required: true, type: 'Boolean', description: 'Whether rule is enabled', defaultValue: 'true' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' }
  ];

  const successionEventTypes = [
    { 
      code: 'SUCCESSION_UPDATED', 
      name: 'Succession Readiness Updated', 
      description: 'Triggered when a succession candidate\'s readiness assessment is updated',
      sourceTable: 'succession_candidates',
      dateField: 'readiness_assessed_at',
      recipients: 'HR Partner, Manager'
    },
    { 
      code: 'talent_review_reminder', 
      name: 'Talent Review Reminder', 
      description: 'Periodic reminder to conduct talent pool review cycles',
      sourceTable: 'talent_pools',
      dateField: 'created_at (plus review_frequency)',
      recipients: 'HR Partner'
    },
    { 
      code: 'successor_assessment_due', 
      name: 'Successor Assessment Due', 
      description: 'Reminder that a successor candidate is due for readiness assessment',
      sourceTable: 'succession_candidates',
      dateField: 'readiness_assessed_at (plus assessment_interval)',
      recipients: 'Manager, HR Partner'
    },
    { 
      code: 'development_plan_action', 
      name: 'Development Plan Action Required', 
      description: 'Reminder for pending development plan milestones or overdue items',
      sourceTable: 'succession_development_plans',
      dateField: 'target_date',
      recipients: 'Employee, Manager'
    }
  ];

  const configureReminderSteps: Step[] = [
    {
      title: 'Access HR Reminders Configuration',
      description: 'Navigate to the reminder management interface.',
      substeps: [
        'Go to HR Hub → Settings → Reminders & Notifications',
        'Or access via Admin → System → Reminder Configuration',
        'Select your company from the company filter'
      ],
      expectedResult: 'Reminder configuration page is displayed'
    },
    {
      title: 'Locate Succession Reminder Events',
      description: 'Find the talent pool and succession-related event types.',
      substeps: [
        'Filter events by category: "performance_succession"',
        'You will see 4 succession-specific event types',
        'Verify all required events are set to Active'
      ],
      expectedResult: 'Succession event types are listed and can be configured'
    },
    {
      title: 'Create Reminder Rule',
      description: 'Define when and how reminders are sent.',
      substeps: [
        'Click "Add Rule" next to the desired event type',
        'Set Days Before/After: e.g., 7 days before assessment due date',
        'Select Recipient Type: manager, hr, or employee',
        'Choose Notification Type: email, in-app, or both',
        'Optionally select an email template'
      ],
      notes: [
        'You can create multiple rules per event type for escalation',
        'Example: 7 days before → Manager, 3 days before → HR escalation'
      ],
      expectedResult: 'Reminder rule is created and active'
    },
    {
      title: 'Test Reminder Delivery',
      description: 'Verify the reminder system is working correctly.',
      substeps: [
        'Click "Send Test" on the created rule',
        'Enter a test recipient email address',
        'Check that the notification is received',
        'Review notification content for accuracy'
      ],
      expectedResult: 'Test notification is received with correct content'
    },
    {
      title: 'Monitor Reminder Logs',
      description: 'Track reminder delivery and troubleshoot issues.',
      substeps: [
        'Navigate to HR Hub → Reports → Reminder Logs',
        'Filter by event type or date range',
        'Review delivery status: sent, failed, pending',
        'Click on failed entries to see error details'
      ],
      expectedResult: 'You can monitor all reminder activity and identify issues'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Company-scoped events', enforcement: 'System', description: 'Each company has its own set of reminder event types and rules.' },
    { rule: 'Active flag required', enforcement: 'System', description: 'Only active event types and rules trigger reminders.' },
    { rule: 'Recipient validation', enforcement: 'System', description: 'System validates recipient exists and has email before sending.' },
    { rule: 'Rate limiting', enforcement: 'System', description: 'Maximum 3 reminders per user per event per day to prevent spam.' },
    { rule: 'Timezone handling', enforcement: 'System', description: 'Reminders are sent based on company timezone settings.' },
    { rule: 'Email template fallback', enforcement: 'System', description: 'If no template specified, system uses default template for event category.' }
  ];

  return (
    <section id="sec-5-9" data-manual-anchor="sec-5-9" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.9 Notifications & Reminders</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure automated notifications for talent pool and succession events
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Identify the 4 succession-specific reminder event types in the system',
          'Configure reminder rules with appropriate timing and recipients',
          'Understand the relationship between event types, rules, and templates',
          'Monitor reminder delivery and troubleshoot notification issues'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">HR Hub</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Settings</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Reminders & Notifications</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Succession Event Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Succession Reminder Event Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The system includes 4 pre-configured reminder event types for talent pool and succession 
            management. These events are categorized under <code className="text-xs bg-muted px-1 rounded">performance_succession</code>.
          </p>

          <div className="space-y-3">
            {successionEventTypes.map((event) => (
              <div key={event.code} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <h5 className="font-medium text-sm">{event.name}</h5>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">{event.code}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                <div className="grid gap-2 md:grid-cols-3 text-xs">
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="font-medium">Source Table:</span>
                    <p className="text-muted-foreground mt-0.5 font-mono">{event.sourceTable}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="font-medium">Date Field:</span>
                    <p className="text-muted-foreground mt-0.5 font-mono">{event.dateField}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="font-medium">Recipients:</span>
                    <p className="text-muted-foreground mt-0.5">{event.recipients}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference - Event Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            reminder_event_types Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={reminderEventFields} />
        </CardContent>
      </Card>

      {/* Field Reference - Reminder Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5 text-primary" />
            reminder_rules Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={reminderRuleFields} />
        </CardContent>
      </Card>

      {/* Notification Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Send className="h-5 w-5 text-primary" />
            Notification Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The reminder system processes events through a scheduled job that checks for matching 
            rules and sends notifications accordingly.
          </p>

          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {[
              { stage: 'Event Occurs', desc: 'Data changes in source table', icon: AlertTriangle },
              { stage: 'Rule Match', desc: 'System checks active rules', icon: Settings },
              { stage: 'Date Check', desc: 'Validates days_before/after', icon: CalendarClock },
              { stage: 'Send', desc: 'Email and/or in-app', icon: Mail },
              { stage: 'Log', desc: 'Record delivery status', icon: CheckCircle }
            ].map((item, index, arr) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-center">{item.stage}</span>
                  <span className="text-[10px] text-muted-foreground text-center mt-1">
                    {item.desc}
                  </span>
                </div>
                {index < arr.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Configure Talent Pool Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={configureReminderSteps} title="" />
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Notification Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Create escalation chains: first reminder to manager, follow-up to HR',
              'Use 7-3-1 day pattern for important deadlines (7 days, 3 days, 1 day)',
              'Customize email templates with specific action links',
              'Monitor delivery logs weekly to catch any failed notifications',
              'Coordinate reminder timing with other system notifications to avoid overload',
              'Use in-app notifications for low-priority updates, email for action-required items'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Industry Benchmark:</strong> Organizations with proactive reminder systems 
              for succession activities see 40% higher completion rates for readiness assessments 
              and development plan milestones (Gartner Talent Management Report 2024).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

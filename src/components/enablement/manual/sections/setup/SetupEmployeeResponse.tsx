import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, MessageSquare, Users } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Enable Employee Response', required: true, type: 'Boolean', description: 'Allow employees to respond to evaluations', defaultValue: 'true', validation: '—' },
  { name: 'Response Window (Days)', required: true, type: 'Number', description: 'Days employee has to submit response after receiving evaluation', defaultValue: '14', validation: 'Min 1, Max 90 days' },
  { name: 'Allow Response Edit', required: false, type: 'Boolean', description: 'Whether employees can edit submitted responses', defaultValue: 'true', validation: '—' },
  { name: 'Edit Window (Days)', required: false, type: 'Number', description: 'Days allowed for editing after submission', defaultValue: '7', validation: 'Must be less than Response Window' },
  { name: 'Require Acknowledgment', required: true, type: 'Boolean', description: 'Employee must acknowledge before responding', defaultValue: 'true', validation: '—' },
  { name: 'Acknowledgment Text', required: false, type: 'Text', description: 'Custom acknowledgment statement', defaultValue: 'Default text', validation: 'Max 500 characters' },
  { name: 'Response Visibility', required: true, type: 'Select', description: 'Who can view employee responses', defaultValue: 'Manager and HR', validation: '—' },
  { name: 'Allow Score Dispute', required: false, type: 'Boolean', description: 'Enable formal score dispute workflow', defaultValue: 'false', validation: '—' },
  { name: 'Dispute Escalation Level', required: false, type: 'Select', description: 'Who reviews disputed scores', defaultValue: 'HR Partner', validation: '—' },
  { name: 'Send Reminder Before Deadline', required: false, type: 'Boolean', description: 'Remind employees before response window closes', defaultValue: 'true', validation: '—' },
  { name: 'Reminder Days Before', required: false, type: 'Number', description: 'Days before deadline to send reminder', defaultValue: '3', validation: '1-7 days' },
];

const STEPS = [
  {
    title: 'Navigate to Employee Response Settings',
    description: 'Go to Performance → Setup → Appraisals → Employee Response',
    expectedResult: 'Employee Response configuration page displays'
  },
  {
    title: 'Enable Employee Response',
    description: 'Toggle the main setting to allow employee responses',
    expectedResult: 'Additional configuration options become visible'
  },
  {
    title: 'Configure Response Window',
    description: 'Set the timeframe for employee responses',
    substeps: [
      'Set number of days employees have to respond',
      'Consider company policy and typical review cycles',
      'Balance urgency with reasonable response time'
    ],
    expectedResult: 'Response window configured'
  },
  {
    title: 'Configure Acknowledgment',
    description: 'Set up required acknowledgment before response',
    substeps: [
      'Enable or disable acknowledgment requirement',
      'Customize acknowledgment text if needed',
      'Acknowledgment confirms employee has read the evaluation'
    ],
    expectedResult: 'Acknowledgment settings configured'
  },
  {
    title: 'Set Response Visibility',
    description: 'Define who can view employee responses',
    substeps: [
      'Manager only: Responses visible to direct manager',
      'Manager and HR: Responses visible to both',
      'Full visibility: Available to all review participants'
    ],
    expectedResult: 'Visibility permissions configured'
  },
  {
    title: 'Configure Score Dispute (Optional)',
    description: 'Enable formal dispute process if required',
    substeps: [
      'Toggle score dispute feature',
      'Select escalation level (HR Partner, Skip-Level, Committee)',
      'Configure dispute resolution workflow'
    ],
    expectedResult: 'Dispute process configured if enabled'
  },
  {
    title: 'Set Up Reminders',
    description: 'Configure deadline reminder notifications',
    substeps: [
      'Enable reminder notifications',
      'Set days before deadline for reminder',
      'Customize reminder message if needed'
    ],
    expectedResult: 'Reminder settings configured'
  },
  {
    title: 'Save Configuration',
    description: 'Save all employee response settings',
    expectedResult: 'Configuration saved successfully'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Response Configuration',
    context: 'Balanced approach with reasonable timeframes and visibility.',
    values: [
      { field: 'Response Window', value: '14 days' },
      { field: 'Allow Edit', value: 'Yes, for 7 days after submission' },
      { field: 'Require Acknowledgment', value: 'Yes' },
      { field: 'Visibility', value: 'Manager and HR' },
      { field: 'Score Dispute', value: 'Disabled' }
    ],
    outcome: 'Employees have two weeks to respond with ability to revise initially.'
  },
  {
    title: 'High-Governance Configuration',
    context: 'Strict configuration with formal dispute process.',
    values: [
      { field: 'Response Window', value: '7 days' },
      { field: 'Allow Edit', value: 'No' },
      { field: 'Require Acknowledgment', value: 'Yes with legal disclaimer' },
      { field: 'Visibility', value: 'Manager, HR, and Legal' },
      { field: 'Score Dispute', value: 'Enabled, escalates to Committee' }
    ],
    outcome: 'Formal process with legal acknowledgment and dispute escalation path.'
  },
  {
    title: 'Simplified Configuration',
    context: 'Minimal friction for quick acknowledgment.',
    values: [
      { field: 'Response Window', value: '21 days' },
      { field: 'Allow Edit', value: 'Yes, until cycle closes' },
      { field: 'Require Acknowledgment', value: 'No' },
      { field: 'Visibility', value: 'Manager only' },
      { field: 'Score Dispute', value: 'Disabled' }
    ],
    outcome: 'Low-friction response process prioritizing completion over formality.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Response window starts when manager shares evaluation', enforcement: 'System' as const, description: 'Countdown begins when employee receives the completed evaluation.' },
  { rule: 'Expired responses cannot be submitted', enforcement: 'System' as const, description: 'After window closes, employee can no longer submit or edit response.' },
  { rule: 'Acknowledgment required before response', enforcement: 'System' as const, description: 'If enabled, employee must acknowledge before entering response text.' },
  { rule: 'Disputed scores trigger escalation workflow', enforcement: 'System' as const, description: 'Score disputes automatically route to configured escalation level.' },
  { rule: 'Response visibility respects role hierarchy', enforcement: 'System' as const, description: 'Responses visible only to users with appropriate role-based access.' },
  { rule: 'Document response policy in employee handbook', enforcement: 'Policy' as const, description: 'Clear communication of response expectations and timelines.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Employee cannot submit response',
    cause: 'Response window has expired or acknowledgment not completed.',
    solution: 'Check if response deadline has passed. Verify employee has completed acknowledgment step. HR can extend deadline if needed.'
  },
  {
    issue: 'Response not visible to manager',
    cause: 'Visibility settings or employee has not submitted.',
    solution: 'Verify response visibility configuration. Check if employee actually submitted (vs. saved as draft).'
  },
  {
    issue: 'Score dispute not routing correctly',
    cause: 'Escalation level not configured or missing HR assignment.',
    solution: 'Verify escalation level is set. Ensure HR Partner or escalation contact is assigned to the employee.'
  },
  {
    issue: 'Reminder emails not being sent',
    cause: 'Reminder setting disabled or email delivery issue.',
    solution: 'Verify reminders are enabled and days-before setting is correct. Check email delivery logs.'
  }
];

export function SetupEmployeeResponse() {
  return (
    <Card id="sec-2-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.10</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Employee Response Configuration</CardTitle>
        <CardDescription>
          Configure how employees acknowledge and respond to their performance evaluations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Employee Response']} />

        <LearningObjectives
          objectives={[
            'Configure employee response windows and edit permissions',
            'Set up acknowledgment requirements',
            'Define response visibility and access',
            'Enable score dispute workflows when needed'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Appraisal cycles configured (Section 2.6)',
            'HR escalation contacts defined (Section 2.11)',
            'Notification templates ready'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Is Employee Response?</h4>
          <p className="text-muted-foreground">
            Employee Response settings control how employees interact with their completed 
            evaluations. This includes timeframes for acknowledging and responding to reviews, 
            whether responses can be edited, who can view responses, and whether formal score 
            disputes are enabled. A well-configured response process ensures employee voice 
            while maintaining process efficiency.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Employee Experience Tip</h4>
              <p className="text-sm text-foreground">
                A 14-day response window with edit capability provides good balance. Too short 
                creates pressure; too long delays cycle completion. Consider your organization's 
                culture and typical review volume.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.10.1: Employee Response configuration settings"
          alt="Employee Response settings page"
        />

        <StepByStep steps={STEPS} title="Configuring Employee Response: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

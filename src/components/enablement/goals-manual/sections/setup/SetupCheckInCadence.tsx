import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare } from 'lucide-react';
import { NavigationPath } from '@/components/enablement/manual/NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '@/components/enablement/manual/components';

const FIELD_DEFINITIONS = [
  { name: 'Cadence Name', required: true, type: 'Text', description: 'Display name for the check-in schedule', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Frequency', required: true, type: 'Select', description: 'How often check-ins occur', defaultValue: 'Monthly', validation: 'Weekly, Bi-weekly, Monthly, Quarterly' },
  { name: 'Due Day', required: true, type: 'Select', description: 'Day of period when check-in is due', defaultValue: 'Last Friday', validation: 'Day of week or month' },
  { name: 'Grace Period', required: false, type: 'Number', description: 'Days after due date before marked overdue', defaultValue: '3', validation: '0-14 days' },
  { name: 'Require Progress Update', required: true, type: 'Boolean', description: 'Must update progress percentage', defaultValue: 'true', validation: '—' },
  { name: 'Require Comments', required: true, type: 'Boolean', description: 'Must add written update', defaultValue: 'true', validation: '—' },
  { name: 'Min Comment Length', required: false, type: 'Number', description: 'Minimum characters for comments', defaultValue: '50', validation: '0-500 characters' },
  { name: 'Manager Review Required', required: false, type: 'Boolean', description: 'Manager must acknowledge check-in', defaultValue: 'false', validation: '—' },
  { name: 'Send Reminders', required: true, type: 'Boolean', description: 'Send automated reminder notifications', defaultValue: 'true', validation: '—' },
  { name: 'Reminder Days Before', required: false, type: 'Number', description: 'Days before due date to send reminder', defaultValue: '2', validation: '1-7 days' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether cadence is in effect', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Check-in Cadence',
    description: 'Go to Performance → Setup → Goals → Check-in Cadence',
    expectedResult: 'Check-in Cadence configuration page displays'
  },
  {
    title: 'Click "Add Cadence"',
    description: 'Click the primary action button to create a new check-in schedule',
    expectedResult: 'Cadence creation form opens'
  },
  {
    title: 'Define Frequency',
    description: 'Set how often employees must check in on goals',
    substeps: [
      'Select frequency (Weekly, Monthly, etc.)',
      'Choose the due day within the period',
      'Set grace period for late submissions'
    ],
    expectedResult: 'Check-in schedule established'
  },
  {
    title: 'Configure Requirements',
    description: 'Define what employees must provide in check-ins',
    substeps: [
      'Enable/disable progress update requirement',
      'Enable/disable comment requirement',
      'Set minimum comment length if applicable'
    ],
    expectedResult: 'Check-in content requirements configured'
  },
  {
    title: 'Set Manager Review (Optional)',
    description: 'Decide if managers must acknowledge check-ins',
    expectedResult: 'Review workflow configured'
  },
  {
    title: 'Configure Notifications',
    description: 'Set up reminder notifications',
    substeps: [
      'Enable automated reminders',
      'Set reminder lead time',
      'Configure overdue escalation if needed'
    ],
    expectedResult: 'Notification schedule established'
  },
  {
    title: 'Save and Activate',
    description: 'Save the cadence and apply to goal cycles',
    expectedResult: 'Check-in cadence active and reminders scheduled'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Monthly Goal Check-ins',
    context: 'Standard monthly progress updates for all employees.',
    values: [
      { field: 'Frequency', value: 'Monthly' },
      { field: 'Due Day', value: 'Last Friday of month' },
      { field: 'Grace Period', value: '3 days' },
      { field: 'Progress Update', value: 'Required' },
      { field: 'Comments', value: 'Required (min 50 chars)' },
      { field: 'Reminder', value: '3 days before' }
    ],
    outcome: 'Regular monthly touchpoints with documented progress.'
  },
  {
    title: 'Weekly OKR Updates',
    context: 'Frequent check-ins for fast-paced OKR environments.',
    values: [
      { field: 'Frequency', value: 'Weekly' },
      { field: 'Due Day', value: 'Friday' },
      { field: 'Grace Period', value: '1 day' },
      { field: 'Progress Update', value: 'Required' },
      { field: 'Comments', value: 'Optional' },
      { field: 'Manager Review', value: 'Not required' }
    ],
    outcome: 'Lightweight weekly pulse on key results progress.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Check-ins recorded with timestamp', enforcement: 'System' as const, description: 'All check-ins are dated and logged for audit purposes.' },
  { rule: 'Overdue check-ins flagged in dashboard', enforcement: 'System' as const, description: 'Missing check-ins visible to managers and HR.' },
  { rule: 'Progress percentage must match reality', enforcement: 'Policy' as const, description: 'Employees should provide accurate progress assessments.' },
  { rule: 'Manager review within 48 hours', enforcement: 'Policy' as const, description: 'If review required, managers should respond promptly.' },
  { rule: 'Check-ins inform appraisal discussions', enforcement: 'Advisory' as const, description: 'Use check-in history during performance conversations.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Employees not receiving check-in reminders',
    cause: 'Reminders disabled or employee notification preferences off.',
    solution: 'Verify cadence has reminders enabled. Check employee notification settings in profile.'
  },
  {
    issue: 'Check-in marked overdue immediately',
    cause: 'Grace period set to 0 or timezone mismatch.',
    solution: 'Increase grace period. Verify system timezone matches organizational timezone.'
  },
  {
    issue: 'Cannot submit check-in without comments',
    cause: 'Comment requirement enabled with minimum length.',
    solution: 'Employee must enter comments meeting minimum length. Or adjust cadence configuration.'
  }
];

export function SetupCheckInCadence() {
  return (
    <Card id="sec-2-9">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.9</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~8 min read
          </Badge>
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Per cycle
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Check-in Cadence
        </CardTitle>
        <CardDescription>
          Define how often employees update progress on their goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Goals', 'Check-in Cadence']} />

        <LearningObjectives
          objectives={[
            'Understand the value of regular goal check-ins',
            'Configure check-in frequency and due dates',
            'Set appropriate content requirements',
            'Configure reminder and escalation notifications'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Goal cycles configured (Section 2.6)',
            'Understanding of organizational cadence preferences',
            'Notification system configured'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">Why Check-ins Matter</h4>
          <p className="text-muted-foreground">
            Regular check-ins keep goals visible and actionable throughout the cycle. They create 
            a continuous dialogue between employees and managers, surface blockers early, and 
            provide documentation that enriches year-end appraisal discussions. Without check-ins, 
            goals are often forgotten until evaluation time.
          </p>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.9.1: Check-in Cadence configuration page"
          alt="Check-in Cadence setup"
        />

        <StepByStep steps={STEPS} title="Creating a Check-in Cadence: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

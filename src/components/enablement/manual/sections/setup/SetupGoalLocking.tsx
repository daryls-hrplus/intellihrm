import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, Lightbulb } from 'lucide-react';
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
  { name: 'Rule Name', required: true, type: 'Text', description: 'Display name for the locking rule', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Lock Trigger', required: true, type: 'Select', description: 'Event that triggers goal locking', defaultValue: 'Deadline', validation: 'Deadline, Approval, Manual, Cycle End' },
  { name: 'Lock Date', required: false, type: 'Date', description: 'Specific date when goals lock (if trigger is Deadline)', defaultValue: 'Goal setting deadline', validation: 'Must be within cycle' },
  { name: 'Days After Trigger', required: false, type: 'Number', description: 'Days after trigger event to lock', defaultValue: '0', validation: '0-30 days' },
  { name: 'Lock Scope', required: true, type: 'Select', description: 'What gets locked', defaultValue: 'All fields', validation: 'All fields, Objectives only, Weights only' },
  { name: 'Allow Manager Override', required: true, type: 'Boolean', description: 'Managers can unlock for modifications', defaultValue: 'true', validation: '—' },
  { name: 'Allow HR Override', required: true, type: 'Boolean', description: 'HR can unlock for modifications', defaultValue: 'true', validation: '—' },
  { name: 'Notification Before Lock', required: false, type: 'Number', description: 'Days before lock to send reminder', defaultValue: '3', validation: '1-14 days' },
  { name: 'Applies To', required: false, type: 'Multi-select', description: 'Which goal cycles use this rule', defaultValue: 'All cycles', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether rule is in effect', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Locking Rules',
    description: 'Go to Performance → Setup → Goals → Locking Rules',
    expectedResult: 'Locking Rules configuration page displays'
  },
  {
    title: 'Click "Add Locking Rule"',
    description: 'Click the primary action button to create a new rule',
    expectedResult: 'Locking Rule creation form opens'
  },
  {
    title: 'Enter Rule Details',
    description: 'Provide basic rule information',
    substeps: [
      'Name: Enter descriptive name (e.g., "Standard Goal Lock")',
      'Select the lock trigger type'
    ],
    expectedResult: 'Basic information captured'
  },
  {
    title: 'Configure Lock Timing',
    description: 'Define when goals become locked',
    substeps: [
      'Set specific lock date if using Deadline trigger',
      'Or configure days after trigger event',
      'Set notification lead time'
    ],
    expectedResult: 'Lock timing established'
  },
  {
    title: 'Define Lock Scope',
    description: 'Choose what fields become read-only',
    substeps: [
      'All fields: Complete freeze on goal content',
      'Objectives only: Weights remain editable',
      'Weights only: Content editable, weights frozen'
    ],
    expectedResult: 'Lock scope configured'
  },
  {
    title: 'Set Override Permissions',
    description: 'Define who can unlock goals if needed',
    substeps: [
      'Enable/disable manager override capability',
      'Enable/disable HR override capability',
      'Consider audit requirements'
    ],
    expectedResult: 'Override permissions established'
  },
  {
    title: 'Save and Apply',
    description: 'Save the rule and apply to cycles',
    expectedResult: 'Locking rule active for selected cycles'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Deadline-Based Lock',
    context: 'Goals lock automatically after the goal setting deadline.',
    values: [
      { field: 'Lock Trigger', value: 'Deadline' },
      { field: 'Days After Trigger', value: '0 (immediate)' },
      { field: 'Lock Scope', value: 'All fields' },
      { field: 'Manager Override', value: 'Enabled' },
      { field: 'Notification', value: '5 days before' }
    ],
    outcome: 'Goals lock when deadline passes; managers can request unlocks for late changes.'
  },
  {
    title: 'Approval-Based Lock',
    context: 'Goals lock only after manager approval, allowing flexibility.',
    values: [
      { field: 'Lock Trigger', value: 'Approval' },
      { field: 'Lock Scope', value: 'Objectives only' },
      { field: 'Manager Override', value: 'Enabled' },
      { field: 'HR Override', value: 'Enabled' }
    ],
    outcome: 'Goals remain editable until explicitly approved by manager.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Locked goals cannot be edited without override', enforcement: 'System' as const, description: 'Enforces goal integrity after lock date.' },
  { rule: 'Override actions are logged', enforcement: 'System' as const, description: 'All unlock/relock actions recorded in audit trail.' },
  { rule: 'Notifications sent before lock', enforcement: 'System' as const, description: 'System sends reminders based on configured lead time.' },
  { rule: 'Consider calibration impact', enforcement: 'Policy' as const, description: 'Ensure goals are locked before calibration sessions.' },
  { rule: 'Document override reasons', enforcement: 'Advisory' as const, description: 'Require justification when unlocking goals post-deadline.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Goals locked before deadline',
    cause: 'Multiple locking rules in effect or rule misconfigured.',
    solution: 'Review all active locking rules. Check for conflicting triggers or incorrect dates.'
  },
  {
    issue: 'Manager cannot unlock goals',
    cause: 'Manager override not enabled on the locking rule.',
    solution: 'Edit the locking rule to enable manager override. HR can unlock in the interim.'
  },
  {
    issue: 'Lock notification not sent',
    cause: 'Notification days set to 0 or employee email not configured.',
    solution: 'Verify notification lead time is set and employee has valid email in profile.'
  }
];

export function SetupGoalLocking() {
  return (
    <Card id="sec-2-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.8</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~8 min read
          </Badge>
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Per cycle
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lock className="h-6 w-6" />
          Goal Locking Rules
        </CardTitle>
        <CardDescription>
          Configure when and how goals become read-only to maintain evaluation integrity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Goals', 'Locking Rules']} />

        <LearningObjectives
          objectives={[
            'Understand the purpose of goal locking in performance management',
            'Configure locking triggers and timing',
            'Set appropriate override permissions',
            'Balance flexibility with evaluation integrity'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Goal cycles configured (Section 2.6)',
            'Understanding of goal approval workflow',
            'Decision on who can override locks'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">Why Lock Goals?</h4>
          <p className="text-muted-foreground">
            Goal locking prevents modifications after a specific point, ensuring that performance 
            evaluations are based on the original committed objectives. Without locking, employees 
            could retroactively modify goals to appear more favorable, undermining the integrity 
            of the evaluation process.
          </p>
        </div>

        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Best Practice</h4>
              <p className="text-sm text-muted-foreground">
                Lock goals before mid-cycle reviews and definitely before appraisal evaluations begin. 
                This ensures managers evaluate against the original commitments, not revised targets.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.8.1: Goal Locking Rules configuration page"
          alt="Goal Locking Rules setup"
        />

        <StepByStep steps={STEPS} title="Creating a Locking Rule: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

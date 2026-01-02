import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, AlertTriangle, Shield } from 'lucide-react';
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
  { name: 'Escalation Rule Name', required: true, type: 'Text', description: 'Descriptive name for the escalation rule', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Trigger Type', required: true, type: 'Select', description: 'When escalation fires (Missed Deadline, Score Dispute, Rating Gap)', defaultValue: '—', validation: '—' },
  { name: 'Days Past Deadline', required: false, type: 'Number', description: 'Days after deadline before escalation', defaultValue: '7', validation: 'Min 1 day' },
  { name: 'Rating Gap Threshold', required: false, type: 'Number', description: 'Point difference between self and manager ratings', defaultValue: '2.0', validation: 'Within rating scale range' },
  { name: 'Escalation Level 1', required: true, type: 'Select', description: 'First escalation contact', defaultValue: 'HRBP', validation: '—' },
  { name: 'Level 1 Wait (Days)', required: true, type: 'Number', description: 'Days before escalating to Level 2', defaultValue: '3', validation: 'Min 1 day' },
  { name: 'Escalation Level 2', required: false, type: 'Select', description: 'Second escalation contact', defaultValue: 'HR Manager', validation: '—' },
  { name: 'Level 2 Wait (Days)', required: false, type: 'Number', description: 'Days before escalating to Level 3', defaultValue: '5', validation: 'Min 1 day' },
  { name: 'Escalation Level 3', required: false, type: 'Select', description: 'Final escalation contact', defaultValue: 'HR Director', validation: '—' },
  { name: 'Include Skip-Level Manager', required: false, type: 'Boolean', description: 'Also notify skip-level manager', defaultValue: 'false', validation: '—' },
  { name: 'Auto-Complete Option', required: false, type: 'Boolean', description: 'Allow auto-completion after max escalation', defaultValue: 'false', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether escalation rule is active', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to HR Escalations',
    description: 'Go to Performance → Setup → Appraisals → HR Escalations',
    expectedResult: 'HR Escalations configuration page displays'
  },
  {
    title: 'Click "Create Escalation Rule"',
    description: 'Start creating a new escalation rule',
    expectedResult: 'Escalation rule form opens'
  },
  {
    title: 'Define Trigger Condition',
    description: 'Specify when the escalation should fire',
    substeps: [
      'Missed Deadline: Evaluation not submitted by due date',
      'Score Dispute: Employee formally disputes their score',
      'Rating Gap: Significant difference between self and manager rating',
      'Calibration Required: Score outside acceptable range'
    ],
    expectedResult: 'Trigger type selected and configured'
  },
  {
    title: 'Configure Escalation Levels',
    description: 'Set up the escalation chain',
    substeps: [
      'Level 1: First contact (typically HRBP or HR Partner)',
      'Set wait period before Level 2 escalation',
      'Level 2: Second contact (typically HR Manager)',
      'Level 3: Final escalation (HR Director or VP)'
    ],
    expectedResult: 'Escalation chain defined'
  },
  {
    title: 'Set Notification Preferences',
    description: 'Configure who else is notified',
    substeps: [
      'Include skip-level manager notification if appropriate',
      'Configure notification message templates',
      'Set escalation email frequency'
    ],
    expectedResult: 'Notification settings configured'
  },
  {
    title: 'Configure Auto-Complete (Optional)',
    description: 'Set up automatic completion if needed',
    substeps: [
      'Enable if unresponsive managers should not block cycle',
      'Set to mark as "Completed - No Response"',
      'Requires HR Director approval typically'
    ],
    expectedResult: 'Auto-complete configured if enabled'
  },
  {
    title: 'Save and Activate',
    description: 'Save the escalation rule',
    expectedResult: 'Rule saved and active'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Missed Deadline Escalation',
    context: 'Escalate when managers miss evaluation deadline.',
    values: [
      { field: 'Trigger', value: 'Missed Deadline' },
      { field: 'Days Past Deadline', value: '3 days' },
      { field: 'Level 1', value: 'HRBP (wait 3 days)' },
      { field: 'Level 2', value: 'HR Manager (wait 5 days)' },
      { field: 'Level 3', value: 'HR Director' }
    ],
    outcome: 'Three-tier escalation ensures timely completion while providing intervention opportunities.'
  },
  {
    title: 'Score Dispute Escalation',
    context: 'Handle formal employee score disputes.',
    values: [
      { field: 'Trigger', value: 'Score Dispute Filed' },
      { field: 'Level 1', value: 'HRBP (immediate)' },
      { field: 'Level 2', value: 'HR Manager (after 5 days unresolved)' },
      { field: 'Include Skip-Level', value: 'Yes' }
    ],
    outcome: 'Disputes receive immediate HR attention with manager visibility.'
  },
  {
    title: 'Rating Gap Alert',
    context: 'Flag significant self vs. manager rating discrepancies.',
    values: [
      { field: 'Trigger', value: 'Rating Gap > 2.0 points' },
      { field: 'Level 1', value: 'HRBP (immediate)' },
      { field: 'Action', value: 'Schedule calibration discussion' }
    ],
    outcome: 'Large perception gaps identified early for constructive dialogue.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Escalations trigger based on business days', enforcement: 'System' as const, description: 'Weekend and holidays are excluded from wait period calculations.' },
  { rule: 'Each level must have longer wait than previous', enforcement: 'System' as const, description: 'Level 2 wait must exceed Level 1; Level 3 must exceed Level 2.' },
  { rule: 'Auto-complete requires HR Director approval', enforcement: 'System' as const, description: 'Automatic completion of unresponsive evaluations requires senior HR sign-off.' },
  { rule: 'Escalation notifications are not suppressible', enforcement: 'System' as const, description: 'Escalation emails cannot be turned off by recipients to ensure accountability.' },
  { rule: 'Document all escalation resolutions', enforcement: 'Policy' as const, description: 'HR should document how each escalation was resolved for audit purposes.' },
  { rule: 'Review escalation patterns quarterly', enforcement: 'Advisory' as const, description: 'Analyze escalation data to identify systematic issues with managers or departments.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Escalation not firing after deadline',
    cause: 'Rule inactive or days-past-deadline not elapsed.',
    solution: 'Verify rule is active and sufficient time has passed since deadline. Check if weekends/holidays are delaying trigger.'
  },
  {
    issue: 'Wrong person receiving escalation',
    cause: 'HRBP assignment incorrect for the employee.',
    solution: 'Verify employee has correct HRBP assigned in their profile. Check HR assignment rules in workforce configuration.'
  },
  {
    issue: 'Escalation emails going to spam',
    cause: 'Email delivery configuration issue.',
    solution: 'Work with IT to whitelist HR system emails. Check spam filters for escalation notifications.'
  },
  {
    issue: 'Multiple escalations for same issue',
    cause: 'Overlapping escalation rules or rule re-triggering.',
    solution: 'Review all active escalation rules for overlap. Verify rule triggers only once per instance.'
  }
];

export function SetupHREscalations() {
  return (
    <Card id="sec-2-11">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.11</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge variant="destructive">Required</Badge>
        </div>
        <CardTitle className="text-2xl">HR Escalation Settings</CardTitle>
        <CardDescription>
          Configure escalation rules for missed deadlines, score disputes, and rating discrepancies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'HR Escalations']} />

        <LearningObjectives
          objectives={[
            'Create escalation rules for missed evaluation deadlines',
            'Configure multi-level escalation chains',
            'Set up score dispute handling workflows',
            'Enable rating gap alerts for calibration'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'HRBP assignments configured in workforce module',
            'HR organizational hierarchy defined',
            'Notification templates configured'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are HR Escalations?</h4>
          <p className="text-muted-foreground">
            HR Escalation settings define how the system handles exceptions during the appraisal 
            process—missed deadlines, formal score disputes, and significant rating gaps. 
            Well-configured escalations ensure timely cycle completion while providing appropriate 
            intervention points for HR to address issues before they impact employees or delay 
            downstream processes like compensation reviews.
          </p>
        </div>

        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Escalation Best Practice</h4>
              <p className="text-sm text-muted-foreground">
                Start with conservative escalation timelines and adjust based on organizational 
                culture. Too aggressive escalation creates friction; too lenient allows deadlines 
                to slip. Monitor escalation metrics to fine-tune timing.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.11.1: HR Escalation rules configuration"
          alt="HR Escalations settings page"
        />

        <StepByStep steps={STEPS} title="Creating an Escalation Rule: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

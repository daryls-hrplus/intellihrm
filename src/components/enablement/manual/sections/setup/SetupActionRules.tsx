import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Zap, AlertTriangle } from 'lucide-react';
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
  { name: 'Rule Name', required: true, type: 'Text', description: 'Descriptive name for the action rule', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Rule Code', required: true, type: 'Text', description: 'Unique identifier for the rule', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Trigger Condition', required: true, type: 'Select', description: 'When the rule fires (e.g., Score Below Threshold)', defaultValue: '—', validation: '—' },
  { name: 'Score Threshold', required: false, type: 'Number', description: 'Score value that triggers the rule', defaultValue: '—', validation: 'Within rating scale range' },
  { name: 'Performance Category', required: false, type: 'Select', description: 'Category that triggers the rule', defaultValue: '—', validation: '—' },
  { name: 'Action Type', required: true, type: 'Select', description: 'What action to take (Initiate PIP, Create IDP, Nominate for Succession)', defaultValue: '—', validation: '—' },
  { name: 'Auto-Execute', required: false, type: 'Boolean', description: 'Execute immediately vs queue for approval', defaultValue: 'false', validation: '—' },
  { name: 'Notification Recipients', required: false, type: 'Multi-select', description: 'Who receives notifications (Manager, HR, Employee)', defaultValue: 'Manager, HR', validation: '—' },
  { name: 'Priority', required: true, type: 'Number', description: 'Rule execution priority (lower = higher priority)', defaultValue: '100', validation: '1-999' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether rule is currently active', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Action Rules',
    description: 'Go to Performance → Setup → Appraisals → Action Rules',
    expectedResult: 'Action Rules page displays with existing rules'
  },
  {
    title: 'Click "Create Rule"',
    description: 'Start creating a new outcome-based action rule',
    expectedResult: 'Rule creation form opens'
  },
  {
    title: 'Define Rule Trigger',
    description: 'Configure when this rule should fire',
    substeps: [
      'Select trigger type: Score-based, Category-based, or Rating Change',
      'For score-based: Enter threshold value and comparison (below, above, equals)',
      'For category-based: Select the performance category',
      'Optionally limit to specific appraisal cycles or employee populations'
    ],
    expectedResult: 'Trigger condition configured'
  },
  {
    title: 'Configure Action',
    description: 'Specify what happens when the rule triggers',
    substeps: [
      'Select action type: Initiate PIP, Create IDP, Succession Nomination, Custom Workflow',
      'Configure action-specific parameters',
      'Set whether action auto-executes or requires approval'
    ],
    expectedResult: 'Action configured with appropriate parameters'
  },
  {
    title: 'Set Notifications',
    description: 'Configure who gets notified when the rule fires',
    substeps: [
      'Select notification recipients: Manager, HR Partner, Skip-Level, Employee',
      'Customize notification message template if needed',
      'Set notification timing (immediate, batched daily)'
    ],
    expectedResult: 'Notification settings configured'
  },
  {
    title: 'Set Priority and Status',
    description: 'Configure rule priority and activate',
    substeps: [
      'Assign priority number (lower = executed first)',
      'Enable the rule for immediate effect'
    ],
    expectedResult: 'Rule ready for activation'
  },
  {
    title: 'Save and Test',
    description: 'Save the rule and verify with test case',
    substeps: [
      'Save the rule configuration',
      'Use simulation feature to test against sample data'
    ],
    expectedResult: 'Rule saved and validated'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Low Performer PIP Trigger',
    context: 'Automatically initiate PIP when score falls below threshold.',
    values: [
      { field: 'Trigger', value: 'Overall Score < 2.0' },
      { field: 'Action', value: 'Initiate PIP' },
      { field: 'Auto-Execute', value: 'No (requires HR approval)' },
      { field: 'Notify', value: 'Manager, HR Partner, HRBP' }
    ],
    outcome: 'PIP workflow initiated with HR review before employee notification.'
  },
  {
    title: 'High Performer Succession Flag',
    context: 'Flag high performers for succession pipeline review.',
    values: [
      { field: 'Trigger', value: 'Performance Category = "High Performer"' },
      { field: 'Action', value: 'Create Succession Nomination' },
      { field: 'Auto-Execute', value: 'Yes' },
      { field: 'Notify', value: 'Manager, Talent Team' }
    ],
    outcome: 'Top performers automatically flagged for talent review.'
  },
  {
    title: 'Development Plan for Mid-Range',
    context: 'Create development plans for employees with growth potential.',
    values: [
      { field: 'Trigger', value: 'Overall Score between 2.5 and 3.5' },
      { field: 'Action', value: 'Create IDP' },
      { field: 'Auto-Execute', value: 'Yes' },
      { field: 'Notify', value: 'Manager, Employee' }
    ],
    outcome: 'Development planning initiated for solid performers with room to grow.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Rules execute in priority order', enforcement: 'System' as const, description: 'Lower priority numbers execute first. If multiple rules match, all execute in order.' },
  { rule: 'Auto-execute requires explicit configuration', enforcement: 'System' as const, description: 'By default, triggered actions queue for HR approval before execution.' },
  { rule: 'Employee notification delayed for sensitive actions', enforcement: 'System' as const, description: 'PIP initiations notify manager/HR first; employee notification follows approval.' },
  { rule: 'PIP actions require HR approval', enforcement: 'Policy' as const, description: 'Performance Improvement Plans should never auto-execute without HR review.' },
  { rule: 'Test rules before activation', enforcement: 'Advisory' as const, description: 'Use simulation feature to verify rule behavior before enabling in production.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Rule not firing when expected',
    cause: 'Trigger condition not matching or rule inactive.',
    solution: 'Verify rule is active and trigger condition matches the scenario. Check if score falls within the correct range. Use simulation to test.'
  },
  {
    issue: 'Multiple PIPs created for same employee',
    cause: 'Rule firing on every appraisal update.',
    solution: 'Add condition to check if active PIP already exists. Configure rule to fire only on final submission.'
  },
  {
    issue: 'Notifications not being sent',
    cause: 'Email configuration issue or recipient not specified.',
    solution: 'Verify notification recipients are configured. Check email delivery settings in system administration.'
  },
  {
    issue: 'Action executed but no record created',
    cause: 'Downstream system integration issue.',
    solution: 'Check PIP/IDP/Succession module configuration. Verify integration between performance and talent modules.'
  }
];

export function SetupActionRules() {
  return (
    <Card id="sec-2-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.8</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Action Rules Configuration</CardTitle>
        <CardDescription>
          Automate downstream actions based on appraisal outcomes like PIP initiation or succession nomination
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Action Rules']} />

        <LearningObjectives
          objectives={[
            'Create rules that trigger actions based on appraisal outcomes',
            'Configure PIP initiation for underperformers',
            'Set up succession nomination for high performers',
            'Manage approval workflows for automated actions'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Performance categories configured (Section 2.7)',
            'PIP module enabled (if using PIP actions)',
            'Succession module enabled (if using succession actions)',
            'Notification templates configured'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Action Rules?</h4>
          <p className="text-muted-foreground">
            Action rules automate follow-up actions based on appraisal outcomes. When an employee's 
            evaluation meets specified criteria (e.g., score below threshold), the system can 
            automatically initiate workflows like Performance Improvement Plans, Individual 
            Development Plans, or Succession nominations—reducing manual intervention and ensuring 
            consistent policy application.
          </p>
        </div>

        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Important Consideration</h4>
              <p className="text-sm text-muted-foreground">
                Exercise caution with auto-execute rules, especially for PIPs. HR review before 
                employee notification is strongly recommended to ensure fair treatment and proper 
                documentation.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.8.1: Action Rules list with trigger conditions and action types"
          alt="Action Rules management page"
        />

        <StepByStep steps={STEPS} title="Creating an Action Rule: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.8.2: Rule creation form with trigger and action configuration"
          alt="Create Action Rule dialog"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

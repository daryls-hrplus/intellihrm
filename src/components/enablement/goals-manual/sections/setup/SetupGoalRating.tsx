import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calculator, Lightbulb } from 'lucide-react';
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
  { name: 'Configuration Name', required: true, type: 'Text', description: 'Display name for the rating configuration', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Calculation Method', required: true, type: 'Select', description: 'How goal ratings are calculated', defaultValue: 'Weighted Average', validation: 'Auto, Manual, Weighted Average, Manager Only' },
  { name: 'Self Rating Weight', required: false, type: 'Percentage', description: 'Weight of employee self-rating in calculation', defaultValue: '0%', validation: '0-50%' },
  { name: 'Manager Rating Weight', required: false, type: 'Percentage', description: 'Weight of manager rating in calculation', defaultValue: '100%', validation: '50-100%' },
  { name: 'Progress Weight', required: false, type: 'Percentage', description: 'Weight of auto-calculated progress score', defaultValue: '0%', validation: '0-50%' },
  { name: 'Allow Self Rating', required: true, type: 'Boolean', description: 'Whether employees can rate their own goals', defaultValue: 'true', validation: '—' },
  { name: 'Self Rating Required', required: false, type: 'Boolean', description: 'Self rating must be provided before manager', defaultValue: 'false', validation: '—' },
  { name: 'Rating Scale', required: true, type: 'Reference', description: 'Which rating scale to use for goals', defaultValue: 'Default component scale', validation: 'Active rating scale' },
  { name: 'Show Progress Score', required: false, type: 'Boolean', description: 'Display auto-calculated score to evaluators', defaultValue: 'true', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether configuration is in effect', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Goal Rating Configuration',
    description: 'Go to Performance → Setup → Goals → Rating Config',
    expectedResult: 'Goal Rating Configuration page displays'
  },
  {
    title: 'Click "Add Configuration"',
    description: 'Click the primary action button to create a new rating configuration',
    expectedResult: 'Configuration form opens'
  },
  {
    title: 'Select Calculation Method',
    description: 'Choose how goal ratings will be determined',
    substeps: [
      'Auto: Based solely on progress percentage',
      'Manual: Manager enters rating without calculation',
      'Weighted Average: Combines self, manager, and progress',
      'Manager Only: Manager rating is the final score'
    ],
    expectedResult: 'Calculation method selected, relevant fields appear'
  },
  {
    title: 'Configure Weights (if applicable)',
    description: 'Set the weight distribution for each input',
    substeps: [
      'Allocate percentage to self rating',
      'Allocate percentage to manager rating',
      'Allocate percentage to progress score',
      'Ensure weights total 100%'
    ],
    expectedResult: 'Weight distribution configured'
  },
  {
    title: 'Set Self Rating Options',
    description: 'Configure employee self-assessment behavior',
    substeps: [
      'Enable/disable self rating capability',
      'Require self rating before manager can rate',
      'Decide if self rating influences final score'
    ],
    expectedResult: 'Self rating workflow configured'
  },
  {
    title: 'Link Rating Scale',
    description: 'Select the rating scale for goal assessments',
    expectedResult: 'Rating scale linked to configuration'
  },
  {
    title: 'Save Configuration',
    description: 'Save and apply to goal cycles',
    expectedResult: 'Configuration active for selected cycles'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Manager-Only Rating',
    context: 'Traditional approach where manager assessment is the sole determinant.',
    values: [
      { field: 'Method', value: 'Manager Only' },
      { field: 'Manager Weight', value: '100%' },
      { field: 'Self Rating', value: 'Allowed (informational only)' },
      { field: 'Progress Display', value: 'Shown to manager' }
    ],
    outcome: 'Manager has full authority on goal ratings with visibility into progress.'
  },
  {
    title: 'Balanced Input Model',
    context: 'Combines multiple perspectives for more balanced assessment.',
    values: [
      { field: 'Method', value: 'Weighted Average' },
      { field: 'Self Rating Weight', value: '20%' },
      { field: 'Manager Weight', value: '60%' },
      { field: 'Progress Weight', value: '20%' },
      { field: 'Self Rating Required', value: 'Yes' }
    ],
    outcome: 'Final rating incorporates employee perspective and objective progress.'
  },
  {
    title: 'Auto-Calculated Goals',
    context: 'For quantitative goals where progress directly determines rating.',
    values: [
      { field: 'Method', value: 'Auto' },
      { field: 'Progress Weight', value: '100%' },
      { field: 'Manager Override', value: 'Allowed with justification' }
    ],
    outcome: 'Objective rating based on measurable progress with manager discretion.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Weights must total 100%', enforcement: 'System' as const, description: 'System validates weight distribution before saving.' },
  { rule: 'Self rating before manager (if required)', enforcement: 'System' as const, description: 'Manager cannot rate until employee completes self-rating.' },
  { rule: 'Progress score calculated from check-ins', enforcement: 'System' as const, description: 'Auto-calculation uses latest progress percentage from goal tracking.' },
  { rule: 'Manager can override calculated score', enforcement: 'Policy' as const, description: 'Managers may adjust auto-calculated scores with justification.' },
  { rule: 'Explain rating methodology to employees', enforcement: 'Advisory' as const, description: 'Transparency about calculation helps acceptance of final ratings.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Goal rating shows 0 even with progress',
    cause: 'Auto-calculation not enabled or progress weight set to 0.',
    solution: 'Review configuration method and weights. Ensure progress weight > 0 for auto-calculation.'
  },
  {
    issue: 'Manager cannot rate goals',
    cause: 'Self rating required but not completed by employee.',
    solution: 'Employee must complete self-rating first. HR can bypass in exceptional cases.'
  },
  {
    issue: 'Final score not matching expectations',
    cause: 'Weight distribution not understood or decimal rounding.',
    solution: 'Review weight percentages and explain calculation to stakeholders.'
  }
];

export function SetupGoalRating() {
  return (
    <Card id="sec-2-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.10</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Annual review
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Goal Rating Configuration
        </CardTitle>
        <CardDescription>
          Define how goal ratings are calculated from self, manager, and progress inputs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Goals', 'Rating Config']} />

        <LearningObjectives
          objectives={[
            'Understand different goal rating calculation methods',
            'Configure weight distribution for rating inputs',
            'Set up self-rating workflows and requirements',
            'Balance objective data with manager judgment'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Rating scales configured (Section 2.2)',
            'Goal cycles established (Section 2.6)',
            'Check-in cadence set up for progress tracking (Section 2.9)'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Is Goal Rating Configuration?</h4>
          <p className="text-muted-foreground">
            Goal rating configuration determines how individual goal ratings are calculated during 
            appraisals. Organizations can choose from pure manager discretion, auto-calculation 
            based on progress, or weighted combinations that incorporate employee self-assessment. 
            The right configuration balances objectivity with managerial judgment.
          </p>
        </div>

        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Method Selection Guidance</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Auto:</strong> Best for quantitative goals with clear metrics.
                <strong> Weighted:</strong> Balances multiple perspectives, reduces bias.
                <strong> Manager Only:</strong> Traditional approach, relies on manager judgment.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.10.1: Goal Rating Configuration with weight distribution"
          alt="Goal Rating Configuration page"
        />

        <StepByStep steps={STEPS} title="Creating a Rating Configuration: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

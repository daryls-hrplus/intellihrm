import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, CheckCircle, Scale, Users } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert,
  TipCallout,
  WarningCallout
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Include Values Assessment', required: false, type: 'Boolean', description: 'Enable values scoring in appraisal forms', defaultValue: 'false', validation: '—' },
  { name: 'Values Weight', required: true, type: 'Number', description: 'Weight of values in CRGV calculation (typically 10-20%)', defaultValue: '0', validation: '0-100%' },
  { name: 'Values Rating Scale', required: true, type: 'Select', description: 'Rating scale used for values assessment', defaultValue: 'Default (1-5)', validation: '—' },
  { name: 'Behavioral Indicators', required: false, type: 'Text[]', description: 'Observable behaviors for each value level', defaultValue: '—', validation: 'Per value' },
  { name: 'Self-Assessment Enabled', required: false, type: 'Boolean', description: 'Allow employees to self-rate on values', defaultValue: 'true', validation: '—' },
  { name: 'Manager Assessment Required', required: true, type: 'Boolean', description: 'Require manager to rate employee on values', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Define Company Values in HR Hub',
    description: 'Navigate to HR Hub → Company Settings → Values to define organizational values',
    substeps: [
      'Create each core value with name and description',
      'Add behavioral indicators for each proficiency level (1-5)',
      'Assign values to job families or make them universal'
    ],
    expectedResult: 'Company values library populated with behavioral indicators'
  },
  {
    title: 'Enable Values Assessment in Cycle Settings',
    description: 'Go to Performance → Setup → Appraisal Cycles and edit the target cycle',
    substeps: [
      'Toggle "Include Values Assessment" to enabled',
      'Set the values weight percentage (e.g., 15%)',
      'Configure which values apply to this cycle'
    ],
    expectedResult: 'Values assessment enabled for the appraisal cycle'
  },
  {
    title: 'Configure Values in Form Template',
    description: 'Open the form template linked to the cycle',
    substeps: [
      'Navigate to the Values section configuration',
      'Select which company values to include',
      'Set display order and optional instructions'
    ],
    expectedResult: 'Form template includes values assessment section'
  },
  {
    title: 'Map Values to Rating Scale',
    description: 'Ensure values use appropriate behavioral anchors',
    substeps: [
      'Review rating scale descriptions for values',
      'Verify behavioral indicators align with scale points',
      'Test with sample evaluations if needed'
    ],
    expectedResult: 'Values rating scale configured with clear behavioral anchors'
  },
  {
    title: 'Verify CRGV Calculation',
    description: 'Confirm values weight integrates correctly into overall score',
    substeps: [
      'Review CRGV weights (C + R + G + V should equal 100%)',
      'Test score calculation with sample data',
      'Verify values contribution appears in score breakdown'
    ],
    expectedResult: 'Values correctly contribute to overall appraisal score'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Values Integration',
    context: 'Typical enterprise with 4 core values.',
    values: [
      { field: 'Values Enabled', value: 'Yes' },
      { field: 'Values Weight', value: '15%' },
      { field: 'Core Values', value: 'Integrity, Innovation, Collaboration, Excellence' },
      { field: 'Self-Assessment', value: 'Enabled' }
    ],
    outcome: 'Employees self-assess and managers rate on all 4 values, contributing 15% to overall score.'
  },
  {
    title: 'Values-Heavy Culture Assessment',
    context: 'Organization prioritizing cultural fit.',
    values: [
      { field: 'Values Enabled', value: 'Yes' },
      { field: 'Values Weight', value: '25%' },
      { field: 'Core Values', value: '6 values with detailed behavioral indicators' },
      { field: 'Calibration Review', value: 'Required for low values scores' }
    ],
    outcome: 'Values play a significant role in performance outcomes with calibration oversight.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Values must be defined before enabling in cycles', enforcement: 'System' as const, description: 'Cannot enable values assessment if no company values exist in HR Hub.' },
  { rule: 'Values weight counts toward CRGV total', enforcement: 'System' as const, description: 'When values are enabled, all weights (C+R+G+V) must still sum to 100%.' },
  { rule: 'Behavioral indicators improve rating consistency', enforcement: 'Advisory' as const, description: 'Define clear behavioral examples for each rating level to reduce subjectivity.' },
  { rule: 'Values visible in employee appraisal form', enforcement: 'System' as const, description: 'When enabled, values section appears in the appraisal form for self and manager assessment.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Values section not appearing in appraisal form',
    cause: 'Values assessment not enabled in cycle or form template.',
    solution: 'Verify "Include Values Assessment" is enabled in cycle settings AND values section is configured in form template.'
  },
  {
    issue: 'Values not contributing to overall score',
    cause: 'Values weight set to 0% or CRGV weights incorrectly distributed.',
    solution: 'Check values weight percentage in cycle settings. Ensure C+R+G+V = 100%.'
  },
  {
    issue: 'Employees cannot see behavioral indicators',
    cause: 'Indicators not configured at value level.',
    solution: 'Go to HR Hub → Company Settings → Values and add behavioral indicators for each proficiency level.'
  }
];

export function SetupValuesAssessment() {
  return (
    <Card id="sec-2-15">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.15</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-500" />
          Values Assessment Configuration
        </CardTitle>
        <CardDescription>
          Enable and configure company values scoring as part of the CRGV appraisal model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Values Assessment']} />

        <LearningObjectives
          objectives={[
            'Enable values assessment in appraisal cycles',
            'Configure values weight in the CRGV model',
            'Set up behavioral indicators for consistent rating',
            'Understand how values integrate with overall scoring'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Company values defined in HR Hub → Company Settings',
            'Behavioral indicators created for each value',
            'Appraisal cycle created (Section 2.6)',
            'Form template configured (Section 2.5)'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            What is Values Assessment?
          </h4>
          <p className="text-muted-foreground">
            Values Assessment adds a cultural alignment dimension to performance evaluations. 
            Employees are rated on how well they embody organizational core values—such as 
            integrity, innovation, or collaboration—using behavioral indicators as anchors. 
            This ensures performance isn't just measured by results, but also by <em>how</em> 
            results are achieved.
          </p>
        </div>

        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
          <h4 className="font-semibold text-pink-700 dark:text-pink-300 mb-2">CRGV Model with Values</h4>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-background rounded">
              <p className="font-bold text-lg">C</p>
              <p className="text-xs text-muted-foreground">Competencies</p>
              <p className="text-sm font-medium">30%</p>
            </div>
            <div className="p-2 bg-background rounded">
              <p className="font-bold text-lg">R</p>
              <p className="text-xs text-muted-foreground">Responsibilities</p>
              <p className="text-sm font-medium">20%</p>
            </div>
            <div className="p-2 bg-background rounded">
              <p className="font-bold text-lg">G</p>
              <p className="text-xs text-muted-foreground">Goals</p>
              <p className="text-sm font-medium">35%</p>
            </div>
            <div className="p-2 bg-pink-100 dark:bg-pink-800 rounded border-2 border-pink-400">
              <p className="font-bold text-lg">V</p>
              <p className="text-xs text-muted-foreground">Values</p>
              <p className="text-sm font-medium">15%</p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.15.1: Values Assessment section in appraisal form with behavioral indicators"
          alt="Values Assessment form section"
        />

        <StepByStep steps={STEPS} title="Enabling Values Assessment: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.15.2: Cycle settings with values weight configuration"
          alt="Appraisal cycle values configuration"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <TipCallout title="Best Practice">
          Limit values to 4-6 core values. Too many values dilute focus and increase evaluation 
          time without proportional benefit. Each value should have 3-5 behavioral indicators 
          per rating level.
        </TipCallout>

        <WarningCallout title="Calibration Consideration">
          Values scores can be subjective. Consider including values in calibration sessions to 
          ensure cross-team consistency, especially for employees with low values scores that 
          may impact career decisions.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

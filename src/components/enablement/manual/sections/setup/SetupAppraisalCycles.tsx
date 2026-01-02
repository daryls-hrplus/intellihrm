import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Calendar } from 'lucide-react';
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
  { name: 'Cycle Name', required: true, type: 'Text', description: 'Display name for the appraisal cycle', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Cycle Code', required: true, type: 'Text', description: 'Unique identifier for integrations', defaultValue: 'Auto-generated', validation: 'Max 20 chars, alphanumeric' },
  { name: 'Cycle Type', required: true, type: 'Select', description: 'Annual, Mid-Year, Quarterly, Probationary', defaultValue: 'Annual', validation: '—' },
  { name: 'Start Date', required: true, type: 'Date', description: 'When the appraisal period begins', defaultValue: '—', validation: 'Cannot overlap with active cycles' },
  { name: 'End Date', required: true, type: 'Date', description: 'When the appraisal period ends', defaultValue: '—', validation: 'Must be after start date' },
  { name: 'Evaluation Deadline', required: true, type: 'Date', description: 'Deadline for managers to complete evaluations', defaultValue: '—', validation: 'Must be after end date' },
  { name: 'Form Template', required: true, type: 'Select', description: 'Which appraisal form to use', defaultValue: '—', validation: 'Must be active template' },
  { name: 'Rating Scale', required: true, type: 'Select', description: 'Component rating scale for this cycle', defaultValue: 'Default', validation: '—' },
  { name: 'Overall Scale', required: true, type: 'Select', description: 'Final rating scale for overall score', defaultValue: 'Default', validation: '—' },
  { name: 'Include Goals', required: false, type: 'Boolean', description: 'Include goal section in appraisal', defaultValue: 'true', validation: '—' },
  { name: 'Include Competencies', required: false, type: 'Boolean', description: 'Include competency assessment', defaultValue: 'true', validation: '—' },
  { name: 'Include 360 Feedback', required: false, type: 'Boolean', description: 'Incorporate peer feedback', defaultValue: 'false', validation: '—' },
  { name: 'Goal Weight', required: true, type: 'Number', description: 'Percentage weight for goals', defaultValue: '40', validation: 'All weights must sum to 100%' },
  { name: 'Competency Weight', required: true, type: 'Number', description: 'Percentage weight for competencies', defaultValue: '30', validation: 'All weights must sum to 100%' },
  { name: 'Status', required: true, type: 'Select', description: 'Draft, Active, Completed, Cancelled', defaultValue: 'Draft', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Appraisal Cycles',
    description: 'Go to Performance → Setup → Appraisals → Appraisal Cycles',
    expectedResult: 'Appraisal Cycles management page displays with existing cycles'
  },
  {
    title: 'Click "Create Cycle"',
    description: 'Click the primary action button to start cycle creation wizard',
    expectedResult: 'Cycle creation wizard opens with step-by-step configuration'
  },
  {
    title: 'Configure Basic Information',
    description: 'Enter cycle name, code, and type',
    substeps: [
      'Name: Enter descriptive name (e.g., "2024 Annual Performance Review")',
      'Code: Accept auto-generated or enter custom identifier',
      'Select cycle type: Annual, Mid-Year, Quarterly, or Probationary'
    ],
    expectedResult: 'Basic information validated and saved'
  },
  {
    title: 'Set Date Range',
    description: 'Define the performance period and evaluation deadline',
    substeps: [
      'Start Date: Beginning of performance period',
      'End Date: End of performance period',
      'Evaluation Deadline: When all evaluations must be complete'
    ],
    expectedResult: 'Dates validated with no overlap warnings'
  },
  {
    title: 'Select Form and Scales',
    description: 'Choose the appraisal form template and rating scales',
    substeps: [
      'Select an active form template',
      'Choose component rating scale',
      'Choose overall rating scale'
    ],
    expectedResult: 'Form and scales linked to cycle'
  },
  {
    title: 'Configure Components and Weights',
    description: 'Enable appraisal sections and set their weights',
    substeps: [
      'Toggle on/off: Goals, Competencies, Values, Responsibilities, 360 Feedback',
      'Set percentage weights for each enabled component',
      'Ensure weights total exactly 100%'
    ],
    expectedResult: 'Weight calculator shows 100% total'
  },
  {
    title: 'Define Participant Scope',
    description: 'Specify which employees are included in this cycle',
    substeps: [
      'Select by department, location, job level, or custom criteria',
      'Preview participant count',
      'Exclude specific employees if needed'
    ],
    expectedResult: 'Participant list generated with count confirmation'
  },
  {
    title: 'Save and Activate',
    description: 'Save as draft or activate immediately',
    substeps: [
      'Save as Draft: For later configuration',
      'Activate: Launch cycle and notify participants'
    ],
    expectedResult: 'Cycle saved with confirmation message'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Annual Review',
    context: 'Traditional year-end performance review for all employees.',
    values: [
      { field: 'Type', value: 'Annual' },
      { field: 'Period', value: 'Jan 1 – Dec 31' },
      { field: 'Deadline', value: 'Feb 15 (following year)' },
      { field: 'Components', value: 'Goals (40%), Competencies (30%), Values (20%), Responsibilities (10%)' }
    ],
    outcome: 'Comprehensive annual evaluation with balanced component weighting.'
  },
  {
    title: 'Mid-Year Check-In',
    context: 'Lightweight progress review without final ratings.',
    values: [
      { field: 'Type', value: 'Mid-Year' },
      { field: 'Period', value: 'Jan 1 – Jun 30' },
      { field: 'Deadline', value: 'Jul 31' },
      { field: 'Components', value: 'Goals (100%)' }
    ],
    outcome: 'Goal-focused check-in without competency or behavioral assessment.'
  },
  {
    title: 'Probationary Review',
    context: '90-day review for new hires with simplified assessment.',
    values: [
      { field: 'Type', value: 'Probationary' },
      { field: 'Period', value: '90 days from hire' },
      { field: 'Deadline', value: '100 days from hire' },
      { field: 'Components', value: 'Competencies (60%), Goals (40%)' }
    ],
    outcome: 'Focused assessment for employment confirmation decision.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Component weights must total 100%', enforcement: 'System' as const, description: 'System prevents saving until all enabled component weights equal exactly 100%.' },
  { rule: 'Active cycles cannot have overlapping dates', enforcement: 'System' as const, description: 'Warning displayed if date range overlaps with another active cycle for same employees.' },
  { rule: 'Form template must be active', enforcement: 'System' as const, description: 'Cannot select archived or draft templates for active cycles.' },
  { rule: 'Evaluation deadline must be after period end', enforcement: 'System' as const, description: 'Allows time for evaluation completion after performance period concludes.' },
  { rule: 'Cycle activation requires HR approval', enforcement: 'Policy' as const, description: 'New cycles should be reviewed by HR leadership before launching.' },
  { rule: 'Participant scope review recommended', enforcement: 'Advisory' as const, description: 'Verify participant list includes all intended employees before activation.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Weights do not total 100%',
    cause: 'Component weight percentages are miscalculated.',
    solution: 'Use the weight calculator in the form. Adjust individual weights until the total shows exactly 100%.'
  },
  {
    issue: 'Cannot activate cycle - form template error',
    cause: 'Selected form template has been deactivated or archived.',
    solution: 'Edit the cycle and select an active form template, or reactivate the desired template first.'
  },
  {
    issue: 'Employees missing from participant list',
    cause: 'Scope criteria excludes certain employees or they were hired after scope generation.',
    solution: 'Regenerate participant list or manually add missing employees. Check hire dates and department assignments.'
  },
  {
    issue: 'Overlapping cycle warning',
    cause: 'Date range conflicts with another active cycle for some employees.',
    solution: 'Adjust dates to avoid overlap, or ensure different employee populations for concurrent cycles.'
  }
];

export function SetupAppraisalCycles() {
  return (
    <Card id="sec-2-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.6</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~20 min read
          </Badge>
          <Badge variant="destructive">Required</Badge>
        </div>
        <CardTitle className="text-2xl">Appraisal Cycles Configuration</CardTitle>
        <CardDescription>
          Create and manage performance review cycles with dates, forms, and component weights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Appraisal Cycles']} />

        <LearningObjectives
          objectives={[
            'Create and configure appraisal cycles with appropriate settings',
            'Set date ranges and evaluation deadlines',
            'Configure component weights for balanced evaluations',
            'Define participant scope and manage cycle lifecycle'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Rating scales configured (Section 2.2)',
            'Overall rating scales configured (Section 2.3)',
            'Form templates created (Section 2.5)',
            'Competency library populated (Section 2.4)'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Appraisal Cycles?</h4>
          <p className="text-muted-foreground">
            Appraisal cycles define the time-bound periods during which performance evaluations occur. 
            Each cycle specifies the performance period dates, evaluation deadline, form template, 
            rating scales, component weights, and participant scope. Cycles can be annual, quarterly, 
            mid-year check-ins, or probationary reviews.
          </p>
        </div>

        <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Cycle Planning Best Practice</h4>
              <p className="text-sm text-muted-foreground">
                Plan your annual cycle calendar at the start of the fiscal year. Consider how mid-year 
                reviews align with annual cycles, and ensure probationary reviews are triggered 
                automatically for new hires.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.6.1: Appraisal Cycles list showing active and upcoming cycles"
          alt="Appraisal Cycles management page"
        />

        <StepByStep steps={STEPS} title="Creating an Appraisal Cycle: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.6.2: Cycle creation wizard with component weight configuration"
          alt="Create Appraisal Cycle wizard"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

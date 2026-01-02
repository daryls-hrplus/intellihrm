import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb } from 'lucide-react';
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
  { name: 'Name', required: true, type: 'Text', description: 'Display name for the rating scale (e.g., "Standard 5-Point Scale")', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Name (English)', required: false, type: 'Text', description: 'English translation for multilingual organizations', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier used in integrations and reports', defaultValue: 'Auto-generated', validation: 'Max 20 chars, alphanumeric + underscore' },
  { name: 'Purpose', required: true, type: 'Multi-select', description: 'Which appraisal components use this scale (Goals, Competencies, Responsibilities, Values)', defaultValue: 'None', validation: 'At least one purpose required' },
  { name: 'Min Rating', required: true, type: 'Number', description: 'Lowest possible score on the scale', defaultValue: '1', validation: 'Range: 0-10' },
  { name: 'Max Rating', required: true, type: 'Number', description: 'Highest possible score on the scale', defaultValue: '5', validation: 'Must be greater than Min Rating' },
  { name: 'Rating Labels', required: true, type: 'Array', description: 'Label and description for each rating point', defaultValue: '—', validation: 'One label per rating point required' },
  { name: 'Is Default', required: false, type: 'Boolean', description: 'Use this scale as default for new cycles', defaultValue: 'false', validation: 'Only one default per purpose allowed' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether scale is available for use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Rating Scales',
    description: 'Go to Performance → Setup → Foundation → Rating Scales',
    expectedResult: 'Rating Scales management page displays with existing scales listed'
  },
  {
    title: 'Click "Add Rating Scale"',
    description: 'Click the primary action button in the top-right corner of the page',
    expectedResult: 'Rating Scale creation dialog opens'
  },
  {
    title: 'Enter Basic Information',
    description: 'Fill in the scale name, English name (optional), and code',
    substeps: [
      'Name: Enter a descriptive name (e.g., "Standard 5-Point Performance Scale")',
      'Code: Enter a unique identifier or accept auto-generated value',
      'Select the purpose(s) this scale will be used for'
    ],
    expectedResult: 'Basic fields populated, validation passes'
  },
  {
    title: 'Configure Scale Range',
    description: 'Set the minimum and maximum rating values for the scale',
    substeps: [
      'Min Rating: Typically 1 (or 0 for scales with N/A option)',
      'Max Rating: Typically 5 (can be 3, 4, 6, or 10 based on preference)'
    ],
    expectedResult: 'Rating range defined, label inputs appear for each point'
  },
  {
    title: 'Define Rating Labels',
    description: 'For each rating point, enter a label and behavioral description',
    substeps: [
      'Click "Add Label" for each rating value',
      'Enter the numeric value (auto-populated based on range)',
      'Enter the label text (e.g., "Exceptional", "Meets Expectations")',
      'Enter a description explaining what this rating means'
    ],
    expectedResult: 'All rating points have labels and descriptions'
  },
  {
    title: 'Set Default and Active Status',
    description: 'Configure whether this is the default scale and if it should be active',
    substeps: [
      'Toggle "Is Default" if this should be the primary scale for selected purposes',
      'Keep "Is Active" enabled for immediate availability'
    ],
    expectedResult: 'Scale configuration complete'
  },
  {
    title: 'Save the Rating Scale',
    description: 'Click "Save" to create the rating scale',
    expectedResult: 'Success message appears, new scale visible in the list'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard 5-Point Scale',
    context: 'Most common configuration for annual performance reviews. Provides balanced distribution with clear middle option.',
    values: [
      { field: 'Min Rating', value: '1' },
      { field: 'Max Rating', value: '5' },
      { field: 'Labels', value: '5=Exceptional, 4=Exceeds, 3=Meets, 2=Needs Improvement, 1=Unsatisfactory' },
      { field: 'Purpose', value: 'Goals, Competencies, Responsibilities' }
    ],
    outcome: 'Enables nuanced scoring with familiar 1-5 scale that employees understand intuitively.'
  },
  {
    title: '4-Point Scale (No Middle)',
    context: 'Forces evaluators to commit to above or below expectations. Eliminates "safe" middle option.',
    values: [
      { field: 'Min Rating', value: '1' },
      { field: 'Max Rating', value: '4' },
      { field: 'Labels', value: '4=Significantly Exceeds, 3=Exceeds, 2=Meets, 1=Below' },
      { field: 'Purpose', value: 'Goals, Competencies' }
    ],
    outcome: 'Reduces central tendency bias and forces more decisive evaluations.'
  },
  {
    title: '3-Point Simplified Scale',
    context: 'Simplified scale for quick assessments or probationary reviews. Reduces complexity.',
    values: [
      { field: 'Min Rating', value: '1' },
      { field: 'Max Rating', value: '3' },
      { field: 'Labels', value: '3=Exceeds, 2=Meets, 1=Does Not Meet' },
      { field: 'Purpose', value: 'Values' }
    ],
    outcome: 'Faster completion time with clear pass/neutral/fail outcomes.'
  }
];

const BUSINESS_RULES = [
  { rule: 'At least one rating label required per point', enforcement: 'System' as const, description: 'The system will not save a scale without labels for each rating value.' },
  { rule: 'Code must be unique across the organization', enforcement: 'System' as const, description: 'Duplicate codes are rejected to ensure integration integrity.' },
  { rule: 'Only one default scale per purpose', enforcement: 'System' as const, description: 'Setting a new default automatically removes default status from other scales with same purpose.' },
  { rule: 'Cannot deactivate scale used in active cycles', enforcement: 'System' as const, description: 'Scales referenced by in-progress appraisal cycles cannot be deactivated.' },
  { rule: 'Scale changes require HR approval', enforcement: 'Policy' as const, description: 'Modifications to rating scales should go through change management process.' },
  { rule: 'Behavioral anchors recommended for each level', enforcement: 'Advisory' as const, description: 'Well-defined behavioral descriptions improve rating consistency across evaluators.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Cannot save rating scale - validation error',
    cause: 'Missing required fields or rating labels not defined for all points in the range.',
    solution: 'Ensure all required fields are filled and click "Add Label" to define labels for each rating value from Min to Max.'
  },
  {
    issue: 'Scale not appearing in appraisal cycle configuration',
    cause: 'Scale is inactive or does not have the required purpose assigned.',
    solution: 'Edit the scale to ensure "Is Active" is enabled and the appropriate purpose (Goals, Competencies, etc.) is selected.'
  },
  {
    issue: 'Cannot delete rating scale',
    cause: 'Scale is referenced by existing appraisal cycles or form templates.',
    solution: 'Deactivate the scale instead of deleting. Historical data requires the scale reference to remain.'
  },
  {
    issue: 'Default scale not being applied to new cycles',
    cause: 'Multiple scales marked as default for the same purpose, or template overrides default.',
    solution: 'Verify only one scale is marked default per purpose. Check if the appraisal template has a specific scale assigned.'
  }
];

export function SetupRatingScales() {
  return (
    <Card id="sec-2-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.2</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
            Annual review
          </Badge>
        </div>
        <CardTitle className="text-2xl">Rating Scales Configuration</CardTitle>
        <CardDescription>
          Define how individual performance elements are scored during evaluations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Foundation', 'Rating Scales']} />

        <LearningObjectives
          objectives={[
            'Understand the purpose and impact of component-level rating scales',
            'Create and configure new rating scales with appropriate labels',
            'Define behavioral anchors for consistent evaluation',
            'Set scale purposes and manage default configurations'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Access to Performance Setup with administrator role',
            'Decision on scale type (3-point, 4-point, 5-point, etc.)',
            'Behavioral descriptions for each rating level'
          ]}
        />

        {/* Overview */}
        <div>
          <h4 className="font-medium mb-2">What Are Rating Scales?</h4>
          <p className="text-muted-foreground">
            Rating scales define how individual items—goals, competencies, responsibilities, and values—are 
            scored during performance evaluations. Each scale consists of a numeric range and descriptive 
            labels that guide evaluators toward consistent, meaningful ratings. The industry standard is a 
            5-point scale, though organizations may choose 3-point, 4-point, or other configurations based 
            on their evaluation philosophy.
          </p>
        </div>

        {/* Industry Insight */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Scale Design Considerations</h4>
              <p className="text-sm text-foreground">
                <strong>5-Point Scales</strong> provide nuance but can lead to central tendency (everyone gets 3). 
                <strong> 4-Point Scales</strong> eliminate the "safe middle" forcing decisive ratings. 
                <strong> 3-Point Scales</strong> simplify but lose granularity. Choose based on your organizational 
                culture and tolerance for differentiation.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.2.1: Rating Scales list view showing active scales with purposes and default indicators"
          alt="Rating Scales management page"
        />

        <StepByStep steps={STEPS} title="Creating a Rating Scale: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.2.2: Rating Scale creation dialog with label configuration"
          alt="Add Rating Scale dialog"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        {/* Sample Rating Labels Table */}
        <div>
          <h4 className="font-medium mb-3">Standard 5-Point Scale Labels</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Label</th>
                  <th className="text-left p-3 font-medium">Behavioral Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rating: 5, label: 'Exceptional', desc: 'Consistently exceeds all expectations; serves as role model; achieves extraordinary results' },
                  { rating: 4, label: 'Exceeds Expectations', desc: 'Frequently exceeds expectations; delivers above-target results with high quality' },
                  { rating: 3, label: 'Meets Expectations', desc: 'Consistently meets expectations; delivers reliable, quality work on time' },
                  { rating: 2, label: 'Needs Improvement', desc: 'Occasionally meets expectations; gaps exist that require development attention' },
                  { rating: 1, label: 'Unsatisfactory', desc: 'Does not meet expectations; immediate performance intervention required' }
                ].map((row) => (
                  <tr key={row.rating} className="border-t">
                    <td className="p-3 font-medium">{row.rating}</td>
                    <td className="p-3">{row.label}</td>
                    <td className="p-3 text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

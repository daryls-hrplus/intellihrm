import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, ArrowRight } from 'lucide-react';
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
  { name: 'Name', required: true, type: 'Text', description: 'Display name for the overall rating scale', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Name (English)', required: false, type: 'Text', description: 'English translation for multilingual organizations', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for integrations and reporting', defaultValue: 'Auto-generated', validation: 'Max 20 chars, alphanumeric' },
  { name: 'Description', required: false, type: 'Text', description: 'Explanation of when and how this scale is used', defaultValue: '—', validation: 'Max 500 characters' },
  { name: 'Levels', required: true, type: 'Array', description: 'Performance levels with labels, score ranges, and colors', defaultValue: '—', validation: 'At least 3 levels required' },
  { name: 'Level - Label', required: true, type: 'Text', description: 'Display name for the performance level', defaultValue: '—', validation: 'Max 50 characters' },
  { name: 'Level - Min Score', required: true, type: 'Decimal', description: 'Minimum score to achieve this level (inclusive)', defaultValue: '—', validation: '0.00 - 5.00' },
  { name: 'Level - Max Score', required: true, type: 'Decimal', description: 'Maximum score for this level (inclusive)', defaultValue: '—', validation: 'Must be >= Min Score' },
  { name: 'Level - Color', required: true, type: 'Color', description: 'Visual indicator color for dashboards and reports', defaultValue: 'System default', validation: 'Hex color code' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether scale is available for use in cycles', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Overall Rating Scales',
    description: 'Go to Performance → Setup → Foundation → Overall Rating Scales',
    expectedResult: 'Overall Rating Scales page displays with existing configurations'
  },
  {
    title: 'Click "Add Overall Scale"',
    description: 'Click the primary action button to create a new overall rating scale',
    expectedResult: 'Overall Scale creation dialog opens with level configuration options'
  },
  {
    title: 'Enter Scale Information',
    description: 'Provide the basic scale details including name, code, and description',
    substeps: [
      'Name: Enter descriptive name (e.g., "5-Level Performance Categories")',
      'Code: Enter unique identifier or accept auto-generated value',
      'Description: Explain the purpose and application of this scale'
    ],
    expectedResult: 'Basic information saved, ready for level configuration'
  },
  {
    title: 'Add Performance Levels',
    description: 'Define each performance category with score ranges',
    substeps: [
      'Click "Add Level" to create a new performance tier',
      'Enter the level label (e.g., "Exceptional", "Meets Expectations")',
      'Set the minimum and maximum scores for this level',
      'Select a color for visual identification'
    ],
    expectedResult: 'Level added to the scale with validation'
  },
  {
    title: 'Configure All Levels',
    description: 'Repeat step 4 to add all required performance levels (typically 5)',
    substeps: [
      'Ensure score ranges are contiguous (no gaps)',
      'Verify ranges do not overlap',
      'Cover the full range from minimum to maximum possible scores'
    ],
    expectedResult: 'All performance levels defined with complete score coverage'
  },
  {
    title: 'Review and Save',
    description: 'Verify the scale configuration and save',
    substeps: [
      'Review the visual preview of score-to-level mapping',
      'Confirm color assignments are distinguishable',
      'Click "Save" to create the overall rating scale'
    ],
    expectedResult: 'Scale saved successfully and available for appraisal cycle configuration'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard 5-Level Distribution',
    context: 'Traditional performance distribution aligned with bell curve expectations. Used for annual reviews with calibration.',
    values: [
      { field: 'Level 5', value: 'Exceptional: 4.50 - 5.00 (Color: Green)' },
      { field: 'Level 4', value: 'Exceeds: 3.75 - 4.49 (Color: Blue)' },
      { field: 'Level 3', value: 'Meets: 2.75 - 3.74 (Color: Gray)' },
      { field: 'Level 2', value: 'Needs Improvement: 1.75 - 2.74 (Color: Orange)' },
      { field: 'Level 1', value: 'Unsatisfactory: 1.00 - 1.74 (Color: Red)' }
    ],
    outcome: 'Clear differentiation across performance tiers with visual indicators for quick identification.'
  },
  {
    title: 'Narrow High-Performance Bands',
    context: 'Stricter criteria for top ratings to limit inflation. Expands the "Meets" range.',
    values: [
      { field: 'Level 5', value: 'Exceptional: 4.80 - 5.00 (narrow, only ~5%)' },
      { field: 'Level 4', value: 'Exceeds: 4.00 - 4.79' },
      { field: 'Level 3', value: 'Meets: 2.50 - 3.99 (expanded range)' },
      { field: 'Level 2', value: 'Below: 1.50 - 2.49' },
      { field: 'Level 1', value: 'Unsatisfactory: 1.00 - 1.49' }
    ],
    outcome: 'Reduces rating inflation by making top tier harder to achieve.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Score ranges must be contiguous with no gaps', enforcement: 'System' as const, description: 'Every possible score must map to exactly one performance level.' },
  { rule: 'Score ranges cannot overlap', enforcement: 'System' as const, description: 'A single score cannot qualify for multiple levels.' },
  { rule: 'At least 3 performance levels required', enforcement: 'System' as const, description: 'Minimum levels needed for meaningful differentiation.' },
  { rule: 'Overall scale determines final category', enforcement: 'System' as const, description: 'The weighted composite score maps to this scale for the final rating.' },
  { rule: 'Calibration alignment recommended', enforcement: 'Policy' as const, description: 'Level distributions should align with calibration target percentages.' },
  { rule: 'Color accessibility', enforcement: 'Advisory' as const, description: 'Choose colors that are distinguishable for color-blind users.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Cannot save overall scale - range validation error',
    cause: 'Score ranges have gaps or overlaps between levels.',
    solution: 'Review all level min/max values. Ensure ranges are contiguous (e.g., Level 1 ends at 1.74, Level 2 starts at 1.75).'
  },
  {
    issue: 'Employee final rating shows "Unclassified"',
    cause: 'Calculated score falls outside all defined level ranges.',
    solution: 'Extend level ranges to cover all possible scores (typically 1.00 to 5.00 for 5-point component scales).'
  },
  {
    issue: 'Wrong performance category assigned',
    cause: 'Decimal precision issue or incorrect range boundaries.',
    solution: 'Verify level boundaries use two decimal places. Check that max of one level equals min of next level minus 0.01.'
  }
];

export function SetupOverallScales() {
  return (
    <Card id="sec-2-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.3</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/30">
            Annual review
          </Badge>
        </div>
        <CardTitle className="text-2xl">Overall Rating Scales</CardTitle>
        <CardDescription>
          Configure final appraisal rating categories that aggregate component scores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Foundation', 'Overall Rating Scales']} />

        <LearningObjectives
          objectives={[
            'Understand how overall scales differ from component rating scales',
            'Configure performance levels with appropriate score ranges',
            'Align overall categories with compensation and talent decisions',
            'Set up visual indicators for performance dashboards'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Component rating scales configured (Section 2.2)',
            'Understanding of weighted score calculation',
            'Organizational decisions on performance tier definitions'
          ]}
        />

        {/* Overview */}
        <div>
          <h4 className="font-medium mb-2">What Are Overall Rating Scales?</h4>
          <p className="text-muted-foreground">
            Overall rating scales translate the weighted composite score from individual components 
            (goals, competencies, responsibilities, values) into final performance categories. These 
            categories drive downstream processes including compensation decisions, succession planning 
            eligibility, and performance improvement requirements.
          </p>
        </div>

        {/* Score Flow Diagram */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Score Aggregation Flow</h4>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Goals (40%)</Badge>
              <span className="text-muted-foreground">+</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Competencies (30%)</Badge>
              <span className="text-muted-foreground">+</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Responsibilities (30%)</Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
            <Badge className="bg-primary text-primary-foreground">Weighted Score</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
            <Badge className="bg-green-500/20 text-green-800 dark:text-green-300 border border-green-500/30">Final Category</Badge>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.3.1: Overall Rating Scale configuration showing performance levels with score ranges"
          alt="Overall Rating Scale configuration page"
        />

        <StepByStep steps={STEPS} title="Creating an Overall Rating Scale: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        {/* Distribution Table */}
        <div>
          <h4 className="font-medium mb-3">Standard 5-Level Configuration</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Score Range</th>
                  <th className="text-left p-3 font-medium">Target %</th>
                  <th className="text-left p-3 font-medium">Compensation Impact</th>
                  <th className="text-left p-3 font-medium">Actions Triggered</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Exceptional', range: '4.50 - 5.00', dist: '10%', comp: 'Maximum merit + bonus', action: 'Succession nomination' },
                  { cat: 'Exceeds Expectations', range: '3.75 - 4.49', dist: '20%', comp: 'Above-average merit', action: 'Career development' },
                  { cat: 'Meets Expectations', range: '2.75 - 3.74', dist: '40%', comp: 'Standard merit', action: 'Goal setting' },
                  { cat: 'Needs Improvement', range: '1.75 - 2.74', dist: '20%', comp: 'Reduced/no merit', action: 'Development plan' },
                  { cat: 'Unsatisfactory', range: '1.00 - 1.74', dist: '10%', comp: 'No merit', action: 'PIP required' }
                ].map((row) => (
                  <tr key={row.cat} className="border-t">
                    <td className="p-3 font-medium">{row.cat}</td>
                    <td className="p-3">{row.range}</td>
                    <td className="p-3">{row.dist}</td>
                    <td className="p-3 text-muted-foreground">{row.comp}</td>
                    <td className="p-3 text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calibration Note */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Calibration Connection</h4>
              <p className="text-sm text-foreground">
                Target distributions are guidelines for calibration sessions, not hard limits. 
                Actual distributions will vary by team based on real performance profiles. 
                The system tracks distribution metrics to help identify potential rating inflation or deflation.
              </p>
            </div>
          </div>
        </div>

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

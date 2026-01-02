import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Tag } from 'lucide-react';
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
  { name: 'Category Name', required: true, type: 'Text', description: 'Display name for the performance category', defaultValue: '—', validation: 'Max 50 characters' },
  { name: 'Category Code', required: true, type: 'Text', description: 'Unique identifier for reporting', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Description', required: false, type: 'Text', description: 'Explanation of what this category represents', defaultValue: '—', validation: 'Max 500 characters' },
  { name: 'Rating Range', required: true, type: 'Text', description: 'Score range that maps to this category', defaultValue: '—', validation: 'Non-overlapping ranges' },
  { name: 'Color Code', required: false, type: 'Color', description: 'Visual indicator in dashboards and reports', defaultValue: 'System assigned', validation: 'Valid hex color' },
  { name: 'Display Order', required: true, type: 'Number', description: 'Order in which category appears', defaultValue: 'Sequential', validation: 'Unique order numbers' },
  { name: 'Triggers Action Rules', required: false, type: 'Boolean', description: 'Whether this category can trigger automated actions', defaultValue: 'false', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether category is available for use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Performance Categories',
    description: 'Go to Performance → Setup → Appraisals → Performance Categories',
    expectedResult: 'Performance Categories page displays with existing categories'
  },
  {
    title: 'Review Default Categories',
    description: 'System provides default categories that can be customized',
    substeps: [
      'High Performer (typically 4.5-5.0)',
      'Solid Performer (typically 3.5-4.49)',
      'Meets Expectations (typically 2.5-3.49)',
      'Needs Development (typically 1.5-2.49)',
      'Underperformer (typically 1.0-1.49)'
    ],
    expectedResult: 'Understanding of default category structure'
  },
  {
    title: 'Click "Add Category" or Edit Existing',
    description: 'Create a new category or modify an existing one',
    expectedResult: 'Category configuration form opens'
  },
  {
    title: 'Configure Category Details',
    description: 'Enter name, code, description, and rating range',
    substeps: [
      'Enter category name that aligns with your performance philosophy',
      'Set the score range (e.g., 4.5 to 5.0)',
      'Provide a clear description for managers and employees',
      'Select a color for visual identification'
    ],
    expectedResult: 'Category details configured and validated'
  },
  {
    title: 'Set Action Trigger (Optional)',
    description: 'Enable if this category should trigger action rules',
    substeps: [
      'High performers: May trigger succession nomination',
      'Underperformers: May trigger PIP initiation'
    ],
    expectedResult: 'Action trigger configured if applicable'
  },
  {
    title: 'Save Category',
    description: 'Save the category configuration',
    expectedResult: 'Category saved and appears in the list'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard 5-Category System',
    context: 'Traditional performance distribution with five distinct levels.',
    values: [
      { field: 'Category 1', value: 'Exceptional (4.5-5.0) - Green' },
      { field: 'Category 2', value: 'Exceeds Expectations (3.5-4.49) - Blue' },
      { field: 'Category 3', value: 'Meets Expectations (2.5-3.49) - Yellow' },
      { field: 'Category 4', value: 'Needs Improvement (1.5-2.49) - Orange' },
      { field: 'Category 5', value: 'Unsatisfactory (1.0-1.49) - Red' }
    ],
    outcome: 'Clear performance differentiation with intuitive color coding.'
  },
  {
    title: 'Simplified 3-Category System',
    context: 'Streamlined approach focusing on key distinctions.',
    values: [
      { field: 'Category 1', value: 'High Performer (4.0-5.0) - Green' },
      { field: 'Category 2', value: 'Solid Performer (2.5-3.99) - Blue' },
      { field: 'Category 3', value: 'Needs Development (1.0-2.49) - Red' }
    ],
    outcome: 'Simplified categorization for organizations avoiding excessive differentiation.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Rating ranges cannot overlap', enforcement: 'System' as const, description: 'Each score value can only belong to one category.' },
  { rule: 'All possible scores must be covered', enforcement: 'System' as const, description: 'Gaps in rating ranges are not allowed; all scores from min to max must map to a category.' },
  { rule: 'At least one category required', enforcement: 'System' as const, description: 'System requires at least one active performance category.' },
  { rule: 'Category changes affect historical reports', enforcement: 'Policy' as const, description: 'Modifying category ranges may impact historical distribution reporting. Document changes.' },
  { rule: 'Color consistency recommended', enforcement: 'Advisory' as const, description: 'Use consistent colors across the organization (green=positive, red=attention needed).' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Overlapping range error when saving',
    cause: 'The score range overlaps with another existing category.',
    solution: 'Review all category ranges and ensure no overlap. Adjust boundaries so each score maps to exactly one category.'
  },
  {
    issue: 'Gap in coverage warning',
    cause: 'There is a score range not covered by any category.',
    solution: 'Extend an existing category range or create a new category to cover the gap.'
  },
  {
    issue: 'Category not appearing in reports',
    cause: 'Category is inactive or no employees fall within its range.',
    solution: 'Ensure the category is active. Check if the score range is realistic for your rating distribution.'
  }
];

export function SetupPerformanceCategories() {
  return (
    <Card id="sec-2-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.7</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Performance Categories Setup</CardTitle>
        <CardDescription>
          Define performance categories that map numeric scores to meaningful labels for reporting and actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Performance Categories']} />

        <LearningObjectives
          objectives={[
            'Understand how performance categories map scores to labels',
            'Configure category ranges without gaps or overlaps',
            'Set up action triggers for automated workflows',
            'Customize colors for visual dashboards'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Overall rating scales configured (Section 2.3)',
            'Understanding of desired performance distribution'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Performance Categories?</h4>
          <p className="text-muted-foreground">
            Performance categories translate numeric overall scores into meaningful labels like 
            "High Performer" or "Needs Development." These categories drive analytics, 
            distribution reports, calibration discussions, and can trigger automated actions 
            such as PIP initiation or succession nomination.
          </p>
        </div>

        <div className="p-4 border-l-4 border-l-purple-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Category Design Tip</h4>
              <p className="text-sm text-foreground">
                Use positive, growth-oriented language. "Developing Performer" is more constructive 
                than "Below Average." Categories should guide development conversations, not just label employees.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.7.1: Performance Categories configuration with score ranges and colors"
          alt="Performance Categories setup page"
        />

        <StepByStep steps={STEPS} title="Configuring Performance Categories: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

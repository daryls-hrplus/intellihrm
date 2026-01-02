import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
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
  { name: 'Template Name', required: true, type: 'Text', description: 'Display name for the goal template', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for the template', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Category', required: true, type: 'Select', description: 'Goal category (Business, Development, Team, etc.)', defaultValue: 'Business', validation: 'From predefined list' },
  { name: 'Description', required: false, type: 'Text', description: 'Template purpose and usage guidance', defaultValue: '—', validation: 'Max 500 characters' },
  { name: 'Default Weight', required: false, type: 'Percentage', description: 'Suggested weight for this goal type', defaultValue: '20%', validation: '0-100%' },
  { name: 'Measurement Type', required: true, type: 'Select', description: 'How goal progress is tracked', defaultValue: 'Percentage', validation: 'Percentage, Milestone, Numeric, Binary' },
  { name: 'Key Results Required', required: false, type: 'Boolean', description: 'Whether KRs must be defined', defaultValue: 'false', validation: '—' },
  { name: 'Min Key Results', required: false, type: 'Number', description: 'Minimum number of key results', defaultValue: '0', validation: '0-10' },
  { name: 'Applies To', required: false, type: 'Multi-select', description: 'Which employee groups can use this template', defaultValue: 'All employees', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether template is available for use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Goal Templates',
    description: 'Go to Performance → Setup → Goals → Goal Templates',
    expectedResult: 'Goal Templates page displays with existing templates'
  },
  {
    title: 'Click "Add Template"',
    description: 'Click the primary action button to create a new template',
    expectedResult: 'Template creation form opens'
  },
  {
    title: 'Enter Template Details',
    description: 'Provide basic template information',
    substeps: [
      'Name: Enter descriptive name (e.g., "Revenue Growth Goal")',
      'Category: Select the appropriate goal category',
      'Description: Write guidance for when to use this template'
    ],
    expectedResult: 'Basic information captured'
  },
  {
    title: 'Configure Measurement',
    description: 'Define how goal progress will be tracked',
    substeps: [
      'Select measurement type (Percentage, Milestone, etc.)',
      'Set whether key results are required',
      'Define minimum key results if applicable'
    ],
    expectedResult: 'Measurement approach defined'
  },
  {
    title: 'Set Default Weight',
    description: 'Assign a suggested weight for this goal type',
    expectedResult: 'Weight guidance established for users'
  },
  {
    title: 'Define Applicability',
    description: 'Specify which employees can use this template',
    substeps: [
      'Select departments or job families',
      'Leave empty for universal availability'
    ],
    expectedResult: 'Template scope configured'
  },
  {
    title: 'Save Template',
    description: 'Save and make the template available',
    expectedResult: 'Template appears in goal creation dropdown'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Revenue Target Goal',
    context: 'Sales team quarterly revenue objectives.',
    values: [
      { field: 'Category', value: 'Business' },
      { field: 'Measurement', value: 'Numeric (currency)' },
      { field: 'Key Results', value: 'Required (min 2)' },
      { field: 'Default Weight', value: '40%' },
      { field: 'Applies To', value: 'Sales Department' }
    ],
    outcome: 'Standardized revenue goal format with key result tracking.'
  },
  {
    title: 'Professional Development Goal',
    context: 'Individual skill development and learning objectives.',
    values: [
      { field: 'Category', value: 'Development' },
      { field: 'Measurement', value: 'Milestone' },
      { field: 'Key Results', value: 'Optional' },
      { field: 'Default Weight', value: '15%' },
      { field: 'Applies To', value: 'All employees' }
    ],
    outcome: 'Flexible format for diverse development activities.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Template codes must be unique', enforcement: 'System' as const, description: 'Prevents duplicate templates and integration conflicts.' },
  { rule: 'Active templates visible in goal creation', enforcement: 'System' as const, description: 'Only active templates appear as options for employees.' },
  { rule: 'Category determines goal section placement', enforcement: 'System' as const, description: 'Goals grouped by category in appraisal forms.' },
  { rule: 'Weight defaults are suggestions only', enforcement: 'Policy' as const, description: 'Employees and managers can adjust actual weights.' },
  { rule: 'Review templates annually', enforcement: 'Advisory' as const, description: 'Update templates to reflect evolving business priorities.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Template not appearing in goal creation',
    cause: 'Template inactive or employee not in applicability scope.',
    solution: 'Verify template is active and the employee\'s department/role is included in applicability.'
  },
  {
    issue: 'Cannot require key results',
    cause: 'Measurement type set to Binary which does not support key results.',
    solution: 'Change measurement type to Percentage, Milestone, or Numeric to enable key results.'
  }
];

export function SetupGoalTemplates() {
  return (
    <Card id="sec-2-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.7</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~8 min read
          </Badge>
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            As needed
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Goal Templates
        </CardTitle>
        <CardDescription>
          Create reusable templates that standardize goal creation across the organization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Goals', 'Goal Templates']} />

        <LearningObjectives
          objectives={[
            'Understand the purpose and benefits of goal templates',
            'Create templates with appropriate measurement types',
            'Configure key result requirements and default weights',
            'Manage template applicability across employee groups'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Goal categories defined',
            'Understanding of organizational goal types',
            'Department structure for applicability scoping'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Goal Templates?</h4>
          <p className="text-muted-foreground">
            Goal templates provide pre-configured structures that guide employees when creating goals. 
            Templates standardize goal formats, measurement approaches, and weighting guidelines across 
            the organization. They reduce variability in goal quality and ensure alignment with 
            organizational expectations.
          </p>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.7.1: Goal Templates library showing available templates by category"
          alt="Goal Templates management page"
        />

        <StepByStep steps={STEPS} title="Creating a Goal Template: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

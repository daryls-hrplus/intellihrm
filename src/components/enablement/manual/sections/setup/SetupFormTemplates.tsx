import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, FileText } from 'lucide-react';
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
  { name: 'Template Name', required: true, type: 'Text', description: 'Display name for the form template', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Template Code', required: true, type: 'Text', description: 'Unique identifier for system reference', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Description', required: false, type: 'Text', description: 'Purpose and usage guidelines', defaultValue: '—', validation: 'Max 500 characters' },
  { name: 'Include Goals', required: false, type: 'Boolean', description: 'Add goals section to form', defaultValue: 'true', validation: '—' },
  { name: 'Include Competencies', required: false, type: 'Boolean', description: 'Add competency assessment', defaultValue: 'true', validation: '—' },
  { name: 'Include Responsibilities', required: false, type: 'Boolean', description: 'Add job responsibilities section', defaultValue: 'true', validation: '—' },
  { name: 'Include Values', required: false, type: 'Boolean', description: 'Add company values assessment', defaultValue: 'false', validation: '—' },
  { name: 'Include 360 Feedback', required: false, type: 'Boolean', description: 'Add peer feedback section', defaultValue: 'false', validation: '—' },
  { name: 'Goals Weight', required: true, type: 'Number', description: 'Default weight for goals section', defaultValue: '40', validation: 'Sum must be 100%' },
  { name: 'Competencies Weight', required: true, type: 'Number', description: 'Default weight for competencies', defaultValue: '30', validation: 'Sum must be 100%' },
  { name: 'Allow Weight Override', required: false, type: 'Boolean', description: 'Allow cycle-level weight customization', defaultValue: 'true', validation: '—' },
  { name: 'Rating Scale', required: true, type: 'Select', description: 'Default component rating scale', defaultValue: 'Organization default', validation: '—' },
  { name: 'Overall Scale', required: true, type: 'Select', description: 'Default overall rating scale', defaultValue: 'Organization default', validation: '—' },
  { name: 'Is Default', required: false, type: 'Boolean', description: 'Use as default for new cycles', defaultValue: 'false', validation: 'Only one default allowed' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Available for use in cycles', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Form Templates',
    description: 'Go to Performance → Setup → Appraisals → Form Templates',
    expectedResult: 'Form Templates page displays with existing templates'
  },
  {
    title: 'Click "Create Template"',
    description: 'Start the template creation wizard',
    expectedResult: 'Template builder opens with section configuration options'
  },
  {
    title: 'Enter Template Information',
    description: 'Configure basic template details',
    substeps: [
      'Name: Enter a descriptive template name',
      'Code: Accept auto-generated or enter custom code',
      'Description: Document when this template should be used'
    ],
    expectedResult: 'Basic information saved'
  },
  {
    title: 'Select Included Sections',
    description: 'Choose which sections appear in the appraisal form',
    substeps: [
      'Toggle Goals section (recommended for all templates)',
      'Toggle Competencies section',
      'Toggle Responsibilities section',
      'Toggle Values section',
      'Toggle 360 Feedback section'
    ],
    expectedResult: 'Sections configured based on template purpose'
  },
  {
    title: 'Configure Default Weights',
    description: 'Set the percentage weight for each enabled section',
    substeps: [
      'Enter weight for each enabled section',
      'Use weight calculator to ensure 100% total',
      'Consider organizational priorities in weighting'
    ],
    expectedResult: 'Weights total 100%'
  },
  {
    title: 'Assign Rating Scales',
    description: 'Select default rating scales for the template',
    substeps: [
      'Select component rating scale',
      'Select overall rating scale',
      'Scales can be overridden at cycle level if enabled'
    ],
    expectedResult: 'Rating scales assigned'
  },
  {
    title: 'Set Default and Active Status',
    description: 'Configure template availability',
    substeps: [
      'Mark as default if this is primary template',
      'Keep active for immediate availability'
    ],
    expectedResult: 'Template configured and ready for use'
  },
  {
    title: 'Save Template',
    description: 'Save the form template',
    expectedResult: 'Template saved and appears in list'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Annual Review Template',
    context: 'Comprehensive template for annual performance reviews.',
    values: [
      { field: 'Sections', value: 'Goals, Competencies, Responsibilities, Values' },
      { field: 'Weights', value: 'Goals 40%, Competencies 30%, Responsibilities 20%, Values 10%' },
      { field: 'Rating Scale', value: 'Standard 5-Point' },
      { field: 'Is Default', value: 'Yes' }
    ],
    outcome: 'Balanced evaluation covering all performance dimensions.'
  },
  {
    title: 'Goal-Focused Mid-Year Template',
    context: 'Lightweight template for mid-year goal check-ins.',
    values: [
      { field: 'Sections', value: 'Goals only' },
      { field: 'Weights', value: 'Goals 100%' },
      { field: 'Rating Scale', value: 'Standard 5-Point' },
      { field: 'Is Default', value: 'No' }
    ],
    outcome: 'Quick goal progress review without full performance assessment.'
  },
  {
    title: 'Manager Appraisal Template',
    context: 'Template with leadership competencies for manager evaluations.',
    values: [
      { field: 'Sections', value: 'Goals, Competencies (Leadership), 360 Feedback' },
      { field: 'Weights', value: 'Goals 35%, Competencies 40%, 360 Feedback 25%' },
      { field: 'Rating Scale', value: 'Standard 5-Point' },
      { field: 'Is Default', value: 'No' }
    ],
    outcome: 'Leadership-focused evaluation with peer input.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Section weights must total 100%', enforcement: 'System' as const, description: 'Template cannot be saved if weights do not sum to exactly 100%.' },
  { rule: 'At least one section required', enforcement: 'System' as const, description: 'Templates must include at least one evaluation section.' },
  { rule: 'Only one default template', enforcement: 'System' as const, description: 'Setting a template as default removes default status from others.' },
  { rule: 'Cannot delete templates in use', enforcement: 'System' as const, description: 'Templates referenced by active or historical cycles cannot be deleted.' },
  { rule: 'Template changes require HR approval', enforcement: 'Policy' as const, description: 'Modifications to form templates should go through change management.' },
  { rule: 'Version templates rather than modify', enforcement: 'Advisory' as const, description: 'Create new versions of templates rather than modifying existing ones for audit purposes.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Cannot save template - weight validation error',
    cause: 'Section weights do not total exactly 100%.',
    solution: 'Adjust section weights until the total equals 100%. Use the weight calculator feature.'
  },
  {
    issue: 'Template not appearing in cycle configuration',
    cause: 'Template is inactive or was recently created.',
    solution: 'Verify the template is marked as active. Refresh the page if template was just created.'
  },
  {
    issue: 'Cannot delete template',
    cause: 'Template is referenced by existing appraisal cycles.',
    solution: 'Deactivate the template instead of deleting. Historical cycles require the template reference.'
  },
  {
    issue: '360 Feedback section not working',
    cause: '360 Feedback module not enabled or configured.',
    solution: 'Configure 360 Feedback settings before enabling this section in templates.'
  }
];

export function SetupFormTemplates() {
  return (
    <Card id="sec-2-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.8</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~15 min read
          </Badge>
          <Badge variant="destructive">Required</Badge>
        </div>
        <CardTitle className="text-2xl">Form Templates Configuration</CardTitle>
        <CardDescription>
          Design appraisal form templates that define sections, weights, and rating scales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Form Templates']} />

        <LearningObjectives
          objectives={[
            'Design form templates with appropriate sections for different review types',
            'Configure section weights for balanced evaluations',
            'Link templates to rating scales',
            'Manage template lifecycle and versioning'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Rating scales configured (Section 2.2)',
            'Overall rating scales configured (Section 2.3)',
            'Competency library populated (Section 2.4)',
            'Understanding of evaluation philosophy'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Form Templates?</h4>
          <p className="text-muted-foreground">
            Form templates define the structure of appraisal forms, including which sections 
            are included (Goals, Competencies, Values, etc.), default weights for each section, 
            and linked rating scales. Templates enable consistency across the organization while 
            allowing customization for different employee populations or review types.
          </p>
        </div>

        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Template Strategy</h4>
              <p className="text-sm text-muted-foreground">
                Create a small number of well-designed templates rather than many variations. 
                Typical organizations need 3-5 templates: Standard, Manager, Executive, 
                Mid-Year, and Probationary.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.8.1: Form Templates list with section and weight summary"
          alt="Form Templates management page"
        />

        <StepByStep steps={STEPS} title="Creating a Form Template: Step-by-Step" />

        <ScreenshotPlaceholder
          caption="Figure 2.8.2: Template builder with section configuration"
          alt="Create Form Template wizard"
        />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

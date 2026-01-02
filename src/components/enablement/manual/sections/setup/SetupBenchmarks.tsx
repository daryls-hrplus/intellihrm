import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, BarChart3, Globe } from 'lucide-react';
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
  { name: 'Benchmark Name', required: true, type: 'Text', description: 'Display name for the benchmark set', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Benchmark Code', required: true, type: 'Text', description: 'Unique identifier', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Benchmark Type', required: true, type: 'Select', description: 'Internal, External, or Industry', defaultValue: 'Internal', validation: '—' },
  { name: 'Source', required: true, type: 'Text', description: 'Data source for external benchmarks', defaultValue: '—', validation: 'Required for external' },
  { name: 'Effective Date', required: true, type: 'Date', description: 'When benchmark becomes active', defaultValue: 'Today', validation: '—' },
  { name: 'Expiry Date', required: false, type: 'Date', description: 'When benchmark expires', defaultValue: 'None', validation: 'After effective date' },
  { name: 'Target Distribution', required: true, type: 'Config', description: 'Expected percentage per rating', defaultValue: 'Bell curve', validation: 'Must sum to 100%' },
  { name: 'Apply To', required: true, type: 'Multi-select', description: 'Which populations use this benchmark', defaultValue: 'All Employees', validation: '—' },
  { name: 'Tolerance Range', required: false, type: 'Number', description: 'Acceptable deviation from target (%)', defaultValue: '5%', validation: '0-20%' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether benchmark is in use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Benchmarks',
    description: 'Go to Performance → Setup → Appraisals → Benchmarks',
    expectedResult: 'Benchmarks configuration page displays'
  },
  {
    title: 'Click "Add Benchmark"',
    description: 'Start creating a new performance benchmark',
    expectedResult: 'Benchmark creation form opens'
  },
  {
    title: 'Select Benchmark Type',
    description: 'Choose the type of benchmark',
    substeps: [
      'Internal: Based on your organization\'s historical data',
      'External: From third-party compensation/performance surveys',
      'Industry: Sector-specific benchmarks'
    ],
    expectedResult: 'Benchmark type selected'
  },
  {
    title: 'Configure Target Distribution',
    description: 'Define expected percentage for each rating level',
    substeps: [
      'Enter percentage for each performance category',
      'Use bell curve template or customize',
      'Ensure percentages sum to 100%',
      'Consider organizational philosophy (forced vs. guided)'
    ],
    expectedResult: 'Distribution targets configured'
  },
  {
    title: 'Set Population Scope',
    description: 'Define which employees this benchmark applies to',
    substeps: [
      'All Employees: Organization-wide benchmark',
      'By Department: Different targets per department',
      'By Job Level: Different targets for managers vs. individual contributors',
      'By Location: Regional variations'
    ],
    expectedResult: 'Population scope defined'
  },
  {
    title: 'Configure Tolerance',
    description: 'Set acceptable deviation from targets',
    substeps: [
      'Strict (2-3%): Tight distribution enforcement',
      'Moderate (5%): Some flexibility allowed',
      'Loose (10%+): Guidelines only'
    ],
    expectedResult: 'Tolerance range configured'
  },
  {
    title: 'Set Effective Dates',
    description: 'Configure when benchmark is active',
    substeps: [
      'Set effective date (typically start of cycle)',
      'Set expiry date if benchmark should auto-expire',
      'Consider annual refresh cycle'
    ],
    expectedResult: 'Date range configured'
  },
  {
    title: 'Save and Preview',
    description: 'Save benchmark and preview against current data',
    expectedResult: 'Benchmark saved with distribution preview'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Bell Curve',
    context: 'Traditional forced distribution following normal curve.',
    values: [
      { field: 'Distribution', value: 'Exceptional: 10%, Exceeds: 20%, Meets: 40%, Needs Improvement: 20%, Unsatisfactory: 10%' },
      { field: 'Tolerance', value: '5%' },
      { field: 'Apply To', value: 'All Employees' }
    ],
    outcome: 'Enforces traditional bell curve with moderate flexibility.'
  },
  {
    title: 'Top-Heavy Distribution',
    context: 'High-performing organization with positive skew.',
    values: [
      { field: 'Distribution', value: 'Exceptional: 15%, Exceeds: 35%, Meets: 35%, Needs Improvement: 12%, Unsatisfactory: 3%' },
      { field: 'Tolerance', value: '7%' },
      { field: 'Apply To', value: 'All Employees' }
    ],
    outcome: 'Allows more employees in top categories while maintaining differentiation.'
  },
  {
    title: 'Development-Focused',
    context: 'Organization focusing on growth and potential.',
    values: [
      { field: 'Distribution', value: 'Exceptional: 5%, Exceeds: 25%, Meets: 50%, Developing: 18%, Unsatisfactory: 2%' },
      { field: 'Tolerance', value: '10%' },
      { field: 'Apply To', value: 'Individual Contributors' }
    ],
    outcome: 'Emphasizes "Meets" with large developing population, minimal bottom.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Distribution percentages must sum to 100%', enforcement: 'System' as const, description: 'System validates that all category percentages total exactly 100%.' },
  { rule: 'Only one active benchmark per population', enforcement: 'System' as const, description: 'Overlapping benchmarks for same population prevented.' },
  { rule: 'Expired benchmarks archived automatically', enforcement: 'System' as const, description: 'Benchmarks past expiry date move to archive status.' },
  { rule: 'Benchmark compliance reported in calibration', enforcement: 'System' as const, description: 'Calibration sessions show actual vs. target distribution.' },
  { rule: 'Annual benchmark review recommended', enforcement: 'Policy' as const, description: 'Review and refresh benchmarks annually based on organizational changes.' },
  { rule: 'Manager benchmark guidance not mandatory', enforcement: 'Advisory' as const, description: 'Benchmarks should guide, not rigidly constrain, manager judgment.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Distribution consistently exceeds benchmark',
    cause: 'Rating inflation or unrealistic targets.',
    solution: 'Review historical distribution data. Consider whether benchmark is realistic. Use calibration to align ratings.'
  },
  {
    issue: 'Benchmark not appearing in calibration',
    cause: 'Benchmark inactive or population scope mismatch.',
    solution: 'Verify benchmark is active and effective date has passed. Check that calibration population matches benchmark scope.'
  },
  {
    issue: 'Conflicting benchmarks warning',
    cause: 'Multiple benchmarks with overlapping populations.',
    solution: 'Review active benchmarks and ensure populations are mutually exclusive or deactivate conflicting benchmarks.'
  },
  {
    issue: 'External benchmark data outdated',
    cause: 'Benchmark source not updated.',
    solution: 'Contact benchmark vendor for latest data. Update benchmark values or set expiry date on outdated data.'
  }
];

export function SetupBenchmarks() {
  return (
    <Card id="sec-2-14">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.14</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">External Benchmarks Configuration</CardTitle>
        <CardDescription>
          Configure performance distribution benchmarks for calibration guidance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Benchmarks']} />

        <LearningObjectives
          objectives={[
            'Understand purpose of performance distribution benchmarks',
            'Configure target distributions for calibration guidance',
            'Set population-specific benchmarks when needed',
            'Balance benchmark enforcement with manager discretion'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Performance categories configured (Section 2.7)',
            'Calibration process defined',
            'Decision on distribution philosophy (forced vs. guided)'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Are Performance Benchmarks?</h4>
          <p className="text-muted-foreground">
            Performance benchmarks define target distributions for ratings across the organization. 
            They provide guidance during calibration to prevent rating inflation and ensure 
            meaningful differentiation. Benchmarks can be based on internal historical data, 
            external survey data, or industry standards. The goal is balanced distribution 
            that rewards top performers while accurately identifying development needs.
          </p>
        </div>

        <div className="p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Distribution Philosophy</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Forced Distribution:</strong> Strict adherence to percentages (controversial). 
                <strong>Guided Distribution:</strong> Targets as guidelines with manager discretion (recommended). 
                Most modern organizations use guided distribution to balance fairness with flexibility.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.14.1: Benchmark configuration with target distribution chart"
          alt="Benchmarks setup page"
        />

        <StepByStep steps={STEPS} title="Configuring Performance Benchmarks: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

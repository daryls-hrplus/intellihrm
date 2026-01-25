import { LearningObjectives } from '../../components/LearningObjectives';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { ConfigurationExample, ExampleConfig } from '../../components/ConfigurationExample';
import { TroubleshootingSection, TroubleshootingItem } from '../../components/TroubleshootingSection';
import { Settings, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const learningObjectives = [
  'Configure cycle-level anonymity thresholds (3-10 range)',
  'Set visibility rules for different report audiences',
  'Understand the impact of threshold changes on existing cycles',
  'Apply organization-specific threshold policies'
];

const thresholdFields: FieldDefinition[] = [
  {
    name: 'anonymity_threshold',
    required: true,
    type: 'integer',
    description: 'Minimum raters required per category before breakdown is shown',
    defaultValue: '3',
    validation: 'Range: 2-10; Recommended: 3-5'
  },
  {
    name: 'show_category_breakdown',
    required: true,
    type: 'boolean',
    description: 'Enable/disable category-level score display',
    defaultValue: 'true',
    validation: 'Boolean'
  },
  {
    name: 'show_individual_comments',
    required: true,
    type: 'boolean',
    description: 'Display individual text responses (anonymized)',
    defaultValue: 'true',
    validation: 'Boolean'
  },
  {
    name: 'results_visibility_rules',
    required: false,
    type: 'JSONB',
    description: 'Custom visibility rules per rater category',
    defaultValue: 'null',
    validation: 'JSON: {"peer": {"min_count": 5}, "direct_report": {"min_count": 4}}'
  }
];

const configurationSteps: Step[] = [
  {
    title: 'Navigate to Cycle Settings',
    description: 'Access the 360 feedback cycle configuration page.',
    substeps: [
      'Go to Performance → 360 Feedback → Manage Cycles',
      'Select the cycle to configure (Draft status required)',
      'Click "Settings" tab or the gear icon'
    ],
    expectedResult: 'Cycle settings panel opens with anonymity configuration section'
  },
  {
    title: 'Set Anonymity Threshold',
    description: 'Configure the minimum rater count for category breakdown.',
    substeps: [
      'Locate "Anonymity Threshold" field',
      'Enter value between 3-10 (industry standard: 3)',
      'Consider organization size: smaller teams may need higher thresholds'
    ],
    expectedResult: 'Threshold value saved; validation confirms acceptable range'
  },
  {
    title: 'Configure Visibility Options',
    description: 'Set category breakdown and comment display preferences.',
    substeps: [
      'Toggle "Show Category Breakdown" as needed',
      'Toggle "Show Individual Comments" for text responses',
      'Review impact on report layout'
    ],
    expectedResult: 'Visibility settings applied to cycle'
  },
  {
    title: 'Set Category-Specific Overrides (Optional)',
    description: 'Apply custom thresholds for specific rater categories.',
    substeps: [
      'Click "Advanced Settings" to expand options',
      'Add category-specific thresholds if needed (e.g., Direct Reports: 4)',
      'Save and review the JSON configuration'
    ],
    expectedResult: 'Custom visibility rules saved in results_visibility_rules field'
  },
  {
    title: 'Validate and Save',
    description: 'Confirm settings and save the cycle configuration.',
    substeps: [
      'Review all anonymity settings in the summary panel',
      'Click "Save Changes"',
      'System validates no conflicts with existing responses'
    ],
    expectedResult: 'Settings saved; cycle ready for launch'
  }
];

const configurationExamples: ExampleConfig[] = [
  {
    title: 'Small Team Configuration',
    context: 'Organization with teams of 5-10 members where individual identification is a concern',
    values: [
      { field: 'anonymity_threshold', value: '5' },
      { field: 'show_category_breakdown', value: 'true' },
      { field: 'show_individual_comments', value: 'false' }
    ],
    outcome: 'Higher threshold protects smaller teams; comments hidden to prevent writing style identification'
  },
  {
    title: 'Large Enterprise Configuration',
    context: 'Enterprise with departments of 50+ where statistical anonymity is inherent',
    values: [
      { field: 'anonymity_threshold', value: '3' },
      { field: 'show_category_breakdown', value: 'true' },
      { field: 'show_individual_comments', value: 'true' }
    ],
    outcome: 'Standard threshold with full visibility; large group size provides natural anonymity'
  },
  {
    title: 'Executive Assessment Configuration',
    context: 'Senior leadership with limited direct reports requiring enhanced protection',
    values: [
      { field: 'anonymity_threshold', value: '4' },
      { field: 'results_visibility_rules', value: '{"direct_report": {"min_count": 5, "aggregate_if_below": true}}' }
    ],
    outcome: 'Elevated direct report threshold; below-threshold responses aggregated into "Others"'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Category breakdown not appearing despite sufficient raters',
    cause: 'show_category_breakdown is set to false, or results_visibility_rules has a higher threshold for that category',
    solution: 'Check both the global setting and any category-specific overrides in results_visibility_rules. Ensure show_category_breakdown is true and thresholds are met.'
  },
  {
    issue: 'All anonymous categories showing as "Combined" in reports',
    cause: 'Total anonymous raters across all categories is below the threshold',
    solution: 'This is expected behavior when the combined anonymous pool is small. Consider lowering threshold or accepting aggregate-only view for privacy protection.'
  },
  {
    issue: 'Cannot change threshold on active cycle',
    cause: 'System prevents threshold changes once responses have been collected',
    solution: 'Threshold changes are locked after first response to maintain data integrity. For future cycles, set thresholds before launch. If critical, clone cycle and migrate participants.'
  },
  {
    issue: 'Custom visibility rules not being applied',
    cause: 'JSON syntax error in results_visibility_rules or field not saved properly',
    solution: 'Validate JSON syntax using a JSON validator. Ensure proper structure: {"category_name": {"min_count": N}}. Check database for actual stored value.'
  }
];

export function GovernanceThresholdConfiguration() {
  return (
    <section id="sec-4-2" data-manual-anchor="sec-4-2" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          4.2 Threshold Configuration
        </h3>
        <p className="text-muted-foreground mt-2">
          Configure minimum rater counts, bypass conditions, and visibility rules to balance feedback utility with privacy protection.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Critical Configuration</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Changing anonymity thresholds after a cycle has collected responses is <strong>not recommended</strong> and 
          may be blocked by the system. Set thresholds during cycle creation before any feedback is submitted.
        </AlertDescription>
      </Alert>

      <StepByStep 
        steps={configurationSteps} 
        title="Step-by-Step: Configure Anonymity Threshold" 
      />

      <FieldReferenceTable 
        fields={thresholdFields} 
        title="Threshold Configuration Fields" 
      />

      <ConfigurationExample 
        examples={configurationExamples} 
        title="Organization-Specific Configurations" 
      />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Threshold Configuration Issues" 
      />
    </section>
  );
}

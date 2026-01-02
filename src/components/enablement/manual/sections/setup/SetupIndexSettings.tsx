import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Calculator, TrendingUp } from 'lucide-react';
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
  { name: 'Index Name', required: true, type: 'Text', description: 'Display name for the performance index', defaultValue: '—', validation: 'Max 50 characters' },
  { name: 'Index Code', required: true, type: 'Text', description: 'Unique identifier for reporting', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Calculation Method', required: true, type: 'Select', description: 'How index is calculated', defaultValue: 'Weighted Average', validation: '—' },
  { name: 'Include Current Cycle', required: true, type: 'Boolean', description: 'Include most recent appraisal', defaultValue: 'true', validation: '—' },
  { name: 'Historical Cycles', required: true, type: 'Number', description: 'Number of past cycles to include', defaultValue: '2', validation: 'Max 5 cycles' },
  { name: 'Current Cycle Weight', required: true, type: 'Number', description: 'Weight for most recent cycle', defaultValue: '50%', validation: 'Sum to 100% with historical' },
  { name: 'Historical Weight Distribution', required: true, type: 'Select', description: 'How historical weight is spread', defaultValue: 'Equal', validation: '—' },
  { name: 'Minimum Cycles Required', required: true, type: 'Number', description: 'Minimum data points for valid index', defaultValue: '1', validation: 'Min 1' },
  { name: 'Handle Missing Data', required: true, type: 'Select', description: 'How to treat employees with fewer cycles', defaultValue: 'Use Available Data', validation: '—' },
  { name: 'Refresh Frequency', required: true, type: 'Select', description: 'When index is recalculated', defaultValue: 'On Cycle Close', validation: '—' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether index is calculated', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Index Settings',
    description: 'Go to Performance → Setup → Appraisals → Index Settings',
    expectedResult: 'Performance Index configuration page displays'
  },
  {
    title: 'Review Default Index',
    description: 'System provides a default Performance Index configuration',
    expectedResult: 'Default index settings visible'
  },
  {
    title: 'Click "Edit Index" or "Create Custom Index"',
    description: 'Modify existing or create new performance index',
    expectedResult: 'Index configuration form opens'
  },
  {
    title: 'Configure Calculation Method',
    description: 'Select how the index is computed',
    substeps: [
      'Weighted Average: Weight recent cycles more heavily',
      'Simple Average: Equal weight across all cycles',
      'Latest Only: Use only most recent score',
      'Trend Adjusted: Factor in improvement/decline'
    ],
    expectedResult: 'Calculation method selected'
  },
  {
    title: 'Set Cycle Inclusion',
    description: 'Define which cycles contribute to the index',
    substeps: [
      'Toggle current cycle inclusion',
      'Set number of historical cycles (typically 2-3)',
      'Configure weight for current vs. historical'
    ],
    expectedResult: 'Cycle scope defined'
  },
  {
    title: 'Configure Weight Distribution',
    description: 'Set how weights are distributed across cycles',
    substeps: [
      'Equal: All historical cycles weighted equally',
      'Declining: More recent historical cycles weighted higher',
      'Custom: Manual weight assignment per cycle'
    ],
    expectedResult: 'Weight distribution configured'
  },
  {
    title: 'Handle Missing Data',
    description: 'Configure behavior for employees with incomplete history',
    substeps: [
      'Use Available Data: Calculate with what exists',
      'Mark Incomplete: Flag index as provisional',
      'Require Minimum: Only calculate if minimum cycles met'
    ],
    expectedResult: 'Missing data handling configured'
  },
  {
    title: 'Save and Apply',
    description: 'Save index configuration',
    expectedResult: 'Index settings saved and calculation triggered'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Weighted Index',
    context: 'Emphasize recent performance while considering history.',
    values: [
      { field: 'Method', value: 'Weighted Average' },
      { field: 'Current Cycle', value: 'Included (50% weight)' },
      { field: 'Historical', value: '2 cycles (25% each)' },
      { field: 'Missing Data', value: 'Use Available Data' }
    ],
    outcome: 'Balanced index reflecting both current and historical performance.'
  },
  {
    title: 'Recent Performance Focus',
    context: 'Organizations prioritizing most recent evaluation.',
    values: [
      { field: 'Method', value: 'Weighted Average' },
      { field: 'Current Cycle', value: 'Included (70% weight)' },
      { field: 'Historical', value: '1 cycle (30% weight)' },
      { field: 'Missing Data', value: 'Use Available Data' }
    ],
    outcome: 'Index heavily weighted toward most recent performance.'
  },
  {
    title: 'Trend-Adjusted Index',
    context: 'Recognize improvement trajectory alongside absolute scores.',
    values: [
      { field: 'Method', value: 'Trend Adjusted' },
      { field: 'Current Cycle', value: 'Included' },
      { field: 'Historical', value: '3 cycles' },
      { field: 'Trend Bonus', value: '+0.2 for consistent improvement' }
    ],
    outcome: 'Index rewards sustained improvement over time.'
  }
];

const BUSINESS_RULES = [
  { rule: 'Index recalculates automatically on cycle close', enforcement: 'System' as const, description: 'Performance Index updates when appraisal cycles complete.' },
  { rule: 'Weights must sum to 100%', enforcement: 'System' as const, description: 'Current and historical weights must total exactly 100%.' },
  { rule: 'Minimum one cycle required for calculation', enforcement: 'System' as const, description: 'Index cannot be calculated without at least one completed evaluation.' },
  { rule: 'Index changes apply prospectively', enforcement: 'Policy' as const, description: 'Configuration changes affect future calculations, not historical values.' },
  { rule: 'Consider probationary period in index', enforcement: 'Advisory' as const, description: 'Decide whether probationary reviews should count toward the index.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Index not calculating for some employees',
    cause: 'Employees do not meet minimum cycle requirement.',
    solution: 'Reduce minimum cycles required or configure missing data handling to use available data.'
  },
  {
    issue: 'Index value seems incorrect',
    cause: 'Weight configuration or historical data issue.',
    solution: 'Verify weight distribution sums to 100%. Check that correct historical cycles are included. Review individual score data.'
  },
  {
    issue: 'Index not updating after cycle close',
    cause: 'Refresh trigger not configured or job failure.',
    solution: 'Verify refresh frequency setting. Check scheduled job logs for errors. Manually trigger recalculation if needed.'
  },
  {
    issue: 'Different index values in different reports',
    cause: 'Reports running at different times or using cached data.',
    solution: 'Ensure all reports reference the same index calculation. Clear report cache after index updates.'
  }
];

export function SetupIndexSettings() {
  return (
    <Card id="sec-2-13">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.13</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~10 min read
          </Badge>
          <Badge variant="secondary">Recommended</Badge>
        </div>
        <CardTitle className="text-2xl">Performance Index Settings</CardTitle>
        <CardDescription>
          Configure how multi-cycle performance indices are calculated for talent decisions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Appraisals', 'Index Settings']} />

        <LearningObjectives
          objectives={[
            'Understand performance index purpose and calculation methods',
            'Configure cycle weighting for balanced indices',
            'Handle employees with incomplete performance history',
            'Align index settings with talent management strategy'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'At least one appraisal cycle configured',
            'Understanding of organizational talent philosophy',
            'Decision on historical data weighting approach'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2">What Is the Performance Index?</h4>
          <p className="text-muted-foreground">
            The Performance Index is a calculated score that aggregates performance across multiple 
            evaluation cycles to provide a more stable, trend-aware view of employee performance. 
            Rather than relying solely on a single review, the index considers historical performance 
            with configurable weighting. This supports better talent decisions by smoothing out 
            single-cycle anomalies and recognizing consistent performers.
          </p>
        </div>

        <div className="p-4 bg-cyan-100 dark:bg-cyan-900/30 border border-cyan-300 dark:border-cyan-700 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground">Index Use Cases</h4>
              <p className="text-sm text-muted-foreground">
                Performance Index is commonly used for: succession planning eligibility, merit increase 
                guidelines, talent pool segmentation, and identifying consistent high/low performers 
                across review cycles.
              </p>
            </div>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 2.13.1: Performance Index settings with calculation preview"
          alt="Performance Index configuration page"
        />

        <StepByStep steps={STEPS} title="Configuring the Performance Index: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

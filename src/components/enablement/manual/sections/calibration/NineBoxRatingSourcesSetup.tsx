import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Users, Clock, CheckCircle, Settings, BarChart3, Target, Gauge, Layers, ArrowUpDown } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../components/StepByStep';

const BUSINESS_RULES = [
  { rule: 'Performance axis requires at least one source', enforcement: 'System' as const, description: 'Nine-Box cannot calculate without a performance data source.' },
  { rule: 'Potential axis requires at least one source', enforcement: 'System' as const, description: 'Nine-Box cannot calculate without a potential data source.' },
  { rule: 'Source weights within each axis must sum to 100%', enforcement: 'System' as const, description: 'Weighted sources must total exactly 100% per axis.' },
  { rule: 'Signal mappings require threshold configuration', enforcement: 'System' as const, description: 'Each signal must define low/medium/high thresholds.' }
];

const RATING_SOURCE_FIELDS: FieldDefinition[] = [
  { name: 'source_name', required: true, type: 'text', description: 'Descriptive name for this data source', validation: 'Max 100 characters' },
  { name: 'axis_type', required: true, type: 'select', description: 'Which axis this source feeds (performance or potential)', validation: 'performance | potential' },
  { name: 'source_type', required: true, type: 'select', description: 'Type of source (appraisal, goals, assessment, manager_input)', defaultValue: 'appraisal' },
  { name: 'weight', required: true, type: 'number', description: 'Percentage weight for this source within its axis', validation: '1-100%' },
  { name: 'data_source_table', required: true, type: 'text', description: 'Database table to pull scores from', validation: 'Valid table name' },
  { name: 'score_field', required: true, type: 'text', description: 'Field containing the numeric score', validation: 'Valid column name' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Whether this source is currently used', defaultValue: 'true' },
  { name: 'priority', required: true, type: 'number', description: 'Order of precedence when multiple sources exist', defaultValue: '1' }
];

const SIGNAL_MAPPING_FIELDS: FieldDefinition[] = [
  { name: 'signal_name', required: true, type: 'text', description: 'Name of the talent signal', validation: 'Max 100 characters' },
  { name: 'signal_category', required: true, type: 'select', description: 'Category of signal (behavioral, performance, engagement)', defaultValue: 'behavioral' },
  { name: 'low_threshold', required: true, type: 'number', description: 'Maximum score for low classification', validation: '0-5' },
  { name: 'medium_threshold', required: true, type: 'number', description: 'Maximum score for medium classification', validation: '0-5' },
  { name: 'high_threshold', required: true, type: 'number', description: 'Minimum score for high classification', validation: '0-5' },
  { name: 'weight_in_potential', required: false, type: 'number', description: 'Contribution to potential score if used', defaultValue: '0%' }
];

const SETUP_STEPS: Step[] = [
  {
    title: 'Access Nine-Box Configuration',
    description: 'Navigate to the rating sources setup area.',
    substeps: [
      'Go to Settings → Performance → Nine-Box Grid',
      'Click "Rating Sources" tab',
      'Review current source configuration or start fresh'
    ],
    expectedResult: 'Rating sources panel displays with Performance and Potential axis sections.'
  },
  {
    title: 'Configure Performance Axis Sources',
    description: 'Define what data determines horizontal (performance) placement.',
    substeps: [
      'In the Performance Axis section, click "Add Source"',
      'Select source type (e.g., "Appraisal Overall Score")',
      'Set the weight (e.g., 70% for appraisal, 30% for goals)',
      'Configure the data mapping (table and field)',
      'Repeat to add additional sources if using composite scoring'
    ],
    expectedResult: 'Performance axis shows configured sources totaling 100% weight.'
  },
  {
    title: 'Configure Potential Axis Sources',
    description: 'Define what data determines vertical (potential) placement.',
    substeps: [
      'In the Potential Axis section, click "Add Source"',
      'Select source type (e.g., "Potential Assessment")',
      'Set the weight (e.g., 60% assessment, 40% manager input)',
      'Configure the data mapping',
      'Add secondary sources like talent signals if applicable'
    ],
    expectedResult: 'Potential axis shows configured sources totaling 100% weight.'
  },
  {
    title: 'Define Signal Mappings (Optional)',
    description: 'Map additional talent signals to potential scoring.',
    substeps: [
      'Click "Signal Mappings" sub-tab',
      'Add signals like "Learning Velocity" or "Leadership Readiness"',
      'Set threshold values for low/medium/high classification',
      'Assign weights if signals contribute to potential score',
      'Enable/disable individual signals as needed'
    ],
    expectedResult: 'Signal mappings display with threshold configurations.'
  },
  {
    title: 'Set Priority and Fallbacks',
    description: 'Configure handling when data sources are missing.',
    substeps: [
      'Set priority order for each axis (which source takes precedence)',
      'Configure fallback behavior (use secondary source, show warning, exclude from grid)',
      'Enable "Require all sources" if strict data completeness is needed',
      'Save configuration'
    ],
    expectedResult: 'Priority and fallback rules saved; system ready to calculate Nine-Box positions.'
  }
];

export function NineBoxRatingSourcesSetup() {
  return (
    <Card id="sec-4-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.4</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Nine-Box Rating Sources Setup</CardTitle>
        <CardDescription>Configure what data feeds into performance and potential axes of the Nine-Box grid</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-4'] || ['Appraisals Manual', 'Chapter 4: Calibration Sessions', 'Nine-Box Rating Sources Setup']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how Nine-Box axes are calculated from data sources</li>
            <li>Configure performance axis data sources and weights</li>
            <li>Configure potential axis data sources and weights</li>
            <li>Set up talent signal mappings for enhanced potential scoring</li>
          </ul>
        </div>

        {/* Understanding the Two Axes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Understanding the Two Axes
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Performance Axis (Horizontal)</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Measures what the employee has accomplished—their track record of results.
                </p>
                <div className="text-sm space-y-1">
                  <p><strong>Common Sources:</strong></p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Appraisal overall rating score</li>
                    <li>Goal achievement percentage</li>
                    <li>Competency average score</li>
                    <li>KRA/KPI achievement metrics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Potential Axis (Vertical)</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Predicts what the employee could achieve—their capacity for growth.
                </p>
                <div className="text-sm space-y-1">
                  <p><strong>Common Sources:</strong></p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>Potential assessment score</li>
                    <li>Manager potential rating (1-5)</li>
                    <li>Learning agility signals</li>
                    <li>Leadership readiness indicators</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How Composite Scoring Works */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            How Composite Scoring Works
          </h3>
          <p className="text-muted-foreground">
            Each axis can combine multiple data sources using weighted averages. This provides 
            a more holistic view than relying on a single metric.
          </p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Example: Performance Axis Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <span>Appraisal Overall Score</span>
                <Badge>60%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <span>Goal Achievement Rate</span>
                <Badge>30%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <span>Competency Average</span>
                <Badge>10%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary/10 rounded font-medium">
                <span>Total</span>
                <Badge variant="outline">100%</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Final Performance = (Appraisal × 0.6) + (Goals × 0.3) + (Competency × 0.1)
            </p>
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">nine_box_rating_sources</Badge>
              <span className="text-sm text-muted-foreground">Source configuration for each axis</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">nine_box_signal_mappings</Badge>
              <span className="text-sm text-muted-foreground">Talent signal threshold definitions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">nine_box_assessments</Badge>
              <span className="text-sm text-muted-foreground">Calculated positions per employee</span>
            </div>
          </div>
        </div>

        <StepByStep steps={SETUP_STEPS} title="Step-by-Step: Configure Rating Sources" />

        {/* Priority and Fallback Behavior */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Priority and Fallback Behavior
          </h3>
          <p className="text-muted-foreground">
            When an employee is missing data from one source, the system can handle it in several ways:
          </p>
          <div className="space-y-2">
            {[
              { option: 'Use Next Priority Source', description: 'Calculate using the next highest-priority source that has data', risk: 'May produce inconsistent comparisons' },
              { option: 'Redistribute Weights', description: 'Spread missing source weight across remaining sources', risk: 'Changes effective weighting per employee' },
              { option: 'Exclude from Grid', description: 'Do not place employee on Nine-Box until data is complete', risk: 'May miss employees in calibration' },
              { option: 'Show Warning Badge', description: 'Calculate with available data but flag as incomplete', risk: 'Requires manual review during calibration' }
            ].map((item) => (
              <div key={item.option} className="p-3 border rounded-lg">
                <h4 className="font-medium">{item.option}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Risk: {item.risk}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={RATING_SOURCE_FIELDS} title="Rating Source Fields Reference" />
        <FieldReferenceTable fields={SIGNAL_MAPPING_FIELDS} title="Signal Mapping Fields Reference" />

        <TipCallout title="Best Practice">
          Start with simple single-source configuration (appraisal score for performance, 
          potential assessment for potential). Add composite sources only after validating 
          that the primary sources produce meaningful Nine-Box distributions.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Different source combinations can dramatically change Nine-Box placements. 
          Test any configuration changes with historical data before applying to active calibration.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}

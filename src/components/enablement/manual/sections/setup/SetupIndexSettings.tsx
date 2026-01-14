import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calculator, TrendingUp, User, Target, DollarSign, Users, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, AlertTriangle } from 'lucide-react';
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
import { InfoCallout, TipCallout } from '../../components/Callout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const FIELD_DEFINITIONS = [
  { name: 'Index Name', required: true, type: 'Text', description: 'Display name for the performance index', defaultValue: '—', validation: 'Max 50 characters' },
  { name: 'Index Code', required: true, type: 'Text', description: 'Unique identifier for reporting', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Calculation Method', required: true, type: 'Select', description: 'How index is calculated', defaultValue: 'Weighted Average', validation: '—' },
  { name: 'Include Current Cycle', required: true, type: 'Boolean', description: 'Include most recent appraisal', defaultValue: 'true', validation: '—' },
  { name: 'Historical Cycles', required: true, type: 'Number', description: 'Number of past cycles to include', defaultValue: '2', validation: 'Max 5 cycles' },
  { name: 'Current Cycle Weight', required: true, type: 'Number', description: 'Weight for most recent cycle', defaultValue: '50%', validation: 'Sum to 100% with historical' },
  { name: 'Historical Weight Distribution', required: true, type: 'Select', description: 'How historical weight is spread', defaultValue: 'Equal', validation: '—' },
  { name: 'Minimum Cycles Required', required: true, type: 'Number', description: 'Minimum completed cycles (Annual, Mid-Year, Quarterly each count as one) before index is calculated', defaultValue: '1', validation: 'Min 1' },
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

// Employee Case Study Component
function EmployeeCaseStudy() {
  return (
    <div className="space-y-6 my-8">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Worked Example: Performance Index Calculation</h3>
      </div>

      {/* Employee Profile Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Sarah Chen</CardTitle>
              <CardDescription>Senior Software Engineer · Engineering Department</CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">3.5 years tenure</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h4 className="text-sm font-medium mb-3">Appraisal History (Last 24 Months)</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cycle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Type Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">2023 Annual Review</TableCell>
                <TableCell><Badge variant="outline">Annual</Badge></TableCell>
                <TableCell>Dec 2023</TableCell>
                <TableCell>82%</TableCell>
                <TableCell className="text-muted-foreground">1.0×</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">2024 Mid-Year Review</TableCell>
                <TableCell><Badge variant="outline">Mid-Year</Badge></TableCell>
                <TableCell>Jun 2024</TableCell>
                <TableCell>78%</TableCell>
                <TableCell className="text-muted-foreground">0.5×</TableCell>
              </TableRow>
              <TableRow className="bg-primary/5">
                <TableCell className="font-medium">2024 Annual Review</TableCell>
                <TableCell><Badge variant="default">Annual</Badge></TableCell>
                <TableCell>Dec 2024</TableCell>
                <TableCell className="font-semibold">88%</TableCell>
                <TableCell className="text-muted-foreground">1.0×</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Calculation Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Index Calculation Breakdown
          </CardTitle>
          <CardDescription>
            Using configuration: 50% current cycle, 25% each historical cycle, with cycle type weights applied
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Cycle</TableHead>
                  <TableHead className="text-center">Raw Score</TableHead>
                  <TableHead className="text-center">Type Weight</TableHead>
                  <TableHead className="text-center">Time Weight</TableHead>
                  <TableHead className="text-center">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2024 Annual (Current)</TableCell>
                  <TableCell className="text-center">88%</TableCell>
                  <TableCell className="text-center">1.0×</TableCell>
                  <TableCell className="text-center">50%</TableCell>
                  <TableCell className="text-center font-medium">44.0</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024 Mid-Year</TableCell>
                  <TableCell className="text-center">78%</TableCell>
                  <TableCell className="text-center">0.5×</TableCell>
                  <TableCell className="text-center">25%</TableCell>
                  <TableCell className="text-center font-medium">9.75</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2023 Annual</TableCell>
                  <TableCell className="text-center">82%</TableCell>
                  <TableCell className="text-center">1.0×</TableCell>
                  <TableCell className="text-center">25%</TableCell>
                  <TableCell className="text-center font-medium">20.5</TableCell>
                </TableRow>
                <TableRow className="bg-primary/5 font-semibold">
                  <TableCell colSpan={4}>Raw Weighted Total</TableCell>
                  <TableCell className="text-center">74.25</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">Normalization (adjusting for type weights):</p>
            <p className="text-sm text-muted-foreground">
              Sum of applied weights: (1.0 × 50%) + (0.5 × 25%) + (1.0 × 25%) = 0.875
            </p>
            <p className="text-sm text-muted-foreground">
              Normalized Index: 74.25 ÷ 0.875 = <span className="font-semibold text-foreground">84.9%</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 p-4 bg-primary/5 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Performance Index</p>
              <p className="text-3xl font-bold text-primary">84.9%</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Most Recent Score</p>
              <p className="text-3xl font-bold">88%</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Trend</p>
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="h-5 w-5" />
                <span className="text-lg font-semibold">Improving</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Index vs Most Recent Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Understanding Index vs. Latest Score</CardTitle>
          <CardDescription>
            Different metrics serve different decision-making needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Sarah's Value</TableHead>
                <TableHead>What It Measures</TableHead>
                <TableHead>Best Used For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Most Recent Score</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">88%</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">Single cycle performance</TableCell>
                <TableCell>Annual bonuses, immediate recognition</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Performance Index</TableCell>
                <TableCell>
                  <Badge variant="default" className="font-mono">84.9%</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">Weighted multi-cycle average</TableCell>
                <TableCell>Succession planning, promotions, long-term potential</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Trend Direction</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>Improving</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">Score trajectory over time</TableCell>
                <TableCell>Identifying rising talent, development ROI</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Consistency Rating</TableCell>
                <TableCell>
                  <Badge variant="outline">Consistent</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">Score variance across cycles</TableCell>
                <TableCell>Risk assessment for critical roles</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground">Why Use the Index?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The Index prevents over-reliance on a single exceptional (or poor) review. Consider: an employee 
                  who scored 95% this year after three years of 65% scores would have a lower Index than their 
                  recent score suggests—signaling the improvement may need validation before a major promotion.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talent Decision Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            How the Index Drives Talent Decisions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Succession Planning */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Succession Planning</h4>
            </div>
            <div className="pl-6 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Eligibility threshold: Index ≥ 75% required for successor pool</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Sarah's Index (84.9%) + Improving trend = <strong>Qualified for successor pool</strong></span>
              </div>
              <p className="text-sm text-muted-foreground">
                Combined with competency assessments and development plan completion, her Succession 
                Readiness Score calculates to approximately 82%.
              </p>
            </div>
          </div>

          {/* Promotion Consideration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Promotion Consideration</h4>
            </div>
            <div className="pl-6">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Immediate Promotion</TableCell>
                    <TableCell>Recent score (88%) meets threshold</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Eligible</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fast-Track Program</TableCell>
                    <TableCell>Index (84.9%) + Improving trend</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Strong Candidate</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Risk Indicator</TableCell>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      A declining trend would flag for review even with a high recent score
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Compensation Guidelines */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h4 className="font-medium">Compensation Guidelines</h4>
            </div>
            <div className="pl-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Index Band</TableHead>
                    <TableHead>Merit Increase Range</TableHead>
                    <TableHead>Sarah's Eligibility</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>90%+</TableCell>
                    <TableCell>5–7%</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="font-medium">80–89%</TableCell>
                    <TableCell className="font-medium">3–5%</TableCell>
                    <TableCell>
                      <Badge variant="default">Sarah qualifies (84.9%)</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>70–79%</TableCell>
                    <TableCell>2–3%</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Below 70%</TableCell>
                    <TableCell>0–2%</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference: When to Use Which Metric */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Reference: When to Use Which Metric</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Decision Type</TableHead>
                <TableHead>Recommended Metric</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Annual bonus</TableCell>
                <TableCell>Most Recent Score</TableCell>
                <TableCell className="text-muted-foreground">Rewards current year contribution</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Promotion decision</TableCell>
                <TableCell>Both (Index + Recent)</TableCell>
                <TableCell className="text-muted-foreground">Balanced capability assessment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Succession pool eligibility</TableCell>
                <TableCell>Index + Trend</TableCell>
                <TableCell className="text-muted-foreground">Identifies sustained high performers</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Performance improvement plan</TableCell>
                <TableCell>Index (if declining)</TableCell>
                <TableCell className="text-muted-foreground">Confirms pattern vs. one-off issue</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Fast-track / high-potential</TableCell>
                <TableCell>Index + Trend + Consistency</TableCell>
                <TableCell className="text-muted-foreground">Predicts sustained future contribution</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Critical role assignment</TableCell>
                <TableCell>Index + Consistency</TableCell>
                <TableCell className="text-muted-foreground">Ensures reliable, proven performer</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

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

        <div className="p-4 border-l-4 border-l-cyan-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Index Use Cases</h4>
              <p className="text-sm text-foreground">
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

        <InfoCallout title="How Cycles Are Counted">
          Each completed appraisal cycle instance counts separately toward the minimum requirement. 
          For example, if an employee completes 1 Annual Review, 1 Mid-Year Review, and 2 Quarterly Reviews, 
          that equals <strong>4 cycles</strong> total. While different cycle types may have different weights 
          in the index calculation (e.g., Annual: 1.0, Mid-Year: 0.5, Quarterly: 0.25), each counts as one 
          cycle toward meeting the minimum requirement.
        </InfoCallout>

        <EmployeeCaseStudy />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

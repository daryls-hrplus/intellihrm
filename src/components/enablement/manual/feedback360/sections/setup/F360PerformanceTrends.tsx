import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { PrerequisiteAlert } from '@/components/enablement/manual/components/PrerequisiteAlert';
import { Callout, TipCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';
import { 
  TrendingUp, 
  BarChart3,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Settings,
  LineChart
} from 'lucide-react';

export function F360PerformanceTrends() {
  const indexConfigFields: FieldDefinition[] = [
    {
      name: 'include_360_feedback',
      required: true,
      type: 'Boolean',
      description: 'Whether 360 scores contribute to Performance Index',
      defaultValue: 'true',
      validation: '—',
    },
    {
      name: 'feedback_360_weight',
      required: false,
      type: 'Number',
      description: 'Weight of 360 component in overall index (0-100)',
      defaultValue: '20',
      validation: 'Total weights must equal 100',
    },
    {
      name: 'use_latest_cycle_only',
      required: true,
      type: 'Boolean',
      description: 'Use only most recent cycle vs rolling average',
      defaultValue: 'true',
      validation: '—',
    },
    {
      name: 'rolling_period_months',
      required: false,
      type: 'Number',
      description: 'Months to include in rolling average if not using latest only',
      defaultValue: '12',
      validation: 'Range: 6-36',
    },
    {
      name: 'minimum_responses_required',
      required: true,
      type: 'Number',
      description: 'Minimum number of rater responses to include in index',
      defaultValue: '3',
      validation: 'Range: 1-10',
    },
    {
      name: 'exclude_self_rating',
      required: true,
      type: 'Boolean',
      description: 'Exclude self-ratings from performance index calculation',
      defaultValue: 'true',
      validation: '—',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        2.13 Performance Trends & Index Configuration
      </h3>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand how 360 feedback contributes to the Performance Index',
          'Configure weight and inclusion rules for 360 data in trending',
          'Set up period-over-period comparison for 360 cycles',
          'Interpret 360 contribution in talent dashboards and reports',
        ]}
      />

      {/* Prerequisites */}
      <PrerequisiteAlert
        items={[
          'Core Framework → Performance Trends tab accessed (Performance → Setup → Core Framework → Performance Trends)',
          'At least one completed 360 cycle with responses',
          'Performance Index enabled for the company',
        ]}
      />

      {/* Navigation Path */}
      <Callout variant="info" title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Setup → Core Framework → Performance Trends
        </code>
      </Callout>

      {/* Performance Index Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            360 Feedback in Performance Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The Performance Index is a composite score combining multiple data sources. 
            360 feedback can be configured as one of the contributing components:
          </p>
          <div className="p-4 rounded-lg bg-muted/50 border font-mono text-xs overflow-x-auto">
            <pre>{`
┌────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE INDEX FORMULA                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   Performance Index = (Appraisal Score × Appraisal Weight)    │
│                     + (360 Score × 360 Weight)                 │
│                     + (Goal Achievement × Goal Weight)         │
│                     + (Continuous Feedback × CF Weight)        │
│                                                                │
│   Example with default weights:                                │
│   PI = (4.2 × 0.40) + (3.8 × 0.20) + (92% × 0.30) + (4.0 × 0.10) │
│   PI = 1.68 + 0.76 + 0.276 + 0.40 = 3.12 (normalized to 4.0)   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Default Weight Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Default Weight Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-blue-500/5 text-center">
              <p className="text-3xl font-bold text-blue-600">40%</p>
              <p className="text-sm font-medium">Appraisals</p>
              <p className="text-xs text-muted-foreground">Manager evaluation</p>
            </div>
            <div className="p-4 rounded-lg border bg-violet-500/5 text-center">
              <p className="text-3xl font-bold text-violet-600">20%</p>
              <p className="text-sm font-medium">360 Feedback</p>
              <p className="text-xs text-muted-foreground">Multi-rater scores</p>
            </div>
            <div className="p-4 rounded-lg border bg-emerald-500/5 text-center">
              <p className="text-3xl font-bold text-emerald-600">30%</p>
              <p className="text-sm font-medium">Goal Achievement</p>
              <p className="text-xs text-muted-foreground">Objectives met</p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/5 text-center">
              <p className="text-3xl font-bold text-amber-600">10%</p>
              <p className="text-sm font-medium">Continuous Feedback</p>
              <p className="text-xs text-muted-foreground">Ongoing ratings</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Weights are configurable per company. Total must equal 100%.
          </p>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <FieldReferenceTable
        title="360 Index Configuration Fields"
        fields={indexConfigFields}
      />

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Configuring 360 Weight in Performance Index</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">1</span>
              <div>
                <p className="font-medium">Navigate to Performance Trends Configuration</p>
                <p className="text-sm text-muted-foreground">Performance → Setup → Core Framework → Performance Trends</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">2</span>
              <div>
                <p className="font-medium">Locate "Performance Index Weights" Panel</p>
                <p className="text-sm text-muted-foreground">Shows current weight distribution across all components</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">3</span>
              <div>
                <p className="font-medium">Enable "Include 360 Feedback" Toggle</p>
                <p className="text-sm text-muted-foreground">If disabled, 360 scores are excluded from index calculation</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">4</span>
              <div>
                <p className="font-medium">Adjust 360 Weight Slider</p>
                <p className="text-sm text-muted-foreground">
                  Set the percentage weight. Other components will auto-adjust to maintain 100% total.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">5</span>
              <div>
                <p className="font-medium">Configure Data Source Options</p>
                <p className="text-sm text-muted-foreground">
                  Choose: Latest cycle only, or rolling average over specified months.
                  Set minimum response threshold.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">6</span>
              <div>
                <p className="font-medium">Preview Impact</p>
                <p className="text-sm text-muted-foreground">
                  Click "Preview" to see how current employee index scores would change with new weights.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">7</span>
              <div>
                <p className="font-medium">Save Configuration</p>
                <p className="text-sm text-muted-foreground">
                  Changes apply to future index calculations. Historical snapshots are preserved.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Trend Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            360 Score Trend Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When multiple 360 cycles exist, the system calculates period-over-period trends:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-sm text-emerald-700">Improving</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current cycle score is ≥0.3 points higher than previous cycle.
                Indicates positive development trajectory.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-slate-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Minus className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-sm text-slate-700">Stable</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current cycle score is within ±0.3 points of previous cycle.
                Indicates consistent performance.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-rose-500/5">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownRight className="h-5 w-5 text-rose-600" />
                <span className="font-semibold text-sm text-rose-700">Declining</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Current cycle score is ≥0.3 points lower than previous cycle.
                May indicate development needs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Where 360 Data Appears */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Where 360 Index Data Appears
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Talent Dashboards</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Performance Index cards show 360 contribution</li>
                <li>• Trend arrows indicate cycle-over-cycle change</li>
                <li>• Drill-down reveals 360 breakdown by competency</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Nine-Box Grid</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 360 scores can contribute to "Performance" axis</li>
                <li>• Configurable in Nine-Box signal mappings</li>
                <li>• See Section 2.9 (Signal Definitions) for setup</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Employee Profile</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Performance tab shows composite index</li>
                <li>• 360 history visible in timeline view</li>
                <li>• Competency radar chart includes 360 data</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Succession Planning</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Readiness scores incorporate 360 feedback</li>
                <li>• Development gaps linked to 360 competencies</li>
                <li>• Talent pool rankings consider 360 trends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices">
        <ul className="text-sm space-y-1">
          <li>• Start with 15-25% weight for 360 feedback in the performance index</li>
          <li>• Require minimum 3 rater responses before including in index</li>
          <li>• Exclude self-ratings from index calculation (they're biased)</li>
          <li>• Use rolling average (12 months) for more stable trending</li>
          <li>• Communicate weight changes to employees before implementation</li>
        </ul>
      </TipCallout>

      {/* Cross-Reference */}
      <InfoCallout title="Cross-Reference">
        <p className="text-sm">
          For signal definitions and Nine-Box integration, see <strong>Section 2.9 (Signal Definitions)</strong>. 
          For general Performance Index setup, see the <strong>Appraisals Manual → Setup → Index Settings</strong>.
        </p>
      </InfoCallout>
    </div>
  );
}

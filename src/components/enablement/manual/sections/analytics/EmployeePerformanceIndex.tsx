import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, TrendingUp, TrendingDown, Minus, BarChart3, Target, User, Activity, Layers, Settings } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, InfoCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldReference } from '../../components/FieldReferenceTable';
import { RelatedTopics } from '../../components';

const INDEX_FIELDS: FieldReference[] = [
  { fieldName: 'employee_id', location: 'employee_performance_index', required: true, description: 'Employee profile ID' },
  { fieldName: 'company_id', location: 'employee_performance_index', required: true, description: 'Company context for multi-tenant filtering' },
  { fieldName: 'rolling_score_12m', location: 'employee_performance_index', required: false, description: '12-month rolling performance score' },
  { fieldName: 'rolling_score_24m', location: 'employee_performance_index', required: false, description: '24-month rolling performance score' },
  { fieldName: 'rolling_score_36m', location: 'employee_performance_index', required: false, description: '36-month rolling performance score' },
  { fieldName: 'goal_component_score', location: 'employee_performance_index', required: false, description: 'Weighted goal achievement contribution' },
  { fieldName: 'competency_component_score', location: 'employee_performance_index', required: false, description: 'Weighted competency rating contribution' },
  { fieldName: 'responsibility_component_score', location: 'employee_performance_index', required: false, description: 'Weighted responsibility/KRA contribution' },
  { fieldName: 'values_component_score', location: 'employee_performance_index', required: false, description: 'Weighted values assessment contribution' },
  { fieldName: 'trend_direction', location: 'employee_performance_index', required: false, description: 'improving, stable, or declining' },
  { fieldName: 'trend_velocity', location: 'employee_performance_index', required: false, description: 'Rate of score change (percentage per cycle)' },
  { fieldName: 'consistency_rating', location: 'employee_performance_index', required: false, description: 'Score stability: high, medium, low' },
  { fieldName: 'promotion_readiness_score', location: 'employee_performance_index', required: false, description: 'Composite readiness for advancement (0-100)' },
  { fieldName: 'succession_readiness_score', location: 'employee_performance_index', required: false, description: 'Readiness for critical role succession' },
  { fieldName: 'skill_gap_closure_rate', location: 'employee_performance_index', required: false, description: 'Percentage of identified gaps closed' },
  { fieldName: 'last_calculated_at', location: 'employee_performance_index', required: true, description: 'Timestamp of last index calculation' }
];

const SETTINGS_FIELDS: FieldReference[] = [
  { fieldName: 'company_id', location: 'performance_index_settings', required: true, description: 'Company-specific configuration' },
  { fieldName: 'goal_weight', location: 'performance_index_settings', required: true, description: 'Weight for goal component (default 35%)' },
  { fieldName: 'competency_weight', location: 'performance_index_settings', required: true, description: 'Weight for competency component (default 30%)' },
  { fieldName: 'responsibility_weight', location: 'performance_index_settings', required: true, description: 'Weight for responsibility component (default 25%)' },
  { fieldName: 'values_weight', location: 'performance_index_settings', required: true, description: 'Weight for values component (default 10%)' },
  { fieldName: 'recency_decay_factor', location: 'performance_index_settings', required: false, description: 'Weight decay for older cycles (0-1)' },
  { fieldName: 'minimum_cycles_for_trend', location: 'performance_index_settings', required: false, description: 'Min cycles required for trend calculation' }
];

const BUSINESS_RULES = [
  { rule: 'Minimum data for index', enforcement: 'System' as const, description: 'Employee must have at least 1 completed appraisal cycle to have a performance index.' },
  { rule: 'Component weights must total 100%', enforcement: 'System' as const, description: 'Goal + Competency + Responsibility + Values weights must sum to 100%.' },
  { rule: 'Rolling scores use recency weighting', enforcement: 'System' as const, description: 'Recent cycles weighted more heavily based on decay factor.' },
  { rule: 'Trend requires 2+ cycles', enforcement: 'System' as const, description: 'Trend direction and velocity require minimum 2 complete cycles.' }
];

export function EmployeePerformanceIndex() {
  return (
    <Card id="sec-6-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.6</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR User / Admin</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Activity className="h-6 w-6 text-green-500" />
          Employee Performance Index
        </CardTitle>
        <CardDescription>
          Composite rolling performance scores and trend analysis for talent decisions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Intelligence Hub', 'Employee Index']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how performance index scores are calculated</li>
            <li>Interpret rolling scores and trend indicators</li>
            <li>Use index data for promotion and succession decisions</li>
            <li>Configure index calculation weights for your organization</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Understanding the Performance Index
          </h3>
          <p className="text-muted-foreground">
            The Employee Performance Index provides a single, composite view of an employee's 
            performance over time. Unlike point-in-time appraisal scores, the index aggregates 
            multiple cycles with recency weighting, showing both current standing and trajectory.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Strategic Value</p>
            <p className="text-sm text-muted-foreground mt-1">
              The performance index enables objective, data-driven talent decisions by 
              normalizing scores across time and highlighting consistent performers versus 
              those with volatile performance patterns.
            </p>
          </div>
        </div>

        {/* Rolling Score Periods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rolling Score Periods</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { period: '12-Month', use: 'Current state', description: 'Best for immediate decisions, promotion eligibility' },
              { period: '24-Month', use: 'Medium-term view', description: 'Ideal for succession planning, development prioritization' },
              { period: '36-Month', use: 'Long-term pattern', description: 'Best for leadership pipeline, consistent performer identification' }
            ].map((item) => (
              <Card key={item.period}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold">{item.period}</h4>
                  <Badge variant="secondary" className="mt-1 text-xs">{item.use}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Component Breakdown
          </h3>
          <p className="text-sm text-muted-foreground">
            The index is composed of four weighted components aligned with the CRGV model:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { component: 'Goals', weight: '35%', color: 'bg-blue-500' },
              { component: 'Competencies', weight: '30%', color: 'bg-green-500' },
              { component: 'Responsibilities', weight: '25%', color: 'bg-amber-500' },
              { component: 'Values', weight: '10%', color: 'bg-purple-500' }
            ].map((item) => (
              <div key={item.component} className="p-3 border rounded-lg text-center">
                <div className={`w-4 h-4 rounded ${item.color} mx-auto mb-2`} />
                <p className="font-medium text-sm">{item.component}</p>
                <p className="text-xs text-muted-foreground">{item.weight}</p>
              </div>
            ))}
          </div>
          <InfoCallout title="Configurable Weights">
            Weights can be adjusted per company in performance_index_settings. Changes 
            apply to future calculations; historical scores are preserved.
          </InfoCallout>
        </div>

        {/* Trend & Consistency */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Trend & Consistency Indicators</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Indicator</th>
                  <th className="text-left p-3 border-b">Values</th>
                  <th className="text-left p-3 border-b">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { indicator: 'Trend Direction', values: 'Improving / Stable / Declining', interpretation: 'Score trajectory over recent cycles' },
                  { indicator: 'Trend Velocity', values: 'Percentage per cycle', interpretation: 'Speed of change (e.g., +5% per cycle)' },
                  { indicator: 'Consistency Rating', values: 'High / Medium / Low', interpretation: 'Score stability across cycles' }
                ].map((row, i) => (
                  <tr key={row.indicator} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.indicator}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.values}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Use Cases */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Using the Performance Index
          </h3>
          <div className="space-y-3">
            {[
              { scenario: 'Promotion Eligibility', use: 'Use 12-month score with "High" consistency as promotion criteria' },
              { scenario: 'Succession Planning', use: 'Use 24-month score with "Improving" trend for succession pool entry' },
              { scenario: 'Development Prioritization', use: 'Focus development investment on "Improving" trend employees' },
              { scenario: 'Performance Discussions', use: 'Reference component breakdown to identify strength/gap areas' }
            ].map((item) => (
              <div key={item.scenario} className="p-3 border rounded-lg">
                <h4 className="font-medium">{item.scenario}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.use}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Avoid Index-Only Decisions">
          The performance index is one input to talent decisions, not the only one. 
          Combine with qualitative assessment, potential evaluation, and career aspirations.
        </TipCallout>

        <FieldReferenceTable 
          fields={INDEX_FIELDS}
          title="Database Fields: employee_performance_index"
        />

        <FieldReferenceTable 
          fields={SETTINGS_FIELDS}
          title="Configuration: performance_index_settings"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-4', title: 'Trend Analysis & Predictions' },
            { sectionId: 'sec-7-2', title: 'Nine-Box & Succession Integration' },
            { sectionId: 'sec-2-4c', title: 'Performance Trend Settings' }
          ]}
        />
      </CardContent>
    </Card>
  );
}

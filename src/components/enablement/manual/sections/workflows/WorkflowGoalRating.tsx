import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, CheckCircle, TrendingUp, AlertTriangle, Scale } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout } from '../../components/Callout';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { ConfigurationExample } from '../../components/ConfigurationExample';

const RATING_STEPS = [
  {
    title: 'Review Goal Definition',
    description: 'Understand what success looks like for this goal.',
    substeps: [
      'Read the goal title and description',
      'Review success criteria and metrics',
      'Check the goal weight in overall assessment',
      'Note the target completion date'
    ],
    expectedResult: 'Clear understanding of goal expectations'
  },
  {
    title: 'Gather Achievement Evidence',
    description: 'Collect data and examples demonstrating progress.',
    substeps: [
      'Review actual metrics vs. targets',
      'Document specific accomplishments',
      'Note any obstacles encountered',
      'Identify contributing factors to success or gaps'
    ],
    expectedResult: 'Objective evidence ready for rating justification'
  },
  {
    title: 'Apply Rating Scale',
    description: 'Select the appropriate achievement level.',
    substeps: [
      'Compare achievement against scale definitions',
      'Consider quality, not just completion',
      'Account for difficulty and context',
      'Select the most accurate rating level'
    ],
    expectedResult: 'Rating selected based on evidence'
  },
  {
    title: 'Document Rating Justification',
    description: 'Write comments explaining your rating decision.',
    substeps: [
      'Reference specific achievements or gaps',
      'Include metrics where available',
      'Acknowledge mitigating circumstances',
      'Provide constructive feedback for improvement'
    ],
    expectedResult: 'Clear, evidence-based justification recorded'
  },
  {
    title: 'Handle Partial Achievement',
    description: 'Rate goals that were not fully completed.',
    substeps: [
      'Assess percentage of goal completed',
      'Evaluate quality of completed portion',
      'Consider valid reasons for incomplete status',
      'Rate based on actual achievement, not intent'
    ],
    expectedResult: 'Fair rating for partially completed goals'
  }
];

const FIELDS = [
  { name: 'goal_id', required: true, type: 'UUID', description: 'The goal being rated', validation: 'Must be assigned to participant' },
  { name: 'rating_value', required: true, type: 'Integer', description: 'Numeric rating on the scale', validation: 'Must be within scale range (e.g., 1-5)' },
  { name: 'rating_label', required: false, type: 'String', description: 'Text label for the rating', validation: 'Auto-populated from scale' },
  { name: 'achievement_percentage', required: false, type: 'Integer', description: 'Estimated completion level', validation: '0-100' },
  { name: 'rating_comments', required: true, type: 'Text', description: 'Justification for the rating', validation: 'Minimum 20 characters' },
  { name: 'evidence_summary', required: false, type: 'Text', description: 'Summary of supporting evidence' },
  { name: 'rated_by', required: true, type: 'UUID', description: 'User who submitted the rating' },
  { name: 'rated_at', required: true, type: 'Timestamp', description: 'When rating was submitted' }
];

const BUSINESS_RULES = [
  { rule: 'All assigned goals must be rated', enforcement: 'System' as const, description: 'Cannot complete evaluation without rating every goal.' },
  { rule: 'Comments required for all ratings', enforcement: 'Policy' as const, description: 'Every goal rating must include justification comments.' },
  { rule: 'Extreme ratings require extended comments', enforcement: 'Policy' as const, description: 'Ratings of 1 or 5 trigger minimum 100-character comment requirement.' },
  { rule: 'Evidence encouraged for high ratings', enforcement: 'Advisory' as const, description: 'Exceptional ratings should reference concrete evidence.' },
  { rule: 'Consider goal weight in feedback depth', enforcement: 'Advisory' as const, description: 'Higher-weighted goals warrant more detailed assessment.' }
];

const EXAMPLES = [
  {
    title: 'Exceeded Target - Sales Goal',
    context: 'Sales representative exceeded quarterly revenue target',
    values: [
      { field: 'Goal', value: 'Achieve $500K quarterly revenue' },
      { field: 'Actual Result', value: '$625K (125% of target)' },
      { field: 'Rating', value: '5 - Exceptional' },
      { field: 'Comment', value: 'Exceeded target by 25% through strategic focus on enterprise accounts. Closed 3 deals over $100K each. Demonstrates strong relationship building and consultative selling.' }
    ],
    outcome: 'Clear justification with specific metrics and behavioral evidence'
  },
  {
    title: 'Partial Achievement - Project Delivery',
    context: 'Project manager delivered project late due to scope changes',
    values: [
      { field: 'Goal', value: 'Deliver CRM migration by Q3' },
      { field: 'Actual Result', value: 'Delivered in early Q4 (3 weeks late)' },
      { field: 'Rating', value: '3 - Meets Expectations' },
      { field: 'Comment', value: 'Project delivered 3 weeks late due to client-requested scope expansion (+40% features). Quality metrics exceeded standards. Proactive communication throughout delays.' }
    ],
    outcome: 'Fair rating acknowledging both delays and mitigating factors'
  }
];

const TROUBLESHOOTING = [
  { issue: 'Goal appears with no rating option', cause: 'Goal may be marked as cancelled or transferred to another cycle.', solution: 'Check goal status. Cancelled goals show as N/A and do not require rating.' },
  { issue: 'Disagreement between self and manager rating', cause: 'Different perspectives on achievement or missing information.', solution: 'Both ratings are recorded. Discussion during performance interview should address gaps.' },
  { issue: 'Goal metrics not available', cause: 'Metrics were not tracked or system integration missing.', solution: 'Use qualitative assessment and document limitation. Request metrics setup for future cycles.' }
];

export function WorkflowGoalRating() {
  return (
    <Card id="sec-3-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.5</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-green-600 text-white"><Target className="h-3 w-3" />All Roles</Badge>
        </div>
        <CardTitle className="text-2xl">Goal Rating Process</CardTitle>
        <CardDescription>Evidence-based goal evaluation methodology and rating guidelines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-5']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Apply rating scales consistently to goal achievement</li>
            <li>Document evidence-based rating justifications</li>
            <li>Handle partial achievement and mitigating circumstances</li>
            <li>Understand weight calculations in overall score</li>
          </ul>
        </div>

        {/* Rating Scale Reference */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Typical Goal Rating Scale
          </h3>
          <div className="space-y-2">
            {[
              { rating: 5, label: 'Exceptional', desc: 'Significantly exceeded expectations (>120% of target)', color: 'border-l-green-500' },
              { rating: 4, label: 'Exceeds', desc: 'Exceeded expectations (105-120% of target)', color: 'border-l-blue-500' },
              { rating: 3, label: 'Meets', desc: 'Met expectations (95-105% of target)', color: 'border-l-amber-500' },
              { rating: 2, label: 'Below', desc: 'Partially met expectations (70-94% of target)', color: 'border-l-orange-500' },
              { rating: 1, label: 'Unsatisfactory', desc: 'Did not meet expectations (<70% of target)', color: 'border-l-red-500' }
            ].map((item) => (
              <div key={item.rating} className={`flex items-center gap-4 p-3 bg-muted/50 rounded-lg border-l-4 ${item.color}`}>
                <Badge className="bg-slate-600 text-white">{item.rating}</Badge>
                <span className="font-medium min-w-[100px]">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <NoteCallout title="Scale Customization">
          Your organization may use a different rating scale. Always refer to the scale definitions shown in your evaluation form for accurate ratings.
        </NoteCallout>

        <StepByStep steps={RATING_STEPS} title="Goal Rating Steps" />

        {/* Weight Calculation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Weight Calculation Example
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">If Goals component = 40% of overall score:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Goal 1 (Weight: 40%): Rating 4</span>
                <span>= 1.6 points</span>
              </div>
              <div className="flex justify-between">
                <span>Goal 2 (Weight: 35%): Rating 3</span>
                <span>= 1.05 points</span>
              </div>
              <div className="flex justify-between">
                <span>Goal 3 (Weight: 25%): Rating 5</span>
                <span>= 1.25 points</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Goals Component Score:</span>
                <span>3.90 / 5.00</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Contribution to Overall (40%):</span>
                <span>1.56 points</span>
              </div>
            </div>
          </div>
        </div>

        <TipCallout title="Rating Calibration">
          Avoid "grade inflation" by reserving top ratings for truly exceptional performance. Most employees meeting expectations should receive a 3. This ensures ratings remain meaningful.
        </TipCallout>

        <WarningCallout title="Common Rating Errors">
          Avoid recency bias (focusing on recent events), halo effect (letting one area influence others), and leniency bias (rating everyone high to avoid conflict).
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Goal Rating Fields" />
        <ConfigurationExample examples={EXAMPLES} title="Rating Examples" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

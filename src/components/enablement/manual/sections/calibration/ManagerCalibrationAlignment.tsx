import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock, CheckCircle, BarChart3, AlertTriangle, Target, Brain, BookOpen, ArrowUpDown } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';

const BUSINESS_RULES = [
  { rule: 'Alignment scores calculated after each calibration', enforcement: 'System' as const, description: 'Manager alignment metrics update automatically post-session.' },
  { rule: 'Training recommendations trigger at threshold', enforcement: 'System' as const, description: 'Managers below alignment threshold receive automated development suggestions.' },
  { rule: 'Alignment data retained for 3 years', enforcement: 'Policy' as const, description: 'Historical alignment trends support longitudinal analysis.' },
  { rule: 'HR review required for intervention escalation', enforcement: 'Policy' as const, description: 'Formal intervention plans require HR approval.' }
];

const ALIGNMENT_FIELDS: FieldDefinition[] = [
  { name: 'manager_id', required: true, type: 'uuid', description: 'Reference to the manager profile' },
  { name: 'calibration_session_id', required: true, type: 'uuid', description: 'Reference to the calibration session' },
  { name: 'alignment_score', required: true, type: 'number', description: 'Score from 0-100 indicating rating alignment', validation: '0-100' },
  { name: 'avg_pre_calibration_delta', required: false, type: 'number', description: 'Average difference between manager ratings and final calibrated ratings' },
  { name: 'adjustment_count', required: true, type: 'number', description: 'Number of ratings adjusted for this manager' },
  { name: 'direction_bias', required: false, type: 'select', description: 'Whether manager tends to rate high, low, or neutral', validation: 'high | low | neutral' },
  { name: 'consistency_score', required: false, type: 'number', description: 'How consistent are adjustment patterns over time', validation: '0-100' },
  { name: 'training_recommended', required: true, type: 'boolean', description: 'Whether training has been recommended based on scores', defaultValue: 'false' },
  { name: 'intervention_status', required: false, type: 'select', description: 'Current intervention workflow status', defaultValue: 'none' }
];

export function ManagerCalibrationAlignment() {
  return (
    <Card id="sec-4-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.10</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~7 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin / HRBP</Badge>
        </div>
        <CardTitle className="text-2xl">Manager Calibration Alignment</CardTitle>
        <CardDescription>Track and improve manager rating alignment over time through calibration analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-10'] || ['Appraisals Manual', 'Chapter 4: Calibration Sessions', 'Manager Calibration Alignment']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how manager alignment is calculated and tracked</li>
            <li>Interpret alignment scores and drift patterns</li>
            <li>Configure training recommendation triggers</li>
            <li>Manage intervention workflows for misaligned managers</li>
          </ul>
        </div>

        {/* What is Manager Alignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            What is Manager Calibration Alignment?
          </h3>
          <p className="text-muted-foreground">
            Manager Calibration Alignment measures how closely a manager's initial ratings align 
            with the final calibrated ratings agreed upon by the calibration committee. Managers 
            with high alignment scores rate more consistently with organizational standards, 
            while low alignment may indicate bias patterns requiring attention.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Key Insight</p>
            <p className="text-sm text-muted-foreground mt-1">
              Alignment tracking isn't about punishing managers—it's about identifying coaching 
              opportunities. Consistently misaligned managers often need clearer rating standards 
              or calibration training to evaluate their teams fairly.
            </p>
          </div>
        </div>

        {/* Alignment Metrics Explained */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Alignment Metrics Explained
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { metric: 'Alignment Score', range: '0-100', description: 'Overall measure of how close manager ratings are to calibrated outcomes', interpretation: '80+ = Well aligned, 60-79 = Needs monitoring, <60 = Training recommended' },
              { metric: 'Average Delta', range: '-2 to +2', description: 'Mean difference between manager ratings and final ratings', interpretation: 'Positive = tends to rate high, Negative = tends to rate low' },
              { metric: 'Adjustment Rate', range: '0-100%', description: 'Percentage of manager\'s ratings that were adjusted in calibration', interpretation: 'Lower is better; high rates suggest systematic bias' },
              { metric: 'Consistency Score', range: '0-100', description: 'How stable alignment patterns are over multiple calibration cycles', interpretation: 'Low consistency may indicate situational factors vs. systematic bias' }
            ].map((item) => (
              <Card key={item.metric}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{item.metric}</h4>
                    <Badge variant="outline">{item.range}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <p className="text-xs text-primary">{item.interpretation}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Direction Bias Patterns */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            Direction Bias Patterns
          </h3>
          <p className="text-muted-foreground">
            The system detects consistent directional biases in manager ratings:
          </p>
          <div className="space-y-3">
            {[
              { bias: 'Leniency Pattern', indicator: 'Average delta > +0.5 across 3+ cycles', description: 'Manager consistently rates higher than calibrated outcomes', intervention: 'Training on performance standards, examples of exceptional vs. meets expectations' },
              { bias: 'Strictness Pattern', indicator: 'Average delta < -0.5 across 3+ cycles', description: 'Manager consistently rates lower than calibrated outcomes', intervention: 'Discussion of rating philosophy, peer manager shadowing' },
              { bias: 'Compression Pattern', indicator: 'Low variance with high adjustment rate', description: 'Manager avoids extreme ratings; all employees clustered in middle', intervention: 'Forced differentiation exercises, talent review discussions' },
              { bias: 'Inconsistent Pattern', indicator: 'Low consistency score with variable direction', description: 'No clear bias but ratings frequently need adjustment', intervention: 'Structured rating frameworks, competency calibration sessions' }
            ].map((item) => (
              <div key={item.bias} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{item.bias}</h4>
                  <Badge variant="secondary" className="text-xs">{item.indicator}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <div className="text-xs p-2 bg-muted/50 rounded">
                  <strong>Recommended Intervention:</strong> {item.intervention}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">manager_calibration_alignment</Badge>
              <span className="text-sm text-muted-foreground">Per-session alignment records</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">manager_alignment_trends</Badge>
              <span className="text-sm text-muted-foreground">Historical trend analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">calibration_training_assignments</Badge>
              <span className="text-sm text-muted-foreground">Training recommendations and completions</span>
            </div>
          </div>
        </div>

        {/* Training & Intervention Workflow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Training & Intervention Workflow
          </h3>
          <p className="text-muted-foreground">
            The system supports a graduated response to alignment issues:
          </p>
          <div className="space-y-2">
            {[
              { step: '1', title: 'Awareness', trigger: 'Alignment score drops below 75', action: 'Automated email with alignment report and self-service resources' },
              { step: '2', title: 'Training Recommendation', trigger: 'Alignment below 65 or negative trend for 2 cycles', action: 'Assign calibration training module, notify HRBP' },
              { step: '3', title: 'HRBP Coaching', trigger: 'Training completed but no improvement', action: 'Schedule 1:1 coaching session with HR Business Partner' },
              { step: '4', title: 'Formal Intervention', trigger: 'Persistent misalignment after coaching', action: 'Performance improvement plan, potential removal from manager role' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">Trigger: {item.trigger}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Integration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </h3>
          <p className="text-muted-foreground">
            The AI engine enhances alignment tracking with predictive and explanatory capabilities:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Predictive Alerts', description: 'AI predicts which managers are likely to have low alignment before calibration begins, allowing proactive coaching' },
              { title: 'Root Cause Analysis', description: 'AI analyzes patterns to distinguish between systematic bias and situational factors (e.g., new team, reorganization)' },
              { title: 'Training Effectiveness', description: 'AI tracks whether completed training improved subsequent alignment scores' },
              { title: 'Peer Comparison', description: 'AI provides benchmarks comparing manager alignment to peers managing similar team sizes and compositions' }
            ].map((item) => (
              <div key={item.title} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={ALIGNMENT_FIELDS} title="Alignment Record Fields Reference" />

        <TipCallout title="Best Practice">
          Share anonymized alignment benchmarks with all managers before calibration. 
          Understanding how peers rate helps calibrate expectations across the organization.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Alignment scores should be one input among many when evaluating manager effectiveness. 
          Low alignment may reflect legitimate disagreement with calibration outcomes rather than bias.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}

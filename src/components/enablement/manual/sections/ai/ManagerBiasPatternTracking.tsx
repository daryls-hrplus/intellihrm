import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Clock, CheckCircle, AlertTriangle, Shield, TrendingUp, UserX, BookOpen, Bell } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';

const BUSINESS_RULES = [
  { rule: 'Pattern tracking requires 3+ evaluations', enforcement: 'System' as const, description: 'Patterns not flagged until sufficient data exists for statistical significance.' },
  { rule: 'Manager can dispute patterns', enforcement: 'Policy' as const, description: 'Formal dispute process available with HR review.' },
  { rule: 'Interventions require HR approval', enforcement: 'Policy' as const, description: 'Formal intervention plans must be approved before implementation.' },
  { rule: 'Data retained per compliance requirements', enforcement: 'System' as const, description: 'Bias pattern data retained according to data retention policy.' }
];

const PATTERN_FIELDS: FieldDefinition[] = [
  { name: 'manager_id', required: true, type: 'uuid', description: 'Reference to the manager profile' },
  { name: 'pattern_type', required: true, type: 'select', description: 'Type of bias pattern detected', validation: 'gender | age | leniency | strictness | recency | halo | etc.' },
  { name: 'detection_method', required: true, type: 'select', description: 'How the pattern was detected', defaultValue: 'ai_analysis', validation: 'ai_analysis | statistical | manual_report' },
  { name: 'confidence_score', required: true, type: 'number', description: 'AI confidence in the pattern (0-100)', validation: '0-100' },
  { name: 'supporting_evidence', required: true, type: 'json', description: 'Array of specific instances supporting the pattern' },
  { name: 'affected_employee_count', required: true, type: 'number', description: 'Number of employees potentially affected' },
  { name: 'cycle_count', required: true, type: 'number', description: 'Number of appraisal cycles analyzed' },
  { name: 'nudge_acknowledgment_rate', required: false, type: 'number', description: 'Percentage of bias nudges acknowledged by this manager' },
  { name: 'behavior_change_detected', required: false, type: 'boolean', description: 'Whether behavior has improved after interventions' },
  { name: 'intervention_status', required: false, type: 'select', description: 'Current intervention stage', defaultValue: 'none', validation: 'none | awareness | training | coaching | formal' },
  { name: 'dispute_status', required: false, type: 'select', description: 'If manager disputed, current status', validation: 'none | pending | resolved_upheld | resolved_dismissed' },
  { name: 'last_analyzed_at', required: true, type: 'timestamp', description: 'When pattern was last evaluated' }
];

export function ManagerBiasPatternTracking() {
  return (
    <Card id="sec-5-9">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.9</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~9 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin / HRBP</Badge>
        </div>
        <CardTitle className="text-2xl">Manager Bias Pattern Tracking</CardTitle>
        <CardDescription>Track aggregate bias patterns by manager to identify systemic issues and intervention needs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-9'] || ['Appraisals Manual', 'Chapter 5: AI Features', 'Manager Bias Pattern Tracking']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how AI identifies systemic bias patterns</li>
            <li>Interpret manager bias dashboards and risk indicators</li>
            <li>Manage intervention workflows for identified patterns</li>
            <li>Handle manager disputes of bias findings</li>
          </ul>
        </div>

        {/* What is Pattern Tracking */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            What is Manager Bias Pattern Tracking?
          </h3>
          <p className="text-muted-foreground">
            While individual bias nudges catch point-in-time issues, pattern tracking identifies 
            systemic bias across a manager's entire evaluation history. This aggregate view 
            reveals whether a manager consistently demonstrates certain biases, enabling 
            targeted development interventions before they impact employee careers.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">From Incidents to Insights</p>
            <p className="text-sm text-muted-foreground mt-1">
              A single biased comment may be a slip; a pattern across 10 evaluations over 3 
              cycles indicates a systematic issue requiring HR attention and manager development.
            </p>
          </div>
        </div>

        {/* Pattern Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Pattern Types Tracked
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'Gender Language Pattern', description: 'Consistent use of gender-coded language across evaluations', indicator: 'Gender-coded terms appear in >30% of evaluations', risk: 'EEOC compliance risk' },
              { type: 'Demographic Rating Gap', description: 'Statistically significant rating differences by employee demographic', indicator: 'Rating average differs by >0.5 points between groups', risk: 'Discrimination claims' },
              { type: 'Leniency/Strictness Pattern', description: 'Consistent inflation or deflation of ratings vs. peers', indicator: 'Department average deviates >1 std from org', risk: 'Unfair compensation/promotion' },
              { type: 'Recency Dominance', description: 'Repeated evidence of recent events driving full-cycle ratings', indicator: 'Evidence age heavily skewed to final quarter', risk: 'Inaccurate performance record' },
              { type: 'Halo/Horn Consistency', description: 'Repeated pattern of one trait driving all ratings', indicator: 'Low variance across competencies for individuals', risk: 'Inaccurate development plans' },
              { type: 'Feedback Avoidance', description: 'Pattern of vague, non-actionable feedback', indicator: 'Average comment quality score <60', risk: 'Employee development stalled' }
            ].map((item) => (
              <Card key={item.type}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-1">{item.type}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="text-xs space-y-1">
                    <p><strong>Indicator:</strong> {item.indicator}</p>
                    <p className="text-destructive"><strong>Risk:</strong> {item.risk}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Intervention Workflow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Intervention Workflow
          </h3>
          <p className="text-muted-foreground">
            The system supports a graduated response based on pattern severity and persistence:
          </p>
          <div className="space-y-2">
            {[
              { stage: '1', name: 'Awareness', trigger: 'First pattern detection above threshold', action: 'Automated email with pattern report and self-service resources', owner: 'System' },
              { stage: '2', name: 'Training Assignment', trigger: 'Pattern persists after awareness or severity is medium', action: 'Assign targeted training module, track completion', owner: 'System + HR' },
              { stage: '3', name: 'HRBP Coaching', trigger: 'Training completed but pattern continues', action: 'Schedule 1:1 coaching session with HRBP', owner: 'HRBP' },
              { stage: '4', name: 'Formal Review', trigger: 'Pattern persists after coaching or is high severity', action: 'Formal review with HR and manager\'s leader', owner: 'HR Leadership' },
              { stage: '5', name: 'Role Evaluation', trigger: 'Documented failure to improve', action: 'Evaluate continued management responsibilities', owner: 'HR + Leadership' }
            ].map((item) => (
              <div key={item.stage} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm shrink-0">
                  {item.stage}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge variant="outline" className="text-xs">{item.owner}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Trigger: {item.trigger}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
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
              <Badge variant="outline" className="font-mono">manager_bias_patterns</Badge>
              <span className="text-sm text-muted-foreground">Aggregate pattern records per manager</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">bias_pattern_evidence</Badge>
              <span className="text-sm text-muted-foreground">Specific instances supporting patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">bias_intervention_history</Badge>
              <span className="text-sm text-muted-foreground">Intervention actions and outcomes</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">bias_pattern_disputes</Badge>
              <span className="text-sm text-muted-foreground">Manager disputes and resolutions</span>
            </div>
          </div>
        </div>

        {/* Dispute Process */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserX className="h-5 w-5 text-primary" />
            Dispute Process
          </h3>
          <p className="text-muted-foreground">
            Managers have the right to dispute identified patterns through a formal process:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { step: 'Initiate Dispute', description: 'Manager submits dispute with explanation and counter-evidence' },
              { step: 'HR Review', description: 'HR analyzes original detection and manager\'s response' },
              { step: 'Independent Analysis', description: 'Optional: third-party review for contested cases' },
              { step: 'Resolution', description: 'Pattern upheld, dismissed, or modified based on findings' }
            ].map((item) => (
              <div key={item.step} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.step}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ISO 42001 Compliance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            ISO 42001 Compliance Considerations
          </h3>
          <p className="text-muted-foreground">
            Bias pattern tracking involves sensitive HR data and AI-driven decisions about individuals:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { principle: 'Explainability', requirement: 'All pattern detections include AI reasoning and evidence links' },
              { principle: 'Human Oversight', requirement: 'No automated adverse actions—all interventions require HR approval' },
              { principle: 'Data Minimization', requirement: 'Only data necessary for pattern detection is processed' },
              { principle: 'Right to Contest', requirement: 'Formal dispute mechanism with independent review option' },
              { principle: 'Transparency', requirement: 'Managers informed when pattern tracking is applied to their evaluations' },
              { principle: 'Purpose Limitation', requirement: 'Bias data used only for fairness improvement, not punitive profiling' }
            ].map((item) => (
              <div key={item.principle} className="p-3 border rounded-lg">
                <h4 className="font-semibold text-sm">{item.principle}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.requirement}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={PATTERN_FIELDS} title="Bias Pattern Record Fields Reference" />

        <TipCallout title="Best Practice">
          Use pattern data constructively. Frame conversations with managers around development 
          opportunity rather than accusation. Most bias is unconscious and responds well to 
          awareness and training.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Bias pattern tracking must be implemented with legal counsel review. Different 
          jurisdictions have varying requirements for employee monitoring and data use.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}

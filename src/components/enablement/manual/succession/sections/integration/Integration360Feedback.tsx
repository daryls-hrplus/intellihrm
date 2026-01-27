import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowRight, 
  Brain,
  Shield,
  Sparkles
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';

const signalFields: FieldDefinition[] = [
  { name: 'signal_type', required: true, type: 'text', description: 'Category of leadership signal', defaultValue: '—', validation: 'leadership, collaboration, influence, strategic_thinking' },
  { name: 'signal_value', required: true, type: 'numeric', description: 'Normalized signal score (0-1)', defaultValue: '—', validation: 'Aggregated from 360 responses' },
  { name: 'confidence_score', required: false, type: 'numeric', description: 'Statistical confidence in signal', defaultValue: 'null', validation: '0-1 based on response count' },
  { name: 'bias_risk_indicator', required: false, type: 'numeric', description: 'Potential bias detection score', defaultValue: 'null', validation: '0-1 higher = more bias risk' },
  { name: 'response_count', required: true, type: 'integer', description: 'Number of responses contributing', defaultValue: '—', validation: 'Minimum 5 for K-anonymity' },
  { name: 'rater_group_breakdown', required: false, type: 'jsonb', description: 'Scores by rater relationship', defaultValue: '{}', validation: 'manager, peer, direct_report, other' }
];

const signalCategories = [
  {
    category: 'Leadership',
    description: 'Ability to inspire, guide, and develop others',
    indicators: ['Vision communication', 'Team motivation', 'Decision quality', 'Accountability'],
    potentialWeight: '30%'
  },
  {
    category: 'Collaboration',
    description: 'Effectiveness in working across teams and functions',
    indicators: ['Cross-functional partnerships', 'Conflict resolution', 'Knowledge sharing', 'Inclusivity'],
    potentialWeight: '25%'
  },
  {
    category: 'Influence',
    description: 'Capacity to shape outcomes without direct authority',
    indicators: ['Stakeholder management', 'Persuasion', 'Political acumen', 'Executive presence'],
    potentialWeight: '25%'
  },
  {
    category: 'Strategic Thinking',
    description: 'Long-term planning and systems-level reasoning',
    indicators: ['Business acumen', 'Innovation', 'Risk assessment', 'Future orientation'],
    potentialWeight: '20%'
  }
];

export function Integration360Feedback() {
  return (
    <section id="sec-9-4" data-manual-anchor="sec-9-4" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Users className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.4 360 Feedback Integration</h3>
          <p className="text-sm text-muted-foreground">
            Incorporate 360 feedback signals into Potential axis and development themes
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand how 360 signals feed the Nine-Box Potential axis',
        'Configure signal category mappings and weights',
        'Apply confidence scoring and bias risk adjustments',
        'Connect development themes to succession IDP goals'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: 360 Feedback → Succession
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium">360 Responses</p>
                <Badge variant="outline" className="mt-1">feedback_360_responses</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Processor</p>
                <p className="font-medium">Signal Processor</p>
                <Badge variant="outline" className="mt-1">Edge Function</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-medium">Potential Axis</p>
                <Badge variant="outline" className="mt-1">talent_signal_snapshots</Badge>
              </div>
            </div>
          </div>

          <InfoCallout>
            The <code>feedback-signal-processor</code> edge function aggregates 360 responses into leadership 
            signals, applies confidence scoring, detects potential bias, and creates talent signal snapshots 
            that feed the Nine-Box Potential axis.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Signal Categories & Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            360 feedback is aggregated into four leadership signal categories that contribute to Potential assessment:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {signalCategories.map(cat => (
              <div key={cat.category} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{cat.category}</h4>
                  <Badge variant="secondary">{cat.potentialWeight}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{cat.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.indicators.map(ind => (
                    <Badge key={ind} variant="outline" className="text-xs">{ind}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium mb-2">Potential Axis Calculation</h4>
            <p className="text-sm font-mono">
              potential_score = (leadership × 0.30) + (collaboration × 0.25) + (influence × 0.25) + (strategic × 0.20)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Weights are configurable per company in <code>nine_box_signal_mappings</code>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Confidence & Bias Adjustment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Confidence Scoring</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">High</Badge>
                  <span>≥10 responses, diverse rater groups, low variance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Medium</Badge>
                  <span>5-9 responses, 2+ rater groups, moderate variance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Low</Badge>
                  <span>5 responses minimum (K-anonymity threshold)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Bias Risk Detection</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="destructive" className="mt-0.5">High Risk</Badge>
                  <span>Large manager-peer score gap, recency effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="secondary" className="mt-0.5">Medium Risk</Badge>
                  <span>Single rater group dominance, halo effect patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">Low Risk</Badge>
                  <span>Balanced rater groups, consistent scoring patterns</span>
                </li>
              </ul>
            </div>
          </div>

          <WarningCallout>
            Signals with confidence_score &lt; 0.5 or bias_risk_indicator &gt; 0.7 are flagged for human review 
            before contributing to Nine-Box assessments. HR can override or exclude these signals.
          </WarningCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={signalFields} 
        title="360 Signal Processing Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Development Themes → IDP Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            360 feedback generates development themes that can automatically create succession-focused IDP goals:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Theme Category</th>
                  <th className="text-left py-2 px-3">IDP Goal Type</th>
                  <th className="text-left py-2 px-3">Auto-Generate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Leadership Development</td>
                  <td className="py-2 px-3">Stretch assignment, mentoring</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Yes</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Technical Skill Gap</td>
                  <td className="py-2 px-3">Training course, certification</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Yes</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Relationship Building</td>
                  <td className="py-2 px-3">Cross-functional project, networking</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Yes</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Strategic Capability</td>
                  <td className="py-2 px-3">Executive education, job rotation</td>
                  <td className="py-2 px-3"><Badge variant="outline">HR Review</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <TipCallout>
            Configure integration rules with <code>trigger_event: '360_theme_confirmed'</code> to automatically 
            create IDP goals when managers confirm development themes. This ensures seamless succession 
            development planning.
          </TipCallout>
        </CardContent>
      </Card>

      <InfoCallout>
        For detailed 360 Feedback configuration, refer to the <strong>360 Feedback Administrator Manual, 
        Chapter 7: Integration & Cross-Module Features</strong>, which covers cycle setup, rater management, 
        and signal processing in depth.
      </InfoCallout>
    </section>
  );
}

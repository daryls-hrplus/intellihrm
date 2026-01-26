// Section 3.6: Potential Axis Configuration
// Configure potential axis inputs: assessments, leadership signals, values

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IntegrationCallout,
} from '../../../components';
import { Brain, Users, Star, Sparkles, Calculator } from 'lucide-react';

export function NineBoxPotentialAxis() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand how the Potential axis measures future capability and growth capacity",
          "Configure the three default potential sources: assessments, leadership signals, and values",
          "Integrate potential assessments from the Readiness Assessment framework",
          "Leverage 360 Feedback signals for leadership and adaptability indicators",
          "Calculate the final 1-3 Potential rating from aggregated sources"
        ]}
      />

      {/* Axis Definition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Potential Axis Definition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <p className="text-lg font-medium">
              Potential = Future capability and growth capacity for advancement
            </p>
          </div>
          <p className="text-muted-foreground">
            The Potential axis (Y-axis) measures an employee's capacity for growth and 
            advancement. It answers the question: <strong>"How much can this person grow?"</strong>
          </p>
          <p className="text-muted-foreground">
            Potential is evaluated through subjective assessments, leadership signals from 
            360 feedback, and indicators of learning agility and cultural alignment.
          </p>
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Potential Axis Data Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap">
{`┌─────────────────────────────────────────────────────────────────┐
│                     POTENTIAL AXIS CALCULATION                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  Potential       │     Normalize: calculated_rating / 3      │
│  │  Assessment      │────►  (1-3 scale → 0-1)                   │
│  │  Weight: 40%     │                        ┐                  │
│  └──────────────────┘                        │                  │
│                                              │                  │
│  ┌──────────────────┐                        ▼                  │
│  │  Leadership      │     Average of leadership category        │
│  │  Signals (360)   │────►  signals with bias adjustment        │
│  │  Weight: 40%     │     (already 0-1)      │  Weighted        │
│  └──────────────────┘                        │  Average         │
│       Categories:                            ▼                  │
│       • leadership                      ┌─────────┐             │
│       • people_leadership               │ Score   │             │
│       • strategic_thinking              │ (0-1)   │             │
│       • influence                       └────┬────┘             │
│                                              │                  │
│  ┌──────────────────┐                        │                  │
│  │  Values &        │     Average of values/adaptability        │
│  │  Adaptability    │────►  signals with bias adjustment  ──────┤
│  │  Weight: 20%     │     (already 0-1)                         │
│  └──────────────────┘                        │                  │
│       Categories:                            ▼                  │
│       • values                     ┌─────────────────┐          │
│       • adaptability               │  Convert to     │          │
│                                    │  1-3 Rating     │          │
│                                    │  < 0.33 → 1     │          │
│                                    │  < 0.67 → 2     │          │
│                                    │  else   → 3     │          │
│                                    └─────────────────┘          │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Source Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Potential Source Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Potential Assessment */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Potential Assessment (40% Weight)</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    The calculated rating from the most recent potential assessment 
                    using the Readiness Assessment framework.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Source:</strong> <code>potential_assessments.calculated_rating</code></p>
                    <p><strong>Filter:</strong> <code>is_current = true</code></p>
                    <p><strong>Scale:</strong> 1-3 rating from readiness indicators</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-xs">
                  <p className="text-muted-foreground mb-1">// Normalization</p>
                  <code>normalizedScore = calculated_rating / 3</code>
                  <p className="text-muted-foreground mt-2 mb-1">// Example</p>
                  <code>2 / 3 = 0.667</code>
                </div>
              </div>
            </div>

            {/* Leadership Signals */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Leadership Signals from 360 (40% Weight)</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Aggregated signals from 360 Feedback in leadership-related categories, 
                    adjusted for bias risk.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Source:</strong> <code>talent_signal_snapshots.normalized_score</code></p>
                    <p><strong>Categories:</strong> leadership, people_leadership, strategic_thinking, influence</p>
                    <p><strong>Adjustment:</strong> Bias risk multiplier applied</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-xs">
                  <p className="text-muted-foreground mb-1">// With bias adjustment</p>
                  <code>adjustedScore = score × biasMultiplier</code>
                  <p className="text-muted-foreground mt-2 mb-1">// Example (4 signals)</p>
                  <code>
                    leadership: 0.82 × 1.0 = 0.82<br/>
                    people_lead: 0.75 × 0.85 = 0.64<br/>
                    strategic: 0.68 × 1.0 = 0.68<br/>
                    influence: 0.71 × 1.0 = 0.71<br/>
                    avg = 0.7125
                  </code>
                </div>
              </div>
            </div>

            {/* Values & Adaptability */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Values & Adaptability Signals (20% Weight)</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Signals indicating cultural fit and learning agility from 360 Feedback.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Source:</strong> <code>talent_signal_snapshots.normalized_score</code></p>
                    <p><strong>Categories:</strong> values, adaptability</p>
                    <p><strong>Purpose:</strong> Learning agility proxy and cultural alignment</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-xs">
                  <p className="text-muted-foreground mb-1">// Example (2 signals)</p>
                  <code>
                    values: 0.78 × 1.0 = 0.78<br/>
                    adaptability: 0.85 × 1.0 = 0.85<br/>
                    avg = 0.815
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Conversion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Score to Rating Conversion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            After calculating the weighted average (0-1 scale), the score is converted 
            to a 1-3 rating for Nine-Box placement on the Y-axis.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Score Range</th>
                  <th className="text-left py-3 px-4 font-medium">Rating</th>
                  <th className="text-left py-3 px-4 font-medium">Label</th>
                  <th className="text-left py-3 px-4 font-medium">Grid Position</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono">0.00 - 0.32</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">1</Badge>
                  </td>
                  <td className="py-3 px-4">Low Potential</td>
                  <td className="py-3 px-4">Bottom row</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono">0.33 - 0.66</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-purple-600">2</Badge>
                  </td>
                  <td className="py-3 px-4">Moderate Potential</td>
                  <td className="py-3 px-4">Middle row</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono">0.67 - 1.00</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">3</Badge>
                  </td>
                  <td className="py-3 px-4">High Potential</td>
                  <td className="py-3 px-4">Top row</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Potential vs Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Key Differences: Potential vs. Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Aspect</th>
                  <th className="text-left py-3 px-4 font-medium">Performance (X)</th>
                  <th className="text-left py-3 px-4 font-medium">Potential (Y)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Time Focus</td>
                  <td className="py-3 px-4">Current/Past results</td>
                  <td className="py-3 px-4">Future capability</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Data Type</td>
                  <td className="py-3 px-4">Objective (scores, metrics)</td>
                  <td className="py-3 px-4">More subjective (signals, assessments)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Primary Sources</td>
                  <td className="py-3 px-4">Appraisals, Goals, KPIs</td>
                  <td className="py-3 px-4">360 Feedback, Potential Assessments</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Signal Categories</td>
                  <td className="py-3 px-4">Technical, Customer Focus</td>
                  <td className="py-3 px-4">Leadership, Values, Adaptability</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Question Answered</td>
                  <td className="py-3 px-4">"How well today?"</td>
                  <td className="py-3 px-4">"How much can they grow?"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Integration Requirements */}
      <IntegrationCallout>
        <strong>Required Module Data:</strong>
        <ul className="list-disc list-inside mt-2 text-sm">
          <li><strong>Potential Assessments:</strong> Current readiness assessments with calculated ratings</li>
          <li><strong>360 Feedback:</strong> Current talent signal snapshots with leadership categories</li>
          <li><strong>Signal Definitions:</strong> Active talent signal definitions for category mapping</li>
        </ul>
      </IntegrationCallout>

      {/* Common Considerations */}
      <WarningCallout title="Potential Rating Considerations">
        Potential ratings are inherently more subjective than performance ratings. 
        Consider these factors during calibration:
        <ul className="list-disc list-inside mt-2 text-sm">
          <li>Limited exposure to leadership opportunities may suppress signals</li>
          <li>Cultural bias in feedback can affect signal quality</li>
          <li>Early career employees may lack assessment history</li>
          <li>Use AI suggestions as a starting point, not final determination</li>
        </ul>
      </WarningCallout>

      {/* Best Practices */}
      <TipCallout title="Potential Axis Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Conduct potential assessments annually using the Readiness Assessment framework</li>
          <li>Ensure 360 Feedback cycles include leadership-focused questions</li>
          <li>Review bias risk adjustments during calibration sessions</li>
          <li>Supplement signal data with manager observations for low-confidence ratings</li>
          <li>Track potential rating trends over time to identify development progress</li>
        </ul>
      </TipCallout>
    </div>
  );
}

// Section 3.5: Performance Axis Configuration
// Configure performance axis inputs: appraisal ratings, goal completion, competencies

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IntegrationCallout,
} from '../../../components';
import { TrendingUp, BarChart3, Target, Award, Calculator } from 'lucide-react';

export function NineBoxPerformanceAxis() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand how the Performance axis measures current contribution and results",
          "Configure the three default performance sources: appraisals, goals, and competencies",
          "Apply score normalization to convert different scales to 0-1 range",
          "Handle missing data scenarios with weight redistribution",
          "Calculate the final 1-3 Performance rating from normalized scores"
        ]}
      />

      {/* Axis Definition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance Axis Definition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <p className="text-lg font-medium">
              Performance = Current contribution and results delivered in the role
            </p>
          </div>
          <p className="text-muted-foreground">
            The Performance axis (X-axis) measures how well an employee is executing in their 
            current role. It answers the question: <strong>"How well is this person performing today?"</strong>
          </p>
          <p className="text-muted-foreground">
            Performance is evaluated through objective data from appraisal scores, goal achievement 
            rates, and competency assessments—all of which reflect actual output and behavior.
          </p>
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Performance Axis Data Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap">
{`┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE AXIS CALCULATION                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  Appraisals      │     Normalize: overall_score / 5          │
│  │  overall_score   │────►  (1-5 scale → 0-1)                   │
│  │  Weight: 50%     │                        ┐                  │
│  └──────────────────┘                        │                  │
│                                              │                  │
│  ┌──────────────────┐                        ▼                  │
│  │  Goals           │     Normalize: progress_percentage / 100  │
│  │  progress_%      │────►  (0-100% → 0-1)   │                  │
│  │  Weight: 30%     │                        │  Weighted        │
│  └──────────────────┘                        │  Average         │
│                                              ▼                  │
│  ┌──────────────────┐                   ┌─────────┐             │
│  │  Competencies    │     Already       │ Score   │             │
│  │  normalized_score│────► normalized   ──►(0-1)  │             │
│  │  Weight: 20%     │     (0-1)         └────┬────┘             │
│  └──────────────────┘                        │                  │
│                                              ▼                  │
│                                    ┌─────────────────┐          │
│                                    │  Convert to     │          │
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
            <Target className="h-5 w-5 text-primary" />
            Performance Source Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Appraisal Score */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Appraisal Overall Score (50% Weight)</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    The final overall score from the most recent completed appraisal cycle.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Source:</strong> <code>appraisal_participants.overall_score</code></p>
                    <p><strong>Filter:</strong> <code>status = 'completed'</code>, most recent</p>
                    <p><strong>Scale:</strong> 1-5 rating scale</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-xs">
                  <p className="text-muted-foreground mb-1">// Normalization</p>
                  <code>normalizedScore = overall_score / 5</code>
                  <p className="text-muted-foreground mt-2 mb-1">// Example</p>
                  <code>4.2 / 5 = 0.84</code>
                </div>
              </div>
            </div>

            {/* Goal Achievement */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Goal Achievement (30% Weight)</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Average progress percentage across all active goals for the employee.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Source:</strong> <code>performance_goals.progress_percentage</code></p>
                    <p><strong>Filter:</strong> <code>owner_id = employee_id, is_active = true</code></p>
                    <p><strong>Aggregation:</strong> Average of all goal progress values</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-xs">
                  <p className="text-muted-foreground mb-1">// Normalization</p>
                  <code>normalizedScore = avgProgress / 100</code>
                  <p className="text-muted-foreground mt-2 mb-1">// Example (3 goals)</p>
                  <code>(80 + 95 + 60) / 3 / 100 = 0.783</code>
                </div>
              </div>
            </div>

            {/* Competency Average */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Competency/Technical Signals (20% Weight)</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Average normalized score from talent signals in technical and customer-focus categories.
                  </p>
                  <div className="text-xs space-y-1">
                    <p><strong>Source:</strong> <code>talent_signal_snapshots.normalized_score</code></p>
                    <p><strong>Filter:</strong> <code>is_current = true</code>, category in ('technical', 'customer_focus')</p>
                    <p><strong>Scale:</strong> Already normalized (0-1)</p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg font-mono text-xs">
                  <p className="text-muted-foreground mb-1">// Already normalized</p>
                  <code>normalizedScore = avgSignalScore</code>
                  <p className="text-muted-foreground mt-2 mb-1">// Example (2 signals)</p>
                  <code>(0.85 + 0.72) / 2 = 0.785</code>
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
            to a 1-3 rating for Nine-Box placement.
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
                    <Badge variant="destructive">1</Badge>
                  </td>
                  <td className="py-3 px-4">Low Performance</td>
                  <td className="py-3 px-4">Left column</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono">0.33 - 0.66</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">2</Badge>
                  </td>
                  <td className="py-3 px-4">Moderate Performance</td>
                  <td className="py-3 px-4">Center column</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono">0.67 - 1.00</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">3</Badge>
                  </td>
                  <td className="py-3 px-4">High Performance</td>
                  <td className="py-3 px-4">Right column</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// Rating conversion formula
const toRating = (score: number) => {
  if (score < 0.33) return 1;  // Low
  if (score < 0.67) return 2;  // Moderate
  return 3;                     // High
};`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Missing Data Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Missing Data Handling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When a source has no data for an employee, its weight is excluded and 
            remaining weights are normalized proportionally.
          </p>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// Example: Employee has appraisal (50%) and goals (30%), but no competency signals

// Available data
appraisalScore = 0.84, weight = 0.50
goalsScore = 0.78, weight = 0.30
competencyScore = null, weight = 0.20 (excluded)

// Calculate with available data
totalScore = (0.84 * 0.50) + (0.78 * 0.30) = 0.654
totalWeight = 0.50 + 0.30 = 0.80

// Normalize
normalizedScore = 0.654 / 0.80 = 0.8175

// Confidence reflects data coverage
confidence = 0.80 (80% of expected data available)`}
            </pre>
          </div>

          <WarningCallout title="Low Confidence Ratings">
            When confidence is below 50%, the Nine-Box placement may be unreliable. 
            The UI displays a confidence badge to alert managers. Consider requiring 
            manual override review for low-confidence assessments.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Integration Requirements */}
      <IntegrationCallout>
        <strong>Required Module Data:</strong>
        <ul className="list-disc list-inside mt-2 text-sm">
          <li><strong>Appraisals:</strong> At least one completed appraisal cycle with overall scores</li>
          <li><strong>Goals:</strong> Active goals with progress tracking enabled</li>
          <li><strong>360 Feedback:</strong> Current talent signal snapshots with technical/customer categories</li>
        </ul>
      </IntegrationCallout>

      {/* Best Practices */}
      <TipCallout title="Performance Axis Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Ensure appraisal cycles are completed before running Nine-Box assessments</li>
          <li>Goal progress should be updated at least monthly for accurate ratings</li>
          <li>Review low-confidence ratings during calibration sessions</li>
          <li>Consider seasonal factors when interpreting goal achievement</li>
          <li>Use AI-suggested ratings as guidance, not automatic placement</li>
        </ul>
      </TipCallout>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Target, 
  CheckCircle, 
  Calculator,
  AlertTriangle,
  Database,
  Info
} from 'lucide-react';

export function FoundationAssessorAggregation() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.2a Multi-Assessor Score Aggregation</h3>
        <p className="text-muted-foreground">
          Understand how multiple assessor scores are consolidated into a final readiness score
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand how multiple assessor scores are consolidated</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure weight-based aggregation formulas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Handle partial assessments (some assessors incomplete)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Interpret consolidated readiness scores</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Aggregation Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Standard Weighted Average Formula
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
            <pre className="whitespace-pre">{`Consolidated Score = Σ (Assessor Score × Assessor Weight) / Σ (Active Assessor Weights)

Where:
- Assessor Score = Individual assessor's overall score (0-100%)
- Assessor Weight = weight_percentage from assessor_types configuration
- Active Assessor Weights = Only assessors who completed assessment`}</pre>
          </div>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              When all configured assessors complete their assessments and weights sum to 100%, 
              the formula simplifies to a standard weighted average.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Calculation Example */}
      <Card>
        <CardHeader>
          <CardTitle>Calculation Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`Candidate: Sarah Chen
Position: VP of Operations

┌─────────────────────────────────────────────────────────────────────────────┐
│                      MULTI-ASSESSOR SCORE AGGREGATION                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Assessor          Score    Weight    Weighted Score    Status              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Direct Manager    82%      40%       32.8              ✓ Complete          │
│  HR Partner        78%      25%       19.5              ✓ Complete          │
│  Executive         85%      20%       17.0              ✓ Complete          │
│  Skip-Level        --       15%       --                ○ Not Requested     │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Active Weight Total: 40% + 25% + 20% = 85%                                 │
│  Weighted Score Sum: 32.8 + 19.5 + 17.0 = 69.3                              │
│                                                                             │
│  NORMALIZED SCORE = 69.3 / 85% × 100% = 81.5%                               │
│                                                                             │
│  Band Assignment: Ready 1-3 Years (70-84%)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Aggregation Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Aggregation Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Mode</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">When to Use</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-primary">Weighted Average</Badge>
                    <span className="text-xs text-muted-foreground ml-2">(Default)</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">Score × Weight, normalized to active assessors</td>
                  <td className="py-3 px-4 text-muted-foreground">Standard multi-assessor assessments</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge variant="secondary">Required First</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Required assessors weighted, optional as tie-breaker</td>
                  <td className="py-3 px-4 text-muted-foreground">When manager input is authoritative</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge variant="secondary">Consensus Required</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">All assessors must agree within threshold</td>
                  <td className="py-3 px-4 text-muted-foreground">High-stakes succession decisions</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><Badge variant="secondary">Executive Override</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">Executive score replaces aggregation if provided</td>
                  <td className="py-3 px-4 text-muted-foreground">Calibration sessions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Handling Partial Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Handling Partial Assessments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Scenario 1: Optional Assessor Not Requested</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Excluded from calculation entirely</li>
              <li>• Active weight normalized to completed assessors</li>
              <li>• No penalty to candidate</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Scenario 2: Required Assessor Incomplete</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Assessment marked "Pending Required Input"</li>
              <li>• Band assignment blocked</li>
              <li>• Escalation notification triggered after SLA</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Scenario 3: Score Variance Exceeds Threshold</h4>
            <div className="bg-muted/30 p-3 rounded font-mono text-xs mt-2">
              <pre className="whitespace-pre">{`Variance Detection:
If MAX(assessor_scores) - MIN(assessor_scores) > 25 percentage points:
  → Flag for calibration review
  → Notify HR Partner
  → Add to calibration session queue`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Storage: readiness_assessment_events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">raw_score</td>
                  <td className="py-2 px-3 text-muted-foreground">Simple average before weighting</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">weighted_score</td>
                  <td className="py-2 px-3 text-muted-foreground">Weight-normalized score</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">aggregation_method</td>
                  <td className="py-2 px-3 text-muted-foreground">Mode used (weighted_average, etc.)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">assessor_variance</td>
                  <td className="py-2 px-3 text-muted-foreground">MAX - MIN of assessor scores</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">requires_calibration</td>
                  <td className="py-2 px-3 text-muted-foreground">Boolean flag if variance exceeded</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Business Rules for Aggregation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Rule</th>
                  <th className="text-left py-2 px-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2a.1</td>
                  <td className="py-2 px-3 text-muted-foreground">Required assessors must complete before band assignment</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2a.2</td>
                  <td className="py-2 px-3 text-muted-foreground">Minimum 1 assessor required for any score</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2a.3</td>
                  <td className="py-2 px-3 text-muted-foreground">Variance &gt; 25% triggers calibration flag</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono">BR-2.2a.4</td>
                  <td className="py-2 px-3 text-muted-foreground">Executive override logged in audit trail</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">BR-2.2a.5</td>
                  <td className="py-2 px-3 text-muted-foreground">Weight normalization automatic when assessors &lt; configured</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

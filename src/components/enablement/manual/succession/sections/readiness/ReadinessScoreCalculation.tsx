// Section 4.7: Score Calculation & Band Assignment
// Weighted average algorithm, band mapping, partial assessments

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IndustryCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  InfoFeatureCard,
} from '../../../components';
import { 
  Calculator, 
  Scale,
  Target,
  AlertTriangle,
  CheckCircle2,
  Users,
  Percent
} from 'lucide-react';

export function ReadinessScoreCalculation() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Master the weighted average formula for calculateOverallScore",
          "Understand how partial assessments redistribute weights",
          "Map overall scores to readiness bands using threshold lookup",
          "Configure multi-assessor score aggregation with type-based weights"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Technical Reference">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          src/hooks/succession/useReadinessAssessment.ts → calculateOverallScore()
        </code>
      </InfoCallout>

      {/* Core Algorithm */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Score Calculation Algorithm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code className="text-xs bg-muted px-1.5 py-0.5 rounded">calculateOverallScore</code> function 
            computes a weighted average of all submitted responses:
          </p>

          {/* Algorithm Pseudocode */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">
{`function calculateOverallScore(responses, indicators) {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const response of responses) {
    // Only include submitted responses (not drafts)
    if (!response.submitted_at) continue;
    
    // Find the indicator for this response
    const indicator = indicators.find(i => i.id === response.indicator_id);
    if (!indicator) continue;
    
    // Normalize rating to 0-100 scale
    const normalizedRating = (response.rating / indicator.rating_scale_max) * 100;
    
    // Apply indicator weight
    weightedSum += normalizedRating * indicator.weight_percent;
    totalWeight += indicator.weight_percent;
  }
  
  // Calculate weighted average (0-100)
  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  return Math.round(overallScore * 100) / 100; // Round to 2 decimals
}`}
            </pre>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Normalization</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Rating is divided by scale max (e.g., 4/5 = 80%) to normalize all indicators to 0-100.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Weighting</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Each indicator's weight_percent determines its contribution to the final score.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Averaging</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Final score = weighted sum / total weight used, resulting in 0-100 percentage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Example Score Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Given a simple assessment with 4 indicators:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Indicator</th>
                  <th className="text-left py-3 px-4 font-medium">Weight</th>
                  <th className="text-left py-3 px-4 font-medium">Rating</th>
                  <th className="text-left py-3 px-4 font-medium">Max</th>
                  <th className="text-left py-3 px-4 font-medium">Normalized</th>
                  <th className="text-left py-3 px-4 font-medium">Weighted</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Strategic Vision</td>
                  <td className="py-3 px-4">30%</td>
                  <td className="py-3 px-4">4</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">80%</td>
                  <td className="py-3 px-4">24.0</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Team Leadership</td>
                  <td className="py-3 px-4">25%</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">100%</td>
                  <td className="py-3 px-4">25.0</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Functional Expertise</td>
                  <td className="py-3 px-4">25%</td>
                  <td className="py-3 px-4">3</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">60%</td>
                  <td className="py-3 px-4">15.0</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Change Leadership</td>
                  <td className="py-3 px-4">20%</td>
                  <td className="py-3 px-4">4</td>
                  <td className="py-3 px-4">5</td>
                  <td className="py-3 px-4">80%</td>
                  <td className="py-3 px-4">16.0</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="py-3 px-4 font-medium">Total</td>
                  <td className="py-3 px-4 font-medium">100%</td>
                  <td className="py-3 px-4" colSpan={3}></td>
                  <td className="py-3 px-4 font-medium">80.0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-lg">
            <p className="text-sm">
              <strong>Final Score:</strong> 80.0 / 100 = <strong className="text-emerald-600">80%</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Band Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Band Assignment Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            After calculating the overall score, the system assigns a readiness band using the 
            <code className="mx-1 text-xs bg-muted px-1.5 py-0.5 rounded">readiness_rating_bands</code> table:
          </p>

          {/* Band Lookup Algorithm */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">
{`function assignReadinessBand(overallScore, ratingBands) {
  // Bands are ordered by sort_order (highest threshold first)
  for (const band of ratingBands) {
    if (overallScore >= band.min_percentage && 
        overallScore <= band.max_percentage) {
      return band.rating_label;
    }
  }
  
  // Fallback if no band matches (configuration issue)
  return 'Unclassified';
}`}
            </pre>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Band</th>
                  <th className="text-left py-3 px-4 font-medium">Min %</th>
                  <th className="text-left py-3 px-4 font-medium">Max %</th>
                  <th className="text-left py-3 px-4 font-medium">Successor Eligible</th>
                  <th className="text-left py-3 px-4 font-medium">Strategic Implication</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">Ready Now</Badge>
                  </td>
                  <td className="py-3 px-4">85%</td>
                  <td className="py-3 px-4">100%</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4">Can assume role immediately</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">Ready in 1-3 Years</Badge>
                  </td>
                  <td className="py-3 px-4">70%</td>
                  <td className="py-3 px-4">84.99%</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4">Development plan for near-term readiness</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">Ready in 3-5 Years</Badge>
                  </td>
                  <td className="py-3 px-4">55%</td>
                  <td className="py-3 px-4">69.99%</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4">Long-term pipeline, significant development</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-orange-600">Developing</Badge>
                  </td>
                  <td className="py-3 px-4">40%</td>
                  <td className="py-3 px-4">54.99%</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4">Not succession-ready; focus on current role</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge variant="destructive">Not a Successor</Badge>
                  </td>
                  <td className="py-3 px-4">0%</td>
                  <td className="py-3 px-4">39.99%</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4">Remove from succession plan or reassess</td>
                </tr>
              </tbody>
            </table>
          </div>

          <IndustryCallout>
            <strong>Example:</strong> The candidate with 80% overall score from the previous example 
            would be assigned <Badge className="bg-blue-600">Ready in 1-3 Years</Badge> band 
            (80% falls between 70% and 84.99%).
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* Partial Assessment Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Partial Assessment Handling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When some indicators are skipped or not yet rated, the algorithm automatically 
            redistributes weights:
          </p>

          <FeatureCardGrid columns={2}>
            <PrimaryFeatureCard
              icon={Scale}
              title="Weight Redistribution"
              description="If an indicator is skipped, its weight is excluded from totalWeight. The remaining weights are used to calculate the average, preserving accuracy."
            />
            <InfoFeatureCard
              icon={AlertTriangle}
              title="Confidence Flag"
              description="If more than 20% of indicators are skipped, the assessment is flagged as 'Low Confidence' and may require HR review before finalizing."
            />
          </FeatureCardGrid>

          <WarningCallout>
            <strong>Important:</strong> Draft responses (submitted_at = null) are excluded from 
            score calculation. Only fully submitted responses contribute to the overall score.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Multi-Assessor Aggregation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Multi-Assessor Score Aggregation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When multiple assessors rate the same indicator, scores are aggregated using 
            assessor type weights from <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_assessor_types</code>:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Assessor Type</th>
                  <th className="text-left py-3 px-4 font-medium">Default Weight</th>
                  <th className="text-left py-3 px-4 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Manager</td>
                  <td className="py-3 px-4">40%</td>
                  <td className="py-3 px-4">Closest to day-to-day performance observation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">HR Partner</td>
                  <td className="py-3 px-4">25%</td>
                  <td className="py-3 px-4">Access to compliance, history, and cross-employee data</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Executive</td>
                  <td className="py-3 px-4">20%</td>
                  <td className="py-3 px-4">Strategic perspective on enterprise readiness</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Skip-Level Manager</td>
                  <td className="py-3 px-4">15%</td>
                  <td className="py-3 px-4">Broader organizational context</td>
                </tr>
              </tbody>
            </table>
          </div>

          <InfoCallout title="Reference">
            See Chapter 2, Section 2.2a for detailed multi-assessor score aggregation formulas 
            including variance detection and calibration triggers.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Score Calculation">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Ensure all indicator weights sum to 100% for accurate scoring</li>
          <li>Review skipped indicators before finalizing—excessive skips reduce confidence</li>
          <li>Use calibration sessions when multi-assessor variance exceeds thresholds</li>
          <li>Document override reasons when HR manually adjusts calculated bands</li>
          <li>Validate band thresholds annually to ensure they reflect organizational standards</li>
        </ul>
      </TipCallout>
    </div>
  );
}

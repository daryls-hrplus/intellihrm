import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Target, TrendingUp, DollarSign, Users, Star, Brain, BarChart3 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsCourseEffectiveness() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Course Effectiveness Metrics provide a holistic view of training quality by combining
          completion rates, quiz performance, learner satisfaction, and business impact data.
          This section aggregates insights from multiple data sources to evaluate course value.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Effectiveness Dimensions</h3>
        <FeatureCardGrid columns={4}>
          <FeatureCard variant="primary" icon={Target} title="Completion Rate">
            <p className="text-sm mt-2">% of enrollments reaching completed status</p>
          </FeatureCard>
          <FeatureCard variant="success" icon={Star} title="Satisfaction Score">
            <p className="text-sm mt-2">Average rating from post-course evaluations</p>
          </FeatureCard>
          <FeatureCard variant="info" icon={Brain} title="Knowledge Gain">
            <p className="text-sm mt-2">Quiz score improvement (pre vs post)</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={TrendingUp} title="NPS Score">
            <p className="text-sm mt-2">Net Promoter Score from learner feedback</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Course Scorecard Metrics</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status Thresholds</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Completion Rate</TableCell>
              <TableCell><code>lms_enrollments</code></TableCell>
              <TableCell>≥85%</TableCell>
              <TableCell>
                <Badge variant="default">≥85%</Badge>{' '}
                <Badge variant="secondary">70-84%</Badge>{' '}
                <Badge variant="destructive">&lt;70%</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Avg Quiz Score</TableCell>
              <TableCell><code>lms_quiz_attempts</code></TableCell>
              <TableCell>≥80%</TableCell>
              <TableCell>
                <Badge variant="default">≥80%</Badge>{' '}
                <Badge variant="secondary">65-79%</Badge>{' '}
                <Badge variant="destructive">&lt;65%</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Satisfaction Rating</TableCell>
              <TableCell><code>training_evaluation_responses</code></TableCell>
              <TableCell>≥4.0/5.0</TableCell>
              <TableCell>
                <Badge variant="default">≥4.0</Badge>{' '}
                <Badge variant="secondary">3.0-3.9</Badge>{' '}
                <Badge variant="destructive">&lt;3.0</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Time to Complete</TableCell>
              <TableCell><code>lms_enrollments</code></TableCell>
              <TableCell>≤Estimated</TableCell>
              <TableCell>Within 20% of estimated duration</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.7.1: Course Effectiveness Scorecard with multi-dimensional metrics"
        alt="Course list with effectiveness scores, trend sparklines, and action recommendations"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_course_reviews Table</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Learner feedback collection for satisfaction metrics:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code>id</code></TableCell>
                  <TableCell>uuid (PK)</TableCell>
                  <TableCell>Unique review identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>course_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to lms_courses.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>user_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to profiles.id (reviewer)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>rating</code></TableCell>
                  <TableCell>integer (1-5)</TableCell>
                  <TableCell>Star rating for satisfaction score</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>review_text</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Optional written feedback</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>is_anonymous</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>Whether review is anonymous</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>helpful_count</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Number of "helpful" votes from other learners</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>created_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Review submission timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <TipCallout title="Course Improvement Actions">
        Courses scoring below thresholds trigger automatic recommendations:
        content review, instructor feedback, or retirement consideration.
      </TipCallout>
    </div>
  );
}

export function LndAnalyticsKirkpatrick() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The Kirkpatrick Model is the industry-standard framework for evaluating training effectiveness.
          HRplus implements all four levels via the <code>training_evaluations</code> and 
          <code>training_evaluation_responses</code> tables with configurable evaluation templates.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Four-Level Framework</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">Level 1</Badge>
                <h4 className="font-semibold">Reaction</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                How participants felt about the training experience
              </p>
              <ul className="text-xs space-y-1">
                <li>• Post-training satisfaction surveys</li>
                <li>• Instructor rating (1-5 scale)</li>
                <li>• Content relevance feedback</li>
                <li>• Facility/platform usability</li>
              </ul>
              <p className="text-xs mt-2 font-medium">Timing: Immediately after training</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600">Level 2</Badge>
                <h4 className="font-semibold">Learning</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Knowledge and skills actually gained
              </p>
              <ul className="text-xs space-y-1">
                <li>• Pre/post knowledge assessments</li>
                <li>• Quiz and exam scores</li>
                <li>• Skills demonstration tests</li>
                <li>• Knowledge retention checks</li>
              </ul>
              <p className="text-xs mt-2 font-medium">Timing: During and immediately after</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-600 text-yellow-950">Level 3</Badge>
                <h4 className="font-semibold">Behavior</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Application of learning on the job
              </p>
              <ul className="text-xs space-y-1">
                <li>• Manager observation assessments</li>
                <li>• 30/60/90 day behavior checks</li>
                <li>• Skills transfer index surveys</li>
                <li>• Peer feedback collection</li>
              </ul>
              <p className="text-xs mt-2 font-medium">Timing: 30-90 days post-training</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-600">Level 4</Badge>
                <h4 className="font-semibold">Results</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Business impact of the training
              </p>
              <ul className="text-xs space-y-1">
                <li>• KPI improvement tracking</li>
                <li>• Productivity metrics</li>
                <li>• Quality/error rate changes</li>
                <li>• Revenue/cost impact analysis</li>
              </ul>
              <p className="text-xs mt-2 font-medium">Timing: 3-12 months post-training</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Database Implementation</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table</TableHead>
              <TableHead>Key Fields</TableHead>
              <TableHead>Purpose</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code>training_evaluations</code></TableCell>
              <TableCell>
                <code>evaluation_level</code> (1-4),{' '}
                <code>questions</code> (jsonb)
              </TableCell>
              <TableCell>Evaluation template definitions by Kirkpatrick level</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>training_evaluation_responses</code></TableCell>
              <TableCell>
                <code>responses</code> (jsonb),{' '}
                <code>overall_rating</code>
              </TableCell>
              <TableCell>Individual learner responses to evaluations</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.8.1: Kirkpatrick Model Dashboard showing 4-level evaluation results"
        alt="Four-column layout with Level 1-4 metrics, trend charts, and drill-down options"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Creating Evaluations by Level</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Navigate to <strong>Training → Admin → Evaluations</strong> to create level-specific templates:
            </p>
            <ol className="space-y-2 text-sm">
              <li>1. Click <strong>New Evaluation</strong></li>
              <li>2. Select the Kirkpatrick Level (1-4)</li>
              <li>3. Add questions appropriate to the level</li>
              <li>4. Configure question types (rating, multiple choice, open text)</li>
              <li>5. Link to specific courses or make organization-wide</li>
              <li>6. Set activation status</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <InfoCallout title="Industry Best Practice">
        While Level 1 and 2 evaluations are commonly implemented, Levels 3 and 4 require more 
        organizational commitment. Start with Levels 1-2, then progressively add behavior and 
        results tracking as your evaluation maturity increases.
      </InfoCallout>
    </div>
  );
}

export function LndAnalyticsROI() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Training ROI Analysis calculates the return on investment for learning programs by comparing
          training costs against measurable business outcomes. This section extends Kirkpatrick Level 4
          with financial impact quantification.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">ROI Formula</h3>
        <Card>
          <CardContent className="pt-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-lg font-mono">
                ROI (%) = [(Benefits - Costs) / Costs] × 100
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium mb-2">Training Costs Include:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Course development/licensing</li>
                  <li>• Instructor fees</li>
                  <li>• Facilities/platform costs</li>
                  <li>• Learner time (opportunity cost)</li>
                  <li>• Materials and equipment</li>
                  <li>• Administration overhead</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Benefits Include:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Productivity improvements</li>
                  <li>• Error/defect reduction</li>
                  <li>• Time savings</li>
                  <li>• Reduced turnover costs</li>
                  <li>• Compliance penalty avoidance</li>
                  <li>• Revenue generation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Data Sources for ROI</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={DollarSign} title="Cost Data">
            <ul className="text-sm mt-2 space-y-1">
              <li><code>training_budgets.spent_amount</code></li>
              <li><code>vendor_contracts.contract_value</code></li>
              <li><code>training_sessions.total_cost</code></li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="success" icon={TrendingUp} title="Benefit Data">
            <ul className="text-sm mt-2 space-y-1">
              <li><code>skills_transfer_assessments</code></li>
              <li><code>transfer_benchmarks</code></li>
              <li>Performance KPIs (external integration)</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">ROI Calculation Methods</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Best For</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Cost-Benefit Analysis</TableCell>
              <TableCell>Direct comparison of monetary costs vs monetary benefits</TableCell>
              <TableCell>Technical/procedural training with measurable outputs</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Phillips ROI Methodology</TableCell>
              <TableCell>5-level model extending Kirkpatrick with financial ROI</TableCell>
              <TableCell>Leadership and soft-skills programs</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Utility Analysis</TableCell>
              <TableCell>Estimates value of improved job performance</TableCell>
              <TableCell>Sales, customer service training</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.9.1: Training ROI Dashboard with cost-benefit breakdown"
        alt="ROI calculator showing cost inputs, benefit calculations, and ROI percentage with trend"
      />

      <WarningCallout title="Benefit Attribution">
        Isolating training's contribution to business outcomes is challenging. Use control groups,
        trend analysis, or expert estimation to account for non-training factors affecting results.
      </WarningCallout>

      <section>
        <h3 className="text-lg font-semibold mb-3">Cost-Per-Learner Metric</h3>
        <Card>
          <CardContent className="pt-4">
            <div className="bg-muted p-4 rounded-lg text-center mb-4">
              <p className="text-lg font-mono">
                Cost Per Learner = Total Training Spend / Unique Learners
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Track this metric by category, department, and vendor to identify cost optimization 
              opportunities. Industry benchmarks typically range from $500-$1,500 per employee annually.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Clock, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, WarningCallout, TipCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The Training Analytics Dashboard (TrainingAnalytics.tsx) provides a centralized view of all 
          learning and development metrics. Access via <strong>Training → Analytics</strong> in the main navigation.
          The dashboard aggregates data from multiple tables including lms_enrollments, lms_courses, 
          lms_quiz_attempts, lms_certificates, training_budgets, and compliance_training_assignments.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Dashboard Access Points</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Access Method</TableHead>
              <TableHead>Navigation Path</TableHead>
              <TableHead>User Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Main Analytics Page</TableCell>
              <TableCell><code>Training → Analytics</code></TableCell>
              <TableCell>L&D Admin, HR Partner</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Manager Team View</TableCell>
              <TableCell><code>Training → My Team Training</code></TableCell>
              <TableCell>Manager</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Compliance Dashboard</TableCell>
              <TableCell><code>Training → Compliance → Dashboard</code></TableCell>
              <TableCell>Compliance Officer</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">AI Reports</TableCell>
              <TableCell><code>Training → Analytics → AI-BI Reports</code></TableCell>
              <TableCell>Admin</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.1.1: Training Analytics Dashboard with KPI cards and trend visualizations"
        alt="Dashboard showing 8 KPI cards at top, enrollment trends bar chart, and status distribution pie chart"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Dashboard Tabs</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={BarChart3} title="Overview Tab">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Monthly enrollment bar chart</li>
              <li>• Enrollment status pie chart</li>
              <li>• Side-by-side comparison view</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="success" icon={TrendingUp} title="Trends Tab">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Completions over time (area chart)</li>
              <li>• Certifications issued trend</li>
              <li>• 12-month rolling view</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="info" icon={BookOpen} title="Distribution Tab">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Courses by category (pie chart)</li>
              <li>• Category breakdown with labels</li>
              <li>• Drill-down to course list</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Award} title="Top Courses Tab">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Most popular courses ranked</li>
              <li>• Enrollment count per course</li>
              <li>• Quick access to course details</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Data Sources</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Source Table</TableHead>
                <TableHead>Key Fields</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Courses</TableCell>
                <TableCell><code>lms_courses</code></TableCell>
                <TableCell>is_published = true, company_id</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Enrollments</TableCell>
                <TableCell><code>lms_enrollments</code></TableCell>
                <TableCell>status, enrolled_at, completed_at</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Completion Rate</TableCell>
                <TableCell><code>lms_enrollments</code></TableCell>
                <TableCell>status = 'completed' / total</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Quiz Scores</TableCell>
                <TableCell><code>lms_quiz_attempts</code></TableCell>
                <TableCell>score, max_score, percentage</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Certifications</TableCell>
                <TableCell><code>lms_certificates</code></TableCell>
                <TableCell>issued_at, expires_at</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Budget</TableCell>
                <TableCell><code>training_budgets</code></TableCell>
                <TableCell>allocated_amount, spent_amount</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Compliance</TableCell>
                <TableCell><code>compliance_training_assignments</code></TableCell>
                <TableCell>status = 'completed' / total</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <TipCallout title="Year Filter">
        Use the year selector at the top of the dashboard to compare metrics across fiscal years.
        Budget utilization and compliance metrics are scoped to the selected year.
      </TipCallout>

      <InfoCallout title="Real-Time Updates">
        Dashboard data refreshes automatically when enrollments, completions, or quiz attempts are recorded.
        For large organizations, data may be cached for up to 5 minutes to optimize performance.
      </InfoCallout>
    </div>
  );
}

export function LndAnalyticsKPICards() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The dashboard displays 8 key performance indicator (KPI) cards providing at-a-glance insights 
          into training program health. Each card shows a metric value with an icon indicator and 
          color-coded status.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">KPI Card Reference</h3>
        <FeatureCardGrid columns={4}>
          <FeatureCard variant="primary" icon={BookOpen} title="Total Courses">
            <p className="text-sm mt-2">Count of published courses for the company</p>
            <code className="text-xs block mt-1">lms_courses.is_published = true</code>
          </FeatureCard>
          <FeatureCard variant="info" icon={Users} title="Enrollments">
            <p className="text-sm mt-2">Total learner enrollments across all courses</p>
            <code className="text-xs block mt-1">lms_enrollments.count()</code>
          </FeatureCard>
          <FeatureCard variant="success" icon={CheckCircle} title="Completion Rate">
            <p className="text-sm mt-2">Percentage of enrollments with status = completed</p>
            <code className="text-xs block mt-1">completed / total × 100</code>
          </FeatureCard>
          <FeatureCard variant="warning" icon={TrendingUp} title="Avg Quiz Score">
            <p className="text-sm mt-2">Mean percentage across all quiz attempts</p>
            <code className="text-xs block mt-1">AVG(score/max_score × 100)</code>
          </FeatureCard>
          <FeatureCard variant="purple" icon={Award} title="Certifications">
            <p className="text-sm mt-2">Total certificates issued (all time)</p>
            <code className="text-xs block mt-1">lms_certificates.count()</code>
          </FeatureCard>
          <FeatureCard variant="orange" icon={Clock} title="Training Hours">
            <p className="text-sm mt-2">Estimated total hours (enrollments × 2hr avg)</p>
            <code className="text-xs block mt-1">enrollments × 2</code>
          </FeatureCard>
          <FeatureCard variant="warning" icon={AlertTriangle} title="Compliance Rate">
            <p className="text-sm mt-2">Mandatory training completion percentage</p>
            <code className="text-xs block mt-1">Green ≥80%, Red &lt;80%</code>
          </FeatureCard>
          <FeatureCard variant="info" icon={DollarSign} title="Budget Used">
            <p className="text-sm mt-2">Percentage of training budget spent</p>
            <code className="text-xs block mt-1">spent_amount / total_budget × 100</code>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">KPI Calculation Logic</h3>
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`// Completion Rate Calculation
const enrollments = await supabase
  .from("lms_enrollments")
  .select("status")
  .eq("company_id", companyId);

const completedCount = enrollments.filter(e => e.status === "completed").length;
const completionRate = (completedCount / enrollments.length) * 100;

// Avg Quiz Score Calculation
const quizAttempts = await supabase
  .from("lms_quiz_attempts")
  .select("score, max_score");

const avgScore = quizAttempts.reduce((sum, a) => 
  sum + (a.score / a.max_score) * 100, 0) / quizAttempts.length;`}
            </pre>
          </CardContent>
        </Card>
      </section>

      <WarningCallout title="Data Freshness">
        KPI values are calculated in real-time on dashboard load. For organizations with 10,000+ enrollments,
        consider implementing materialized views or scheduled aggregation jobs to improve load times.
      </WarningCallout>
    </div>
  );
}

export function LndAnalyticsExecutiveViews() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Executive summary views provide role-appropriate dashboards for different organizational levels.
          C-suite executives see strategic metrics while HR partners access operational details.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Role-Based Views</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Persona</TableHead>
              <TableHead>Primary Metrics</TableHead>
              <TableHead>Drill-Down Access</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">CEO/CHRO</TableCell>
              <TableCell>Training ROI, Compliance %, Budget utilization, Strategic skill gaps</TableCell>
              <TableCell>Department summaries only</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">VP HR/L&D Director</TableCell>
              <TableCell>Completion trends, Course effectiveness, Vendor performance</TableCell>
              <TableCell>Course-level and team-level</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">HR Business Partner</TableCell>
              <TableCell>Team completion rates, Overdue training, Skill gap heat maps</TableCell>
              <TableCell>Individual learner details</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Department Manager</TableCell>
              <TableCell>Direct reports progress, Expiring certifications, Compliance status</TableCell>
              <TableCell>Own team only</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Strategic Metrics for Executives</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={TrendingUp} title="Training ROI">
            <p className="text-sm mt-2">Business impact vs training investment</p>
            <p className="text-xs text-muted-foreground mt-1">Formula: (Benefit - Cost) / Cost × 100</p>
          </FeatureCard>
          <FeatureCard variant="success" icon={CheckCircle} title="Compliance Coverage">
            <p className="text-sm mt-2">% of mandatory training completed org-wide</p>
            <p className="text-xs text-muted-foreground mt-1">Threshold: Green ≥95%, Yellow 80-94%, Red &lt;80%</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Users} title="Learning Engagement">
            <p className="text-sm mt-2">Active learners / total employees ratio</p>
            <p className="text-xs text-muted-foreground mt-1">Industry benchmark: 60-70%</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.3.1: Executive dashboard with strategic training metrics and trend indicators"
        alt="High-level dashboard showing ROI gauge, compliance bar, and engagement funnel"
      />

      <InfoCallout title="Export Options">
        Executives can export summary reports as PDF for board presentations or schedule automated 
        delivery via the Scheduled Reports feature (Section 7.17).
      </InfoCallout>
    </div>
  );
}

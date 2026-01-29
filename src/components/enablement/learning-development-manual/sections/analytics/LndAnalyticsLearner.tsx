import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Award, FileCheck, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsLearnerProgress() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Learner Progress Reports provide individual-level tracking of learning activities, course completions,
          and skill development. Data is sourced from <code>lms_enrollments</code> with status tracking,
          progress percentage, and timeline fields.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Enrollment Status Lifecycle</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline">enrolled</Badge>
          <span>→</span>
          <Badge variant="secondary">in_progress</Badge>
          <span>→</span>
          <Badge variant="default">completed</Badge>
          <span>|</span>
          <Badge variant="destructive">expired</Badge>
          <span>|</span>
          <Badge variant="outline">cancelled</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Database Field</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge variant="outline">enrolled</Badge></TableCell>
              <TableCell>User enrolled or assigned to course</TableCell>
              <TableCell><code>enrolled_at</code> timestamp set</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="secondary">in_progress</Badge></TableCell>
              <TableCell>First lesson/module accessed</TableCell>
              <TableCell><code>started_at</code> timestamp set</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="default">completed</Badge></TableCell>
              <TableCell>All required content + quizzes passed</TableCell>
              <TableCell><code>completed_at</code> timestamp set</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="destructive">expired</Badge></TableCell>
              <TableCell>Due date passed without completion</TableCell>
              <TableCell><code>due_date &lt; NOW()</code> + not completed</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Progress Tracking Fields</h3>
        <Card>
          <CardContent className="pt-4">
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
                  <TableCell><code>progress_percentage</code></TableCell>
                  <TableCell>integer (0-100)</TableCell>
                  <TableCell>Overall course progress based on completed modules/lessons</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>enrolled_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When the learner was enrolled (self or assigned)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>started_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When the learner first accessed course content</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>completed_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When all requirements were fulfilled</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>due_date</code></TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>Target completion date (from assignment or enrollment)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.4.1: Learner Progress Report showing timeline and completion status"
        alt="Individual learner view with course list, progress bars, and completion dates"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Report Views</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={User} title="Individual View">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• All enrollments for a single learner</li>
              <li>• Course-by-course progress bars</li>
              <li>• Learning history timeline</li>
              <li>• Skill acquisition tracking</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="info" icon={TrendingUp} title="Cohort View">
            <ul className="space-y-1 mt-2 text-sm">
              <li>• Group-based progress comparison</li>
              <li>• Onboarding batch tracking</li>
              <li>• Department-level rollups</li>
              <li>• Learning path progression</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <TipCallout title="ESS Access">
        Employees can view their own learning progress via <strong>My Learning → My Progress</strong>
        in the Employee Self-Service portal.
      </TipCallout>
    </div>
  );
}

export function LndAnalyticsCertificationTracking() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Certification tracking monitors certificate issuance, expiry dates, and renewal status via
          the <code>lms_certificates</code> table. Integration with compliance training ensures 
          mandatory certifications are tracked for regulatory requirements.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Certificate Data Model</h3>
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
              <TableCell><code>certificate_number</code></TableCell>
              <TableCell>text</TableCell>
              <TableCell>Unique certificate identifier for verification</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>verification_code</code></TableCell>
              <TableCell>text</TableCell>
              <TableCell>Public verification code for external validation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>issued_at</code></TableCell>
              <TableCell>timestamptz</TableCell>
              <TableCell>Certificate issue date (on course completion)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>expires_at</code></TableCell>
              <TableCell>timestamptz</TableCell>
              <TableCell>Expiry date (nullable for non-expiring certs)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>final_score</code></TableCell>
              <TableCell>integer</TableCell>
              <TableCell>Quiz/assessment score achieved</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Certification Analytics</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="success" icon={Award} title="Active Certifications">
            <p className="text-sm mt-2">Certificates issued where expires_at IS NULL or expires_at &gt; NOW()</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Clock} title="Expiring Soon">
            <p className="text-sm mt-2">expires_at within next 60 days triggers renewal alerts</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={AlertCircle} title="Expired">
            <p className="text-sm mt-2">expires_at &lt; NOW() requires recertification</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.5.1: Certification tracking dashboard with expiry timeline"
        alt="Certificate list with status badges, expiry countdown, and renewal action buttons"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Expiry Alert Configuration</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Configure automated expiry reminders via <strong>Admin → Notifications → Training Templates</strong>:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge variant="outline">90 days</Badge>
                <span>First reminder - informational</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="secondary">60 days</Badge>
                <span>Second reminder - action recommended</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="default">30 days</Badge>
                <span>Urgent reminder + manager notification</span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="destructive">Expired</Badge>
                <span>Non-compliance alert to HR/Compliance</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <InfoCallout title="Verification Portal">
        External parties can verify certificates using the public verification URL:
        <code className="ml-2">/verify/certificate/{'{verification_code}'}</code>
      </InfoCallout>
    </div>
  );
}

export function LndAnalyticsQuizPerformance() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Quiz Performance Analytics track learner assessment results via the <code>lms_quiz_attempts</code>
          table. Detailed scoring, time tracking, and attempt history enable identification of 
          knowledge gaps and course improvement opportunities.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Quiz Attempt Data Model</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Analytics Use</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><code>score</code></TableCell>
              <TableCell>integer</TableCell>
              <TableCell>Points earned (raw score)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>max_score</code></TableCell>
              <TableCell>integer</TableCell>
              <TableCell>Total possible points</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>percentage</code></TableCell>
              <TableCell>numeric</TableCell>
              <TableCell>Calculated score percentage</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>passed</code></TableCell>
              <TableCell>boolean</TableCell>
              <TableCell>Met passing threshold</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>time_spent_seconds</code></TableCell>
              <TableCell>integer</TableCell>
              <TableCell>Duration from start to submission</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>attempt_number</code></TableCell>
              <TableCell>integer</TableCell>
              <TableCell>Sequential attempt count (1, 2, 3...)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><code>answers</code></TableCell>
              <TableCell>jsonb</TableCell>
              <TableCell>Question-by-question responses for item analysis</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Analytics Metrics</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={TrendingUp} title="Pass Rate">
            <p className="text-sm mt-2">Percentage of attempts where passed = true</p>
            <code className="text-xs block mt-1">SUM(passed) / COUNT(*) × 100</code>
          </FeatureCard>
          <FeatureCard variant="info" icon={Clock} title="Avg Completion Time">
            <p className="text-sm mt-2">Mean time_spent_seconds across attempts</p>
            <code className="text-xs block mt-1">AVG(time_spent_seconds) / 60 = minutes</code>
          </FeatureCard>
          <FeatureCard variant="warning" icon={FileCheck} title="Retry Rate">
            <p className="text-sm mt-2">% of learners needing multiple attempts</p>
            <code className="text-xs block mt-1">Attempts with attempt_number &gt; 1</code>
          </FeatureCard>
          <FeatureCard variant="success" icon={Award} title="Score Distribution">
            <p className="text-sm mt-2">Histogram of percentage scores</p>
            <code className="text-xs block mt-1">GROUP BY FLOOR(percentage/10)*10</code>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.6.1: Quiz Performance Analytics with score distribution and trend analysis"
        alt="Dashboard showing pass rate gauge, score histogram, and question-level item analysis"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Item Analysis</h3>
        <p className="text-muted-foreground mb-3">
          The <code>answers</code> JSONB field enables question-level analysis to identify:
        </p>
        <ul className="space-y-2 text-sm">
          <li>• <strong>Difficult questions:</strong> Low correct response rate across attempts</li>
          <li>• <strong>Ambiguous questions:</strong> High variance in answer selection</li>
          <li>• <strong>Time sinks:</strong> Questions taking disproportionate completion time</li>
          <li>• <strong>Knowledge gaps:</strong> Topics with consistently low scores</li>
        </ul>
      </section>

      <WarningCallout title="Privacy Consideration">
        Individual quiz answers may contain sensitive performance data. Ensure role-based access 
        controls limit detailed answer analysis to L&D administrators and course instructors.
      </WarningCallout>
    </div>
  );
}

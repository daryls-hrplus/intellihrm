import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Route, Target, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsLearningPaths() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Learning Path Analytics track progress through structured course sequences via 
          <code>learning_path_enrollments</code> and <code>learning_path_course_progress</code> tables.
          This enables visibility into multi-course journey completion rates, milestone achievement,
          and path effectiveness. Extends Chapter 2.6 (Learning Paths) with analytics focus.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">learning_path_enrollments Table Schema</h3>
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
                  <TableCell><code>id</code></TableCell>
                  <TableCell>uuid (PK)</TableCell>
                  <TableCell>Unique path enrollment identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>learning_path_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to learning_paths.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>user_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to profiles.id (learner)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>company_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Multi-tenant company scope</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>enrolled, in_progress, completed, abandoned</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>progress_percentage</code></TableCell>
                  <TableCell>integer (0-100)</TableCell>
                  <TableCell>Overall path completion based on course progress</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>current_course_index</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Position in the path sequence (1-based)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>enrolled_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Path enrollment timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>started_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>First course access timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>completed_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Path completion timestamp</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>due_date</code></TableCell>
                  <TableCell>date</TableCell>
                  <TableCell>Target path completion date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>enrolled_by</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>User who enrolled (self or manager)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>source_type</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>self, manager_assigned, onboarding, appraisal</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">learning_path_course_progress Table</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Granular tracking of individual course progress within a learning path:
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
                  <TableCell><code>path_enrollment_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to learning_path_enrollments.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>course_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to lms_courses.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>sequence_order</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Position in path sequence</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>is_required</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>Whether course is mandatory for path completion</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>status</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>not_started, in_progress, completed, skipped</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>enrollment_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Link to lms_enrollments.id for this course</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>unlocked_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When course became available (prereqs met)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>completed_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Course completion within path context</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.21.1: Learning Path Analytics Dashboard with completion funnel and milestone tracking"
        alt="Funnel chart showing path progression, milestone completion rates, and drop-off analysis"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Key Learning Path Metrics</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="success" icon={Target} title="Path Completion Rate">
            <p className="text-sm mt-2">% of enrollments reaching status = 'completed'</p>
            <code className="text-xs block mt-1">Industry benchmark: 40-60%</code>
          </FeatureCard>
          <FeatureCard variant="info" icon={Clock} title="Avg Time to Complete">
            <p className="text-sm mt-2">Mean days from enrolled_at to completed_at</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={AlertTriangle} title="Drop-off Points">
            <p className="text-sm mt-2">Course positions with highest abandonment</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Path Funnel Analysis</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Track learner progression through each path stage:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="w-8 text-center">1</Badge>
                <div className="flex-1 bg-primary/20 h-4 rounded" style={{ width: '100%' }} />
                <span className="text-sm w-20">100% enrolled</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="w-8 text-center">2</Badge>
                <div className="flex-1 bg-primary/40 h-4 rounded" style={{ width: '85%' }} />
                <span className="text-sm w-20">85% started</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="w-8 text-center">3</Badge>
                <div className="flex-1 bg-primary/60 h-4 rounded" style={{ width: '65%' }} />
                <span className="text-sm w-20">65% course 2</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="w-8 text-center">4</Badge>
                <div className="flex-1 bg-primary/80 h-4 rounded" style={{ width: '48%' }} />
                <span className="text-sm w-20">48% course 3</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="w-8 text-center">✓</Badge>
                <div className="flex-1 bg-primary h-4 rounded" style={{ width: '42%' }} />
                <span className="text-sm w-20">42% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Path Effectiveness by Type</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path Type</TableHead>
              <TableHead>Typical Length</TableHead>
              <TableHead>Expected Completion Rate</TableHead>
              <TableHead>Key Success Factor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Onboarding</TableCell>
              <TableCell>3-5 courses</TableCell>
              <TableCell>85-95%</TableCell>
              <TableCell>Manager follow-up, deadline enforcement</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Certification Prep</TableCell>
              <TableCell>5-8 courses</TableCell>
              <TableCell>60-75%</TableCell>
              <TableCell>External certification incentive</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Leadership Development</TableCell>
              <TableCell>8-12 courses</TableCell>
              <TableCell>40-55%</TableCell>
              <TableCell>Cohort learning, executive sponsorship</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Technical Skills</TableCell>
              <TableCell>4-6 courses</TableCell>
              <TableCell>55-70%</TableCell>
              <TableCell>Immediate job application</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <TipCallout title="Improving Path Completion">
        Paths with 3-5 courses have 40% higher completion rates than longer paths.
        Consider breaking long journeys into sequential paths with milestone certificates.
      </TipCallout>

      <WarningCallout title="Abandoned Paths">
        Monitor paths where progress_percentage stalls between 20-40% for more than 30 days.
        These learners may benefit from proactive manager outreach or content updates.
      </WarningCallout>

      <InfoCallout title="Cross-Reference">
        For learning path creation and configuration, see <strong>Chapter 2.6: Learning Paths</strong>.
      </InfoCallout>
    </div>
  );
}

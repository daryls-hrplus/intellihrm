import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, AlertTriangle, Award, BarChart3, TrendingUp, Building } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsManagerTeamView() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          The Manager Team Training View (<code>ManagerTeamTrainingCard.tsx</code>) provides managers
          with visibility into their direct reports' training status. Access via 
          <strong> Training → My Team Training</strong> or from the Manager Self-Service dashboard.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Dashboard Tabs</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={Users} title="Overview">
            <ul className="text-sm mt-2 space-y-1">
              <li>• Team size and training coverage</li>
              <li>• Overall completion rate</li>
              <li>• At-a-glance status summary</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="warning" icon={AlertTriangle} title="Overdue">
            <ul className="text-sm mt-2 space-y-1">
              <li>• List of overdue assignments</li>
              <li>• Days overdue indicator</li>
              <li>• Quick action to send reminder</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="info" icon={Award} title="Expiring Certs">
            <ul className="text-sm mt-2 space-y-1">
              <li>• Certifications expiring in 60 days</li>
              <li>• Expiry countdown</li>
              <li>• Recertification enrollment link</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Team Member Summary</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              For each direct report, the manager sees:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Point</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Display</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Total Assigned</TableCell>
                  <TableCell><code>lms_enrollments</code></TableCell>
                  <TableCell>Count of all enrollments</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Completed</TableCell>
                  <TableCell><code>status = 'completed'</code></TableCell>
                  <TableCell>Count with completion badge</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>In Progress</TableCell>
                  <TableCell><code>status = 'in_progress'</code></TableCell>
                  <TableCell>Count with progress bar</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Overdue</TableCell>
                  <TableCell><code>due_date &lt; NOW()</code></TableCell>
                  <TableCell>Count with alert indicator</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Completion Rate</TableCell>
                  <TableCell>Calculated</TableCell>
                  <TableCell>Percentage with color coding</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.14.1: Manager Team Training Dashboard with direct report status"
        alt="Team grid showing employee cards with progress bars, overdue alerts, and certification expiry warnings"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Manager Actions</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">Remind</Badge>
            <span>Send training reminder to individual team member</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">Extend</Badge>
            <span>Request grace period extension for due dates</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">Assign</Badge>
            <span>Assign additional training to team members</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline" className="mt-0.5">Exempt</Badge>
            <span>Request exemption for compliance training</span>
          </li>
        </ul>
      </section>

      <TipCallout title="Scheduled Alerts">
        Managers receive automated weekly email summaries of team training status.
        Configure preferences in <strong>User Settings → Notifications → Training Alerts</strong>.
      </TipCallout>

      <InfoCallout title="Visibility Scope">
        Managers only see training data for their direct reports (profiles.manager_id = user.id).
        For skip-level visibility, HR partners should use department rollup reports.
      </InfoCallout>
    </div>
  );
}

export function LndAnalyticsDepartmentRollup() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Department Rollup Reports aggregate training metrics at the department level,
          enabling cross-team comparison, skill gap heatmaps, and training investment analysis.
          Useful for HR Business Partners and Department Heads managing multiple teams.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Rollup Metrics</h3>
        <FeatureCardGrid columns={2}>
          <FeatureCard variant="primary" icon={BarChart3} title="Completion Rollup">
            <ul className="text-sm mt-2 space-y-1">
              <li>• Department completion rate</li>
              <li>• Team-by-team breakdown</li>
              <li>• Trend vs previous period</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="success" icon={TrendingUp} title="Skill Coverage">
            <ul className="text-sm mt-2 space-y-1">
              <li>• Skills trained vs required</li>
              <li>• Gap heatmap by skill area</li>
              <li>• Certification coverage %</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="info" icon={Users} title="Engagement Metrics">
            <ul className="text-sm mt-2 space-y-1">
              <li>• Active learners / total headcount</li>
              <li>• Avg courses per employee</li>
              <li>• Voluntary vs mandatory ratio</li>
            </ul>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Building} title="Investment Analysis">
            <ul className="text-sm mt-2 space-y-1">
              <li>• Training spend per department</li>
              <li>• Cost per learner comparison</li>
              <li>• Budget utilization by team</li>
            </ul>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Comparison View</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Compare departments across key training dimensions:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dimension</TableHead>
                  <TableHead>Calculation</TableHead>
                  <TableHead>Benchmark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Completion Rate</TableCell>
                  <TableCell>Completed / Total Enrolled × 100</TableCell>
                  <TableCell>Org Average</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Compliance Rate</TableCell>
                  <TableCell>Compliant / Total Required × 100</TableCell>
                  <TableCell>100% target</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Avg Quiz Score</TableCell>
                  <TableCell>Mean percentage across attempts</TableCell>
                  <TableCell>80% passing</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Training Hours</TableCell>
                  <TableCell>Sum of course durations completed</TableCell>
                  <TableCell>40 hrs/year/employee</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.15.1: Department Rollup Report with cross-team comparison"
        alt="Table showing departments with metrics, bar charts for comparison, and drill-down links"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Skill Gap Heatmap</h3>
        <p className="text-sm text-muted-foreground mb-3">
          The heatmap visualizes skill coverage gaps by department:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>High coverage (&gt;80% employees certified)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Moderate coverage (50-80%)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Low coverage (&lt;50%) - action required</span>
          </li>
        </ul>
      </section>

      <TipCallout title="Drill-Down Navigation">
        Click any department row to drill down to team-level details, then to individual
        employee learning records. Use workspace tabs to compare multiple departments.
      </TipCallout>
    </div>
  );
}

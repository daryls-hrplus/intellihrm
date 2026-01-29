import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Award, Star, TrendingUp, Zap, Users } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';
import { FeatureCard, FeatureCardGrid, InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components';

export function LndAnalyticsGamification() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Gamification analytics track learner engagement through points, badges, and leaderboards.
          Data is captured in <code>lms_user_points</code>, <code>lms_user_badges</code>, 
          <code>lms_leaderboards</code>, and <code>lms_point_transactions</code> tables.
          This section extends Chapter 2.12 (Badges & Gamification) with analytics-focused metrics.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_user_points Table Schema</h3>
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
                  <TableCell>Unique record identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>user_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to profiles.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>company_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Multi-tenant company scope</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>total_points</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Cumulative points balance</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>current_level</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Calculated level based on points thresholds</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>points_this_month</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Points earned in current calendar month</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>points_this_quarter</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Points earned in current quarter</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>last_points_earned_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Most recent point earning activity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>streak_days</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Consecutive days with learning activity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>longest_streak</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Historical best streak (days)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>updated_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Last modification timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_user_badges Table Schema</h3>
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
                  <TableCell>Unique award record identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>user_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to profiles.id (earner)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>badge_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to lms_badges.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>earned_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>When the badge was awarded</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>awarded_by</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>For manual awards: awarder's profile ID</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>source_type</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>auto (system) or manual (human awarded)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>source_reference_id</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>e.g., enrollment_id that triggered the badge</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>is_visible</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>Show on public profile</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_leaderboards Table Schema</h3>
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
                  <TableCell>Leaderboard identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>company_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Multi-tenant company scope</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>name</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Leaderboard display name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>leaderboard_type</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>points, completions, badges, streak</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>scope</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>company, department, team, course</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>scope_id</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>Reference ID for scoped leaderboards</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>time_period</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>all_time, monthly, weekly, quarterly</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>is_active</code></TableCell>
                  <TableCell>boolean</TableCell>
                  <TableCell>Whether leaderboard is visible</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>display_top_n</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Number of leaders to display (e.g., top 10)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">lms_point_transactions Table</h3>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              Audit trail for all point awards and deductions:
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
                  <TableCell>Transaction identifier</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>user_id</code></TableCell>
                  <TableCell>uuid (FK)</TableCell>
                  <TableCell>Reference to profiles.id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>points</code></TableCell>
                  <TableCell>integer</TableCell>
                  <TableCell>Points awarded (positive) or deducted (negative)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>transaction_type</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>course_completion, quiz_pass, badge_earned, streak_bonus, admin_adjustment</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>source_type</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>enrollment, quiz_attempt, badge, manual</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>source_id</code></TableCell>
                  <TableCell>uuid</TableCell>
                  <TableCell>Reference to triggering entity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>description</code></TableCell>
                  <TableCell>text</TableCell>
                  <TableCell>Human-readable transaction description</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code>created_at</code></TableCell>
                  <TableCell>timestamptz</TableCell>
                  <TableCell>Transaction timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.20.1: Gamification Analytics Dashboard with leaderboard and engagement metrics"
        alt="Dashboard showing top learners leaderboard, badge distribution chart, and streak analytics"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Gamification Metrics</h3>
        <FeatureCardGrid columns={3}>
          <FeatureCard variant="primary" icon={TrendingUp} title="Engagement Score">
            <p className="text-sm mt-2">Composite score: points + badges + streak</p>
            <code className="text-xs block mt-1">Weighted formula configurable</code>
          </FeatureCard>
          <FeatureCard variant="success" icon={Trophy} title="Badge Earn Rate">
            <p className="text-sm mt-2">Badges earned per active learner per month</p>
          </FeatureCard>
          <FeatureCard variant="warning" icon={Zap} title="Streak Retention">
            <p className="text-sm mt-2">% of learners maintaining 7+ day streaks</p>
          </FeatureCard>
        </FeatureCardGrid>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Leaderboard Best Practices</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leaderboard Type</TableHead>
              <TableHead>Recommended Scope</TableHead>
              <TableHead>Time Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Points</TableCell>
              <TableCell>Department (avoids org-wide competition)</TableCell>
              <TableCell>Monthly (resets encourage ongoing participation)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Completions</TableCell>
              <TableCell>Course-specific (celebrates course champions)</TableCell>
              <TableCell>All-time (recognizes dedication)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Streak</TableCell>
              <TableCell>Company-wide (small cohort is motivating)</TableCell>
              <TableCell>Current (real-time visibility)</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <TipCallout title="Avoiding Gamification Fatigue">
        Rotate badge availability and introduce seasonal challenges to maintain novelty.
        Monitor engagement metrics monthly to detect declining participation.
      </TipCallout>

      <WarningCallout title="Privacy Considerations">
        Allow employees to opt out of public leaderboards via their profile settings.
        Some cultures prefer private recognition over public competition.
      </WarningCallout>

      <InfoCallout title="Cross-Reference">
        For badge configuration and point rules setup, see <strong>Chapter 2.12: Badges & Gamification</strong>.
      </InfoCallout>
    </div>
  );
}

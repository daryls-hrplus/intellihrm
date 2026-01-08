import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Users, 
  Star, 
  Trophy,
  Building2,
  BarChart3,
  Heart,
  TrendingUp,
  CheckCircle2,
  Crown,
  Medal
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  IndustryCallout 
} from '@/components/enablement/manual/components';

export const RecognitionAnalyticsSetup: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div 
        id="hh-7-2" 
        data-manual-anchor="hh-7-2" 
        className="scroll-mt-36"
      >
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm font-medium">7.2</Badge>
          <h3 className="text-xl font-semibold text-foreground">Recognition Analytics</h3>
        </div>
        
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">Recognition Program Effectiveness Dashboard</h4>
                <p className="text-muted-foreground">
                  Recognition Analytics provides insights into how your recognition program is performing, 
                  measuring participation rates, identifying top performers, tracking company values alignment, 
                  and ensuring recognition is distributed equitably across the organization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IndustryCallout>
        <strong>Industry Benchmark:</strong> High-performing organizations achieve 80%+ monthly active 
        recognition participation. Companies with strong recognition programs see 31% lower voluntary 
        turnover (SHRM Research).
      </IndustryCallout>

      {/* Core Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Core Recognition Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The recognition dashboard displays key metrics measured over the last 30 days by default. 
            Use these metrics to assess program health and engagement levels.
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-muted/30 text-center">
              <CardContent className="pt-6">
                <Award className="h-8 w-8 mx-auto text-primary mb-3" />
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Total Recognitions</p>
                <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 mx-auto text-green-500 mb-3" />
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Unique Givers</p>
                <p className="text-xs text-muted-foreground mt-1">Active participants</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 text-center">
              <CardContent className="pt-6">
                <Heart className="h-8 w-8 mx-auto text-pink-500 mb-3" />
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Unique Receivers</p>
                <p className="text-xs text-muted-foreground mt-1">Recognized employees</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 text-center">
              <CardContent className="pt-6">
                <Star className="h-8 w-8 mx-auto text-yellow-500 mb-3" />
                <p className="text-3xl font-bold">--</p>
                <p className="text-sm text-muted-foreground">Points Awarded</p>
                <p className="text-xs text-muted-foreground mt-1">Total distributed</p>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Metric</th>
                  <th className="text-left py-3 px-4 font-medium">What It Measures</th>
                  <th className="text-left py-3 px-4 font-medium">Healthy Target</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Recognition Rate</td>
                  <td className="py-3 px-4 text-muted-foreground">Recognitions per employee per month</td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">≥ 2 per month</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Giver Participation</td>
                  <td className="py-3 px-4 text-muted-foreground">% of employees who gave recognition</td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">≥ 60%</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Receiver Coverage</td>
                  <td className="py-3 px-4 text-muted-foreground">% of employees who received recognition</td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">≥ 70%</Badge></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Points Velocity</td>
                  <td className="py-3 px-4 text-muted-foreground">Rate of points redemption vs. award</td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">40-60% redemption</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recognition by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Recognition by Type Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Understanding the distribution of recognition types helps ensure your program 
            is being used as intended and identifies underutilized award categories.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-semibold">Common Award Types</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span><strong>Peer-to-Peer:</strong> Colleague appreciation and teamwork</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span><strong>Manager Recognition:</strong> Performance acknowledgment</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span><strong>Milestone Awards:</strong> Anniversaries, achievements</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span><strong>Spot Bonus:</strong> Exceptional contributions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full" />
                  <span><strong>Values Champion:</strong> Company values alignment</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold">Analysis Questions</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Is peer-to-peer recognition the dominant type? (Healthy indicator)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Are milestone awards being captured automatically?</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Is manager recognition proportional to team sizes?</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Are values-based awards aligned with strategic priorities?</span>
                </li>
              </ul>
            </div>
          </div>

          <TipCallout>
            If a specific award type has less than 10% usage, consider running a campaign to 
            promote it or review whether it's still relevant to your recognition strategy.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Company Values Alignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Company Values Alignment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Track how recognition reinforces your company values. The Top Company Values chart 
            shows which values are most frequently cited in recognition messages.
          </p>

          <div className="bg-muted/30 p-4 rounded-lg">
            <h5 className="font-semibold mb-3">Values Tracking Features</h5>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Bar Chart Visualization</p>
                <p className="text-sm text-muted-foreground">
                  Horizontal bars showing recognition count for each company value, 
                  ordered by frequency. Quickly identify most reinforced values.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Strategic Alignment</p>
                <p className="text-sm text-muted-foreground">
                  Compare values distribution against strategic priorities. 
                  Low representation of critical values signals coaching opportunity.
                </p>
              </div>
            </div>
          </div>

          <InfoCallout>
            Ensure your company values are configured in the Recognition module settings. 
            Each recognition can be tagged with one or more values to enable this analysis.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Recognition Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Recognition Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The leaderboard showcases top recognition givers and receivers, fostering healthy 
            competition and visibility for active participants.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-200">
              <CardContent className="pt-4 text-center">
                <Crown className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                <p className="font-semibold">#1 Rank</p>
                <p className="text-sm text-muted-foreground">Gold Crown Icon</p>
                <p className="text-xs text-muted-foreground mt-2">Top performer highlighted prominently</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-400/10 to-gray-500/5 border-gray-200">
              <CardContent className="pt-4 text-center">
                <Medal className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="font-semibold">#2 Rank</p>
                <p className="text-sm text-muted-foreground">Silver Medal Icon</p>
                <p className="text-xs text-muted-foreground mt-2">Second place recognition</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-600/10 to-orange-700/5 border-orange-200">
              <CardContent className="pt-4 text-center">
                <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <p className="font-semibold">#3 Rank</p>
                <p className="text-sm text-muted-foreground">Bronze Award Icon</p>
                <p className="text-xs text-muted-foreground mt-2">Third place recognition</p>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Leaderboard Type</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Best Practice</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Top Givers</td>
                  <td className="py-3 px-4 text-muted-foreground">Employees who give recognition most frequently</td>
                  <td className="py-3 px-4 text-muted-foreground">Celebrate in company communications</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Top Receivers</td>
                  <td className="py-3 px-4 text-muted-foreground">Most recognized employees</td>
                  <td className="py-3 px-4 text-muted-foreground">Consider for special awards/visibility</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Points Leaders</td>
                  <td className="py-3 px-4 text-muted-foreground">Highest points accumulated</td>
                  <td className="py-3 px-4 text-muted-foreground">Promote redemption options</td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout>
            Balance gamification with inclusivity. Ensure the leaderboard doesn't inadvertently 
            create cliques or exclude employees with less social visibility.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Department Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Department Recognition Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Compare recognition patterns across departments to identify engagement gaps 
            and manager participation levels.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-semibold">Metrics by Department</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Recognition frequency per headcount</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Giver participation rate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <span>Receiver coverage percentage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span>Average points per recognition</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold">Action Triggers</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Departments below 40% participation: Manager coaching</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Departments with &lt;50% receiver coverage: Awareness campaign</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Top performing departments: Share best practices</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Industry Recognition Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Metric</th>
                  <th className="text-left py-3 px-4 font-medium">Average</th>
                  <th className="text-left py-3 px-4 font-medium">Good</th>
                  <th className="text-left py-3 px-4 font-medium">Excellent</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Monthly Recognition per Employee</td>
                  <td className="py-3 px-4 text-muted-foreground">1.0</td>
                  <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-600">2.0+</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">3.5+</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Active Giver Rate</td>
                  <td className="py-3 px-4 text-muted-foreground">45%</td>
                  <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-600">60%+</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">80%+</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Recognition Distribution (Gini)</td>
                  <td className="py-3 px-4 text-muted-foreground">0.45</td>
                  <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-600">&lt;0.35</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">&lt;0.25</Badge></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Manager Recognition Rate</td>
                  <td className="py-3 px-4 text-muted-foreground">1 per direct/month</td>
                  <td className="py-3 px-4"><Badge className="bg-blue-500/10 text-blue-600">2 per direct</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-green-500/10 text-green-600">3+ per direct</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <TipCallout className="mt-4">
            Lower Gini coefficient indicates more equitable distribution of recognition across 
            employees. High Gini suggests recognition is concentrated among few individuals.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Recognition Analytics Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Practice</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dashboard Review</td>
                  <td className="py-3 px-4 text-muted-foreground">Review recognition metrics with HR leadership</td>
                  <td className="py-3 px-4"><Badge variant="outline">Monthly</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Celebrate Top Givers</td>
                  <td className="py-3 px-4 text-muted-foreground">Feature top recognition givers in company newsletter</td>
                  <td className="py-3 px-4"><Badge variant="outline">Quarterly</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Manager Enablement</td>
                  <td className="py-3 px-4 text-muted-foreground">Coach managers with low recognition rates</td>
                  <td className="py-3 px-4"><Badge variant="outline">Quarterly</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Values Audit</td>
                  <td className="py-3 px-4 text-muted-foreground">Ensure recognition aligns with strategic values</td>
                  <td className="py-3 px-4"><Badge variant="outline">Bi-annually</Badge></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Equity Review</td>
                  <td className="py-3 px-4 text-muted-foreground">Analyze recognition distribution by demographics</td>
                  <td className="py-3 px-4"><Badge variant="outline">Annually</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

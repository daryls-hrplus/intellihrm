import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  Brain, 
  Building2,
  Target,
  Users,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  IndustryCallout 
} from '@/components/enablement/manual/components';

export const SentimentMonitoringSetup: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div 
        id="hh-7-1" 
        data-manual-anchor="hh-7-1" 
        className="scroll-mt-36"
      >
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="text-sm font-medium">7.1</Badge>
          <h3 className="text-xl font-semibold text-foreground">Sentiment Monitoring</h3>
        </div>
        
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">AI-Powered Workforce Sentiment Analytics</h4>
                <p className="text-muted-foreground">
                  Sentiment Monitoring provides real-time insights into employee experience, engagement levels, 
                  and organizational health through AI-powered analysis of survey responses, feedback, and 
                  behavioral patterns. This dashboard empowers HR leaders and executives to identify trends, 
                  address concerns proactively, and measure the impact of people initiatives.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <IndustryCallout>
        <strong>Industry Context:</strong> Organizations with mature employee listening programs report 
        21% higher profitability and 17% higher productivity (Gallup). Continuous sentiment monitoring 
        has replaced annual surveys as the standard for measuring employee experience.
      </IndustryCallout>

      {/* Executive KPI Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Executive KPI Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The executive dashboard provides at-a-glance visibility into critical workforce health metrics. 
            Each KPI is designed for quick interpretation with color-coded status indicators.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* eNPS Score */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold">Employee Net Promoter Score (eNPS)</h5>
                  <Badge variant="secondary">Primary Metric</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Measures employee loyalty and likelihood to recommend the organization as a workplace.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Score Range</th>
                        <th className="text-left py-2 font-medium">Status</th>
                        <th className="text-left py-2 font-medium">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">≥ 30</td>
                        <td className="py-2"><Badge className="bg-green-500/10 text-green-600 border-green-200">Excellent</Badge></td>
                        <td className="py-2 text-muted-foreground">Strong advocacy, high retention expected</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">0 to 29</td>
                        <td className="py-2"><Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Good</Badge></td>
                        <td className="py-2 text-muted-foreground">Positive sentiment, room for improvement</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">-30 to -1</td>
                        <td className="py-2"><Badge className="bg-orange-500/10 text-orange-600 border-orange-200">Needs Attention</Badge></td>
                        <td className="py-2 text-muted-foreground">More detractors than promoters</td>
                      </tr>
                      <tr>
                        <td className="py-2">&lt; -30</td>
                        <td className="py-2"><Badge className="bg-red-500/10 text-red-600 border-red-200">Critical</Badge></td>
                        <td className="py-2 text-muted-foreground">Urgent intervention required</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Organization Sentiment */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold">Organization Sentiment %</h5>
                  <Badge variant="secondary">Trend Indicator</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Aggregate positive sentiment score across all feedback channels and surveys.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Upward Trend</span>
                    <span className="text-sm text-muted-foreground ml-auto">Positive momentum, continue current initiatives</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <Minus className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Stable</span>
                    <span className="text-sm text-muted-foreground ml-auto">Monitor for changes, assess new initiatives</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg">
                    <ArrowDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Downward Trend</span>
                    <span className="text-sm text-muted-foreground ml-auto">Investigate root causes, prioritize action</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Score */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold">Engagement Score</h5>
                  <Badge variant="secondary">Progress Metric</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Composite score measuring emotional commitment, motivation, and discretionary effort.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Low Engagement</span>
                    <span>High Engagement</span>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Metrics */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold">Response & Alert Metrics</h5>
                  <Badge variant="secondary">Activity Indicators</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <Users className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-xs text-muted-foreground">Total Responses</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <BarChart3 className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">--</p>
                    <p className="text-xs text-muted-foreground">Active Surveys</p>
                  </div>
                  <div className="col-span-2 p-4 bg-background rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <span className="font-medium">Active Alerts</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-red-500/10 text-red-600">Critical: 0</Badge>
                        <Badge className="bg-orange-500/10 text-orange-600">High: 0</Badge>
                        <Badge className="bg-yellow-500/10 text-yellow-600">Medium: 0</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Visualize sentiment and engagement trends over configurable time periods to identify 
            patterns, measure initiative impact, and predict future workforce health.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="font-semibold">Chart Interpretation Guide</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Sentiment Line (Blue):</strong> Overall positive sentiment percentage across all responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Engagement Line (Green):</strong> Composite engagement score overlay for correlation analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Event Markers:</strong> Key organizational events (reorgs, announcements) for context</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold">Time Period Options</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span><strong>Last 30 Days:</strong> Recent pulse for immediate concerns</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span><strong>Last 90 Days:</strong> Quarterly view for trend identification</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span><strong>Last 12 Months:</strong> Annual patterns and seasonal effects</span>
                </li>
              </ul>
            </div>
          </div>

          <TipCallout>
            Correlate sentiment dips with organizational events to understand cause-and-effect relationships. 
            Use this insight to proactively communicate during future similar events.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Department Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Department Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Compare sentiment and engagement metrics across departments to identify pockets of 
            excellence and areas requiring targeted intervention.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Analysis Type</th>
                  <th className="text-left py-3 px-4 font-medium">Purpose</th>
                  <th className="text-left py-3 px-4 font-medium">Action Trigger</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Relative Ranking</td>
                  <td className="py-3 px-4 text-muted-foreground">Identify top and bottom performing departments</td>
                  <td className="py-3 px-4 text-muted-foreground">Bottom 20% require manager coaching</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Variance Analysis</td>
                  <td className="py-3 px-4 text-muted-foreground">Measure deviation from organization average</td>
                  <td className="py-3 px-4 text-muted-foreground">&gt;15% negative variance triggers review</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Trend Direction</td>
                  <td className="py-3 px-4 text-muted-foreground">Track improvement or decline by department</td>
                  <td className="py-3 px-4 text-muted-foreground">3+ month decline requires action plan</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Response Rate</td>
                  <td className="py-3 px-4 text-muted-foreground">Measure survey participation by department</td>
                  <td className="py-3 px-4 text-muted-foreground">&lt;60% rate needs manager engagement</td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout>
            Avoid publicly sharing department rankings that could create unhealthy competition. 
            Use comparative data for targeted coaching, not blame.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Priority Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Priority Alerts System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Automated alerts ensure critical sentiment issues are surfaced immediately to the right 
            stakeholders for timely intervention.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="font-semibold text-red-700">Critical</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• eNPS below -30</li>
                  <li>• Engagement drop &gt;20% in 30 days</li>
                  <li>• Safety concern keywords detected</li>
                </ul>
                <p className="text-xs text-red-600 mt-3">Immediate executive notification</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span className="font-semibold text-orange-700">High</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Department sentiment &lt;50%</li>
                  <li>• Survey response rate &lt;40%</li>
                  <li>• Manager flagged concerns</li>
                </ul>
                <p className="text-xs text-orange-600 mt-3">HR Partner notification within 24hrs</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200 bg-yellow-500/5">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="font-semibold text-yellow-700">Medium</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Slight downward trend detected</li>
                  <li>• New hire sentiment below average</li>
                  <li>• Recognition frequency declining</li>
                </ul>
                <p className="text-xs text-yellow-600 mt-3">Weekly digest to HR leadership</p>
              </CardContent>
            </Card>
          </div>

          <InfoCallout>
            Alert thresholds are configurable per organization. Work with your implementation team to 
            calibrate thresholds based on your baseline metrics and organizational risk tolerance.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* AI-Generated Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Leverage AI to automatically analyze sentiment patterns, identify focus areas, and 
            generate actionable recommendations without manual data analysis.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Focus Areas</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI identifies top 3-5 themes requiring attention based on frequency, 
                  sentiment intensity, and business impact analysis.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Trend Interpretation</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Natural language explanation of trend changes, correlations, and 
                  likely contributing factors.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Quick Wins</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recommended immediate actions with highest potential impact 
                  and lowest implementation effort.
                </p>
              </CardContent>
            </Card>
          </div>

          <TipCallout>
            Use the "Generate AI Insights" button after each survey cycle closes to get fresh 
            analysis. Review insights with your HR leadership team during weekly syncs.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Sentiment Monitoring Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Practice</th>
                  <th className="text-left py-3 px-4 font-medium">Recommendation</th>
                  <th className="text-left py-3 px-4 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Pulse Surveys</td>
                  <td className="py-3 px-4 text-muted-foreground">Deploy short (5-7 question) pulse surveys to maintain engagement</td>
                  <td className="py-3 px-4"><Badge variant="outline">Weekly/Bi-weekly</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Executive Review</td>
                  <td className="py-3 px-4 text-muted-foreground">Present sentiment dashboard to leadership with action plans</td>
                  <td className="py-3 px-4"><Badge variant="outline">Monthly</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Manager Briefings</td>
                  <td className="py-3 px-4 text-muted-foreground">Share department-specific insights with managers</td>
                  <td className="py-3 px-4"><Badge variant="outline">Bi-weekly</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Response Rate Target</td>
                  <td className="py-3 px-4 text-muted-foreground">Aim for &gt;70% survey participation for statistical validity</td>
                  <td className="py-3 px-4"><Badge variant="outline">Each Survey</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Action Communication</td>
                  <td className="py-3 px-4 text-muted-foreground">Close the loop by sharing what actions were taken from feedback</td>
                  <td className="py-3 px-4"><Badge variant="outline">After Each Cycle</Badge></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Benchmark Comparison</td>
                  <td className="py-3 px-4 text-muted-foreground">Compare against industry benchmarks annually</td>
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

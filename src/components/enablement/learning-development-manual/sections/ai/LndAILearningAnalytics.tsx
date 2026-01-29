import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Navigation, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export function LndAILearningAnalytics() {
  return (
    <section id="sec-6-5" data-manual-anchor="sec-6-5" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.5 Learning Analytics & Predictions</h2>
        <p className="text-muted-foreground">
          Comprehensive analytics dashboard with KPIs, trends, and predictive indicators for learning program effectiveness.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Navigate the Training Analytics dashboard and interpret KPIs</li>
            <li>Analyze enrollment trends and completion rates</li>
            <li>Identify at-risk learners and engagement patterns</li>
            <li>Generate AI-powered reports for stakeholder presentations</li>
          </ul>
        </CardContent>
      </Card>

      {/* KPI Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">KPI</th>
                  <th className="text-left py-2 px-3 font-medium">Calculation</th>
                  <th className="text-left py-2 px-3 font-medium">Benchmark</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Total Courses</td>
                  <td className="py-2 px-3">Count of published courses</td>
                  <td className="py-2 px-3">Varies by org size</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Total Enrollments</td>
                  <td className="py-2 px-3">Count of all enrollments (any status)</td>
                  <td className="py-2 px-3">&gt;3 per employee/year</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Completion Rate</td>
                  <td className="py-2 px-3">(Completed ÷ Enrolled) × 100</td>
                  <td className="py-2 px-3">&gt;75%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Average Quiz Score</td>
                  <td className="py-2 px-3">Mean score across all quiz attempts</td>
                  <td className="py-2 px-3">&gt;80%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Certifications Issued</td>
                  <td className="py-2 px-3">Count of certifications awarded</td>
                  <td className="py-2 px-3">Varies by program</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Training Hours</td>
                  <td className="py-2 px-3">Sum of course durations completed</td>
                  <td className="py-2 px-3">&gt;40 hrs/employee/year</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Compliance Rate</td>
                  <td className="py-2 px-3">(Compliant ÷ Required) × 100</td>
                  <td className="py-2 px-3">&gt;95%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Budget Utilization</td>
                  <td className="py-2 px-3">(Spent ÷ Allocated) × 100</td>
                  <td className="py-2 px-3">80-100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Chart Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Available Charts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Bar Chart</Badge>
              </div>
              <p className="text-sm font-medium">Monthly Enrollments</p>
              <p className="text-xs text-muted-foreground">
                Enrollment count by month with year-over-year comparison.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Pie Chart</Badge>
              </div>
              <p className="text-sm font-medium">Enrollment Status Distribution</p>
              <p className="text-xs text-muted-foreground">
                Breakdown by status: enrolled, in_progress, completed, expired.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Area Chart</Badge>
              </div>
              <p className="text-sm font-medium">Completions & Certifications Trend</p>
              <p className="text-xs text-muted-foreground">
                12-month trend showing cumulative completions and certifications.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Pie Chart</Badge>
              </div>
              <p className="text-sm font-medium">Courses by Category</p>
              <p className="text-xs text-muted-foreground">
                Course distribution across training categories.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Training → Analytics
│
├── Tabs:
│   ├── Charts (default)
│   │   ├── KPI Cards (8 metrics)
│   │   ├── Monthly Enrollments (Bar)
│   │   ├── Enrollment Status (Pie)
│   │   ├── Trends (Area)
│   │   ├── Courses by Category (Pie)
│   │   └── Top 5 Courses (Table)
│   │
│   ├── AI Banded Reports
│   │   └── Generate custom banded reports
│   │
│   └── AI BI Reports
│       └── Generate business intelligence reports
│
├── Filters:
│   ├── Year selector (current year default)
│   ├── Department filter
│   └── Course category filter
│
└── Export:
    ├── PDF Report
    ├── Excel Data
    └── PowerPoint Presentation`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Predictive Indicators (Future Enhancement)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The following predictive capabilities are planned for future releases:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg border border-dashed">
              <p className="text-sm font-medium">Completion Risk Score</p>
              <p className="text-xs text-muted-foreground">
                Predict likelihood of course non-completion based on engagement patterns.
              </p>
              <Badge variant="outline" className="mt-2">Planned</Badge>
            </div>
            <div className="p-3 rounded-lg border border-dashed">
              <p className="text-sm font-medium">Engagement Decay Detection</p>
              <p className="text-xs text-muted-foreground">
                Identify learners showing declining engagement before dropout.
              </p>
              <Badge variant="outline" className="mt-2">Planned</Badge>
            </div>
            <div className="p-3 rounded-lg border border-dashed">
              <p className="text-sm font-medium">Optimal Learning Path</p>
              <p className="text-xs text-muted-foreground">
                AI-suggested course sequencing based on peer success patterns.
              </p>
              <Badge variant="outline" className="mt-2">Planned</Badge>
            </div>
            <div className="p-3 rounded-lg border border-dashed">
              <p className="text-sm font-medium">Skills Transfer Index</p>
              <p className="text-xs text-muted-foreground">
                Measure correlation between training and on-job performance.
              </p>
              <Badge variant="outline" className="mt-2">Planned</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Report Builder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI Report Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The AI Report Builder enables creation of custom analytics reports using natural language prompts.
          </p>
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Available Report Types:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li><strong>Banded Reports:</strong> Traditional row-based reports with grouping and subtotals</li>
              <li><strong>BI Reports:</strong> Visual dashboards with charts and KPI cards</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            See the AI Reports chapter for detailed report builder documentation.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

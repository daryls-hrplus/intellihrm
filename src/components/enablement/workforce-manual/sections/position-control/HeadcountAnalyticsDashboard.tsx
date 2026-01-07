import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Download,
  FileText,
  FileSpreadsheet,
  Building2,
  Target,
  PieChart
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";

export function HeadcountAnalyticsDashboard() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.4</Badge>
          <Badge variant="secondary">Estimated: 10 min</Badge>
          <Badge>Analytics</Badge>
        </div>
        <h2 className="text-2xl font-bold">Headcount Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Current vs budgeted headcount, variance analysis, and real-time workforce metrics
        </p>
      </div>

      <LearningObjectives
        objectives={[
          "Navigate the Headcount Analytics dashboard",
          "Interpret variance analysis reports",
          "Export analytics data for reporting",
          "Monitor real-time workforce KPIs"
        ]}
      />

      {/* Dashboard Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics Dashboard Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Headcount Analytics Dashboard provides comprehensive visibility into 
            workforce composition, request trends, and department-level metrics. Data 
            is refreshed in real-time as changes occur.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Navigation</h4>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              Workforce → Headcount Analytics
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">247</div>
              <div className="text-sm text-muted-foreground">Total Authorized</div>
              <p className="text-xs text-muted-foreground mt-1">Approved positions</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">218</div>
              <div className="text-sm text-muted-foreground">Filled Positions</div>
              <p className="text-xs text-muted-foreground mt-1">88% fill rate</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingDown className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold text-amber-600">29</div>
              <div className="text-sm text-muted-foreground">Open Vacancies</div>
              <p className="text-xs text-muted-foreground mt-1">Positions to fill</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">78%</div>
              <div className="text-sm text-muted-foreground">Approval Rate</div>
              <p className="text-xs text-muted-foreground mt-1">Avg 4.2 days to process</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Request Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Track headcount request activity over the past 6 months to identify patterns, 
            seasonal trends, and forecast future demand.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Month</th>
                  <th className="text-center py-2 font-medium">Approved</th>
                  <th className="text-center py-2 font-medium">Rejected</th>
                  <th className="text-center py-2 font-medium">Pending</th>
                  <th className="text-center py-2 font-medium">Net Change</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { month: "Aug 2023", approved: 12, rejected: 3, pending: 0, net: 8 },
                  { month: "Sep 2023", approved: 8, rejected: 2, pending: 0, net: 5 },
                  { month: "Oct 2023", approved: 15, rejected: 4, pending: 0, net: 10 },
                  { month: "Nov 2023", approved: 6, rejected: 1, pending: 0, net: 4 },
                  { month: "Dec 2023", approved: 3, rejected: 2, pending: 0, net: 1 },
                  { month: "Jan 2024", approved: 10, rejected: 2, pending: 3, net: 7 },
                ].map((row) => (
                  <tr key={row.month} className="border-b">
                    <td className="py-2">{row.month}</td>
                    <td className="text-center text-green-600">{row.approved}</td>
                    <td className="text-center text-red-600">{row.rejected}</td>
                    <td className="text-center text-amber-600">{row.pending}</td>
                    <td className="text-center font-medium">
                      <span className={row.net >= 0 ? "text-green-600" : "text-red-600"}>
                        {row.net >= 0 ? "+" : ""}{row.net}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Chart Visualization</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              The dashboard includes interactive area charts showing request volume and 
              net headcount change over time. Hover over data points to see detailed 
              breakdowns.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Headcount by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Bar chart visualization showing authorized vs filled positions per department. 
            Quickly identify departments with the highest vacancy rates.
          </p>
          <div className="space-y-3">
            {[
              { dept: "Engineering", auth: 85, filled: 72 },
              { dept: "Sales", auth: 45, filled: 41 },
              { dept: "Operations", auth: 62, filled: 58 },
              { dept: "Finance", auth: 28, filled: 25 },
              { dept: "HR", auth: 15, filled: 12 },
              { dept: "Marketing", auth: 12, filled: 10 },
            ].map((row) => (
              <div key={row.dept} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{row.dept}</span>
                  <span className="text-muted-foreground">
                    {row.filled}/{row.auth} ({Math.round((row.filled/row.auth)*100)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${(row.filled/row.auth)*100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Request Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Request Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Pie chart showing the distribution of all headcount requests by current 
                status. Useful for identifying bottlenecks in the approval process.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-sm">Approved (54 requests)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm">Rejected (14 requests)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <span className="text-sm">Pending (3 requests)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-8 border-green-500 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">78%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Export analytics data for external reporting, presentations, or further 
            analysis. Multiple formats available.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg flex items-start gap-3">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-semibold">Export as PDF</h4>
                <p className="text-sm text-muted-foreground">
                  Formatted report with charts and tables, ready for printing or sharing.
                </p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-start gap-3">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              <div>
                <h4 className="font-semibold">Export as CSV</h4>
                <p className="text-sm text-muted-foreground">
                  Raw data export for Excel, Google Sheets, or data analysis tools.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-muted/30 border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Available Export Options</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Summary Report (all KPIs)</li>
              <li>• Monthly Trend Data</li>
              <li>• Department Breakdown</li>
              <li>• Complete Data Export (all above)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Industry Context */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Industry Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Frequency:</span>
              <p className="text-muted-foreground">Real-time dashboard, weekly/monthly reviews</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Fill rate &gt; 90%, approval rate &gt; 75%</p>
            </div>
            <div>
              <span className="font-medium">Integration:</span>
              <p className="text-muted-foreground">Finance systems, BI tools, executive reporting</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

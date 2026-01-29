import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export function LndComplianceDashboardAnalytics() {
  return (
    <section id="sec-5-8" data-manual-anchor="sec-5-8" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.8 Compliance Dashboard Analytics</h2>
          <p className="text-muted-foreground">Dashboard metrics, KPIs, and visualization patterns</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Navigate and interpret the compliance dashboard metrics</li>
            <li>Configure dashboard filters and drill-down options</li>
            <li>Understand key performance indicators for compliance tracking</li>
            <li>Export dashboard data for external reporting</li>
          </ul>
        </CardContent>
      </Card>

      {/* Dashboard Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Dashboard Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Training → Compliance → Dashboard

┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE TRAINING DASHBOARD                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   FILTERS: [Company ▼] [Department ▼] [Location ▼] [Date Range ▼]          │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ SUMMARY METRICS                                                       │  │
│   │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│   │ │  94.2%   │ │   156    │ │    12    │ │    8     │ │    3     │    │  │
│   │ │ Overall  │ │ On Track │ │ Due Soon │ │ Overdue  │ │Escalated │    │  │
│   │ │Compliance│ │          │ │ (7 days) │ │          │ │          │    │  │
│   │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌─────────────────────────────────┐ ┌─────────────────────────────────┐   │
│   │ COMPLIANCE BY DEPARTMENT        │ │ COMPLIANCE TREND (12 Mo)        │   │
│   │                                 │ │                                 │   │
│   │ Operations    ████████████ 98% │ │     ╭──────────────────╮        │   │
│   │ Finance       ███████████░ 95% │ │   95├─────────────╮    │        │   │
│   │ IT            ██████████░░ 92% │ │   90├──────╮      │    │        │   │
│   │ Sales         █████████░░░ 88% │ │   85├─────╯      ╰────╯        │   │
│   │ HR            ████████░░░░ 85% │ │     └──────────────────────────│   │
│   │                                 │ │       J F M A M J J A S O N D │   │
│   └─────────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────┐ ┌─────────────────────────────────┐   │
│   │ TOP OVERDUE TRAINING            │ │ UPCOMING DEADLINES              │   │
│   │                                 │ │                                 │   │
│   │ Anti-Harassment         5 ⚠️   │ │ Mar 15: OSHA 10 (23 employees) │   │
│   │ IT Security             3 ⚠️   │ │ Mar 31: Code of Conduct (All)  │   │
│   │ Data Privacy            2 ⚠️   │ │ Apr 15: Fire Safety (Ops)      │   │
│   │ [View All Overdue →]           │ │ [View Calendar →]              │   │
│   └─────────────────────────────────┘ └─────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Performance Indicators (KPIs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Alert Threshold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Overall Compliance Rate</TableCell>
                <TableCell className="font-mono text-xs">(completed + exempted) / total_active * 100</TableCell>
                <TableCell><Badge className="bg-green-500">≥ 95%</Badge></TableCell>
                <TableCell><Badge variant="destructive">&lt; 90%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">On-Time Completion Rate</TableCell>
                <TableCell className="font-mono text-xs">completed_before_due / total_completed * 100</TableCell>
                <TableCell><Badge className="bg-green-500">≥ 90%</Badge></TableCell>
                <TableCell><Badge variant="destructive">&lt; 85%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Overdue Count</TableCell>
                <TableCell className="font-mono text-xs">COUNT(status = 'overdue')</TableCell>
                <TableCell><Badge className="bg-green-500">0</Badge></TableCell>
                <TableCell><Badge variant="destructive">&gt; 5</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Escalation Rate</TableCell>
                <TableCell className="font-mono text-xs">escalated / overdue * 100</TableCell>
                <TableCell><Badge className="bg-green-500">&lt; 10%</Badge></TableCell>
                <TableCell><Badge variant="destructive">&gt; 25%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Average Completion Time</TableCell>
                <TableCell className="font-mono text-xs">AVG(completed_at - assigned_at)</TableCell>
                <TableCell><Badge className="bg-green-500">&lt; 14 days</Badge></TableCell>
                <TableCell><Badge variant="destructive">&gt; 21 days</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Exemption Rate</TableCell>
                <TableCell className="font-mono text-xs">exempted / total_assigned * 100</TableCell>
                <TableCell><Badge className="bg-green-500">&lt; 5%</Badge></TableCell>
                <TableCell><Badge variant="destructive">&gt; 10%</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSE Compliance Rate</TableCell>
                <TableCell className="font-mono text-xs">HSE-linked completed / HSE-linked total * 100</TableCell>
                <TableCell><Badge className="bg-green-500">100%</Badge></TableCell>
                <TableCell><Badge variant="destructive">&lt; 98%</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drill-Down Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Drill-Down Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Click Target</TableHead>
                <TableHead>Drill-Down View</TableHead>
                <TableHead>Available Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Department Bar</TableCell>
                <TableCell>Employee list filtered by department</TableCell>
                <TableCell>View details, Bulk remind, Export</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Overdue Count</TableCell>
                <TableCell>Overdue assignments list</TableCell>
                <TableCell>Escalate, Extend, Exempt, Contact</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Training Name</TableCell>
                <TableCell>Assignment list for specific training</TableCell>
                <TableCell>View progress, Download report</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Trend Point</TableCell>
                <TableCell>Monthly breakdown</TableCell>
                <TableCell>Compare periods, Identify patterns</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee Name</TableCell>
                <TableCell>Individual compliance profile</TableCell>
                <TableCell>All assignments, History, Actions</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filter Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filter</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Company</TableCell>
                <TableCell>All companies in group (multi-select)</TableCell>
                <TableCell>User's primary company</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department</TableCell>
                <TableCell>All departments (multi-select)</TableCell>
                <TableCell>All departments</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Location</TableCell>
                <TableCell>All work locations (multi-select)</TableCell>
                <TableCell>All locations</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Training Category</TableCell>
                <TableCell>Mandatory, Role-Based, HSE-Linked, All</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Date Range</TableCell>
                <TableCell>Preset ranges + custom</TableCell>
                <TableCell>Current quarter</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>All, Overdue Only, Upcoming, Completed</TableCell>
                <TableCell>All</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            Filter selections persist in <code className="bg-muted px-1 rounded">useTabState</code> 
            and are retained when switching between workspace tabs.
          </p>
        </CardContent>
      </Card>

      {/* Alert Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Dashboard Alert Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Channel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">Compliance Rate Drop</Badge></TableCell>
                <TableCell>Overall rate falls below 90%</TableCell>
                <TableCell>L&D Admin, HR Director</TableCell>
                <TableCell>Email, Dashboard banner</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Overdue Spike</Badge></TableCell>
                <TableCell>Overdue count increases &gt; 20% week-over-week</TableCell>
                <TableCell>L&D Admin, Department Heads</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Deadline Approaching</Badge></TableCell>
                <TableCell>Major deadline within 7 days</TableCell>
                <TableCell>L&D Admin</TableCell>
                <TableCell>Dashboard banner</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">Department at Risk</Badge></TableCell>
                <TableCell>Department compliance &lt; 85%</TableCell>
                <TableCell>Department Manager, HR</TableCell>
                <TableCell>Email, Dashboard</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Contents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Summary Report</TableCell>
                <TableCell>PDF</TableCell>
                <TableCell>Dashboard snapshot with charts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Detailed Data</TableCell>
                <TableCell>Excel, CSV</TableCell>
                <TableCell>All assignments with current filters</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Trend Analysis</TableCell>
                <TableCell>Excel</TableCell>
                <TableCell>Monthly metrics for selected period</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Overdue Report</TableCell>
                <TableCell>PDF, Excel</TableCell>
                <TableCell>Overdue assignments with escalation status</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Usage Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Daily</div>
              <div className="text-sm text-muted-foreground">Recommended review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Weekly</div>
              <div className="text-sm text-muted-foreground">Manager review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Monthly</div>
              <div className="text-sm text-muted-foreground">Executive report</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Quarterly</div>
              <div className="text-sm text-muted-foreground">Board reporting</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

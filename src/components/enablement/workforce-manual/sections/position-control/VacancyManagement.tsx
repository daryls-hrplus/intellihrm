import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  UserX, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Building2,
  Filter,
  Calendar,
  BarChart3
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";

export function VacancyManagement() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.2</Badge>
          <Badge variant="secondary">Estimated: 10 min</Badge>
          <Badge>Procedure</Badge>
        </div>
        <h2 className="text-2xl font-bold">Vacancy Management</h2>
        <p className="text-muted-foreground mt-2">
          Tracking open positions, time-to-fill metrics, and recruitment pipeline integration
        </p>
      </div>

      <LearningObjectives
        objectives={[
          "Navigate the Vacancy Dashboard",
          "Understand vacancy tracking metrics",
          "Integrate with recruitment pipeline",
          "Monitor time-to-fill KPIs"
        ]}
      />

      {/* Vacancy Dashboard Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-primary" />
            Vacancy Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Vacancy Dashboard provides a real-time view of all open positions across 
            the organization, aggregated by department and sortable by urgency or duration.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Navigation</h4>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              Workforce → Position Control & Vacancies
            </code>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary">247</div>
              <div className="text-sm text-muted-foreground">Total Authorized</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">218</div>
              <div className="text-sm text-muted-foreground">Filled Positions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-amber-600">29</div>
              <div className="text-sm text-muted-foreground">Open Vacancies</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold">88%</div>
              <div className="text-sm text-muted-foreground">Fill Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vacancy Status Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Vacancy Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <UserX className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Open Vacancies</h4>
                <p className="text-sm text-muted-foreground">
                  Positions with authorized headcount greater than filled count. Ready 
                  for recruitment or internal movement.
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-amber-600">Active Hiring</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Fully Staffed</h4>
                <p className="text-sm text-muted-foreground">
                  Positions where filled count equals authorized headcount. No vacancies.
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-green-600">Optimal</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Overstaffed</h4>
                <p className="text-sm text-muted-foreground">
                  Positions where filled count exceeds authorized headcount. May indicate 
                  temporary assignments, acting roles, or budget issues.
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-red-600">Needs Review</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time-to-Fill Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Time-to-Fill Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Track how long positions remain vacant from the date they become open until 
            a new employee starts. This metric is critical for workforce planning.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Metric</th>
                  <th className="text-center py-2 font-medium">Current</th>
                  <th className="text-center py-2 font-medium">Target</th>
                  <th className="text-center py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Average Time-to-Fill (All)</td>
                  <td className="text-center">42 days</td>
                  <td className="text-center">45 days</td>
                  <td className="text-center">
                    <Badge className="bg-green-500">On Track</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Executive Roles</td>
                  <td className="text-center">78 days</td>
                  <td className="text-center">90 days</td>
                  <td className="text-center">
                    <Badge className="bg-green-500">On Track</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Technical Roles</td>
                  <td className="text-center">56 days</td>
                  <td className="text-center">45 days</td>
                  <td className="text-center">
                    <Badge variant="destructive">Over Target</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Entry-Level Roles</td>
                  <td className="text-center">21 days</td>
                  <td className="text-center">30 days</td>
                  <td className="text-center">
                    <Badge className="bg-green-500">On Track</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Vacancies by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { dept: "Engineering", auth: 85, filled: 72, vacancies: 13 },
              { dept: "Sales", auth: 45, filled: 41, vacancies: 4 },
              { dept: "Operations", auth: 62, filled: 58, vacancies: 4 },
              { dept: "Finance", auth: 28, filled: 25, vacancies: 3 },
              { dept: "HR", auth: 15, filled: 12, vacancies: 3 },
            ].map((row) => (
              <div key={row.dept} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{row.dept}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {row.filled}/{row.auth} filled
                  </span>
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(row.filled/row.auth)*100}%` }}
                    />
                  </div>
                  <Badge variant="outline" className={row.vacancies > 5 ? "text-amber-600" : ""}>
                    {row.vacancies} vacant
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recruitment Pipeline Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recruitment Pipeline Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Vacancies are linked to job requisitions in the Recruitment module. When a 
            vacancy is identified, it can trigger a requisition or be associated with 
            an existing open requisition.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Vacancy Opens</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Position becomes vacant due to termination, transfer, or new budget
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h4 className="font-semibold">Requisition Created</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Recruitment team creates job posting linked to position
              </p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">Hire Assigned</h4>
              <p className="text-xs text-muted-foreground mt-1">
                New employee assigned to position, vacancy closes
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Cross-Module Link
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Navigate to <strong>Recruitment → Job Requisitions</strong> to see all active 
              requisitions linked to vacant positions. The requisition status updates 
              automatically when positions are filled.
            </p>
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
              <p className="text-muted-foreground">Daily monitoring, weekly reviews</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Time-to-fill &lt; 45 days average</p>
            </div>
            <div>
              <span className="font-medium">Integration:</span>
              <p className="text-muted-foreground">ATS, job boards, recruitment workflows</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Calendar, CheckCircle, AlertCircle, Lightbulb
} from 'lucide-react';

export function WorkforceOverviewCalendar() {
  return (
    <Card id="wf-sec-1-5" data-manual-anchor="wf-sec-1-5" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.5</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Workforce Management Calendar
        </CardTitle>
        <CardDescription>Annual org review cycles, headcount planning, budget alignment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Calendar Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Annual Workforce Calendar</h3>
          <p className="text-muted-foreground mb-6">
            Workforce management follows an annual cycle aligned with fiscal year planning. 
            The calendar below outlines key activities and their recommended timing.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-3 text-left font-medium">Quarter</th>
                  <th className="border p-3 text-left font-medium">Activity</th>
                  <th className="border p-3 text-left font-medium">Owner</th>
                  <th className="border p-3 text-left font-medium">Deliverable</th>
                </tr>
              </thead>
              <tbody>
                {/* Q1 */}
                <tr className="bg-blue-500/5">
                  <td className="border p-3 font-medium" rowSpan={3}>
                    <Badge className="bg-blue-500">Q1</Badge>
                    <div className="text-xs text-muted-foreground mt-1">Jan-Mar</div>
                  </td>
                  <td className="border p-3">Headcount Budget Finalization</td>
                  <td className="border p-3 text-muted-foreground">Finance + HR</td>
                  <td className="border p-3 text-muted-foreground">Approved headcount by department</td>
                </tr>
                <tr className="bg-blue-500/5">
                  <td className="border p-3">Position Budget Allocation</td>
                  <td className="border p-3 text-muted-foreground">HR Admin</td>
                  <td className="border p-3 text-muted-foreground">Position-level budgets assigned</td>
                </tr>
                <tr className="bg-blue-500/5">
                  <td className="border p-3">Org Structure Validation</td>
                  <td className="border p-3 text-muted-foreground">HR Admin</td>
                  <td className="border p-3 text-muted-foreground">Clean org chart, inactive entities removed</td>
                </tr>
                {/* Q2 */}
                <tr className="bg-green-500/5">
                  <td className="border p-3 font-medium" rowSpan={3}>
                    <Badge className="bg-green-500">Q2</Badge>
                    <div className="text-xs text-muted-foreground mt-1">Apr-Jun</div>
                  </td>
                  <td className="border p-3">Job Architecture Review</td>
                  <td className="border p-3 text-muted-foreground">HR Admin</td>
                  <td className="border p-3 text-muted-foreground">Updated job descriptions, grades</td>
                </tr>
                <tr className="bg-green-500/5">
                  <td className="border p-3">Competency Framework Update</td>
                  <td className="border p-3 text-muted-foreground">L&D + HR</td>
                  <td className="border p-3 text-muted-foreground">Aligned competencies for appraisals</td>
                </tr>
                <tr className="bg-green-500/5">
                  <td className="border p-3">Mid-Year Headcount Review</td>
                  <td className="border p-3 text-muted-foreground">HR + Finance</td>
                  <td className="border p-3 text-muted-foreground">Variance analysis, reforecasting</td>
                </tr>
                {/* Q3 */}
                <tr className="bg-amber-500/5">
                  <td className="border p-3 font-medium" rowSpan={3}>
                    <Badge className="bg-amber-500">Q3</Badge>
                    <div className="text-xs text-muted-foreground mt-1">Jul-Sep</div>
                  </td>
                  <td className="border p-3">Workforce Forecasting</td>
                  <td className="border p-3 text-muted-foreground">Workforce Planner</td>
                  <td className="border p-3 text-muted-foreground">Next FY headcount projections</td>
                </tr>
                <tr className="bg-amber-500/5">
                  <td className="border p-3">Succession Data Refresh</td>
                  <td className="border p-3 text-muted-foreground">HR Admin</td>
                  <td className="border p-3 text-muted-foreground">Critical position updates</td>
                </tr>
                <tr className="bg-amber-500/5">
                  <td className="border p-3">Skills Inventory Audit</td>
                  <td className="border p-3 text-muted-foreground">HR Ops</td>
                  <td className="border p-3 text-muted-foreground">Employee skills validation</td>
                </tr>
                {/* Q4 */}
                <tr className="bg-red-500/5">
                  <td className="border p-3 font-medium" rowSpan={3}>
                    <Badge className="bg-red-500">Q4</Badge>
                    <div className="text-xs text-muted-foreground mt-1">Oct-Dec</div>
                  </td>
                  <td className="border p-3">Next FY Headcount Planning</td>
                  <td className="border p-3 text-muted-foreground">HR + Finance</td>
                  <td className="border p-3 text-muted-foreground">Draft headcount budget</td>
                </tr>
                <tr className="bg-red-500/5">
                  <td className="border p-3">Org Restructuring (if needed)</td>
                  <td className="border p-3 text-muted-foreground">Executive + HR</td>
                  <td className="border p-3 text-muted-foreground">New org structure effective dates</td>
                </tr>
                <tr className="bg-red-500/5">
                  <td className="border p-3">Year-End Data Cleanup</td>
                  <td className="border p-3 text-muted-foreground">HR Ops</td>
                  <td className="border p-3 text-muted-foreground">Data quality audit complete</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Monthly Activities */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ongoing Monthly Activities</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { activity: 'Vacancy Status Review', owner: 'HR Admin', frequency: 'Weekly' },
              { activity: 'Onboarding Progress Check', owner: 'HR Ops', frequency: 'Weekly' },
              { activity: 'Headcount Dashboard Review', owner: 'HR Admin', frequency: 'Monthly' },
              { activity: 'Employee Data Quality Audit', owner: 'HR Ops', frequency: 'Monthly' },
              { activity: 'Position Budget Reconciliation', owner: 'Finance', frequency: 'Monthly' },
              { activity: 'Org Changes Processing', owner: 'HR Admin', frequency: 'As needed' }
            ].map((item, i) => (
              <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{item.activity}</span>
                  <p className="text-xs text-muted-foreground">{item.owner}</p>
                </div>
                <Badge variant="outline">{item.frequency}</Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Best Practices */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <span className="font-semibold text-sm">Industry Best Practice</span>
              <p className="text-sm text-muted-foreground mt-1">
                Align workforce planning with financial budget cycles. Most organizations begin 
                headcount planning in Q3 for the following fiscal year, with final approvals in Q4. 
                This allows time for recruitment pipelines to fill approved positions by Q1.
              </p>
            </div>
          </div>
        </div>

        {/* Critical Dates Callout */}
        <div className="p-4 border-l-4 border-l-red-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <span className="font-semibold text-sm">Critical Reminder</span>
              <p className="text-sm text-muted-foreground mt-1">
                Ensure all org structure changes are completed and effective-dated before 
                performance appraisal cycle launches. Manager relationships must be accurate 
                for proper appraisal routing.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

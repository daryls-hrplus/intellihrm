import { LearningObjectives } from './LearningObjectives';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, BarChart3, TrendingUp, Clock, Users } from 'lucide-react';

export function LifecycleAnalytics() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Lifecycle analytics provide insights into onboarding effectiveness, time-to-productivity, 
        and turnover patterns. These metrics help HR optimize processes and improve employee experience.
      </p>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          <strong>Key Insight:</strong> Organizations that track onboarding completion rates and 
          correlate them with retention see 50% improvement in new hire success rates.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Key Lifecycle Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Clock, title: 'Time to Productivity', value: '45 days', change: '-8 days vs last quarter' },
            { icon: BarChart3, title: 'Onboarding Completion', value: '94%', change: '+5% vs last quarter' },
            { icon: Users, title: '90-Day Retention', value: '92%', change: '+3% vs last year' },
            { icon: TrendingUp, title: 'Task Completion Rate', value: '87%', change: 'On-time completion' }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <item.icon className="h-5 w-5 text-primary mb-2" />
              <h5 className="text-sm text-muted-foreground">{item.title}</h5>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Onboarding Analytics Dashboard</h4>
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3">Completion by Phase</h5>
              <div className="space-y-2">
                {[
                  { phase: 'Day 1 Tasks', completion: 98 },
                  { phase: '30-Day Milestone', completion: 92 },
                  { phase: '60-Day Milestone', completion: 88 },
                  { phase: '90-Day Milestone', completion: 85 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm w-32">{item.phase}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${item.completion}%` }} 
                      />
                    </div>
                    <span className="text-sm w-12 text-right">{item.completion}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-3">Bottleneck Tasks</h5>
              <div className="space-y-2 text-sm">
                {[
                  { task: 'IT Equipment Setup', avgDelay: '2.3 days', owner: 'IT' },
                  { task: 'Benefits Enrollment', avgDelay: '1.8 days', owner: 'HR' },
                  { task: 'Manager 1:1 Meeting', avgDelay: '1.5 days', owner: 'Manager' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-background rounded">
                    <span>{item.task}</span>
                    <span className="text-muted-foreground">{item.avgDelay} avg delay</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Available Reports</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="border p-2 text-left">Report</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">Onboarding Status Summary</td>
                <td className="border p-2">Active onboarding instances with progress</td>
                <td className="border p-2">Weekly</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Task Completion Analysis</td>
                <td className="border p-2">On-time vs overdue tasks by category</td>
                <td className="border p-2">Monthly</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Time to Productivity Trend</td>
                <td className="border p-2">Average ramp-up time by role/department</td>
                <td className="border p-2">Quarterly</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">New Hire Retention</td>
                <td className="border p-2">30/60/90/180 day retention rates</td>
                <td className="border p-2">Monthly</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Exit Interview Summary</td>
                <td className="border p-2">Departure reasons and trends</td>
                <td className="border p-2">Monthly</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">Offboarding Compliance</td>
                <td className="border p-2">Clearance completion rates, at-risk items</td>
                <td className="border p-2">Weekly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Accessing Analytics</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Navigate to <strong>Workforce → Employee Onboarding → Analytics</strong> tab</li>
          <li>Select date range and filters (company, department, template)</li>
          <li>View dashboard with key metrics and visualizations</li>
          <li>Drill down into specific metrics for detailed analysis</li>
          <li>Export reports in Excel, PDF, or schedule automated delivery</li>
        </ol>
      </div>

      <LearningObjectives
        items={[
          "Navigate the onboarding analytics dashboard",
          "Identify bottlenecks and improvement opportunities",
          "Generate and schedule lifecycle reports",
          "Correlate onboarding metrics with retention outcomes"
        ]}
      />
    </div>
  );
}

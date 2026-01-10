import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, AlertTriangle, Sun, Snowflake, Leaf, TreeDeciduous } from 'lucide-react';

export function TAOverviewCalendar() {
  const calendarCycles = [
    {
      frequency: 'Daily',
      color: 'blue',
      activities: [
        'Employee clock-in and clock-out',
        'Live attendance monitoring dashboard',
        'Exception identification and flagging',
        'Break tracking and compliance',
        'Geofence and face verification checks'
      ]
    },
    {
      frequency: 'Weekly',
      color: 'green',
      activities: [
        'Timesheet submission by employees',
        'Manager timesheet approvals',
        'Overtime review and pre-approvals',
        'Shift swap processing',
        'Weekly attendance report generation'
      ]
    },
    {
      frequency: 'Bi-weekly / Monthly',
      color: 'purple',
      activities: [
        'Payroll sync and period finalization',
        'Hours reconciliation review',
        'Overtime cost analysis',
        'Bradford Factor score updates',
        'Regularization cutoff processing'
      ]
    },
    {
      frequency: 'Quarterly',
      color: 'amber',
      activities: [
        'Attendance policy review',
        'Time clock device audits',
        'Shift differential adjustments',
        'Overtime trend analysis',
        'Wellness indicator review'
      ]
    },
    {
      frequency: 'Annually',
      color: 'rose',
      activities: [
        'CBA rule renewal and updates',
        'Policy version updates',
        'Compliance audit preparation',
        'Device replacement planning',
        'Flex/comp time expiration processing'
      ]
    }
  ];

  const criticalDeadlines = [
    {
      deadline: 'Timesheet Submission',
      timing: '2 days before pay period close',
      owner: 'Employee',
      consequence: 'Late submission may delay pay processing'
    },
    {
      deadline: 'Manager Approval',
      timing: '1 day before pay period close',
      owner: 'Manager',
      consequence: 'Unapproved timesheets excluded from payroll'
    },
    {
      deadline: 'Payroll Sync',
      timing: 'Day of pay period close',
      owner: 'System/Payroll Admin',
      consequence: 'Missed sync requires manual adjustment'
    },
    {
      deadline: 'Regularization Cutoff',
      timing: 'End of following pay period',
      owner: 'HR Operations',
      consequence: 'Late regularizations require escalation'
    },
    {
      deadline: 'Overtime Pre-approval',
      timing: 'Before OT is worked',
      owner: 'Manager',
      consequence: 'Unauthorized OT may be flagged for review'
    }
  ];

  const seasonalConsiderations = [
    {
      season: 'Holiday Season (Nov-Jan)',
      icon: Snowflake,
      color: 'blue',
      considerations: [
        'Plan holiday schedules 4-6 weeks ahead',
        'Configure holiday shift differentials',
        'Increase open shift postings',
        'Monitor overtime closely',
        'Process year-end comp time expiration'
      ]
    },
    {
      season: 'Vacation Season (Jun-Aug)',
      icon: Sun,
      color: 'amber',
      considerations: [
        'Increased shift coverage needs',
        'Cross-training for coverage',
        'Flexible scheduling arrangements',
        'Open shift board utilization',
        'Temp worker time tracking'
      ]
    },
    {
      season: 'Back-to-Business (Sep-Oct)',
      icon: Leaf,
      color: 'orange',
      considerations: [
        'Policy review for new fiscal year',
        'Device maintenance before peak',
        'Training refreshers for new hires',
        'Schedule optimization review',
        'CBA compliance check'
      ]
    },
    {
      season: 'Spring Planning (Mar-May)',
      icon: TreeDeciduous,
      color: 'green',
      considerations: [
        'Annual compliance audit prep',
        'System configuration review',
        'Shift rotation pattern updates',
        'Bradford Factor threshold review',
        'Wellness program alignment'
      ]
    }
  ];

  return (
    <Card id="ta-sec-1-5" data-manual-anchor="ta-sec-1-5" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.5</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Time Management Calendar</CardTitle>
        <CardDescription>Activity cycles, critical deadlines, and seasonal considerations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Activity Cycles */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Time & Attendance Activity Cycles
          </h3>
          <div className="space-y-4">
            {calendarCycles.map((cycle, i) => (
              <div 
                key={i}
                className={`p-4 border rounded-lg bg-${cycle.color}-500/5 border-${cycle.color}-500/20`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`bg-${cycle.color}-500/20 text-${cycle.color}-700 dark:text-${cycle.color}-300 border-${cycle.color}-500/30`}>
                    {cycle.frequency}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {cycle.activities.map((activity, j) => (
                    <div key={j} className="px-3 py-2 bg-background/80 rounded text-xs text-center border">
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Deadlines */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Critical Deadlines
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Deadline</th>
                  <th className="text-left p-3 font-medium">Timing</th>
                  <th className="text-left p-3 font-medium">Owner</th>
                  <th className="text-left p-3 font-medium">Consequence if Missed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {criticalDeadlines.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{item.deadline}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {item.timing}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{item.owner}</td>
                    <td className="p-3 text-muted-foreground text-sm">{item.consequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seasonal Considerations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            Seasonal Considerations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {seasonalConsiderations.map((season, i) => (
              <div 
                key={i}
                className={`p-4 border rounded-lg bg-${season.color}-500/5 border-${season.color}-500/20`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <season.icon className={`h-5 w-5 text-${season.color}-500`} />
                  <h4 className="font-medium">{season.season}</h4>
                </div>
                <ul className="space-y-2">
                  {season.considerations.map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className={`text-${season.color}-500 mt-0.5`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Annual Timeline */}
        <div className="p-6 bg-muted/30 border rounded-lg">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Annual Time & Attendance Timeline
          </h4>
          <div className="grid grid-cols-4 md:grid-cols-12 gap-1 text-xs">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
              <div 
                key={i}
                className={`p-2 text-center rounded ${
                  i >= 10 || i === 0 ? 'bg-blue-500/20 border border-blue-500/30' :
                  i >= 5 && i <= 7 ? 'bg-amber-500/20 border border-amber-500/30' :
                  i >= 2 && i <= 4 ? 'bg-green-500/20 border border-green-500/30' :
                  'bg-orange-500/20 border border-orange-500/30'
                }`}
              >
                <div className="font-medium">{month}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/40 border border-blue-500/50" />
              <span>Holiday Season</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500/50" />
              <span>Vacation Season</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500/40 border border-orange-500/50" />
              <span>Back-to-Business</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/50" />
              <span>Spring Planning</span>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
          <h4 className="font-medium mb-3">📋 Calendar Management Best Practices</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>• Set up automated reminders for timesheet deadlines</li>
              <li>• Plan shift schedules 2-4 weeks in advance</li>
              <li>• Review overtime trends monthly</li>
            </ul>
            <ul className="space-y-2">
              <li>• Schedule device maintenance during low-activity periods</li>
              <li>• Conduct policy reviews before busy seasons</li>
              <li>• Process comp time expirations before year-end</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

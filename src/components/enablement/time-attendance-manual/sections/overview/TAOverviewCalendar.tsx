import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, AlertTriangle, Sun, Snowflake, Leaf, TreeDeciduous, Globe, Settings, Database } from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { TipCallout, InfoCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';

export function TAOverviewCalendar() {
  const payPeriodTypes = [
    {
      type: 'Weekly',
      frequency: '52 periods/year',
      example: 'Sunday-Saturday or Monday-Sunday',
      cutoff: 'End of week (typically Saturday or Sunday)',
      bestFor: 'Hourly workers, retail, hospitality',
      color: 'blue'
    },
    {
      type: 'Bi-weekly',
      frequency: '26 periods/year',
      example: 'Every other Friday',
      cutoff: 'Every 2 weeks on designated day',
      bestFor: 'Most organizations, mix of hourly and salaried',
      color: 'green'
    },
    {
      type: 'Semi-monthly',
      frequency: '24 periods/year',
      example: '1st-15th, 16th-End of Month',
      cutoff: '15th and last day of month',
      bestFor: 'Salaried employees, professional services',
      color: 'purple'
    },
    {
      type: 'Monthly',
      frequency: '12 periods/year',
      example: '1st-End of Month',
      cutoff: 'Last day of month',
      bestFor: 'Executive staff, certain industries',
      color: 'amber'
    }
  ];

  const calendarCycles = [
    {
      frequency: 'Daily',
      color: 'blue',
      table: 'time_clock_entries',
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
      table: 'timesheet_submissions',
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
      table: 'payroll_time_sync_logs',
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
      table: 'attendance_policies',
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
      table: 'cba_time_rules',
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
      consequence: 'Late submission may delay pay processing',
      table: 'timesheet_submissions'
    },
    {
      deadline: 'Manager Approval',
      timing: '1 day before pay period close',
      owner: 'Manager',
      consequence: 'Unapproved timesheets excluded from payroll',
      table: 'timesheet_approval_history'
    },
    {
      deadline: 'Payroll Sync',
      timing: 'Day of pay period close',
      owner: 'System/Payroll Admin',
      consequence: 'Missed sync requires manual adjustment',
      table: 'payroll_time_sync_logs'
    },
    {
      deadline: 'Regularization Cutoff',
      timing: 'End of following pay period',
      owner: 'HR Operations',
      consequence: 'Late regularizations require escalation',
      table: 'attendance_regularization_requests'
    },
    {
      deadline: 'Overtime Pre-approval',
      timing: 'Before OT is worked',
      owner: 'Manager',
      consequence: 'Unauthorized OT may be flagged for review',
      table: 'overtime_requests'
    }
  ];

  const timezoneConsiderations = [
    { scenario: 'Multi-Region Workforce', handling: 'Store all times in UTC, display in employee\'s local timezone', field: 'timezone' },
    { scenario: 'Travel Across Timezones', handling: 'Clock entries use location\'s timezone, not employee\'s home tz', field: 'punch_timezone' },
    { scenario: 'Overnight Shifts', handling: 'Shift date based on start time; hours span to next calendar day', field: 'shift_date' },
    { scenario: 'Daylight Saving Time', handling: 'Auto-adjust for DST transitions; 23 or 25 hour days handled', field: 'dst_adjusted' },
    { scenario: 'Remote Workers', handling: 'Geofence can be set to "remote" with flexible location rules', field: 'is_remote_zone' }
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
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">Time Management Calendar</CardTitle>
        <CardDescription>Pay periods, activity cycles, critical deadlines, and timezone handling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={[
          'Understand the 4 pay period types and their use cases',
          'Identify critical deadlines in the timesheet workflow',
          'Plan for seasonal considerations in attendance management',
          'Handle multi-timezone and daylight saving scenarios',
          'Apply best practices for calendar management'
        ]} />

        {/* Pay Period Types */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Pay Period Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {payPeriodTypes.map((period, i) => (
              <div key={i} className={`p-4 border rounded-lg bg-${period.color}-500/5 border-${period.color}-500/20`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{period.type}</h4>
                  <Badge variant="outline" className="text-xs">{period.frequency}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Example: </span>
                    <span>{period.example}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cutoff: </span>
                    <span>{period.cutoff}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Best for: </span>
                    <span className="text-xs">{period.bestFor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <InfoCallout title="Pay Period Configuration">
          Pay period type is configured in <Badge variant="outline" className="text-xs font-mono mx-1">attendance_policies</Badge> 
          at the company level. Multiple policies can support different pay schedules for different employee groups.
        </InfoCallout>

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
                  <Badge variant="outline" className="text-xs font-mono">{cycle.table}</Badge>
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
                  <th className="text-left p-3 font-medium">Table</th>
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
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-sm">{item.consequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <WarningCallout title="Deadline Enforcement">
          Configure automated reminders in <Badge variant="outline" className="text-xs font-mono mx-1">shift_notifications</Badge> 
          to alert employees and managers before critical deadlines. Default is 24 hours before cutoff.
        </WarningCallout>

        {/* Timezone Handling */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Timezone Handling
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Scenario</th>
                  <th className="text-left p-3 font-medium">Handling</th>
                  <th className="text-left p-3 font-medium">Field</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {timezoneConsiderations.map((item, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{item.scenario}</td>
                    <td className="p-3 text-muted-foreground">{item.handling}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-xs font-mono">{item.field}</Badge>
                    </td>
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
              <li>• Use AI scheduler to optimize coverage</li>
            </ul>
            <ul className="space-y-2">
              <li>• Schedule device maintenance during low-activity periods</li>
              <li>• Conduct policy reviews before busy seasons</li>
              <li>• Process comp time expirations before year-end</li>
              <li>• Test timezone handling before regional expansions</li>
            </ul>
          </div>
        </div>

        <TipCallout title="Automated Notifications">
          Configure notification templates in <Badge variant="outline" className="text-xs font-mono mx-1">shift_notifications</Badge> 
          to automatically remind employees and managers about upcoming deadlines.
        </TipCallout>

        {/* Section Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Estimated reading time: 10-12 minutes</span>
          </div>
          <Badge variant="outline">Section 1.5 of 1.6</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

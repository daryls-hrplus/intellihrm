import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Calendar, ArrowRight, CheckCircle, AlertTriangle, 
  Settings, Globe, Lightbulb
} from 'lucide-react';

export function OverviewCalendar() {
  return (
    <Card id="sec-1-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.5</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">Performance Management Calendar</CardTitle>
        <CardDescription>
          Annual timeline, activity dependencies, regional variations, and configuration options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Detailed Annual Timeline */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Detailed Annual Timeline
          </h3>
          <p className="text-muted-foreground mb-4">
            A typical performance management calendar follows a quarterly rhythm with specific activities 
            in each month. This timeline assumes a January-December fiscal year.
          </p>

          <div className="space-y-4">
            {/* Q1 */}
            <div className="border-l-4 border-l-blue-500 pl-4">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Badge variant="default" className="bg-blue-500">Q1</Badge>
                January - March
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { 
                    month: 'January', 
                    activities: [
                      'Close prior year cycle',
                      'Process final calibration adjustments',
                      'Generate year-end reports',
                      'Archive completed evaluations',
                      'Begin goal setting for new year'
                    ]
                  },
                  { 
                    month: 'February', 
                    activities: [
                      'Complete goal setting',
                      'Goal cascade validation',
                      'Configure new appraisal cycle',
                      'Set up form templates if changed',
                      'Review rating scales'
                    ]
                  },
                  { 
                    month: 'March', 
                    activities: [
                      'Launch new annual cycle',
                      'Participant enrollment',
                      'Manager kickoff communications',
                      'Employee training reminders',
                      'Q1 check-in (optional)'
                    ]
                  }
                ].map((m) => (
                  <div key={m.month} className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">{m.month}</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {m.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-blue-500 mt-1 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="border-l-4 border-l-green-500 pl-4">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">Q2</Badge>
                April - June
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { 
                    month: 'April', 
                    activities: [
                      'Q1 goal progress review',
                      'Ongoing feedback capture',
                      'Mid-year cycle prep (if semi-annual)',
                      'Manager coaching sessions',
                      'Development plan updates'
                    ]
                  },
                  { 
                    month: 'May', 
                    activities: [
                      'Mid-year evaluation launch (if applicable)',
                      'Self-assessment period opens',
                      'Goal adjustment window',
                      'Talent review preparation',
                      'Competency assessment'
                    ]
                  },
                  { 
                    month: 'June', 
                    activities: [
                      'Mid-year evaluations complete',
                      'Mid-year calibration (optional)',
                      'Talent review sessions',
                      'Nine-Box updates',
                      'Development plan mid-year check'
                    ]
                  }
                ].map((m) => (
                  <div key={m.month} className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">{m.month}</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {m.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="border-l-4 border-l-amber-500 pl-4">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Badge variant="default" className="bg-amber-500">Q3</Badge>
                July - September
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { 
                    month: 'July', 
                    activities: [
                      'Ongoing goal tracking',
                      'Continuous feedback',
                      'Succession planning updates',
                      'Leadership assessments',
                      'Q2 retrospective'
                    ]
                  },
                  { 
                    month: 'August', 
                    activities: [
                      'Year-end cycle planning',
                      'Rating scale review',
                      'Form template updates',
                      'Calibration process design',
                      'Manager training refresh'
                    ]
                  },
                  { 
                    month: 'September', 
                    activities: [
                      'Q3 check-in',
                      'Goal stretch adjustments',
                      'Year-end communication prep',
                      'Calibration facilitator training',
                      'Integration rule review'
                    ]
                  }
                ].map((m) => (
                  <div key={m.month} className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">{m.month}</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {m.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-amber-500 mt-1 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div className="border-l-4 border-l-purple-500 pl-4">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Badge variant="default" className="bg-purple-500">Q4</Badge>
                October - December
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { 
                    month: 'October', 
                    activities: [
                      'Year-end evaluation launch',
                      'Self-assessment opens',
                      'Manager evaluation begins',
                      'Goal achievement finalization',
                      '360 feedback collection'
                    ]
                  },
                  { 
                    month: 'November', 
                    activities: [
                      'Manager evaluations due',
                      'Calibration sessions',
                      'AI analysis of distributions',
                      'Bias detection review',
                      'Calibration adjustments'
                    ]
                  },
                  { 
                    month: 'December', 
                    activities: [
                      'Final calibration approval',
                      'Employee review meetings',
                      'Acknowledgment period',
                      'Compensation planning inputs',
                      'Succession updates'
                    ]
                  }
                ].map((m) => (
                  <div key={m.month} className="p-3 bg-muted/50 rounded-lg">
                    <h5 className="font-medium mb-2">{m.month}</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {m.activities.map((a, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-purple-500 mt-1 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Activity Dependencies */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Activity Dependencies</h3>
          <p className="text-muted-foreground mb-4">
            Certain activities must complete before others can begin. Understanding these dependencies 
            is critical for project planning.
          </p>
          <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
            <pre className="text-xs">{`Goal Setting ──────────────────────────────────────────────────────┐
     │                                                                 │
     ▼                                                                 │
Cycle Configuration ──► Participant Enrollment ──► Self-Assessment    │
                                   │                      │            │
                                   │                      ▼            │
                                   │            Manager Evaluation     │
                                   │                      │            │
                                   ▼                      ▼            │
                              Calibration ◄────────────────            │
                                   │                                   │
                                   ▼                                   │
                         Employee Review & Acknowledgment              │
                                   │                                   │
                                   ▼                                   │
                           Cycle Closure ──────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              Compensation   Succession      Learning
               Planning       Updates     Recommendations`}</pre>
          </div>
        </div>

        <Separator />

        {/* Regional Variations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Regional Variations
          </h3>
          <p className="text-muted-foreground mb-4">
            Different regions may have varying fiscal years, holiday considerations, and compliance requirements 
            that affect the performance calendar.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 text-left font-medium">Region</th>
                  <th className="border p-2 text-left font-medium">Fiscal Year</th>
                  <th className="border p-2 text-left font-medium">Key Considerations</th>
                  <th className="border p-2 text-left font-medium">Typical Cycle Timing</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    region: 'Caribbean', 
                    fiscal: 'Jan-Dec or Apr-Mar', 
                    considerations: 'Hurricane season (Aug-Oct), Carnival periods vary by island', 
                    timing: 'Avoid Aug-Oct for calibration'
                  },
                  { 
                    region: 'West Africa', 
                    fiscal: 'Jan-Dec', 
                    considerations: 'Ramadan (varies), Harmattan season (Dec-Feb)', 
                    timing: 'Standard Q4 year-end'
                  },
                  { 
                    region: 'East Africa', 
                    fiscal: 'Jul-Jun (Kenya, Uganda)', 
                    considerations: 'Different fiscal year alignment', 
                    timing: 'June year-end evaluations'
                  },
                  { 
                    region: 'Latin America', 
                    fiscal: 'Jan-Dec', 
                    considerations: 'December holidays, Summer (Jan-Feb)', 
                    timing: 'Nov evaluations, Jan closure'
                  },
                  { 
                    region: 'North America', 
                    fiscal: 'Jan-Dec or Oct-Sep', 
                    considerations: 'Thanksgiving/Christmas period', 
                    timing: 'Nov-Dec evaluations'
                  }
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="border p-2 font-medium">{row.region}</td>
                    <td className="border p-2 text-muted-foreground">{row.fiscal}</td>
                    <td className="border p-2 text-muted-foreground">{row.considerations}</td>
                    <td className="border p-2 text-muted-foreground">{row.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Separator />

        {/* Configuration Options */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuration Options
          </h3>
          <p className="text-muted-foreground mb-4">
            The following timeline elements can be configured per cycle in Intelli HRM:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                setting: 'Cycle Start Date', 
                configurable: true, 
                default: 'N/A',
                notes: 'When the evaluation period begins'
              },
              { 
                setting: 'Cycle End Date', 
                configurable: true, 
                default: 'N/A',
                notes: 'When the evaluation period ends'
              },
              { 
                setting: 'Self-Assessment Window', 
                configurable: true, 
                default: '14 days',
                notes: 'Days before manager evaluation starts'
              },
              { 
                setting: 'Manager Evaluation Deadline', 
                configurable: true, 
                default: 'Cycle end + 14 days',
                notes: 'When all manager evaluations are due'
              },
              { 
                setting: 'Calibration Period', 
                configurable: true, 
                default: '7 days after manager deadline',
                notes: 'Window for calibration sessions'
              },
              { 
                setting: 'Employee Acknowledgment Window', 
                configurable: true, 
                default: '5 business days',
                notes: 'Time for employee to acknowledge'
              },
              { 
                setting: 'Reminder Frequency', 
                configurable: true, 
                default: 'Weekly',
                notes: 'How often overdue reminders are sent'
              },
              { 
                setting: 'Auto-Lock After Close', 
                configurable: true, 
                default: 'Enabled',
                notes: 'Prevent changes after cycle closes'
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                {item.configurable ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                )}
                <div>
                  <div className="font-medium text-sm">{item.setting}</div>
                  <div className="text-xs text-muted-foreground">Default: {item.default}</div>
                  <div className="text-xs text-muted-foreground">{item.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Practices Callout */}
        <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">Timeline Best Practices</h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Build in buffer time before compensation planning cycles</li>
                <li>• Avoid major deadline dates during company-wide events or holidays</li>
                <li>• Schedule calibration sessions when key stakeholders are available</li>
                <li>• Allow at least 2 weeks between manager deadline and calibration</li>
                <li>• Consider manager workload when setting evaluation window length</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

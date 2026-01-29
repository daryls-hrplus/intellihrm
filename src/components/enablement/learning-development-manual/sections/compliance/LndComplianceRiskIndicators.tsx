import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle2, Bell, ShieldAlert } from 'lucide-react';

export function LndComplianceRiskIndicators() {
  return (
    <section id="sec-5-9" data-manual-anchor="sec-5-9" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.9 Risk Indicators & Alerts</h2>
          <p className="text-muted-foreground">Risk scoring, early warning systems, and proactive alerts</p>
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
            <li>Configure and interpret compliance risk indicators</li>
            <li>Set up early warning alerts for at-risk employees and departments</li>
            <li>Understand risk scoring methodology and thresholds</li>
            <li>Take proactive action based on predictive risk signals</li>
          </ul>
        </CardContent>
      </Card>

      {/* Risk Score Methodology */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Risk Score Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each employee receives a dynamic compliance risk score (0-100) calculated from multiple factors.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factor</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Overdue Assignments</TableCell>
                <TableCell>30%</TableCell>
                <TableCell>Count × days overdue</TableCell>
                <TableCell>+10 points per overdue day</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Due Soon (7 days)</TableCell>
                <TableCell>20%</TableCell>
                <TableCell>Count × urgency factor</TableCell>
                <TableCell>+5 points per assignment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Historical Pattern</TableCell>
                <TableCell>15%</TableCell>
                <TableCell>Late completions in last 12 months</TableCell>
                <TableCell>+3 points per late completion</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSE Training Status</TableCell>
                <TableCell>20%</TableCell>
                <TableCell>Safety-critical training gaps</TableCell>
                <TableCell>+15 points per HSE gap</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Certification Expiry</TableCell>
                <TableCell>15%</TableCell>
                <TableCell>Certs expiring within 30 days</TableCell>
                <TableCell>+8 points per expiring cert</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs">
            <pre>{`Risk Score Formula:
risk_score = (overdue_factor × 0.30) + 
             (due_soon_factor × 0.20) + 
             (history_factor × 0.15) + 
             (hse_factor × 0.20) + 
             (expiry_factor × 0.15)

Score Ranges:
├── 0-25:   Low Risk (Green)
├── 26-50:  Moderate Risk (Yellow)
├── 51-75:  High Risk (Orange)
└── 76-100: Critical Risk (Red)`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Risk Category Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk Level</TableHead>
                <TableHead>Score Range</TableHead>
                <TableHead>Visual Indicator</TableHead>
                <TableHead>Automatic Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge className="bg-green-500">Low</Badge></TableCell>
                <TableCell>0-25</TableCell>
                <TableCell>Green indicator</TableCell>
                <TableCell>Standard reminders only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-yellow-500">Moderate</Badge></TableCell>
                <TableCell>26-50</TableCell>
                <TableCell>Yellow indicator</TableCell>
                <TableCell>Increased reminder frequency</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-500">High</Badge></TableCell>
                <TableCell>51-75</TableCell>
                <TableCell>Orange indicator, banner</TableCell>
                <TableCell>Manager notification, dashboard alert</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
                <TableCell>76-100</TableCell>
                <TableCell>Red indicator, priority flag</TableCell>
                <TableCell>HR notification, escalation triggered</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Early Warning Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Early Warning Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Detection Method</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Approaching Deadline</TableCell>
                <TableCell>due_date - 7 days</TableCell>
                <TableCell>7 days</TableCell>
                <TableCell>Reminder notification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">No Progress</TableCell>
                <TableCell>progress = 0% after 50% of time elapsed</TableCell>
                <TableCell>Varies</TableCell>
                <TableCell>Engagement prompt</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stalled Progress</TableCell>
                <TableCell>No activity for 7 days with pending assignment</TableCell>
                <TableCell>7 days inactivity</TableCell>
                <TableCell>Manager visibility</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Recurring Late Pattern</TableCell>
                <TableCell>3+ late completions in 12 months</TableCell>
                <TableCell>Pattern-based</TableCell>
                <TableCell>Priority assignment, closer monitoring</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department Trend</TableCell>
                <TableCell>Department rate declining 3+ months</TableCell>
                <TableCell>Trend-based</TableCell>
                <TableCell>Department head alert</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSE Certification Gap</TableCell>
                <TableCell>Safety cert expires within 30 days</TableCell>
                <TableCell>30 days</TableCell>
                <TableCell>HSE + Manager + HR alert</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alert Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Training → Compliance → Settings → Alert Configuration

Alert Types:
┌─────────────────────────────────────────────────────────────────────────────┐
│ Alert Name                    │ Threshold      │ Recipients     │ Channel  │
├───────────────────────────────┼────────────────┼────────────────┼──────────┤
│ Individual High Risk          │ Score > 75     │ Manager, HR    │ Email    │
│ Department At Risk            │ Dept rate <85% │ Dept Head, HR  │ Email    │
│ Overdue Spike                 │ +20% WoW       │ L&D Admin      │ Email    │
│ HSE Gap Detected              │ Any HSE overdue│ HSE, Manager   │ Email,SMS│
│ Certification Expiring        │ 30 days out    │ Employee, Mgr  │ Email    │
│ Compliance Rate Drop          │ <90% overall   │ HR Director    │ Email    │
└─────────────────────────────────────────────────────────────────────────────┘

Configuration Options:
├── enabled:           true | false
├── threshold:         Configurable per alert type
├── frequency:         immediate | daily_digest | weekly_digest
├── recipients:        Role-based or specific users
├── channels:          email, in_app, sms (for critical)
└── escalation_delay:  Days before escalating unacknowledged alerts`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Risk Dashboard Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Dashboard Widget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    AT-RISK EMPLOYEES WIDGET                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   🔴 CRITICAL (3)                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ John Smith     │ Score: 85 │ 2 overdue, 1 HSE gap │ [View] [Act]   │   │
│   │ Jane Doe       │ Score: 82 │ 3 overdue            │ [View] [Act]   │   │
│   │ Mike Johnson   │ Score: 78 │ 1 HSE expired        │ [View] [Act]   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   🟠 HIGH RISK (7)                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Sarah Williams │ Score: 68 │ 1 overdue, pattern   │ [View] [Act]   │   │
│   │ ...            │           │                      │                │   │
│   │ [View All High Risk →]                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   🟡 MODERATE (15)  [Expand →]                                               │
│   🟢 LOW (180)      [Expand →]                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Notification Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Alert Notification Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Template Placeholders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">COMPLIANCE_RISK_HIGH</TableCell>
                <TableCell>Employee score exceeds 75</TableCell>
                <TableCell>{'{employee_name}'}, {'{risk_score}'}, {'{risk_factors}'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">COMPLIANCE_DEPT_AT_RISK</TableCell>
                <TableCell>Department rate below threshold</TableCell>
                <TableCell>{'{department_name}'}, {'{compliance_rate}'}, {'{overdue_count}'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">COMPLIANCE_TREND_ALERT</TableCell>
                <TableCell>Declining trend detected</TableCell>
                <TableCell>{'{trend_description}'}, {'{affected_scope}'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">HSE_CRITICAL_GAP</TableCell>
                <TableCell>Safety training overdue or expired</TableCell>
                <TableCell>{'{employee_name}'}, {'{training_name}'}, {'{days_overdue}'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Risk Management Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">&lt; 5%</div>
              <div className="text-sm text-muted-foreground">High/Critical risk employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24 hrs</div>
              <div className="text-sm text-muted-foreground">Critical alert response SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">HSE gaps tolerance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Weekly</div>
              <div className="text-sm text-muted-foreground">Risk review cadence</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CheckCircle2, Eye, Bell } from 'lucide-react';

export function LndComplianceManagerView() {
  return (
    <section id="sec-5-10" data-manual-anchor="sec-5-10" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.10 Manager Compliance View</h2>
          <p className="text-muted-foreground">MSS team compliance portal and manager actions</p>
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
            <li>Navigate the Manager Self-Service (MSS) compliance dashboard</li>
            <li>Monitor direct reports' compliance training status</li>
            <li>Take action on overdue training and exemption requests</li>
            <li>Configure team compliance alerts and notifications</li>
          </ul>
        </CardContent>
      </Card>

      {/* Manager Dashboard Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Manager Compliance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: MSS → My Team → Compliance Training

┌─────────────────────────────────────────────────────────────────────────────┐
│                    TEAM COMPLIANCE DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Team: Operations (12 direct reports)                                       │
│   Manager: Sarah Williams                                                    │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ TEAM COMPLIANCE SUMMARY                                               │  │
│   │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │  │
│   │ │  91.7%   │ │   10     │ │    2     │ │    1     │                  │  │
│   │ │   Team   │ │ Complete │ │ In Prog  │ │ Overdue  │                  │  │
│   │ │Compliance│ │          │ │          │ │ ⚠️ Action│                  │  │
│   │ └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │ TEAM MEMBER STATUS                                                    │  │
│   │ ┌───────────────────────────────────────────────────────────────────┐│  │
│   │ │ Employee          │ Status    │ Pending │ Overdue │ Actions      ││  │
│   │ ├───────────────────┼───────────┼─────────┼─────────┼──────────────┤│  │
│   │ │ John Smith        │ 🔴 At Risk │    2    │    1    │ [View][Nudge]││  │
│   │ │ Jane Doe          │ 🟢 Good    │    0    │    0    │ [View]       ││  │
│   │ │ Mike Johnson      │ 🟡 Due Soon│    1    │    0    │ [View][Nudge]││  │
│   │ │ Emily Brown       │ 🟢 Good    │    0    │    0    │ [View]       ││  │
│   │ │ ... (8 more)      │           │         │         │              ││  │
│   │ └───────────────────────────────────────────────────────────────────┘│  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│   ┌───────────────────────────────┐ ┌───────────────────────────────────┐   │
│   │ PENDING MY APPROVAL           │ │ TEAM DEADLINES                     │   │
│   │                               │ │                                    │   │
│   │ • Exemption: John Smith      │ │ Feb 28: Anti-Harassment (3 team)  │   │
│   │   [Review Request]            │ │ Mar 15: OSHA 10 (2 team)          │   │
│   │                               │ │ Mar 31: Code of Conduct (All)     │   │
│   └───────────────────────────────┘ └───────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Manager Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manager Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>When to Use</TableHead>
                <TableHead>Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">View Details</TableCell>
                <TableCell>View employee's full compliance profile</TableCell>
                <TableCell>Review individual status</TableCell>
                <TableCell>Navigate to employee compliance view</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Send Reminder</TableCell>
                <TableCell>Send personalized reminder to employee</TableCell>
                <TableCell>Assignment approaching due date</TableCell>
                <TableCell>Email notification sent to employee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Approve Exemption</TableCell>
                <TableCell>Approve pending exemption request</TableCell>
                <TableCell>Valid exemption justification</TableCell>
                <TableCell>Assignment marked exempted</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Reject Exemption</TableCell>
                <TableCell>Reject exemption with reason</TableCell>
                <TableCell>Insufficient justification</TableCell>
                <TableCell>Employee notified, must complete</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Extend Deadline</TableCell>
                <TableCell>Grant deadline extension</TableCell>
                <TableCell>Legitimate delay reason</TableCell>
                <TableCell>New due date set, logged</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Escalate to HR</TableCell>
                <TableCell>Escalate persistent non-compliance</TableCell>
                <TableCell>Multiple overdue, no response</TableCell>
                <TableCell>HR notification, compliance flag</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bulk Remind</TableCell>
                <TableCell>Send reminder to all with pending training</TableCell>
                <TableCell>Approaching team deadline</TableCell>
                <TableCell>Batch notifications sent</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Team Drill-Down */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Member Drill-Down</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Click on team member → Individual Compliance View

┌─────────────────────────────────────────────────────────────────────────────┐
│   EMPLOYEE COMPLIANCE DETAIL                                                 │
│   Employee: John Smith | Department: Operations | Status: 🔴 At Risk        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ACTIVE ASSIGNMENTS (3)                                                     │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Training              │ Due Date   │ Status    │ Progress │ Actions │   │
│   ├───────────────────────┼────────────┼───────────┼──────────┼─────────│   │
│   │ Anti-Harassment       │ 2026-02-15 │ 🔴 Overdue│   40%    │[Extend] │   │
│   │ OSHA 10 (HSE)        │ 2026-03-01 │ 🟡 Due    │    0%    │[Remind] │   │
│   │ Data Privacy          │ 2026-03-31 │ 🟢 OnTrack│   75%    │ —       │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   PENDING EXEMPTION REQUEST                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Training: IT Security Refresher                                      │   │
│   │ Requested: 2026-02-10                                                │   │
│   │ Type: Prior Learning                                                 │   │
│   │ Reason: "Completed equivalent certification externally last month"  │   │
│   │ Attachments: external_cert.pdf                                       │   │
│   │                                                                       │   │
│   │ [Approve]  [Reject]  [Request More Info]                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   COMPLIANCE HISTORY (12 months)                                            │
│   ├── 2026-01: Code of Conduct - Completed on time ✓                       │
│   ├── 2025-11: Fire Safety - Completed on time ✓                           │
│   ├── 2025-09: OSHA 10 - Completed 3 days late ⚠️                          │
│   └── [View Full History]                                                   │
│                                                                              │
│   MANAGER NOTES                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ [Add private note about this employee's compliance]                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Manager Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Manager Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Configurable</TableHead>
                <TableHead>Channel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Team member overdue</TableCell>
                <TableCell><Badge className="bg-green-500">Enabled</Badge></TableCell>
                <TableCell>Yes - can disable</TableCell>
                <TableCell>Email, In-app</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Exemption request pending</TableCell>
                <TableCell><Badge className="bg-green-500">Enabled</Badge></TableCell>
                <TableCell>No - required</TableCell>
                <TableCell>Email, In-app</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Team deadline approaching</TableCell>
                <TableCell><Badge className="bg-green-500">Enabled</Badge></TableCell>
                <TableCell>Yes - timing configurable</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Weekly team summary</TableCell>
                <TableCell><Badge variant="secondary">Disabled</Badge></TableCell>
                <TableCell>Yes - can enable</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Escalation received from HR</TableCell>
                <TableCell><Badge className="bg-green-500">Enabled</Badge></TableCell>
                <TableCell>No - required</TableCell>
                <TableCell>Email, In-app</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Visibility Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manager Visibility Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visibility Scope</TableHead>
                <TableHead>Data Access</TableHead>
                <TableHead>Configuration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Direct Reports Only</TableCell>
                <TableCell>Employees with manager_id = current user</TableCell>
                <TableCell>Default setting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Extended Team</TableCell>
                <TableCell>Direct reports + their direct reports</TableCell>
                <TableCell>Configurable by admin</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department View</TableCell>
                <TableCell>All employees in same department</TableCell>
                <TableCell>Requires department_head role</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cross-Department</TableCell>
                <TableCell>Employees in multiple departments</TableCell>
                <TableCell>Requires additional permissions</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            Manager visibility is determined by the <code className="bg-muted px-1 rounded">profiles.manager_id</code> 
            relationship. Extended hierarchy views require the <code className="bg-muted px-1 rounded">view_extended_team_compliance</code> 
            permission.
          </p>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Manager Engagement Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Weekly</div>
              <div className="text-sm text-muted-foreground">Recommended review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24 hrs</div>
              <div className="text-sm text-muted-foreground">Exemption response SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Target team compliance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Escalated to HR target</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function LndComplianceIndividualAssignments() {
  return (
    <section id="sec-5-5" data-manual-anchor="sec-5-5" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <User className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.5 Individual Assignment Management</h2>
          <p className="text-muted-foreground">Single employee assignment lifecycle and management</p>
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
            <li>Create and manage individual compliance training assignments</li>
            <li>Modify assignment due dates, priorities, and notes</li>
            <li>Process exemption requests and documentation</li>
            <li>Track individual employee compliance history</li>
          </ul>
        </CardContent>
      </Card>

      {/* Assignment Creation Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Individual Assignment Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Training → Compliance → Employee View → [Employee] → Assign Training

Step 1: Select Employee
├── Search by name, employee ID, or department
├── View current compliance status summary
└── Review existing active assignments

Step 2: Select Compliance Requirement
├── Browse available compliance rules
├── Filter by category (Mandatory, HSE-Linked, Role-Based)
├── View course details and estimated duration
└── Check for prerequisites

Step 3: Configure Assignment
├── due_date:           Default from rule or custom
├── priority:           normal | high | urgent
├── source:             manual | rule_based | incident | appraisal
├── notes:              Assignment justification or context
└── exemption_allowed:  Override rule default if needed

Step 4: Validate & Create
├── Check for duplicate active assignment
├── Verify employee meets target criteria
├── Create compliance_training_assignments record
├── Trigger assignment notification
└── Log in audit trail`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Database Value</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Manual</TableCell>
                <TableCell className="font-mono text-xs">manual</TableCell>
                <TableCell>Admin/HR creates assignment</TableCell>
                <TableCell>Ad-hoc training request</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rule-Based</TableCell>
                <TableCell className="font-mono text-xs">rule_based</TableCell>
                <TableCell>Scheduled job matches employee to rule</TableCell>
                <TableCell>New hire auto-assignment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Incident</TableCell>
                <TableCell className="font-mono text-xs">incident</TableCell>
                <TableCell>HSE incident corrective action</TableCell>
                <TableCell>Remedial safety training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Appraisal</TableCell>
                <TableCell className="font-mono text-xs">appraisal</TableCell>
                <TableCell>Performance appraisal development plan</TableCell>
                <TableCell>Competency gap training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Recertification</TableCell>
                <TableCell className="font-mono text-xs">recertification</TableCell>
                <TableCell>Certificate nearing expiry</TableCell>
                <TableCell>Annual refresher</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Manager Request</TableCell>
                <TableCell className="font-mono text-xs">manager_request</TableCell>
                <TableCell>Manager submits training request</TableCell>
                <TableCell>Team skill development</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Modification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Assignment Modification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Modifiable</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead>Audit Logged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">due_date</TableCell>
                <TableCell><Badge className="bg-green-500">Yes</Badge></TableCell>
                <TableCell>Cannot be in the past</TableCell>
                <TableCell>Yes - reason required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">priority</TableCell>
                <TableCell><Badge className="bg-green-500">Yes</Badge></TableCell>
                <TableCell>None</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">notes</TableCell>
                <TableCell><Badge className="bg-green-500">Yes</Badge></TableCell>
                <TableCell>Append only (history preserved)</TableCell>
                <TableCell>Yes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">status</TableCell>
                <TableCell><Badge variant="secondary">Limited</Badge></TableCell>
                <TableCell>Only via defined transitions</TableCell>
                <TableCell>Yes - reason required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">employee_id</TableCell>
                <TableCell><Badge variant="destructive">No</Badge></TableCell>
                <TableCell>Reassignment not allowed</TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">compliance_training_id</TableCell>
                <TableCell><Badge variant="destructive">No</Badge></TableCell>
                <TableCell>Rule change not allowed</TableCell>
                <TableCell>N/A</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Due Date Extension Workflow:

1. Navigate to assignment detail
2. Click "Extend Due Date"
3. Select new due date
4. Provide extension reason (required):
   ├── employee_leave      - Employee on approved leave
   ├── system_issue        - Technical issues prevented completion
   ├── workload            - Excessive workload approved by manager
   ├── medical             - Medical exemption documentation
   └── other               - Free text explanation

5. Submit for approval (if required by policy)
6. Audit log captures: old_date, new_date, reason, extended_by, timestamp`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Employee Compliance View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Compliance View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE COMPLIANCE DASHBOARD                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Employee: John Smith (EMP-001)                                            │
│   Department: Operations | Location: Kingston HQ                            │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │ COMPLIANCE SUMMARY                                                     │ │
│   │ ├── Overall Status: ⚠️ AT RISK (1 overdue)                            │ │
│   │ ├── Active Assignments: 3                                              │ │
│   │ ├── Completed This Year: 7                                             │ │
│   │ └── Certifications Active: 4                                           │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   ACTIVE ASSIGNMENTS                                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Training              │ Due Date   │ Status    │ Priority │ Actions │   │
│   ├───────────────────────┼────────────┼───────────┼──────────┼─────────│   │
│   │ Anti-Harassment       │ 2026-02-28 │ 🔴 Overdue│ Urgent   │ [View]  │   │
│   │ Forklift Safety Cert  │ 2026-03-15 │ 🟡 Due    │ High     │ [View]  │   │
│   │ Data Privacy GDPR     │ 2026-04-30 │ 🟢 On Track│ Normal  │ [View]  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   COMPLIANCE HISTORY (Last 12 Months)                                       │
│   ├── 2026-01: IT Security Awareness - Completed                           │
│   ├── 2025-11: Code of Conduct - Completed                                 │
│   ├── 2025-09: Fire Safety - Completed                                     │
│   └── [View Full History]                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Assignment Cancellation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Assignments can be cancelled under specific circumstances with appropriate documentation.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cancellation Reason</TableHead>
                <TableHead>Approval Required</TableHead>
                <TableHead>Audit Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Employee Terminated</TableCell>
                <TableCell>Auto-cancelled on termination</TableCell>
                <TableCell>Retained for 7 years</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Rule Deactivated</TableCell>
                <TableCell>Admin only</TableCell>
                <TableCell>Batch cancelled, logged</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Duplicate Assignment</TableCell>
                <TableCell>Admin review</TableCell>
                <TableCell>Linked to kept assignment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Role Change</TableCell>
                <TableCell>HR approval</TableCell>
                <TableCell>New role assignments created</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Permanent Exemption</TableCell>
                <TableCell>Manager + HR approval</TableCell>
                <TableCell>Exemption reason documented</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Individual Assignment Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">4-6</div>
              <div className="text-sm text-muted-foreground">Avg active assignments/employee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">14 days</div>
              <div className="text-sm text-muted-foreground">Avg completion time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">&lt; 5%</div>
              <div className="text-sm text-muted-foreground">Target exemption rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1 extension</div>
              <div className="text-sm text-muted-foreground">Max per assignment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

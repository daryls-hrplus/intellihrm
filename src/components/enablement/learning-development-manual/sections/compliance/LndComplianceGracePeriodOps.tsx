import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export function LndComplianceGracePeriodOps() {
  return (
    <section id="sec-5-13" data-manual-anchor="sec-5-13" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Clock className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.13 Grace Period Operations</h2>
          <p className="text-sm text-muted-foreground">
            Extension requests, time tracking, and manager override workflows
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure default grace periods by compliance category</li>
            <li>Process employee extension requests through approval workflow</li>
            <li>Track grace period time remaining and expiry</li>
            <li>Enable manager overrides with justification logging</li>
            <li>Integrate grace periods with escalation tier calculations</li>
          </ul>
        </CardContent>
      </Card>

      {/* Grace Period Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Grace Periods by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compliance Category</TableHead>
                <TableHead>Default Grace</TableHead>
                <TableHead>Max Extension</TableHead>
                <TableHead>Extension Limit</TableHead>
                <TableHead>Auto-Escalate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">Regulatory/Legal</Badge></TableCell>
                <TableCell>0 days</TableCell>
                <TableCell>7 days</TableCell>
                <TableCell>1 extension</TableCell>
                <TableCell>Immediate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">HSE/Safety</Badge></TableCell>
                <TableCell>3 days</TableCell>
                <TableCell>14 days</TableCell>
                <TableCell>2 extensions</TableCell>
                <TableCell>After grace</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">Security/IT</Badge></TableCell>
                <TableCell>7 days</TableCell>
                <TableCell>21 days</TableCell>
                <TableCell>2 extensions</TableCell>
                <TableCell>After grace</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="outline">Policy/HR</Badge></TableCell>
                <TableCell>14 days</TableCell>
                <TableCell>30 days</TableCell>
                <TableCell>3 extensions</TableCell>
                <TableCell>After grace</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Database Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database Field Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`compliance_training_assignments
├── grace_period_days: INT (default from category)
├── grace_period_end: DATE (calculated: due_date + grace_period_days)
├── extension_count: INT (tracks number of extensions granted)
├── original_due_date: DATE (preserved for audit)
└── extended_due_date: DATE (current effective due date)

compliance_extension_requests
├── id: UUID PK
├── assignment_id: UUID FK → compliance_training_assignments.id
├── employee_id: UUID FK → profiles.id
├── requested_days: INT
├── reason: TEXT (employee justification)
├── status: TEXT ('pending', 'approved', 'denied', 'auto_approved')
├── reviewed_by: UUID FK → profiles.id
├── reviewed_at: TIMESTAMP
├── review_notes: TEXT
├── manager_override: BOOLEAN
├── override_justification: TEXT
└── created_at: TIMESTAMP

compliance_grace_period_config
├── id: UUID PK
├── company_id: UUID FK
├── compliance_category_id: UUID FK
├── default_grace_days: INT
├── max_extension_days: INT
├── max_extensions: INT
├── requires_approval: BOOLEAN
├── auto_approve_below_days: INT (auto-approve if <= this)
└── is_active: BOOLEAN`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Extension Request Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Extension Request Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     GRACE PERIOD EXTENSION WORKFLOW                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Employee Requests Extension (ESS)                                              │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │ Validation Checks:                                                       │   │
│   │ ├── extension_count < max_extensions?                                    │   │
│   │ ├── requested_days <= max_extension_days?                                │   │
│   │ └── Assignment not already in Tier 4 escalation?                         │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐     auto_approve_below_days check                          │
│   │ Auto-Approve?   │──── Yes ───> status = 'auto_approved'                      │
│   └────────┬────────┘              extended_due_date updated                     │
│            │ No                                                                  │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Route to        │  Based on compliance_category:                             │
│   │ Approver        │  ├── Manager (standard)                                    │
│   │                 │  ├── HR + Manager (HSE)                                    │
│   └────────┬────────┘  └── Compliance Officer (Regulatory)                       │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Approval        │  If Approved:                                              │
│   │ Decision        │  ├── extension_count++                                     │
│   │                 │  ├── extended_due_date = current + requested_days          │
│   └────────┬────────┘  └── Notification to employee                              │
│            │                                                                     │
│            ▼           If Denied:                                                │
│   ┌─────────────────┐  ├── Status remains 'overdue'                              │
│   │ Log to Audit    │  └── Escalation continues                                  │
│   │ Trail           │                                                            │
│   └─────────────────┘                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Manager Override */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manager Override Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Managers with appropriate permissions can override standard grace period rules. 
            All overrides are logged with mandatory justification.
          </p>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Override Type</TableHead>
                <TableHead>Permission Required</TableHead>
                <TableHead>Justification</TableHead>
                <TableHead>Audit Trail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Extend Beyond Max</TableCell>
                <TableCell>compliance.override_grace</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Full logging + HR notification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Waive Grace Period</TableCell>
                <TableCell>compliance.waive_grace</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Full logging</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Reset Extension Count</TableCell>
                <TableCell>compliance.admin</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Full logging + Compliance notification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Approve Denied Request</TableCell>
                <TableCell>compliance.override_denial</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Full logging + Original denier notified</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Business Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm">Grace period countdown pauses during approved leave (leave_type = 'medical', 'bereavement')</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm">Extensions do not reset escalation_level—only freeze tier progression</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm">HSE/Safety training cannot be extended if linked to active incident investigation</p>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm">Regulatory training with is_legally_required = true has no grace period (0 days)</p>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm">Employees in notice_period cannot request extensions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

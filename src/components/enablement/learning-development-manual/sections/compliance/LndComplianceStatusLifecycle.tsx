import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GitBranch, CheckCircle2, Database } from 'lucide-react';

export function LndComplianceStatusLifecycle() {
  return (
    <section id="sec-5-7" data-manual-anchor="sec-5-7" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <GitBranch className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.7 Assignment Status Lifecycle</h2>
          <p className="text-muted-foreground">Status transitions, field reference, and state management</p>
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
            <li>Understand all compliance assignment status values and their meanings</li>
            <li>Configure status transition rules and automation triggers</li>
            <li>Track assignment progress through the complete lifecycle</li>
            <li>Integrate status changes with notification and escalation systems</li>
          </ul>
        </CardContent>
      </Card>

      {/* Status Values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Status Values</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Visual Indicator</TableHead>
                <TableHead>System Behavior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="secondary">pending</Badge></TableCell>
                <TableCell>Assignment created, not yet started</TableCell>
                <TableCell>Gray / Outline</TableCell>
                <TableCell>Included in "Not Started" counts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-500">in_progress</Badge></TableCell>
                <TableCell>Employee has started training</TableCell>
                <TableCell>Blue</TableCell>
                <TableCell>Progress % tracked, reminders active</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-500">completed</Badge></TableCell>
                <TableCell>Training finished successfully</TableCell>
                <TableCell>Green / Checkmark</TableCell>
                <TableCell>Certificate generated, history recorded</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">overdue</Badge></TableCell>
                <TableCell>Due date passed, not completed</TableCell>
                <TableCell>Red</TableCell>
                <TableCell>Escalation triggered, compliance flag</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">exempted</Badge></TableCell>
                <TableCell>Approved exemption from requirement</TableCell>
                <TableCell>Amber / Shield icon</TableCell>
                <TableCell>Excluded from compliance %, audit flagged</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-orange-500">escalated</Badge></TableCell>
                <TableCell>Overdue and escalation in progress</TableCell>
                <TableCell>Orange / Warning</TableCell>
                <TableCell>Manager/HR notified, intervention pending</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-gray-500">cancelled</Badge></TableCell>
                <TableCell>Assignment cancelled (terminated, rule inactive)</TableCell>
                <TableCell>Gray / Strikethrough</TableCell>
                <TableCell>Excluded from all metrics, retained for audit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-purple-500">expired</Badge></TableCell>
                <TableCell>Completed training has expired, recert needed</TableCell>
                <TableCell>Purple</TableCell>
                <TableCell>Triggers new assignment, compliance gap</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Transition Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Transition Diagram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLIANCE ASSIGNMENT STATUS LIFECYCLE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                              ┌───────────┐                                   │
│                              │  PENDING  │ ◀──── Assignment Created          │
│                              └─────┬─────┘                                   │
│                                    │                                         │
│            ┌───────────────────────┼───────────────────────┐                │
│            │                       │                       │                │
│            ▼                       ▼                       ▼                │
│    ┌───────────────┐       ┌─────────────┐         ┌───────────┐           │
│    │   CANCELLED   │       │ IN_PROGRESS │         │  EXEMPTED │           │
│    └───────────────┘       └──────┬──────┘         └───────────┘           │
│     (Termination,                 │                    ▲                    │
│      Rule Inactive)               │                    │                    │
│                                   │              Exemption                  │
│            ┌──────────────────────┼──────────────Approved                   │
│            │                      │                    │                    │
│            │                      ▼                    │                    │
│            │              ┌─────────────┐              │                    │
│            │              │  COMPLETED  │──────────────┘                    │
│            │              └──────┬──────┘   (Rare: post-completion          │
│            │                     │           exemption)                     │
│            │                     │                                          │
│            │                     │  Validity Period                         │
│            │                     │  Expires                                 │
│            │                     ▼                                          │
│            │              ┌─────────────┐                                   │
│            │              │   EXPIRED   │──────▶ New Assignment Created     │
│            │              └─────────────┘                                   │
│            │                                                                │
│            │                                                                │
│   Due Date Passed                                                           │
│            │                                                                │
│            ▼                                                                │
│    ┌─────────────┐                                                          │
│    │   OVERDUE   │                                                          │
│    └──────┬──────┘                                                          │
│           │                                                                 │
│     Grace Period                                                            │
│     Expired                                                                 │
│           │                                                                 │
│           ▼                                                                 │
│    ┌─────────────┐                                                          │
│    │  ESCALATED  │──────▶ Manager/HR Intervention                          │
│    └─────────────┘                                                          │
│           │                                                                 │
│           ├──────────────▶ Completed (Late)                                 │
│           │                                                                 │
│           └──────────────▶ Exempted (After Review)                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Schema: compliance_training_assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>PK</TableCell>
                <TableCell>Unique assignment identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">compliance_training_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Reference to compliance_training rule</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Assigned employee (profiles.id)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Multi-tenant isolation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">status</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>pending, in_progress, completed, overdue, exempted, escalated, cancelled, expired</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">due_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Assignment deadline</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">assigned_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Assignment creation timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">started_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>No</TableCell>
                <TableCell>First access to training content</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">completed_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Successful completion timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">progress_percent</TableCell>
                <TableCell>INTEGER</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Current progress (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">source</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>manual, rule_based, incident, appraisal, recertification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">source_reference_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Reference to triggering record (incident, appraisal, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">priority</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>normal, high, urgent</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">reminder_sent_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Last reminder notification timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">escalated_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Escalation trigger timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">escalation_level</TableCell>
                <TableCell>INTEGER</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Current escalation tier (1-4)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_status</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>No</TableCell>
                <TableCell>none, pending, approved, rejected</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_reason</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Documented exemption justification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">notes</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Assignment notes and comments</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">created_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Record creation timestamp</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">updated_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell>Yes</TableCell>
                <TableCell>Last modification timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transition Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automatic Status Transitions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transition</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Automation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>pending → in_progress</TableCell>
                <TableCell>Employee opens course content</TableCell>
                <TableCell>LMS enrollment started_at sync</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>in_progress → completed</TableCell>
                <TableCell>Course completion confirmed</TableCell>
                <TableCell>LMS enrollment completed_at sync</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>pending/in_progress → overdue</TableCell>
                <TableCell>due_date &lt; current_date</TableCell>
                <TableCell>Scheduled job (daily at 00:01 UTC)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>overdue → escalated</TableCell>
                <TableCell>grace_period_days expired</TableCell>
                <TableCell>Scheduled job after grace period</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>completed → expired</TableCell>
                <TableCell>Certification validity expires</TableCell>
                <TableCell>Scheduled job checks expiry dates</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>any → cancelled</TableCell>
                <TableCell>Employee terminated OR rule deactivated</TableCell>
                <TableCell>Trigger on profile or rule update</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>any → exempted</TableCell>
                <TableCell>Exemption approved</TableCell>
                <TableCell>Workflow approval completion</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Status Distribution Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">85%</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">10%</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">&lt; 3%</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">&lt; 2%</div>
              <div className="text-sm text-muted-foreground">Exempted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">&lt; 1%</div>
              <div className="text-sm text-muted-foreground">Escalated</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

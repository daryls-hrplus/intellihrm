import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Workflow, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Settings,
  Clock,
  Users,
  Shield
} from 'lucide-react';

export function LndWorkflowHRHubIntegration() {
  return (
    <section className="space-y-6" id="sec-4-13" data-manual-anchor="sec-4-13">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Workflow className="h-6 w-6 text-blue-600" />
          4.13 HR Hub Workflow Integration
        </h2>
        <p className="text-muted-foreground">
          Unified training request approval through the HR Hub workflow engine, enabling 
          SLA tracking, escalation, and cross-module visibility.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure the TRAINING_REQUEST_APPROVAL workflow template</li>
            <li>Understand the link between training_requests and workflow_instances</li>
            <li>Set up cost-based approval routing thresholds</li>
            <li>Enable SLA tracking and escalation rules</li>
            <li>Access training approvals through the HR Hub Tasks dashboard</li>
          </ul>
        </CardContent>
      </Card>

      <Alert variant="default" className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle>Integration Architecture</AlertTitle>
        <AlertDescription>
          The L&D module supports two approval paths: a standalone <code className="bg-muted px-1 rounded">training_request_approvals</code> table 
          for simple use cases, and integration with the unified <code className="bg-muted px-1 rounded">workflow_instances</code> engine 
          for enterprise governance. This section documents the HR Hub integration path.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader><CardTitle>Approval Architecture Diagram</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    TRAINING REQUEST APPROVAL ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Training Request Submission                                                    │
│             │                                                                    │
│             ▼                                                                    │
│   ┌─────────────────────────┐                                                    │
│   │   Cost Threshold Check  │                                                    │
│   │   (company_lnd_settings)│                                                    │
│   └───────────┬─────────────┘                                                    │
│               │                                                                  │
│       ┌───────┴───────┐                                                          │
│       │               │                                                          │
│   [< Threshold]   [≥ Threshold]                                                  │
│       │               │                                                          │
│       ▼               ▼                                                          │
│   ┌───────────┐   ┌─────────────────────────────────────────────┐               │
│   │ Standalone│   │          HR Hub Workflow Engine             │               │
│   │  Approval │   │                                             │               │
│   │   Path    │   │   workflow_instances                        │               │
│   └─────┬─────┘   │   ├── template: TRAINING_REQUEST_APPROVAL   │               │
│         │         │   ├── category: training_request            │               │
│         │         │   └── status: pending → in_progress → done  │               │
│         │         │                                             │               │
│         │         │   Approval Chain (workflow_steps):          │               │
│         │         │   ┌──────────┬──────────┬──────────┐        │               │
│         │         │   │ Step 1   │ Step 2   │ Step 3   │        │               │
│         │         │   │ Manager  │ HR       │ Finance  │        │               │
│         │         │   │ (24h SLA)│ (48h SLA)│ (24h SLA)│        │               │
│         │         │   └────┬─────┴────┬─────┴────┬─────┘        │               │
│         │         │        │          │          │              │               │
│         │         └────────┼──────────┼──────────┼──────────────┘               │
│         │                  │          │          │                              │
│         └──────────────────┼──────────┼──────────┘                              │
│                            ▼          ▼                                          │
│                      ┌───────────────────────┐                                   │
│                      │     Final Outcome     │                                   │
│                      │  Approved / Rejected  │                                   │
│                      └───────────┬───────────┘                                   │
│                                  │                                               │
│                                  ▼                                               │
│                      ┌───────────────────────┐                                   │
│                      │   lms_enrollments     │ (if approved)                     │
│                      │   Auto-create         │                                   │
│                      └───────────────────────┘                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Database Tables Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* workflow_templates */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge>workflow_templates</Badge>
                <span className="text-sm text-muted-foreground">Template definition</span>
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">template_code</TableCell>
                    <TableCell>TEXT</TableCell>
                    <TableCell>Unique identifier (TRAINING_REQUEST_APPROVAL)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">name</TableCell>
                    <TableCell>TEXT</TableCell>
                    <TableCell>Display name for UI</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">category</TableCell>
                    <TableCell>ENUM</TableCell>
                    <TableCell>training_request</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">process_type</TableCell>
                    <TableCell>TEXT</TableCell>
                    <TableCell>learning_approval</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">is_active</TableCell>
                    <TableCell>BOOLEAN</TableCell>
                    <TableCell>Enable/disable workflow</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* workflow_steps */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge>workflow_steps</Badge>
                <span className="text-sm text-muted-foreground">Approval chain configuration</span>
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">template_id</TableCell>
                    <TableCell>UUID FK</TableCell>
                    <TableCell>Link to template</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">step_order</TableCell>
                    <TableCell>INT</TableCell>
                    <TableCell>Sequence in approval chain (1, 2, 3...)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">approver_type</TableCell>
                    <TableCell>ENUM</TableCell>
                    <TableCell>direct_manager | role | specific_user | hr</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">approver_role</TableCell>
                    <TableCell>TEXT</TableCell>
                    <TableCell>Role name if approver_type = 'role'</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">sla_hours</TableCell>
                    <TableCell>INT</TableCell>
                    <TableCell>Hours before SLA breach</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">escalation_hours</TableCell>
                    <TableCell>INT</TableCell>
                    <TableCell>Hours before auto-escalation</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">can_skip</TableCell>
                    <TableCell>BOOLEAN</TableCell>
                    <TableCell>Allow skip if approver unavailable</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* workflow_instances */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge>workflow_instances</Badge>
                <span className="text-sm text-muted-foreground">Runtime instances</span>
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">template_id</TableCell>
                    <TableCell>UUID FK</TableCell>
                    <TableCell>Which template governs this instance</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">reference_type</TableCell>
                    <TableCell>TEXT</TableCell>
                    <TableCell>'training_request'</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">reference_id</TableCell>
                    <TableCell>UUID</TableCell>
                    <TableCell>training_requests.id</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">status</TableCell>
                    <TableCell>ENUM</TableCell>
                    <TableCell>pending | in_progress | approved | rejected | cancelled</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">current_step</TableCell>
                    <TableCell>INT</TableCell>
                    <TableCell>Which step_order is active</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono">sla_deadline</TableCell>
                    <TableCell>TIMESTAMPTZ</TableCell>
                    <TableCell>Current step's SLA deadline</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* training_requests link */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Badge variant="secondary">training_requests</Badge>
                <span className="text-sm text-muted-foreground">Integration field</span>
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purpose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono">workflow_instance_id</TableCell>
                    <TableCell>UUID FK</TableCell>
                    <TableCell>Links to workflow_instances for HR Hub integration</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Procedure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>HR Hub</span>
              <ArrowRight className="h-4 w-4" />
              <span>Workflow Templates</span>
              <ArrowRight className="h-4 w-4" />
              <span>TRAINING_REQUEST_APPROVAL</span>
            </div>

            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Locate the Training Request Template</p>
                  <p className="text-sm text-muted-foreground">
                    Navigate to HR Hub → Workflow Templates. Find "Training Request Approval" 
                    in the template list (category: training_request).
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Configure Approval Steps</p>
                  <p className="text-sm text-muted-foreground">
                    Add steps to the approval chain. Typical configuration:
                  </p>
                  <ul className="text-sm list-disc pl-6 mt-2 space-y-1">
                    <li>Step 1: Direct Manager (24h SLA)</li>
                    <li>Step 2: HR Partner (48h SLA) - for requests over cost threshold</li>
                    <li>Step 3: Finance (24h SLA) - for requests over $5,000</li>
                  </ul>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Set SLA and Escalation Rules</p>
                  <p className="text-sm text-muted-foreground">
                    For each step, configure SLA hours and escalation behavior. Escalation 
                    can auto-approve, notify skip-level manager, or notify HR.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Enable the Template</p>
                  <p className="text-sm text-muted-foreground">
                    Set is_active = true. New training requests meeting cost thresholds will 
                    automatically route through this workflow.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-1">5</Badge>
                <div>
                  <p className="font-medium">Configure Cost Threshold (Optional)</p>
                  <p className="text-sm text-muted-foreground">
                    In Admin → L&D Settings, set the approval_cost_threshold. Requests below 
                    this amount use simplified approval; requests at or above use HR Hub workflow.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Tracking & Escalation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
SLA Lifecycle for Training Approvals:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request Submitted
       │
       ▼
┌─────────────────┐
│ Step 1 Started  │─────▶ SLA Clock Starts
│ (Manager)       │       sla_deadline = now() + sla_hours
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
[On Time]   [SLA Breach]
    │           │
    │           ├── Warning notification at 80% SLA
    │           ├── Breach notification at 100% SLA
    │           └── Escalation triggered at escalation_hours
    │
    ▼
┌─────────────────┐
│ Step Approved   │─────▶ Move to next step, reset SLA clock
└────────┬────────┘       OR final approval if last step
         │
         ▼
    [Next Step...]

Escalation Actions (configurable per step):
├── auto_approve: Approve and proceed
├── skip_to_next: Move to next approver level
├── notify_hr: Alert HR team
└── notify_skip_level: Alert manager's manager
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            TalentApprovalWorkflowManager Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The TalentApprovalWorkflowManager in Performance → Setup → Approval Workflows 
              provides a unified interface for configuring L&D approval workflows alongside 
              other talent processes.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Process Type</th>
                    <th className="text-left py-2 font-semibold">Scope Levels</th>
                    <th className="text-left py-2 font-semibold">Template Code</th>
                    <th className="text-left py-2 font-semibold">Steps</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Training Request</td>
                    <td className="py-2">Individual</td>
                    <td className="py-2 font-mono text-xs">TRAINING_REQUEST_APPROVAL</td>
                    <td className="py-2">3</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Certification Request</td>
                    <td className="py-2">Individual</td>
                    <td className="py-2 font-mono text-xs">CERTIFICATION_REQUEST_APPROVAL</td>
                    <td className="py-2">2</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">External Training Verification</td>
                    <td className="py-2">Individual</td>
                    <td className="py-2 font-mono text-xs">EXTERNAL_TRAINING_VERIFICATION</td>
                    <td className="py-2">1</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Recertification Request</td>
                    <td className="py-2">Individual</td>
                    <td className="py-2 font-mono text-xs">RECERTIFICATION_REQUEST_APPROVAL</td>
                    <td className="py-2">1</td>
                  </tr>
                  <tr>
                    <td className="py-2">Budget Exception</td>
                    <td className="py-2">Department</td>
                    <td className="py-2 font-mono text-xs">TRAINING_BUDGET_EXCEPTION</td>
                    <td className="py-2">3</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>Performance</span>
              <ArrowRight className="h-4 w-4" />
              <span>Setup</span>
              <ArrowRight className="h-4 w-4" />
              <span>Approval Workflows</span>
              <ArrowRight className="h-4 w-4" />
              <span>Learning Requests</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Training requests automatically link to workflow_instances when cost ≥ threshold</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Approval status syncs bidirectionally between training_requests and workflow_instances</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Pending approvals appear in HR Hub Tasks dashboard with unified view</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Approvers can add comments that persist in workflow_step_actions audit trail</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Rejected requests can be resubmitted, creating a new workflow instance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>SLA metrics feed into HR Hub analytics for approval turnaround reporting</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Templates Configured</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          All 5 L&D workflow templates are seeded and active with industry-standard approval chains:
          TRAINING_REQUEST_APPROVAL (3 steps), CERTIFICATION_REQUEST_APPROVAL (2 steps), 
          EXTERNAL_TRAINING_VERIFICATION (1 step), RECERTIFICATION_REQUEST_APPROVAL (1 step), 
          and TRAINING_BUDGET_EXCEPTION (3 steps). Training requests meeting cost thresholds 
          will automatically route through the HR Hub workflow engine.
        </AlertDescription>
      </Alert>

      {/* L&D Notifications & Reminders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            L&D Notification Event Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The following industry-standard notification triggers are available for L&D workflows. 
            Configure reminder rules in <strong>Admin → Reminder Management</strong> to activate.
          </p>
          
          <div className="space-y-6">
            {/* Category A: Enrollment & Progress */}
            <div>
              <h4 className="font-semibold mb-2 text-emerald-700 dark:text-emerald-300">
                Enrollment & Progress (6 types)
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Code</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recommended Intervals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_ENROLLMENT_CONFIRMATION</TableCell>
                    <TableCell>enrolled_at</TableCell>
                    <TableCell>Immediate</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_COURSE_REMINDER</TableCell>
                    <TableCell>due_date</TableCell>
                    <TableCell>7, 3, 1 days before</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_ENROLLMENT_EXPIRING</TableCell>
                    <TableCell>due_date</TableCell>
                    <TableCell>3, 1 days before</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_OVERDUE_TRAINING</TableCell>
                    <TableCell>due_date</TableCell>
                    <TableCell>1, 3, 7 days after</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_PROGRESS_STALLED</TableCell>
                    <TableCell>updated_at</TableCell>
                    <TableCell>7, 14 days inactive</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_COURSE_COMPLETED</TableCell>
                    <TableCell>completed_at</TableCell>
                    <TableCell>Immediate</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Category B: Assessment & Certification */}
            <div>
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">
                Assessment & Certification (5 types)
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Code</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recommended Intervals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_QUIZ_DEADLINE</TableCell>
                    <TableCell>quiz created_at</TableCell>
                    <TableCell>24h, 4h before</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_QUIZ_FAILED</TableCell>
                    <TableCell>submitted_at</TableCell>
                    <TableCell>Immediate</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_CERTIFICATE_ISSUED</TableCell>
                    <TableCell>issued_at</TableCell>
                    <TableCell>Immediate</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_CERTIFICATE_EXPIRING</TableCell>
                    <TableCell>expires_at</TableCell>
                    <TableCell>90, 60, 30, 14 days before</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">LMS_RECERTIFICATION_DUE</TableCell>
                    <TableCell>expires_at</TableCell>
                    <TableCell>60, 30 days before</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Category C: Training Requests */}
            <div>
              <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                Training Requests & Approvals (5 types)
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Code</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recipients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_REQUEST_SUBMITTED</TableCell>
                    <TableCell>created_at</TableCell>
                    <TableCell>Employee</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_REQUEST_APPROVED</TableCell>
                    <TableCell>approved_at</TableCell>
                    <TableCell>Employee</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_REQUEST_REJECTED</TableCell>
                    <TableCell>updated_at</TableCell>
                    <TableCell>Employee</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_REQUEST_PENDING</TableCell>
                    <TableCell>created_at</TableCell>
                    <TableCell>Manager / Approvers</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_BUDGET_ALERT</TableCell>
                    <TableCell>budget threshold</TableCell>
                    <TableCell>HR / Finance</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Category D: ILT/Vendor Sessions */}
            <div>
              <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-300">
                ILT & Vendor Sessions (4 types)
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Code</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recommended Intervals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">VENDOR_SESSION_REMINDER</TableCell>
                    <TableCell>start_date</TableCell>
                    <TableCell>7, 1 days before</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">VENDOR_SESSION_REG_DEADLINE</TableCell>
                    <TableCell>registration_deadline</TableCell>
                    <TableCell>3, 1 days before</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">VENDOR_SESSION_CONFIRMED</TableCell>
                    <TableCell>enrolled_at</TableCell>
                    <TableCell>Immediate</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">VENDOR_SESSION_CANCELLED</TableCell>
                    <TableCell>status change</TableCell>
                    <TableCell>Immediate</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Category E: External Training */}
            <div>
              <h4 className="font-semibold mb-2 text-teal-700 dark:text-teal-300">
                External Training & Verification (3 types)
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Code</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recipients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">EXTERNAL_TRAINING_SUBMITTED</TableCell>
                    <TableCell>created_at</TableCell>
                    <TableCell>Employee, HR</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">EXTERNAL_TRAINING_VERIFIED</TableCell>
                    <TableCell>status change</TableCell>
                    <TableCell>Employee</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">EXTERNAL_CERT_EXPIRING</TableCell>
                    <TableCell>certificate_expiry_date</TableCell>
                    <TableCell>Employee, Manager</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Category F: Evaluation */}
            <div>
              <h4 className="font-semibold mb-2 text-rose-700 dark:text-rose-300">
                Post-Training Evaluation (2 types)
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Code</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Recommended Intervals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_EVALUATION_DUE</TableCell>
                    <TableCell>training completed</TableCell>
                    <TableCell>3, 1 days after</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">TRAINING_EVALUATION_REMINDER</TableCell>
                    <TableCell>incomplete evaluation</TableCell>
                    <TableCell>7, 14 days after</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">25 L&D Notification Types Configured</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          All L&D notification event types are seeded and ready for rule configuration. Navigate to 
          Admin → Reminder Management to create company-specific rules with custom intervals, 
          recipients, and message templates using placeholders like <code className="bg-muted px-1 rounded">{'{course_name}'}</code>, 
          <code className="bg-muted px-1 rounded">{'{due_date}'}</code>, and <code className="bg-muted px-1 rounded">{'{certificate_expiry}'}</code>.
        </AlertDescription>
      </Alert>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">Cross-Reference: HR Hub Manual</h4>
          <p className="text-sm text-muted-foreground">
            For complete documentation on the unified workflow engine, SLA configuration, 
            and escalation policies, see the <strong>HR Hub Administrator Manual</strong>, 
            Chapter 5: Workflow Engine.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

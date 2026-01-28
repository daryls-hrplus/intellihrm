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
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Learning Requests</td>
                    <td className="py-2">Individual, Team, Department</td>
                    <td className="py-2 font-mono text-xs">TRAINING_REQUEST_APPROVAL</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Learning Budgets</td>
                    <td className="py-2">Department, Company</td>
                    <td className="py-2 font-mono text-xs">TRAINING_BUDGET_APPROVAL</td>
                  </tr>
                  <tr>
                    <td className="py-2">External Training</td>
                    <td className="py-2">Individual</td>
                    <td className="py-2 font-mono text-xs">EXTERNAL_TRAINING_APPROVAL</td>
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

      <Alert variant="destructive" className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Current Implementation Note</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          The TRAINING_REQUEST_APPROVAL template exists in the database but currently has 0 steps 
          configured. Until steps are added via the TalentApprovalWorkflowManager, training requests 
          will continue to use the standalone <code className="bg-muted px-1 rounded">training_request_approvals</code> table. 
          Configure the template to enable full HR Hub integration.
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

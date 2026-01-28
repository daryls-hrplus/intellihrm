import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Database, GitBranch, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndTrainingRequests() {
  return (
    <section className="space-y-6" id="sec-3-7" data-manual-anchor="sec-3-7">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6 text-emerald-600" />
          3.7 Training Request Workflow
        </h2>
        <p className="text-muted-foreground">
          Configure and manage the external training request lifecycle from submission through completion.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Understand the training request data model</li>
            <li>Configure approval chain workflows</li>
            <li>Track request status transitions</li>
            <li>Manage source-based request types</li>
            <li>Link requests to vendor sessions</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_requests (Key Fields)
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
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Primary key</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">request_number</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Auto-generated request ID (e.g., "TR-2026-001")</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">request_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>external | internal | conference | certification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Employee requesting training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Requested course/program name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">provider_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>External vendor name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_session_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to specific vendor session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">start_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Requested training start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">end_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Requested training end date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">estimated_cost</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Total estimated cost</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Cost currency (default: USD)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">business_justification</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Business reason for training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>pending | approved | rejected | completed | cancelled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>manual | gap_analysis | appraisal | recertification</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">source_reference_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to source record (appraisal, gap analysis)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">current_approval_level</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Current step in approval chain (default: 1)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">max_approval_levels</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Total approval steps required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">approval_chain</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Approval history with timestamps</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Request Workflow Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
TRAINING REQUEST LIFECYCLE
══════════════════════════

Employee Submits Request
         │
         ▼
┌─────────────────────┐
│   Status: PENDING   │
│   Level: 1          │
│   Awaiting: Manager │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌──────────┐
│ Manager │  │  Manager │
│ APPROVES│  │ REJECTS  │
└────┬────┘  └────┬─────┘
     │            │
     │            ▼
     │       ┌──────────┐
     │       │ REJECTED │────▶ Notify Employee
     │       └──────────┘      (End)
     │
     ▼
┌─────────────────────┐
│   Check: Cost > $X? │
│   (Threshold Check) │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│ No      │  │ Yes          │
│ Skip HR │  │ HR Required  │
└────┬────┘  └──────┬───────┘
     │              │
     │              ▼
     │       ┌─────────────────────┐
     │       │   Status: PENDING   │
     │       │   Level: 2          │
     │       │   Awaiting: HR      │
     │       └──────────┬──────────┘
     │                  │
     │            ┌─────┴─────┐
     │            │           │
     │            ▼           ▼
     │       ┌─────────┐  ┌──────────┐
     │       │   HR    │  │   HR     │
     │       │ APPROVES│  │ REJECTS  │
     │       └────┬────┘  └────┬─────┘
     │            │            │
     │            │            ▼
     │            │       ┌──────────┐
     │            │       │ REJECTED │
     │            │       └──────────┘
     │            │
     └────────────┴───────────┐
                              │
                              ▼
                  ┌───────────────────┐
                  │  Status: APPROVED │
                  │  Budget Deducted  │
                  │  Vendor Notified  │
                  └─────────┬─────────┘
                            │
                            │ Training Completed
                            ▼
                  ┌───────────────────┐
                  │ Status: COMPLETED │
                  │ Record Created    │
                  │ Certificate Added │
                  └───────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Source Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Trigger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Badge variant="outline">manual</Badge>
                </TableCell>
                <TableCell>Employee self-initiated request</TableCell>
                <TableCell>ESS → Request Training button</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-blue-100 text-blue-800">gap_analysis</Badge>
                </TableCell>
                <TableCell>Generated from competency gap</TableCell>
                <TableCell>Training needs analysis identifies gap</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-purple-100 text-purple-800">appraisal</Badge>
                </TableCell>
                <TableCell>Linked to performance appraisal action</TableCell>
                <TableCell>Appraisal integration rule triggers</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-800">recertification</Badge>
                </TableCell>
                <TableCell>Auto-generated for expiring credentials</TableCell>
                <TableCell>Certificate approaching expiry</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval Chain Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cost Threshold</TableHead>
                <TableHead>Approval Levels</TableHead>
                <TableHead>Approvers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>$0 - $1,000</TableCell>
                <TableCell>1</TableCell>
                <TableCell>Direct Manager only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>$1,001 - $5,000</TableCell>
                <TableCell>2</TableCell>
                <TableCell>Manager → HR/L&D Staff</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>$5,001 - $10,000</TableCell>
                <TableCell>3</TableCell>
                <TableCell>Manager → HR → Department Head</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>&gt; $10,000</TableCell>
                <TableCell>4</TableCell>
                <TableCell>Manager → HR → Dept Head → Executive</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Note:</strong> Thresholds and approval chains are configurable per company 
            in the Workflow Configuration settings.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Request Status Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>Next Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">pending</Badge></TableCell>
                <TableCell>Awaiting approval at current level</TableCell>
                <TableCell>Approver reviews, approves/rejects</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">approved</Badge></TableCell>
                <TableCell>All approvals complete, training authorized</TableCell>
                <TableCell>Employee attends, L&D tracks</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-red-100 text-red-800">rejected</Badge></TableCell>
                <TableCell>Request denied by approver</TableCell>
                <TableCell>Employee notified, can resubmit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">completed</Badge></TableCell>
                <TableCell>Training attended, record created</TableCell>
                <TableCell>Feedback collected, budget reconciled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="secondary">cancelled</Badge></TableCell>
                <TableCell>Request withdrawn or session cancelled</TableCell>
                <TableCell>Budget released, reason documented</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertTitle>Workflow Integration</AlertTitle>
        <AlertDescription>
          Training requests integrate with the platform's workflow engine. Approvers receive 
          notifications via email and in-app alerts. Escalation rules can be configured for 
          requests pending more than 72 hours. All approval actions are logged for audit trail.
        </AlertDescription>
      </Alert>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Bell, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowRequestSelfService() {
  return (
    <section className="space-y-6" id="sec-4-5" data-manual-anchor="sec-4-5">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.5 Self-Service Requests</h2>
        <p className="text-muted-foreground">Employee-initiated training requests with approval workflows.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enable employees to browse and request external training</li>
            <li>Configure manager and HR approval chains</li>
            <li>Track budget impact before approval</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Self-Service Flow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Employee (ESS Portal)
         │
         ▼
┌─────────────────┐
│ Browse Catalog  │ Internal + Agency courses
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Submit Request  │ Justification required
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Manager Review  │────▶│   HR Review     │ (if cost > threshold)
│   (Level 1)     │     │   (Level 2)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
              [Approved/Rejected]
          `}</pre>
        </CardContent>
      </Card>
      {/* Workflow Template Reference */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Workflow Template Available</AlertTitle>
        <AlertDescription>
          The <code className="bg-muted px-1 rounded">TRAINING_REQUEST_APPROVAL</code> workflow template 
          is pre-configured with 3 approval steps: Manager → HR → Finance (conditional on cost threshold). 
          Enable in <strong>Performance → Setup → Approval Workflows</strong>.
        </AlertDescription>
      </Alert>

      {/* Notification Integration */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Request Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support the training request lifecycle:
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Event Code</TableHead>
                  <TableHead className="font-medium">Trigger</TableHead>
                  <TableHead className="font-medium">Recipients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">TRAINING_REQUEST_SUBMITTED</code></TableCell>
                  <TableCell className="text-sm">Request created by employee</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Employee (confirmation)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">TRAINING_REQUEST_APPROVED</code></TableCell>
                  <TableCell className="text-sm">Request approved at all levels</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Employee</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">TRAINING_REQUEST_REJECTED</code></TableCell>
                  <TableCell className="text-sm">Request rejected with reason</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Employee</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">TRAINING_REQUEST_PENDING</code></TableCell>
                  <TableCell className="text-sm">Request awaiting approval</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Approvers (reminder)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Configure reminder rules in <strong>Admin → Reminder Management</strong>. 
            See Section 4.13 for complete event type reference.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

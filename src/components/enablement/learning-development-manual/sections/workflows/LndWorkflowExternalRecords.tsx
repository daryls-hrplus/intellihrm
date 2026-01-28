import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Bell, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowExternalRecords() {
  return (
    <section className="space-y-6" id="sec-4-14" data-manual-anchor="sec-4-14">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.14 External Records</h2>
        <p className="text-muted-foreground">Record and track training completed outside the LMS.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Allow HR to enter external training completions</li>
            <li>Enable employee self-reporting with evidence upload</li>
            <li>Validate external certifications against accrediting bodies</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5" />External Record Entry</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
External Training Record Fields:
┌─────────────────────────────────────────────────────────────┐
│ provider_name       │ Organization that delivered training  │
│ course_title        │ Name of the training/certification    │
│ completion_date     │ When training was completed           │
│ duration_hours      │ Total learning hours                  │
│ certificate_number  │ External credential ID                │
│ certificate_url     │ Verification URL                      │
│ certificate_file    │ Uploaded PDF/image                    │
│ competencies_gained │ Linked competencies                   │
│ cost                │ Training cost (for reporting)         │
│ expiry_date         │ Certification expiration              │
└─────────────────────────────────────────────────────────────┘

Entry Methods:
├── HR Admin: Direct entry with verification
├── Employee (ESS): Self-report with evidence upload
└── Manager (MSS): Enter on behalf of team member
          `}</pre>
        </CardContent>
      </Card>
      {/* Workflow Template Reference */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Verification Workflow Available</AlertTitle>
        <AlertDescription>
          The <code className="bg-muted px-1 rounded">EXTERNAL_TRAINING_VERIFICATION</code> workflow template 
          provides single-step HR verification for external training records. 
          Enable in <strong>Performance → Setup → Approval Workflows</strong>.
        </AlertDescription>
      </Alert>

      {/* Notification Integration */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            External Record Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support external training record workflows:
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Event Code</TableHead>
                  <TableHead className="font-medium">Trigger</TableHead>
                  <TableHead className="font-medium">Recommended Intervals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">EXTERNAL_TRAINING_SUBMITTED</code></TableCell>
                  <TableCell className="text-sm">External record submitted for review</TableCell>
                  <TableCell className="text-sm text-muted-foreground">0 days (immediate)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">EXTERNAL_TRAINING_VERIFIED</code></TableCell>
                  <TableCell className="text-sm">HR verification completed</TableCell>
                  <TableCell className="text-sm text-muted-foreground">0 days (immediate)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">EXTERNAL_CERT_EXPIRING</code></TableCell>
                  <TableCell className="text-sm">External certificate approaching expiry</TableCell>
                  <TableCell className="text-sm text-muted-foreground">90, 60, 30, 14 days before</TableCell>
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

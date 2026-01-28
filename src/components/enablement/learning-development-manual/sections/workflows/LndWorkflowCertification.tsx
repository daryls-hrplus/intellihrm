import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Bell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowCertification() {
  return (
    <section className="space-y-6" id="sec-4-12" data-manual-anchor="sec-4-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.12 Certification</h2>
        <p className="text-muted-foreground">Generate and manage course completion certificates.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure certificate templates per course</li>
            <li>Auto-generate certificates on course completion</li>
            <li>Track certificate expiry and recertification</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificate Generation</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Course Completed
       │
       ▼
┌──────────────────┐
│ Certificate      │ Check if course has
│ Required?        │ certificate_template set
└────────┬─────────┘
         │ Yes
         ▼
┌──────────────────┐
│ Generate PDF     │ Merge template with:
│                  │ - Employee name
│                  │ - Course title
│                  │ - Completion date
│                  │ - Certificate number
│                  │ - Expiry date
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Store in         │ lms_certificates table
│ lms_certificates │ Link to storage bucket
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Email to Learner │ With PDF attachment
└──────────────────┘
          `}</pre>
        </CardContent>
      </Card>
      {/* Notification Integration */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types are seeded and available for certification workflows:
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
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_CERTIFICATE_ISSUED</code></TableCell>
                  <TableCell className="text-sm">Certificate generated on course completion</TableCell>
                  <TableCell className="text-sm text-muted-foreground">0 days (immediate)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_CERTIFICATE_EXPIRING</code></TableCell>
                  <TableCell className="text-sm">Certificate approaching expiration date</TableCell>
                  <TableCell className="text-sm text-muted-foreground">90, 60, 30, 14 days before</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_RECERTIFICATION_DUE</code></TableCell>
                  <TableCell className="text-sm">Recertification action required</TableCell>
                  <TableCell className="text-sm text-muted-foreground">30, 14, 7 days before</TableCell>
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

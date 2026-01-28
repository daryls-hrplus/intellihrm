import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Bell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowEnrollment() {
  return (
    <section className="space-y-6" id="sec-4-2" data-manual-anchor="sec-4-2">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.2 Enrollment Management</h2>
        <p className="text-muted-foreground">Self-enrollment, manager assignment, and bulk enrollment workflows.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure self-enrollment permissions by course</li>
            <li>Process manager-initiated enrollments</li>
            <li>Execute bulk enrollments for compliance training</li>
            <li>Manage enrollment capacity and waitlists</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Enrollment Sources</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────┐
│                   ENROLLMENT SOURCES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Self-Service │  │   Manager    │  │     HR       │       │
│  │  (Employee)  │  │ Assignment   │  │    Bulk      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│                           ▼                                 │
│              ┌────────────────────────┐                     │
│              │    lms_enrollments     │                     │
│              │ status: enrolled       │                     │
│              │ source_type: employee/ │                     │
│              │   manager/compliance   │                     │
│              └────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
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
            The following notification event types are seeded and available for enrollment workflows:
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
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_ENROLLMENT_CONFIRMATION</code></TableCell>
                  <TableCell className="text-sm">Employee enrolled in course</TableCell>
                  <TableCell className="text-sm text-muted-foreground">0 days (immediate)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_COURSE_REMINDER</code></TableCell>
                  <TableCell className="text-sm">Course due date approaching</TableCell>
                  <TableCell className="text-sm text-muted-foreground">14, 7, 3, 1 days before</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_ENROLLMENT_EXPIRING</code></TableCell>
                  <TableCell className="text-sm">Enrollment access ending</TableCell>
                  <TableCell className="text-sm text-muted-foreground">7, 3, 1 days before</TableCell>
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

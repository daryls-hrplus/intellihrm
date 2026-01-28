import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Bell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowVirtualClassroom() {
  return (
    <section className="space-y-6" id="sec-4-17" data-manual-anchor="sec-4-17">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.17 Virtual Classroom Operations</h2>
        <p className="text-muted-foreground">Manage virtual instructor-led training sessions.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Integrate with video conferencing platforms</li>
            <li>Track virtual attendance and engagement</li>
            <li>Manage recordings and post-session access</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" />Virtual Classroom Features</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Supported Platforms:
├── Microsoft Teams
├── Zoom
├── Google Meet
└── WebEx

Virtual Session Data (lms_virtual_classrooms):
├── platform: teams | zoom | meet | webex
├── meeting_url: Auto-generated or manual entry
├── meeting_id: Platform meeting identifier
├── passcode: Session access code
├── recording_url: Post-session recording
└── scheduled_at: Session date/time

Attendance Tracking (lms_virtual_attendance):
├── join_time: When participant joined
├── leave_time: When participant left
├── total_duration: Time in session
├── engagement_score: Based on participation
└── attended: Boolean (met minimum time)
          `}</pre>
        </CardContent>
      </Card>
      {/* Notification Integration */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Session Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support virtual classroom operations:
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Event Code</TableHead>
                  <TableHead className="font-medium">Trigger</TableHead>
                  <TableHead className="font-medium">Placeholders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_REMINDER</code></TableCell>
                  <TableCell className="text-sm">Upcoming session reminder</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{session_date}'}, {'{session_location}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_REG_DEADLINE</code></TableCell>
                  <TableCell className="text-sm">Registration deadline approaching</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{course_name}'}, {'{due_date}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_CONFIRMED</code></TableCell>
                  <TableCell className="text-sm">Registration confirmed</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{session_date}'}, {'{session_location}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_CANCELLED</code></TableCell>
                  <TableCell className="text-sm">Session cancelled</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{course_name}'}</TableCell>
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

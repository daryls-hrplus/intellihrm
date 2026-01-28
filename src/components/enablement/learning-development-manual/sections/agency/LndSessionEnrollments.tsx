import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Database, Clock, ListOrdered, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndSessionEnrollments() {
  return (
    <section className="space-y-6" id="sec-3-14" data-manual-anchor="sec-3-14">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          3.14 Session Enrollments & Waitlists
        </h2>
        <p className="text-muted-foreground">
          Track employee enrollments in vendor training sessions, manage waitlists,
          and record attendance. Provides visibility into session capacity utilization.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enroll employees in vendor sessions</li>
            <li>Manage session waitlists and auto-promotion</li>
            <li>Track attendance and no-shows</li>
            <li>Configure session capacity rules</li>
            <li>Generate enrollment reports</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: vendor_session_enrollments
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
                <TableCell className="font-mono text-sm">session_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>FK to training_vendor_sessions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>FK to profiles</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_request_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>FK to training_requests (if from request)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>registered | waitlisted | confirmed | attended | no_show | cancelled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registered_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>When enrollment was created</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">confirmed_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>When attendance was confirmed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">attended</TableCell>
                <TableCell>Boolean</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Whether employee attended</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">attendance_notes</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Notes about attendance (partial, late, etc.)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: vendor_session_waitlist
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
                <TableCell className="font-mono text-sm">session_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>FK to training_vendor_sessions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>FK to profiles</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">training_request_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>FK to training_requests (if from request)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">position</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Position in waitlist (1, 2, 3...)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">added_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>When added to waitlist</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">promoted_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>When promoted to enrolled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">expired_at</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>When waitlist position expired</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>waiting | promoted | expired | cancelled</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Status Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Next States</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="outline">registered</Badge></TableCell>
                <TableCell>Initial enrollment, space available</TableCell>
                <TableCell>confirmed, cancelled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-yellow-100 text-yellow-800">waitlisted</Badge></TableCell>
                <TableCell>Session full, on waiting list</TableCell>
                <TableCell>registered (via promotion), cancelled, expired</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-blue-100 text-blue-800">confirmed</Badge></TableCell>
                <TableCell>Attendance confirmed by employee</TableCell>
                <TableCell>attended, no_show, cancelled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-100 text-green-800">attended</Badge></TableCell>
                <TableCell>Employee completed training</TableCell>
                <TableCell>Terminal state</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">no_show</Badge></TableCell>
                <TableCell>Employee did not attend</TableCell>
                <TableCell>Terminal state</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="secondary">cancelled</Badge></TableCell>
                <TableCell>Enrollment cancelled</TableCell>
                <TableCell>Terminal state</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Enrollment Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
SESSION ENROLLMENT WORKFLOW
═══════════════════════════

Training Request Approved
         │
         ▼
┌─────────────────────────┐
│ Check Session Capacity  │
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌─────────┐  ┌──────────────┐
│ Space   │  │ Session Full │
│ Available  │              │
└────┬────┘  └──────┬───────┘
     │              │
     ▼              ▼
┌─────────────┐  ┌───────────────┐
│ Status:     │  │ Status:       │
│ REGISTERED  │  │ WAITLISTED    │
└──────┬──────┘  │ Position: N   │
       │         └───────┬───────┘
       │                 │
       │    ┌────────────┘
       │    │ Cancellation opens spot
       │    ▼
       │   ┌───────────────┐
       │   │ Auto-Promote  │
       │   │ Next in Queue │
       │   └───────┬───────┘
       │           │
       └─────┬─────┘
             │
             ▼
┌─────────────────────────┐
│ Confirmation Required   │
│ (X days before session) │
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌─────────┐  ┌──────────┐
│CONFIRMED│  │ No Reply │
└────┬────┘  │ → CANCEL │
     │       └──────────┘
     │
     ▼
Session Date → ATTENDED or NO_SHOW
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="h-5 w-5" />
            Waitlist Promotion Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Configurable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>FIFO Order</TableCell>
                <TableCell>Promote based on waitlist position (first in, first out)</TableCell>
                <TableCell>Default</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Priority Override</TableCell>
                <TableCell>Compliance/mandatory training gets priority</TableCell>
                <TableCell>Yes - by request source_type</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Auto-Promotion</TableCell>
                <TableCell>Automatic promotion when spot opens</TableCell>
                <TableCell>Yes - enable/disable</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Acceptance Window</TableCell>
                <TableCell>Hours to accept promotion before next in queue</TableCell>
                <TableCell>Yes - default 24 hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Expiry Days</TableCell>
                <TableCell>Days on waitlist before auto-expiry</TableCell>
                <TableCell>Yes - default 30 days</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Attendance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
ATTENDANCE RECORDING PROCESS
════════════════════════════

Session Day:
┌──────────────────────────────────────────────────┐
│ Instructor/Admin marks attendance:               │
│                                                  │
│ ☑ John Smith      - Attended (full)              │
│ ☑ Jane Doe        - Attended (partial - left 2pm)│
│ ☐ Bob Johnson     - No Show                      │
│ ☑ Alice Williams  - Attended (late arrival)      │
└──────────────────────────────────────────────────┘

System Actions:
├── ATTENDED → Create external_training_record
├── ATTENDED → Update employee competencies (if mapped)
├── ATTENDED → Trigger evaluation request
├── NO_SHOW → Flag for manager notification
├── NO_SHOW → Update no-show counter for employee
└── NO_SHOW → Release budget commitment
          `}</pre>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No-Show Policy</AlertTitle>
        <AlertDescription>
          Employees with 2+ no-shows in a 12-month period may be subject to training 
          access restrictions. Configure no-show thresholds and consequences in 
          Company Settings → Training Policies. No-show data is included in manager
          dashboards and training compliance reports.
        </AlertDescription>
      </Alert>
    </section>
  );
}

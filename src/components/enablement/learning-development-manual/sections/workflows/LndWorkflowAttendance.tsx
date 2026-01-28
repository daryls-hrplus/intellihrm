import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

export function LndWorkflowAttendance() {
  return (
    <section className="space-y-6" id="sec-4-34" data-manual-anchor="sec-4-34">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ClipboardCheck className="h-6 w-6 text-green-600" />
          4.34 Attendance Tracking
        </h2>
        <p className="text-muted-foreground">
          Mark and validate attendance for instructor-led training sessions 
          with check-in/check-out tracking and no-show management.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Mark participant attendance for ILT sessions</li>
            <li>Track check-in and check-out times</li>
            <li>Configure minimum attendance requirements</li>
            <li>Process no-shows and partial attendance</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attendance Marking Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ATTENDANCE TRACKING WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Session Start                                                                  │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                    ATTENDANCE MARKING OPTIONS                            │   │
│   ├─────────────────────────────────────────────────────────────────────────┤   │
│   │                                                                          │   │
│   │   Option 1: Self Check-In (Virtual Sessions)                             │   │
│   │   ├── Participant clicks "Join Session"                                  │   │
│   │   ├── System records check_in_time                                       │   │
│   │   └── Auto check-out when leaving or session ends                        │   │
│   │                                                                          │   │
│   │   Option 2: Instructor Attendance Sheet (ILT)                            │   │
│   │   ├── Instructor opens attendance roster                                 │   │
│   │   ├── Marks each participant: Present / Absent / Late                    │   │
│   │   └── Can add notes for partial attendance                               │   │
│   │                                                                          │   │
│   │   Option 3: QR Code Check-In (Physical Sessions)                         │   │
│   │   ├── QR code displayed at venue                                         │   │
│   │   ├── Participants scan with mobile device                               │   │
│   │   └── Location/time validated automatically                              │   │
│   │                                                                          │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Attendance      │                                                            │
│   │ Validation      │                                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│    ┌───────┴───────────────┬───────────────────┐                                │
│    ▼                       ▼                   ▼                                │
│ [Full Attendance]    [Partial]           [No Show]                              │
│    │                       │                   │                                │
│    ▼                       ▼                   ▼                                │
│ ┌─────────────┐    ┌─────────────┐     ┌─────────────┐                          │
│ │ ATTENDED    │    │ Check min   │     │ ABSENT      │                          │
│ │ Complete    │    │ requirement │     │ Flag manager│                          │
│ │ credit      │    └──────┬──────┘     │ No credit   │                          │
│ └─────────────┘           │            └─────────────┘                          │
│                    ┌──────┴──────┐                                              │
│                    ▼             ▼                                              │
│               [Met Min]     [Below Min]                                         │
│                    │             │                                              │
│                    ▼             ▼                                              │
│               ATTENDED       INCOMPLETE                                         │
│               (partial)      (no credit)                                        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attendance Status Reference</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Credit Awarded</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-green-600">Attended</TableCell>
                <TableCell><UserCheck className="h-5 w-5 text-green-600" /></TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Yes</Badge></TableCell>
                <TableCell>Full session attendance, completion credit awarded</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-amber-600">Partial</TableCell>
                <TableCell><Clock className="h-5 w-5 text-amber-600" /></TableCell>
                <TableCell><Badge className="bg-amber-100 text-amber-800">Conditional</Badge></TableCell>
                <TableCell>Met minimum time requirement (e.g., 80%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-orange-600">Late</TableCell>
                <TableCell><Clock className="h-5 w-5 text-orange-600" /></TableCell>
                <TableCell><Badge className="bg-amber-100 text-amber-800">Conditional</Badge></TableCell>
                <TableCell>Arrived late but met minimum requirement</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-red-600">No Show</TableCell>
                <TableCell><UserX className="h-5 w-5 text-red-600" /></TableCell>
                <TableCell><Badge className="bg-red-100 text-red-800">No</Badge></TableCell>
                <TableCell>Did not attend, manager notified</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-gray-600">Excused</TableCell>
                <TableCell><UserX className="h-5 w-5 text-gray-400" /></TableCell>
                <TableCell><Badge variant="outline">Reschedule</Badge></TableCell>
                <TableCell>Valid reason provided, rescheduled</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Minimum Attendance Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>LMS Admin</span>
              <ArrowRight className="h-4 w-4" />
              <span>Course Settings</span>
              <ArrowRight className="h-4 w-4" />
              <span>Attendance Requirements</span>
            </div>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Attendance Requirement Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option 1: Percentage-Based
├── minimum_attendance_percent: 80
├── Session duration: 4 hours
├── Minimum required: 3.2 hours
└── Example: Arrived 30 min late, left on time = 3.5 hours = PASS

Option 2: Fixed Duration
├── minimum_attendance_minutes: 180
├── Session duration: 4 hours (240 min)
├── Minimum required: 3 hours exactly
└── Useful for compliance training

Option 3: Full Attendance Required
├── minimum_attendance_percent: 100
├── No partial credit
├── Common for safety certifications
└── Late arrival = No credit

Grace Periods:
├── late_arrival_grace_minutes: 10  (not counted as late)
├── early_departure_grace_minutes: 5 (not counted as early)
└── Grace periods are configurable per company
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            No-Show Processing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Automatic Actions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Manager notification email</li>
                <li>• Flag on employee training record</li>
                <li>• Cost center charged (if vendor session)</li>
                <li>• Compliance gap created (if mandatory)</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Follow-Up Options</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Auto-enroll in next available session</li>
                <li>• Require manager approval for re-enrollment</li>
                <li>• Waiting period before re-registration</li>
                <li>• Excused absence with documentation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Virtual Session Tracking</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Virtual Attendance Data (lms_virtual_attendance):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For virtual/webinar sessions, additional metrics are tracked:

┌────────────────────────────────────────────────────────────────┐
│  Participant: John Doe                                          │
│  Session: "Compliance Training Q1"                              │
│                                                                 │
│  Attendance Timeline:                                           │
│  ├── Session Start: 09:00                                       │
│  ├── Joined: 09:03 (+3 min)                                     │
│  ├── Left temporarily: 10:15 - 10:22 (7 min break)              │
│  ├── Left session: 11:55                                        │
│  └── Session End: 12:00                                         │
│                                                                 │
│  Metrics:                                                       │
│  ├── Total time in session: 2h 45min                            │
│  ├── Session duration: 3h                                       │
│  ├── Attendance percentage: 91.7%                               │
│  ├── Engagement score: 78% (based on polls, chat, attention)    │
│  └── Status: ATTENDED ✓                                         │
└────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Attendance can only be marked during session window (start to end + grace)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Instructors can override attendance up to 24 hours after session</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>LMS Admin can override any attendance record with audit trail</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Excused absences require documentation upload and manager approval</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>No-show pattern (3+ in 90 days) triggers learning intervention</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Integration Note</AlertTitle>
        <AlertDescription>
          Attendance data feeds into training analytics dashboards and can be 
          used in competency assessments. For virtual sessions integrated with 
          Teams/Zoom, attendance data may sync automatically via platform APIs.
        </AlertDescription>
      </Alert>
    </section>
  );
}

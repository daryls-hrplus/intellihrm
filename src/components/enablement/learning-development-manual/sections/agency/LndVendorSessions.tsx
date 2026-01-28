import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Database, Settings, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndVendorSessions() {
  return (
    <section className="space-y-6" id="sec-3-5" data-manual-anchor="sec-3-5">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-emerald-600" />
          3.5 Session Scheduling & Capacity
        </h2>
        <p className="text-muted-foreground">
          Schedule vendor course sessions with capacity management, waitlists, and registration deadlines.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create vendor course sessions with date/time configuration</li>
            <li>Configure capacity limits and waitlist management</li>
            <li>Set registration and cancellation deadlines</li>
            <li>Manage session lifecycle status transitions</li>
            <li>Integrate sessions with training calendar</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Field Reference: training_vendor_sessions
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
                <TableCell>Primary key, auto-generated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_course_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Reference to training_vendor_courses</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">start_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Session start date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">end_date</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Session end date (for multi-day)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">start_time</TableCell>
                <TableCell>Time</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Daily start time (e.g., 09:00)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">end_time</TableCell>
                <TableCell>Time</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Daily end time (e.g., 17:00)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">timezone</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>IANA timezone (default: UTC)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">location</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Physical address or venue name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">location_type</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>in_person | virtual | hybrid</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">meeting_url</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Virtual meeting link (for virtual/hybrid)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">capacity</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Maximum attendees</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registered_count</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Current registered attendees (default: 0)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">waitlist_count</TableCell>
                <TableCell>Integer</TableCell>
                <TableCell><Badge variant="destructive">Auto</Badge></TableCell>
                <TableCell>Current waitlist count (default: 0)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registration_deadline</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Last date to register</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cancellation_deadline</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Last date to cancel without penalty</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cost_per_person</TableCell>
                <TableCell>Numeric</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Per-attendee cost for this session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">currency</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Cost currency (default: USD)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>scheduled | confirmed | in_progress | completed | cancelled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">instructor_name</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Session instructor/facilitator</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">notes</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Session-specific notes</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
SESSION STATUS LIFECYCLE
════════════════════════

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  SCHEDULED  │────▶│  CONFIRMED  │────▶│ IN_PROGRESS │────▶│  COMPLETED  │
│             │     │             │     │             │     │             │
│ Tentative   │     │ Min. seats  │     │ Training    │     │ Feedback    │
│ dates set   │     │ confirmed   │     │ underway    │     │ collected   │
└──────┬──────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │
       │ Insufficient
       │ registrations
       ▼
┌─────────────┐
│  CANCELLED  │
│             │
│ Registrants │
│ notified    │
└─────────────┘

TRANSITION TRIGGERS:
├── SCHEDULED → CONFIRMED: Minimum registrations met, vendor confirms
├── SCHEDULED → CANCELLED: Below minimum, deadline passed
├── CONFIRMED → IN_PROGRESS: Start date reached
├── CONFIRMED → CANCELLED: Vendor cancellation, force majeure
├── IN_PROGRESS → COMPLETED: End date reached, attendance recorded
└── Any → CANCELLED: Administrative cancellation (refunds processed)
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacity Management Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scenario</TableHead>
                <TableHead>System Behavior</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Registration within capacity</TableCell>
                <TableCell>
                  registered_count incremented, training request linked to session
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Capacity reached</TableCell>
                <TableCell>
                  New registrations added to waitlist, waitlist_count incremented
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cancellation received</TableCell>
                <TableCell>
                  registered_count decremented, first waitlist entry auto-promoted
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Waitlist promotion</TableCell>
                <TableCell>
                  Waitlisted employee notified, 48-hour confirmation window
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">No capacity set</TableCell>
                <TableCell>
                  Unlimited registrations allowed (suitable for virtual sessions)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Step-by-Step: Creating a Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge className="shrink-0">1</Badge>
              <div>
                <p className="font-medium">Navigate to Vendor Course</p>
                <p className="text-sm text-muted-foreground">Training → Vendors → [Vendor] → Courses → [Course] → Sessions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">2</Badge>
              <div>
                <p className="font-medium">Click "Schedule Session"</p>
                <p className="text-sm text-muted-foreground">Opens the session scheduling form</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">3</Badge>
              <div>
                <p className="font-medium">Set Date & Time</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Start Date: First day of training</li>
                  <li>End Date: Last day (for multi-day sessions)</li>
                  <li>Start/End Time: Daily schedule</li>
                  <li>Timezone: Participant timezone</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">4</Badge>
              <div>
                <p className="font-medium">Configure Location</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Location Type: In-Person / Virtual / Hybrid</li>
                  <li>Location: Physical address or venue</li>
                  <li>Meeting URL: Virtual meeting link</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">5</Badge>
              <div>
                <p className="font-medium">Set Capacity & Deadlines</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Capacity: Maximum attendees</li>
                  <li>Registration Deadline: Typically 7-14 days before start</li>
                  <li>Cancellation Deadline: Typically 3-5 days before start</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">6</Badge>
              <div>
                <p className="font-medium">Add Cost & Instructor</p>
                <ul className="text-sm text-muted-foreground list-disc pl-4">
                  <li>Cost Per Person: Session-specific pricing</li>
                  <li>Currency: Cost currency</li>
                  <li>Instructor: Assigned trainer name</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="shrink-0">7</Badge>
              <div>
                <p className="font-medium">Save Session</p>
                <p className="text-sm text-muted-foreground">Session created with status "scheduled"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
TRAINING CALENDAR VIEW
══════════════════════

March 2026
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Sun  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│      │      │      │      │      │      │   1  │
│   2  │   3  │   4  │   5  │   6  │   7  │   8  │
│   9  │  10  │  11  │  12  │  13  │  14  │  15  │
│      │      │      │      │      │ ████ │ ████ │
│  16  │  17  │  18  │  19  │  20  │  21  │  22  │
│ ████ │ ████ │ ████ │      │      │      │      │
│  23  │  24  │  25  │  26  │  27  │  28  │  29  │
│      │      │      │      │      │      │      │
│  30  │  31  │      │      │      │      │      │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘

████ = PMP Prep Course (Mar 14-18)
       Vendor: PMI Training Partner
       Location: Virtual (Zoom)
       Capacity: 20/25 (5 available)
       Status: CONFIRMED
          `}</pre>
        </CardContent>
      </Card>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertTitle>Deadline Best Practices</AlertTitle>
        <AlertDescription>
          Set registration deadlines 7-14 days before session start to allow vendor confirmation 
          and material preparation. Cancellation deadlines should be 3-5 days before start to 
          minimize vendor penalties. Communicate deadlines clearly in training request notifications.
        </AlertDescription>
      </Alert>
    </section>
  );
}

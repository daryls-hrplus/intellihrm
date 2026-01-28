import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LndAgencySessionDates() {
  return (
    <section className="space-y-6" id="sec-3-4" data-manual-anchor="sec-3-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">3.4 Course Dates & Sessions</h2>
        <p className="text-muted-foreground">
          Manage scheduled training sessions with dates, locations, and capacity tracking.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Learning Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage agency training session schedules</li>
            <li>Configure session capacity and location details</li>
            <li>Track registrations against available seats</li>
            <li>Handle session cancellations and rescheduling</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field Reference: training_agency_course_dates</CardTitle>
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
                <TableCell className="font-mono text-sm">agency_course_id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Parent course reference</TableCell>
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
                <TableCell>Session end date (multi-day)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">start_time</TableCell>
                <TableCell>Time</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Daily start time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">end_time</TableCell>
                <TableCell>Time</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Daily end time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">location</TableCell>
                <TableCell>Text</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Physical address or "Virtual"</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">meeting_url</TableCell>
                <TableCell>URL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Virtual session link</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">capacity</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Maximum participants</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registered_count</TableCell>
                <TableCell>Number</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>Current registrations (computed)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>Enum</TableCell>
                <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
                <TableCell>scheduled, confirmed, cancelled, completed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registration_deadline</TableCell>
                <TableCell>Date</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Last date to register</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Session Management Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   SCHEDULED  │────▶│  CONFIRMED   │────▶│  COMPLETED   │
│ (dates added)│     │(min reached) │     │ (post-date)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│  CANCELLED   │     │   WAITLIST   │
│(insufficient)│     │ (at capacity)│
└──────────────┘     └──────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Configuration Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 border rounded-lg">
            <Badge className="mb-2">In-Person</Badge>
            <p className="text-sm">Cisco Training Center, 170 West Tasman Drive, San Jose, CA 95134</p>
          </div>
          <div className="p-3 border rounded-lg">
            <Badge className="mb-2">Virtual</Badge>
            <p className="text-sm">WebEx Meeting (link provided upon registration)</p>
          </div>
          <div className="p-3 border rounded-lg">
            <Badge className="mb-2">Hybrid</Badge>
            <p className="text-sm">Day 1-2: Virtual | Day 3-5: Training Facility, Kingston, Jamaica</p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Users className="h-4 w-4" />
        <AlertTitle>Capacity Management</AlertTitle>
        <AlertDescription>
          When a session reaches capacity, employees can be added to a waitlist. 
          If registered participants cancel, waitlisted employees are automatically notified 
          in order of their waitlist position.
        </AlertDescription>
      </Alert>
    </section>
  );
}

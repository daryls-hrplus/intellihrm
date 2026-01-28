import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Building2, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Bell,
  Users,
  DollarSign
} from 'lucide-react';

export function LndWorkflowVendorSessions() {
  return (
    <section className="space-y-6" id="sec-4-33" data-manual-anchor="sec-4-33">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
          4.33 Vendor Session Management
        </h2>
        <p className="text-muted-foreground">
          Schedule and manage instructor-led training sessions delivered by external 
          vendors, including registration, capacity, and cost tracking.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure vendor training sessions with capacity limits</li>
            <li>Manage participant registration and confirmations</li>
            <li>Track per-participant costs and vendor payments</li>
            <li>Process session cancellations and rescheduling</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>training_vendor_sessions</Badge>
            <span className="text-sm font-normal text-muted-foreground">Field Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Field</TableHead>
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/12">Req</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="secondary">PK</Badge></TableCell>
                <TableCell>Unique session identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">vendor_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Reference to training_vendors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to vendor_course_catalog entry</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">session_title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Display name for the session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">session_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Date of session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">start_time</TableCell>
                <TableCell>TIME</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Session start time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">end_time</TableCell>
                <TableCell>TIME</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Session end time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">location</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Physical or virtual location</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">meeting_url</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Virtual meeting link</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">instructor_name</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Vendor instructor name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">max_capacity</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Maximum participants allowed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">min_capacity</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Minimum to run session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cost_per_participant</TableCell>
                <TableCell>DECIMAL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Price per attendee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registration_deadline</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Last date to register</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">status</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>scheduled | confirmed | cancelled | completed</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>vendor_session_enrollments</Badge>
            <span className="text-sm font-normal text-muted-foreground">Field Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Field</TableHead>
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/12">Req</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="secondary">PK</Badge></TableCell>
                <TableCell>Unique enrollment identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">session_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Reference to vendor session</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Registered participant</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registration_status</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>registered | confirmed | cancelled | attended | no_show</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">registered_by</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Who registered this participant</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">attendance_confirmed_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>When attendance was marked</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cost_charged</TableCell>
                <TableCell>DECIMAL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Actual cost for this participant</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cost_center_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Budget allocation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">cancellation_reason</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Reason for cancellation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Vendor Session Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        VENDOR SESSION LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Session Creation                                                               │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ SCHEDULED       │  Session announced, registration open                      │
│   │                 │  Notifications sent to target audience                     │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            │  (Registrations accumulate)                                         │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Registration Deadline Check                                             │   │
│   │                                                                          │   │
│   │  If registrations >= min_capacity:                                       │   │
│   │    ├── Status → CONFIRMED                                                │   │
│   │    ├── Send confirmations to all registered                              │   │
│   │    └── Lock in vendor booking                                            │   │
│   │                                                                          │   │
│   │  If registrations < min_capacity:                                        │   │
│   │    ├── Options: Extend deadline OR Cancel                                │   │
│   │    ├── Status → CANCELLED                                                │   │
│   │    └── Notify registered, offer alternatives                             │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ CONFIRMED       │  Session will proceed                                      │
│   │                 │  Final participant list sent to vendor                     │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            │  (Session date arrives)                                             │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Session         │  Mark attendance                                           │
│   │ Delivery        │  Track no-shows                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ COMPLETED       │  Update enrollment status                                  │
│   │                 │  Issue certificates, trigger evaluations                   │
│   │                 │  Calculate final costs                                     │
│   └─────────────────┘                                                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Session Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support vendor session workflows:
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
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_CONFIRMED</code></TableCell>
                  <TableCell className="text-sm">Registration confirmed</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{session_date}'}, {'{session_location}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_REMINDER</code></TableCell>
                  <TableCell className="text-sm">Upcoming session</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{session_date}'}, {'{meeting_url}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_REG_DEADLINE</code></TableCell>
                  <TableCell className="text-sm">Registration deadline approaching</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{course_name}'}, {'{due_date}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">VENDOR_SESSION_CANCELLED</code></TableCell>
                  <TableCell className="text-sm">Session cancelled</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{course_name}'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Vendor Session Cost Calculation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session: "Advanced Leadership Workshop"
Vendor: Leadership Excellence Inc.
Date: 2024-02-15

Pricing Model: Per Participant
├── Base cost per participant: $450
├── Volume discount (10+ attendees): -10%
└── No-show policy: 50% refund if cancelled 48h+ before

Registration Summary:
├── Registered: 15 participants
├── Attended: 13 participants  
├── No-shows: 2 participants

Cost Calculation:
├── 15 × $450 = $6,750 (gross)
├── 10% volume discount = -$675
├── Subtotal = $6,075
├── No-show credits: 2 × ($450 × 50%) = -$450
└── Final invoice = $5,625

Cost Allocation:
├── Engineering (5 ppl): $1,875 → CC-ENG-001
├── Sales (6 ppl): $2,250 → CC-SALES-002
└── HR (4 ppl): $1,500 → CC-HR-003
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Sessions below min_capacity can be cancelled or rescheduled</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Registrations after max_capacity go to waitlist automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>No-show participants are flagged for manager visibility</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Attendance updates trigger training request completion</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Cost tracking integrates with training budget module</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Vendor Integration</AlertTitle>
        <AlertDescription>
          This section documents the scheduling and logistics layer. For vendor 
          relationship management, contracts, and performance reviews, see 
          Chapter 3: Vendor Management.
        </AlertDescription>
      </Alert>
    </section>
  );
}

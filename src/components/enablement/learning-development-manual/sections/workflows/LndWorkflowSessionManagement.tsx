import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export function LndWorkflowSessionManagement() {
  return (
    <section className="space-y-6" id="sec-4-28" data-manual-anchor="sec-4-28">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.16 Session Management & Scheduling</h2>
        <p className="text-muted-foreground">Schedule and manage instructor-led training sessions.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create ILT sessions with instructor assignment</li>
            <li>Manage session capacity and venue booking</li>
            <li>Handle cancellations and rescheduling</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Session Lifecycle</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Session Management Workflow:

Create Session
      │
      ▼
┌─────────────────┐
│ Assign Details  │ Course, instructor, date/time
│                 │ Location, capacity
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Open for        │ Registration period
│ Registration    │ 
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
[Min Met]  [Below Min]
    │         │
    ▼         ▼
Confirmed  Cancelled/Rescheduled
    │
    ▼
Session Delivered → Mark Attendance → Generate Certificates
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

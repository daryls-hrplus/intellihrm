import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export function LndWorkflowCalendar() {
  return (
    <section className="space-y-6" id="sec-4-15" data-manual-anchor="sec-4-15">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.15 Calendar Operations</h2>
        <p className="text-muted-foreground">Manage training schedules and calendar integrations.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>View training sessions in calendar format</li>
            <li>Export sessions to personal calendars (iCal)</li>
            <li>Manage scheduling conflicts and availability</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Calendar Features</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Training Calendar Views:
┌─────────────────────────────────────────────────────────────┐
│ View          │ Content                                     │
├───────────────┼─────────────────────────────────────────────┤
│ My Training   │ Enrolled courses, upcoming deadlines        │
│ Team Training │ Manager view of team assignments            │
│ All Sessions  │ Company-wide ILT/virtual session calendar   │
│ Compliance    │ Due dates for mandatory training            │
└─────────────────────────────────────────────────────────────┘

Calendar Export (iCal):
├── Session title, date, time, location
├── Virtual meeting link (if applicable)
├── Reminder notifications (configurable)
└── Automatic updates on reschedule/cancellation
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

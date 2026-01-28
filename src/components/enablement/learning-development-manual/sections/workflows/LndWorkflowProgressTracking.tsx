import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Bell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowProgressTracking() {
  return (
    <section className="space-y-6" id="sec-4-3" data-manual-anchor="sec-4-3">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.9 Progress Tracking</h2>
        <p className="text-muted-foreground">Monitor learner progress through courses and learning paths.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Track lesson-level completion status</li>
            <li>Calculate overall course progress percentages</li>
            <li>Monitor time spent on learning activities</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Progress Data Model</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
lms_enrollments (course level)
├── status: in_progress | completed
├── progress_percentage: 0-100
├── started_at, completed_at
│
└── lms_lesson_progress (lesson level)
    ├── completed: boolean
    ├── completed_at: timestamp
    ├── time_spent_seconds: number
    └── last_position: string (video timestamp)

Progress Calculation:
progress_percentage = (completed_lessons / total_lessons) × 100
          `}</pre>
        </CardContent>
      </Card>
      {/* Notification Integration */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Proactive Progress Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types drive learner engagement through timely alerts:
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
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_PROGRESS_STALLED</code></TableCell>
                  <TableCell className="text-sm">No progress activity for extended period</TableCell>
                  <TableCell className="text-sm text-muted-foreground">7, 14, 21 days inactive</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_OVERDUE_TRAINING</code></TableCell>
                  <TableCell className="text-sm">Training past due date</TableCell>
                  <TableCell className="text-sm text-muted-foreground">1, 3, 7, 14 days overdue</TableCell>
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

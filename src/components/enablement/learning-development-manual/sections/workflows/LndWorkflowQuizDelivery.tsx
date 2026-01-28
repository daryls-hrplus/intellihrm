import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Bell } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndWorkflowQuizDelivery() {
  return (
    <section className="space-y-6" id="sec-4-12" data-manual-anchor="sec-4-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.10 Quiz Delivery</h2>
        <p className="text-muted-foreground">Administer quizzes with time limits, randomization, and attempt tracking.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Deliver timed assessments with enforced limits</li>
            <li>Randomize question order to prevent cheating</li>
            <li>Track attempts and provide feedback</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Quiz Attempt Flow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Learner Starts Quiz
         │
         ▼
┌─────────────────┐
│ Load Questions  │ Randomize if enabled
│ Start Timer     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Answer Questions│ Save progress periodically
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
[Submit]  [Timeout]
    │         │
    └────┬────┘
         ▼
┌─────────────────┐
│ Calculate Score │
│ Record Attempt  │ lms_quiz_attempts
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
 [Pass]    [Fail]
    │         │
    ▼         ▼
Certificate  Retry (if attempts remain)
          `}</pre>
        </CardContent>
      </Card>
      {/* Notification Integration */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Assessment Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support assessment workflows:
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
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_QUIZ_DEADLINE</code></TableCell>
                  <TableCell className="text-sm">Quiz submission deadline approaching</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{course_name}'}, {'{due_date}'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_QUIZ_FAILED</code></TableCell>
                  <TableCell className="text-sm">Quiz failed with retakes available</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{'{quiz_score}'}, {'{passing_score}'}, {'{retakes_remaining}'}</TableCell>
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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';

export function LndWorkflowQuizDelivery() {
  return (
    <section className="space-y-6" id="sec-4-10" data-manual-anchor="sec-4-10">
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
    </section>
  );
}

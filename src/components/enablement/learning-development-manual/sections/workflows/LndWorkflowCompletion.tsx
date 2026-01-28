import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export function LndWorkflowCompletion() {
  return (
    <section className="space-y-6" id="sec-4-11" data-manual-anchor="sec-4-11">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.11 Completion & Evaluation</h2>
        <p className="text-muted-foreground">Process course completions and collect learner feedback.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Define completion criteria (lessons, quiz score, time)</li>
            <li>Trigger post-completion evaluations</li>
            <li>Update enrollment status and notify stakeholders</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />Completion Criteria</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Course Completion Requirements (configurable per course):

┌─────────────────────────────────────────────────────────────┐
│ Completion = ALL of the following:                          │
├─────────────────────────────────────────────────────────────┤
│ ☑ All lessons marked complete (100% progress)               │
│ ☑ Quiz passed (if quiz required, score >= passing_score)    │
│ ☑ Minimum time spent (if configured)                        │
│ ☑ Evaluation submitted (if required)                        │
└─────────────────────────────────────────────────────────────┘

On Completion:
├── Update lms_enrollments.status → 'completed'
├── Set completed_at timestamp
├── Trigger certificate generation (if configured)
├── Send completion notification
├── Update competency levels (if mapped)
└── Close related training_request
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

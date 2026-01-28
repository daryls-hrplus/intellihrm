import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export function LndWorkflowTrainingHistory() {
  return (
    <section className="space-y-6" id="sec-4-19" data-manual-anchor="sec-4-19">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.19 Training History & Transcript</h2>
        <p className="text-muted-foreground">Consolidated view of all training activities per employee.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access complete training history from employee profile</li>
            <li>View internal LMS completions and external records</li>
            <li>Export training transcripts for compliance</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Training History Sources</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Employee Training History (Unified View)
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Source: Internal LMS                                       │
│  ├── lms_enrollments (completed courses)                    │
│  ├── lms_certificates (earned certificates)                 │
│  └── lms_quiz_attempts (assessment scores)                  │
│                                                             │
│  Source: External Training                                  │
│  ├── training_requests (approved external training)         │
│  ├── Agency course completions                              │
│  └── Manual external record entries                         │
│                                                             │
│  Source: Compliance                                         │
│  ├── compliance_training_assignments (mandatory)            │
│  └── Recertification records                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

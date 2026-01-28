import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

export function LndWorkflowRequestOnboarding() {
  return (
    <section className="space-y-6" id="sec-4-6" data-manual-anchor="sec-4-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.6 Onboarding Requests</h2>
        <p className="text-muted-foreground">Automatic training enrollment for new hire onboarding.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure onboarding tasks with training course links</li>
            <li>Auto-enroll new hires based on role/department</li>
            <li>Track onboarding training completion</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" />Onboarding Integration</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
New Hire Created
       │
       ▼
┌──────────────────┐
│ Onboarding Task  │ training_course_id set
│   Assigned       │
└────────┬─────────┘
         │
         ▼ (PostgreSQL Trigger)
┌──────────────────┐
│ Auto-Enrollment  │ lms_enrollments created
│   Created        │ source: onboarding
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Task Completion  │ Linked to course completion
└──────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

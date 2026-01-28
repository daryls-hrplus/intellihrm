import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';

export function LndWorkflowCertification() {
  return (
    <section className="space-y-6" id="sec-4-12" data-manual-anchor="sec-4-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.12 Certification</h2>
        <p className="text-muted-foreground">Generate and manage course completion certificates.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure certificate templates per course</li>
            <li>Auto-generate certificates on course completion</li>
            <li>Track certificate expiry and recertification</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificate Generation</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Course Completed
       │
       ▼
┌──────────────────┐
│ Certificate      │ Check if course has
│ Required?        │ certificate_template set
└────────┬─────────┘
         │ Yes
         ▼
┌──────────────────┐
│ Generate PDF     │ Merge template with:
│                  │ - Employee name
│                  │ - Course title
│                  │ - Completion date
│                  │ - Certificate number
│                  │ - Expiry date
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Store in         │ lms_certificates table
│ lms_certificates │ Link to storage bucket
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Email to Learner │ With PDF attachment
└──────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

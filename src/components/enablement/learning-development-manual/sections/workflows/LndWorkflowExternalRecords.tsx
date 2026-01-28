import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export function LndWorkflowExternalRecords() {
  return (
    <section className="space-y-6" id="sec-4-14" data-manual-anchor="sec-4-14">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.14 External Records</h2>
        <p className="text-muted-foreground">Record and track training completed outside the LMS.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Allow HR to enter external training completions</li>
            <li>Enable employee self-reporting with evidence upload</li>
            <li>Validate external certifications against accrediting bodies</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5" />External Record Entry</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
External Training Record Fields:
┌─────────────────────────────────────────────────────────────┐
│ provider_name       │ Organization that delivered training  │
│ course_title        │ Name of the training/certification    │
│ completion_date     │ When training was completed           │
│ duration_hours      │ Total learning hours                  │
│ certificate_number  │ External credential ID                │
│ certificate_url     │ Verification URL                      │
│ certificate_file    │ Uploaded PDF/image                    │
│ competencies_gained │ Linked competencies                   │
│ cost                │ Training cost (for reporting)         │
│ expiry_date         │ Certification expiration              │
└─────────────────────────────────────────────────────────────┘

Entry Methods:
├── HR Admin: Direct entry with verification
├── Employee (ESS): Self-report with evidence upload
└── Manager (MSS): Enter on behalf of team member
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

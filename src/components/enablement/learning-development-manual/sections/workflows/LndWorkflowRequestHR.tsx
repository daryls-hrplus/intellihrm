import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function LndWorkflowRequestHR() {
  return (
    <section className="space-y-6" id="sec-4-7" data-manual-anchor="sec-4-7">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.7 HR-Initiated Requests</h2>
        <p className="text-muted-foreground">Bulk training assignments initiated by HR administrators.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Execute bulk enrollment for compliance training</li>
            <li>Target training by department, location, or job role</li>
            <li>Track assignment completion across populations</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />HR Bulk Assignment</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
HR Administrator
       │
       ▼
┌──────────────────┐
│ Select Course    │
│ Define Audience  │ By dept/location/role
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Bulk Create      │ training_requests created
│ Requests         │ source: hr_assigned
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Notifications    │ Email to all affected
│ Sent             │ employees and managers
└──────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

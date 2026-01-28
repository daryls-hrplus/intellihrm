import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';

export function LndWorkflowRequestSelfService() {
  return (
    <section className="space-y-6" id="sec-4-5" data-manual-anchor="sec-4-5">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.5 Self-Service Requests</h2>
        <p className="text-muted-foreground">Employee-initiated training requests with approval workflows.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enable employees to browse and request external training</li>
            <li>Configure manager and HR approval chains</li>
            <li>Track budget impact before approval</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Self-Service Flow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Employee (ESS Portal)
         │
         ▼
┌─────────────────┐
│ Browse Catalog  │ Internal + Agency courses
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Submit Request  │ Justification required
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Manager Review  │────▶│   HR Review     │ (if cost > threshold)
│   (Level 1)     │     │   (Level 2)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
              [Approved/Rejected]
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

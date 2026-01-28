import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListOrdered } from 'lucide-react';

export function LndWorkflowWaitlist() {
  return (
    <section className="space-y-6" id="sec-4-18" data-manual-anchor="sec-4-18">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.18 Waitlist Management</h2>
        <p className="text-muted-foreground">Handle session capacity overflow with automated waitlists.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure session capacity limits</li>
            <li>Auto-add to waitlist when capacity reached</li>
            <li>Process waitlist promotions on cancellation</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ListOrdered className="h-5 w-5" />Waitlist Processing</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Session at Capacity
        │
        ▼
┌─────────────────┐
│ New Registration│
│   Attempt       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add to Waitlist │ lms_waitlist
│ Position: N+1   │ Notify user of position
└─────────────────┘

On Cancellation:
┌─────────────────┐
│ Registered User │
│   Cancels       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Promote #1 from │ Move from waitlist to
│ Waitlist        │ registered
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Notify Promoted │ Email confirmation
│ User            │ 24hr deadline to confirm
└─────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

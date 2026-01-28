import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export function LndWorkflowInvitations() {
  return (
    <section className="space-y-6" id="sec-4-25" data-manual-anchor="sec-4-25">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.8 Training Invitations</h2>
        <p className="text-muted-foreground">Send targeted training invitations with RSVP tracking.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and send training session invitations</li>
            <li>Track acceptance and decline responses</li>
            <li>Manage session capacity through RSVPs</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Invitation Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Training Coordinator
         │
         ▼
┌─────────────────┐
│ Create Session  │ Date, time, capacity
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Select Invitees │ From employee list
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send Invites    │ Email with accept/decline
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
[Accept]   [Decline]
    │         │
    ▼         ▼
Enrolled   Noted
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

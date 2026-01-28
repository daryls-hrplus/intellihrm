import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

export function LndWorkflowVirtualClassroom() {
  return (
    <section className="space-y-6" id="sec-4-17" data-manual-anchor="sec-4-17">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.17 Virtual Classroom Operations</h2>
        <p className="text-muted-foreground">Manage virtual instructor-led training sessions.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Integrate with video conferencing platforms</li>
            <li>Track virtual attendance and engagement</li>
            <li>Manage recordings and post-session access</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" />Virtual Classroom Features</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Supported Platforms:
├── Microsoft Teams
├── Zoom
├── Google Meet
└── WebEx

Virtual Session Data (lms_virtual_classrooms):
├── platform: teams | zoom | meet | webex
├── meeting_url: Auto-generated or manual entry
├── meeting_id: Platform meeting identifier
├── passcode: Session access code
├── recording_url: Post-session recording
└── scheduled_at: Session date/time

Attendance Tracking (lms_virtual_attendance):
├── join_time: When participant joined
├── leave_time: When participant left
├── total_duration: Time in session
├── engagement_score: Based on participation
└── attended: Boolean (met minimum time)
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

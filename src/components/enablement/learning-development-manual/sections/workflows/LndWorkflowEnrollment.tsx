import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export function LndWorkflowEnrollment() {
  return (
    <section className="space-y-6" id="sec-4-2" data-manual-anchor="sec-4-2">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.2 Enrollment Management</h2>
        <p className="text-muted-foreground">Self-enrollment, manager assignment, and bulk enrollment workflows.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure self-enrollment permissions by course</li>
            <li>Process manager-initiated enrollments</li>
            <li>Execute bulk enrollments for compliance training</li>
            <li>Manage enrollment capacity and waitlists</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Enrollment Sources</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────┐
│                   ENROLLMENT SOURCES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Self-Service │  │   Manager    │  │     HR       │       │
│  │  (Employee)  │  │ Assignment   │  │    Bulk      │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│                           ▼                                 │
│              ┌────────────────────────┐                     │
│              │    lms_enrollments     │                     │
│              │ status: enrolled       │                     │
│              │ source_type: employee/ │                     │
│              │   manager/compliance   │                     │
│              └────────────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

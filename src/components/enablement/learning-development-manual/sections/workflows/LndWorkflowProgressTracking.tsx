import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export function LndWorkflowProgressTracking() {
  return (
    <section className="space-y-6" id="sec-4-9" data-manual-anchor="sec-4-9">
      <div>
        <h2 className="text-2xl font-bold mb-2">4.9 Progress Tracking</h2>
        <p className="text-muted-foreground">Monitor learner progress through courses and learning paths.</p>
      </div>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Track lesson-level completion status</li>
            <li>Calculate overall course progress percentages</li>
            <li>Monitor time spent on learning activities</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Progress Data Model</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
lms_enrollments (course level)
├── status: in_progress | completed
├── progress_percentage: 0-100
├── started_at, completed_at
│
└── lms_lesson_progress (lesson level)
    ├── completed: boolean
    ├── completed_at: timestamp
    ├── time_spent_seconds: number
    └── last_position: string (video timestamp)

Progress Calculation:
progress_percentage = (completed_lessons / total_lessons) × 100
          `}</pre>
        </CardContent>
      </Card>
    </section>
  );
}

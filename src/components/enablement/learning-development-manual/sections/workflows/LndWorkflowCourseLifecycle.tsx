import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, CheckCircle2 } from 'lucide-react';

export function LndWorkflowCourseLifecycle() {
  return (
    <section className="space-y-6" id="sec-4-1" data-manual-anchor="sec-4-1">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-blue-600" />
          4.1 Course Lifecycle
        </h2>
        <p className="text-muted-foreground">
          Manage courses from draft creation through publication, maintenance, and archival.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Understand course status transitions and governance</li>
            <li>Configure publishing workflows with approval gates</li>
            <li>Manage course versioning and updates</li>
            <li>Archive courses while preserving completion history</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Course Status Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│  DRAFT  │────▶│  REVIEW   │────▶│ PUBLISHED │────▶│ ARCHIVED  │
│(author) │     │(approver) │     │(learners) │     │(retired)  │
└─────────┘     └───────────┘     └───────────┘     └───────────┘
     │                │                 │
     │                │                 │
     │                ▼                 ▼
     │         ┌───────────┐     ┌───────────┐
     └────────▶│ REJECTED  │     │ SUSPENDED │
               │(rework)   │     │(temp hide)│
               └───────────┘     └───────────┘

Transitions:
• Draft → Review: Author submits for approval
• Review → Published: Approver accepts
• Review → Rejected: Approver requests changes
• Published → Suspended: Admin temporarily hides
• Published → Archived: Course retired permanently
• Archived: Completions preserved, no new enrollments
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Courses must have at least one module with one lesson before publishing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Archiving a course preserves all completion records and certificates</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Published courses with active enrollments require approval to modify</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Suspended courses remain visible to enrolled learners but hidden from catalog</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}

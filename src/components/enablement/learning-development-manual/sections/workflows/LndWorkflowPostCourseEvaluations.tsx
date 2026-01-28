import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ClipboardList, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Star,
  Bell,
  BarChart3
} from 'lucide-react';

export function LndWorkflowPostCourseEvaluations() {
  return (
    <section className="space-y-6" id="sec-4-14" data-manual-anchor="sec-4-14">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-teal-600" />
          4.14 Post-Course Evaluations (Kirkpatrick L1-L2)
        </h2>
        <p className="text-muted-foreground">
          Collect learner feedback through structured evaluations measuring reaction 
          (Kirkpatrick Level 1) and learning (Level 2) outcomes.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure post-course evaluation surveys</li>
            <li>Understand Kirkpatrick Level 1 (Reaction) metrics</li>
            <li>Measure Level 2 (Learning) outcomes</li>
            <li>Analyze evaluation data for course improvement</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>training_evaluations</Badge>
            <span className="text-sm font-normal text-muted-foreground">Field Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Field</TableHead>
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/12">Req</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="secondary">PK</Badge></TableCell>
                <TableCell>Unique evaluation identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Course being evaluated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">enrollment_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to specific enrollment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">evaluation_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>level_1_reaction | level_2_learning | level_3_behavior | level_4_results</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">template_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Standard evaluation template</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_anonymous</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Hide respondent identity</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_required</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Must complete for certificate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">due_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Deadline for submission</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Multi-tenant isolation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>training_evaluation_responses</Badge>
            <span className="text-sm font-normal text-muted-foreground">Field Reference</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Field</TableHead>
                <TableHead className="w-1/6">Type</TableHead>
                <TableHead className="w-1/12">Req</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">id</TableCell>
                <TableCell>UUID</TableCell>
                <TableCell><Badge variant="secondary">PK</Badge></TableCell>
                <TableCell>Unique response identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">evaluation_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Parent evaluation reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Respondent (null if anonymous)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">responses</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Question-answer pairs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">overall_rating</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Aggregate score (1-5 or 1-10)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">comments</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Open-ended feedback</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">submitted_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Response submission time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">time_spent_seconds</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Time to complete evaluation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Kirkpatrick Evaluation Model</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        KIRKPATRICK EVALUATION MODEL                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Level 1: REACTION (Measured Immediately)                                       │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                       │
│   "Did learners find the training engaging and relevant?"                        │
│                                                                                  │
│   Standard Questions:                                                            │
│   ├── Overall satisfaction (1-5 stars)                                           │
│   ├── Content relevance to job role                                              │
│   ├── Instructor/delivery quality                                                │
│   ├── Materials and resources                                                    │
│   ├── Would recommend to colleagues                                              │
│   └── Suggestions for improvement (open text)                                    │
│                                                                                  │
│   Timing: Immediately after course completion                                    │
│   ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│   Level 2: LEARNING (Measured via Assessment)                                    │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                       │
│   "Did learners acquire the intended knowledge and skills?"                      │
│                                                                                  │
│   Measurement Methods:                                                           │
│   ├── Pre/post quiz score comparison                                             │
│   ├── Skills demonstration                                                       │
│   ├── Certification exam results                                                 │
│   └── Practical assignments                                                      │
│                                                                                  │
│   Timing: End of course + follow-up assessment                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

Evaluation Response Structure (JSONB):
{
  "questions": [
    {
      "id": "satisfaction",
      "type": "rating",
      "question": "Overall, how satisfied are you with this course?",
      "rating": 4,
      "max_rating": 5
    },
    {
      "id": "relevance",
      "type": "likert",
      "question": "The content was relevant to my job responsibilities.",
      "answer": "strongly_agree"
    },
    {
      "id": "apply_skills",
      "type": "likert",
      "question": "I feel confident applying what I learned.",
      "answer": "agree"
    },
    {
      "id": "improvement",
      "type": "text",
      "question": "What could be improved?",
      "answer": "More real-world examples would be helpful..."
    }
  ],
  "nps_score": 8
}
          `}</pre>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-blue-600" />
            Evaluation Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            The following notification event types support the evaluation workflow:
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Event Code</TableHead>
                  <TableHead className="font-medium">Trigger</TableHead>
                  <TableHead className="font-medium">Recommended Interval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_EVALUATION_REQUEST</code></TableCell>
                  <TableCell className="text-sm">Course completion + evaluation enabled</TableCell>
                  <TableCell className="text-sm">Immediate</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><code className="bg-muted px-1 rounded text-xs">LMS_EVALUATION_REMINDER</code></TableCell>
                  <TableCell className="text-sm">Pending evaluation approaching due date</TableCell>
                  <TableCell className="text-sm">3 days, 1 day before</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Configure reminder rules in <strong>Admin → Reminder Management</strong>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evaluation Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Evaluation responses are aggregated into course-level metrics:
            </p>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Course Evaluation Dashboard:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────┐
│  Project Management 101 - Evaluation Summary                        │
│  Response Rate: 87% (134/154 completions)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Overall Satisfaction:  ★★★★☆  4.2/5.0                              │
│  Content Relevance:     ████████████████░░  89%                      │
│  Instructor Quality:    █████████████████░  92%                      │
│  Would Recommend:       ███████████████░░░  85%                      │
│                                                                      │
│  NPS Score: +42 (Promoters: 58%, Passives: 26%, Detractors: 16%)    │
│                                                                      │
│  Top Improvement Requests:                                           │
│  ├── More hands-on exercises (23 mentions)                           │
│  ├── Longer session time (18 mentions)                               │
│  └── Updated case studies (12 mentions)                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Evaluations with is_required = true block certificate generation until complete</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Anonymous evaluations hide employee_id from course owners</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Minimum 5 responses required before aggregate scores are shown</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Level 2 evaluations can include pre/post score comparisons</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Evaluation data retained for 7 years per compliance requirements</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Industry Benchmark</AlertTitle>
        <AlertDescription>
          Organizations measuring all four Kirkpatrick levels report 25% higher training ROI 
          (ATD, 2024). Level 1 evaluations should achieve 80%+ response rates for 
          statistically valid insights.
        </AlertDescription>
      </Alert>
    </section>
  );
}

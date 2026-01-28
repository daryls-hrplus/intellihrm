import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Star, 
  CheckCircle2, 
  Lightbulb, 
  MessageSquare,
  ThumbsUp,
  Shield,
  ArrowRight
} from 'lucide-react';

export function LndWorkflowCourseReviews() {
  return (
    <section className="space-y-6" id="sec-4-38" data-manual-anchor="sec-4-38">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-600" />
          4.21 Course Reviews & Ratings
        </h2>
        <p className="text-muted-foreground">
          Learner feedback collection, rating aggregation, and review moderation 
          to improve course quality and guide content decisions.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enable course reviews and star ratings for completed courses</li>
            <li>Moderate and approve reviews before publication</li>
            <li>Track "helpful" votes and highlight top reviews</li>
            <li>Analyze review trends to improve course content</li>
            <li>Configure verified completion badges for authentic feedback</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_course_reviews</Badge>
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
                <TableCell>Unique review identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Reference to lms_courses</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Reviewer's profile ID</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">enrollment_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Link to enrollment for verified reviews</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">rating</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Star rating (1-5)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">review_title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Optional headline for review</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">review_text</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Detailed review content</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_verified</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>True if reviewer completed the course</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_approved</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Moderation status (default: false)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">helpful_count</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>"Was this helpful?" vote count</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Multi-tenant isolation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Review submission timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Review Submission Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COURSE REVIEW WORKFLOW                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Course Completion                                                              │
│         │                                                                        │
│         ▼                                                                        │
│   ┌─────────────────┐                                                            │
│   │ Prompt: "Rate   │                                                            │
│   │ this course"    │                                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Submit Review   │  ★★★★☆                                                     │
│   │ - Star rating   │  "Great course! The video..."                             │
│   │ - Optional text │                                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Verification    │                                                            │
│   │ Check           │                                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│    ┌───────┴───────┐                                                             │
│    ▼               ▼                                                             │
│ [Completed]   [Not Completed]                                                    │
│    │               │                                                             │
│    ▼               ▼                                                             │
│ is_verified    is_verified                                                       │
│ = TRUE         = FALSE                                                           │
│    │               │                                                             │
│    └───────┬───────┘                                                             │
│            │                                                                     │
│            ▼                                                                     │
│   ┌─────────────────┐                                                            │
│   │ Moderation      │  (if moderation enabled)                                   │
│   │ Queue           │                                                            │
│   └────────┬────────┘                                                            │
│            │                                                                     │
│    ┌───────┴───────┐                                                             │
│    ▼               ▼                                                             │
│ [Approved]    [Rejected]                                                         │
│    │               │                                                             │
│    ▼               ▼                                                             │
│ Published      Notified                                                          │
│ in Catalog     with reason                                                       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Moderation Process
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>Admin</span>
              <ArrowRight className="h-4 w-4" />
              <span>LMS Management</span>
              <ArrowRight className="h-4 w-4" />
              <span>Review Moderation</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Approve Criteria
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Constructive feedback (positive or negative)</li>
                  <li>• No profanity or inappropriate language</li>
                  <li>• Specific to course content</li>
                  <li>• Does not contain personal information</li>
                  <li>• Verified completion (preferred)</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                  ✗ Reject Criteria
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Spam or promotional content</li>
                  <li>• Personal attacks on instructors</li>
                  <li>• Off-topic or irrelevant</li>
                  <li>• Contains confidential information</li>
                  <li>• Duplicate submission</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Helpful Votes & Top Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Other learners can vote on reviews as "helpful," which surfaces the most 
              valuable feedback in the catalog. Top reviews appear prominently on course 
              detail pages.
            </p>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Review Ranking Algorithm:
━━━━━━━━━━━━━━━━━━━━━━━━

ranking_score = (helpful_count * 2) + (is_verified ? 5 : 0) + recency_boost

Where:
├── helpful_count: Number of "helpful" votes
├── is_verified: +5 bonus if reviewer completed course
└── recency_boost: Decays over time (0-10 points based on age)

Display Rules:
├── Top Review: Highest ranking_score with is_approved = true
├── Featured Reviews: Next 3 by ranking_score
└── All Reviews: Paginated, newest first (default)
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Rating Aggregation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Course ratings are aggregated and displayed on catalog cards and course 
              detail pages. Only approved reviews count toward the aggregate.
            </p>

            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Course Rating Display:

┌─────────────────────────────────────────────────┐
│  Advanced Excel Techniques                       │
│  ★★★★☆ 4.2 (127 reviews)                        │
│                                                  │
│  Rating Breakdown:                               │
│  ★★★★★  ████████████████░░░░  58%               │
│  ★★★★☆  ██████████░░░░░░░░░░  28%               │
│  ★★★☆☆  ████░░░░░░░░░░░░░░░░   8%               │
│  ★★☆☆☆  ██░░░░░░░░░░░░░░░░░░   4%               │
│  ★☆☆☆☆  █░░░░░░░░░░░░░░░░░░░   2%               │
└─────────────────────────────────────────────────┘

Aggregation Formula:
average_rating = SUM(rating) / COUNT(*) 
WHERE is_approved = true
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
              <span>Each learner can submit only one review per course</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Reviews require a star rating; text is optional</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Verified reviews (is_verified = true) display a "Verified Completion" badge</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Moderation can be disabled for internal courses (company setting)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Reviews are company-scoped; employees only see reviews from their organization</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Course authors can respond to reviews but cannot delete them</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Low-rated courses (avg &lt; 3.0) trigger alerts to L&D Admin</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Industry Benchmark</AlertTitle>
        <AlertDescription>
          Courses with verified reviews see 23% higher enrollment rates than those without 
          (LinkedIn Learning, 2024). Enabling the verified completion badge builds trust and 
          encourages quality feedback.
        </AlertDescription>
      </Alert>
    </section>
  );
}

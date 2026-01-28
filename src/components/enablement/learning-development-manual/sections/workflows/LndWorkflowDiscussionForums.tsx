import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MessageSquare, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Pin,
  Shield,
  ThumbsUp,
  Reply
} from 'lucide-react';

export function LndWorkflowDiscussionForums() {
  return (
    <section className="space-y-6" id="sec-4-7" data-manual-anchor="sec-4-7">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          4.7 Discussion Forums & Collaboration
        </h2>
        <p className="text-muted-foreground">
          Enable peer learning through course discussion forums with thread management, 
          moderation, and instructor participation.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Enable discussion forums for courses and modules</li>
            <li>Manage thread creation, replies, and moderation</li>
            <li>Pin important threads and mark instructor responses</li>
            <li>Track learner participation for engagement metrics</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_discussion_forums</Badge>
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
                <TableCell>Unique forum identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Course this forum belongs to</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">module_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Optional module-specific forum</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Forum display name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Forum guidelines and purpose</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_moderated</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Require approval before posts are visible</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_active</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Enable/disable new posts</TableCell>
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
            <Badge>lms_discussion_threads</Badge>
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
                <TableCell>Unique thread identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">forum_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Parent forum reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">author_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Thread creator's profile ID</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Thread subject line</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">content</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Initial post content (markdown supported)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_pinned</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Pin to top of forum</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_locked</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Prevent new replies</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">reply_count</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Cached count of replies</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">last_reply_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Most recent reply timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Discussion Forum Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DISCUSSION FORUM WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Course Forum Structure:                                                        │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  📚 Project Management 101 - Discussion Forum                            │   │
│   ├─────────────────────────────────────────────────────────────────────────┤   │
│   │  📌 [Pinned] Welcome & Guidelines          Staff  │  45 replies         │   │
│   │  📌 [Pinned] FAQ - Common Questions        Staff  │  23 replies         │   │
│   ├─────────────────────────────────────────────────────────────────────────┤   │
│   │  💬 How to handle scope creep?             John   │  12 replies  ▲ 24   │   │
│   │  💬 RACI matrix confusion                  Sarah  │   8 replies  ▲ 15   │   │
│   │  💬 Best tools for Gantt charts?           Mike   │  18 replies  ▲ 31   │   │
│   │  💬 [Instructor Reply] Risk assessment     Anna   │   5 replies  ▲  9   │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│   Thread Actions:                                                                │
│   ├── New Thread: Create discussion topic                                        │
│   ├── Reply: Respond to existing thread                                          │
│   ├── Like: Upvote helpful posts                                                 │
│   ├── Report: Flag inappropriate content                                         │
│   └── Subscribe: Get notifications on replies                                    │
│                                                                                  │
│   Moderation Flow (if is_moderated = true):                                      │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐                            │
│   │ Post       │───▶│ Moderator  │───▶│ Published  │                            │
│   │ Submitted  │    │ Review     │    │ in Forum   │                            │
│   └────────────┘    └─────┬──────┘    └────────────┘                            │
│                           │                                                      │
│                           ▼                                                      │
│                    [Rejected: notify author with reason]                         │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Moderation Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>LMS Admin</span>
              <ArrowRight className="h-4 w-4" />
              <span>Course</span>
              <ArrowRight className="h-4 w-4" />
              <span>Forum Moderation</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pin className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">Pin Thread</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep important announcements and FAQs at the top of the forum.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Instructor Badge</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Instructor replies are highlighted with a badge for visibility.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Best Answer</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mark the most helpful reply to help future learners.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Business Rules</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Only enrolled learners can post in course forums</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Forum participation can count toward course completion (configurable)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Threads are soft-deleted to preserve discussion context</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Instructor response time is tracked for analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Email notifications sent for replies to subscribed threads</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>70-20-10 Framework</AlertTitle>
        <AlertDescription>
          Discussion forums support the "20" in the 70-20-10 learning model—social learning 
          through peer interaction. Courses with active forums show 41% higher completion 
          rates (Brandon Hall Group, 2024).
        </AlertDescription>
      </Alert>
    </section>
  );
}

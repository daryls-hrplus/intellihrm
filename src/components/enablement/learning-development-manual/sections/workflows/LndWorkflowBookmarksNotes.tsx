import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Bookmark, 
  StickyNote, 
  CheckCircle2, 
  Lightbulb,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

export function LndWorkflowBookmarksNotes() {
  return (
    <section className="space-y-6" id="sec-4-6" data-manual-anchor="sec-4-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-amber-600" />
          4.6 Bookmarks & Notes
        </h2>
        <p className="text-muted-foreground">
          Enable learners to save bookmarks at specific content positions and take 
          notes during learning for personal reference and study.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create and manage bookmarks within lesson content</li>
            <li>Take private or shared notes during courses</li>
            <li>Resume learning from bookmarked positions</li>
            <li>Export notes for offline study</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_bookmarks</Badge>
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
                <TableCell>Unique bookmark identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Learner who created the bookmark</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">lesson_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Lesson containing the bookmark</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">position_seconds</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Video/audio position in seconds</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">position_percentage</TableCell>
                <TableCell>DECIMAL</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Scroll position for text content (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>User-defined bookmark label</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">created_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Bookmark creation timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_notes</Badge>
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
                <TableCell>Unique note identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Learner who created the note</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Course-level note reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">lesson_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Lesson-level note reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">content</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Note content (supports markdown)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_private</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>If false, visible to course instructors</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">highlight_text</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Text selection that triggered the note</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">updated_at</TableCell>
                <TableCell>TIMESTAMPTZ</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Last modification timestamp</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bookmark & Notes Workflow</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BOOKMARKS & NOTES WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   During Lesson Consumption                                                      │
│                                                                                  │
│   ┌──────────────────────┐      ┌──────────────────────┐                        │
│   │   VIDEO/AUDIO        │      │   TEXT CONTENT       │                        │
│   │   ────────────       │      │   ────────────       │                        │
│   │   [🔖 Bookmark]      │      │   Select text →      │                        │
│   │   at 03:42           │      │   [📝 Add Note]      │                        │
│   └──────────────────────┘      └──────────────────────┘                        │
│                                                                                  │
│   Bookmark Actions:                  Note Actions:                               │
│   ├── Click timestamp to            ├── Type note content                       │
│   │   create bookmark               ├── Toggle private/shared                   │
│   ├── Add optional label            ├── Attach to highlight                     │
│   └── Bookmark list shows           └── Edit/delete anytime                     │
│       all saved positions                                                        │
│                                                                                  │
│   Resume Learning:                                                               │
│   ┌────────────────────────────────────────────────────────────────┐            │
│   │  Your Bookmarks in "Project Management Fundamentals"           │            │
│   ├────────────────────────────────────────────────────────────────┤            │
│   │  🔖 "Risk Assessment intro"    Lesson 3 @ 05:23    [▶ Resume]  │            │
│   │  🔖 "RACI matrix example"      Lesson 5 @ 12:07    [▶ Resume]  │            │
│   │  🔖 "Stakeholder mapping"      Lesson 7 @ 08:45    [▶ Resume]  │            │
│   └────────────────────────────────────────────────────────────────┘            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Note Visibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="h-5 w-5 text-gray-500" />
                <span className="font-semibold">Private Notes</span>
                <Badge variant="outline">Default</Badge>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Visible only to the learner</li>
                <li>• Personal study references</li>
                <li>• Not included in reports</li>
                <li>• Deleted when learner leaves company</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Shared Notes</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Visible to course instructors</li>
                <li>• Useful for Q&A and feedback</li>
                <li>• Can trigger instructor response</li>
                <li>• Retained for course improvement</li>
              </ul>
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
              <span>Bookmarks persist across devices when learner is authenticated</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Notes support markdown formatting for structured content</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Bookmarks are deleted when the associated lesson is removed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Learners can export all notes to PDF for offline study</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Maximum 100 bookmarks per course per learner</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Industry Benchmark</AlertTitle>
        <AlertDescription>
          Learners who actively take notes during digital courses show 27% higher retention 
          and 34% better assessment scores compared to passive viewers (Journal of Educational 
          Psychology, 2023).
        </AlertDescription>
      </Alert>
    </section>
  );
}

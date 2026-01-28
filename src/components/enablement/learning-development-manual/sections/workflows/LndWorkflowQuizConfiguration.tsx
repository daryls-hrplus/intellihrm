import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Settings2, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Shuffle,
  Clock,
  ListChecks,
  HelpCircle
} from 'lucide-react';

export function LndWorkflowQuizConfiguration() {
  return (
    <section className="space-y-6" id="sec-4-11" data-manual-anchor="sec-4-11">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-orange-600" />
          4.11 Quiz Configuration
        </h2>
        <p className="text-muted-foreground">
          Configure assessment settings including question types, randomization, 
          time limits, and passing criteria for course quizzes.
        </p>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader><CardTitle className="text-lg">Learning Objectives</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-1">
            <li>Configure quiz settings and passing scores</li>
            <li>Set up question randomization and answer shuffling</li>
            <li>Define time limits and attempt restrictions</li>
            <li>Enable post-quiz review and explanations</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge>lms_quizzes</Badge>
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
                <TableCell>Unique quiz identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">course_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Parent course reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Quiz display name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">description</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Instructions shown before quiz</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">passing_score</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Minimum score to pass (0-100)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">time_limit_minutes</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Maximum time allowed (null = unlimited)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">max_attempts</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Retry limit (null = unlimited)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">shuffle_questions</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Randomize question order</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">shuffle_answers</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Randomize answer options order</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">show_correct_answers</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Show correct answers after submission</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">show_explanations</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Show answer explanations after submission</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">allow_review</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Allow review of answers before final submit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">is_required</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Must pass for course completion</TableCell>
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
            <Badge>lms_quiz_questions</Badge>
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
                <TableCell>Unique question identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">quiz_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Parent quiz reference</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">question_type</TableCell>
                <TableCell>ENUM</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>multiple_choice | multiple_select | true_false | short_answer | matching</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">question_text</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Question content (supports markdown)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">options</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Answer options array with correct flags</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">correct_answer</TableCell>
                <TableCell>JSONB</TableCell>
                <TableCell><Badge>Yes</Badge></TableCell>
                <TableCell>Correct answer(s) definition</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">explanation</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Why this is the correct answer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">points</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Point value for this question (default: 1)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">sort_order</TableCell>
                <TableCell>INT</TableCell>
                <TableCell><Badge variant="outline">No</Badge></TableCell>
                <TableCell>Display order when not shuffled</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Question Type Examples</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
Question Types & Options Structure:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MULTIPLE_CHOICE (single correct answer):
{
  "question_type": "multiple_choice",
  "question_text": "What is the primary goal of risk management?",
  "options": [
    { "id": "a", "text": "Eliminate all risks", "is_correct": false },
    { "id": "b", "text": "Minimize negative impact", "is_correct": true },
    { "id": "c", "text": "Increase project scope", "is_correct": false },
    { "id": "d", "text": "Reduce team size", "is_correct": false }
  ],
  "correct_answer": { "option_id": "b" },
  "explanation": "Risk management aims to minimize negative impacts, not eliminate all risks..."
}

2. MULTIPLE_SELECT (multiple correct answers):
{
  "question_type": "multiple_select",
  "question_text": "Which are valid project constraints? (Select all)",
  "options": [
    { "id": "a", "text": "Time", "is_correct": true },
    { "id": "b", "text": "Cost", "is_correct": true },
    { "id": "c", "text": "Weather", "is_correct": false },
    { "id": "d", "text": "Scope", "is_correct": true }
  ],
  "correct_answer": { "option_ids": ["a", "b", "d"] }
}

3. TRUE_FALSE:
{
  "question_type": "true_false",
  "question_text": "A Gantt chart shows task dependencies.",
  "correct_answer": { "value": true },
  "explanation": "Gantt charts visualize project schedules including dependencies..."
}

4. SHORT_ANSWER (text input):
{
  "question_type": "short_answer",
  "question_text": "What does RACI stand for?",
  "correct_answer": { 
    "accepted_answers": [
      "Responsible, Accountable, Consulted, Informed",
      "RACI matrix"
    ],
    "case_sensitive": false
  }
}

5. MATCHING:
{
  "question_type": "matching",
  "question_text": "Match the project phase with its output:",
  "options": {
    "left": ["Initiation", "Planning", "Execution", "Closing"],
    "right": ["Project Charter", "WBS", "Deliverables", "Lessons Learned"]
  },
  "correct_answer": {
    "pairs": [
      ["Initiation", "Project Charter"],
      ["Planning", "WBS"],
      ["Execution", "Deliverables"],
      ["Closing", "Lessons Learned"]
    ]
  }
}
          `}</pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Quiz Settings Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-mono bg-muted px-3 py-2 rounded">
              <span>LMS Admin</span>
              <ArrowRight className="h-4 w-4" />
              <span>Course</span>
              <ArrowRight className="h-4 w-4" />
              <span>Quiz Settings</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shuffle className="h-5 w-5 text-purple-500" />
                  <span className="font-semibold">Randomization</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• shuffle_questions: Randomize question order</li>
                  <li>• shuffle_answers: Randomize answer options</li>
                  <li>• Reduces cheating on retakes</li>
                  <li>• Each attempt sees different order</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="font-semibold">Time Management</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• time_limit_minutes: Auto-submit on expiry</li>
                  <li>• Warning at 5 min and 1 min remaining</li>
                  <li>• Timer visible throughout quiz</li>
                  <li>• null = no time limit</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ListChecks className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Attempt Rules</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• max_attempts: Limit retry attempts</li>
                  <li>• Best score or latest score used</li>
                  <li>• Cooldown period between attempts</li>
                  <li>• null = unlimited attempts</li>
                </ul>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold">Feedback Options</span>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• show_correct_answers: Reveal correct choices</li>
                  <li>• show_explanations: Display why correct</li>
                  <li>• allow_review: Check before submit</li>
                  <li>• Configurable per quiz</li>
                </ul>
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
              <span>Quizzes with is_required = true block course completion until passed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Questions can be weighted differently using the points field</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Short answer grading uses fuzzy matching with configurable tolerance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Quiz questions can be imported from question banks (future)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>All quiz attempts are logged for audit and analytics</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Assessment Best Practices</AlertTitle>
        <AlertDescription>
          For compliance training, set max_attempts = 3, passing_score = 80%, and 
          show_explanations = true to reinforce learning. For knowledge checks, 
          allow unlimited attempts with immediate feedback.
        </AlertDescription>
      </Alert>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, Grid3X3 } from 'lucide-react';

export function F360QuestionBank() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.3 Question Bank Setup</h3>
        <p className="text-muted-foreground">
          The question bank contains all feedback questions available for 360 cycles. Questions can be linked 
          to competencies, assigned to specific rater categories, and configured with various response types.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Create effective feedback questions with appropriate response types</li>
            <li>• Link questions to competencies for signal alignment</li>
            <li>• Configure question visibility per rater category using the matrix</li>
            <li>• Understand question ordering and grouping best practices</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Navigation:</span>
            <span className="text-muted-foreground">
              Performance → Setup → 360 Feedback → Question Bank
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Table: feedback_360_questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Field</TableHead>
                  <TableHead className="w-[80px]">Required</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'question_text', required: true, type: 'Text', desc: 'Primary question text displayed to raters' },
                  { field: 'question_text_en', required: false, type: 'Text', desc: 'English translation for multi-language support' },
                  { field: 'question_type', required: true, type: 'Enum', desc: 'Response type: rating, text, multi_choice, scale' },
                  { field: 'competency_id', required: false, type: 'UUID', desc: 'Linked competency for signal alignment' },
                  { field: 'skill_id', required: false, type: 'UUID', desc: 'Linked skill for technical assessments' },
                  { field: 'signal_category', required: false, type: 'Enum', desc: 'AI signal category: leadership, teamwork, technical, values' },
                  { field: 'is_required', required: true, type: 'Boolean', desc: 'Whether response is mandatory' },
                  { field: 'is_core', required: false, type: 'Boolean', desc: 'Core questions appear in all cycles' },
                  { field: 'options', required: false, type: 'JSON', desc: 'Multi-choice options array' },
                  { field: 'rating_scale_id', required: false, type: 'UUID', desc: 'Linked rating scale for rating questions' },
                  { field: 'display_order', required: true, type: 'Number', desc: 'Sort order in feedback form' },
                  { field: 'category_group', required: false, type: 'Text', desc: 'Grouping label for UI sections' },
                  { field: 'help_text', required: false, type: 'Text', desc: 'Guidance shown below question' },
                  { field: 'is_active', required: true, type: 'Boolean', desc: 'Available for use in cycles' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{row.field}</TableCell>
                    <TableCell>
                      <Badge variant={row.required ? 'default' : 'secondary'} className="text-xs">
                        {row.required ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Question Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Question Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                type: 'rating',
                name: 'Rating Scale',
                desc: 'Numeric rating with behavioral anchors (1-5)',
                use: 'Most common. Quantifiable competency assessment.',
                example: 'Rate this person\'s communication skills'
              },
              {
                type: 'text',
                name: 'Open Text',
                desc: 'Free-form text response (250-1000 chars)',
                use: 'Qualitative insights and examples.',
                example: 'Describe a situation where this person demonstrated leadership'
              },
              {
                type: 'multi_choice',
                name: 'Multiple Choice',
                desc: 'Select from predefined options',
                use: 'Categorical assessments or frequency indicators.',
                example: 'How often do you collaborate with this person?'
              },
              {
                type: 'scale',
                name: 'Likert Scale',
                desc: 'Agreement scale (Strongly Disagree to Strongly Agree)',
                use: 'Opinion or perception questions.',
                example: 'This person consistently meets deadlines'
              }
            ].map((qt) => (
              <div key={qt.type} className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">{qt.type}</Badge>
                  <span className="font-semibold">{qt.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{qt.desc}</p>
                <p className="text-xs"><span className="font-medium">Use Case:</span> {qt.use}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">"{qt.example}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question-Rater Visibility Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid3X3 className="h-5 w-5" />
            Question-Rater Visibility Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The visibility matrix controls which questions are shown to each rater category.
            Access via the "Question Matrix" tab in the Question Bank screen.
          </p>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Question</TableHead>
                  <TableHead className="text-center">Manager</TableHead>
                  <TableHead className="text-center">Peer</TableHead>
                  <TableHead className="text-center">Direct Report</TableHead>
                  <TableHead className="text-center">Self</TableHead>
                  <TableHead className="text-center">External</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { q: 'Leadership: Inspires and motivates team', mgr: true, peer: true, dr: true, self: true, ext: false },
                  { q: 'Communication: Explains complex ideas clearly', mgr: true, peer: true, dr: true, self: true, ext: true },
                  { q: 'Strategy: Aligns work with business goals', mgr: true, peer: false, dr: false, self: true, ext: false },
                  { q: 'Teamwork: Collaborates effectively with others', mgr: true, peer: true, dr: true, self: true, ext: true },
                  { q: 'Technical: Demonstrates domain expertise', mgr: true, peer: true, dr: false, self: true, ext: false },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs">{row.q}</TableCell>
                    <TableCell className="text-center">
                      <CheckCircle2 className={`h-4 w-4 mx-auto ${row.mgr ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckCircle2 className={`h-4 w-4 mx-auto ${row.peer ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckCircle2 className={`h-4 w-4 mx-auto ${row.dr ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckCircle2 className={`h-4 w-4 mx-auto ${row.self ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                    </TableCell>
                    <TableCell className="text-center">
                      <CheckCircle2 className={`h-4 w-4 mx-auto ${row.ext ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
            <span className="font-medium">Tip:</span> Use the "Bulk Select" option to quickly enable/disable all 
            questions for a category. Questions can also have display order overrides per category.
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Add a Question to the Bank</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Performance → Setup → 360 Feedback → Question Bank', result: 'Displays question list with search/filter' },
              { step: 2, action: 'Click "Add Question" button', result: 'Opens question creation form' },
              { step: 3, action: 'Enter question text (primary language)', result: 'Required field, max 500 characters' },
              { step: 4, action: '(Optional) Add translations for multi-language support', result: 'Click "Add Translation" for each language' },
              { step: 5, action: 'Select question type (rating, text, multi_choice, scale)', result: 'Determines response format' },
              { step: 6, action: '(Optional) Link to competency', result: 'Enables signal alignment and competency-based reports' },
              { step: 7, action: 'Assign signal category for AI processing', result: 'leadership, teamwork, technical, values, or general' },
              { step: 8, action: 'Set display order and category group', result: 'Controls position and grouping in form' },
              { step: 9, action: '(Optional) Add help text for raters', result: 'Guidance shown below question' },
              { step: 10, action: 'Save question and configure visibility matrix', result: 'Assign to rater categories' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sample Question Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                category: 'Leadership',
                questions: [
                  'Provides clear direction and expectations for the team',
                  'Empowers others to make decisions within their scope',
                  'Handles conflict constructively and fairly',
                  'Creates an environment where people feel safe to share ideas'
                ]
              },
              {
                category: 'Communication',
                questions: [
                  'Listens actively and considers others\' viewpoints',
                  'Communicates clearly in written and verbal form',
                  'Provides timely and constructive feedback',
                  'Keeps stakeholders informed of relevant developments'
                ]
              },
              {
                category: 'Collaboration',
                questions: [
                  'Works effectively with people across different teams',
                  'Shares knowledge and expertise willingly',
                  'Builds and maintains positive working relationships',
                  'Contributes to a supportive team environment'
                ]
              },
              {
                category: 'Results & Execution',
                questions: [
                  'Delivers high-quality work on time',
                  'Takes ownership and follows through on commitments',
                  'Adapts approach when circumstances change',
                  'Balances short-term needs with long-term goals'
                ]
              }
            ].map((cat) => (
              <div key={cat.category} className="p-4 rounded-lg border">
                <h4 className="font-semibold mb-2">{cat.category}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {cat.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Question Count:</strong> 15-40 questions per cycle targeting 5-7 minute completion time</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Rating vs Text Ratio:</strong> 70-80% rating questions, 20-30% open text for qualitative depth</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Competency Linking:</strong> Link at least 80% of rating questions to competencies for signal alignment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Category Grouping:</strong> Group questions by competency area for logical flow</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Rater Differentiation:</strong> Manager questions may include strategic items; peer questions focus on collaboration</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong>Open Text Placement:</strong> Place text questions at end of each section or form</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                issue: 'Question not appearing in feedback form',
                cause: 'Question is_active = false or not assigned to rater category in matrix',
                solution: 'Verify is_active flag and check Question Matrix assignments'
              },
              {
                issue: 'Competency link not working',
                cause: 'Competency is inactive or deleted',
                solution: 'Re-link to active competency or mark question as general'
              },
              {
                issue: 'Signal not being generated',
                cause: 'Missing signal_category assignment or no responses',
                solution: 'Assign signal_category and verify responses exist'
              },
              {
                issue: 'Question order incorrect in form',
                cause: 'display_order conflicts or category_group mismatch',
                solution: 'Re-sequence display_order values; ensure unique per question'
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-amber-300 bg-white dark:bg-background">
                <div className="font-medium text-sm">{item.issue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Cause:</span> {item.cause}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Solution:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Clock, RefreshCw, Shuffle, CheckCircle } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndSetupQuizzes() {
  const learningObjectives = [
    'Create assessments with various question types',
    'Configure passing scores and attempt limits',
    'Set up time limits and question randomization',
    'Link quizzes to courses and lessons',
    'Understand quiz result handling and feedback options'
  ];

  const quizFields: FieldDefinition[] = [
    {
      name: 'course_id',
      required: true,
      type: 'uuid',
      description: 'Reference to associated course'
    },
    {
      name: 'title',
      required: true,
      type: 'text',
      description: 'Quiz title displayed to learners',
      validation: '3-200 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Quiz instructions and guidelines for learners',
      validation: 'Maximum 1000 characters'
    },
    {
      name: 'passing_score',
      required: true,
      type: 'number',
      description: 'Minimum percentage score required to pass',
      defaultValue: '70',
      validation: '0-100'
    },
    {
      name: 'time_limit_minutes',
      required: false,
      type: 'number',
      description: 'Maximum time allowed to complete quiz (null = unlimited)',
      defaultValue: 'null',
      validation: 'Integer > 0 or null'
    },
    {
      name: 'max_attempts',
      required: false,
      type: 'number',
      description: 'Maximum number of attempts allowed (null = unlimited)',
      defaultValue: 'null',
      validation: 'Integer > 0 or null'
    },
    {
      name: 'shuffle_questions',
      required: true,
      type: 'boolean',
      description: 'Randomize question order for each attempt',
      defaultValue: 'false'
    },
    {
      name: 'shuffle_options',
      required: false,
      type: 'boolean',
      description: 'Randomize answer options within each question',
      defaultValue: 'false'
    },
    {
      name: 'show_correct_answers',
      required: true,
      type: 'boolean',
      description: 'Display correct answers after submission',
      defaultValue: 'true'
    },
    {
      name: 'show_explanations',
      required: false,
      type: 'boolean',
      description: 'Display answer explanations after submission',
      defaultValue: 'true'
    },
    {
      name: 'allow_review',
      required: false,
      type: 'boolean',
      description: 'Allow learners to review answers before submitting',
      defaultValue: 'true'
    },
    {
      name: 'is_published',
      required: true,
      type: 'boolean',
      description: 'Controls quiz availability',
      defaultValue: 'false'
    }
  ];

  const questionFields: FieldDefinition[] = [
    {
      name: 'quiz_id',
      required: true,
      type: 'uuid',
      description: 'Reference to parent quiz'
    },
    {
      name: 'question_text',
      required: true,
      type: 'text',
      description: 'The question prompt displayed to learners',
      validation: 'Maximum 2000 characters, supports rich text'
    },
    {
      name: 'question_type',
      required: true,
      type: 'enum',
      description: 'Type of question: multiple_choice, true_false, multi_select',
      defaultValue: 'multiple_choice'
    },
    {
      name: 'options',
      required: true,
      type: 'json',
      description: 'Array of answer options',
      validation: '2-6 options for multiple choice'
    },
    {
      name: 'correct_answer',
      required: true,
      type: 'json',
      description: 'Correct answer(s) - single value or array for multi_select'
    },
    {
      name: 'points',
      required: true,
      type: 'number',
      description: 'Points awarded for correct answer',
      defaultValue: '1',
      validation: 'Integer > 0'
    },
    {
      name: 'display_order',
      required: true,
      type: 'number',
      description: 'Question sequence (ignored if shuffle enabled)',
      defaultValue: '0'
    },
    {
      name: 'explanation',
      required: false,
      type: 'text',
      description: 'Explanation shown after submission (if enabled)',
      validation: 'Maximum 1000 characters'
    },
    {
      name: 'hint',
      required: false,
      type: 'text',
      description: 'Optional hint available during quiz',
      validation: 'Maximum 500 characters'
    }
  ];

  const questionTypes = [
    {
      type: 'multiple_choice',
      description: 'Single correct answer from multiple options',
      optionsFormat: '["Option A", "Option B", "Option C", "Option D"]',
      answerFormat: '"Option B" (single string)',
      useCase: 'Factual knowledge, concept recognition, best-answer scenarios'
    },
    {
      type: 'true_false',
      description: 'Binary choice question',
      optionsFormat: '["True", "False"]',
      answerFormat: '"True" or "False"',
      useCase: 'Fact verification, quick knowledge checks, policy confirmations'
    },
    {
      type: 'multi_select',
      description: 'Multiple correct answers allowed',
      optionsFormat: '["Option A", "Option B", "Option C", "Option D"]',
      answerFormat: '["Option A", "Option C"] (array)',
      useCase: 'Comprehensive understanding, selecting all applicable items'
    }
  ];

  const createQuizSteps: Step[] = [
    {
      title: 'Navigate to Quiz Management',
      description: 'Go to Admin → LMS Management → Quizzes tab.',
      expectedResult: 'Quiz list displays with Add Quiz button'
    },
    {
      title: 'Click Add Quiz',
      description: 'Click the "Add Quiz" button to open the quiz creation form.',
      expectedResult: 'Quiz creation dialog opens'
    },
    {
      title: 'Select Associated Course',
      description: 'Choose the course this quiz will assess.',
      notes: ['Quizzes must be linked to a course for proper tracking']
    },
    {
      title: 'Enter Quiz Title',
      description: 'Write a clear title indicating the assessment purpose.',
      substeps: [
        '"Module 1 Knowledge Check" for module quizzes',
        '"Final Assessment" for course completion tests',
        '"Certification Exam" for formal certifications'
      ]
    },
    {
      title: 'Write Instructions',
      description: 'Provide clear instructions for learners taking the quiz.',
      substeps: [
        'Number of questions and estimated time',
        'Passing score requirement',
        'Allowed attempts and resources',
        'What happens on pass/fail'
      ]
    },
    {
      title: 'Set Passing Score',
      description: 'Configure the minimum percentage to pass.',
      notes: [
        '70% - Standard knowledge checks',
        '80% - Important compliance topics',
        '85-90% - Certifications and critical skills'
      ]
    },
    {
      title: 'Configure Time Limit (Optional)',
      description: 'Set maximum time allowed for quiz completion.',
      substeps: [
        'Allow 2-3 minutes per question as baseline',
        'Add extra time for complex scenarios',
        'Leave blank for untimed quizzes'
      ]
    },
    {
      title: 'Set Attempt Limits',
      description: 'Configure maximum number of attempts allowed.',
      notes: [
        'Unlimited attempts for practice quizzes',
        '2-3 attempts for formal assessments',
        '1-2 attempts for certifications'
      ]
    },
    {
      title: 'Configure Randomization',
      description: 'Enable shuffle options to prevent memorization.',
      substeps: [
        'Shuffle questions - recommended for most quizzes',
        'Shuffle options - prevents position-based memorization'
      ]
    },
    {
      title: 'Set Feedback Options',
      description: 'Configure what learners see after submission.',
      substeps: [
        'Show correct answers - enable for learning quizzes',
        'Show explanations - enhances learning value',
        'Hide answers for security-sensitive certifications'
      ]
    },
    {
      title: 'Save Quiz',
      description: 'Save the quiz configuration before adding questions.',
      expectedResult: 'Quiz created, "Manage Questions" button available'
    }
  ];

  const addQuestionsSteps: Step[] = [
    {
      title: 'Open Question Management',
      description: 'From the quiz list, click "Manage Questions" for your quiz.',
      expectedResult: 'Question editor opens'
    },
    {
      title: 'Click Add Question',
      description: 'Click "Add Question" to create a new question.',
      expectedResult: 'Question form opens'
    },
    {
      title: 'Enter Question Text',
      description: 'Write a clear, unambiguous question.',
      substeps: [
        'Avoid double negatives',
        'Keep questions focused on single concepts',
        'Use consistent terminology from course content'
      ]
    },
    {
      title: 'Select Question Type',
      description: 'Choose the appropriate question format.',
      notes: ['Multiple choice most common; multi_select for "select all that apply"']
    },
    {
      title: 'Add Answer Options',
      description: 'Enter all answer choices.',
      substeps: [
        'Use 4 options for multiple choice (3-6 acceptable)',
        'Make distractors plausible but clearly incorrect',
        'Avoid "all of the above" and "none of the above"'
      ]
    },
    {
      title: 'Mark Correct Answer(s)',
      description: 'Select the correct answer(s) for the question.',
      expectedResult: 'Correct answer highlighted or checked'
    },
    {
      title: 'Set Point Value',
      description: 'Assign points for correct answer (default 1).',
      notes: ['Use higher points for complex questions']
    },
    {
      title: 'Add Explanation (Recommended)',
      description: 'Write an explanation shown after submission.',
      substeps: [
        'Explain why the correct answer is right',
        'Note why common wrong answers are incorrect',
        'Reference course material for review'
      ]
    },
    {
      title: 'Save and Repeat',
      description: 'Save the question and add more as needed.',
      expectedResult: 'Question appears in question list'
    }
  ];

  const quizExamples: ExampleConfig[] = [
    {
      title: 'Module Knowledge Check',
      context: 'Quick assessment after completing a learning module',
      values: [
        { field: 'Title', value: 'Module 1: Introduction - Knowledge Check' },
        { field: 'Questions', value: '5 questions' },
        { field: 'Passing Score', value: '70%' },
        { field: 'Time Limit', value: 'None' },
        { field: 'Attempts', value: 'Unlimited' },
        { field: 'Shuffle', value: 'Questions only' },
        { field: 'Show Answers', value: 'Yes, with explanations' }
      ],
      outcome: 'Low-stakes assessment that reinforces learning without creating anxiety'
    },
    {
      title: 'Course Final Assessment',
      context: 'Comprehensive test for course completion verification',
      values: [
        { field: 'Title', value: 'GDPR Training - Final Assessment' },
        { field: 'Questions', value: '20 questions' },
        { field: 'Passing Score', value: '80%' },
        { field: 'Time Limit', value: '30 minutes' },
        { field: 'Attempts', value: '3' },
        { field: 'Shuffle', value: 'Questions and options' },
        { field: 'Show Answers', value: 'After all attempts exhausted' }
      ],
      outcome: 'Formal assessment that validates knowledge before certification'
    },
    {
      title: 'Certification Exam',
      context: 'High-stakes exam for professional certification',
      values: [
        { field: 'Title', value: 'Safety Manager Certification Exam' },
        { field: 'Questions', value: '50 questions' },
        { field: 'Passing Score', value: '85%' },
        { field: 'Time Limit', value: '60 minutes' },
        { field: 'Attempts', value: '2' },
        { field: 'Shuffle', value: 'Questions and options' },
        { field: 'Show Answers', value: 'No (exam security)' }
      ],
      outcome: 'Secure, proctored-style exam for formal credentials'
    }
  ];

  const quizRules: BusinessRule[] = [
    {
      rule: 'Quizzes require at least one question',
      enforcement: 'System',
      description: 'A quiz cannot be published without at least one valid question.'
    },
    {
      rule: 'Time limit enforced with grace period',
      enforcement: 'System',
      description: 'Quiz auto-submits 30 seconds after time expires to allow for network latency.'
    },
    {
      rule: 'Attempt count persists across sessions',
      enforcement: 'System',
      description: 'Incomplete attempts count toward max_attempts. Learners can resume in-progress quizzes.'
    },
    {
      rule: 'Passing score triggers completion events',
      enforcement: 'System',
      description: 'Achieving passing score fires course completion events, triggers certificates, and updates progress.'
    },
    {
      rule: 'Question edits void in-progress attempts',
      enforcement: 'Policy',
      description: 'Modifying published quiz questions should reset any incomplete attempts for fairness.'
    },
    {
      rule: 'Multi-select scoring is all-or-nothing',
      enforcement: 'System',
      description: 'Multi-select questions require all correct answers and no incorrect answers to earn points.'
    }
  ];

  return (
    <section id="sec-2-5" data-manual-anchor="sec-2-5" className="space-y-6">
      <h2 className="text-2xl font-bold">2.5 Quiz Configuration</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Quizzes validate learner knowledge and drive engagement. Well-designed assessments 
        reinforce learning, identify knowledge gaps, and provide documentation for compliance. 
        This section covers quiz configuration; linking quizzes to lessons is covered in Section 2.4.
      </p>

      <FieldReferenceTable 
        fields={quizFields} 
        title="lms_quizzes Table Schema" 
      />

      <FieldReferenceTable 
        fields={questionFields} 
        title="lms_quiz_questions Table Schema" 
      />

      {/* Question Type Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Question Type Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Type</TableHead>
                  <TableHead className="font-medium">Description</TableHead>
                  <TableHead className="font-medium">Options Format</TableHead>
                  <TableHead className="font-medium">Answer Format</TableHead>
                  <TableHead className="font-medium">Best For</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questionTypes.map((qt, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant="outline">{qt.type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{qt.description}</TableCell>
                    <TableCell className="text-xs font-mono">{qt.optionsFormat}</TableCell>
                    <TableCell className="text-xs font-mono">{qt.answerFormat}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{qt.useCase}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={createQuizSteps} 
        title="Creating a Quiz" 
      />

      <StepByStep 
        steps={addQuestionsSteps} 
        title="Adding Quiz Questions" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.5.1: Quiz Configuration Interface"
        alt="Quiz management screen showing settings and question list"
      />

      <ConfigurationExample 
        examples={quizExamples}
        title="Quiz Configuration Examples"
      />

      <WarningCallout title="Exam Security">
        For certification exams, disable "Show Correct Answers" to maintain exam integrity. 
        Consider using question pools with random selection to prevent answer sharing between 
        learners. Time limits and attempt restrictions also enhance security.
      </WarningCallout>

      <BusinessRules 
        rules={quizRules}
        title="Quiz Business Rules"
      />

      {/* Quiz Scoring Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Scoring Calculation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Score Calculation</div>
              <div className="text-sm text-muted-foreground mt-1">
                Score = (Points Earned / Total Points) × 100%
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Example: 8 correct × 1 point = 8 points / 10 total = 80%
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Pass/Fail Determination</div>
              <div className="text-sm text-muted-foreground mt-1">
                Status = Score ≥ Passing Score ? "Passed" : "Failed"
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout title="Quiz Design Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Write questions that test understanding, not memorization</li>
          <li>• Include explanations for every question to enhance learning</li>
          <li>• Aim for 5-10 questions for knowledge checks, 20-30 for final assessments</li>
          <li>• Test your quiz with colleagues before publishing</li>
          <li>• Review quiz analytics to identify confusing questions</li>
          <li>• Update questions based on common incorrect answers</li>
        </ul>
      </TipCallout>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, MessageSquare, Star, Brain, Save, Send, Target, Briefcase, Heart } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';

const EVALUATION_STEPS = [
  {
    title: 'Access Pending Evaluations',
    description: 'Navigate to your team appraisal dashboard via MSS.',
    substeps: [
      'Go to MSS → Team Appraisals (or /mss/appraisals)',
      'View the Overview tab with TeamAppraisalSummaryCard',
      'Filter by "Pending My Review" using DirectReportsAppraisalStatus',
      'Select the employee to evaluate from Quick Actions'
    ],
    expectedResult: 'Employee evaluation form opens with their self-assessment visible'
  },
  {
    title: 'Review Self-Assessment',
    description: 'Read and understand the employee self-ratings and comments.',
    substeps: [
      'Review each goal self-rating and evidence',
      'Check responsibility/KRA self-ratings',
      'Read competency self-assessments',
      'Review values self-ratings (if enabled)',
      'Note areas of agreement or disagreement'
    ],
    expectedResult: 'Clear understanding of employee perspective before rating'
  },
  {
    title: 'Rate Goals',
    description: 'Evaluate each goal with evidence-based ratings.',
    substeps: [
      'Select rating for each goal using the scale',
      'Provide specific examples supporting your rating',
      'Add constructive comments for improvement',
      'Consider partial achievement scenarios'
    ],
    expectedResult: 'All goals rated with supporting comments'
  },
  {
    title: 'Rate Responsibilities (KRAs)',
    description: 'Evaluate key responsibility area achievement.',
    substeps: [
      'Review each responsibility from job profile',
      'Rate each KRA based on target achievement',
      'Compare actual results against metrics',
      'Document specific accomplishments or gaps'
    ],
    expectedResult: 'All KRAs rated with documentation'
  },
  {
    title: 'Rate Competencies',
    description: 'Assess behavioral indicators at appropriate proficiency levels.',
    substeps: [
      'Review each competency and its behavioral indicators',
      'Select the demonstrated proficiency level',
      'Provide specific behavioral examples',
      'Consider both strengths and development areas'
    ],
    expectedResult: 'All competencies rated with behavioral evidence'
  },
  {
    title: 'Rate Values',
    description: 'Assess alignment with organizational values.',
    substeps: [
      'Review each company value',
      'Rate based on observed behaviors over the period',
      'Provide examples of value demonstration',
      'Note any concerns about cultural alignment'
    ],
    expectedResult: 'All values rated (if enabled for cycle)'
  },
  {
    title: 'Use AI Feedback Assistant',
    description: 'Generate AI-powered feedback suggestions.',
    substeps: [
      'Click "AI Assist" button',
      'Review generated strength statements',
      'Review development suggestions',
      'Edit and personalize the suggestions',
      'Accept or modify AI recommendations'
    ],
    expectedResult: 'AI-generated feedback incorporated and personalized'
  },
  {
    title: 'Review Comment Quality',
    description: 'Check AI-powered quality score and improve if needed.',
    substeps: [
      'View the comment quality indicator',
      'Address any flagged issues (vague language, bias)',
      'Ensure comments are specific and actionable',
      'Aim for quality score of 80% or higher'
    ],
    expectedResult: 'All comments meet quality standards'
  },
  {
    title: 'Add Overall Comments',
    description: 'Summarize performance and development focus.',
    substeps: [
      'Write overall performance summary',
      'Highlight top 2-3 achievements',
      'Identify 1-2 priority development areas',
      'Set expectations for next period'
    ],
    expectedResult: 'Comprehensive overall assessment completed'
  },
  {
    title: 'Save or Submit',
    description: 'Save draft or submit for finalization.',
    substeps: [
      'Click "Save Draft" to continue later, OR',
      'Click "Submit Evaluation" when complete',
      'Confirm submission in dialog',
      'Review submission confirmation'
    ],
    expectedResult: 'Evaluation saved or submitted successfully'
  },
  {
    title: 'Schedule Performance Interview',
    description: 'Book the performance discussion meeting.',
    substeps: [
      'Click "Schedule Interview"',
      'Select available time slots',
      'Add discussion agenda items',
      'Send calendar invitation'
    ],
    expectedResult: 'Interview scheduled with employee notified'
  }
];

const FIELDS = [
  { name: 'manager_overall_rating', required: true, type: 'Decimal', description: 'Calculated weighted average of all component ratings', validation: 'System-calculated, read-only' },
  { name: 'manager_goal_ratings', required: true, type: 'JSON', description: 'Individual ratings for each goal', validation: 'All assigned goals must be rated' },
  { name: 'manager_responsibility_ratings', required: true, type: 'JSON', description: 'Ratings for each KRA', validation: 'All required KRAs must be rated' },
  { name: 'manager_competency_ratings', required: true, type: 'JSON', description: 'Ratings for each competency', validation: 'All competencies must be rated' },
  { name: 'manager_value_ratings', required: false, type: 'JSON', description: 'Ratings for each value', validation: 'Required if values enabled' },
  { name: 'manager_comments', required: true, type: 'Text', description: 'Overall manager assessment', validation: 'Minimum 100 characters' },
  { name: 'comment_quality_score', required: false, type: 'Integer', description: 'AI-assessed quality of feedback', defaultValue: 'Auto-calculated' },
  { name: 'ai_suggestions_used', required: false, type: 'Boolean', description: 'Whether AI assistant was utilized', defaultValue: 'false' },
  { name: 'evaluation_status', required: true, type: 'Enum', description: 'Current state of evaluation', defaultValue: 'Not Started', validation: 'Not Started, In Progress, Submitted' },
  { name: 'submitted_at', required: false, type: 'Timestamp', description: 'When evaluation was finalized' }
];

const BUSINESS_RULES = [
  { rule: 'All components must be rated before submission', enforcement: 'System' as const, description: 'Cannot submit evaluation with missing ratings for any assigned component (G, R, C, V).' },
  { rule: 'Manager comments required for all ratings', enforcement: 'Policy' as const, description: 'Each rating must include supporting comments explaining the assessment.' },
  { rule: 'Extreme ratings require additional justification', enforcement: 'Policy' as const, description: 'Ratings at scale extremes (1 or 5) trigger mandatory extended comments.' },
  { rule: 'Self-assessment must be completed first', enforcement: 'System' as const, description: 'Manager evaluation form only unlocks after employee submits self-assessment.' },
  { rule: 'Evaluation window: 2-4 weeks after self-assessment', enforcement: 'Advisory' as const, description: 'Recommended timeframe to ensure timely feedback while allowing thorough review.' }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot access employee evaluation form', cause: 'Employee has not completed self-assessment or you are not assigned as evaluator.', solution: 'Check participant enrollment to verify evaluator assignment. Send reminder to employee if self-assessment pending.' },
  { issue: 'AI Feedback Assistant not generating suggestions', cause: 'Insufficient rating data or comments entered.', solution: 'Complete at least 3 goal ratings with comments before using AI Assistant.' },
  { issue: 'Comment quality score too low', cause: 'Comments contain vague language, bias indicators, or lack specificity.', solution: 'Review the flagged issues in the quality panel. Replace generic phrases with specific examples.' },
  { issue: 'Cannot submit - validation errors', cause: 'Missing required fields or business rule violations.', solution: 'Review all highlighted errors. Ensure all components (Goals, Responsibilities, Competencies, Values) are rated and comments meet minimum requirements.' }
];

export function WorkflowManagerEvaluation() {
  return (
    <Card id="sec-3-7">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.7</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~18 min read</Badge>
          <Badge className="gap-1 bg-green-600 text-white"><Users className="h-3 w-3" />Manager</Badge>
        </div>
        <CardTitle className="text-2xl">Manager Evaluation Workflow</CardTitle>
        <CardDescription>Complete guide for managers conducting performance evaluations across all CRGV components (2-4 week window)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-3']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Complete a thorough performance evaluation covering all CRGV components</li>
            <li>Utilize AI-powered feedback assistance effectively</li>
            <li>Write high-quality, actionable performance comments</li>
            <li>Schedule and prepare for performance discussions</li>
          </ul>
        </div>

        {/* Interactive Workflow Diagram */}
        <WorkflowDiagram 
          title="Manager Evaluation Workflow"
          description="Complete CRGV evaluation flow covering all appraisal components"
          diagram={`flowchart LR
    subgraph Employee["👤 Employee"]
        A[Submit Self-Assessment]
    end
    
    subgraph Manager["👔 Manager Actions"]
        B[Review Self-Assessment] --> C[Rate Goals]
        C --> D[Rate Responsibilities/KRAs]
        D --> E[Rate Competencies]
        E --> F[Rate Values]
        F --> G[Use AI Assistant]
        G --> H[Write Comments]
        H --> I{Save or Submit?}
        I -->|Save| J[Draft Saved]
        I -->|Submit| K[Submit Evaluation]
        J --> I
        K --> L[Schedule Interview]
    end
    
    subgraph System["⚙️ System"]
        M[Calculate CRGV Scores]
        N[Quality Check]
        O[Notify Employee]
    end
    
    A -->|Unlocks Form| B
    G --> N
    K --> M
    L --> O`}
        />

        {/* Evaluation Components Checklist */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">CRGV Evaluation Components</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { icon: Target, label: 'Rate Goals', time: '20-30 min', code: 'G', color: 'text-blue-600' },
              { icon: Briefcase, label: 'Rate Responsibilities/KRAs', time: '15-20 min', code: 'R', color: 'text-orange-600' },
              { icon: CheckCircle, label: 'Assess Competencies', time: '15-20 min', code: 'C', color: 'text-green-600' },
              { icon: Heart, label: 'Assess Values', time: '10-15 min', code: 'V', color: 'text-pink-600' },
              { icon: Brain, label: 'Use AI Feedback Tools', time: '5-10 min', code: 'AI', color: 'text-purple-600' },
              { icon: Send, label: 'Submit & Schedule Interview', time: '5-10 min', code: '✓', color: 'text-teal-600' }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="flex-1">{item.label}</span>
                <Badge variant="outline" className="text-xs">{item.code}</Badge>
                <Badge variant="secondary" className="text-xs">{item.time}</Badge>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Total estimated time: 70-105 minutes per evaluation</p>
        </div>

        <NoteCallout title="Prerequisite">
          Complete Section 3.4 (Self-Assessment Process) to understand what employees see. This context improves your evaluation quality.
        </NoteCallout>

        <StepByStep steps={EVALUATION_STEPS} title="11-Step Evaluation Process" />

        {/* AI Assistant Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Feedback Assistant Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { feature: 'Strength Statements', desc: 'AI generates positive feedback based on high-rated areas', example: '"Consistently exceeded targets in Q3, demonstrating strong analytical skills"' },
              { feature: 'Development Suggestions', desc: 'Constructive recommendations for improvement areas', example: '"Consider delegating routine tasks to focus on strategic initiatives"' },
              { feature: 'Bias Detection', desc: 'Flags potentially biased language in comments', example: 'Alerts on gendered language or subjective qualifiers' },
              { feature: 'Quality Scoring', desc: 'Real-time assessment of comment specificity and actionability', example: 'Scores comments 0-100% with improvement tips' }
            ].map((item) => (
              <Card key={item.feature} className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-foreground">{item.feature}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">Example: {item.example}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <TipCallout title="Writing Effective Comments">
          Use the STAR method: Situation, Task, Action, Result. This structure ensures comments are specific and evidence-based rather than vague opinions.
        </TipCallout>

        <WarningCallout title="Bias Awareness">
          The system monitors for recency bias, halo effect, and comparison language. Address flagged issues before submission to ensure fair evaluations.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Evaluation Record Fields" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

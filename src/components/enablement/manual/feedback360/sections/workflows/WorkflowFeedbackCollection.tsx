import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { MessageSquare, Save, Send, Clock } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand the feedback submission process from rater perspective',
  'Configure save-as-draft and auto-save functionality',
  'Manage question navigation and progress tracking',
  'Handle deadline extensions and late submission policies',
  'Process submission validation and confirmation'
];

const COLLECTION_DIAGRAM = `
flowchart TD
    subgraph Access["Rater Access"]
        A[Rater Opens Request] --> B{First Time?}
        B -->|Yes| C[Start New Response]
        B -->|No| D[Load Saved Draft]
        C --> E[Question Form]
        D --> E
    end
    
    subgraph Response["Response Entry"]
        E --> F[View Question]
        F --> G[Select Rating]
        G --> H{Comments Required?}
        H -->|Yes| I[Enter Comments]
        H -->|No| J[Optional Comments]
        I --> K[Auto-Save Triggered]
        J --> K
        K --> L{More Questions?}
        L -->|Yes| M[Navigate Next]
        M --> F
        L -->|No| N[Review All Responses]
    end
    
    subgraph Submission["Final Submission"]
        N --> O{All Required Complete?}
        O -->|No| P[Show Validation Errors]
        P --> F
        O -->|Yes| Q[Confirm Submission]
        Q --> R[Submit Feedback]
        R --> S[Confirmation Page]
        S --> T[Email Confirmation]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style R fill:#10b981,stroke:#059669,color:#fff
    style P fill:#f59e0b,stroke:#d97706
`;

const RESPONSE_FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'uuid',
    description: 'Unique identifier for this response',
    defaultValue: 'gen_random_uuid()',
    validation: '—'
  },
  {
    name: 'request_id',
    required: true,
    type: 'uuid',
    description: 'Reference to feedback_360_requests',
    defaultValue: '—',
    validation: 'Must reference valid request'
  },
  {
    name: 'question_id',
    required: true,
    type: 'uuid',
    description: 'The question being answered',
    defaultValue: '—',
    validation: 'Must be valid question for rater type'
  },
  {
    name: 'rating_value',
    required: false,
    type: 'integer',
    description: 'Numeric rating (e.g., 1-5)',
    defaultValue: '—',
    validation: 'Within scale range'
  },
  {
    name: 'text_response',
    required: false,
    type: 'text',
    description: 'Open-text comment or explanation',
    defaultValue: '—',
    validation: 'Max 2000 characters'
  },
  {
    name: 'selected_choices',
    required: false,
    type: 'jsonb',
    description: 'Selected options for multi-choice questions',
    defaultValue: '[]',
    validation: 'Array of choice IDs'
  },
  {
    name: 'is_draft',
    required: true,
    type: 'boolean',
    description: 'Whether response is in draft state',
    defaultValue: 'true',
    validation: 'false only after submission'
  },
  {
    name: 'last_saved_at',
    required: true,
    type: 'timestamp',
    description: 'When response was last auto-saved',
    defaultValue: 'now()',
    validation: 'Updated on each save'
  },
  {
    name: 'submitted_at',
    required: false,
    type: 'timestamp',
    description: 'When response was finalized',
    defaultValue: '—',
    validation: 'Set on final submission'
  }
];

const RATER_STEPS: Step[] = [
  {
    title: 'Access Feedback Form',
    description: 'Rater opens their assigned feedback request.',
    substeps: [
      'Rater clicks link from notification email or navigates to My Performance → 360 Feedback',
      'System displays list of pending feedback requests',
      'Rater selects the participant to provide feedback for',
      'System loads question set for rater\'s relationship type'
    ],
    expectedResult: 'Feedback form opens with questions appropriate for rater type'
  },
  {
    title: 'Navigate Questions',
    description: 'Work through the feedback questionnaire.',
    substeps: [
      'Questions displayed one at a time or in sections',
      'Progress indicator shows completion percentage',
      'Use Previous/Next buttons to navigate',
      'Can jump to specific section via progress bar',
      'Required questions marked with asterisk'
    ],
    expectedResult: 'Rater can navigate freely between questions'
  },
  {
    title: 'Provide Ratings',
    description: 'Select rating for each question.',
    substeps: [
      'View rating scale with behavioral anchors (if configured)',
      'Select appropriate rating level',
      'Hover over rating to see description/anchor',
      'Rating auto-saves after selection',
      'Can change rating before final submission'
    ],
    expectedResult: 'Ratings captured with visual confirmation'
  },
  {
    title: 'Enter Comments',
    description: 'Provide qualitative feedback.',
    substeps: [
      'For required comments: Must enter text before proceeding',
      'For optional comments: Can skip or add later',
      'Character counter shows remaining space',
      'Auto-save triggers after pause in typing',
      'Comments support basic formatting'
    ],
    expectedResult: 'Comments captured with auto-save confirmation'
  },
  {
    title: 'Review and Submit',
    description: 'Finalize feedback before deadline.',
    substeps: [
      'Click "Review" to see all responses',
      'System validates all required fields complete',
      'Review summary shows ratings and comments',
      'Click "Submit Feedback" to finalize',
      'Confirmation message and email sent',
      'Note: Cannot edit after submission'
    ],
    expectedResult: 'Feedback submitted, request status updated to "submitted"'
  }
];

const HR_STEPS: Step[] = [
  {
    title: 'Monitor Collection Progress',
    description: 'Track feedback submission across the cycle.',
    substeps: [
      'Navigate to cycle → "Response Monitoring" tab',
      'View overall completion percentage',
      'Filter by participant, rater type, or status',
      'Identify at-risk submissions (started but not complete)',
      'Check days remaining until deadline'
    ],
    expectedResult: 'Clear view of collection progress with actionable insights'
  },
  {
    title: 'Extend Deadlines (if needed)',
    description: 'Grant extensions for legitimate requests.',
    substeps: [
      'Receive extension request from participant or rater',
      'Evaluate business justification',
      'For individual extension: Edit request due_date',
      'For cycle-wide extension: Edit cycle end_date',
      'Notify affected parties of new deadline'
    ],
    expectedResult: 'Deadline extended with audit trail'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Rater cannot find their feedback request',
    cause: 'Request may be in different status (completed, declined) or rater looking in wrong place',
    solution: 'Check request status in admin view. Ensure rater is looking in "Pending Feedback" section. Verify correct participant.'
  },
  {
    issue: 'Auto-save not working',
    cause: 'Network connectivity issues or session timeout',
    solution: 'Verify network connection. Refresh page and log in again if needed. Data should persist from last auto-save point.'
  },
  {
    issue: 'Cannot submit - validation errors',
    cause: 'Required questions not answered or comments missing where required',
    solution: 'Review all questions marked with asterisk. Check comment requirements. Use review page to identify gaps.'
  },
  {
    issue: 'Submitted feedback but want to make changes',
    cause: 'Feedback is locked after submission by design',
    solution: 'Contact HR. In exceptional cases, HR can reset request status to allow re-submission (with audit trail).'
  }
];

export function WorkflowFeedbackCollection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.7</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">Rater</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Feedback Collection Window
        </CardTitle>
        <CardDescription>
          Response submission, save-as-draft, question navigation, and deadline management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['My Performance', '360 Feedback', 'Pending Feedback', '[Participant Name]']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Feedback Response Collection Flow"
          description="Complete rater journey from initial access through final submission"
          diagram={COLLECTION_DIAGRAM}
        />

        {/* Key Features */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Save className="h-4 w-4" />
            Collection Features
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Auto-Save</h5>
              <p className="text-sm text-muted-foreground">
                Responses auto-save every 30 seconds and on navigation. Raters can close and return
                without losing progress.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Progress Tracking</h5>
              <p className="text-sm text-muted-foreground">
                Visual progress bar shows completion percentage. Color coding indicates required
                vs optional questions remaining.
              </p>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h5 className="font-medium">Mobile Responsive</h5>
              <p className="text-sm text-muted-foreground">
                Feedback form works on mobile devices. Raters can provide feedback from anywhere,
                improving response rates.
              </p>
            </div>
          </div>
        </div>

        <TipCallout title="Comment Quality">
          Encourage raters to provide specific, actionable comments with examples. Generic feedback
          like "good job" provides less value than specific observations about behaviors.
        </TipCallout>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-4">Rater Process</h4>
            <StepByStep steps={RATER_STEPS} title="" />
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">HR Monitoring Process</h4>
            <StepByStep steps={HR_STEPS} title="" />
          </div>
        </div>

        <FieldReferenceTable 
          fields={RESPONSE_FIELDS} 
          title="Database Fields (feedback_360_responses table)" 
        />

        <WarningCallout title="Submission is Final">
          Once feedback is submitted, it cannot be edited by the rater. This ensures data integrity
          and prevents pressure on raters to change responses. Only HR can reset a submission in
          exceptional circumstances.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

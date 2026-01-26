// Section 4.4: Manager Assessment Workflow
// Direct manager completion, response table, UI walkthrough

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IntegrationCallout,
  FieldReferenceTable,
  StepByStep,
} from '../../../components';
import { FieldDefinition } from '../../../components/FieldReferenceTable';
import { Step } from '../../../components/StepByStep';
import { 
  UserCheck, 
  FileText,
  Sliders,
  MessageSquare,
  CheckCircle2,
  Save,
  Send
} from 'lucide-react';

const responseFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the response record',
    defaultValue: 'Auto-generated',
    validation: 'System-assigned primary key'
  },
  {
    name: 'event_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to readiness_assessment_events linking response to the event',
    validation: 'Must reference active event'
  },
  {
    name: 'indicator_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to readiness_assessment_indicators identifying which indicator was rated',
    validation: 'Must be valid indicator on assigned form'
  },
  {
    name: 'assessor_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to profiles identifying who submitted the response',
    defaultValue: 'Current user',
    validation: 'Must be authorized assessor for event'
  },
  {
    name: 'assessor_type',
    required: true,
    type: 'Text',
    description: 'Role type of the assessor determining which indicators they assess',
    validation: "Enum: 'manager', 'hr', 'executive', 'skip_level'"
  },
  {
    name: 'rating',
    required: true,
    type: 'Integer',
    description: 'Numeric rating given to the indicator (typically 1-5 scale)',
    validation: 'Must be within indicator.rating_scale_min to indicator.rating_scale_max'
  },
  {
    name: 'comments',
    required: false,
    type: 'Text',
    description: 'Optional free-text justification or evidence for the rating',
    validation: 'Max 2000 characters'
  },
  {
    name: 'submitted_at',
    required: true,
    type: 'Timestamp',
    description: 'When the response was submitted (final save)',
    defaultValue: 'now() on submit',
    validation: 'System-assigned on submission'
  },
  {
    name: 'created_at',
    required: true,
    type: 'Timestamp',
    description: 'When the response record was first created (draft save)',
    defaultValue: 'now()',
    validation: 'System-assigned'
  }
];

const managerSteps: Step[] = [
  {
    title: 'Receive Assessment Task',
    description: 'Manager receives notification via HR Hub when assigned as an assessor.',
    substeps: [
      'Task appears in HR Hub → My Tasks',
      'Email notification sent if configured',
      'Mobile push notification if app installed'
    ],
    expectedResult: 'Task visible in My Tasks with candidate name and due date.'
  },
  {
    title: 'Navigate to Assessment Form',
    description: 'Click the task to open the ReadinessAssessmentForm component.',
    substeps: [
      'Click "Complete Assessment" in HR Hub',
      'Or: MSS → My Team → Succession → Pending Assessments',
      'Form loads with all categories in accordion layout'
    ],
    expectedResult: 'Form displays with category accordion, candidate info header, and progress tracker.'
  },
  {
    title: 'Review Candidate Information',
    description: 'The form header shows key candidate details for context.',
    substeps: [
      'Candidate name and current position',
      'Succession plan and target role',
      'Previous assessment score (if any)',
      'Form instructions and rating scale guide'
    ],
    notes: [
      'Take time to review the BARS tooltips before rating'
    ],
    expectedResult: 'Manager understands context before rating indicators.'
  },
  {
    title: 'Rate Indicators by Category',
    description: 'Expand each category accordion and rate the indicators using the slider.',
    substeps: [
      'Click category header to expand',
      'Use slider to select rating (1-5)',
      'Hover over BARS tooltip to see behavioral anchors',
      'Optionally add comments for each indicator'
    ],
    notes: [
      'BARS tooltips show expected behaviors for each rating level',
      'Comments are recommended for ratings of 1-2 or 4-5'
    ],
    expectedResult: 'Each indicator shows selected rating with optional comment.'
  },
  {
    title: 'Track Progress',
    description: 'The progress bar shows completion status as you rate indicators.',
    substeps: [
      'Progress bar updates in real-time: "X of Y indicators rated"',
      'Categories with all indicators rated show checkmark',
      'Submit button enables when all required indicators complete'
    ],
    expectedResult: 'Visual confirmation of assessment completion progress.'
  },
  {
    title: 'Save Draft (Optional)',
    description: 'Save work in progress without submitting if you need to pause.',
    substeps: [
      'Click "Save Draft" to preserve current ratings',
      'Responses saved to database with submitted_at = null',
      'Return later to continue from where you left off'
    ],
    notes: [
      'Drafts are visible only to the assessor who created them',
      'Draft responses are not included in score calculations'
    ],
    expectedResult: 'Draft saved; can be resumed from HR Hub task.'
  },
  {
    title: 'Submit Assessment',
    description: 'Finalize and submit all responses when complete.',
    substeps: [
      'Click "Submit Assessment" button',
      'Confirmation modal shows summary',
      'All responses get submitted_at timestamp',
      'Event status changes if this was the final assessor'
    ],
    expectedResult: 'Responses submitted with assessor_type = "manager". Task marked complete in HR Hub.'
  }
];

export function ReadinessManagerWorkflow() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the complete field structure of readiness_assessment_responses table",
          "Navigate the ReadinessAssessmentForm UI including category accordions and sliders",
          "Interpret BARS tooltips to provide consistent, objective ratings",
          "Differentiate between Save Draft and Submit behaviors"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          MSS → My Team → Succession → Pending Assessments → [Candidate Name]
        </code>
        <br />
        <span className="text-xs text-muted-foreground">Alternative:</span>
        <code className="text-xs bg-muted px-2 py-1 rounded ml-2">
          HR Hub → My Tasks → [Assessment Task]
        </code>
      </InfoCallout>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Field Reference: readiness_assessment_responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable 
            fields={responseFields} 
            title="Assessment Response Table Schema"
          />
        </CardContent>
      </Card>

      {/* UI Component Walkthrough */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            UI Component: ReadinessAssessmentForm
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The assessment form provides a structured interface for rating indicators:
          </p>

          {/* Form Layout Diagram */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">
{`┌─────────────────────────────────────────────────────────────────┐
│ [Candidate Header]                                              │
│   Jane Smith • Senior Manager → VP Operations                   │
│   Previous Score: 72% (Ready in 1-3 Years)                     │
├─────────────────────────────────────────────────────────────────┤
│ [Progress Bar]                                                  │
│   ████████░░░░░░░░░░░░  12 of 32 indicators rated              │
├─────────────────────────────────────────────────────────────────┤
│ ▼ Leadership Experience (4 indicators)              [✓ 4/4]    │
│   ├── Strategic Vision        [━━━━━━●━━━━] 4  💬 "Strong..."  │
│   ├── Team Development        [━━━━━━━━●━━] 5  💬              │
│   ├── Change Leadership       [━━━━●━━━━━━] 3  💬              │
│   └── Stakeholder Influence   [━━━━━━●━━━━] 4  💬              │
│                                                                 │
│ ► Functional Expertise (6 indicators)               [○ 2/6]    │
│ ► Organizational Knowledge (5 indicators)           [○ 0/5]    │
│ ► Mobility & Availability (4 indicators)            [○ 0/4]    │
│ ► Performance Track Record (5 indicators)           [✓ 5/5]    │
│ ► Development Readiness (4 indicators)              [○ 1/4]    │
│ ► Risk Factors (4 indicators)                       [○ 0/4]    │
├─────────────────────────────────────────────────────────────────┤
│ [Actions]                                                       │
│   [Save Draft]                      [Submit Assessment →]       │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sliders className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Slider Ratings</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Drag slider to select rating 1-5. Hover for BARS behavioral anchors.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Comments</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Click 💬 icon to add justification. Recommended for extreme ratings.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-sm">Category Status</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ✓ = all rated, ○ = partial/none. Expand to see details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Step-by-Step: Complete Manager Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={managerSteps} />
        </CardContent>
      </Card>

      {/* Draft vs Submit Behavior */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save Draft vs. Submit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Behavior</th>
                  <th className="text-left py-3 px-4 font-medium">Save Draft</th>
                  <th className="text-left py-3 px-4 font-medium">Submit</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">submitted_at</td>
                  <td className="py-3 px-4"><Badge variant="outline">null</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">Set to now()</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Editable</td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">Yes</Badge></td>
                  <td className="py-3 px-4"><Badge variant="destructive">No</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Included in Score</td>
                  <td className="py-3 px-4"><Badge variant="outline">No</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">Yes</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">HR Hub Task</td>
                  <td className="py-3 px-4"><Badge variant="outline">Remains Open</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">Marked Complete</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Event Status Change</td>
                  <td className="py-3 px-4"><Badge variant="outline">No Change</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-blue-600">May trigger in_progress</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expected Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-500" />
            Expected Results After Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-lg">
              <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">Database Changes</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• All responses have submitted_at timestamp</li>
                <li>• assessor_type = 'manager' on all records</li>
                <li>• Event status may change to 'in_progress'</li>
              </ul>
            </div>
            <div className="p-3 border border-blue-500/30 bg-blue-500/10 rounded-lg">
              <p className="font-medium text-sm text-blue-700 dark:text-blue-400">UI/Workflow Changes</p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• HR Hub task marked complete</li>
                <li>• Confirmation toast displayed</li>
                <li>• Next assessor (HR) receives notification</li>
              </ul>
            </div>
          </div>

          <IntegrationCallout>
            <strong>Note:</strong> Manager responses are saved with <code className="text-xs bg-muted px-1 py-0.5 rounded">assessor_type = 'manager'</code>. 
            If the succession_assessor_types configuration marks Manager as required, this submission 
            counts toward the "all required assessors complete" condition for event completion.
          </IntegrationCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Manager Assessments">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Review BARS behavioral anchors before rating to ensure consistency</li>
          <li>Add comments for any rating of 1-2 (needs improvement) or 4-5 (exceptional)</li>
          <li>Complete assessment in one session if possible; drafts can create incomplete data</li>
          <li>Compare against the candidate's actual work history, not just recent events</li>
          <li>If uncertain about a rating, use the "3 - Meets Expectations" midpoint and add a comment</li>
        </ul>
      </TipCallout>
    </div>
  );
}

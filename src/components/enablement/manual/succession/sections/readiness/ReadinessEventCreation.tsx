// Section 4.2: Assessment Event Creation
// Initiating assessments, field reference, workflow integration

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
  Plus, 
  FileText,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  Workflow
} from 'lucide-react';

const eventFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the assessment event',
    defaultValue: 'Auto-generated',
    validation: 'System-assigned primary key'
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to companies table for multi-tenant isolation',
    defaultValue: 'Current user company',
    validation: 'Must match initiator company'
  },
  {
    name: 'candidate_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to succession_candidates table identifying who is being assessed',
    validation: 'Must be an active succession candidate'
  },
  {
    name: 'form_id',
    required: false,
    type: 'UUID',
    description: 'Foreign key to readiness_assessment_forms table; if null, auto-detected from staff type',
    defaultValue: 'Auto-detect',
    validation: 'Form must be active and company-scoped'
  },
  {
    name: 'initiated_by',
    required: true,
    type: 'UUID',
    description: 'Foreign key to profiles table tracking who created the event',
    defaultValue: 'Current user',
    validation: 'Must have HR or Admin role'
  },
  {
    name: 'status',
    required: true,
    type: 'Text',
    description: 'Current lifecycle stage of the assessment event',
    defaultValue: 'pending',
    validation: "Enum: 'pending', 'in_progress', 'completed'"
  },
  {
    name: 'due_date',
    required: false,
    type: 'Date',
    description: 'Target completion date for the assessment; drives reminder notifications',
    validation: 'Must be future date'
  },
  {
    name: 'completed_at',
    required: false,
    type: 'Timestamp',
    description: 'System-set timestamp when all required assessors finish',
    defaultValue: 'null',
    validation: 'Set by system on completion'
  },
  {
    name: 'overall_score',
    required: false,
    type: 'Numeric',
    description: 'Calculated weighted average of all indicator responses (0-100)',
    defaultValue: 'null',
    validation: 'Calculated on completion'
  },
  {
    name: 'readiness_band',
    required: false,
    type: 'Text',
    description: 'Assigned band based on overall_score and readiness_rating_bands configuration',
    defaultValue: 'null',
    validation: 'Derived from rating bands lookup'
  },
  {
    name: 'created_at',
    required: true,
    type: 'Timestamp',
    description: 'When the event was created',
    defaultValue: 'now()',
    validation: 'System-assigned'
  },
  {
    name: 'updated_at',
    required: true,
    type: 'Timestamp',
    description: 'Last modification timestamp',
    defaultValue: 'now()',
    validation: 'Auto-updated on change'
  }
];

const creationSteps: Step[] = [
  {
    title: 'Navigate to Assessments Tab',
    description: 'From the Succession module, select the Assessments tab to view current and pending assessments.',
    substeps: [
      'Performance → Succession → Assessments',
      'Or: HR Hub → Talent Management → Readiness Assessments'
    ],
    expectedResult: 'Assessment list page displays with filters for status, candidate, and date range.'
  },
  {
    title: 'Click "Initiate Assessment"',
    description: 'Locate the primary action button to start a new assessment event.',
    substeps: [
      'The button appears in the top-right action bar',
      'Opens the ReadinessAssessmentEventDialog modal'
    ],
    expectedResult: 'Modal opens with candidate selection dropdown and form options.'
  },
  {
    title: 'Select Succession Candidate',
    description: 'Choose the candidate who will be assessed for succession readiness.',
    substeps: [
      'Dropdown shows only active succession candidates',
      'Candidates with pending assessments are marked with a warning icon',
      'Use search to filter by name or position'
    ],
    notes: [
      'System validates that no other pending assessment exists for this candidate'
    ],
    expectedResult: 'Candidate selected; staff type auto-detected for form matching.'
  },
  {
    title: 'Select or Auto-Detect Form',
    description: 'Choose the readiness assessment form to use, or let the system auto-detect based on staff type.',
    substeps: [
      'Toggle "Auto-detect form" to let system match staff type',
      'Or manually select from dropdown of active forms',
      'Form preview shows category count and indicator count'
    ],
    notes: [
      'Auto-detect uses the algorithm documented in Section 4.3',
      'Manual selection overrides staff type matching'
    ],
    expectedResult: 'Form selected; indicator categories displayed in preview.'
  },
  {
    title: 'Set Due Date (Optional)',
    description: 'Optionally specify a target completion date to drive assessor reminders.',
    substeps: [
      'Click the calendar icon to select a date',
      'Leave blank for no deadline enforcement'
    ],
    notes: [
      'Due date triggers reminder notifications at T-7, T-3, and T-1 days',
      'Overdue events are highlighted in the assessment list'
    ],
    expectedResult: 'Due date set (or left blank for no enforcement).'
  },
  {
    title: 'Submit to Create Event',
    description: 'Click Create to finalize the assessment event and trigger the workflow.',
    substeps: [
      'System validates all required fields',
      'Creates record in readiness_assessment_events table',
      'Triggers SUCC_READINESS_APPROVAL workflow if configured'
    ],
    expectedResult: 'Assessment event created with status "pending". Assessors notified via HR Hub tasks.'
  }
];

export function ReadinessEventCreation() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the complete field structure of readiness_assessment_events table",
          "Execute the step-by-step process to initiate a new assessment event",
          "Configure due dates and understand their impact on reminder notifications",
          "Recognize the workflow integration that triggers assessor tasks"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Assessments → Initiate Assessment
        </code>
      </InfoCallout>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Field Reference: readiness_assessment_events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable 
            fields={eventFields} 
            title="Assessment Event Table Schema"
          />
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Step-by-Step: Initiate Assessment Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={creationSteps} />
        </CardContent>
      </Card>

      {/* Workflow Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            HR Hub Workflow Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When an assessment event is created, the system can automatically trigger the 
            <code className="mx-1 text-xs bg-muted px-1.5 py-0.5 rounded">SUCC_READINESS_APPROVAL</code> 
            workflow type:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Workflow Element</th>
                  <th className="text-left py-3 px-4 font-medium">Configuration</th>
                  <th className="text-left py-3 px-4 font-medium">Behavior</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Transaction Type</td>
                  <td className="py-3 px-4"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">SUCC_READINESS_APPROVAL</code></td>
                  <td className="py-3 px-4">Registered in lookup_values</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Trigger</td>
                  <td className="py-3 px-4">Assessment event creation</td>
                  <td className="py-3 px-4">Creates HR Hub task for assessors</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Approver Chain</td>
                  <td className="py-3 px-4">Based on assessor types configuration</td>
                  <td className="py-3 px-4">Manager → HR → Executive (if enabled)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Completion</td>
                  <td className="py-3 px-4">All required assessors finish</td>
                  <td className="py-3 px-4">Workflow closes, candidate updated</td>
                </tr>
              </tbody>
            </table>
          </div>

          <IntegrationCallout>
            <strong>Configuration Required:</strong> The SUCC_READINESS_APPROVAL workflow must be 
            enabled in <code className="text-xs bg-muted px-1.5 py-0.5 rounded">company_transaction_workflow_settings</code> 
            for your company. See HR Hub → Setup → Approval Workflows to configure.
          </IntegrationCallout>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Business Rules & Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 border rounded-lg flex items-start gap-3">
              <Badge variant="destructive" className="text-xs flex-shrink-0 mt-0.5">System</Badge>
              <div>
                <p className="text-sm font-medium">One Active Assessment Per Candidate</p>
                <p className="text-sm text-muted-foreground">
                  A candidate cannot have more than one assessment event in "pending" or "in_progress" status. 
                  Previous assessments must complete or be cancelled before initiating a new one.
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <Badge className="bg-amber-600 text-xs flex-shrink-0 mt-0.5">Policy</Badge>
              <div>
                <p className="text-sm font-medium">HR Authorization Required</p>
                <p className="text-sm text-muted-foreground">
                  Only users with HR Partner, Admin, or Succession Admin roles can initiate assessment events. 
                  Managers cannot self-initiate assessments for their direct reports.
                </p>
              </div>
            </div>

            <div className="p-3 border rounded-lg flex items-start gap-3">
              <Badge className="bg-blue-600 text-xs flex-shrink-0 mt-0.5">Advisory</Badge>
              <div>
                <p className="text-sm font-medium">Form Match Validation</p>
                <p className="text-sm text-muted-foreground">
                  If auto-detect fails to find a matching form for the candidate's staff type, the system 
                  allows manual selection but logs a warning. Consider creating staff-type-specific forms.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <p className="font-medium text-sm">Issue: "Candidate already has pending assessment" error</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cause:</strong> An assessment event with status "pending" or "in_progress" exists for this candidate.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Solution:</strong> Navigate to the existing assessment and either complete it or cancel it before 
                initiating a new one. Use the Assessments list filter to find pending events.
              </p>
            </div>

            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <p className="font-medium text-sm">Issue: Form dropdown is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cause:</strong> No active readiness assessment forms exist for your company.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Solution:</strong> Follow Chapter 2, Section 2.5 to create readiness forms using the Form Builder 
                before initiating assessments.
              </p>
            </div>

            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <p className="font-medium text-sm">Issue: Auto-detect selects wrong form</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cause:</strong> Staff type matching is using a generic form instead of a role-specific one.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Solution:</strong> Check the candidate's staff type assignment in Workforce. Create a form 
                specifically for that staff type with the applies_to_staff_types field set correctly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Event Creation">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Set due dates 14-21 days in the future to give assessors adequate time</li>
          <li>Batch assessment initiation for succession planning cycles (e.g., Q4 reviews)</li>
          <li>Communicate with managers before initiating to set expectations</li>
          <li>Use auto-detect for consistency, manual override only for exceptions</li>
          <li>Monitor pending assessments weekly and follow up on overdue items</li>
        </ul>
      </TipCallout>
    </div>
  );
}

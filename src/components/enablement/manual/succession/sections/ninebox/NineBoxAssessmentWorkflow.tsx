// Section 3.7: Nine-Box Assessment Workflow (NEW)
// Assessment creation, evidence capture, override workflow

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  FieldReferenceTable,
  StepByStep,
  TroubleshootingSection,
  type FieldDefinition,
  type Step,
  type TroubleshootingItem,
} from '../../../components';
import { ClipboardCheck, UserCheck, History, Edit3, AlertTriangle, CheckCircle } from 'lucide-react';

const ASSESSMENTS_FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Primary key, auto-generated',
    defaultValue: 'gen_random_uuid()',
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to companies table',
    validation: 'Must reference valid company',
  },
  {
    name: 'employee_id',
    required: true,
    type: 'UUID',
    description: 'Foreign key to profiles table - the employee being assessed',
    validation: 'Must reference valid employee profile',
  },
  {
    name: 'assessed_by',
    required: false,
    type: 'UUID',
    description: 'Foreign key to profiles - user who created/modified the assessment',
  },
  {
    name: 'assessment_date',
    required: true,
    type: 'Date',
    description: 'Date the assessment was conducted',
    defaultValue: 'CURRENT_DATE',
  },
  {
    name: 'assessment_period',
    required: false,
    type: 'Text',
    description: 'Period label for the assessment (e.g., "Q4 2024", "Annual 2024")',
  },
  {
    name: 'performance_rating',
    required: true,
    type: 'Integer (1-3)',
    description: 'Final performance axis rating',
    validation: 'Must be 1 (Low), 2 (Moderate), or 3 (High)',
  },
  {
    name: 'potential_rating',
    required: true,
    type: 'Integer (1-3)',
    description: 'Final potential axis rating',
    validation: 'Must be 1 (Low), 2 (Moderate), or 3 (High)',
  },
  {
    name: 'performance_notes',
    required: false,
    type: 'Text',
    description: 'Justification notes for performance rating (required for overrides)',
  },
  {
    name: 'potential_notes',
    required: false,
    type: 'Text',
    description: 'Justification notes for potential rating (required for overrides)',
  },
  {
    name: 'overall_notes',
    required: false,
    type: 'Text',
    description: 'General notes about the assessment',
  },
  {
    name: 'is_current',
    required: true,
    type: 'Boolean',
    description: 'Whether this is the active assessment for the employee',
    defaultValue: 'true',
  },
  {
    name: 'created_at',
    required: true,
    type: 'Timestamp',
    description: 'Record creation timestamp',
    defaultValue: 'now()',
  },
  {
    name: 'updated_at',
    required: false,
    type: 'Timestamp',
    description: 'Last modification timestamp',
  },
];

const CREATE_ASSESSMENT_STEPS: Step[] = [
  {
    title: 'Navigate to Nine-Box Grid',
    description: 'Access the Nine-Box assessment view.',
    substeps: [
      'Go to Performance → Succession → Nine-Box Grid',
      'Select the target company from the filter dropdown',
      'View the current talent distribution on the grid',
    ],
  },
  {
    title: 'Select or Add Employee',
    description: 'Choose an employee to assess.',
    substeps: [
      'Click on an existing employee dot to edit, or',
      'Click "Add Assessment" button to assess a new employee',
      'Search and select the employee from the list',
    ],
  },
  {
    title: 'Review Evidence & Signals Tab',
    description: 'Examine the AI-calculated ratings and their sources.',
    substeps: [
      'View the Performance tab showing source contributions',
      'View the Potential tab showing signal aggregations',
      'Note the confidence score and any bias warnings',
      'Review individual signal details and weights',
    ],
    expectedResult: 'System displays AI-suggested ratings with confidence badges.',
  },
  {
    title: 'Accept or Override Ratings',
    description: 'Finalize the ratings for both axes.',
    substeps: [
      'For Performance: Accept AI suggestion or click to override',
      'For Potential: Accept AI suggestion or click to override',
      'If overriding, enter justification in the notes field (required)',
      'Override badge appears next to manual ratings',
    ],
    notes: [
      'AI suggestions are based on configured rating sources and signal mappings',
      'Overrides are tracked in the evidence audit trail',
      'Notes are required when overriding AI suggestions for compliance',
    ],
  },
  {
    title: 'Save Assessment',
    description: 'Persist the assessment and update current status.',
    substeps: [
      'Click "Save Assessment" button',
      'System sets is_current = false on any previous assessment',
      'New assessment is marked is_current = true',
      'Evidence sources are captured for audit trail',
    ],
    expectedResult: 'Employee appears in the correct grid quadrant with updated placement.',
  },
];

const TROUBLESHOOTING_ITEMS: TroubleshootingItem[] = [
  {
    issue: 'AI suggestion shows "No data" for an axis',
    cause: 'No rating sources have data for the employee (missing appraisals, goals, or signals)',
    solution: 'Check that employee has completed appraisals, active goals, and 360 feedback data',
  },
  {
    issue: 'Cannot save assessment - notes required error',
    cause: 'Override was selected but no justification notes were entered',
    solution: 'Enter notes explaining why the AI suggestion was overridden',
  },
  {
    issue: 'Employee appears in wrong quadrant after save',
    cause: 'A newer assessment exists or is_current flag was not updated',
    solution: 'Check for duplicate assessments; verify is_current = true on the latest record',
  },
  {
    issue: 'Previous assessment history not showing',
    cause: 'Historical assessments exist but are_current = false and not loading',
    solution: 'Enable "Show History" toggle in the assessment dialog to view past placements',
  },
  {
    issue: 'Confidence score is very low despite having data',
    cause: 'Available data covers less than 50% of expected sources',
    solution: 'Add more rating sources or wait for additional data collection cycles',
  },
];

export function NineBoxAssessmentWorkflow() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Create and manage Nine-Box assessments for employees",
          "Understand the is_current flag lifecycle for historical tracking",
          "Use the Evidence & Signals tab to review AI-suggested ratings",
          "Apply rating overrides with proper justification for audit compliance",
          "Differentiate between Manager and HR roles in the assessment workflow"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Nine-Box Grid → [Select Employee] or [Add Assessment]
        </code>
      </InfoCallout>

      {/* Field Reference Table */}
      <FieldReferenceTable
        title="nine_box_assessments Table Schema"
        fields={ASSESSMENTS_FIELDS}
      />

      {/* Assessment Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Assessment Lifecycle & is_current Flag
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each employee can have multiple historical assessments, but only one can be 
            current. The <code>is_current</code> flag controls which assessment represents 
            the employee's current Nine-Box placement.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Event</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">is_current State</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">First Assessment Created</td>
                  <td className="py-3 px-4">New record inserted</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">true</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">New Assessment Added</td>
                  <td className="py-3 px-4">Previous assessment updated, new record inserted</td>
                  <td className="py-3 px-4">
                    <span className="text-muted-foreground">Previous: </span>
                    <Badge variant="secondary">false</Badge>
                    <span className="text-muted-foreground"> New: </span>
                    <Badge className="bg-emerald-600">true</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Assessment Edited</td>
                  <td className="py-3 px-4">Current record updated in place</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">true</Badge>
                    <span className="text-muted-foreground"> (unchanged)</span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Historical View</td>
                  <td className="py-3 px-4">Query all records ordered by assessment_date</td>
                  <td className="py-3 px-4 text-muted-foreground">Mix of true/false records</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
{`// When saving a new assessment
async function saveAssessment(data) {
  // Step 1: Mark all previous as not current
  await supabase
    .from('nine_box_assessments')
    .update({ is_current: false })
    .eq('employee_id', data.employee_id)
    .eq('company_id', data.company_id);
  
  // Step 2: Insert new assessment as current
  await supabase
    .from('nine_box_assessments')
    .insert({ ...data, is_current: true });
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* AI-Suggested vs Manual Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            AI-Suggested vs. Manual Ratings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The assessment dialog displays both AI-calculated suggestions and allows 
            manual overrides. Both scenarios are tracked differently in the evidence trail.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-medium">AI-Suggested Rating</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Calculated from configured rating sources</li>
                <li>• Displays confidence score (0-100%)</li>
                <li>• Shows contributing sources and weights</li>
                <li>• Evidence marked "Auto-calculated from [source]"</li>
                <li>• No notes required to accept</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="h-5 w-5 text-amber-600" />
                <h4 className="font-medium">Manual Override</h4>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User selects different rating than AI suggestion</li>
                <li>• "Override" badge displayed next to rating</li>
                <li>• Notes field becomes required</li>
                <li>• Evidence marked "Override: [reason]"</li>
                <li>• Tracked for calibration review</li>
              </ul>
            </div>
          </div>

          <WarningCallout title="Override Compliance">
            All manual overrides are logged in the <code>nine_box_evidence_sources</code> 
            table with the justification reason. This supports SOC 2 audit requirements 
            and calibration review processes.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Role-Based Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Role-Based Assessment Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">View Grid</th>
                  <th className="text-left py-3 px-4 font-medium">Create Assessment</th>
                  <th className="text-left py-3 px-4 font-medium">Override AI</th>
                  <th className="text-left py-3 px-4 font-medium">View History</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">HR Admin</td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">All</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">All</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">Yes</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">All</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Manager (MSS)</td>
                  <td className="py-3 px-4"><Badge className="bg-blue-600">Team</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-blue-600">Team</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-amber-600">With Approval</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-blue-600">Team</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Executive</td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">All</Badge></td>
                  <td className="py-3 px-4"><Badge variant="secondary">No</Badge></td>
                  <td className="py-3 px-4"><Badge variant="secondary">No</Badge></td>
                  <td className="py-3 px-4"><Badge className="bg-emerald-600">All</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Employee (ESS)</td>
                  <td className="py-3 px-4"><Badge variant="secondary">Self Only*</Badge></td>
                  <td className="py-3 px-4"><Badge variant="secondary">No</Badge></td>
                  <td className="py-3 px-4"><Badge variant="secondary">No</Badge></td>
                  <td className="py-3 px-4"><Badge variant="secondary">Self Only*</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            *Self view depends on company settings for Nine-Box visibility to employees
          </p>
        </CardContent>
      </Card>

      {/* Step-by-Step Procedure */}
      <StepByStep
        title="Create a Nine-Box Assessment"
        steps={CREATE_ASSESSMENT_STEPS}
      />

      {/* Troubleshooting */}
      <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

      {/* Best Practices */}
      <TipCallout title="Assessment Workflow Best Practices">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Review the Evidence & Signals tab before accepting AI suggestions</li>
          <li>Always document override reasons for audit trail compliance</li>
          <li>Conduct assessments after appraisal cycles complete for best data quality</li>
          <li>Use calibration sessions to validate Nine-Box placements across the organization</li>
          <li>Track historical assessments to monitor talent movement over time</li>
          <li>Consider confidence scores when deciding whether to accept AI suggestions</li>
        </ul>
      </TipCallout>
    </div>
  );
}

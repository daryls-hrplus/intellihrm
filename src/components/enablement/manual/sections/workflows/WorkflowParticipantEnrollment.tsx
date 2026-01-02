import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Settings, CheckCircle, UserPlus, UserMinus, Filter } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { ConfigurationExample } from '../../components/ConfigurationExample';

const ENROLLMENT_STEPS = [
  {
    title: 'Define Eligibility Criteria',
    description: 'Set the rules for automatic participant selection.',
    substeps: [
      'Navigate to Cycle Settings → Eligibility',
      'Select employment status filters (Active, Probation, etc.)',
      'Choose departments to include/exclude',
      'Set minimum tenure requirement (e.g., 90 days)',
      'Define job level filters if applicable'
    ],
    expectedResult: 'Eligibility criteria saved and preview count updated'
  },
  {
    title: 'Preview and Adjust Participant List',
    description: 'Review auto-selected participants and make manual adjustments.',
    substeps: [
      'Click "Preview Participants" to see the list',
      'Review for unexpected inclusions/exclusions',
      'Use checkboxes to manually add or remove individuals',
      'Add notes for any manual overrides'
    ],
    expectedResult: 'Final participant list reflects intended enrollment'
  },
  {
    title: 'Assign Evaluators',
    description: 'Configure who will evaluate each participant.',
    substeps: [
      'Review auto-assigned managers from org structure',
      'Override evaluator for matrix-managed employees',
      'Add secondary evaluators for dual-reporting',
      'Confirm all participants have assigned evaluators'
    ],
    expectedResult: 'Every participant has at least one assigned evaluator'
  },
  {
    title: 'Confirm Enrollment',
    description: 'Finalize the participant list before cycle launch.',
    substeps: [
      'Click "Confirm Enrollment"',
      'Review the summary of enrollment actions',
      'Acknowledge any warning messages',
      'Submit enrollment confirmation'
    ],
    expectedResult: 'Enrollment locked and ready for cycle launch'
  }
];

const FIELDS = [
  { name: 'employee_id', required: true, type: 'UUID', description: 'The enrolled employee', validation: 'Must be active employee in company' },
  { name: 'evaluator_id', required: true, type: 'UUID', description: 'Primary manager/evaluator', validation: 'Cannot be same as employee_id' },
  { name: 'enrollment_status', required: true, type: 'Enum', description: 'Current enrollment state', defaultValue: 'Pending', validation: 'Pending, Active, Excluded, Completed' },
  { name: 'enrollment_source', required: true, type: 'Enum', description: 'How participant was enrolled', defaultValue: 'Automatic', validation: 'Automatic, Manual, Re-enrolled' },
  { name: 'exclusion_reason', required: false, type: 'Text', description: 'Why participant was excluded', validation: 'Required if enrollment_status is Excluded' },
  { name: 'position_at_enrollment', required: true, type: 'UUID', description: 'Position held when enrolled', validation: 'Captures point-in-time snapshot' }
];

const BUSINESS_RULES = [
  { rule: 'Employees cannot evaluate themselves', enforcement: 'System' as const, description: 'Self-assignment as evaluator is blocked at database level.' },
  { rule: 'Minimum tenure applies at cycle start date', enforcement: 'System' as const, description: 'Tenure calculated from hire date to cycle start, not enrollment date.' },
  { rule: 'Excluded employees require documented reason', enforcement: 'Policy' as const, description: 'All exclusions must include justification for audit trail.' },
  { rule: 'Matrix employees need primary evaluator designated', enforcement: 'Policy' as const, description: 'When multiple managers exist, one must be marked as primary for the cycle.' }
];

const EXAMPLES = [
  {
    title: 'Standard Annual Review Enrollment',
    context: 'Company-wide performance review for all active employees with 90+ days tenure',
    values: [
      { field: 'Employment Status', value: 'Active' },
      { field: 'Minimum Tenure', value: '90 days' },
      { field: 'Departments', value: 'All' },
      { field: 'Job Levels', value: 'All' },
      { field: 'Evaluator Assignment', value: 'Direct Manager (auto)' }
    ],
    outcome: '450 employees enrolled automatically, 12 excluded for tenure'
  },
  {
    title: 'Manager-Only Mid-Year Review',
    context: 'Performance check for management team only',
    values: [
      { field: 'Employment Status', value: 'Active' },
      { field: 'Minimum Tenure', value: '0 days' },
      { field: 'Job Levels', value: 'Manager, Senior Manager, Director' },
      { field: 'Evaluator Assignment', value: 'Skip-level Manager' }
    ],
    outcome: '45 managers enrolled with skip-level evaluators'
  }
];

const TROUBLESHOOTING = [
  { issue: 'Employee missing from participant list', cause: 'Does not meet eligibility criteria or was manually excluded in previous cycle.', solution: 'Check eligibility settings and exclusion history. Use manual add if criteria exception needed.' },
  { issue: 'Wrong manager assigned as evaluator', cause: 'Org structure data is outdated or matrix reporting not configured.', solution: 'Update org structure in Core HR first, then refresh enrollment preview.' },
  { issue: 'Cannot remove enrolled participant', cause: 'Cycle has already launched and participant has started self-assessment.', solution: 'Use "Exclude with Reason" option instead of removal. Original enrollment preserved for audit.' }
];

export function WorkflowParticipantEnrollment() {
  return (
    <Card id="sec-3-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.2</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Settings className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Participant Enrollment</CardTitle>
        <CardDescription>Bulk enrollment procedures, eligibility configuration, and evaluator assignment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-2']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Configure eligibility criteria for automatic enrollment</li>
            <li>Manage bulk enrollment and manual adjustments</li>
            <li>Assign and override evaluators for various reporting structures</li>
            <li>Handle re-enrollment and exclusion scenarios</li>
          </ul>
        </div>

        {/* Interactive Workflow Diagram */}
        <WorkflowDiagram 
          title="Enrollment Workflow"
          description="HR admin actions, system processing, and data source interactions"
          diagram={`flowchart TD
    subgraph HR["🔧 HR Admin Actions"]
        A[Define Eligibility Criteria] --> B[Preview Participants]
        B --> C{Adjustments Needed?}
        C -->|Yes| D[Manual Add/Remove]
        C -->|No| E[Assign Evaluators]
        D --> E
        E --> F[Confirm Enrollment]
    end
    
    subgraph System["⚙️ System Processing"]
        G[Apply Eligibility Rules]
        H[Match to Org Structure]
        I[Lock Enrollment]
    end
    
    subgraph Data["📊 Data Sources"]
        J[(Employee Records)]
        K[(Org Hierarchy)]
        L[(Previous Cycles)]
    end
    
    A --> G
    G --> J
    G --> L
    H --> K
    E --> H
    F --> I`}
        />

        {/* Enrollment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Enrollment Methods</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { method: 'Automatic', icon: Filter, desc: 'System enrolls based on eligibility criteria', color: 'border-l-blue-500' },
              { method: 'Manual', icon: UserPlus, desc: 'HR adds individual participants', color: 'border-l-green-500' },
              { method: 'Re-enrollment', icon: Users, desc: 'Carry forward from previous cycle', color: 'border-l-amber-500' }
            ].map((item) => (
              <Card key={item.method} className={`border-l-4 ${item.color} bg-muted/50 rounded-l-none`}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-5 w-5 text-foreground" />
                    <h4 className="font-semibold text-foreground">{item.method}</h4>
                  </div>
                  <p className="text-sm text-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <NoteCallout title="Prerequisite">
          Ensure org structure and reporting relationships are up-to-date in Core HR before enrollment. Stale data leads to incorrect evaluator assignments.
        </NoteCallout>

        <StepByStep steps={ENROLLMENT_STEPS} title="Enrollment Procedure" />

        {/* Exclusion Management */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-red-600" />
            Exclusion Management
          </h3>
          <div className="space-y-3">
            {[
              { reason: 'Long-term Leave', desc: 'Employee on extended leave during cycle period', action: 'Auto-exclude based on leave records' },
              { reason: 'Recent Hire', desc: 'Employee hired after cycle start date', action: 'Exclude or enroll in probation review instead' },
              { reason: 'Pending Termination', desc: 'Employee in notice period', action: 'HR decision: exclude or complete partial review' },
              { reason: 'Role Change', desc: 'Position changed significantly mid-cycle', action: 'Split evaluation or reassign to appropriate cycle' }
            ].map((item) => (
              <div key={item.reason} className="flex gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.reason}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Action:</strong> {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>

        <WarningCallout title="Audit Compliance">
          All enrollment changes are logged with timestamp and user. Manual exclusions without documented reasons will trigger compliance alerts.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Enrollment Record Fields" />
        <ConfigurationExample examples={EXAMPLES} />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

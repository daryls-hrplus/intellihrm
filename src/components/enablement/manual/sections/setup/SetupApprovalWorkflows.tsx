import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lightbulb, Users } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  FieldReferenceTable, 
  StepByStep, 
  ConfigurationExample,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  PrerequisiteAlert
} from '../../components';

const FIELD_DEFINITIONS = [
  { name: 'Workflow Name', required: true, type: 'Text', description: 'Display name for the approval workflow', defaultValue: '—', validation: 'Max 100 characters' },
  { name: 'Code', required: true, type: 'Text', description: 'Unique identifier for the workflow', defaultValue: 'Auto-generated', validation: 'Max 20 chars' },
  { name: 'Process Type', required: true, type: 'Select', description: 'Which process this workflow applies to', defaultValue: '—', validation: 'Appraisal, Goal, Calibration, etc.' },
  { name: 'Steps', required: true, type: 'Array', description: 'Ordered list of approval steps', defaultValue: '—', validation: 'At least one step required' },
  { name: 'Step - Approver Type', required: true, type: 'Select', description: 'Who must approve (Manager, Skip-level, HR, etc.)', defaultValue: 'Manager', validation: 'From role list' },
  { name: 'Step - Action Required', required: true, type: 'Select', description: 'What the approver must do', defaultValue: 'Approve/Reject', validation: 'Approve, Review, Acknowledge' },
  { name: 'Step - SLA Days', required: false, type: 'Number', description: 'Days allowed for this step', defaultValue: '5', validation: '1-30 days' },
  { name: 'Step - Escalation', required: false, type: 'Boolean', description: 'Auto-escalate if SLA exceeded', defaultValue: 'true', validation: '—' },
  { name: 'Conditions', required: false, type: 'Rules', description: 'When this workflow applies', defaultValue: 'All employees', validation: 'By department, grade, etc.' },
  { name: 'Is Active', required: true, type: 'Boolean', description: 'Whether workflow is in use', defaultValue: 'true', validation: '—' },
];

const STEPS = [
  {
    title: 'Navigate to Approval Workflows',
    description: 'Go to Performance → Setup → Foundation → Workflows',
    expectedResult: 'Workflows page displays with existing configurations'
  },
  {
    title: 'Click "Add Workflow"',
    description: 'Click the primary action button to create a new approval workflow',
    expectedResult: 'Workflow builder opens'
  },
  {
    title: 'Enter Workflow Details',
    description: 'Provide basic workflow information',
    substeps: [
      'Name: Enter descriptive name (e.g., "Standard Appraisal Approval")',
      'Code: Enter unique identifier',
      'Process Type: Select the process this applies to'
    ],
    expectedResult: 'Basic information saved'
  },
  {
    title: 'Add Approval Steps',
    description: 'Define each step in the approval chain',
    substeps: [
      'Click "Add Step" to create a new approval step',
      'Select the approver type (Direct Manager, Skip-level, HR Partner)',
      'Choose the required action (Approve/Reject, Review Only, Acknowledge)',
      'Set SLA in days for completion',
      'Configure escalation behavior if SLA is exceeded'
    ],
    expectedResult: 'Approval step added to workflow'
  },
  {
    title: 'Configure Step Order',
    description: 'Arrange steps in the correct sequence',
    substeps: [
      'Drag and drop steps to reorder',
      'Verify sequential vs. parallel execution',
      'Set dependencies between steps if needed'
    ],
    expectedResult: 'Approval chain properly sequenced'
  },
  {
    title: 'Set Conditions (Optional)',
    description: 'Define when this workflow applies',
    substeps: [
      'Add conditions based on employee attributes',
      'Filter by department, grade, location, or custom fields',
      'Set as default workflow if no conditions match'
    ],
    expectedResult: 'Workflow routing rules configured'
  },
  {
    title: 'Save and Activate',
    description: 'Save the workflow and make it active',
    expectedResult: 'Workflow saved and available for process configuration'
  }
];

const CONFIGURATION_EXAMPLES = [
  {
    title: 'Standard Manager Approval',
    context: 'Basic workflow for most employees. Single approval by direct manager.',
    values: [
      { field: 'Step 1', value: 'Direct Manager - Approve/Reject (5 days SLA)' },
      { field: 'Escalation', value: 'Auto-escalate to skip-level after SLA' },
      { field: 'Conditions', value: 'All non-executive employees' }
    ],
    outcome: 'Quick turnaround with clear accountability to direct manager.'
  },
  {
    title: 'Executive Multi-Level Approval',
    context: 'Higher scrutiny for senior roles. Requires HR review before final sign-off.',
    values: [
      { field: 'Step 1', value: 'Direct Manager - Approve (3 days SLA)' },
      { field: 'Step 2', value: 'HR Business Partner - Review (3 days SLA)' },
      { field: 'Step 3', value: 'Skip-level Manager - Final Approve (5 days SLA)' },
      { field: 'Conditions', value: 'Grade Director and above' }
    ],
    outcome: 'Multi-stakeholder review ensures consistency for leadership roles.'
  },
  {
    title: 'Calibration Approval',
    context: 'Post-calibration workflow to finalize adjusted ratings.',
    values: [
      { field: 'Step 1', value: 'Calibration Committee Chair - Approve (2 days)' },
      { field: 'Step 2', value: 'HR Head - Final Sign-off (3 days)' },
      { field: 'Conditions', value: 'All calibrated appraisals' }
    ],
    outcome: 'Formal approval of calibration decisions before employee release.'
  }
];

const BUSINESS_RULES = [
  { rule: 'At least one approval step required', enforcement: 'System' as const, description: 'Workflows must have a minimum of one approver in the chain.' },
  { rule: 'SLA triggers escalation notifications', enforcement: 'System' as const, description: 'System sends reminders at 75% SLA and escalates at 100% if configured.' },
  { rule: 'Cannot skip approval steps', enforcement: 'System' as const, description: 'Each step must be completed before the next can begin (sequential mode).' },
  { rule: 'Approver must have manager role', enforcement: 'System' as const, description: 'Only users with appropriate roles can be assigned as approvers.' },
  { rule: 'Workflow changes require HR approval', enforcement: 'Policy' as const, description: 'Modifications to approval chains should follow change management.' },
  { rule: 'Document escalation paths', enforcement: 'Advisory' as const, description: 'Clearly define who receives escalations for each step type.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Appraisal stuck in approval queue',
    cause: 'Approver is on leave or no longer in the required role.',
    solution: 'HR can reassign pending approvals via the Admin Console. Configure delegation rules for future absences.'
  },
  {
    issue: 'Wrong workflow applied to employee',
    cause: 'Condition rules not matching employee attributes correctly.',
    solution: 'Review workflow conditions. Check employee data in Core HR matches expected values (grade, department).'
  },
  {
    issue: 'Escalation not triggering',
    cause: 'Escalation disabled on the step or escalation target not configured.',
    solution: 'Edit the workflow step to enable escalation and verify the escalation approver is defined.'
  },
  {
    issue: 'Cannot modify active workflow',
    cause: 'Workflow is currently in use by in-progress appraisals.',
    solution: 'Clone the workflow, make changes, and activate the new version. Existing processes complete with old workflow.'
  }
];

export function SetupApprovalWorkflows() {
  return (
    <Card id="sec-2-workflows">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Foundation</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~12 min read
          </Badge>
          <Badge className="bg-green-600 text-white dark:bg-green-700">
            As needed
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Users className="h-6 w-6" />
          Approval Workflows
        </CardTitle>
        <CardDescription>
          Configure approval chains for performance processes including appraisals, goals, and calibration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NavigationPath path={['Performance', 'Setup', 'Foundation', 'Workflows']} />

        <LearningObjectives
          objectives={[
            'Understand approval workflow concepts and step types',
            'Create multi-step approval chains with SLA enforcement',
            'Configure conditional workflow routing based on employee attributes',
            'Set up escalation rules for overdue approvals'
          ]}
        />

        <PrerequisiteAlert
          items={[
            'Organizational roles configured (Manager, HR Partner, etc.)',
            'Employee-manager relationships established',
            'Understanding of approval requirements by employee type'
          ]}
        />

        {/* Overview */}
        <div>
          <h4 className="font-medium mb-2">What Are Approval Workflows?</h4>
          <p className="text-muted-foreground">
            Approval workflows define the sequence of approvals required before performance processes 
            are finalized. They ensure proper oversight, maintain compliance with organizational policies, 
            and create audit trails for all decisions. Workflows can be simple (single manager approval) 
            or complex (multi-level with HR review), depending on organizational needs.
          </p>
        </div>

        {/* Workflow Visual */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-3">Example: Standard Approval Flow</h4>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-600 text-white dark:bg-blue-700">Employee Submits</Badge>
              <span>→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-600 text-white dark:bg-amber-700">Manager Approves</Badge>
              <span>→</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white dark:bg-purple-700">HR Reviews</Badge>
              <span>→</span>
            </div>
            <Badge className="bg-green-600 text-white dark:bg-green-700">Finalized</Badge>
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure F.1: Approval Workflow builder showing multi-step configuration"
          alt="Approval Workflow configuration page"
        />

        <StepByStep steps={STEPS} title="Creating an Approval Workflow: Step-by-Step" />

        <FieldReferenceTable fields={FIELD_DEFINITIONS} title="Field Reference" />

        <ConfigurationExample examples={CONFIGURATION_EXAMPLES} />

        {/* Approver Types */}
        <div>
          <h4 className="font-medium mb-3">Available Approver Types</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'Direct Manager', desc: 'Employee\'s immediate supervisor from org hierarchy' },
              { type: 'Skip-level Manager', desc: 'Manager\'s manager (two levels up)' },
              { type: 'Department Head', desc: 'Head of the employee\'s department' },
              { type: 'HR Business Partner', desc: 'Assigned HR representative for the employee\'s area' },
              { type: 'HR Head', desc: 'Chief HR Officer or designated HR executive' },
              { type: 'Specific User', desc: 'Named individual (use sparingly)' },
              { type: 'Role-based', desc: 'Anyone with a specific system role' },
              { type: 'Committee', desc: 'Group approval (any member can approve)' }
            ].map((item) => (
              <div key={item.type} className="p-3 border rounded-lg">
                <h5 className="font-medium text-sm">{item.type}</h5>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Note */}
        <div className="p-4 border-l-4 border-l-blue-500 bg-muted/50 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">SLA Best Practices</h4>
              <p className="text-sm text-foreground">
                Set realistic SLAs based on approver workload. Consider time zones and typical 
                response times. Enable escalation to prevent bottlenecks—a 5-day SLA with 
                escalation is better than a 10-day SLA without.
              </p>
            </div>
          </div>
        </div>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />
      </CardContent>
    </Card>
  );
}

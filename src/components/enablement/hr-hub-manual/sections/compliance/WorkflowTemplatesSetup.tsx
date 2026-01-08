import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock, Users, Settings, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const workflowCategories = [
  { category: 'hire', label: 'New Hire', useCase: 'New employee onboarding approval', typicalSteps: 'Manager → HR → Payroll' },
  { category: 'confirmation', label: 'Confirmation', useCase: 'Probation completion approval', typicalSteps: 'Manager → HR' },
  { category: 'promotion', label: 'Promotion', useCase: 'Career advancement approval', typicalSteps: 'Manager → HR → Compensation' },
  { category: 'transfer', label: 'Transfer', useCase: 'Department/location moves', typicalSteps: 'Current Mgr → New Mgr → HR' },
  { category: 'termination', label: 'Termination', useCase: 'Exit processing approval', typicalSteps: 'Manager → HR → Legal' },
  { category: 'salary_change', label: 'Salary Change', useCase: 'Compensation adjustments', typicalSteps: 'Manager → HR → Compensation' },
  { category: 'leave_request', label: 'Leave Request', useCase: 'Time off approval', typicalSteps: 'Manager → (HR for long leaves)' },
  { category: 'expense_claim', label: 'Expense Claim', useCase: 'Reimbursement approval', typicalSteps: 'Manager → Finance' }
];

const approverTypes = [
  { type: 'manager', label: 'Direct Manager', resolution: 'Employee\'s reporting line', bestFor: 'First-level approvals' },
  { type: 'hr', label: 'HR Manager', resolution: 'Users with HR Manager role', bestFor: 'Compliance checks, policy verification' },
  { type: 'position', label: 'Specific Position', resolution: 'Named position holder', bestFor: 'Department heads, CHRO' },
  { type: 'workflow_role', label: 'Workflow Approval Role', resolution: 'Configurable role group', bestFor: 'Flexible approval pools' },
  { type: 'role', label: 'System Role', resolution: 'Any user with specified role', bestFor: 'IT, Security, Legal reviews' },
  { type: 'governance_body', label: 'Governance Body', resolution: 'Board/committee approval', bestFor: 'Strategic decisions, executive hires' },
  { type: 'specific_user', label: 'Specific User', resolution: 'Named individual', bestFor: 'Backup approvers, special cases' }
];

const escalationActions = [
  { action: 'notify_alternate', label: 'Notify Alternate', behavior: 'Send reminder to alternate approver, keep waiting' },
  { action: 'escalate_up', label: 'Escalate Up', behavior: 'Move approval to next reporting level' },
  { action: 'auto_approve', label: 'Auto-Approve', behavior: 'Automatically approve and continue workflow' },
  { action: 'auto_reject', label: 'Auto-Reject', behavior: 'Automatically reject and terminate workflow' },
  { action: 'terminate', label: 'Terminate', behavior: 'Cancel workflow without decision' }
];

const templateSteps = [
  {
    title: 'Navigate to Workflow Templates',
    description: 'Access Admin → Workflow Templates or HR Hub → Workflow Management → Templates tab.',
    expectedResult: 'Workflow Templates page loads with existing templates'
  },
  {
    title: 'Create New Template',
    description: 'Click "New Template" to open the template creation dialog.',
    expectedResult: 'Template creation form opens'
  },
  {
    title: 'Configure Template Basics',
    description: 'Enter the template name, code, and category. Select appropriate options:',
    substeps: [
      'Name: Clear, descriptive name',
      'Code: Unique identifier',
      'Category: Type of workflow this template handles',
      'Is Global: Check for organization-wide template',
      'Requires Signature: Enable for formal approval',
      'Requires Letter: Generate approval letter'
    ],
    expectedResult: 'Template metadata is configured'
  },
  {
    title: 'Add Approval Steps',
    description: 'For the selected template, add approval steps in sequence. Each step defines who approves and escalation rules.',
    substeps: [
      'Click "Add Step" on the template detail view',
      'Enter step name and description',
      'Select approver type and target',
      'Configure escalation hours and action',
      'Set signature and comment requirements'
    ],
    expectedResult: 'Multi-step approval chain is defined'
  },
  {
    title: 'Configure Escalation',
    description: 'For each step, set escalation timeout and action. This ensures approvals don\'t stall.',
    expectedResult: 'Automatic escalation prevents bottlenecks'
  },
  {
    title: 'Activate Template',
    description: 'Set the template to Active. It can now be used in Transaction Workflow Settings.',
    expectedResult: 'Template is available for assignment'
  }
];

const templateFields = [
  { name: 'name', type: 'Text', required: true, description: 'Template display name' },
  { name: 'code', type: 'Text', required: true, description: 'Unique identifier code' },
  { name: 'category', type: 'Select', required: true, description: 'Workflow category (hire, promotion, etc.)' },
  { name: 'is_global', type: 'Boolean', required: false, description: 'Applies to all companies' },
  { name: 'requires_signature', type: 'Boolean', required: false, description: 'Require digital signature on approval' },
  { name: 'requires_letter', type: 'Boolean', required: false, description: 'Generate approval letter document' },
  { name: 'auto_terminate_hours', type: 'Number', required: false, description: 'Hours before workflow auto-terminates' },
  { name: 'allow_return_to_previous', type: 'Boolean', required: false, description: 'Allow returning to previous step' }
];

const stepFields = [
  { name: 'name', type: 'Text', required: true, description: 'Step display name' },
  { name: 'approver_type', type: 'Select', required: true, description: 'Type of approver (manager, HR, position, etc.)' },
  { name: 'approver_target', type: 'UUID', required: false, description: 'Specific position/role/user ID (based on type)' },
  { name: 'escalation_hours', type: 'Number', required: false, description: 'Hours before escalation triggers' },
  { name: 'escalation_action', type: 'Select', required: false, description: 'What to do on escalation timeout' },
  { name: 'requires_signature', type: 'Boolean', required: false, description: 'Require signature at this step' },
  { name: 'requires_comment', type: 'Boolean', required: false, description: 'Require comment for approval/rejection' }
];

const approvalFlowDiagram = `flowchart TD
    A[Workflow Started] --> B[Step 1: Manager]
    B -->|Approve| C[Step 2: HR]
    B -->|Reject| X[Rejected]
    B -->|Timeout| E{Escalation Action}
    E -->|Escalate Up| F[Skip Manager Level]
    E -->|Auto-Approve| C
    E -->|Terminate| X
    C -->|Approve| D[Step 3: Compensation]
    C -->|Reject| X
    D -->|Approve| G[Workflow Complete]
    D -->|Reject| X
    F --> C`;

export function WorkflowTemplatesSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-1">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.1</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          15 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
              <GitBranch className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle>Workflow Templates</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Multi-step approval chains for enterprise governance
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            Workflow Templates define the approval chains used when transactions require governance. 
            Each template specifies a sequence of approval steps, who can approve at each step, and 
            what happens if approvers don't respond in time.
          </p>

          <InfoCallout title="Template Dependency">
            Workflow Templates must be created BEFORE configuring Transaction Workflow Settings. 
            Without templates, you cannot enable workflows for transaction types.
          </InfoCallout>

          {/* Workflow Categories */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Workflow Categories</h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Category</th>
                    <th className="border p-3 text-left font-medium">Label</th>
                    <th className="border p-3 text-left font-medium">Use Case</th>
                    <th className="border p-3 text-left font-medium">Typical Steps</th>
                  </tr>
                </thead>
                <tbody>
                  {workflowCategories.map((cat, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-mono text-xs">{cat.category}</td>
                      <td className="border p-3 font-medium">{cat.label}</td>
                      <td className="border p-3">{cat.useCase}</td>
                      <td className="border p-3 text-muted-foreground">{cat.typicalSteps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approver Types */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Approver Types
            </h4>
            <p className="text-sm text-muted-foreground">
              Each approval step can use different approver types based on your governance requirements.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Type</th>
                    <th className="border p-3 text-left font-medium">Resolution Method</th>
                    <th className="border p-3 text-left font-medium">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {approverTypes.map((type, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-medium">{type.label}</td>
                      <td className="border p-3">{type.resolution}</td>
                      <td className="border p-3 text-muted-foreground">{type.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Escalation Actions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Escalation Actions
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {escalationActions.map((action, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">{action.label}</h5>
                    <p className="text-sm text-muted-foreground">{action.behavior}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WarningCallout title="Auto-Approve Risk">
            Using "Auto-Approve" as an escalation action can bypass governance controls. Use this 
            option cautiously and only for low-risk workflows where SLA is more important than 
            oversight.
          </WarningCallout>

          {/* Approval Flow Diagram */}
          <WorkflowDiagram
            title="Multi-Step Approval Flow"
            description="Example workflow with escalation handling"
            diagram={approvalFlowDiagram}
          />

          {/* Configuration Steps */}
          <StepByStep
            title="Template Configuration Procedure"
            steps={templateSteps}
          />

          {/* Field References */}
          <FieldReferenceTable
            title="Template Fields"
            fields={templateFields}
          />

          <FieldReferenceTable
            title="Step Fields"
            fields={stepFields}
          />

          <TipCallout title="Process Map Feature">
            Use the "Process Map" button on any template to view a visual diagram of the approval 
            flow. This helps stakeholders understand the governance chain without reading through 
            step configurations.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Keep approval chains to 2-4 steps to avoid bottlenecks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Always configure escalation timeouts to prevent stalled workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use Workflow Approval Roles for flexible approver pools</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Require comments on rejection to document reasoning</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Enable signatures for compliance-critical approvals</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  StepByStep,
  type Step
} from '@/components/enablement/manual/components';

const workflowEnableSteps: Step[] = [
  {
    title: 'Navigate to HR Hub Workflow Settings',
    description: 'Go to HR Hub → Settings → Workflow Configuration.',
    expectedResult: 'Workflow settings page displays with transaction types list'
  },
  {
    title: 'Locate Succession Transaction Types',
    description: 'Find succession-related transaction types in the list.',
    notes: [
      'PERF_SUCCESSION_APPROVAL - Plan creation/modifications',
      'SUCC_READINESS_APPROVAL - Readiness assessment completion',
      'TALENT_POOL_NOMINATION - Talent pool nominations'
    ]
  },
  {
    title: 'Enable Workflow for Each Type',
    description: 'Toggle "Workflow Enabled" for each succession transaction type.',
    notes: ['Enabling creates entry in company_transaction_workflow_settings'],
    expectedResult: 'Transaction type shows "Enabled" status'
  },
  {
    title: 'Configure Workflow Template',
    description: 'Select or create a workflow template for the transaction type.',
    notes: [
      'Use SUCCESSION_READINESS_APPROVAL template as starting point',
      'Configure approval levels: Manager → HR → Executive (as needed)'
    ]
  },
  {
    title: 'Test Workflow',
    description: 'Submit a test succession action and verify it routes to approval queue.',
    expectedResult: 'Pending approval visible in HR Hub → Pending Approvals'
  }
];

const approvalProcessSteps: Step[] = [
  {
    title: 'Access Pending Approvals',
    description: 'Navigate to HR Hub → Pending Approvals.',
    expectedResult: 'List of pending approvals displays with succession items'
  },
  {
    title: 'Filter by Succession Actions',
    description: 'Use the category filter to show only Succession-related approvals.',
    notes: ['Filter options: Integration Actions, Readiness Assessments, Talent Pool Nominations']
  },
  {
    title: 'Review Action Details',
    description: 'Click on a pending approval to view full context.',
    notes: [
      'See employee name, trigger source, proposed action',
      'Review evidence and supporting data'
    ]
  },
  {
    title: 'Approve or Reject',
    description: 'Make approval decision with optional comments.',
    notes: [
      'Approve: Action executes immediately',
      'Reject: Action cancelled, requester notified',
      'Request Info: Action paused, clarification requested'
    ],
    expectedResult: 'Action status updated, audit log entry created'
  }
];

const transactionTypes = [
  {
    code: 'PERF_SUCCESSION_APPROVAL',
    name: 'Succession Plan Changes',
    triggers: ['Plan creation', 'Candidate additions', 'Readiness band changes'],
    defaultLevels: 2
  },
  {
    code: 'SUCC_READINESS_APPROVAL',
    name: 'Readiness Assessment Completion',
    triggers: ['Assessment finalization', 'Multi-assessor consolidation'],
    defaultLevels: 1
  },
  {
    code: 'TALENT_POOL_NOMINATION',
    name: 'Talent Pool Nominations',
    triggers: ['New nominations', 'Cross-pool transfers', 'Pool graduations'],
    defaultLevels: 2
  },
  {
    code: 'NINE_BOX_OVERRIDE',
    name: 'Nine-Box Manual Overrides',
    triggers: ['Rating overrides', 'AI suggestion rejections'],
    defaultLevels: 2
  }
];

export function IntegrationHRHub() {
  return (
    <section id="sec-9-10" data-manual-anchor="sec-9-10" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <LayoutDashboard className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.10 HR Hub Workflow Integration</h3>
          <p className="text-sm text-muted-foreground">
            Configure succession workflows and process pending approvals
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Enable succession-related workflow transaction types',
        'Configure approval levels for succession actions',
        'Process pending approvals in HR Hub',
        'Manage bulk approval procedures'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Succession Transaction Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            These transaction types can be enabled for workflow approval in HR Hub:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Transaction Code</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Triggers</th>
                  <th className="text-left py-2 px-3">Default Levels</th>
                </tr>
              </thead>
              <tbody>
                {transactionTypes.map(tt => (
                  <tr key={tt.code} className="border-b">
                    <td className="py-2 px-3 font-mono text-xs">{tt.code}</td>
                    <td className="py-2 px-3">{tt.name}</td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap gap-1">
                        {tt.triggers.map(t => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="secondary">{tt.defaultLevels} level{tt.defaultLevels > 1 ? 's' : ''}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <InfoCallout>
            Enable workflows via <code>company_transaction_workflow_settings</code>. Each enabled transaction 
            type creates approval requirements for matching actions from the integration engine.
          </InfoCallout>
        </CardContent>
      </Card>

      <StepByStep steps={workflowEnableSteps} title="Enabling Succession Workflows" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The HR Hub Pending Approvals dashboard shows all succession actions awaiting review:
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Dashboard Layout</h4>
            <div className="grid md:grid-cols-4 gap-2 text-center text-sm">
              <div className="p-3 bg-background rounded border">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-muted-foreground">Integration Actions</p>
              </div>
              <div className="p-3 bg-background rounded border">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-xs text-muted-foreground">Readiness Assessments</p>
              </div>
              <div className="p-3 bg-background rounded border">
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-xs text-muted-foreground">Pool Nominations</p>
              </div>
              <div className="p-3 bg-background rounded border">
                <p className="text-2xl font-bold text-amber-500">2</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Approval Card Information</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Employee:</strong> Name and current role</li>
              <li>• <strong>Action Type:</strong> What's being requested</li>
              <li>• <strong>Source:</strong> What triggered the action</li>
              <li>• <strong>Submitted:</strong> Date/time and submitter</li>
              <li>• <strong>Evidence:</strong> Link to supporting data</li>
              <li>• <strong>SLA Status:</strong> Time remaining for decision</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={approvalProcessSteps} title="Processing Pending Approvals" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Approval Procedures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            For high-volume periods (post-appraisal, cycle end), use bulk approval:
          </p>

          <div className="p-4 border rounded-lg">
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <span>Filter approvals by type and date range</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <span>Review summary statistics (counts by action type, average scores)</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <span>Select items for bulk action (checkbox selection or "Select All")</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <span>Click "Bulk Approve" or "Bulk Reject" with shared comment</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">5</Badge>
                <span>Confirm action - all selected items processed</span>
              </li>
            </ol>
          </div>

          <TipCallout>
            Use bulk approval for routine integration actions (e.g., Nine-Box updates from finalized appraisals) 
            after spot-checking a sample. Reserve individual review for exceptions and high-impact decisions.
          </TipCallout>
        </CardContent>
      </Card>

      <InfoCallout>
        Workflow configuration is shared across all modules. For detailed workflow template setup, 
        refer to the <strong>HR Hub Administrator Guide → Workflow Management</strong> section.
      </InfoCallout>
    </section>
  );
}

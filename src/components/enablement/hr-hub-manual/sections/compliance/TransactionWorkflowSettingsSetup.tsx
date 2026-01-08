import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock, Settings, CheckCircle, XCircle, ToggleRight, AlertTriangle } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';
import { WorkflowDiagram } from '@/components/enablement/manual/components/WorkflowDiagram';

const transactionTypes = [
  { name: 'New Hire', code: 'HIRE', description: 'Adding new employees to the system', defaultWorkflow: true, risk: 'Medium' },
  { name: 'Rehire', code: 'REHIRE', description: 'Returning employees after termination', defaultWorkflow: true, risk: 'Medium' },
  { name: 'Confirmation', code: 'CONFIRM', description: 'Probation period completion', defaultWorkflow: true, risk: 'Medium' },
  { name: 'Promotion', code: 'PROMOTE', description: 'Grade/title advancement', defaultWorkflow: true, risk: 'High' },
  { name: 'Transfer', code: 'TRANSFER', description: 'Department or location moves', defaultWorkflow: true, risk: 'Medium' },
  { name: 'Salary Change', code: 'SALARY', description: 'Compensation adjustments', defaultWorkflow: true, risk: 'High' },
  { name: 'Termination', code: 'TERM', description: 'Exit processing', defaultWorkflow: true, risk: 'High' }
];

const settingOptions = [
  { setting: 'Workflow Enabled', description: 'Master toggle for workflow requirement', effect: 'When off, transactions process without approval' },
  { setting: 'Workflow Template', description: 'Which approval chain to use', effect: 'Links to templates defined in Workflow Templates' },
  { setting: 'Auto-Start', description: 'Workflow begins automatically', effect: 'Eliminates manual workflow initiation step' },
  { setting: 'Block Until Approved', description: 'Transaction cannot take effect', effect: 'Prevents effective date until workflow completes' }
];

const configurationSteps = [
  {
    title: 'Navigate to Transaction Workflow Settings',
    description: 'Access HR Hub → Transaction Workflow Settings from the main menu.',
    expectedResult: 'Transaction Workflow Settings page loads'
  },
  {
    title: 'Select Company',
    description: 'Use the company dropdown in the header to select which company\'s settings you\'re configuring. Settings are company-specific.',
    expectedResult: 'Selected company\'s current configuration displays'
  },
  {
    title: 'Review Summary',
    description: 'The summary card shows how many transaction types have workflow enabled vs. disabled.',
    expectedResult: 'Quick overview of current configuration state'
  },
  {
    title: 'Configure Per-Transaction Settings',
    description: 'For each transaction type, configure the following settings:',
    substeps: [
      'Workflow Enabled: Toggle on to require approval',
      'Template: Select which workflow template to use',
      'Auto-Start: Enable for automatic workflow initiation',
      'Block Until Approved: Enable to prevent execution until complete'
    ],
    expectedResult: 'Each transaction type configured to requirements'
  },
  {
    title: 'Use Bulk Actions (Optional)',
    description: 'Use "Enable All" or "Disable All" buttons for rapid configuration of all transaction types.',
    expectedResult: 'All transaction types updated simultaneously'
  }
];

const settingFields = [
  { name: 'workflow_enabled', type: 'Boolean', required: true, description: 'Whether this transaction type requires workflow approval' },
  { name: 'workflow_template_id', type: 'UUID', required: false, description: 'The workflow template to use (required if enabled)' },
  { name: 'auto_start_workflow', type: 'Boolean', required: false, description: 'Automatically start workflow when transaction is created' },
  { name: 'requires_approval_before_effective', type: 'Boolean', required: false, description: 'Block transaction from taking effect until approved' }
];

const flowDiagram = `flowchart TD
    A[Transaction Created] --> B{Workflow Enabled?}
    B -->|No| C[Execute Immediately]
    B -->|Yes| D{Auto-Start?}
    D -->|Yes| E[Start Workflow]
    D -->|No| F[Wait for Manual Start]
    F --> E
    E --> G{Approved?}
    G -->|Yes| H{Block Until Approved?}
    H -->|Yes| I[Execute on Approval]
    H -->|No| J[Already Executed]
    G -->|No| K[Rejected - No Effect]`;

export function TransactionWorkflowSettingsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-3">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.3</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          8 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
              <GitBranch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle>Transaction Workflow Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure which employee transactions require workflow approval by company
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Transaction Workflow Settings control which employee lifecycle transactions require approval 
              workflows before taking effect. This is separate from ESS Approval Policies (which govern 
              employee self-service changes) and applies to HR-initiated transactions like hires, promotions, 
              and terminations.
            </p>
          </div>

          <InfoCallout title="Company-Specific Configuration">
            Settings are configured per company. Select the appropriate company from the dropdown before 
            making changes. This allows different subsidiaries to have different approval requirements 
            based on their size, regulatory environment, or governance structure.
          </InfoCallout>

          {/* Transaction Types */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Transaction Types</h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Transaction</th>
                    <th className="border p-3 text-left font-medium">Code</th>
                    <th className="border p-3 text-left font-medium">Description</th>
                    <th className="border p-3 text-left font-medium">Risk Level</th>
                    <th className="border p-3 text-left font-medium">Default</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionTypes.map((type, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-medium">{type.name}</td>
                      <td className="border p-3 font-mono text-xs">{type.code}</td>
                      <td className="border p-3 text-muted-foreground">{type.description}</td>
                      <td className="border p-3">
                        <Badge variant={type.risk === 'High' ? 'destructive' : 'secondary'}>
                          {type.risk}
                        </Badge>
                      </td>
                      <td className="border p-3">
                        {type.defaultWorkflow ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setting Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Per-Transaction Settings
            </h4>
            <div className="grid gap-3">
              {settingOptions.map((opt, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <ToggleRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">{opt.setting}</h5>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Effect: {opt.effect}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <WarningCallout title="Compliance Risk">
            Disabling workflow for high-risk transactions like terminations or salary changes may create 
            compliance exposure. Ensure your organization's policies and local regulations permit 
            unilateral action on these transaction types before disabling workflows.
          </WarningCallout>

          {/* Workflow Flow Diagram */}
          <WorkflowDiagram
            title="Transaction Workflow Decision Flow"
            description="How transactions are processed based on workflow settings"
            diagram={flowDiagram}
          />

          {/* Configuration Steps */}
          <StepByStep
            title="Configuration Procedure"
            steps={configurationSteps}
          />

          {/* Field Reference */}
          <FieldReferenceTable
            title="Setting Fields"
            fields={settingFields}
          />

          <TipCallout title="Recommended Configuration">
            Enable workflow with "Auto-Start" and "Block Until Approved" for salary changes and 
            terminations. This ensures these high-impact transactions cannot take effect until 
            properly authorized, while eliminating manual steps in workflow initiation.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Always enable workflow for salary changes and terminations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Use "Block Until Approved" for transactions that shouldn't take effect prematurely</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Enable "Auto-Start" to reduce manual intervention and speed up processing</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Configure workflow templates before enabling transaction workflows</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

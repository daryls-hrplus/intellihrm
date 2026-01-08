import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Shield, Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const requestTypesByRisk = [
  { riskLevel: 'Low', types: ['Emergency Contact', 'Address', 'Medical Information'], defaultMode: 'Auto-Approve', rationale: 'Minimal payroll/compliance impact' },
  { riskLevel: 'Medium', types: ['Personal Contact (Phone, Email)', 'Qualifications', 'Dependents', 'Marital Status', 'Government IDs', 'Name Change'], defaultMode: 'HR Review', rationale: 'May affect benefits, payroll, or compliance records' },
  { riskLevel: 'High', types: ['Banking Details'], defaultMode: 'HR Review + Documentation', rationale: 'Direct fraud risk; requires audit trail' }
];

const approvalModes = [
  { mode: 'Auto-Approve', behavior: 'Changes applied immediately without HR review', useWhen: 'Low-risk data changes, audit trail sufficient', icon: CheckCircle },
  { mode: 'HR Review', behavior: 'Changes held pending until HR approves or rejects', useWhen: 'Compliance-sensitive fields, payroll-affecting data', icon: Clock },
  { mode: 'Workflow', behavior: 'Changes routed through multi-step approval chain', useWhen: 'High-risk changes requiring multiple sign-offs', icon: Shield }
];

const configurationSteps = [
  {
    title: 'Navigate to ESS Approval Policies',
    description: 'Access HR Hub → ESS Approval Policies from the main menu.',
    expectedResult: 'ESS Approval Policies page loads with current configuration'
  },
  {
    title: 'Initial Setup with Seed Defaults',
    description: 'If no policies exist, click "Seed Default Policies" to create industry-standard policies for all request types. This is the recommended starting point.',
    expectedResult: 'Policies are created for all request types with appropriate approval modes'
  },
  {
    title: 'Add or Edit Policy',
    description: 'Click "Add Policy" for a new request type or click the edit icon on an existing policy.',
    expectedResult: 'Policy dialog opens with configuration options'
  },
  {
    title: 'Select Request Type',
    description: 'Choose the ESS request type this policy governs. Each request type can only have one active policy.',
    expectedResult: 'Request type is selected'
  },
  {
    title: 'Choose Approval Mode',
    description: 'Select from Auto-Approve, HR Review, or Workflow based on risk level and compliance requirements.',
    substeps: [
      'Auto-Approve: Immediate application with optional HR notification',
      'HR Review: Changes require explicit HR approval',
      'Workflow: Routes through configured workflow template'
    ],
    expectedResult: 'Approval mode configured appropriately for risk level'
  },
  {
    title: 'Configure Notifications',
    description: 'For Auto-Approve mode, enable "Notify HR" to ensure visibility even when changes are automatically applied.',
    expectedResult: 'HR receives notification for audit awareness'
  },
  {
    title: 'Set Documentation Requirements',
    description: 'Enable "Requires Documentation" for changes that need supporting evidence (e.g., marriage certificate for marital status change).',
    expectedResult: 'Employees must upload documents when submitting changes'
  },
  {
    title: 'Toggle Active Status',
    description: 'Use the status switch to enable or disable the policy. Inactive policies are ignored during ESS submissions.',
    expectedResult: 'Policy enforcement is controlled without deletion'
  }
];

const policyFields = [
  { name: 'request_type', type: 'Select', required: true, description: 'The ESS request type this policy governs' },
  { name: 'approval_mode', type: 'Select', required: true, description: 'Auto-Approve, HR Review, or Workflow' },
  { name: 'notification_only', type: 'Boolean', required: false, description: 'Send HR notification even on auto-approve (only visible for Auto-Approve mode)' },
  { name: 'requires_documentation', type: 'Boolean', required: false, description: 'Require file upload with submission' },
  { name: 'workflow_template_id', type: 'UUID', required: false, description: 'Workflow template to use (only for Workflow mode)' },
  { name: 'is_active', type: 'Boolean', required: true, description: 'Enable/disable policy enforcement' }
];

export function ESSApprovalPoliciesSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-1">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.1</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          8 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>ESS Approval Policies</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Control how employee self-service profile changes are reviewed and approved
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              ESS Approval Policies govern how changes submitted through Employee Self-Service are processed. 
              By configuring policies for each request type, organizations can balance employee autonomy with 
              compliance requirements and fraud prevention.
            </p>
          </div>

          <InfoCallout title="Why ESS Approval Policies Matter">
            Without proper policies, sensitive data changes (like banking details) could be applied immediately, 
            creating security and compliance risks. ESS Approval Policies ensure the right level of oversight 
            for each type of employee data change.
          </InfoCallout>

          {/* Request Types by Risk Level */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Request Types by Risk Level</h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Risk Level</th>
                    <th className="border p-3 text-left font-medium">Request Types</th>
                    <th className="border p-3 text-left font-medium">Default Mode</th>
                    <th className="border p-3 text-left font-medium">Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {requestTypesByRisk.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border p-3">
                        <Badge variant={row.riskLevel === 'High' ? 'destructive' : row.riskLevel === 'Medium' ? 'secondary' : 'outline'}>
                          {row.riskLevel}
                        </Badge>
                      </td>
                      <td className="border p-3">{row.types.join(', ')}</td>
                      <td className="border p-3 font-medium">{row.defaultMode}</td>
                      <td className="border p-3 text-muted-foreground">{row.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approval Modes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Approval Modes Explained</h4>
            <div className="grid gap-4 md:grid-cols-3">
              {approvalModes.map((mode, idx) => (
                <Card key={idx} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <mode.icon className="h-5 w-5 text-primary" />
                      <h5 className="font-medium">{mode.mode}</h5>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{mode.behavior}</p>
                    <Badge variant="outline" className="text-xs">Use when: {mode.useWhen}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <WarningCallout title="Banking Details Security">
            Banking details should NEVER be set to Auto-Approve. This is a primary vector for payroll fraud. 
            Always require HR Review at minimum, and consider requiring documentation (such as a voided check 
            or bank statement) to verify account ownership.
          </WarningCallout>

          {/* Configuration Steps */}
          <StepByStep
            title="Configuration Procedure"
            steps={configurationSteps}
          />

          {/* Field Reference */}
          <FieldReferenceTable
            title="Policy Configuration Fields"
            fields={policyFields}
          />

          <TipCallout title="Quick Start Recommendation">
            Use "Seed Default Policies" for initial setup. This creates policies for all request types with 
            sensible defaults based on risk levels. You can then fine-tune individual policies as needed for 
            your organization's specific requirements.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Enable "Notify HR" for auto-approved low-risk changes to maintain visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Require documentation for changes affecting payroll or benefits (marital status, dependents)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Review regional compliance requirements for government ID changes</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Never auto-approve banking details or other payroll-affecting fields</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

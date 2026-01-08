import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Clock, Calendar, CheckCircle, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { StepByStep } from '@/components/enablement/manual/components/StepByStep';
import { FieldReferenceTable } from '@/components/enablement/manual/components/FieldReferenceTable';

const delegationUseCases = [
  { scenario: 'Annual Leave', description: 'Delegating approvals during vacation', duration: '1-4 weeks' },
  { scenario: 'Business Travel', description: 'Coverage while traveling without reliable access', duration: 'Days to weeks' },
  { scenario: 'Medical Leave', description: 'Extended absence due to health', duration: 'Weeks to months' },
  { scenario: 'Training Course', description: 'Intensive training with limited availability', duration: 'Days to weeks' },
  { scenario: 'Project Focus', description: 'Temporarily offloading approvals during critical project phases', duration: 'Variable' }
];

const delegationStatuses = [
  { status: 'Scheduled', description: 'Future-dated delegation, not yet active', color: 'bg-blue-500/20 text-blue-700' },
  { status: 'Active', description: 'Currently in effect, delegate receives approvals', color: 'bg-green-500/20 text-green-700' },
  { status: 'Expired', description: 'Past end date, no longer in effect', color: 'bg-red-500/20 text-red-700' },
  { status: 'Inactive', description: 'Manually disabled before expiry', color: 'bg-gray-500/20 text-gray-700' }
];

const configurationSteps = [
  {
    title: 'Navigate to Approval Delegations',
    description: 'Access Admin → Approval Delegations from the main menu.',
    expectedResult: 'Approval Delegations page loads with your current delegations'
  },
  {
    title: 'Create New Delegation',
    description: 'Click "Create Delegation" to open the delegation form.',
    expectedResult: 'Delegation creation dialog opens'
  },
  {
    title: 'Select Delegate',
    description: 'Choose the person who will approve on your behalf. This should be someone familiar with your approval responsibilities and authorized to make similar decisions.',
    expectedResult: 'Delegate is selected from employee list'
  },
  {
    title: 'Set Delegation Period',
    description: 'Enter the start and end dates for the delegation. The delegation will automatically activate and deactivate based on these dates.',
    substeps: [
      'Start Date: When delegate begins receiving your approvals',
      'End Date: When delegation expires and you resume approving'
    ],
    expectedResult: 'Delegation period is defined'
  },
  {
    title: 'Add Reason (Recommended)',
    description: 'Enter the reason for delegation (e.g., "Annual leave - Barbados trip"). This helps with audit trails.',
    expectedResult: 'Delegation reason documented for transparency'
  },
  {
    title: 'Save Delegation',
    description: 'Click Create to save the delegation. It will show as "Scheduled" until the start date.',
    expectedResult: 'Delegation is created and tracked'
  }
];

const delegationFields = [
  { name: 'delegate_id', type: 'UUID', required: true, description: 'The user who will approve on your behalf' },
  { name: 'start_date', type: 'Date', required: true, description: 'When the delegation becomes active' },
  { name: 'end_date', type: 'Date', required: true, description: 'When the delegation expires' },
  { name: 'reason', type: 'Text', required: false, description: 'Reason for delegation (for audit trail)' },
  { name: 'is_active', type: 'Boolean', required: true, description: 'Whether the delegation is enabled' }
];

export function ApprovalDelegationsSetup() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-3-5">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-purple-600 border-purple-300">Section 3.5</Badge>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          6 min read
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/50">
              <UserCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <CardTitle>Approval Delegations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Business continuity for approval chains during planned absences
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            Approval Delegations allow users to temporarily transfer their approval responsibilities 
            to a colleague during planned absences. This ensures workflows continue to progress 
            even when key approvers are unavailable, preventing bottlenecks and delays.
          </p>

          <InfoCallout title="Scope of Delegation">
            Delegations transfer only YOUR pending approvals to the delegate. They do not transfer 
            your roles, permissions, or access to data. The delegate receives approval requests 
            that would normally come to you, but they use their own credentials and access levels.
          </InfoCallout>

          {/* Use Cases */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Common Use Cases
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {delegationUseCases.map((useCase, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                  <ArrowRightLeft className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">{useCase.scenario}</h5>
                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    <Badge variant="outline" className="text-xs mt-1">Typical: {useCase.duration}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Lifecycle */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Delegation Status Lifecycle</h4>
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border p-3 text-left font-medium">Status</th>
                    <th className="border p-3 text-left font-medium">Description</th>
                    <th className="border p-3 text-left font-medium">Visual</th>
                  </tr>
                </thead>
                <tbody>
                  {delegationStatuses.map((status, idx) => (
                    <tr key={idx}>
                      <td className="border p-3 font-medium">{status.status}</td>
                      <td className="border p-3 text-muted-foreground">{status.description}</td>
                      <td className="border p-3">
                        <Badge className={status.color}>{status.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Configuration Steps */}
          <StepByStep
            title="Creating a Delegation"
            steps={configurationSteps}
          />

          {/* Field Reference */}
          <FieldReferenceTable
            title="Delegation Fields"
            fields={delegationFields}
          />

          <WarningCallout title="Delegate Selection">
            Choose a delegate who is familiar with the types of approvals you handle and has 
            appropriate organizational authority. Delegating to someone too junior may result 
            in approvals being made without proper understanding of the implications.
          </WarningCallout>

          <TipCallout title="Plan Ahead">
            Create delegations BEFORE your planned absence, not at the last minute. This gives 
            your delegate time to prepare and allows the system to properly queue approvals 
            when your absence begins.
          </TipCallout>

          {/* Best Practices */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Best Practices</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Set appropriate end dates - don't leave delegations open-ended</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Inform your delegate before creating the delegation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Add a clear reason for audit and organizational visibility</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                <span>Review and delete expired delegations periodically</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                <span>Don't delegate to people outside your chain of authority</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

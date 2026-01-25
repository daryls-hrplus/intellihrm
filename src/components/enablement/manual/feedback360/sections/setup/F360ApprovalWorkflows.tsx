import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { ConfigurationExample, ExampleConfig } from '@/components/enablement/manual/components/ConfigurationExample';
import { PrerequisiteAlert } from '@/components/enablement/manual/components/PrerequisiteAlert';
import { Callout, TipCallout, WarningCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Workflow, 
  CheckCircle2,
  ArrowRight,
  Settings,
  Clock,
  Users,
  Shield,
  AlertTriangle
} from 'lucide-react';

export function F360ApprovalWorkflows() {
  const workflowFields: FieldDefinition[] = [
    {
      name: 'template_name',
      required: true,
      type: 'Text',
      description: 'Unique name for the workflow template',
      defaultValue: '—',
      validation: 'Max 100 characters',
    },
    {
      name: 'process_type',
      required: true,
      type: 'Enum',
      description: 'Type of process: peer_nomination_approval, report_release, investigation_access',
      defaultValue: 'peer_nomination_approval',
      validation: 'Must match 360 transaction type',
    },
    {
      name: 'scope_level',
      required: true,
      type: 'Enum',
      description: 'individual, team, department, company',
      defaultValue: 'individual',
      validation: '—',
    },
    {
      name: 'is_active',
      required: true,
      type: 'Boolean',
      description: 'Whether workflow is currently active',
      defaultValue: 'true',
      validation: '—',
    },
    {
      name: 'sla_hours',
      required: false,
      type: 'Number',
      description: 'Hours before escalation triggers',
      defaultValue: '72',
      validation: 'Range: 1-720',
    },
    {
      name: 'auto_approve_on_timeout',
      required: false,
      type: 'Boolean',
      description: 'Auto-approve if SLA expires without action',
      defaultValue: 'false',
      validation: '—',
    },
    {
      name: 'require_all_approvers',
      required: false,
      type: 'Boolean',
      description: 'All approvers must approve (AND) vs any (OR)',
      defaultValue: 'true',
      validation: '—',
    },
  ];

  const stepFields: FieldDefinition[] = [
    {
      name: 'step_order',
      required: true,
      type: 'Number',
      description: 'Sequential order of the step (1, 2, 3...)',
      defaultValue: '1',
      validation: 'Must be unique within template',
    },
    {
      name: 'step_name',
      required: true,
      type: 'Text',
      description: 'Display name for the step',
      defaultValue: '—',
      validation: 'Max 100 characters',
    },
    {
      name: 'approver_type',
      required: true,
      type: 'Enum',
      description: 'manager, skip_level_manager, hr, department_head, custom_role',
      defaultValue: 'manager',
      validation: '—',
    },
    {
      name: 'approver_role_id',
      required: false,
      type: 'UUID',
      description: 'Custom role ID if approver_type is custom_role',
      defaultValue: 'null',
      validation: 'Must exist in roles table',
    },
    {
      name: 'sla_hours',
      required: false,
      type: 'Number',
      description: 'Step-specific SLA override',
      defaultValue: 'Inherits from template',
      validation: 'Range: 1-720',
    },
    {
      name: 'can_delegate',
      required: false,
      type: 'Boolean',
      description: 'Approver can delegate to another user',
      defaultValue: 'false',
      validation: '—',
    },
  ];

  const workflowExamples: ExampleConfig[] = [
    {
      title: 'Peer Nomination Approval',
      context: 'Managers must approve peer nominations before raters are invited.',
      values: [
        { field: 'template_name', value: '360 Peer Nomination - Manager Approval' },
        { field: 'process_type', value: 'peer_nomination_approval' },
        { field: 'Step 1 Approver', value: 'manager' },
        { field: 'SLA Hours', value: '48' },
        { field: 'auto_approve_on_timeout', value: 'false' },
      ],
      outcome: 'Employees nominate peers, manager reviews and approves. Raters are only invited after approval.',
    },
    {
      title: 'Results Release Approval',
      context: 'HR must approve before 360 results are visible to employees.',
      values: [
        { field: 'template_name', value: '360 Results Release - HR Approval' },
        { field: 'process_type', value: 'report_release' },
        { field: 'Step 1 Approver', value: 'hr' },
        { field: 'SLA Hours', value: '72' },
        { field: 'auto_approve_on_timeout', value: 'true' },
      ],
      outcome: 'HR reviews aggregated results before release. Auto-releases after 72 hours if no action.',
    },
    {
      title: 'Investigation Access Approval',
      context: 'Skip-level manager and Legal must approve investigation access to raw responses.',
      values: [
        { field: 'template_name', value: '360 Investigation - Dual Approval' },
        { field: 'process_type', value: 'investigation_access' },
        { field: 'Step 1', value: 'skip_level_manager (48h SLA)' },
        { field: 'Step 2', value: 'custom_role: Legal (24h SLA)' },
        { field: 'require_all_approvers', value: 'true' },
      ],
      outcome: 'Both approvers must approve. Investigation access is time-limited and fully audited.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Workflow className="h-5 w-5 text-primary" />
        2.0a Approval Workflows for 360 Feedback
      </h3>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Configure approval workflows specific to 360 feedback processes',
          'Understand the three workflow types: nomination approval, results release, investigation access',
          'Set up SLA-based escalation and auto-approval rules',
          'Implement multi-step approval chains with delegation capabilities',
        ]}
      />

      {/* Prerequisites */}
      <PrerequisiteAlert
        items={[
          'Core Framework → Workflows tab accessed (Performance → Setup → Core Framework → Workflows)',
          'At least one 360 feedback cycle exists (for testing workflow triggers)',
          'HR and Manager roles configured with appropriate permissions',
        ]}
      />

      {/* Navigation Path */}
      <Callout variant="info" title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Setup → Core Framework → Workflows → Add Template → Select "360 Feedback" Category
        </code>
      </Callout>

      {/* Workflow Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            360-Specific Workflow Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-emerald-600" />
                <h4 className="font-semibold text-sm">Peer Nomination Approval</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Route peer nominations through manager approval before invitations are sent.
              </p>
              <Badge variant="outline" className="text-xs">FEEDBACK_360_NOMINATION</Badge>
            </div>

            <div className="p-4 rounded-lg border bg-blue-500/5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Results Release Approval</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                HR review before 360 feedback results are visible to employees.
              </p>
              <Badge variant="outline" className="text-xs">FEEDBACK_360_RELEASE</Badge>
            </div>

            <div className="p-4 rounded-lg border bg-rose-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-rose-600" />
                <h4 className="font-semibold text-sm">Investigation Access</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Multi-step approval for accessing raw (non-anonymized) feedback responses.
              </p>
              <Badge variant="outline" className="text-xs">FEEDBACK_360_INVESTIGATION</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Reference - Workflow Template */}
      <FieldReferenceTable
        title="Workflow Template Configuration"
        fields={workflowFields}
      />

      {/* Field Reference - Workflow Steps */}
      <FieldReferenceTable
        title="Workflow Step Configuration"
        fields={stepFields}
      />

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Creating a Results Release Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">1</span>
              <div>
                <p className="font-medium">Navigate to Workflow Configuration</p>
                <p className="text-sm text-muted-foreground">Performance → Setup → Core Framework → Workflows</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">2</span>
              <div>
                <p className="font-medium">Click "Add Workflow Template"</p>
                <p className="text-sm text-muted-foreground">Opens the template creation dialog</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">3</span>
              <div>
                <p className="font-medium">Select Category: "360 Feedback"</p>
                <p className="text-sm text-muted-foreground">Filters process types to 360-specific options</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">4</span>
              <div>
                <p className="font-medium">Select Process Type: "Results Release"</p>
                <p className="text-sm text-muted-foreground">Maps to FEEDBACK_360_RELEASE transaction type</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">5</span>
              <div>
                <p className="font-medium">Configure Template Settings</p>
                <p className="text-sm text-muted-foreground">Set SLA hours (e.g., 72), scope level (individual), and auto-approve behavior</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">6</span>
              <div>
                <p className="font-medium">Add Approval Steps</p>
                <p className="text-sm text-muted-foreground">
                  Add Step 1: HR Representative (48h SLA)<br />
                  Optionally add Step 2: Manager (24h SLA) for dual approval
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">7</span>
              <div>
                <p className="font-medium">Save and Activate</p>
                <p className="text-sm text-muted-foreground">Template appears in active workflows list</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">8</span>
              <div>
                <p className="font-medium">Link to 360 Cycle (Optional)</p>
                <p className="text-sm text-muted-foreground">In cycle configuration, enable "Require Release Approval" and select workflow template</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Configuration Examples */}
      <ConfigurationExample examples={workflowExamples} />

      {/* SLA & Escalation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Configuration & Escalation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">SLA Levels</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Template-level SLA:</strong> Default for all steps</li>
                <li>• <strong>Step-level SLA:</strong> Override for specific steps</li>
                <li>• <strong>Priority override:</strong> Critical items can have shorter SLAs</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Escalation Actions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Reminder:</strong> Send reminder at 50% and 75% SLA</li>
                <li>• <strong>Escalate:</strong> Notify skip-level manager on SLA breach</li>
                <li>• <strong>Auto-approve:</strong> Automatically approve if configured</li>
                <li>• <strong>Block:</strong> Hold until manual action (default)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Business Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg border bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Investigation Access Requires Dual Approval</p>
                <p className="text-xs text-muted-foreground">System enforces minimum 2 approvers for investigation_access workflows</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border bg-blue-500/5">
              <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Release Approval is Optional</p>
                <p className="text-xs text-muted-foreground">If no release workflow is configured, results are available immediately on cycle close</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border bg-emerald-500/5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Nomination Approval Only When Enabled</p>
                <p className="text-xs text-muted-foreground">Workflow triggers only if cycle has "require_nomination_approval" = true</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm">Workflow not triggering?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Verify workflow is linked to the cycle configuration</li>
                <li>• Check that workflow status is "active"</li>
                <li>• Confirm transaction type matches the action (release vs nomination)</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm">Approver not receiving notifications?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Check approver's notification preferences in their profile</li>
                <li>• Verify email templates are configured for 360 workflow category</li>
                <li>• Review notification_logs for delivery status</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm">Auto-approve not working?</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• Confirm auto_approve_on_timeout is set to true</li>
                <li>• Check that SLA hours have actually elapsed</li>
                <li>• Investigation workflows cannot auto-approve (governance requirement)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cross-Reference */}
      <TipCallout title="Cross-Reference">
        For general workflow configuration patterns, see the Appraisals Manual Section 2.9 (Approval Workflows). 
        The same workflow engine powers both modules.
      </TipCallout>
    </div>
  );
}

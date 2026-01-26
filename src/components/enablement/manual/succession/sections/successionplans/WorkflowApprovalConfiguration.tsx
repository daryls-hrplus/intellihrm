import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  Workflow, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  Shield,
  GitBranch,
  Bell
} from 'lucide-react';

export function WorkflowApprovalConfiguration() {
  const workflowTemplateFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: false, type: 'UUID', description: 'Reference to company (null for global templates)' },
    { name: 'code', required: true, type: 'Text', description: 'Unique template identifier', validation: 'e.g., SUCCESSION_READINESS_APPROVAL' },
    { name: 'name', required: true, type: 'Text', description: 'Human-readable template name' },
    { name: 'description', required: false, type: 'Text', description: 'Template purpose and usage' },
    { name: 'category', required: true, type: 'Text', description: 'Workflow category', validation: 'succession_approval' },
    { name: 'is_active', required: true, type: 'Boolean', description: 'Whether template is enabled', defaultValue: 'true' },
    { name: 'is_global', required: false, type: 'Boolean', description: 'Whether template is available globally', defaultValue: 'false' },
    { name: 'requires_signature', required: false, type: 'Boolean', description: 'Whether digital signature is required', defaultValue: 'false' },
    { name: 'requires_letter', required: false, type: 'Boolean', description: 'Whether formal letter is required', defaultValue: 'false' },
    { name: 'letter_template_id', required: false, type: 'UUID', description: 'Reference to letter template if required' },
    { name: 'auto_terminate_hours', required: false, type: 'Integer', description: 'Hours until workflow auto-terminates' },
    { name: 'allow_return_to_previous', required: false, type: 'Boolean', description: 'Allow returning to previous step', defaultValue: 'true' },
    { name: 'start_date', required: false, type: 'Date', description: 'Template effective start date' },
    { name: 'end_date', required: false, type: 'Date', description: 'Template effective end date' },
    { name: 'department_id', required: false, type: 'UUID', description: 'Scope to specific department' },
    { name: 'section_id', required: false, type: 'UUID', description: 'Scope to specific section' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const transactionWorkflowFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'transaction_type_id', required: true, type: 'UUID', description: 'Reference to transaction type', validation: 'Foreign key to transaction_types' },
    { name: 'workflow_enabled', required: true, type: 'Boolean', description: 'Whether workflow approval is required', defaultValue: 'false' },
    { name: 'workflow_template_id', required: false, type: 'UUID', description: 'Reference to workflow template', validation: 'Required if workflow_enabled is true' },
    { name: 'requires_approval_before_effective', required: false, type: 'Boolean', description: 'Block effective date until approved', defaultValue: 'false' },
    { name: 'auto_start_workflow', required: false, type: 'Boolean', description: 'Automatically start workflow on submit', defaultValue: 'false' },
    { name: 'effective_date', required: false, type: 'Date', description: 'When setting becomes effective' },
    { name: 'end_date', required: false, type: 'Date', description: 'When setting expires' },
    { name: 'is_active', required: false, type: 'Boolean', description: 'Whether setting is active', defaultValue: 'true' },
    { name: 'created_by', required: false, type: 'UUID', description: 'User who created the setting' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const successionWorkflows = [
    { 
      code: 'SUCCESSION_READINESS_APPROVAL', 
      name: 'Succession Readiness Assessment Approval',
      transactionType: 'SUCC_READINESS_APPROVAL',
      description: 'Approval workflow for completing readiness assessments',
      defaultSteps: ['Manager', 'HR Partner', 'HR Manager (optional)']
    },
    { 
      code: 'SUCCESSION_PLAN_APPROVAL', 
      name: 'Succession Plan Approval',
      transactionType: 'PERF_SUCCESSION_APPROVAL',
      description: 'Approval workflow for creating or modifying succession plans',
      defaultSteps: ['HR Partner', 'HRBP', 'HR Director']
    },
    { 
      code: 'TALENT_POOL_NOMINATION_APPROVAL', 
      name: 'Talent Pool Nomination Approval',
      transactionType: 'TALENT_POOL_NOMINATION',
      description: 'Approval workflow for talent pool nominations',
      defaultSteps: ['HR Partner']
    }
  ];

  const configureWorkflowSteps: Step[] = [
    {
      title: 'Access Transaction Workflow Settings',
      description: 'Navigate to the workflow configuration page.',
      substeps: [
        'Go to HR Hub → Settings → Transaction Workflow Settings',
        'Select your company from the company filter dropdown',
        'The grid displays all transaction types and their workflow status'
      ],
      expectedResult: 'Transaction Workflow Settings page is displayed'
    },
    {
      title: 'Locate Succession Transaction Types',
      description: 'Find the succession-related transaction types.',
      substeps: [
        'Scroll or search for SUCC_READINESS_APPROVAL',
        'Also locate PERF_SUCCESSION_APPROVAL if plan approval is needed',
        'Note the current "Requires Workflow" status'
      ],
      expectedResult: 'Succession transaction types are visible'
    },
    {
      title: 'Enable Workflow Requirement',
      description: 'Toggle the workflow requirement on.',
      substeps: [
        'Click the toggle switch in the "Requires Workflow" column',
        'The toggle turns on and a template selector appears',
        'Select SUCCESSION_READINESS_APPROVAL template'
      ],
      expectedResult: 'Workflow is enabled for the transaction type'
    },
    {
      title: 'Review Workflow Template',
      description: 'Verify the approval chain is appropriate.',
      substeps: [
        'Click "View Template" or the template name',
        'Review the approval steps: typically Manager → HR Partner → HR Manager',
        'Note the step order and any parallel approvals'
      ],
      expectedResult: 'Workflow template details are reviewed'
    },
    {
      title: 'Customize Template (Optional)',
      description: 'Modify the workflow template if needed.',
      substeps: [
        'If customization is needed, navigate to Workflow Template Management',
        'Clone the template or edit directly (if permitted)',
        'Adjust approvers, add/remove steps, configure escalation',
        'Save and assign the modified template'
      ],
      notes: [
        'Custom templates allow organization-specific approval chains',
        'Consider skip-level approval for executive succession plans'
      ],
      expectedResult: 'Customized workflow template is configured'
    },
    {
      title: 'Test Workflow',
      description: 'Verify the workflow functions correctly.',
      substeps: [
        'Trigger a test transaction (e.g., complete a readiness assessment)',
        'Verify approval request is created',
        'Check that approvers receive notifications',
        'Complete the approval cycle and verify completion'
      ],
      expectedResult: 'Workflow executes correctly end-to-end'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Company-scoped settings', enforcement: 'System', description: 'Workflow settings are configured per company independently.' },
    { rule: 'Template required', enforcement: 'System', description: 'If requires_workflow is true, a valid template must be assigned.' },
    { rule: 'One setting per type', enforcement: 'System', description: 'Each transaction type has one setting record per company.' },
    { rule: 'Immediate effect', enforcement: 'System', description: 'Changes apply immediately to new transactions.' },
    { rule: 'In-flight unaffected', enforcement: 'System', description: 'Transactions already in workflow continue with their original workflow.' },
    { rule: 'HR role required', enforcement: 'System', description: 'Only HR Partner or Admin can modify workflow settings.' },
    { rule: 'Audit logging', enforcement: 'System', description: 'All workflow configuration changes are logged.' }
  ];

  return (
    <section id="sec-6-10" data-manual-anchor="sec-6-10" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.10 Workflow & Approval Configuration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure HR Hub approval workflows for succession processes
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Identify succession-related workflow templates and transaction types',
          'Enable workflow approval for succession transactions',
          'Customize workflow templates for organizational requirements',
          'Integrate succession workflows with HR Hub approval processes'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">HR Hub</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Settings</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Transaction Workflow Settings</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Succession Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Succession Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The system includes pre-configured workflow templates for succession-related approvals.
          </p>

          <div className="space-y-3">
            {successionWorkflows.map((workflow) => (
              <div key={workflow.code} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-sm">{workflow.name}</h5>
                    <Badge variant="outline" className="text-xs font-mono mt-1">{workflow.code}</Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">{workflow.transactionType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{workflow.description}</p>
                <div className="p-2 bg-muted/50 rounded text-xs">
                  <span className="font-medium">Default Steps:</span>
                  <span className="ml-2">{workflow.defaultSteps.join(' → ')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference: Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5 text-primary" />
            workflow_templates Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={workflowTemplateFields} />
        </CardContent>
      </Card>

      {/* Field Reference: Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            company_transaction_workflow_settings Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={transactionWorkflowFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Configure Succession Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={configureWorkflowSteps} title="" />
        </CardContent>
      </Card>

      {/* Workflow Approval Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Approval Flow Example
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When a succession transaction is submitted, it flows through the configured approval chain.
          </p>

          {/* Simulated Flow */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 bg-muted border-b">
              <span className="font-medium text-sm">SUCCESSION_READINESS_APPROVAL Example</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, role: 'Assessment Submitted', status: 'complete' },
                  { step: 2, role: 'Manager Approves', status: 'complete' },
                  { step: 3, role: 'HR Partner Approves', status: 'pending' },
                  { step: 4, role: 'Candidate Updated', status: 'waiting' }
                ].map((item, index, arr) => (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        item.status === 'complete' ? 'bg-green-500/20' :
                        item.status === 'pending' ? 'bg-amber-500/20' : 'bg-muted'
                      }`}>
                        {item.status === 'complete' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{item.step}</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-center">{item.role}</span>
                      <Badge 
                        variant={item.status === 'complete' ? 'default' : item.status === 'pending' ? 'secondary' : 'outline'}
                        className="mt-1 text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    {index < arr.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Notification Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Workflow approvals integrate with the notification system to alert approvers.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Approval Request</h5>
              <p className="text-xs text-muted-foreground">
                When a workflow step requires action, the designated approver receives 
                an email and in-app notification with a link to the approval page.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <h5 className="font-medium text-sm mb-2">Approval Complete</h5>
              <p className="text-xs text-muted-foreground">
                When all approvals are complete, the transaction submitter receives 
                a notification confirming the action has been processed.
              </p>
            </div>
          </div>

          <div className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Escalation:</strong> Configure escalation rules in the workflow template 
                to automatically escalate stale approvals. Standard escalation is 3 business days 
                for succession-related approvals.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Workflow Configuration Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Enable workflow approval for readiness assessments to ensure HR review',
              'Keep approval chains short (2-3 steps) to avoid bottlenecks',
              'Configure escalation to prevent approval delays',
              'Test workflows thoroughly before production use',
              'Document custom workflow configurations for audit',
              'Review pending approvals regularly via HR Hub dashboard'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Industry Benchmark:</strong> Organizations with formal approval workflows 
              for succession decisions report 60% higher audit compliance scores and 35% reduction 
              in contested promotion decisions (Gartner HR Operations Report 2024).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

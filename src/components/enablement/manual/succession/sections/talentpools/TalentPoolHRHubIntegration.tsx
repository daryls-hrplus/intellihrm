import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  LayoutDashboard, 
  Settings, 
  ChevronRight, 
  GitBranch,
  CheckCircle,
  Info,
  Users,
  Target,
  ClipboardCheck,
  Link2,
  Workflow,
  Shield
} from 'lucide-react';

export function TalentPoolHRHubIntegration() {
  const workflowSettingsFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'transaction_type_code', required: true, type: 'Text', description: 'Code identifying the transaction type', validation: 'Must match lookup_values entry' },
    { name: 'requires_workflow', required: true, type: 'Boolean', description: 'Whether this transaction requires approval workflow', defaultValue: 'false' },
    { name: 'workflow_template_id', required: false, type: 'UUID', description: 'Reference to workflow template if workflow required', validation: 'Required if requires_workflow is true' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' },
    { name: 'created_by', required: false, type: 'UUID', description: 'User who created the record' }
  ];

  const successionTransactionTypes = [
    { 
      code: 'PERF_SUCCESSION_APPROVAL', 
      name: 'Succession Plan Approval',
      description: 'Approval workflow for succession plan creation or major updates',
      module: 'Succession',
      defaultWorkflow: 'SUCCESSION_PLAN_APPROVAL'
    },
    { 
      code: 'SUCC_READINESS_APPROVAL', 
      name: 'Succession Readiness Approval',
      description: 'Approval for readiness assessment completion and band assignment',
      module: 'Succession',
      defaultWorkflow: 'SUCCESSION_READINESS_APPROVAL'
    },
    { 
      code: 'TALENT_POOL_NOMINATION', 
      name: 'Talent Pool Nomination',
      description: 'Manager-initiated talent pool nomination requiring HR review',
      module: 'Talent Pools',
      defaultWorkflow: 'TALENT_POOL_NOMINATION_APPROVAL'
    }
  ];

  const hrHubModules = [
    { name: 'Succession', icon: 'Target', route: '/succession', description: 'Succession plans, key positions, candidates' },
    { name: 'Talent Pools', icon: 'Users', route: '/succession/talent-pools', description: 'Pool management and nominations' },
    { name: 'Pending Approvals', icon: 'ClipboardCheck', route: '/hr-hub/approvals', description: 'All pending workflow approvals' },
    { name: 'Integration Dashboard', icon: 'Link2', route: '/hr-hub/integration', description: 'Cross-module integration status' }
  ];

  const enableWorkflowSteps: Step[] = [
    {
      title: 'Access Transaction Workflow Settings',
      description: 'Navigate to the workflow configuration page.',
      substeps: [
        'Go to HR Hub → Settings → Transaction Workflow Settings',
        'Or navigate via Admin → Workflows → Transaction Settings',
        'Select your company from the company filter dropdown'
      ],
      expectedResult: 'Transaction Workflow Settings page is displayed with a grid of transaction types'
    },
    {
      title: 'Locate Succession Transaction Types',
      description: 'Find the succession-related transaction types in the grid.',
      substeps: [
        'Scroll or filter to find PERF_SUCCESSION_APPROVAL',
        'Also locate SUCC_READINESS_APPROVAL',
        'And TALENT_POOL_NOMINATION if applicable'
      ],
      notes: [
        'Transaction types are organized by module category',
        'Succession types are typically in the "Performance/Succession" category'
      ],
      expectedResult: 'Succession transaction types are visible in the grid'
    },
    {
      title: 'Enable Workflow Requirement',
      description: 'Toggle the workflow requirement for succession transactions.',
      substeps: [
        'Click the toggle switch in the "Requires Workflow" column',
        'The toggle will turn on and prompt for workflow template selection',
        'Select the appropriate workflow template from the dropdown'
      ],
      notes: [
        'SUCCESSION_READINESS_APPROVAL is the standard template for readiness assessments',
        'You can create custom templates in Workflow Template Management'
      ],
      expectedResult: 'Workflow is now required for the selected transaction type'
    },
    {
      title: 'Configure Workflow Template',
      description: 'Assign or customize the approval workflow.',
      substeps: [
        'If using default template, verify the approval chain is appropriate',
        'Click "View Template" to see the approval steps',
        'Modify approvers if needed: Manager → HR → Executive'
      ],
      expectedResult: 'Workflow template is configured with appropriate approvers'
    },
    {
      title: 'Verify Integration Dashboard',
      description: 'Confirm the succession module appears in HR Hub integration.',
      substeps: [
        'Navigate to HR Hub → Integration Dashboard',
        'Verify Succession module card is displayed',
        'Check that pending approval counts are visible',
        'Click the module card to navigate to succession'
      ],
      expectedResult: 'Succession module is integrated with HR Hub and shows pending items'
    }
  ];

  const navigateDashboardSteps: Step[] = [
    {
      title: 'Access HR Hub',
      description: 'Open the HR Hub central dashboard.',
      substeps: [
        'Click "HR Hub" in the main navigation menu',
        'The HR Hub dashboard displays module cards and pending items'
      ],
      expectedResult: 'HR Hub dashboard is displayed'
    },
    {
      title: 'View Succession Module Card',
      description: 'Locate the Succession module in the Integration Dashboard.',
      substeps: [
        'Navigate to Integration Dashboard tab or section',
        'Find the Succession module card with the Target icon',
        'The card shows: pending plans, active candidates, assessments due'
      ],
      expectedResult: 'Succession module metrics are visible'
    },
    {
      title: 'Navigate to Pending Approvals',
      description: 'Access succession-related pending approvals.',
      substeps: [
        'Click "Pending Approvals" in the HR Hub menu',
        'Filter by "Succession" or "Talent Pools" category',
        'View all pending readiness assessments and nominations'
      ],
      expectedResult: 'Filtered list of succession-related pending approvals'
    },
    {
      title: 'Take Action on Pending Items',
      description: 'Approve or decline pending succession requests.',
      substeps: [
        'Click on a pending item to view details',
        'Review the request information and supporting evidence',
        'Click Approve or Decline with appropriate comments',
        'System processes the decision and notifies relevant parties'
      ],
      expectedResult: 'Pending item is processed and moved to completed status'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Company-scoped settings', enforcement: 'System', description: 'Workflow requirements are configured per company independently.' },
    { rule: 'Template required for workflow', enforcement: 'System', description: 'If requires_workflow is true, a workflow_template_id must be assigned.' },
    { rule: 'One setting per transaction type per company', enforcement: 'System', description: 'Unique constraint on company_id + transaction_type_code.' },
    { rule: 'HR role required for settings', enforcement: 'System', description: 'Only HR Partner or Admin roles can modify workflow settings.' },
    { rule: 'Immediate effect', enforcement: 'System', description: 'Changes to workflow settings apply immediately to new transactions.' },
    { rule: 'In-flight transactions unaffected', enforcement: 'System', description: 'Transactions already in workflow continue with their original workflow.' }
  ];

  return (
    <section id="sec-5-10" data-manual-anchor="sec-5-10" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.10 HR Hub Integration</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Connect talent pools with HR Hub for centralized workflow management
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Navigate to succession features through the HR Hub Integration Dashboard',
          'Configure succession-related transaction types for workflow approval',
          'View and process pending succession approvals from HR Hub',
          'Understand the relationship between transaction types and workflow templates'
        ]}
      />

      {/* Navigation Paths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            HR Hub Navigation Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The HR Hub serves as a centralized dashboard for HR operations, including succession 
            planning and talent pool management. Multiple navigation paths are available.
          </p>

          {/* Path 1: Integration Dashboard */}
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Path 1: Integration Dashboard</h5>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">HR Hub</Badge>
              <ChevronRight className="h-3 w-3" />
              <Badge variant="outline">Integration Dashboard</Badge>
              <ChevronRight className="h-3 w-3" />
              <Badge variant="secondary">Succession Module Card</Badge>
            </div>
          </div>

          {/* Path 2: Transaction Workflow Settings */}
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Path 2: Workflow Settings</h5>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">HR Hub</Badge>
              <ChevronRight className="h-3 w-3" />
              <Badge variant="outline">Settings</Badge>
              <ChevronRight className="h-3 w-3" />
              <Badge variant="secondary">Transaction Workflow Settings</Badge>
            </div>
          </div>

          {/* Path 3: Pending Approvals */}
          <div className="p-3 border rounded-lg">
            <h5 className="font-medium text-sm mb-2">Path 3: Pending Approvals</h5>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline">HR Hub</Badge>
              <ChevronRight className="h-3 w-3" />
              <Badge variant="secondary">Pending Approvals</Badge>
              <ChevronRight className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">Filter: Succession</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Dashboard Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="h-5 w-5 text-primary" />
            Succession in Integration Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The Integration Dashboard displays module cards with quick access to succession features 
            and pending item counts.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {hrHubModules.map((module) => (
              <div key={module.name} className="p-3 border rounded-lg flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {module.icon === 'Target' && <Target className="h-5 w-5 text-primary" />}
                  {module.icon === 'Users' && <Users className="h-5 w-5 text-primary" />}
                  {module.icon === 'ClipboardCheck' && <ClipboardCheck className="h-5 w-5 text-primary" />}
                  {module.icon === 'Link2' && <Link2 className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h5 className="font-medium text-sm">{module.name}</h5>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                  <Badge variant="outline" className="text-xs mt-1 font-mono">{module.route}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Succession Transaction Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These transaction types can be configured to require workflow approval in the 
            Transaction Workflow Settings page.
          </p>

          <div className="space-y-3">
            {successionTransactionTypes.map((type) => (
              <div key={type.code} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-sm">{type.name}</h5>
                    <Badge variant="outline" className="text-xs font-mono mt-1">{type.code}</Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">{type.module}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{type.description}</p>
                <div className="p-2 bg-muted/50 rounded text-xs">
                  <span className="font-medium">Default Workflow Template:</span>
                  <span className="ml-2 font-mono">{type.defaultWorkflow}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GitBranch className="h-5 w-5 text-primary" />
            company_transaction_workflow_settings Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={workflowSettingsFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step: Enable Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Enable Succession Workflow Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={enableWorkflowSteps} title="" />
        </CardContent>
      </Card>

      {/* Step-by-Step: Navigate Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Navigate HR Hub for Succession
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={navigateDashboardSteps} title="" />
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Workflow Template Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            SUCCESSION_READINESS_APPROVAL Workflow Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is the standard workflow template for succession readiness assessment approvals. 
            It can be customized per company.
          </p>

          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 bg-muted border-b">
              <h5 className="font-medium text-sm">Default Approval Chain</h5>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, role: 'Direct Manager', description: 'Initial assessment approval' },
                  { step: 2, role: 'HR Partner', description: 'Compliance & calibration review' },
                  { step: 3, role: 'HR Manager', description: 'Final approval (optional)' }
                ].map((item, index, arr) => (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <span className="text-sm font-bold text-primary">{item.step}</span>
                      </div>
                      <span className="text-xs font-medium text-center">{item.role}</span>
                      <span className="text-[10px] text-muted-foreground text-center mt-1">
                        {item.description}
                      </span>
                    </div>
                    {index < arr.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground mx-4 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Step 3 (HR Manager) is optional and can be disabled in the 
                workflow template configuration. For smaller organizations, a 2-step approval 
                (Manager → HR Partner) is sufficient.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            HR Hub Integration Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Enable workflow approval for all succession-related transactions to maintain audit trails',
              'Regularly check the Integration Dashboard for pending approvals to avoid bottlenecks',
              'Customize workflow templates to match your organization\'s approval hierarchy',
              'Use the Pending Approvals filter to focus on specific transaction types',
              'Configure escalation rules for approvals that exceed SLA timeframes',
              'Review transaction workflow settings annually to ensure alignment with HR policies'
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
              <strong>Industry Benchmark:</strong> Centralized HR Hub dashboards with integrated 
              approval workflows reduce succession planning cycle time by 35% and improve 
              compliance audit scores by 50% (Deloitte HR Technology Survey 2024).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

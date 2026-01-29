import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Users
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  StepByStep,
  type Step
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

const configSteps: Step[] = [
  {
    title: 'Navigate to Workflow Templates',
    description: 'Go to Performance → Setup → Approval Workflows to view and configure training workflows.',
    notes: ['Requires Admin role'],
    expectedResult: 'Workflow template list with 5 training templates displayed'
  },
  {
    title: 'Enable Training Workflow Template',
    description: 'Select the desired training workflow template and toggle "Active" status.',
    notes: [
      'Start with TRAINING_REQUEST_APPROVAL for most use cases',
      'Templates can be customized after enabling'
    ]
  },
  {
    title: 'Configure Approver Mapping',
    description: 'Map each workflow step to specific approver roles or users.',
    notes: [
      'Manager: Direct manager from org hierarchy',
      'HR: HR Partner for employee\'s department',
      'Finance: Budget owner or finance approver'
    ],
    expectedResult: 'Approvers assigned to each workflow step'
  },
  {
    title: 'Set SLA Hours',
    description: 'Configure sla_hours for each step to define expected response time.',
    notes: [
      'Default: 48 hours for most steps',
      'Finance steps may need longer (72-96 hours)',
      'Urgent requests can have shorter SLAs'
    ]
  },
  {
    title: 'Configure Escalation Rules',
    description: 'Set up escalation_hours and escalation_to for SLA breaches.',
    notes: [
      'Escalation triggers after SLA + escalation_hours',
      'Typically escalates to skip-level manager or HR director'
    ],
    expectedResult: 'Escalation path configured'
  },
  {
    title: 'Test Workflow with Sample Request',
    description: 'Create a test training request and verify workflow routing.',
    expectedResult: 'Request appears in approver queues with correct SLA tracking'
  }
];

export function LndIntegrationWorkflow() {
  return (
    <section id="sec-8-6" data-manual-anchor="sec-8-6" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <GitBranch className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.6 Workflow Engine & Approvals</h3>
          <p className="text-sm text-muted-foreground">
            Training approval workflows, SLA tracking, and escalation configuration
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the 5 seeded training workflow templates',
        'Configure multi-step approval chains with role-based routing',
        'Set up SLA tracking and automatic escalation',
        'Enable cost-based routing for budget threshold workflows'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Seeded Workflow Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge>TRAINING_REQUEST_APPROVAL</Badge>
                  <Badge variant="outline">3 Steps</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Standard training request approval chain for formal courses and external training.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 rounded">Manager</span>
                <span>→</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-950 rounded">HR</span>
                <span>→</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-950 rounded">Finance</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">CERTIFICATION_REQUEST_APPROVAL</Badge>
                  <Badge variant="outline">2 Steps</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Certification exam and credential requests requiring HR validation.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 rounded">Manager</span>
                <span>→</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-950 rounded">HR</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">EXTERNAL_TRAINING_VERIFICATION</Badge>
                  <Badge variant="outline">1 Step</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                HR verification for external training records submitted by employees.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-950 rounded">HR</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">RECERTIFICATION_REQUEST_APPROVAL</Badge>
                  <Badge variant="outline">1 Step</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Auto-generated recertification requests for expiring credentials.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 rounded">Manager</span>
              </div>
            </div>

            <div className="p-4 border rounded-lg border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500">TRAINING_BUDGET_EXCEPTION</Badge>
                  <Badge variant="outline">3 Steps</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                High-cost training or budget exception requests requiring additional approval.
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-950 rounded">Dept Head</span>
                <span>→</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-950 rounded">HR Director</span>
                <span>→</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-950 rounded">Finance Director</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            SLA Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each workflow step has configurable SLA and escalation parameters:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Field</th>
                  <th className="text-left py-2 px-3">Type</th>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-left py-2 px-3">Default</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">sla_hours</td>
                  <td className="py-2 px-3">integer</td>
                  <td className="py-2 px-3">Expected response time in hours</td>
                  <td className="py-2 px-3">48</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">escalation_hours</td>
                  <td className="py-2 px-3">integer</td>
                  <td className="py-2 px-3">Additional hours before escalation</td>
                  <td className="py-2 px-3">24</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">escalation_to</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">Role or user for escalation</td>
                  <td className="py-2 px-3">skip_level_manager</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">reminder_hours</td>
                  <td className="py-2 px-3">integer[]</td>
                  <td className="py-2 px-3">When to send reminders</td>
                  <td className="py-2 px-3">[24, 4]</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Escalation Timeline Example
            </h4>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <Badge variant="outline">T+0</Badge>
                <span>Request submitted</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1">
                <Badge variant="outline">T+24h</Badge>
                <span>First reminder</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1">
                <Badge variant="secondary">T+44h</Badge>
                <span>Urgent reminder</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1">
                <Badge variant="destructive">T+72h</Badge>
                <span>Escalation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cost-Based Routing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Workflows can include cost thresholds that trigger additional approval steps:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Standard (&lt; $1,000)
              </h4>
              <p className="text-sm text-muted-foreground">
                Manager approval only
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                Elevated ($1,000 - $5,000)
              </h4>
              <p className="text-sm text-muted-foreground">
                Manager + HR approval
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-600" />
                High (&gt; $5,000)
              </h4>
              <p className="text-sm text-muted-foreground">
                Full 3-step approval + Finance
              </p>
            </div>
          </div>

          <InfoCallout>
            Cost-based routing uses the <code>estimated_cost</code> field from training_requests 
            to determine which workflow template to apply. Configure thresholds in 
            <strong>Performance → Setup → Workflow Routing Rules</strong>.
          </InfoCallout>
        </CardContent>
      </Card>

      <WarningCallout>
        Workflow changes affect all pending requests. When modifying active workflows, consider 
        the impact on requests currently in the approval queue. Use the "Apply to New Only" 
        option for major changes.
      </WarningCallout>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <ScreenshotPlaceholder 
        title="Workflow Template Configuration"
        description="Shows the workflow step configuration with approver mapping and SLA settings"
      />

      <TipCallout>
        <strong>Best Practice:</strong> Start with the seeded templates and customize gradually. 
        Track approval cycle times via the workflow_instances table to identify bottlenecks 
        and optimize SLA settings.
      </TipCallout>

      <InfoCallout>
        For complete workflow engine documentation including custom workflow creation, refer to 
        the <strong>Performance Administrator Manual, Chapter 4.26</strong>.
      </InfoCallout>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, GitBranch, Play, CheckSquare, AlertTriangle, BarChart3, ArrowRight, Timer } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, InfoCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldDefinition } from '../../components/FieldReferenceTable';
import { RelatedTopics } from '../../components';
import { SeeAlsoReference } from '@/components/enablement/shared/CrossModuleReference';

const INSTANCE_FIELDS: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique workflow instance identifier' },
  { name: 'template_id', required: true, type: 'UUID', description: 'Workflow template reference' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company context' },
  { name: 'source_module', required: true, type: 'TEXT', description: 'Module that triggered workflow (appraisals)' },
  { name: 'source_record_id', required: true, type: 'UUID', description: 'ID of triggering record (participant_id)' },
  { name: 'status', required: true, type: 'TEXT', description: 'pending, in_progress, completed, cancelled' },
  { name: 'current_step_id', required: false, type: 'UUID', description: 'Currently active step' },
  { name: 'started_at', required: true, type: 'TIMESTAMPTZ', description: 'Workflow start timestamp' },
  { name: 'completed_at', required: false, type: 'TIMESTAMPTZ', description: 'Workflow completion timestamp' },
  { name: 'due_date', required: false, type: 'DATE', description: 'Overall workflow deadline' },
  { name: 'sla_status', required: false, type: 'TEXT', description: 'on_track, at_risk, breached' },
  { name: 'initiated_by', required: true, type: 'UUID', description: 'User or system that started workflow' }
];

const STEP_FIELDS: FieldDefinition[] = [
  { name: 'workflow_instance_id', required: true, type: 'UUID', description: 'Parent workflow instance' },
  { name: 'step_order', required: true, type: 'INTEGER', description: 'Sequence position in workflow' },
  { name: 'step_type', required: true, type: 'TEXT', description: 'approval, notification, action, condition' },
  { name: 'step_name', required: true, type: 'TEXT', description: 'Step display name' },
  { name: 'assignee_id', required: false, type: 'UUID', description: 'User assigned to step (for approvals)' },
  { name: 'assignee_role', required: false, type: 'TEXT', description: 'Role for dynamic assignment' },
  { name: 'status', required: true, type: 'TEXT', description: 'pending, in_progress, completed, skipped' },
  { name: 'started_at', required: false, type: 'TIMESTAMPTZ', description: 'Step start timestamp' },
  { name: 'completed_at', required: false, type: 'TIMESTAMPTZ', description: 'Step completion timestamp' },
  { name: 'due_date', required: false, type: 'DATE', description: 'Step deadline' },
  { name: 'action_taken', required: false, type: 'TEXT', description: 'approve, reject, delegate, escalate' },
  { name: 'comments', required: false, type: 'TEXT', description: 'Step completion notes' }
];

const APPRAISAL_WORKFLOWS = [
  { name: 'Appraisal Approval', trigger: 'Manager submits evaluation', steps: 'Manager → Skip-Level (optional) → HR Review → Complete' },
  { name: 'Calibration Sign-off', trigger: 'Calibration session ends', steps: 'HR Partner → HR Director → CHRO (if significant changes)' },
  { name: 'Rating Dispute Resolution', trigger: 'Employee disputes rating', steps: 'HR Partner Review → Investigation → Resolution → Employee Notification' },
  { name: 'PIP Initiation', trigger: 'Low rating triggers rule', steps: 'HR Review → Manager Notification → Employee Meeting → Plan Activation' }
];

const BUSINESS_RULES = [
  { rule: 'Workflows auto-trigger on events', enforcement: 'System' as const, description: 'Integration rules can initiate workflow instances automatically.' },
  { rule: 'SLA tracking is continuous', enforcement: 'System' as const, description: 'System monitors step completion against due dates and updates SLA status.' },
  { rule: 'Escalation on breach', enforcement: 'System' as const, description: 'Breached SLAs trigger notification to next-level approver.' },
  { rule: 'Audit trail for all actions', enforcement: 'System' as const, description: 'Every step action is logged with timestamp, user, and comments.' }
];

export function WorkflowIntegration() {
  return (
    <Card id="sec-7-10">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 7.10</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Admin / Consultant</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-purple-500" />
          Workflow Integration
        </CardTitle>
        <CardDescription>
          How appraisals trigger and interact with the workflow management system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Integration', 'Workflows']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how appraisals trigger workflow instances</li>
            <li>Track approval steps and SLA compliance</li>
            <li>Identify workflow bottlenecks affecting cycle completion</li>
            <li>Monitor workflow analytics and performance</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Appraisal-Triggered Workflows
          </h3>
          <p className="text-muted-foreground">
            The appraisal module integrates with the workflow management system to automate 
            approval chains, escalations, and multi-step processes. When key appraisal events 
            occur (submission, finalization, dispute), configured workflows are automatically initiated.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 bg-muted/30 rounded-lg">
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <p className="text-xs font-medium">Event</p>
              <p className="text-xs text-muted-foreground">Submission</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <p className="text-xs font-medium">Workflow</p>
              <p className="text-xs text-muted-foreground">Initiated</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-background rounded border text-center min-w-[80px]">
              <p className="text-xs font-medium">Steps</p>
              <p className="text-xs text-muted-foreground">Execute</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded border border-green-300 text-center min-w-[80px]">
              <CheckSquare className="h-4 w-4 mx-auto mb-1 text-green-600" />
              <p className="text-xs font-medium">Complete</p>
            </div>
          </div>
        </div>

        {/* Common Appraisal Workflows */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Common Appraisal Workflows</h3>
          <div className="space-y-3">
            {APPRAISAL_WORKFLOWS.map((wf) => (
              <div key={wf.name} className="p-4 border rounded-lg">
                <h4 className="font-medium">{wf.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Trigger:</strong> {wf.trigger}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Steps:</strong> {wf.steps}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Tracking */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            SLA Tracking
          </h3>
          <p className="text-muted-foreground">
            Each workflow step can have a due date. The system tracks SLA compliance:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { status: 'On Track', color: 'text-green-600 bg-green-500/10', desc: 'Step within deadline' },
              { status: 'At Risk', color: 'text-amber-600 bg-amber-500/10', desc: '24 hours before breach' },
              { status: 'Breached', color: 'text-red-600 bg-red-500/10', desc: 'Deadline exceeded' }
            ].map((item) => (
              <Card key={item.status} className={item.color.split(' ')[1]}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-5 w-5 ${item.color.split(' ')[0]}`} />
                    <h4 className="font-semibold">{item.status}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Workflow Analytics
          </h3>
          <p className="text-muted-foreground">
            The workflow_analytics_snapshots table captures performance metrics:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { metric: 'Average Cycle Time', desc: 'Time from workflow start to completion' },
              { metric: 'Step Bottlenecks', desc: 'Steps with highest wait times' },
              { metric: 'SLA Compliance Rate', desc: 'Percentage of workflows completing on time' },
              { metric: 'Escalation Rate', desc: 'Frequency of SLA breach escalations' }
            ].map((item) => (
              <div key={item.metric} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.metric}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Monitor Bottlenecks">
          Use workflow analytics to identify approval bottlenecks during appraisal cycles. 
          Early intervention prevents cascade delays.
        </TipCallout>

        <InfoCallout title="Workflow Admin Manual">
          For detailed workflow template configuration and advanced routing rules, 
          see the Workflow Administration Manual.
        </InfoCallout>

        <SeeAlsoReference
          moduleCode="WORKFLOW"
          moduleName="Workflow Management"
          sectionId="sec-workflow-templates"
          sectionTitle="Workflow Template Configuration"
          description="Create and configure workflow templates, approval routing, and escalation rules."
          manualPath="/enablement/manuals/workflow"
        />

        <FieldReferenceTable 
          fields={INSTANCE_FIELDS}
          title="Database Fields: workflow_instances"
        />

        <FieldReferenceTable 
          fields={STEP_FIELDS}
          title="Database Fields: workflow_steps"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-7-8', title: 'Integration Rule Configuration' },
            { sectionId: 'sec-7-6', title: 'Notification Orchestration' },
            { sectionId: 'sec-3-7', title: 'Manager Evaluation Workflow' }
          ]}
        />
      </CardContent>
    </Card>
  );
}

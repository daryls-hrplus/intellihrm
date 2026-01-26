import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Shield,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  BusinessRules,
  StepByStep,
  type FieldDefinition,
  type BusinessRule,
  type Step 
} from '@/components/enablement/manual/components';

const integrationRuleFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the integration rule',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Company owning this rule',
    defaultValue: '—',
    validation: 'Must reference valid companies.id'
  },
  {
    name: 'name',
    required: true,
    type: 'text',
    description: 'Descriptive name for the rule',
    defaultValue: '—',
    validation: 'Max 100 characters'
  },
  {
    name: 'trigger_event',
    required: true,
    type: 'text',
    description: 'Event that activates this rule',
    defaultValue: '—',
    validation: 'Enum: 360_cycle_completed, 360_results_released, 360_theme_confirmed'
  },
  {
    name: 'condition_type',
    required: true,
    type: 'text',
    description: 'Type of condition to evaluate',
    defaultValue: '—',
    validation: 'Enum: score_threshold, completion_rate, theme_category, always'
  },
  {
    name: 'condition_operator',
    required: true,
    type: 'text',
    description: 'Comparison operator for condition',
    defaultValue: '—',
    validation: 'Enum: >=, <=, =, !=, between, in'
  },
  {
    name: 'condition_value',
    required: false,
    type: 'numeric',
    description: 'Value to compare against',
    defaultValue: 'null',
    validation: 'Depends on condition_type'
  },
  {
    name: 'target_module',
    required: true,
    type: 'text',
    description: 'Module that receives the action',
    defaultValue: '—',
    validation: 'Enum: appraisal, nine_box, succession, idp, learning, notification'
  },
  {
    name: 'action_type',
    required: true,
    type: 'text',
    description: 'Action to perform on target module',
    defaultValue: '—',
    validation: 'Depends on target_module'
  },
  {
    name: 'action_config',
    required: false,
    type: 'jsonb',
    description: 'Additional action parameters',
    defaultValue: '{}',
    validation: 'Structured JSON per action_type'
  },
  {
    name: 'requires_approval',
    required: false,
    type: 'boolean',
    description: 'Whether action needs HR approval before execution',
    defaultValue: 'false',
    validation: 'Recommended for high-impact actions'
  },
  {
    name: 'execution_order',
    required: false,
    type: 'integer',
    description: 'Order in which rules are evaluated',
    defaultValue: '10',
    validation: 'Lower = earlier execution'
  },
  {
    name: 'is_active',
    required: false,
    type: 'boolean',
    description: 'Whether rule is currently enabled',
    defaultValue: 'true',
    validation: 'Toggle for testing'
  }
];

const ruleSetupSteps: Step[] = [
  {
    title: 'Define Trigger Event',
    description: 'Select when the rule should activate.',
    notes: ['360_cycle_completed: After all feedback collected', '360_results_released: After results shared with subjects', '360_theme_confirmed: When manager confirms a theme']
  },
  {
    title: 'Set Conditions',
    description: 'Define the criteria that must be met.',
    notes: ['score_threshold: e.g., score >= 4.0', 'completion_rate: e.g., rate >= 70%', 'always: No conditions, always execute']
  },
  {
    title: 'Choose Target Module',
    description: 'Select which module receives the action.',
    notes: ['Multiple rules can target the same module', 'Order matters for dependent actions']
  },
  {
    title: 'Configure Action',
    description: 'Define what happens when conditions are met.',
    notes: ['Action types vary by target module', 'Use action_config for parameters']
  },
  {
    title: 'Set Approval Requirement',
    description: 'Decide if HR approval is needed before execution.',
    notes: ['Recommended for Nine-Box updates and succession changes']
  },
  {
    title: 'Test and Activate',
    description: 'Test with sample data before enabling for production.',
    notes: ['Use is_active toggle for controlled rollout']
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Rules execute in order',
    enforcement: 'System',
    description: 'execution_order determines sequence; lower numbers execute first'
  },
  {
    rule: 'First matching rule per action wins',
    enforcement: 'System',
    description: 'If multiple rules target same action, first match executes (unless configured for all)'
  },
  {
    rule: 'Approval blocks execution',
    enforcement: 'System',
    description: 'Rules with requires_approval=true create pending actions in HR queue'
  },
  {
    rule: 'Failed rules are logged',
    enforcement: 'System',
    description: 'Execution failures stored in appraisal_integration_log for retry/review'
  },
  {
    rule: 'Inactive rules are skipped',
    enforcement: 'System',
    description: 'is_active=false rules are not evaluated'
  }
];

export function IntegrationRulesConfiguration() {
  return (
    <section id="sec-7-8" data-manual-anchor="sec-7-8" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.8 Integration Rules Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Automation setup for 360-specific triggers, conditions, and cross-module actions
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Create integration rules for 360 feedback triggers',
        'Configure conditions based on scores, completion rates, and themes',
        'Set up approval workflows for sensitive actions',
        'Monitor integration execution logs and handle failures'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            360 Feedback Trigger Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Integration rules can be triggered by these 360-specific events:
          </p>

          <div className="space-y-3">
            {[
              {
                event: '360_cycle_completed',
                description: 'Fires when all feedback requests are completed and cycle is closed',
                useCase: 'Update Nine-Box, generate talent signals'
              },
              {
                event: '360_results_released',
                description: 'Fires when results are released to subjects',
                useCase: 'Trigger IDP creation, send coaching prompts'
              },
              {
                event: '360_theme_confirmed',
                description: 'Fires when manager confirms a development theme',
                useCase: 'Create skill gap, recommend training'
              }
            ].map(trigger => (
              <div key={trigger.event} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm font-medium text-primary">{trigger.event}</p>
                    <p className="text-sm text-muted-foreground mt-1">{trigger.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{trigger.useCase}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target Modules & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each target module supports specific action types:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                module: 'nine_box',
                actions: ['update_performance_rating', 'refresh_assessment'],
                icon: '📊'
              },
              {
                module: 'succession',
                actions: ['update_readiness', 'add_candidate', 'refresh_pool'],
                icon: '👥'
              },
              {
                module: 'idp',
                actions: ['create_goal', 'link_theme', 'suggest_development'],
                icon: '📋'
              },
              {
                module: 'learning',
                actions: ['create_skill_gap', 'recommend_course', 'create_request'],
                icon: '🎓'
              },
              {
                module: 'notification',
                actions: ['send_email', 'create_task', 'trigger_workflow'],
                icon: '🔔'
              },
              {
                module: 'appraisal',
                actions: ['update_360_score', 'mark_ready', 'trigger_calibration'],
                icon: '📝'
              }
            ].map(mod => (
              <div key={mod.module} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span>{mod.icon}</span>
                  <Badge variant="outline" className="font-mono">{mod.module}</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {mod.actions.map(action => (
                    <li key={action} className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3" />
                      <code>{action}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={ruleSetupSteps} title="Rule Configuration Procedure" />

      <FieldReferenceTable 
        fields={integrationRuleFields} 
        title="appraisal_integration_rules Table Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Example Rule Configurations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                High Performer → Update Nine-Box
              </h4>
              <div className="text-sm space-y-1 font-mono">
                <p>trigger_event: '360_cycle_completed'</p>
                <p>condition_type: 'score_threshold'</p>
                <p>condition_operator: '&gt;='</p>
                <p>condition_value: 4.0</p>
                <p>target_module: 'nine_box'</p>
                <p>action_type: 'update_performance_rating'</p>
                <p>action_config: {"{ rating: 'High' }"}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Theme Confirmed → Create Skill Gap
              </h4>
              <div className="text-sm space-y-1 font-mono">
                <p>trigger_event: '360_theme_confirmed'</p>
                <p>condition_type: 'always'</p>
                <p>target_module: 'learning'</p>
                <p>action_type: 'create_skill_gap'</p>
                <p>action_config: {"{ auto_recommend: true }"}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Results Released → Trigger Coaching Workflow
              </h4>
              <div className="text-sm space-y-1 font-mono">
                <p>trigger_event: '360_results_released'</p>
                <p>condition_type: 'always'</p>
                <p>target_module: 'notification'</p>
                <p>action_type: 'trigger_workflow'</p>
                <p>action_config: {"{ workflow: '360_coaching_discussion' }"}</p>
                <p>requires_approval: false</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Approval Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rules with <code>requires_approval = true</code> create pending actions:
          </p>

          <div className="p-4 border rounded-lg">
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Rule fires and creates pending action</p>
                  <p className="text-muted-foreground">Stored in appraisal_integration_log with action_result = 'pending'</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">HR sees pending action in approval queue</p>
                  <p className="text-muted-foreground">Found in HR Hub → Integration Approvals</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">HR approves or rejects</p>
                  <p className="text-muted-foreground">Approve → action executes; Reject → action cancelled</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Result logged</p>
                  <p className="text-muted-foreground">action_result updated to 'success' or 'cancelled'</p>
                </div>
              </li>
            </ol>
          </div>

          <WarningCallout>
            High-impact actions (Nine-Box rating changes, succession updates) should always 
            require approval. Configure requires_approval = true for these rules.
          </WarningCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />

      <TipCallout>
        Use the <code>useAppraisalIntegration</code> hook from <code>src/hooks/useAppraisalIntegration.ts</code> 
        to manage integration rules programmatically. The hook provides CRUD operations and 
        execution order management.
      </TipCallout>
    </section>
  );
}

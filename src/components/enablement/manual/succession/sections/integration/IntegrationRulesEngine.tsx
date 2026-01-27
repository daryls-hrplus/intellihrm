import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Target, 
  ArrowRight,
  Shield,
  ListChecks
} from 'lucide-react';
import { 
  LearningObjectives, 
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
  { name: 'id', required: true, type: 'uuid', description: 'Unique identifier for the integration rule', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'company_id', required: true, type: 'uuid', description: 'Company owning this rule', defaultValue: '—', validation: 'Must reference valid companies.id' },
  { name: 'name', required: true, type: 'text', description: 'Descriptive name for the rule', defaultValue: '—', validation: 'Max 200 characters' },
  { name: 'description', required: false, type: 'text', description: 'Detailed explanation of rule purpose', defaultValue: 'null', validation: '—' },
  { name: 'trigger_event', required: true, type: 'text', description: 'Event that activates this rule', defaultValue: '—', validation: 'See trigger events table' },
  { name: 'condition_type', required: true, type: 'text', description: 'Type of condition to evaluate', defaultValue: '—', validation: 'category, score_range, trend_direction, readiness_threshold' },
  { name: 'condition_operator', required: true, type: 'text', description: 'Comparison operator', defaultValue: '—', validation: '>=, <=, =, !=, between, in' },
  { name: 'condition_value', required: false, type: 'numeric', description: 'Single threshold value', defaultValue: 'null', validation: 'Depends on condition_type' },
  { name: 'condition_value_max', required: false, type: 'numeric', description: 'Upper bound for range conditions', defaultValue: 'null', validation: 'Required when operator=between' },
  { name: 'condition_category_codes', required: false, type: 'text[]', description: 'Category codes for matching', defaultValue: '[]', validation: 'Array of valid category codes' },
  { name: 'condition_section', required: false, type: 'text', description: 'Appraisal section to evaluate', defaultValue: 'null', validation: 'competencies, goals, values, kras' },
  { name: 'condition_threshold', required: false, type: 'numeric', description: 'Numeric threshold for condition evaluation', defaultValue: 'null', validation: 'Depends on condition_type' },
  { name: 'rating_level_codes', required: false, type: 'text[]', description: 'Rating level codes for condition matching', defaultValue: '[]', validation: 'Array of valid rating codes' },
  { name: 'target_module', required: true, type: 'text', description: 'Module receiving the action', defaultValue: '—', validation: 'See target modules table' },
  { name: 'action_type', required: true, type: 'text', description: 'Action to perform', defaultValue: '—', validation: 'Varies by target_module' },
  { name: 'action_config', required: false, type: 'jsonb', description: 'Additional action parameters', defaultValue: '{}', validation: 'Structured JSON per action_type' },
  { name: 'action_priority', required: false, type: 'integer', description: 'Priority for action execution ordering', defaultValue: '100', validation: 'Lower = higher priority' },
  { name: 'action_is_mandatory', required: true, type: 'boolean', description: 'Whether action completion is mandatory', defaultValue: 'false', validation: '—' },
  { name: 'action_message', required: false, type: 'text', description: 'Custom message displayed with action', defaultValue: 'null', validation: 'Max 500 characters' },
  { name: 'auto_execute', required: false, type: 'boolean', description: 'Execute immediately without approval', defaultValue: 'true', validation: '—' },
  { name: 'requires_approval', required: false, type: 'boolean', description: 'Requires HR approval before execution', defaultValue: 'false', validation: 'Recommended for high-impact actions' },
  { name: 'requires_hr_override', required: true, type: 'boolean', description: 'Requires HR override to skip', defaultValue: 'false', validation: '—' },
  { name: 'approval_role', required: false, type: 'text', description: 'Role required for approval', defaultValue: 'null', validation: 'hr_admin, hr_manager, executive' },
  { name: 'execution_order', required: false, type: 'integer', description: 'Order in which rules are evaluated', defaultValue: '10', validation: 'Lower = earlier execution' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Whether rule is currently enabled', defaultValue: 'true', validation: 'Toggle for testing' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Rule creation timestamp', defaultValue: 'now()', validation: 'Auto-set' },
  { name: 'updated_at', required: true, type: 'timestamptz', description: 'Last update timestamp', defaultValue: 'now()', validation: 'Auto-set on update' },
  { name: 'created_by', required: false, type: 'uuid', description: 'User who created the rule', defaultValue: 'null', validation: 'References profiles.id' }
];

const ruleSetupSteps: Step[] = [
  {
    title: 'Navigate to Integration Rules Setup',
    description: 'Access Performance → Setup → Integration Rules from the navigation menu.',
    expectedResult: 'Integration rules management page displays with existing rules grid'
  },
  {
    title: 'Create New Rule',
    description: 'Click "Add Rule" button and enter a descriptive name.',
    notes: ['Use naming convention: [Source]_[Condition]_[Action]', 'Example: Appraisal_HighPerformer_UpdateNineBox']
  },
  {
    title: 'Configure Trigger Event',
    description: 'Select the event that activates this rule.',
    notes: ['appraisal_finalized: After manager/calibration completion', 'category_assigned: When performance category is set', 'cycle_completed: End of full appraisal cycle'],
    expectedResult: 'Trigger event saved and condition options updated based on selection'
  },
  {
    title: 'Set Condition Logic',
    description: 'Define the criteria that must be met for the rule to execute.',
    notes: ['category: Match specific performance categories (EE, ME, DE)', 'score_range: Threshold-based (e.g., score >= 4.0)', 'readiness_threshold: Succession readiness level triggers']
  },
  {
    title: 'Choose Target Module & Action',
    description: 'Select which module receives the action and what action to perform.',
    notes: ['Nine-Box: update_performance, refresh_assessment', 'Succession: update_candidate_readiness, flag_for_review', 'Training: auto_enroll, create_request, recommend']
  },
  {
    title: 'Configure Approval Workflow',
    description: 'Set requires_approval=true for high-impact actions.',
    notes: ['Nine-Box rating changes should require approval', 'Succession candidate modifications should require approval', 'Training recommendations can auto-execute'],
    expectedResult: 'Approval requirement saved with specified approval role'
  },
  {
    title: 'Set Execution Order',
    description: 'Define priority (lower numbers execute first).',
    notes: ['Use 10, 20, 30 increments for easy reordering', 'Critical rules should have lower numbers']
  },
  {
    title: 'Test and Activate',
    description: 'Test with sample data before enabling for production.',
    notes: ['Use is_active toggle for controlled rollout', 'Monitor integration logs for execution results'],
    expectedResult: 'Rule activates and executes on next matching trigger event'
  }
];

const businessRules: BusinessRule[] = [
  { rule: 'Rules execute in order', enforcement: 'System', description: 'execution_order determines sequence; lower numbers execute first within same trigger_event' },
  { rule: 'First matching rule per action wins', enforcement: 'System', description: 'If multiple rules produce same action, first match executes (prevents duplicates)' },
  { rule: 'Approval blocks execution', enforcement: 'System', description: 'Rules with requires_approval=true create pending actions in HR approval queue' },
  { rule: 'Failed rules are logged', enforcement: 'System', description: 'Execution failures stored in appraisal_integration_log with error_message for retry/review' },
  { rule: 'Inactive rules are skipped', enforcement: 'System', description: 'is_active=false rules are not evaluated during orchestration' },
  { rule: 'Company isolation', enforcement: 'System', description: 'Rules only match events within the same company_id (multi-tenant security)' }
];

export function IntegrationRulesEngine() {
  return (
    <section id="sec-9-2" data-manual-anchor="sec-9-2" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Settings className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.2 Integration Rules Engine</h3>
          <p className="text-sm text-muted-foreground">
            Configure the appraisal_integration_rules table for cross-module automation
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Master the 28-field appraisal_integration_rules table structure',
        'Configure trigger events, conditions, and target actions',
        'Implement approval workflows for high-impact integrations',
        'Manage execution order and rule priority'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Trigger Events Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Integration rules are activated by these trigger events from the Performance and Succession modules:
          </p>

          <div className="grid md:grid-cols-2 gap-3">
            {[
              { event: 'appraisal_finalized', description: 'Appraisal completed and locked', useCase: 'Nine-Box updates, succession refresh' },
              { event: 'category_assigned', description: 'Performance category (EE/ME/DE) assigned', useCase: 'Readiness band adjustments' },
              { event: 'score_threshold', description: 'Weighted score crosses threshold', useCase: 'PIP creation, L&D triggers' },
              { event: 'cycle_completed', description: 'Full appraisal cycle ends', useCase: 'Bulk Nine-Box recalculation' },
              { event: '360_cycle_completed', description: '360 feedback collection complete', useCase: 'Potential axis signals' },
              { event: 'readiness_assessment_completed', description: 'Successor readiness assessed', useCase: 'Talent pool updates' }
            ].map(trigger => (
              <div key={trigger.event} className="p-3 border rounded-lg">
                <p className="font-mono text-sm font-medium text-primary">{trigger.event}</p>
                <p className="text-xs text-muted-foreground mt-1">{trigger.description}</p>
                <Badge variant="outline" className="text-xs mt-2">{trigger.useCase}</Badge>
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
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { module: 'nine_box', actions: ['update_placement', 'create_assessment', 'recalculate', 'create_evidence'], icon: '📊' },
              { module: 'succession', actions: ['update_readiness', 'add_candidate', 'flag_for_review', 'refresh_plan'], icon: '👥' },
              { module: 'training', actions: ['auto_enroll', 'create_request', 'recommend', 'add_to_path'], icon: '🎓' },
              { module: 'idp', actions: ['create_goal', 'link_gap', 'recommend_action'], icon: '📋' },
              { module: 'compensation', actions: ['create_flag', 'recommend_adjustment', 'freeze_action'], icon: '💰' },
              { module: 'pip', actions: ['create_pip', 'add_milestone', 'escalate'], icon: '⚠️' },
              { module: 'workforce_analytics', actions: ['calculate_index', 'update_metrics'], icon: '📈' },
              { module: 'notifications', actions: ['create_notification', 'send_alert'], icon: '🔔' },
              { module: 'reminders', actions: ['create_reminder', 'schedule_task'], icon: '⏰' },
              { module: 'development', actions: ['generate_themes', 'create_goals'], icon: '🎯' }
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

      <FieldReferenceTable 
        fields={integrationRuleFields} 
        title="appraisal_integration_rules Table (28 Fields)" 
      />

      <StepByStep steps={ruleSetupSteps} title="Rule Configuration Procedure" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Example Rule Configurations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Exceptional Performer → Update Nine-Box
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'category_assigned'</p>
                <p>condition_type: 'category'</p>
                <p>condition_category_codes: ['EE']</p>
                <p>target_module: 'nine_box'</p>
                <p>action_type: 'update_performance'</p>
                <p>action_config: {"{ rating: 3 }"}</p>
                <p>requires_approval: true</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                Low Score → Create PIP
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'appraisal_finalized'</p>
                <p>condition_type: 'score_range'</p>
                <p>condition_operator: '&lt;='</p>
                <p>condition_value: 2.0</p>
                <p>target_module: 'pip'</p>
                <p>action_type: 'create_pip'</p>
                <p>requires_approval: true</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Development Needed → Training Request
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'category_assigned'</p>
                <p>condition_type: 'category'</p>
                <p>condition_category_codes: ['DE', 'NI']</p>
                <p>target_module: 'training'</p>
                <p>action_type: 'create_request'</p>
                <p>action_config: {"{ priority: 'high' }"}</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                High Potential → Talent Pool
              </h4>
              <div className="text-xs space-y-1 font-mono">
                <p>trigger_event: 'readiness_assessment_completed'</p>
                <p>condition_type: 'readiness_threshold'</p>
                <p>condition_operator: '&gt;='</p>
                <p>condition_value: 4</p>
                <p>target_module: 'succession'</p>
                <p>action_type: 'add_to_talent_pool'</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Approval Workflow Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rules with <code>requires_approval = true</code> create pending actions in the HR Hub:
          </p>

          <div className="p-4 border rounded-lg">
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <span>Rule fires → pending action created in <code>appraisal_integration_log</code> with <code>action_result = 'pending'</code></span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <span>HR sees pending action in <strong>HR Hub → Pending Approvals → Integration Actions</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <span>HR reviews context (employee, trigger data, proposed action) and approves/rejects</span>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <span>Approve → action executes, <code>approved_at</code> timestamp set; Reject → <code>action_result = 'cancelled'</code></span>
              </li>
            </ol>
          </div>

          <WarningCallout>
            High-impact actions should always require approval: Nine-Box rating changes, succession candidate modifications, 
            PIP creation, and compensation flags. Configure <code>requires_approval = true</code> for these rules.
          </WarningCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />

      <TipCallout>
        Use the <code>useAppraisalIntegration</code> hook from <code>src/hooks/useAppraisalIntegration.ts</code> 
        to manage integration rules programmatically. The hook provides CRUD operations, rule reordering, 
        and toggle activation methods.
      </TipCallout>
    </section>
  );
}

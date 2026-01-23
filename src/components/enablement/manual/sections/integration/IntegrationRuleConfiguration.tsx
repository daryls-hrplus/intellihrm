import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, Settings, Zap, Filter, Play, Shield, ListOrdered } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldDefinition } from '../../components/FieldReferenceTable';
import { RelatedTopics, StepByStep } from '../../components';

const RULE_FIELDS: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique rule identifier' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company owning the rule' },
  { name: 'name', required: true, type: 'TEXT', description: 'Rule display name' },
  { name: 'description', required: false, type: 'TEXT', description: 'Rule purpose and behavior notes' },
  { name: 'trigger_event', required: true, type: 'TEXT', description: 'appraisal_finalized, score_changed, calibration_complete' },
  { name: 'condition_type', required: true, type: 'TEXT', description: 'score, rating_level, section_score, category' },
  { name: 'condition_operator', required: true, type: 'TEXT', description: 'eq, gt, lt, gte, lte, between, in' },
  { name: 'condition_value', required: false, type: 'NUMERIC', description: 'Threshold value for comparison' },
  { name: 'condition_value_max', required: false, type: 'NUMERIC', description: 'Upper bound for between operator' },
  { name: 'condition_category_codes', required: false, type: 'TEXT[]', description: 'Rating level codes for in operator' },
  { name: 'condition_section', required: false, type: 'TEXT', description: 'Specific section to evaluate (goals, competencies, etc.)' },
  { name: 'target_module', required: true, type: 'TEXT', description: 'nine_box, succession, idp, pip, compensation, learning' },
  { name: 'action_type', required: true, type: 'TEXT', description: 'update_placement, create_plan, send_notification, etc.' },
  { name: 'action_config', required: true, type: 'JSONB', description: 'JSON configuration for action execution' },
  { name: 'auto_execute', required: true, type: 'BOOLEAN', description: 'Execute automatically or require approval' },
  { name: 'requires_approval', required: true, type: 'BOOLEAN', description: 'Whether HR approval is required' },
  { name: 'approval_role', required: false, type: 'TEXT', description: 'Role required for approval (hr_partner, hr_manager)' },
  { name: 'execution_order', required: true, type: 'INTEGER', description: 'Order of rule execution (lower = earlier)' },
  { name: 'is_active', required: true, type: 'BOOLEAN', description: 'Whether rule is enabled' }
];

const STEPS = [
  {
    title: 'Create New Rule',
    description: 'Initialize the integration rule',
    substeps: [
      'Navigate to Performance → Setup → Integration Rules',
      'Click "Create Rule"',
      'Enter rule name and description',
      'Select trigger event'
    ],
    expectedResult: 'Rule created'
  },
  {
    title: 'Define Conditions',
    description: 'Set criteria for rule activation',
    substeps: [
      'Select condition type (score, rating_level, etc.)',
      'Choose operator (equals, greater than, etc.)',
      'Enter threshold value(s)',
      'Optionally limit to specific section'
    ],
    expectedResult: 'Conditions configured'
  },
  {
    title: 'Configure Action',
    description: 'Define what happens when rule triggers',
    substeps: [
      'Select target module',
      'Choose action type',
      'Configure action-specific parameters',
      'Set priority and mandatory flags'
    ],
    expectedResult: 'Action configured'
  },
  {
    title: 'Set Approval Requirements',
    description: 'Define approval workflow',
    substeps: [
      'Choose auto-execute or require approval',
      'If approval required, select approval role',
      'Configure notification to approvers'
    ],
    expectedResult: 'Approval workflow set'
  },
  {
    title: 'Set Execution Order',
    description: 'Position rule in execution sequence',
    substeps: [
      'Review existing rule order',
      'Set execution_order value',
      'Lower numbers execute first',
      'Consider dependencies between rules'
    ],
    expectedResult: 'Order set'
  },
  {
    title: 'Test & Activate',
    description: 'Validate rule behavior',
    substeps: [
      'Use "Test Rule" with sample data',
      'Verify condition matching',
      'Confirm action execution',
      'Activate rule for production'
    ],
    expectedResult: 'Rule active'
  }
];

const CONDITION_TYPES = [
  { type: 'score', desc: 'Overall appraisal score (0-5)', example: 'score >= 4.0' },
  { type: 'rating_level', desc: 'Rating category code', example: 'rating_level = "EXCEEDS"' },
  { type: 'section_score', desc: 'Section-specific score', example: 'goals_score < 2.5' },
  { type: 'category', desc: 'Performance category', example: 'category IN ("HIGH", "TOP")' }
];

const ACTION_TYPES = [
  { action: 'update_placement', module: 'nine_box', desc: 'Update Nine-Box grid position' },
  { action: 'add_to_pool', module: 'succession', desc: 'Add to succession talent pool' },
  { action: 'create_idp', module: 'idp', desc: 'Create Individual Development Plan' },
  { action: 'create_pip', module: 'pip', desc: 'Create Performance Improvement Plan' },
  { action: 'update_eligibility', module: 'compensation', desc: 'Set merit/bonus eligibility' },
  { action: 'assign_learning', module: 'learning', desc: 'Assign learning path' }
];

const BUSINESS_RULES = [
  { rule: 'Rules execute in order', enforcement: 'System' as const, description: 'execution_order determines sequence; lower values run first.' },
  { rule: 'First matching rule wins (optional)', enforcement: 'Advisory' as const, description: 'Configure "stop on match" for exclusive rules.' },
  { rule: 'Approval blocks execution', enforcement: 'System' as const, description: 'Rules with requires_approval=true wait for approval before executing.' },
  { rule: 'Failed rules logged for retry', enforcement: 'System' as const, description: 'Execution failures are logged and can be manually retried.' }
];

export function IntegrationRuleConfiguration() {
  return (
    <Card id="sec-7-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 7.8</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~16 min read</Badge>
          <Badge className="gap-1 bg-amber-600 text-white"><Users className="h-3 w-3" />Admin / Consultant</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-500" />
          Integration Rule Configuration
        </CardTitle>
        <CardDescription>
          Detailed guide to configuring appraisal integration rules with conditions, actions, and approvals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Setup', 'Integration', 'Rules']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand integration rule architecture and execution flow</li>
            <li>Configure conditions with various operators and thresholds</li>
            <li>Set up actions for different target modules</li>
            <li>Manage approval workflows and execution order</li>
            <li>Test and troubleshoot rule behavior</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Integration Rules Engine
          </h3>
          <p className="text-muted-foreground">
            Integration rules automate cross-module actions based on appraisal outcomes. 
            When an appraisal is finalized, the rules engine evaluates configured conditions 
            and executes matching actions—updating nine-box placements, creating development 
            plans, or triggering compensation workflows.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Execution Flow</p>
            <p className="text-sm text-muted-foreground mt-1">
              Trigger Event → Condition Evaluation → Action Execution → Approval (if required) → Logging
            </p>
          </div>
        </div>

        {/* Condition Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Condition Types
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Type</th>
                  <th className="text-left p-3 border-b">Description</th>
                  <th className="text-left p-3 border-b">Example</th>
                </tr>
              </thead>
              <tbody>
                {CONDITION_TYPES.map((row, i) => (
                  <tr key={row.type} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-mono text-sm">{row.type}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.desc}</td>
                    <td className="p-3 border-b font-mono text-xs">{row.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Available Actions
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {ACTION_TYPES.map((item) => (
              <div key={item.action} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">{item.action}</Badge>
                  <Badge variant="secondary" className="text-xs">{item.module}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <StepByStep steps={STEPS} title="Creating an Integration Rule" />

        {/* Execution Order */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ListOrdered className="h-5 w-5 text-primary" />
            Managing Execution Order
          </h3>
          <p className="text-muted-foreground">
            Rules execute in ascending order by execution_order. Consider these patterns:
          </p>
          <div className="space-y-3">
            {[
              { order: '10-19', use: 'High-priority rules (e.g., PIP creation for low scores)' },
              { order: '20-49', use: 'Standard rules (e.g., Nine-Box updates)' },
              { order: '50-79', use: 'Secondary rules (e.g., learning assignments)' },
              { order: '80-99', use: 'Notification-only rules' }
            ].map((item) => (
              <div key={item.order} className="p-3 border rounded-lg">
                <Badge variant="outline" className="font-mono">{item.order}</Badge>
                <p className="text-sm text-muted-foreground mt-1">{item.use}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Workflow */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Approval Workflow
          </h3>
          <p className="text-muted-foreground">
            For high-impact actions, require HR approval before execution:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Auto-Execute (No Approval)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Nine-Box placement updates</li>
                  <li>• Learning path assignments</li>
                  <li>• Notification triggers</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Requires Approval</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• PIP creation</li>
                  <li>• Compensation eligibility changes</li>
                  <li>• Succession pool modifications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <TipCallout title="Test with Sample Data">
          Always test new rules with "Test Rule" before activating. This shows which 
          employees would match and what actions would execute.
        </TipCallout>

        <WarningCallout title="Rule Conflicts">
          If multiple rules can match the same participant, review execution order 
          carefully. Consider using "stop on match" for mutually exclusive rules.
        </WarningCallout>

        <FieldReferenceTable 
          fields={RULE_FIELDS}
          title="Database Fields: appraisal_integration_rules"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-7-1', title: 'Integration Overview' },
            { sectionId: 'sec-7-7', title: 'Integration Analytics Dashboard' },
            { sectionId: 'sec-2-8', title: 'Outcome Rules Configuration' }
          ]}
        />
      </CardContent>
    </Card>
  );
}

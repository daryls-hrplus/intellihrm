import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Clock, CheckCircle, AlertTriangle, Lock, FileText, Settings, Scale, Bell } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../components/StepByStep';

const BUSINESS_RULES = [
  { rule: 'Governance rules apply to all sessions in scope', enforcement: 'System' as const, description: 'Rules cannot be bypassed for individual sessions unless explicitly overridden.' },
  { rule: 'Justification character minimums are enforced', enforcement: 'System' as const, description: 'Adjustments cannot be saved without meeting text length requirements.' },
  { rule: 'Approval workflows trigger on rule violations', enforcement: 'System' as const, description: 'Exceeding thresholds automatically routes to designated approvers.' },
  { rule: 'Rule changes require admin approval', enforcement: 'Policy' as const, description: 'Modifications to governance rules must be approved by HR leadership.' }
];

const GOVERNANCE_RULE_FIELDS: FieldDefinition[] = [
  { name: 'rule_name', required: true, type: 'text', description: 'Descriptive name for the governance rule', validation: 'Max 100 characters' },
  { name: 'rule_type', required: true, type: 'select', description: 'Type of rule (max_change, justification, distribution, approval)', defaultValue: 'max_change' },
  { name: 'threshold_value', required: false, type: 'number', description: 'Numeric threshold that triggers the rule', validation: 'Depends on rule type' },
  { name: 'applies_to_role', required: false, type: 'select', description: 'Which roles this rule applies to', defaultValue: 'All participants' },
  { name: 'enforcement_action', required: true, type: 'select', description: 'What happens when rule is triggered (warn, block, require_approval)', defaultValue: 'warn' },
  { name: 'justification_required', required: true, type: 'boolean', description: 'Whether written justification is mandatory', defaultValue: 'true' },
  { name: 'min_justification_length', required: false, type: 'number', description: 'Minimum character count for justification text', defaultValue: '50' },
  { name: 'approver_role', required: false, type: 'select', description: 'Role required to approve violations', defaultValue: 'HR Admin' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Whether this rule is currently enforced', defaultValue: 'true' }
];

const SETUP_STEPS: Step[] = [
  {
    title: 'Access Governance Rules Configuration',
    description: 'Navigate to the calibration governance settings.',
    substeps: [
      'Go to Settings → Performance → Calibration',
      'Click "Governance Rules" tab',
      'Review existing rules or create new ones'
    ],
    expectedResult: 'Governance rules panel displays with list of active and inactive rules.'
  },
  {
    title: 'Create Maximum Score Change Rule',
    description: 'Limit how much a rating can be adjusted in calibration.',
    substeps: [
      'Click "Add Rule" → Select "Maximum Score Change"',
      'Set the threshold (e.g., 1.0 point max change)',
      'Choose enforcement action (Warn, Block, or Require Approval)',
      'Enable justification requirement',
      'Set minimum justification length (e.g., 100 characters)',
      'Save the rule'
    ],
    expectedResult: 'Rule appears in active rules list with configured threshold.'
  },
  {
    title: 'Create Justification Requirements',
    description: 'Mandate documentation for all adjustments.',
    substeps: [
      'Click "Add Rule" → Select "Justification Required"',
      'Set scope (all adjustments or only above threshold)',
      'Configure minimum character count',
      'Enable category selection requirement (bias correction, evidence, etc.)',
      'Save the rule'
    ],
    expectedResult: 'Justification rule active; adjustment forms show required fields.'
  },
  {
    title: 'Configure Distribution Guard Rails',
    description: 'Set limits on rating distribution outcomes.',
    substeps: [
      'Click "Add Rule" → Select "Distribution Limit"',
      'Set maximum percentage for each rating category',
      'Enable deviation alerts (e.g., warn if >20% rated "Exceptional")',
      'Configure enforcement level',
      'Save the rule'
    ],
    expectedResult: 'Distribution limits appear in calibration workspace warnings.'
  },
  {
    title: 'Set Up Approval Workflows',
    description: 'Route significant changes for additional approval.',
    substeps: [
      'Click "Add Rule" → Select "Approval Required"',
      'Define trigger conditions (e.g., change > 1.5 points, crosses Nine-Box boundary)',
      'Select approver role (HR Admin, HRBP, Department Head)',
      'Configure notification settings',
      'Enable escalation if not approved within timeframe',
      'Save the rule'
    ],
    expectedResult: 'Approval workflow created; triggering adjustments route to approver.'
  }
];

export function CalibrationGovernanceRules() {
  return (
    <Card id="sec-4-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.8</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Calibration Governance Rules</CardTitle>
        <CardDescription>Configure rules that govern calibration behavior, limits, and approval workflows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-8'] || ['Appraisals Manual', 'Chapter 4: Calibration Sessions', 'Calibration Governance Rules']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the purpose of calibration governance rules</li>
            <li>Configure maximum score change limits</li>
            <li>Set justification requirements for adjustments</li>
            <li>Implement approval workflows for significant changes</li>
          </ul>
        </div>

        {/* Why Governance Rules Matter */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Why Governance Rules Matter
          </h3>
          <p className="text-muted-foreground">
            Governance rules ensure that calibration remains a fair, documented process rather than 
            an arbitrary adjustment session. They protect against excessive changes, require 
            evidence-based justifications, and create the audit trail needed for compliance.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Compliance Foundation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Employment law often requires documented, defensible performance decisions. 
              Governance rules ensure every calibration adjustment is traceable, justified, 
              and approved through proper channels.
            </p>
          </div>
        </div>

        {/* Types of Governance Rules */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Types of Governance Rules</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Scale, title: 'Maximum Change Limits', desc: 'Restrict how much a rating can be adjusted up or down in a single session', example: 'Max 1.0 point change per calibration' },
              { icon: FileText, title: 'Justification Requirements', desc: 'Mandate written explanations with minimum detail for all adjustments', example: 'Minimum 100 characters with category' },
              { icon: AlertTriangle, title: 'Distribution Guard Rails', desc: 'Warn or block when rating distributions exceed target ranges', example: 'Alert if >15% rated "Exceptional"' },
              { icon: Lock, title: 'Approval Workflows', desc: 'Require additional sign-off for significant or sensitive changes', example: 'HR approval for >1.5 point changes' },
              { icon: Bell, title: 'Notification Rules', desc: 'Automatically notify stakeholders of specific calibration events', example: 'Email employee\'s HRBP on downgrade' },
              { icon: Settings, title: 'Session Controls', desc: 'Manage who can make changes and when during a session', example: 'Only facilitator can finalize' }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      <Badge variant="outline" className="mt-2 text-xs">{item.example}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">calibration_governance_rules</Badge>
              <span className="text-sm text-muted-foreground">Rule definitions and thresholds</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">calibration_rule_violations</Badge>
              <span className="text-sm text-muted-foreground">Logged violations and resolutions</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">calibration_approvals</Badge>
              <span className="text-sm text-muted-foreground">Pending and completed approvals</span>
            </div>
          </div>
        </div>

        <StepByStep steps={SETUP_STEPS} title="Step-by-Step: Configure Governance Rules" />

        {/* Enforcement Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Enforcement Actions</h3>
          <p className="text-muted-foreground">
            Each rule can be configured with different enforcement levels:
          </p>
          <div className="space-y-2">
            {[
              { level: 'Warn', icon: '⚠️', description: 'Display warning message but allow action to proceed', useCase: 'Soft limits, awareness prompts' },
              { level: 'Block', icon: '🚫', description: 'Prevent the action entirely until conditions are met', useCase: 'Hard limits, mandatory fields' },
              { level: 'Require Approval', icon: '✅', description: 'Allow action but route to approver before finalization', useCase: 'Significant changes, sensitive cases' },
              { level: 'Log Only', icon: '📝', description: 'Record the event without interrupting workflow', useCase: 'Audit trail, pattern detection' }
            ].map((item) => (
              <div key={item.level} className="flex items-start gap-3 p-3 border rounded-lg">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-semibold">{item.level}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-primary mt-1">Best for: {item.useCase}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={GOVERNANCE_RULE_FIELDS} title="Governance Rule Fields Reference" />

        <TipCallout title="Best Practice">
          Start with "Warn" enforcement during pilot calibration sessions to understand typical 
          adjustment patterns. Tighten to "Block" or "Require Approval" once baseline behavior is established.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Overly restrictive rules can frustrate legitimate calibration needs and lead to workarounds. 
          Balance compliance requirements with practical flexibility.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}

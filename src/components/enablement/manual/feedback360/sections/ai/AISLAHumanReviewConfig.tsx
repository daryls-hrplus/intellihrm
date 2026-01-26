import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { Clock, Settings, Bell, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const learningObjectives = [
  'Configure human review SLA thresholds for AI actions',
  'Set up escalation workflows for SLA breaches',
  'Monitor SLA compliance across AI features',
  'Adjust SLA parameters based on organizational needs'
];

const slaFields: FieldDefinition[] = [
  {
    name: 'action_type',
    required: true,
    type: 'text',
    description: 'AI action type requiring human review (theme_generation, bias_detection, etc.)',
    defaultValue: '—',
    validation: 'Valid action type'
  },
  {
    name: 'sla_hours',
    required: true,
    type: 'integer',
    description: 'Maximum hours allowed before human review is required',
    defaultValue: '24',
    validation: '1-720'
  },
  {
    name: 'escalation_hours',
    required: true,
    type: 'integer',
    description: 'Hours after SLA breach before escalation is triggered',
    defaultValue: '48',
    validation: 'Greater than sla_hours'
  },
  {
    name: 'notify_on_breach',
    required: false,
    type: 'boolean',
    description: 'Send notification when SLA is breached',
    defaultValue: 'true',
    validation: 'Boolean'
  },
  {
    name: 'escalation_role',
    required: false,
    type: 'text',
    description: 'Role to escalate to when escalation threshold is reached',
    defaultValue: 'hr_admin',
    validation: 'Valid role code'
  },
  {
    name: 'is_active',
    required: false,
    type: 'boolean',
    description: 'Whether this SLA configuration is currently active',
    defaultValue: 'true',
    validation: 'Boolean'
  }
];

const defaultSLAs = [
  {
    actionType: 'theme_generation',
    slaHours: 48,
    escalationHours: 96,
    rationale: 'Themes are visible to employees; require confirmation before release'
  },
  {
    actionType: 'bias_detection',
    slaHours: 24,
    escalationHours: 48,
    rationale: 'Bias warnings affect feedback visibility; prompt review needed'
  },
  {
    actionType: 'signal_extraction',
    slaHours: 72,
    escalationHours: 120,
    rationale: 'Signals feed downstream modules; lower urgency than themes'
  },
  {
    actionType: 'coaching_prompt',
    slaHours: 168,
    escalationHours: 336,
    rationale: 'Manager-facing content; can wait for next coaching cycle'
  },
  {
    actionType: 'high_risk_action',
    slaHours: 4,
    escalationHours: 8,
    rationale: 'Any AI action with confidence < 0.5 or high impact'
  }
];

const configSteps: Step[] = [
  {
    title: 'Access SLA Configuration',
    description: 'Navigate to the AI governance settings.',
    substeps: [
      'Go to Performance → 360 Feedback → Setup → AI Configuration',
      'Click "Human Review SLA" tab',
      'Review existing configurations'
    ],
    expectedResult: 'List of SLA configurations displayed'
  },
  {
    title: 'Edit SLA Parameters',
    description: 'Adjust SLA thresholds for a specific action type.',
    substeps: [
      'Click "Edit" on the action type row',
      'Set sla_hours (when review becomes due)',
      'Set escalation_hours (when escalation triggers)',
      'Configure notification preferences'
    ],
    expectedResult: 'SLA parameters updated'
  },
  {
    title: 'Add Custom SLA Rule',
    description: 'Create SLA for additional action types.',
    substeps: [
      'Click "Add SLA Configuration"',
      'Select action type from dropdown',
      'Set appropriate thresholds',
      'Assign escalation role',
      'Save configuration'
    ],
    expectedResult: 'New SLA rule active'
  },
  {
    title: 'Monitor SLA Compliance',
    description: 'Review SLA adherence across AI actions.',
    substeps: [
      'Go to Governance → SLA Dashboard',
      'Review compliance percentage by action type',
      'Identify patterns in SLA breaches',
      'Adjust thresholds if needed'
    ],
    expectedResult: 'SLA compliance visibility established'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Escalation > SLA',
    enforcement: 'System',
    description: 'escalation_hours must be greater than sla_hours'
  },
  {
    rule: 'One config per action type',
    enforcement: 'System',
    description: 'Unique constraint on company_id + action_type'
  },
  {
    rule: 'Default SLAs on module enable',
    enforcement: 'System',
    description: 'Default SLA configurations created when 360 Feedback is enabled'
  },
  {
    rule: 'Breach creates notification',
    enforcement: 'System',
    description: 'SLA breach triggers notification if notify_on_breach is true'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'SLA breach notifications not sending',
    cause: 'notify_on_breach is false or notification channel not configured',
    solution: 'Verify notify_on_breach=true and check notification_templates for SLA events'
  },
  {
    issue: 'Escalations going to wrong person',
    cause: 'escalation_role mismatch',
    solution: 'Update escalation_role to match your organizational role hierarchy'
  },
  {
    issue: 'Too many SLA breaches',
    cause: 'Thresholds too aggressive for volume',
    solution: 'Increase sla_hours for lower-priority action types; focus tight SLAs on high-impact actions'
  }
];

export function AISLAHumanReviewConfig() {
  return (
    <section id="sec-5-14" data-manual-anchor="sec-5-14" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          5.14 Human Review SLA Configuration
        </h3>
        <p className="text-muted-foreground mt-2">
          Configure service level agreements for human review of AI-generated content and decisions.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="flex items-center gap-2">
          <span>ISO 42001 Requirement</span>
          <Badge variant="outline" className="text-xs">Human Oversight</Badge>
        </AlertTitle>
        <AlertDescription>
          ISO 42001 requires documented processes for human oversight of AI systems. SLA configuration 
          ensures that AI outputs requiring human review are addressed within defined timeframes, 
          maintaining accountability and preventing automation bias.
        </AlertDescription>
      </Alert>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          Performance → 360 Feedback → Setup → AI Configuration → Human Review SLA
        </span>
      </div>

      {/* SLA Flow Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4" />
            SLA Enforcement Flow
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HUMAN REVIEW SLA ENFORCEMENT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐                                                          │
│  │ AI Action      │──────────────────────────────────────────────────────┐  │
│  │ Completed      │                                                       │  │
│  │ (human_review  │      TIMELINE (hours from completion)                │  │
│  │  _required=    │                                                       │  │
│  │  true)         │  0h        24h         48h          72h       ...    │  │
│  └───────┬────────┘  │          │           │            │                │  │
│          │           │          │           │            │                │  │
│          │           │    ┌─────▼─────┐     │            │                │  │
│          │           │    │ SLA DUE   │     │            │                │  │
│          │           │    │ Review    │     │            │                │  │
│          │           │    │ requested │     │            │                │  │
│          │           │    └───────────┘     │            │                │  │
│          │           │                      │            │                │  │
│          │           │                ┌─────▼─────┐      │                │  │
│          │           │                │ SLA       │      │                │  │
│          │           │                │ BREACH    │      │                │  │
│          │           │                │ Notify    │      │                │  │
│          │           │                └───────────┘      │                │  │
│          │           │                                   │                │  │
│          │           │                             ┌─────▼─────┐          │  │
│          │           │                             │ ESCALATE  │          │  │
│          │           │                             │ To HR     │          │  │
│          │           │                             │ Admin     │          │  │
│          │           │                             └───────────┘          │  │
│          │                                                                 │  │
│          │         ┌───────────────────────────────────────────────────┐  │  │
│          │         │         AT ANY POINT: HUMAN REVIEWS               │  │  │
│          └────────▶│  • Review AI output                               │  │  │
│                    │  • Approve, Override, or Request Regeneration     │  │  │
│                    │  • SLA timer stops; compliance logged             │  │  │
│                    └───────────────────────────────────────────────────┘  │  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Default SLA Recommendations */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4" />
            Recommended SLA Defaults
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Action Type</th>
                  <th className="text-center p-2 font-medium">SLA Hours</th>
                  <th className="text-center p-2 font-medium">Escalation</th>
                  <th className="text-left p-2 font-medium">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {defaultSLAs.map((sla) => (
                  <tr key={sla.actionType} className="border-b">
                    <td className="p-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{sla.actionType}</code>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="outline">{sla.slaHours}h</Badge>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className="text-amber-600">{sla.escalationHours}h</Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{sla.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={configSteps} title="Configuring Human Review SLAs" />

      <FieldReferenceTable 
        fields={slaFields} 
        title="SLA Configuration Fields (ai_human_review_sla_config)" 
      />

      <BusinessRules rules={businessRules} />

      {/* SLA Compliance Metrics */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">SLA Compliance Metrics</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">92%</div>
              <div className="text-sm text-muted-foreground">On-time reviews</div>
              <div className="text-xs text-muted-foreground mt-1">Target: ≥90%</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">18h</div>
              <div className="text-sm text-muted-foreground">Avg review time</div>
              <div className="text-xs text-muted-foreground mt-1">Target: ≤24h</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">3</div>
              <div className="text-sm text-muted-foreground">Escalations this month</div>
              <div className="text-xs text-muted-foreground mt-1">Target: 0</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Example metrics display. Actual values from ai_governance_metrics table.
          </p>
        </CardContent>
      </Card>

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Best Practice */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">SLA Tuning Best Practice</h5>
            <p className="text-sm text-muted-foreground mt-1">
              Start with conservative (shorter) SLAs and gradually extend based on actual review 
              patterns. Track the percentage of reviews that are "rubber stamp" approvals vs. 
              meaningful corrections - if {'>'}95% are unchanged, consider extending the SLA or 
              reducing review requirements for that action type.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

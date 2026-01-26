import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { AlertTriangle, Shield, Clock, FileCheck, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const learningObjectives = [
  'Understand the AI incident classification framework',
  'Follow proper incident reporting and documentation procedures',
  'Conduct root cause analysis for AI failures',
  'Implement corrective actions and lessons learned'
];

const incidentTypes = [
  {
    type: 'bias_detected',
    severity: 'high',
    description: 'AI output exhibits detectable bias patterns',
    examples: ['Gender-coded language suggestions', 'Disproportionate theme flagging by demographic'],
    sla: '24 hours'
  },
  {
    type: 'model_failure',
    severity: 'critical',
    description: 'AI model fails to produce output or crashes',
    examples: ['Timeout during theme generation', 'Empty signal extraction', 'API errors'],
    sla: '4 hours'
  },
  {
    type: 'unexpected_output',
    severity: 'medium',
    description: 'AI produces output that is technically valid but inappropriate',
    examples: ['Irrelevant coaching prompts', 'Misclassified sentiment', 'Wrong competency mapping'],
    sla: '48 hours'
  },
  {
    type: 'data_quality',
    severity: 'medium',
    description: 'Input data issues affecting AI quality',
    examples: ['Insufficient responses for signal extraction', 'Corrupted text encoding', 'Missing metadata'],
    sla: '48 hours'
  },
  {
    type: 'privacy_breach',
    severity: 'critical',
    description: 'AI exposes or processes data inappropriately',
    examples: ['PII in model logs', 'Cross-cycle data leakage', 'Anonymity threshold violation'],
    sla: '2 hours'
  }
];

const incidentFields: FieldDefinition[] = [
  {
    name: 'incident_type',
    required: true,
    type: 'enum',
    description: 'Classification: bias_detected, model_failure, unexpected_output, data_quality, privacy_breach, other',
    defaultValue: '—',
    validation: 'Valid type'
  },
  {
    name: 'severity',
    required: true,
    type: 'enum',
    description: 'Impact level: low, medium, high, critical',
    defaultValue: '—',
    validation: 'Valid severity'
  },
  {
    name: 'source_table',
    required: false,
    type: 'text',
    description: 'Database table where incident was detected',
    defaultValue: 'null',
    validation: 'Valid table name'
  },
  {
    name: 'source_record_id',
    required: false,
    type: 'UUID',
    description: 'Specific record ID that triggered the incident',
    defaultValue: 'null',
    validation: 'Valid UUID'
  },
  {
    name: 'description',
    required: true,
    type: 'text',
    description: 'Detailed description of what occurred',
    defaultValue: '—',
    validation: 'Min 50 characters'
  },
  {
    name: 'immediate_action_taken',
    required: false,
    type: 'text',
    description: 'Actions taken immediately upon detection',
    defaultValue: 'null',
    validation: 'Free text'
  },
  {
    name: 'root_cause_analysis',
    required: false,
    type: 'text',
    description: 'Analysis of why the incident occurred',
    defaultValue: 'null',
    validation: 'Required for closure'
  },
  {
    name: 'corrective_actions',
    required: false,
    type: 'JSONB',
    description: 'Array of corrective actions with status',
    defaultValue: '[]',
    validation: 'Valid JSON array'
  },
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current status: open, investigating, resolved, closed',
    defaultValue: 'open',
    validation: 'Valid status'
  },
  {
    name: 'post_incident_review_date',
    required: false,
    type: 'timestamp',
    description: 'Scheduled date for post-incident review meeting',
    defaultValue: 'null',
    validation: 'Future date'
  },
  {
    name: 'lessons_learned',
    required: false,
    type: 'text',
    description: 'Key learnings to prevent recurrence',
    defaultValue: 'null',
    validation: 'Required for closure'
  }
];

const reportingSteps: Step[] = [
  {
    title: 'Detect and Document',
    description: 'Identify the AI incident and capture initial details.',
    substeps: [
      'Note the exact timestamp and context',
      'Screenshot or capture the unexpected behavior',
      'Identify affected users/records'
    ],
    expectedResult: 'Initial incident documentation ready'
  },
  {
    title: 'Create Incident Record',
    description: 'Log the incident in the system.',
    substeps: [
      'Navigate to Performance → 360 Feedback → Governance → AI Incidents',
      'Click "Report New Incident"',
      'Select incident type and severity',
      'Provide detailed description with evidence'
    ],
    expectedResult: 'Incident record created with unique ID'
  },
  {
    title: 'Immediate Response',
    description: 'Take immediate action based on severity.',
    substeps: [
      'For Critical: Disable affected AI feature immediately',
      'For High: Flag for urgent review, notify stakeholders',
      'For Medium/Low: Document and schedule review',
      'Record all immediate actions taken'
    ],
    expectedResult: 'Immediate containment completed'
  },
  {
    title: 'Assign and Investigate',
    description: 'Assign owner and begin root cause analysis.',
    substeps: [
      'Assign to appropriate team member',
      'Gather relevant logs (feedback_ai_action_logs)',
      'Review input data and model version',
      'Document root cause analysis'
    ],
    expectedResult: 'Root cause identified and documented'
  },
  {
    title: 'Implement Corrective Actions',
    description: 'Fix the issue and prevent recurrence.',
    substeps: [
      'Define corrective actions with owners',
      'Implement fixes (model update, data fix, etc.)',
      'Test fixes thoroughly',
      'Update corrective_actions with completion status'
    ],
    expectedResult: 'All corrective actions implemented'
  },
  {
    title: 'Close and Review',
    description: 'Complete post-incident review.',
    substeps: [
      'Schedule post-incident review meeting',
      'Document lessons learned',
      'Update procedures if needed',
      'Close incident record'
    ],
    expectedResult: 'Incident closed with lessons learned documented'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'SLA enforcement by severity',
    enforcement: 'System',
    description: 'Critical: 2-4h, High: 24h, Medium: 48h, Low: 5 days response time'
  },
  {
    rule: 'Closure requires RCA',
    enforcement: 'System',
    description: 'Incidents cannot be closed without root_cause_analysis and lessons_learned'
  },
  {
    rule: 'Privacy breaches escalate automatically',
    enforcement: 'System',
    description: 'Privacy breach incidents trigger automatic notification to DPO'
  },
  {
    rule: 'Bias incidents require HR review',
    enforcement: 'Policy',
    description: 'All bias_detected incidents must be reviewed by HR before closure'
  },
  {
    rule: 'Post-incident review required',
    enforcement: 'Policy',
    description: 'High and Critical incidents require documented post-incident review'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot create incident - permission denied',
    cause: 'User lacks incident reporting permissions',
    solution: 'Any authenticated user can report; escalate if blocked. HR Admin required for closure.'
  },
  {
    issue: 'Cannot close incident',
    cause: 'Missing required fields',
    solution: 'Ensure root_cause_analysis and lessons_learned are documented. All corrective actions must be completed.'
  },
  {
    issue: 'Incident auto-escalated unexpectedly',
    cause: 'SLA breach or severity level',
    solution: 'Review SLA configuration in ai_human_review_sla_config. Adjust if thresholds are too aggressive.'
  }
];

export function AIIncidentResponseProcedure() {
  return (
    <section id="sec-5-13" data-manual-anchor="sec-5-13" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          5.13 AI Incident Response Procedure
        </h3>
        <p className="text-muted-foreground mt-2">
          Industry-standard procedures for detecting, documenting, and resolving AI-related incidents.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/50">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertTitle className="flex items-center gap-2">
          <span>Industry Standard</span>
          <Badge variant="outline" className="text-xs">NIST AI RMF</Badge>
          <Badge variant="outline" className="text-xs">ISO 42001</Badge>
        </AlertTitle>
        <AlertDescription>
          This incident response procedure aligns with NIST AI Risk Management Framework (AI RMF) 
          and ISO 42001 AI Management System requirements for AI governance and accountability.
        </AlertDescription>
      </Alert>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          Performance → 360 Feedback → Governance → AI Incidents
        </span>
      </div>

      {/* Incident Types */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4" />
            Incident Classification Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Type</th>
                  <th className="text-center p-2 font-medium">Severity</th>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-center p-2 font-medium">SLA</th>
                </tr>
              </thead>
              <tbody>
                {incidentTypes.map((inc) => (
                  <tr key={inc.type} className="border-b">
                    <td className="p-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{inc.type}</code>
                    </td>
                    <td className="p-2 text-center">
                      <Badge variant={
                        inc.severity === 'critical' ? 'destructive' :
                        inc.severity === 'high' ? 'default' :
                        'outline'
                      }>
                        {inc.severity}
                      </Badge>
                    </td>
                    <td className="p-2 text-muted-foreground">{inc.description}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {inc.sla}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Incident Response Flow */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <FileCheck className="h-4 w-4" />
            Incident Response Lifecycle
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AI INCIDENT RESPONSE LIFECYCLE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐          │
│  │ DETECTION      │────▶│ REPORTING      │────▶│ TRIAGE         │          │
│  │ • Manual       │     │ • Create       │     │ • Assign       │          │
│  │ • Automated    │     │   incident     │     │ • Classify     │          │
│  │ • User report  │     │ • Document     │     │ • Escalate?    │          │
│  └────────────────┘     └────────────────┘     └───────┬────────┘          │
│                                                         │                   │
│                              ┌──────────────────────────┘                   │
│                              │                                               │
│                              ▼                                               │
│                     ┌────────────────────────────────────┐                  │
│                     │         INVESTIGATION              │                  │
│                     │  • Review AI action logs           │                  │
│                     │  • Analyze input/output data       │                  │
│                     │  • Identify root cause             │                  │
│                     │  • Document findings               │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│                                     ▼                                        │
│                     ┌────────────────────────────────────┐                  │
│                     │       CORRECTIVE ACTION            │                  │
│                     │  • Define remediation steps        │                  │
│                     │  • Implement fixes                 │                  │
│                     │  • Test and validate               │                  │
│                     │  • Update model/config if needed   │                  │
│                     └───────────────┬────────────────────┘                  │
│                                     │                                        │
│                                     ▼                                        │
│                     ┌────────────────────────────────────┐                  │
│                     │        CLOSURE & REVIEW            │                  │
│                     │  • Complete RCA documentation      │                  │
│                     │  • Document lessons learned        │                  │
│                     │  • Post-incident review meeting    │                  │
│                     │  • Update procedures/training      │                  │
│                     └────────────────────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Matrix */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Users className="h-4 w-4" />
            Escalation Matrix
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/50">
              <h5 className="font-medium text-red-700 dark:text-red-300 mb-2">Critical Incidents</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Immediately disable affected feature</li>
                <li>• Notify: CTO, CISO, DPO (if privacy)</li>
                <li>• War room activation within 30 minutes</li>
                <li>• Hourly status updates until resolved</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg border-amber-200 bg-amber-50 dark:bg-amber-950/50">
              <h5 className="font-medium text-amber-700 dark:text-amber-300 mb-2">High Severity</h5>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Flag for urgent review</li>
                <li>• Notify: HR Admin, System Owner</li>
                <li>• Daily status updates</li>
                <li>• Resolution within 24 hours</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={reportingSteps} title="Incident Reporting Procedure" />

      <FieldReferenceTable 
        fields={incidentFields} 
        title="Incident Response Fields (ai_incident_response_log)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Best Practice Callout */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Blameless Incident Culture</h5>
            <p className="text-sm text-muted-foreground mt-1">
              AI incidents are learning opportunities, not blame assignments. Focus on system 
              improvements, not individual failures. Document what happened, why it happened, 
              and how to prevent recurrence - not who caused it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

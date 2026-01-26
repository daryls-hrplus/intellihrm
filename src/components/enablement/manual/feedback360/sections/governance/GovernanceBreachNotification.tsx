import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { AlertOctagon, ArrowRight, Shield, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const learningObjectives = [
  'Identify and classify data breach scenarios in 360 feedback systems',
  'Execute the 72-hour supervisory authority notification procedure',
  'Determine when individual notification is required',
  'Document breach incidents for regulatory compliance'
];

const breachTypes = [
  {
    type: 'confidentiality',
    label: 'Confidentiality Breach',
    description: 'Unauthorized disclosure of feedback data or rater identities',
    examples: 'Anonymous feedback shared with wrong recipient, rater identity exposed',
    severity: 'High',
    notifyAuthority: 'Yes',
    notifyIndividuals: 'Yes'
  },
  {
    type: 'integrity',
    label: 'Integrity Breach',
    description: 'Unauthorized modification of feedback data',
    examples: 'Ratings tampered, feedback comments altered, scores manipulated',
    severity: 'High',
    notifyAuthority: 'Yes',
    notifyIndividuals: 'Case-by-case'
  },
  {
    type: 'availability',
    label: 'Availability Breach',
    description: 'Unauthorized destruction or loss of feedback data',
    examples: 'Data accidentally deleted, backup failure, ransomware attack',
    severity: 'Medium-High',
    notifyAuthority: 'Risk-based',
    notifyIndividuals: 'If significant impact'
  }
];

const breachFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the breach incident',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'company_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the company',
    validation: 'Must exist in companies table'
  },
  {
    name: 'cycle_id',
    required: false,
    type: 'UUID',
    description: 'Reference to affected feedback cycle (if applicable)',
    validation: 'Must exist in feedback_360_cycles'
  },
  {
    name: 'breach_type',
    required: true,
    type: 'text',
    description: 'Classification of the breach',
    validation: 'One of: confidentiality, integrity, availability'
  },
  {
    name: 'breach_description',
    required: true,
    type: 'text',
    description: 'Detailed description of what occurred',
    validation: 'Minimum 100 characters'
  },
  {
    name: 'affected_records_count',
    required: false,
    type: 'integer',
    description: 'Number of data subject records affected',
    validation: 'Required for notification assessment'
  },
  {
    name: 'detection_timestamp',
    required: true,
    type: 'timestamp',
    description: 'When the breach was detected',
    validation: '72-hour countdown starts from this point'
  },
  {
    name: 'notification_deadline',
    required: false,
    type: 'timestamp',
    description: 'Supervisory authority notification deadline',
    validation: 'detection_timestamp + 72 hours'
  },
  {
    name: 'authority_notified_at',
    required: false,
    type: 'timestamp',
    description: 'When supervisory authority was notified',
    validation: 'Must be before notification_deadline'
  },
  {
    name: 'individuals_notified_at',
    required: false,
    type: 'timestamp',
    description: 'When affected individuals were notified',
    validation: 'Required for high-risk breaches'
  },
  {
    name: 'root_cause_analysis',
    required: false,
    type: 'text',
    description: 'Analysis of how the breach occurred',
    validation: 'Required before closure'
  },
  {
    name: 'remediation_actions',
    required: false,
    type: 'JSONB',
    description: 'Actions taken to address the breach',
    validation: 'JSON array of remediation steps'
  },
  {
    name: 'status',
    required: true,
    type: 'text',
    description: 'Current status of breach handling',
    defaultValue: 'detected',
    validation: 'One of: detected, assessed, notified, remediated, closed'
  }
];

const breachResponseSteps: Step[] = [
  {
    title: 'Detect and Contain',
    description: 'Identify the breach and take immediate containment actions.',
    substeps: [
      'Confirm breach has occurred (not false positive)',
      'Record detection_timestamp immediately',
      'Implement containment measures (revoke access, isolate systems)',
      'Preserve evidence for investigation',
      'Alert incident response team'
    ],
    expectedResult: 'Breach contained; 72-hour countdown initiated'
  },
  {
    title: 'Assess Severity and Scope',
    description: 'Determine the nature and extent of the breach.',
    substeps: [
      'Identify breach_type (confidentiality, integrity, availability)',
      'Count affected_records and identify data categories',
      'Assess risk to data subjects (likelihood × severity)',
      'Determine if supervisory authority notification required',
      'Determine if individual notification required'
    ],
    expectedResult: 'Risk assessment complete; notification requirements determined'
  },
  {
    title: 'Notify Supervisory Authority (if required)',
    description: 'Submit notification within 72 hours of detection.',
    substeps: [
      'Prepare notification with required information',
      'Include: nature of breach, categories of data, approximate numbers',
      'Include: likely consequences and mitigation measures',
      'Submit to relevant supervisory authority',
      'Record authority_notified_at and reference number'
    ],
    expectedResult: 'Supervisory authority notified within 72 hours'
  },
  {
    title: 'Notify Affected Individuals (if required)',
    description: 'Inform data subjects when breach poses high risk.',
    substeps: [
      'Prepare clear, plain-language notification',
      'Explain nature of breach and potential consequences',
      'Provide recommended protective actions',
      'Provide DPO/contact information for questions',
      'Send notifications and record individuals_notified_at'
    ],
    expectedResult: 'Affected individuals informed of breach and protective measures'
  },
  {
    title: 'Remediate and Document',
    description: 'Address root cause and complete incident documentation.',
    substeps: [
      'Conduct root_cause_analysis',
      'Implement remediation_actions to prevent recurrence',
      'Document lessons learned',
      'Update policies and procedures as needed',
      'Close incident with complete audit trail'
    ],
    expectedResult: 'Breach remediated; documentation complete for regulatory inspection'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: '72-hour notification deadline is mandatory',
    enforcement: 'System',
    description: 'System alerts escalate as deadline approaches; blocking alert at 70 hours'
  },
  {
    rule: 'All breaches must be logged regardless of severity',
    enforcement: 'System',
    description: 'Even minor incidents without notification requirement must be documented'
  },
  {
    rule: 'Individual notification required for high-risk breaches',
    enforcement: 'Policy',
    description: 'When breach likely to result in high risk to rights and freedoms'
  },
  {
    rule: 'Evidence preservation is mandatory',
    enforcement: 'System',
    description: 'System logs and affected data must be preserved for investigation'
  },
  {
    rule: 'DPO must be consulted on notification decisions',
    enforcement: 'Policy',
    description: 'Data Protection Officer reviews all breach assessments'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot determine if supervisory authority notification is required',
    cause: 'Unclear risk assessment for the specific breach scenario',
    solution: 'When in doubt, notify. GDPR encourages notification. Document the risk assessment process. Consult DPO. Consider: would a reasonable person expect notification?'
  },
  {
    issue: '72-hour deadline approaching but assessment incomplete',
    cause: 'Complex breach or limited information available',
    solution: 'Submit initial notification with available information. GDPR allows phased notification - provide additional details as investigation progresses. Note limitations in initial submission.'
  },
  {
    issue: 'Breach affects multiple jurisdictions',
    cause: 'Organization operates across countries with different regulators',
    solution: 'Identify lead supervisory authority based on main establishment. Notify lead authority who will coordinate with other authorities. Prepare for varying local requirements.'
  },
  {
    issue: 'Anonymous rater identity was exposed',
    cause: 'System error or unauthorized access revealed rater information',
    solution: 'This is a confidentiality breach requiring notification. Immediately revoke access. Notify affected raters. Consider counseling support for exposed individuals. Review anonymity controls.'
  }
];

export function GovernanceBreachNotification() {
  return (
    <section id="sec-4-12" data-manual-anchor="sec-4-12" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-primary" />
          4.12 Breach Notification Procedures
        </h3>
        <p className="text-muted-foreground mt-2">
          GDPR Article 33 (72-hour notification) and Article 34 (individual notification) compliance for data breach incidents.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Industry Standard: GDPR Articles 33-34</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          This section implements breach notification procedures per GDPR requirements and aligns with 
          ISO 27001 incident management and enterprise HRMS security standards.
        </AlertDescription>
      </Alert>

      <LearningObjectives objectives={learningObjectives} />

      {/* Critical 72-Hour Warning */}
      <Alert variant="destructive">
        <Clock className="h-4 w-4" />
        <AlertTitle>72-Hour Notification Deadline</AlertTitle>
        <AlertDescription>
          GDPR Article 33 requires notification to the supervisory authority <strong>within 72 hours</strong> of 
          becoming aware of a personal data breach. Failure to notify can result in significant fines. 
          When in doubt, notify early and provide additional details as they become available.
        </AlertDescription>
      </Alert>

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Navigation Path</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Performance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">360 Feedback</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Governance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Breach Incidents</span>
          </div>
        </CardContent>
      </Card>

      {/* Breach Types Table */}
      <div>
        <h4 className="font-medium mb-4">Breach Type Classification</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Breach Type</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Examples</TableHead>
                <TableHead className="font-medium">Notify Authority?</TableHead>
                <TableHead className="font-medium">Notify Individuals?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breachTypes.map((breach) => (
                <TableRow key={breach.type}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{breach.type}</code>
                    <p className="text-xs text-muted-foreground mt-1">{breach.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{breach.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{breach.examples}</TableCell>
                  <TableCell>
                    <Badge 
                      className={breach.notifyAuthority === 'Yes' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-amber-500 text-white'
                      }
                    >
                      {breach.notifyAuthority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{breach.notifyIndividuals}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 72-Hour Timeline Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">72-Hour Response Timeline</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    BREACH NOTIFICATION TIMELINE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  HOUR 0              HOUR 24            HOUR 48            HOUR 72      │
│     │                   │                   │                  │        │
│     ▼                   ▼                   ▼                  ▼        │
│  ┌──────┐          ┌──────┐          ┌──────┐          ┌──────────┐   │
│  │DETECT│ ───────▶ │ASSESS│ ───────▶ │NOTIFY│ ───────▶ │ DEADLINE │   │
│  │      │          │      │          │      │          │          │   │
│  └──────┘          └──────┘          └──────┘          └──────────┘   │
│                                                                         │
│  IMMEDIATE (0-4 hours):                                                 │
│  ● Confirm breach occurred                                              │
│  ● Contain and preserve evidence                                        │
│  ● Notify incident response team                                        │
│  ● Begin documentation                                                  │
│                                                                         │
│  ASSESSMENT (4-24 hours):                                               │
│  ● Classify breach type                                                 │
│  ● Identify affected data/individuals                                   │
│  ● Assess risk level                                                    │
│  ● Determine notification requirements                                  │
│                                                                         │
│  NOTIFICATION (24-72 hours):                                            │
│  ● Prepare notification content                                         │
│  ● Submit to supervisory authority                                      │
│  ● Notify individuals if high risk                                     │
│  ● Document all notifications                                           │
│                                                                         │
│  ⚠️ ESCALATION ALERTS:                                                  │
│  ● Hour 48: Warning to DPO and Legal                                    │
│  ● Hour 70: Blocking alert to executives                                │
│  ● Hour 72: Deadline passed - regulatory violation                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={breachResponseSteps} 
        title="Breach Response and Notification Procedure" 
      />

      <FieldReferenceTable 
        fields={breachFields} 
        title="Breach Incident Schema (feedback_breach_incidents)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Breach Handling Issues" 
      />
    </section>
  );
}

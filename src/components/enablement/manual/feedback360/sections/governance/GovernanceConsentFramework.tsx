import { LearningObjectives } from '../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../components/BusinessRules';
import { FileCheck, Shield, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  'Understand the 6 consent types and their purposes',
  'Explain GDPR Article 7 compliance requirements for consent',
  'Describe consent versioning and withdrawal implications',
  'Configure required vs. optional consent types for cycles'
];

const consentTypes = [
  {
    type: 'participation',
    label: 'Participation Consent',
    required: true,
    description: 'Agreement to participate in the 360 feedback process',
    gdprBasis: 'Legitimate interest / Contract',
    withdrawal: 'Removes participant from cycle; existing responses retained'
  },
  {
    type: 'data_processing',
    label: 'Data Processing Consent',
    required: true,
    description: 'Consent for processing feedback data as described in privacy policy',
    gdprBasis: 'Consent (Article 6.1.a)',
    withdrawal: 'Data anonymized or deleted per retention policy'
  },
  {
    type: 'ai_analysis',
    label: 'AI Analysis Consent',
    required: false,
    description: 'Permission for AI to analyze feedback and generate insights',
    gdprBasis: 'Consent (Article 22 - automated decisions)',
    withdrawal: 'AI features disabled for participant; manual analysis only'
  },
  {
    type: 'signal_generation',
    label: 'Signal Generation Consent',
    required: false,
    description: 'Allow extraction of talent signals for succession/development',
    gdprBasis: 'Consent (Article 6.1.a)',
    withdrawal: 'Signals not generated; excluded from talent analytics'
  },
  {
    type: 'external_sharing',
    label: 'External Sharing Consent',
    required: false,
    description: 'Permission to share anonymized data with external parties (consultants)',
    gdprBasis: 'Consent (Article 6.1.a)',
    withdrawal: 'Data excluded from external reports'
  },
  {
    type: 'report_distribution',
    label: 'Report Distribution Consent',
    required: false,
    description: 'Agreement to receive and have reports distributed to stakeholders',
    gdprBasis: 'Legitimate interest',
    withdrawal: 'Reports restricted to HR-only access'
  }
];

const consentRecordFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the consent record',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'employee_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the employee providing consent',
    validation: 'Must exist in profiles'
  },
  {
    name: 'cycle_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the feedback cycle',
    validation: 'Must exist in feedback_360_cycles'
  },
  {
    name: 'consent_type',
    required: true,
    type: 'text',
    description: 'Type of consent being recorded',
    validation: 'One of: participation, data_processing, ai_analysis, signal_generation, external_sharing, report_distribution'
  },
  {
    name: 'consent_given',
    required: true,
    type: 'boolean',
    description: 'Whether consent was granted or declined',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'consent_version',
    required: true,
    type: 'text',
    description: 'Version of consent language/policy agreed to',
    defaultValue: '1.0',
    validation: 'Semantic version format'
  },
  {
    name: 'consent_text',
    required: false,
    type: 'text',
    description: 'Full text of consent language at time of agreement',
    validation: 'Stored for audit purposes'
  },
  {
    name: 'ip_address',
    required: false,
    type: 'INET',
    description: 'IP address at time of consent (GDPR audit trail)',
    validation: 'Valid IPv4 or IPv6'
  },
  {
    name: 'user_agent',
    required: false,
    type: 'text',
    description: 'Browser/device information at consent time',
    validation: 'String'
  },
  {
    name: 'consented_at',
    required: false,
    type: 'timestamp',
    description: 'Timestamp when consent was recorded',
    validation: 'Auto-set on insert'
  },
  {
    name: 'withdrawn_at',
    required: false,
    type: 'timestamp',
    description: 'Timestamp when consent was withdrawn (null if active)',
    validation: 'Set when withdrawal processed'
  },
  {
    name: 'withdrawal_reason',
    required: false,
    type: 'text',
    description: 'Reason provided for consent withdrawal',
    validation: 'Optional text field'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Required consents must be granted before participation',
    enforcement: 'System',
    description: 'ConsentGate component blocks access until participation and data_processing consents are given'
  },
  {
    rule: 'Consent version must match current policy version',
    enforcement: 'System',
    description: 'Outdated consent prompts re-consent when policy is updated'
  },
  {
    rule: 'Withdrawal must be processed within 30 days',
    enforcement: 'Policy',
    description: 'GDPR requires timely response to withdrawal requests'
  },
  {
    rule: 'IP address and user agent captured for audit',
    enforcement: 'System',
    description: 'Provides evidence of informed consent for regulatory compliance'
  },
  {
    rule: 'Consent records are immutable',
    enforcement: 'System',
    description: 'New records created for changes; original records preserved for audit trail'
  }
];

export function GovernanceConsentFramework() {
  return (
    <section id="sec-4-3" data-manual-anchor="sec-4-3" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          4.3 Consent Management Framework
        </h3>
        <p className="text-muted-foreground mt-2">
          Understanding the 6 consent types, GDPR requirements, versioning, and withdrawal rights that govern 360 feedback data processing.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Consent Lifecycle Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4" />
            Consent Lifecycle Flow
          </h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────┐
│                     CONSENT LIFECYCLE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Cycle Enrollment         Consent Collection       Active State     │
│        │                        │                       │           │
│        ▼                        ▼                       ▼           │
│  ┌──────────┐            ┌────────────┐          ┌───────────┐     │
│  │ConsentGate│ ───────▶ │   Consent   │ ───────▶ │  Consent  │     │
│  │  Blocks   │          │   Dialog    │          │  Active   │     │
│  │  Access   │          │   Display   │          │  (Valid)  │     │
│  └──────────┘            └─────┬──────┘          └─────┬─────┘     │
│                                │                       │            │
│                    ┌───────────┴───────────┐          │            │
│                    ▼                       ▼          │            │
│              ┌─────────┐            ┌──────────┐     │            │
│              │ GRANT   │            │ DECLINE  │     │            │
│              └────┬────┘            └────┬─────┘     │            │
│                   │                      │           │            │
│                   ▼                      ▼           │            │
│            ┌────────────┐         ┌───────────┐     │            │
│            │Record with │         │ Block if  │     │            │
│            │IP/UserAgent│         │ Required  │     │            │
│            └────────────┘         └───────────┘     │            │
│                                                      │            │
│                               ┌──────────────────────┘            │
│                               ▼                                    │
│                        ┌─────────────┐                            │
│                        │ WITHDRAWAL  │                            │
│                        │  Request    │                            │
│                        └──────┬──────┘                            │
│                               │                                    │
│                               ▼                                    │
│                        ┌─────────────┐                            │
│                        │Set withdrawn│                            │
│                        │_at + reason │                            │
│                        └─────────────┘                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Consent Types Table */}
      <div>
        <h4 className="font-medium mb-4">Six Consent Types</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Consent Type</TableHead>
                <TableHead className="font-medium">Required</TableHead>
                <TableHead className="font-medium">Purpose</TableHead>
                <TableHead className="font-medium">GDPR Basis</TableHead>
                <TableHead className="font-medium">Withdrawal Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consentTypes.map((consent) => (
                <TableRow key={consent.type}>
                  <TableCell className="font-medium">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {consent.type}
                    </code>
                    <p className="text-xs text-muted-foreground mt-1">{consent.label}</p>
                  </TableCell>
                  <TableCell>
                    {consent.required ? (
                      <Badge className="bg-red-600 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Required
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Optional
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{consent.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{consent.gdprBasis}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{consent.withdrawal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* GDPR Compliance Callout */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-200">
            <Shield className="h-4 w-4" />
            GDPR Compliance Requirements
          </h4>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Article 7:</strong> Consent must be freely given, specific, informed, and unambiguous</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Article 13:</strong> Clear information about data controller, purpose, and rights provided at collection</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Article 17:</strong> Right to erasure ("right to be forgotten") supported via withdrawal workflow</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Article 22:</strong> AI analysis requires explicit consent for automated decision-making</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={consentRecordFields} 
        title="Consent Record Schema (feedback_consent_records)" 
      />

      <BusinessRules rules={businessRules} />
    </section>
  );
}

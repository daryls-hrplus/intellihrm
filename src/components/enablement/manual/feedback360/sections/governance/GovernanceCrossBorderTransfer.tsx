import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { Globe, ArrowRight, Shield, MapPin, Info } from 'lucide-react';
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
  'Understand GDPR Chapter V transfer mechanisms and requirements',
  'Configure data residency for Caribbean, Africa, and EU regions',
  'Document cross-border transfers with appropriate safeguards',
  'Conduct Transfer Impact Assessments for third-country transfers'
];

const transferMechanisms = [
  {
    mechanism: 'adequacy',
    label: 'Adequacy Decision',
    description: 'European Commission has determined country provides adequate protection',
    examples: 'UK, Canada, Japan, South Korea, Argentina',
    complexity: 'Low',
    documentation: 'Reference EC decision'
  },
  {
    mechanism: 'sccs',
    label: 'Standard Contractual Clauses',
    description: 'Pre-approved contractual terms between data exporter and importer',
    examples: 'Most third-country transfers including Caribbean, Africa',
    complexity: 'Medium',
    documentation: 'Signed SCCs + TIA'
  },
  {
    mechanism: 'bcrs',
    label: 'Binding Corporate Rules',
    description: 'Group-wide policies for intra-group international transfers',
    examples: 'Multinational corporate groups',
    complexity: 'High',
    documentation: 'Approved BCRs'
  },
  {
    mechanism: 'consent',
    label: 'Explicit Consent',
    description: 'Data subject explicitly consents after being informed of risks',
    examples: 'Occasional transfers, specific circumstances',
    complexity: 'Medium',
    documentation: 'Documented consent'
  },
  {
    mechanism: 'derogation',
    label: 'Derogation',
    description: 'Transfer necessary for contract, legal claims, or vital interests',
    examples: 'Employment contract performance, legal proceedings',
    complexity: 'Low',
    documentation: 'Legal basis documentation'
  }
];

const regionalRequirements = [
  {
    region: 'EU/EEA',
    requirement: 'GDPR Chapter V',
    mechanism: 'No restriction within EEA',
    notes: 'Free movement within EU/EEA; transfer mechanism required for exports'
  },
  {
    region: 'UK',
    requirement: 'UK GDPR',
    mechanism: 'Adequacy decision from EU',
    notes: 'Treated as third country by EU; adequacy decision in place'
  },
  {
    region: 'Caribbean (Jamaica)',
    requirement: 'Data Protection Act 2020',
    mechanism: 'SCCs recommended',
    notes: 'Consent or adequate safeguards required for cross-border transfers'
  },
  {
    region: 'Caribbean (Trinidad)',
    requirement: 'Data Protection Act 2011',
    mechanism: 'SCCs or consent',
    notes: 'Transfer to countries without adequate protection requires safeguards'
  },
  {
    region: 'Ghana',
    requirement: 'Data Protection Act 2012',
    mechanism: 'Consent + safeguards',
    notes: 'Written consent required; adequate security measures mandatory'
  },
  {
    region: 'Nigeria',
    requirement: 'NDPR 2019',
    mechanism: 'Adequacy or consent',
    notes: 'NITDA can designate adequate countries; consent alternative'
  }
];

const transferFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the transfer record',
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
    name: 'source_jurisdiction',
    required: true,
    type: 'text',
    description: 'Country/region where data originates',
    validation: 'ISO country code or region identifier'
  },
  {
    name: 'destination_jurisdiction',
    required: true,
    type: 'text',
    description: 'Country/region receiving the data',
    validation: 'ISO country code or region identifier'
  },
  {
    name: 'transfer_mechanism',
    required: true,
    type: 'text',
    description: 'Legal basis for the transfer',
    validation: 'One of: adequacy, sccs, bcrs, consent, derogation'
  },
  {
    name: 'data_categories',
    required: false,
    type: 'JSONB',
    description: 'Types of data being transferred',
    validation: 'JSON array: feedback, ratings, signals, reports'
  },
  {
    name: 'purpose',
    required: true,
    type: 'text',
    description: 'Purpose of the data transfer',
    validation: 'Clear statement of processing purpose'
  },
  {
    name: 'recipient_name',
    required: false,
    type: 'text',
    description: 'Name of data recipient organization',
    validation: 'Required for third-party transfers'
  },
  {
    name: 'safeguards_description',
    required: false,
    type: 'text',
    description: 'Description of protective measures in place',
    validation: 'Required for SCC and consent transfers'
  },
  {
    name: 'is_active',
    required: true,
    type: 'boolean',
    description: 'Whether transfer is currently active',
    defaultValue: 'true',
    validation: 'Boolean'
  },
  {
    name: 'approved_by',
    required: false,
    type: 'UUID',
    description: 'User who approved the transfer',
    validation: 'DPO or designated approver'
  },
  {
    name: 'review_due_date',
    required: false,
    type: 'date',
    description: 'Next scheduled review date',
    validation: 'Typically annual review'
  }
];

const transferConfigSteps: Step[] = [
  {
    title: 'Map Data Flows',
    description: 'Identify all cross-border data transfers in 360 feedback.',
    substeps: [
      'List all locations where 360 data is processed',
      'Identify any third-party vendors with data access',
      'Document cloud hosting locations',
      'Map reporting and analytics data flows'
    ],
    expectedResult: 'Complete data flow map for 360 feedback system'
  },
  {
    title: 'Assess Transfer Legality',
    description: 'Determine appropriate transfer mechanism for each flow.',
    substeps: [
      'Check if destination has adequacy decision',
      'If not adequate, identify appropriate mechanism (SCCs, BCRs, consent)',
      'Conduct Transfer Impact Assessment for third countries',
      'Document supplementary measures if needed'
    ],
    expectedResult: 'Transfer mechanism identified for each data flow'
  },
  {
    title: 'Implement Safeguards',
    description: 'Put required protections in place.',
    substeps: [
      'Execute SCCs with data importers',
      'Implement technical measures (encryption, pseudonymization)',
      'Configure data residency settings in system',
      'Obtain consents where required'
    ],
    expectedResult: 'Safeguards implemented and documented'
  },
  {
    title: 'Document Transfers',
    description: 'Create transfer records in the system.',
    substeps: [
      'Create transfer record with all required fields',
      'Attach supporting documentation (SCCs, TIA)',
      'Obtain DPO/approver sign-off',
      'Set review_due_date for annual review'
    ],
    expectedResult: 'Transfer records complete and approved'
  },
  {
    title: 'Monitor and Review',
    description: 'Ongoing compliance monitoring.',
    substeps: [
      'Monitor for changes in destination country laws',
      'Review transfer impact assessments annually',
      'Update safeguards as needed',
      'Respond to supervisory authority inquiries'
    ],
    expectedResult: 'Transfers remain compliant over time'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Transfer mechanism required before data export',
    enforcement: 'System',
    description: 'Cannot configure cross-border data flow without documented transfer basis'
  },
  {
    rule: 'Annual review of active transfers mandatory',
    enforcement: 'System',
    description: 'System alerts when review_due_date approaches'
  },
  {
    rule: 'TIA required for non-adequate countries',
    enforcement: 'Policy',
    description: 'Transfer Impact Assessment must evaluate destination country surveillance laws'
  },
  {
    rule: 'DPO approval required for new transfer arrangements',
    enforcement: 'System',
    description: 'approved_by must be set before transfer becomes active'
  },
  {
    rule: 'Consent must be informed and specific',
    enforcement: 'Policy',
    description: 'When using consent mechanism, data subject must be informed of risks'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Adequacy decision revoked or suspended',
    cause: 'EU invalidates adequacy decision (e.g., Schrems II)',
    solution: 'Immediately assess impact. Switch to alternative mechanism (SCCs). Conduct TIA. Implement supplementary measures. May need to pause transfers while assessments complete.'
  },
  {
    issue: 'Employee in country without clear transfer mechanism',
    cause: 'Remote worker or expatriate in third country',
    solution: 'Employment contract performance may be sufficient (derogation). Document the necessity. Consider SCCs if regular data flow. Minimize data transferred.'
  },
  {
    issue: 'Third-party vendor refuses to sign SCCs',
    cause: 'Vendor unwilling to accept SCC obligations',
    solution: 'Explain regulatory requirement. Explore alternative vendors. If critical vendor, escalate to legal for negotiation. Consider if service can be provided without transfer.'
  },
  {
    issue: 'Unclear data residency for cloud services',
    cause: 'Cloud provider has multiple processing locations',
    solution: 'Request Data Processing Agreement with location commitments. Configure regional data residency where available. Document in transfer records. Monitor for changes.'
  }
];

export function GovernanceCrossBorderTransfer() {
  return (
    <section id="sec-4-13" data-manual-anchor="sec-4-13" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          4.13 Cross-Border Data Transfer
        </h3>
        <p className="text-muted-foreground mt-2">
          GDPR Chapter V compliance, transfer mechanisms (SCCs, BCRs, adequacy), and regional requirements for Caribbean, Africa, and EU.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Industry Standard: GDPR Chapter V</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          This section implements cross-border transfer requirements per GDPR Articles 44-49 and aligns with 
          regional data protection laws in the Caribbean and Africa for multinational 360 feedback operations.
        </AlertDescription>
      </Alert>

      {/* Implementation Architecture Note */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Implementation Architecture</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <p className="mb-2">
            The <code className="text-xs bg-green-100 dark:bg-green-900 px-1 rounded">feedback_data_transfer_records</code> table 
            is fully implemented for transfer documentation. Per enterprise data governance standards, cross-border transfer 
            management is typically administered via Data Governance platforms (Collibra, Informatica, BigID) or Legal/Compliance 
            contract management systems.
          </p>
          <p className="text-sm">
            <strong>Integration Pattern:</strong> Legal/Compliance teams document transfers during vendor onboarding; the 360 Feedback 
            module enforces regional data residency and logs all cross-border data flows for audit.
          </p>
        </AlertDescription>
      </Alert>

      <LearningObjectives objectives={learningObjectives} />

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
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Data Transfers</span>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Mechanisms Table */}
      <div>
        <h4 className="font-medium mb-4">Transfer Mechanisms</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Mechanism</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Use Cases</TableHead>
                <TableHead className="font-medium">Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferMechanisms.map((mech) => (
                <TableRow key={mech.mechanism}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{mech.mechanism}</code>
                    <p className="text-xs text-muted-foreground mt-1">{mech.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{mech.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{mech.examples}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        mech.complexity === 'Low' ? 'border-green-500 text-green-700' :
                        mech.complexity === 'Medium' ? 'border-amber-500 text-amber-700' :
                        'border-red-500 text-red-700'
                      }
                    >
                      {mech.complexity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Regional Requirements Table */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <MapPin className="h-4 w-4" />
          Regional Data Protection Requirements
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Region</TableHead>
                <TableHead className="font-medium">Legal Framework</TableHead>
                <TableHead className="font-medium">Transfer Mechanism</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionalRequirements.map((req) => (
                <TableRow key={req.region}>
                  <TableCell className="font-medium">{req.region}</TableCell>
                  <TableCell className="text-sm">{req.requirement}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{req.mechanism}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{req.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transfer Decision Tree */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Transfer Mechanism Decision Tree</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    TRANSFER MECHANISM DECISION                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  START: Need to transfer 360 data outside origin jurisdiction          │
│                              │                                          │
│                              ▼                                          │
│              ┌───────────────────────────────┐                         │
│              │ Is destination in EU/EEA?     │                         │
│              └───────────────┬───────────────┘                         │
│                     YES │           │ NO                                │
│                         ▼           ▼                                   │
│               ┌────────────┐  ┌────────────────────────┐               │
│               │ No transfer│  │ Has adequacy decision?  │               │
│               │ mechanism  │  └───────────┬────────────┘               │
│               │ required   │       YES │         │ NO                   │
│               └────────────┘           ▼         ▼                      │
│                              ┌────────────┐  ┌─────────────────┐       │
│                              │ Use adequacy│  │ SCCs available? │       │
│                              │ (document)  │  └────────┬────────┘       │
│                              └────────────┘    YES │         │ NO       │
│                                                    ▼         ▼          │
│                                          ┌────────────┐ ┌──────────┐   │
│                                          │ Sign SCCs  │ │ BCRs or  │   │
│                                          │ + TIA      │ │ consent? │   │
│                                          └────────────┘ └────┬─────┘   │
│                                                              │          │
│  ⚠️ Note: Always conduct Transfer Impact Assessment (TIA)    ▼          │
│     for non-adequate countries to evaluate surveillance    ┌────────┐  │
│     laws and supplementary measures needed.               │Document │  │
│                                                            │basis    │  │
│                                                            └────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={transferConfigSteps} 
        title="Configuring Cross-Border Data Transfers" 
      />

      <FieldReferenceTable 
        fields={transferFields} 
        title="Transfer Record Schema (feedback_data_transfer_records)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Cross-Border Transfer Issues" 
      />
    </section>
  );
}

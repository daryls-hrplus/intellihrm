import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { ConfigurationExample, ExampleConfig } from '../../../components/ConfigurationExample';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { Clock, AlertTriangle, Globe } from 'lucide-react';
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
  'Configure retention periods based on regulatory requirements (3-7 years)',
  'Schedule anonymization processes for expired data',
  'Understand Caribbean, African, and GDPR retention requirements',
  'Balance historical trend analysis with data minimization principles'
];

const regionalRequirements = [
  {
    region: 'Caribbean (General)',
    retention: '5-7 years',
    basis: 'Labor law record-keeping',
    notes: 'Varies by territory; Jamaica, Trinidad require longer retention'
  },
  {
    region: 'Jamaica',
    retention: '7 years',
    basis: 'Employment (Termination) Act',
    notes: 'Personnel records must be kept for 7 years after employment ends'
  },
  {
    region: 'Trinidad & Tobago',
    retention: '6 years',
    basis: 'Industrial Relations Act',
    notes: 'Performance records subject to industrial dispute review'
  },
  {
    region: 'Nigeria',
    retention: '5 years',
    basis: 'Labour Act; NDPR',
    notes: 'NDPR requires purpose limitation; retain only as needed'
  },
  {
    region: 'Ghana',
    retention: '5 years',
    basis: 'Labour Act 2003; Data Protection Act',
    notes: 'Consent-based retention; purpose limitation applies'
  },
  {
    region: 'GDPR (EU/UK)',
    retention: 'Purpose-limited',
    basis: 'Article 5(1)(e) - Storage limitation',
    notes: 'No fixed period; retain only as long as necessary for purpose'
  }
];

const retentionSteps: Step[] = [
  {
    title: 'Assess Regulatory Requirements',
    description: 'Determine applicable retention requirements for your organization.',
    substeps: [
      'Identify all jurisdictions where employees are located',
      'Review regional labor laws and data protection regulations',
      'Consult legal/compliance team for specific requirements',
      'Document the longest applicable retention period'
    ],
    expectedResult: 'Clear retention requirement defined (e.g., 7 years for Jamaica operations)'
  },
  {
    title: 'Configure Retention Policy',
    description: 'Set up the retention policy in the system.',
    substeps: [
      'Navigate to Governance → Data Policies',
      'Create or edit "retention" policy type',
      'Set retention_months value (e.g., 84 for 7 years)',
      'Configure auto_anonymize behavior'
    ],
    expectedResult: 'Retention policy configured and saved'
  },
  {
    title: 'Define Anonymization Rules',
    description: 'Specify how data should be anonymized when retention expires.',
    substeps: [
      'Choose anonymization strategy: delete vs. anonymize',
      'Configure which fields to anonymize (names, IDs, comments)',
      'Set aggregation rules for historical trends',
      'Test anonymization on sample data'
    ],
    expectedResult: 'Anonymization rules defined and tested'
  },
  {
    title: 'Schedule Automated Processing',
    description: 'Configure automatic execution of retention rules.',
    substeps: [
      'Enable automated retention processing',
      'Set processing frequency (monthly recommended)',
      'Configure notification for processed records',
      'Set up audit logging for processing actions'
    ],
    expectedResult: 'Automated retention processing scheduled'
  },
  {
    title: 'Verify and Monitor',
    description: 'Confirm retention processing is working correctly.',
    substeps: [
      'Review first automated processing run',
      'Verify anonymized records in audit log',
      'Confirm historical trend data preserved',
      'Set up alerts for processing failures'
    ],
    expectedResult: 'Retention processing validated and monitored'
  }
];

const configurationExamples: ExampleConfig[] = [
  {
    title: 'Caribbean Multi-Territory (Conservative)',
    context: 'Organization operating in Jamaica, Trinidad, and Barbados',
    values: [
      { field: 'retention_months', value: '84' },
      { field: 'auto_anonymize', value: 'true' },
      { field: 'anonymization_strategy', value: 'preserve_aggregates' },
      { field: 'processing_schedule', value: 'monthly' }
    ],
    outcome: '7-year retention (Jamaica max); monthly processing; aggregates preserved for trends'
  },
  {
    title: 'African Operations (Ghana/Nigeria)',
    context: 'Organization with data protection compliance focus',
    values: [
      { field: 'retention_months', value: '60' },
      { field: 'auto_anonymize', value: 'true' },
      { field: 'anonymization_strategy', value: 'full_anonymization' },
      { field: 'consent_based_extension', value: 'true' }
    ],
    outcome: '5-year retention; consent-based extension option; full anonymization at expiry'
  },
  {
    title: 'GDPR-Compliant (Purpose-Limited)',
    context: 'EU subsidiary with strict data minimization requirements',
    values: [
      { field: 'retention_months', value: '36' },
      { field: 'auto_anonymize', value: 'true' },
      { field: 'purpose_review_required', value: 'true' },
      { field: 'annual_justification', value: 'true' }
    ],
    outcome: '3-year baseline; annual review of continued purpose; strict anonymization'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Historical trend reports show gaps after retention processing',
    cause: 'Anonymization removed data needed for trend calculations',
    solution: 'Use "preserve_aggregates" strategy. Review anonymization rules to ensure aggregate metrics are retained before individual record processing.'
  },
  {
    issue: 'Retention processing not running on schedule',
    cause: 'Scheduled job disabled or failed silently',
    solution: 'Check scheduled job status in Admin → System → Jobs. Review job logs for errors. Verify database connection and permissions.'
  },
  {
    issue: 'Legal hold prevents required retention processing',
    cause: 'Data subject to litigation hold cannot be processed',
    solution: 'This is expected behavior. Document the hold in the system. Resume processing when legal hold is lifted. Notify compliance of delay.'
  },
  {
    issue: 'Cannot extend retention for specific employee',
    cause: 'Individual retention extension not configured',
    solution: 'Create exception record linking employee to extended retention policy. Document business justification. Set expiration for the exception.'
  }
];

export function GovernanceDataRetention() {
  return (
    <section id="sec-4-6" data-manual-anchor="sec-4-6" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          4.6 Data Retention & Anonymization
        </h3>
        <p className="text-muted-foreground mt-2">
          Configure retention periods (3-7 years), anonymization schedules, and regulatory compliance for Caribbean, Africa, and GDPR jurisdictions.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Regional Requirements Table */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4" />
          Regional Retention Requirements
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Region</TableHead>
                <TableHead className="font-medium">Retention Period</TableHead>
                <TableHead className="font-medium">Legal Basis</TableHead>
                <TableHead className="font-medium">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionalRequirements.map((req) => (
                <TableRow key={req.region}>
                  <TableCell className="font-medium">{req.region}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.retention}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{req.basis}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{req.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Data Lifecycle Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Data Lifecycle Flow</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LIFECYCLE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  COLLECTION         ACTIVE USE           ARCHIVE          DISPOSITION  │
│      │                  │                   │                  │        │
│      ▼                  ▼                   ▼                  ▼        │
│  ┌────────┐       ┌──────────┐       ┌───────────┐     ┌─────────────┐ │
│  │Feedback│ ────▶ │ Reports  │ ────▶ │ Read-Only │ ──▶ │ ANONYMIZE   │ │
│  │Submitted│      │ Analysis │       │ Historical│     │ or DELETE   │ │
│  └────────┘       └──────────┘       └───────────┘     └─────────────┘ │
│                                                                         │
│  Timeline:                                                              │
│  ─────────                                                              │
│  Day 0        Year 1-2           Year 3-6            Year 7+           │
│  Collection   Active Analysis    Archive Mode        Disposition       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ ANONYMIZATION OPTIONS                                           │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │ ● Full Delete: Remove all records permanently                   │   │
│  │ ● Preserve Aggregates: Keep averages/counts, remove individuals │   │
│  │ ● Hash Identifiers: Replace names with hashes, keep structure   │   │
│  │ ● Differential Privacy: Add noise to preserve trends safely     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">Important Consideration</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Shortened retention periods may impact historical trend analysis and year-over-year comparisons. 
          Consider using "preserve_aggregates" anonymization to maintain statistical value while protecting individual privacy.
        </AlertDescription>
      </Alert>

      <StepByStep 
        steps={retentionSteps} 
        title="Step-by-Step: Configure Data Retention" 
      />

      <ConfigurationExample 
        examples={configurationExamples} 
        title="Regional Configuration Examples" 
      />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Retention Processing Issues" 
      />
    </section>
  );
}

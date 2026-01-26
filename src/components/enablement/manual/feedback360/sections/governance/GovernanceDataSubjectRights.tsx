import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { UserCheck, ArrowRight, Shield, Clock, AlertTriangle, Info } from 'lucide-react';
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
  'Understand the 8 GDPR data subject rights applicable to 360 feedback',
  'Process Data Subject Access Requests (DSAR) within regulatory timelines',
  'Handle erasure requests while maintaining audit integrity',
  'Document and track all DSAR responses for compliance'
];

const dataSubjectRights = [
  {
    right: 'access',
    article: 'Article 15',
    label: 'Right of Access',
    description: 'Request copy of all personal data being processed',
    responseTime: '30 days',
    f360Impact: 'Export all feedback received, ratings, and reports'
  },
  {
    right: 'rectification',
    article: 'Article 16',
    label: 'Right to Rectification',
    description: 'Correct inaccurate personal data',
    responseTime: '30 days',
    f360Impact: 'Cannot change rater feedback; can correct participant profile data'
  },
  {
    right: 'erasure',
    article: 'Article 17',
    label: 'Right to Erasure',
    description: 'Delete personal data ("right to be forgotten")',
    responseTime: '30 days',
    f360Impact: 'Anonymize or delete feedback; preserve aggregate statistics'
  },
  {
    right: 'restriction',
    article: 'Article 18',
    label: 'Right to Restriction',
    description: 'Limit processing of personal data',
    responseTime: '30 days',
    f360Impact: 'Freeze data from further analysis; exclude from reports'
  },
  {
    right: 'portability',
    article: 'Article 20',
    label: 'Right to Portability',
    description: 'Receive data in machine-readable format',
    responseTime: '30 days',
    f360Impact: 'Export feedback data in JSON/CSV format'
  },
  {
    right: 'objection',
    article: 'Article 21',
    label: 'Right to Object',
    description: 'Object to processing based on legitimate interest',
    responseTime: '30 days',
    f360Impact: 'Opt-out of AI analysis, signal generation, or cross-module sharing'
  }
];

const dsarFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the DSAR',
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
    name: 'employee_id',
    required: true,
    type: 'UUID',
    description: 'Employee making the request',
    validation: 'Must exist in profiles'
  },
  {
    name: 'request_type',
    required: true,
    type: 'text',
    description: 'Type of data subject right being exercised',
    validation: 'One of: access, rectification, erasure, portability, restriction, objection'
  },
  {
    name: 'request_details',
    required: false,
    type: 'JSONB',
    description: 'Specific details about the request',
    validation: 'JSON object with request specifics'
  },
  {
    name: 'status',
    required: true,
    type: 'text',
    description: 'Current processing status',
    defaultValue: 'received',
    validation: 'One of: received, verified, processing, completed, denied'
  },
  {
    name: 'response_due_date',
    required: true,
    type: 'date',
    description: 'Deadline for response (30 days from receipt)',
    validation: 'Calculated on creation'
  },
  {
    name: 'verified_at',
    required: false,
    type: 'timestamp',
    description: 'When identity verification was completed',
    validation: 'Set when status changes to verified'
  },
  {
    name: 'completed_at',
    required: false,
    type: 'timestamp',
    description: 'When the request was fulfilled',
    validation: 'Set when status changes to completed'
  },
  {
    name: 'response_summary',
    required: false,
    type: 'text',
    description: 'Summary of actions taken to fulfill request',
    validation: 'Required for completed status'
  },
  {
    name: 'denial_reason',
    required: false,
    type: 'text',
    description: 'Reason for denying the request',
    validation: 'Required when status = denied'
  }
];

const dsarSteps: Step[] = [
  {
    title: 'Receive and Log Request',
    description: 'Record the incoming DSAR with initial details.',
    substeps: [
      'Request received via HR portal, email, or written form',
      'Create DSAR record in system with request_type and details',
      'System calculates response_due_date (receipt + 30 days)',
      'Requester receives acknowledgment notification'
    ],
    expectedResult: 'DSAR logged with 30-day countdown initiated'
  },
  {
    title: 'Verify Identity',
    description: 'Confirm the requester is the data subject or authorized representative.',
    substeps: [
      'Request identity verification (ID, security questions, or MFA)',
      'Verify authorization if request is from representative',
      'Document verification method and outcome',
      'Update status to "verified" upon confirmation'
    ],
    expectedResult: 'Identity confirmed; request proceeds to processing'
  },
  {
    title: 'Assess Request Scope',
    description: 'Determine what data and actions are required.',
    substeps: [
      'Identify all 360 feedback data for the employee',
      'Check for any exemptions (ongoing investigation, legal hold)',
      'Assess impact on anonymity of other raters',
      'Document scope in request_details JSONB'
    ],
    expectedResult: 'Clear scope defined for fulfillment'
  },
  {
    title: 'Execute Request',
    description: 'Perform the required actions based on request type.',
    substeps: [
      'Access: Generate comprehensive data export',
      'Erasure: Anonymize feedback data, preserve aggregates',
      'Portability: Export in machine-readable format (JSON/CSV)',
      'Restriction: Flag data to prevent further processing'
    ],
    expectedResult: 'Requested action completed within scope'
  },
  {
    title: 'Respond and Document',
    description: 'Provide response to the data subject and complete records.',
    substeps: [
      'Prepare response documentation',
      'Deliver data export or confirmation of actions',
      'Update status to "completed" with response_summary',
      'Archive request for regulatory compliance'
    ],
    expectedResult: 'Request fulfilled within 30-day deadline'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: '30-day response deadline mandatory',
    enforcement: 'System',
    description: 'System tracks due dates and escalates approaching deadlines'
  },
  {
    rule: 'Identity verification required before processing',
    enforcement: 'System',
    description: 'Cannot proceed to processing without verified status'
  },
  {
    rule: 'Erasure cannot compromise anonymity',
    enforcement: 'System',
    description: 'Rater identities remain protected even during erasure; use anonymization over deletion'
  },
  {
    rule: 'Legal holds block erasure requests',
    enforcement: 'System',
    description: 'Data under litigation hold must be preserved; denial documented with reason'
  },
  {
    rule: 'All DSAR actions are immutably logged',
    enforcement: 'System',
    description: 'Complete audit trail for regulatory inspection'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot verify employee identity',
    cause: 'Insufficient verification information or employee has left organization',
    solution: 'Request additional verification documents. For former employees, verify against HR records. If unverifiable, deny request with documented reason.'
  },
  {
    issue: 'Erasure request would de-anonymize raters',
    cause: 'Small rater pool where erasure would expose remaining raters',
    solution: 'Anonymize the participant data but preserve rater responses in aggregated form. Document in response_summary that full erasure would compromise other data subjects.'
  },
  {
    issue: 'Request deadline approaching with incomplete processing',
    cause: 'Complex request or resource constraints',
    solution: 'GDPR allows extension to 90 days for complex requests. Notify employee of extension before 30-day deadline with explanation. Document extension reason.'
  },
  {
    issue: 'Conflict between erasure and retention policy',
    cause: 'Regulatory retention requirements conflict with erasure request',
    solution: 'Document the conflict. Partial erasure may be possible (remove identifying data, keep anonymized records). Notify employee of the limitation and legal basis.'
  }
];

export function GovernanceDataSubjectRights() {
  return (
    <section id="sec-4-11" data-manual-anchor="sec-4-11" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          4.11 Data Subject Rights (DSAR)
        </h3>
        <p className="text-muted-foreground mt-2">
          GDPR Articles 15-22 compliance: processing access, rectification, erasure, portability, restriction, and objection requests.
        </p>
      </div>

      {/* Industry Standard Badge */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">Industry Standard: GDPR Chapters III-IV</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          This section implements data subject rights per GDPR Articles 15-22 and aligns with enterprise HRMS governance 
          standards (Workday, SAP SuccessFactors) for handling employee data requests.
        </AlertDescription>
      </Alert>

      {/* Implementation Architecture Note */}
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Implementation Architecture</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          <p className="mb-2">
            The <code className="text-xs bg-green-100 dark:bg-green-900 px-1 rounded">feedback_dsar_requests</code> table 
            is fully implemented and ready for data storage. Per enterprise HRMS standards (Workday, SAP SuccessFactors), 
            DSAR workflows are typically managed via dedicated GRC platforms (OneTrust, ServiceNow, TrustArc) rather than 
            embedded module UIs.
          </p>
          <p className="text-sm">
            <strong>Integration Pattern:</strong> External GRC tools write to this table via API; the 360 Feedback module 
            enforces data restrictions and logs all access for audit compliance.
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
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Data Subject Requests</span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Warning */}
      <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-200">30-Day Response Deadline</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          GDPR requires response to DSARs within <strong>one month</strong> of receipt. Extensions to 3 months are 
          permitted for complex requests, but the data subject must be notified within the initial month.
        </AlertDescription>
      </Alert>

      {/* Data Subject Rights Table */}
      <div>
        <h4 className="font-medium mb-4">Data Subject Rights Applicable to 360 Feedback</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Right</TableHead>
                <TableHead className="font-medium">GDPR Article</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">360 Feedback Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSubjectRights.map((right) => (
                <TableRow key={right.right}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{right.right}</code>
                    <p className="text-xs text-muted-foreground mt-1">{right.label}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{right.article}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{right.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{right.f360Impact}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* DSAR Workflow Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">DSAR Processing Workflow</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    DSAR PROCESSING WORKFLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌───────────────┐   │
│  │ RECEIVED │ ─▶ │ VERIFIED │ ─▶ │PROCESSING │ ─▶ │  COMPLETED    │   │
│  │  (Day 0) │    │ (Day 3)  │    │ (Day 5-25)│    │  (Day 30 max) │   │
│  └──────────┘    └──────────┘    └───────────┘    └───────────────┘   │
│       │               │                                                 │
│       │               ▼                                                 │
│       │        ┌─────────────┐                                         │
│       │        │   DENIED    │ ← Exemption applies                     │
│       │        │ (Document)  │                                         │
│       │        └─────────────┘                                         │
│       │                                                                 │
│  TIMELINE:                                                              │
│  ─────────                                                              │
│  Day 1-3:   Acknowledge receipt, begin identity verification           │
│  Day 3-5:   Complete verification, assess scope                        │
│  Day 5-25:  Execute request (export, anonymize, restrict)              │
│  Day 25-30: Prepare response, deliver to data subject                  │
│                                                                         │
│  EXTENSIONS (Complex Requests):                                         │
│  ─────────────────────────────                                          │
│  ● Notify employee before Day 30 if extension needed                   │
│  ● Maximum extension: 60 additional days (90 total)                    │
│  ● Document reason for extension                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={dsarSteps} 
        title="Processing a Data Subject Access Request" 
      />

      <FieldReferenceTable 
        fields={dsarFields} 
        title="DSAR Record Schema (feedback_dsar_requests)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="DSAR Processing Issues" 
      />
    </section>
  );
}

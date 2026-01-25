import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { Search, AlertTriangle, ArrowRight, Scale } from 'lucide-react';
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
  'Understand when investigation mode can be invoked',
  'Process investigation requests through the approval workflow',
  'Document investigation outcomes and maintain audit trails',
  'Navigate legal and compliance considerations for identity disclosure'
];

const investigationReasons = [
  {
    reason: 'policy_violation',
    label: 'Policy Violation',
    description: 'Feedback content indicates potential policy breach',
    legalBasis: 'Legitimate interest; workplace safety',
    approval: 'HR Director + Legal'
  },
  {
    reason: 'safety_concern',
    label: 'Safety Concern',
    description: 'Content suggests threat to physical or psychological safety',
    legalBasis: 'Vital interest; duty of care',
    approval: 'HR Director (expedited)'
  },
  {
    reason: 'legal_requirement',
    label: 'Legal Requirement',
    description: 'Court order, regulatory demand, or litigation discovery',
    legalBasis: 'Legal obligation',
    approval: 'Legal Counsel'
  },
  {
    reason: 'ethics_violation',
    label: 'Ethics Violation',
    description: 'Potential fraud, harassment, or misconduct indicated',
    legalBasis: 'Legitimate interest; compliance',
    approval: 'HR Director + Ethics Officer'
  },
  {
    reason: 'pattern_analysis',
    label: 'Pattern Analysis',
    description: 'Repeated concerning patterns requiring investigation',
    legalBasis: 'Legitimate interest',
    approval: 'HR Director'
  }
];

const investigationFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the investigation request',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'cycle_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the feedback cycle',
    validation: 'Must exist in feedback_360_cycles'
  },
  {
    name: 'target_participant_id',
    required: true,
    type: 'UUID',
    description: 'Participant whose feedback is being investigated',
    validation: 'Must exist in feedback_360_participants'
  },
  {
    name: 'investigation_reason',
    required: true,
    type: 'text',
    description: 'Category of investigation reason',
    validation: 'One of: policy_violation, safety_concern, legal_requirement, ethics_violation, pattern_analysis'
  },
  {
    name: 'reason_details',
    required: true,
    type: 'text',
    description: 'Detailed explanation of the investigation need',
    validation: 'Minimum 100 characters'
  },
  {
    name: 'requested_by',
    required: true,
    type: 'UUID',
    description: 'User who initiated the investigation request',
    validation: 'Must have investigation request permission'
  },
  {
    name: 'requested_at',
    required: true,
    type: 'timestamp',
    description: 'When the investigation was requested',
    defaultValue: 'now()',
    validation: 'Auto-set on insert'
  },
  {
    name: 'status',
    required: true,
    type: 'text',
    description: 'Current status of the investigation',
    defaultValue: 'pending',
    validation: 'One of: pending, approved, rejected, in_progress, completed, closed'
  },
  {
    name: 'approved_by',
    required: false,
    type: 'UUID',
    description: 'User who approved the investigation',
    validation: 'HR Director or designated approver'
  },
  {
    name: 'scope_limitations',
    required: false,
    type: 'JSONB',
    description: 'Restrictions on what can be accessed during investigation',
    validation: 'JSON object defining access boundaries'
  },
  {
    name: 'findings_summary',
    required: false,
    type: 'text',
    description: 'Summary of investigation findings',
    validation: 'Required when status = completed'
  },
  {
    name: 'outcome',
    required: false,
    type: 'text',
    description: 'Final outcome/decision from the investigation',
    validation: 'One of: substantiated, unsubstantiated, inconclusive, referred'
  },
  {
    name: 'closed_at',
    required: false,
    type: 'timestamp',
    description: 'When the investigation was closed',
    validation: 'Set when status = closed'
  }
];

const accessLogFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the access log entry',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'investigation_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the investigation request',
    validation: 'Must exist in feedback_investigation_requests'
  },
  {
    name: 'accessed_by',
    required: true,
    type: 'UUID',
    description: 'User who accessed the data',
    validation: 'Must be authorized investigator'
  },
  {
    name: 'accessed_at',
    required: true,
    type: 'timestamp',
    description: 'When the data was accessed',
    defaultValue: 'now()',
    validation: 'Auto-set on access'
  },
  {
    name: 'data_accessed',
    required: true,
    type: 'text',
    description: 'Description of what data was viewed',
    validation: 'Specific record references'
  },
  {
    name: 'rater_identity_revealed',
    required: true,
    type: 'boolean',
    description: 'Whether rater identity was disclosed',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'access_justification',
    required: false,
    type: 'text',
    description: 'Reason for this specific access',
    validation: 'Recommended for audit purposes'
  }
];

const investigationSteps: Step[] = [
  {
    title: 'Identify Investigation Need',
    description: 'Determine that an investigation is warranted based on feedback content.',
    substeps: [
      'Review flagged feedback or reported concern',
      'Assess whether alternative resolution is possible',
      'Confirm investigation meets threshold criteria',
      'Document preliminary assessment'
    ],
    expectedResult: 'Clear justification for investigation established'
  },
  {
    title: 'Submit Investigation Request',
    description: 'Formally request investigation access through the governance system.',
    substeps: [
      'Navigate to Governance → Investigations',
      'Click "Request Investigation Access"',
      'Select target participant and cycle',
      'Choose investigation reason category',
      'Provide detailed reason (minimum 100 characters)',
      'Submit request'
    ],
    expectedResult: 'Investigation request submitted for approval'
  },
  {
    title: 'Obtain Required Approvals',
    description: 'Request routes to appropriate approvers based on reason category.',
    substeps: [
      'HR Director receives notification for review',
      'Legal Counsel notified for legal/ethics matters',
      'Approvers review justification and scope',
      'Approval or rejection recorded with notes'
    ],
    expectedResult: 'Investigation approved with defined scope and limitations'
  },
  {
    title: 'Conduct Investigation',
    description: 'Access disclosed data within approved scope.',
    substeps: [
      'Access investigation panel with approved credentials',
      'View disclosed feedback data (all access logged)',
      'Document relevant findings',
      'Stay within scope_limitations defined in approval'
    ],
    expectedResult: 'Investigation data accessed with full audit trail'
  },
  {
    title: 'Document Outcome',
    description: 'Record investigation findings and final outcome.',
    substeps: [
      'Complete findings_summary field',
      'Select outcome: substantiated, unsubstantiated, inconclusive, or referred',
      'Document any recommended actions',
      'Close investigation'
    ],
    expectedResult: 'Investigation completed with documented outcome'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Investigation requires HR Director approval minimum',
    enforcement: 'System',
    description: 'No investigation can proceed without HR Director sign-off'
  },
  {
    rule: 'Legal matters require Legal Counsel approval',
    enforcement: 'System',
    description: 'Legal requirement and ethics categories need legal review'
  },
  {
    rule: 'All data access during investigation is logged',
    enforcement: 'System',
    description: 'Every view of disclosed data creates an access log entry'
  },
  {
    rule: 'Safety concerns may use expedited approval',
    enforcement: 'Policy',
    description: 'Immediate safety threats can bypass standard timeline with documentation'
  },
  {
    rule: 'Investigation scope cannot be expanded without re-approval',
    enforcement: 'System',
    description: 'Accessing data outside defined scope requires new approval'
  },
  {
    rule: 'Findings must be documented before closure',
    enforcement: 'System',
    description: 'Cannot close investigation without completing findings_summary'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot submit investigation request - insufficient permissions',
    cause: 'User role does not have investigation request capability',
    solution: 'Investigation requests typically limited to HR Business Partners and above. Contact system administrator to verify role permissions.'
  },
  {
    issue: 'Investigation approved but cannot access disclosed data',
    cause: 'Investigation status not yet updated or scope_limitations blocking access',
    solution: 'Verify investigation status is "in_progress" not just "approved". Check scope_limitations to ensure requested data is within approved scope.'
  },
  {
    issue: 'Audit log showing unauthorized access attempts',
    cause: 'Investigator attempting to access data outside approved scope',
    solution: 'Review scope_limitations defined in approval. If broader access needed, submit scope expansion request for additional approval.'
  },
  {
    issue: 'Cannot close investigation - findings summary validation failing',
    cause: 'Summary too short or outcome not selected',
    solution: 'Ensure findings_summary is comprehensive (typically 200+ characters). Select one of the four outcome options before attempting to close.'
  }
];

export function GovernanceInvestigationMode() {
  return (
    <section id="sec-4-8" data-manual-anchor="sec-4-8" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          4.8 Investigation Mode
        </h3>
        <p className="text-muted-foreground mt-2">
          Controlled disclosure procedures, HR Director approval workflows, legal considerations, and comprehensive outcome documentation.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Critical Warning */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Legal Implications</AlertTitle>
        <AlertDescription>
          Investigation disclosures have significant legal implications. Consult with Legal Counsel before initiating 
          investigations involving potential misconduct, safety concerns, or any matter that may result in disciplinary action or litigation.
          All investigation activities create immutable audit records.
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
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Cycles</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">[Cycle]</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Investigations</span>
          </div>
        </CardContent>
      </Card>

      {/* Investigation Reasons Table */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Scale className="h-4 w-4" />
          Investigation Reason Categories
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Reason</TableHead>
                <TableHead className="font-medium">Description</TableHead>
                <TableHead className="font-medium">Legal Basis</TableHead>
                <TableHead className="font-medium">Required Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investigationReasons.map((reason) => (
                <TableRow key={reason.reason}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{reason.reason}</code>
                    <p className="text-xs text-muted-foreground mt-1">{reason.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{reason.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{reason.legalBasis}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{reason.approval}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Investigation Workflow Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Investigation Workflow</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    INVESTIGATION WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────┐    ┌──────────┐    ┌──────────┐    ┌───────────────┐   │
│  │  PENDING  │ ─▶ │ APPROVED │ ─▶ │   IN     │ ─▶ │  COMPLETED    │   │
│  │  (Request)│    │          │    │ PROGRESS │    │  (Findings)   │   │
│  └───────────┘    └──────────┘    └──────────┘    └───────┬───────┘   │
│       │                                                    │            │
│       ▼                                                    ▼            │
│  ┌───────────┐                                      ┌───────────┐      │
│  │ REJECTED  │                                      │  CLOSED   │      │
│  │           │                                      │  (Final)  │      │
│  └───────────┘                                      └───────────┘      │
│                                                                         │
│  OUTCOMES:                                                              │
│  ─────────                                                              │
│  ● Substantiated - Concerns validated; action required                  │
│  ● Unsubstantiated - No evidence found; no action needed               │
│  ● Inconclusive - Insufficient evidence; may require further review    │
│  ● Referred - Escalated to external authority (legal, regulatory)      │
│                                                                         │
│  ACCESS LOGGING:                                                        │
│  ───────────────                                                        │
│  Every data access during in_progress creates immutable audit entry    │
│  with: accessed_by, accessed_at, data_accessed, rater_identity_revealed│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={investigationSteps} 
        title="Investigation Process" 
      />

      <FieldReferenceTable 
        fields={investigationFields} 
        title="Investigation Request Schema (feedback_investigation_requests)" 
      />

      <FieldReferenceTable 
        fields={accessLogFields} 
        title="Access Log Schema (feedback_investigation_access_log)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Investigation Mode Issues" 
      />
    </section>
  );
}

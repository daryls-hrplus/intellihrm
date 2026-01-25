import { LearningObjectives } from '../../components/LearningObjectives';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../components/TroubleshootingSection';
import { ShieldAlert, ArrowRight } from 'lucide-react';
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
  'Submit exception requests for anonymity bypasses, deadline extensions, and rater substitutions',
  'Process exception approvals with appropriate authority levels',
  'Track exception validity periods and expirations',
  'Maintain audit trails for all exception actions'
];

const exceptionTypes = [
  {
    type: 'anonymity_bypass',
    label: 'Anonymity Bypass',
    description: 'Reveal rater identity in specific circumstances',
    approver: 'HR Director + Legal',
    validity: '30 days',
    useCase: 'Investigation or safety concern requiring identification'
  },
  {
    type: 'deadline_extension',
    label: 'Deadline Extension',
    description: 'Extend feedback submission deadline for specific raters',
    approver: 'Cycle Owner / HR',
    validity: 'Until new deadline',
    useCase: 'Rater on leave, technical issues, late addition'
  },
  {
    type: 'rater_substitution',
    label: 'Rater Substitution',
    description: 'Replace assigned rater with alternative',
    approver: 'Cycle Owner',
    validity: 'Cycle duration',
    useCase: 'Rater departed, conflict of interest identified'
  },
  {
    type: 'threshold_override',
    label: 'Threshold Override',
    description: 'Show category breakdown below normal threshold',
    approver: 'HR Director',
    validity: 'Cycle duration',
    useCase: 'Small team where threshold cannot be met'
  },
  {
    type: 'consent_waiver',
    label: 'Consent Waiver',
    description: 'Proceed without optional consent (never for required)',
    approver: 'Legal / DPO',
    validity: 'Cycle duration',
    useCase: 'Legitimate interest override per GDPR Article 6.1.f'
  },
  {
    type: 'retention_extension',
    label: 'Retention Extension',
    description: 'Extend data retention beyond standard period',
    approver: 'Legal / Compliance',
    validity: 'Specified period',
    useCase: 'Litigation hold, regulatory inquiry, audit requirement'
  }
];

const exceptionFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the exception',
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
    name: 'exception_type',
    required: true,
    type: 'text',
    description: 'Type of exception being requested',
    validation: 'One of defined exception types'
  },
  {
    name: 'requested_by',
    required: true,
    type: 'UUID',
    description: 'User who submitted the exception request',
    validation: 'Must exist in profiles'
  },
  {
    name: 'requested_at',
    required: true,
    type: 'timestamp',
    description: 'When the exception was requested',
    defaultValue: 'now()',
    validation: 'Auto-set on insert'
  },
  {
    name: 'justification',
    required: true,
    type: 'text',
    description: 'Business justification for the exception',
    validation: 'Minimum 50 characters'
  },
  {
    name: 'target_employee_id',
    required: false,
    type: 'UUID',
    description: 'Employee affected by the exception (if applicable)',
    validation: 'Must exist in profiles'
  },
  {
    name: 'status',
    required: true,
    type: 'text',
    description: 'Current status of the exception',
    defaultValue: 'pending',
    validation: 'One of: pending, approved, rejected, expired, revoked'
  },
  {
    name: 'approved_by',
    required: false,
    type: 'UUID',
    description: 'User who approved/rejected the exception',
    validation: 'Must have appropriate approval authority'
  },
  {
    name: 'approved_at',
    required: false,
    type: 'timestamp',
    description: 'When the exception was approved/rejected',
    validation: 'Set when status changes from pending'
  },
  {
    name: 'valid_from',
    required: false,
    type: 'timestamp',
    description: 'When the exception becomes effective',
    validation: 'Must be after approved_at'
  },
  {
    name: 'valid_until',
    required: false,
    type: 'timestamp',
    description: 'When the exception expires',
    validation: 'Must be after valid_from'
  },
  {
    name: 'revocation_reason',
    required: false,
    type: 'text',
    description: 'Reason for revoking an approved exception',
    validation: 'Required when status = revoked'
  }
];

const requestSteps: Step[] = [
  {
    title: 'Initiate Exception Request',
    description: 'Start the exception request process from the governance panel.',
    substeps: [
      'Navigate to Performance → 360 Feedback → Governance → Exceptions',
      'Click "Request Exception" button',
      'Select exception type from dropdown'
    ],
    expectedResult: 'Exception request form opens with selected type'
  },
  {
    title: 'Provide Justification',
    description: 'Document the business reason for the exception.',
    substeps: [
      'Enter detailed justification (minimum 50 characters)',
      'Select affected employee if applicable',
      'Attach supporting documentation if required',
      'Review exception implications displayed'
    ],
    expectedResult: 'Request form completed with justification'
  },
  {
    title: 'Submit for Approval',
    description: 'Route the request to the appropriate approver.',
    substeps: [
      'System identifies required approver based on exception type',
      'Click "Submit Request"',
      'Approver receives notification',
      'Request status changes to "Pending"'
    ],
    expectedResult: 'Exception request submitted and pending approval'
  },
  {
    title: 'Track Request Status',
    description: 'Monitor the exception request progress.',
    substeps: [
      'View request status in Exceptions list',
      'Receive notification when decision is made',
      'Review approval/rejection notes if provided'
    ],
    expectedResult: 'Request outcome visible with full audit trail'
  }
];

const approvalSteps: Step[] = [
  {
    title: 'Review Exception Request',
    description: 'Approver evaluates the exception request.',
    substeps: [
      'Access pending exceptions from notification or governance panel',
      'Review justification and supporting documentation',
      'Evaluate compliance and risk implications',
      'Check for conflicting or duplicate requests'
    ],
    expectedResult: 'Approver has full context for decision'
  },
  {
    title: 'Make Approval Decision',
    description: 'Approve or reject the exception request.',
    substeps: [
      'Click "Approve" or "Reject" button',
      'If approving: set validity period (from/until dates)',
      'If rejecting: provide rejection reason',
      'Add any conditions or notes'
    ],
    expectedResult: 'Decision recorded with validity period or rejection reason'
  },
  {
    title: 'Notify Stakeholders',
    description: 'System notifies relevant parties of the decision.',
    substeps: [
      'Requester receives decision notification',
      'Affected employee notified if applicable',
      'Audit log updated with decision details',
      'Exception becomes active if approved'
    ],
    expectedResult: 'All stakeholders informed; exception active if approved'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Exception justification minimum 50 characters',
    enforcement: 'System',
    description: 'Prevents trivial or undocumented exception requests'
  },
  {
    rule: 'Anonymity bypass requires dual approval',
    enforcement: 'System',
    description: 'Both HR Director and Legal must approve before anonymity is lifted'
  },
  {
    rule: 'Expired exceptions cannot be extended',
    enforcement: 'Policy',
    description: 'New exception request required; cannot modify validity after expiration'
  },
  {
    rule: 'Revocation requires documented reason',
    enforcement: 'System',
    description: 'Active exceptions can be revoked early but must document reason'
  },
  {
    rule: 'Exception actions fully audited',
    enforcement: 'System',
    description: 'All request, approval, rejection, and revocation actions logged'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot submit exception request - button disabled',
    cause: 'User lacks permission to request this exception type or cycle is locked',
    solution: 'Check role permissions for exception requests. Verify cycle is in an active state. Contact cycle owner if assistance needed.'
  },
  {
    issue: 'Approved exception not taking effect',
    cause: 'valid_from date is in the future or exception applies to different context',
    solution: 'Check valid_from date on the exception. Verify target_employee_id matches the intended recipient. Review exception scope.'
  },
  {
    issue: 'Exception expired before work completed',
    cause: 'Validity period was too short for the use case',
    solution: 'Submit new exception request with extended validity. Document lessons learned for future requests. Consider standard validity periods by type.'
  },
  {
    issue: 'Conflicting exceptions for same employee',
    cause: 'Multiple overlapping exceptions creating contradictory rules',
    solution: 'Review all active exceptions for the employee. Revoke conflicting exceptions. Establish single authoritative exception.'
  }
];

export function GovernanceExceptionHandling() {
  return (
    <section id="sec-4-7" data-manual-anchor="sec-4-7" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          4.7 Exception Handling & Approvals
        </h3>
        <p className="text-muted-foreground mt-2">
          Managing anonymity bypasses, deadline extensions, rater substitutions, and approval workflows with full audit trails.
        </p>
      </div>

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
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Exceptions</span>
          </div>
        </CardContent>
      </Card>

      {/* Exception Types Table */}
      <div>
        <h4 className="font-medium mb-4">Exception Types</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Exception Type</TableHead>
                <TableHead className="font-medium">Purpose</TableHead>
                <TableHead className="font-medium">Approver</TableHead>
                <TableHead className="font-medium">Validity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exceptionTypes.map((exc) => (
                <TableRow key={exc.type}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{exc.type}</code>
                    <p className="text-xs text-muted-foreground mt-1">{exc.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{exc.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{exc.approver}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{exc.validity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Exception Workflow Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Exception Workflow</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────┐
│                    EXCEPTION WORKFLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────┐     ┌──────────┐     ┌───────────┐                 │
│  │  REQUEST   │ ──▶ │ PENDING  │ ──▶ │  REVIEW   │                 │
│  │  Submitted │     │ Approval │     │ by Approver│                 │
│  └────────────┘     └──────────┘     └─────┬─────┘                 │
│                                            │                        │
│                              ┌─────────────┼─────────────┐          │
│                              ▼             ▼             ▼          │
│                        ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│                        │APPROVED │   │REJECTED │   │ NEEDS   │     │
│                        │         │   │         │   │ INFO    │     │
│                        └────┬────┘   └─────────┘   └────┬────┘     │
│                             │                           │           │
│                             ▼                           ▼           │
│                       ┌─────────┐              ┌─────────────┐      │
│                       │ ACTIVE  │              │Return to    │      │
│                       │ (Valid) │              │ Requester   │      │
│                       └────┬────┘              └─────────────┘      │
│                            │                                        │
│              ┌─────────────┼─────────────┐                         │
│              ▼             ▼             ▼                         │
│        ┌─────────┐   ┌─────────┐   ┌─────────┐                     │
│        │ EXPIRED │   │ REVOKED │   │COMPLETED│                     │
│        │(Auto)   │   │(Manual) │   │(Used)   │                     │
│        └─────────┘   └─────────┘   └─────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={requestSteps} 
        title="Submitting an Exception Request" 
      />

      <StepByStep 
        steps={approvalSteps} 
        title="Processing Exception Approvals" 
      />

      <FieldReferenceTable 
        fields={exceptionFields} 
        title="Exception Record Schema (feedback_exceptions)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="Exception Handling Issues" 
      />
    </section>
  );
}

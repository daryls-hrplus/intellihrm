import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Search, Shield, Lock, AlertTriangle } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand when and why investigation mode may be needed',
  'Navigate the investigation request and approval workflow',
  'Manage controlled disclosure of anonymous feedback',
  'Document investigation outcomes appropriately',
  'Maintain compliance and audit trail requirements'
];

const INVESTIGATION_DIAGRAM = `
flowchart TD
    subgraph Trigger["Investigation Trigger"]
        A[Concerning Feedback Identified] --> B{Who Requests?}
        B -->|Manager| C[Manager Requests]
        B -->|HR Partner| D[HR Partner Requests]
        B -->|Employee| E[Employee Self-Request]
    end
    
    subgraph Request["Request Processing"]
        C --> F[Submit Investigation Request]
        D --> F
        E --> F
        F --> G[Enter Justification]
        G --> H[Specify Scope]
        H --> I[Route to HR Director]
    end
    
    subgraph Approval["Approval Workflow"]
        I --> J[HR Director Reviews]
        J --> K{Decision}
        K -->|Approve| L[Access Granted]
        K -->|Reject| M[Request Denied]
        K -->|Request More Info| N[Return for Clarification]
        N --> G
    end
    
    subgraph Investigation["Investigation Execution"]
        L --> O[View Rater Identity]
        O --> P[Conduct Investigation]
        P --> Q[Document Findings]
        Q --> R[Record Outcome]
    end
    
    subgraph Audit["Audit & Compliance"]
        R --> S[Update Audit Log]
        S --> T[Notify Affected Parties]
        T --> U[Case Closed]
    end
    
    style A fill:#f59e0b,stroke:#d97706
    style L fill:#ef4444,stroke:#dc2626,color:#fff
    style U fill:#10b981,stroke:#059669,color:#fff
`;

const INVESTIGATION_REASONS = [
  { reason: 'Policy Violation', description: 'Feedback contains content violating company policies', examples: 'Harassment, discrimination, threats' },
  { reason: 'Safety Concern', description: 'Content suggests safety risk to individuals', examples: 'Self-harm references, violence threats' },
  { reason: 'Legal Requirement', description: 'Disclosure required by law or legal process', examples: 'Court order, regulatory investigation' },
  { reason: 'Ethics Violation', description: 'Serious ethical concerns reported in feedback', examples: 'Fraud, theft, corruption allegations' },
  { reason: 'Pattern Analysis', description: 'Multiple concerning inputs from same source', examples: 'Coordinated negative feedback, abuse of system' }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'uuid',
    description: 'Unique identifier for investigation request',
    defaultValue: 'gen_random_uuid()',
    validation: '—'
  },
  {
    name: 'cycle_id',
    required: true,
    type: 'uuid',
    description: 'Reference to the feedback cycle',
    defaultValue: '—',
    validation: 'Must reference valid cycle'
  },
  {
    name: 'participant_id',
    required: true,
    type: 'uuid',
    description: 'Employee whose feedback is being investigated',
    defaultValue: '—',
    validation: 'Must be cycle participant'
  },
  {
    name: 'requested_by',
    required: true,
    type: 'uuid',
    description: 'User who submitted the investigation request',
    defaultValue: 'Current user',
    validation: 'References profiles.id'
  },
  {
    name: 'request_reason',
    required: true,
    type: 'enum',
    description: 'Category of investigation reason',
    defaultValue: '—',
    validation: 'policy_violation | safety_concern | legal | ethics | pattern_analysis'
  },
  {
    name: 'justification',
    required: true,
    type: 'text',
    description: 'Detailed explanation of why disclosure is needed',
    defaultValue: '—',
    validation: 'Minimum 100 characters'
  },
  {
    name: 'scope',
    required: true,
    type: 'jsonb',
    description: 'What specific information is being requested',
    defaultValue: '—',
    validation: 'Specific responses, rater identity, etc.'
  },
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current state of the request',
    defaultValue: 'pending',
    validation: 'pending | approved | rejected | completed | cancelled'
  },
  {
    name: 'approved_by',
    required: false,
    type: 'uuid',
    description: 'HR Director who approved the request',
    defaultValue: '—',
    validation: 'References profiles.id'
  },
  {
    name: 'approved_at',
    required: false,
    type: 'timestamp',
    description: 'When approval was granted',
    defaultValue: '—',
    validation: 'Set on approval'
  },
  {
    name: 'outcome',
    required: false,
    type: 'text',
    description: 'Documented findings and actions taken',
    defaultValue: '—',
    validation: 'Required to close investigation'
  },
  {
    name: 'closed_at',
    required: false,
    type: 'timestamp',
    description: 'When investigation was closed',
    defaultValue: '—',
    validation: 'Set when outcome recorded'
  }
];

const STEPS: Step[] = [
  {
    title: 'Identify Need for Investigation',
    description: 'Determine if disclosure of anonymous feedback is justified.',
    substeps: [
      'Review the concerning feedback content',
      'Assess severity and potential impact',
      'Determine if issue can be addressed without disclosure',
      'Consult with HR/Legal if unclear',
      'Document initial assessment'
    ],
    expectedResult: 'Clear determination that investigation is necessary and justified'
  },
  {
    title: 'Submit Investigation Request',
    description: 'Formal request for access to rater identity.',
    substeps: [
      'Navigate to cycle → "Investigations" tab',
      'Click "New Investigation Request"',
      'Select the participant and specific feedback',
      'Choose request reason category',
      'Provide detailed justification (required)',
      'Specify exactly what access is needed',
      'Submit request for approval'
    ],
    expectedResult: 'Request submitted and routed to HR Director'
  },
  {
    title: 'HR Director Approval',
    description: 'Senior HR review and decision on disclosure.',
    substeps: [
      'HR Director receives notification',
      'Reviews request justification and scope',
      'Considers privacy vs safety/compliance balance',
      'May request additional information',
      'Approves with any limitations, or rejects with reason'
    ],
    expectedResult: 'Approval or rejection with documented rationale'
  },
  {
    title: 'Conduct Investigation',
    description: 'Access disclosed information and investigate.',
    substeps: [
      'Access approved information (rater identity revealed)',
      'Conduct appropriate investigation activities',
      'Gather additional evidence if needed',
      'Consult with Legal/ER as appropriate',
      'Document all investigation steps'
    ],
    expectedResult: 'Investigation completed with findings documented'
  },
  {
    title: 'Record Outcome and Close',
    description: 'Document findings and close the investigation.',
    substeps: [
      'Record investigation outcome in system',
      'Document actions taken or planned',
      'Determine if rater/participant should be notified',
      'Close investigation case',
      'Ensure audit trail is complete'
    ],
    expectedResult: 'Investigation properly closed with full documentation'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Investigation request rejected without clear reason',
    cause: 'Justification may not have met threshold for disclosure',
    solution: 'Review rejection feedback. Consider whether alternative approaches exist. Resubmit with stronger justification if warranted.'
  },
  {
    issue: 'Cannot find specific feedback to investigate',
    cause: 'Feedback may be from different cycle, or already investigated',
    solution: 'Verify correct cycle selected. Check investigation history for prior requests on same feedback.'
  },
  {
    issue: 'Rater identity disclosed but cannot contact rater',
    cause: 'Rater may have left company or contact info outdated',
    solution: 'Work with HR to locate current contact info. Document inability to contact in investigation record.'
  },
  {
    issue: 'Employee complains their feedback was disclosed',
    cause: 'Notification or lack thereof may have created issues',
    solution: 'Review whether disclosure notification was appropriate. Consult Legal on obligations. Document communication.'
  }
];

export function WorkflowInvestigationMode() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.12</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
          <Badge variant="secondary">HR Director</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Investigation Mode
        </CardTitle>
        <CardDescription>
          Controlled disclosure of anonymous feedback for legitimate investigations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Investigations']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WarningCallout title="Sensitive Process">
          Investigation mode breaks the anonymity promise. Use only when there is a legitimate,
          documented need. Inappropriate use erodes trust in the 360 feedback program.
        </WarningCallout>

        <WorkflowDiagram
          title="Investigation Request & Approval Flow"
          description="Complete process from identifying need through investigation closure"
          diagram={INVESTIGATION_DIAGRAM}
        />

        {/* Investigation Reasons */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Valid Investigation Reasons
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Reason Category</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Examples</th>
                </tr>
              </thead>
              <tbody>
                {INVESTIGATION_REASONS.map((reason, index) => (
                  <tr key={reason.reason} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{reason.reason}</td>
                    <td className="p-3 text-muted-foreground">{reason.description}</td>
                    <td className="p-3 text-sm">{reason.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Minimize Scope">
          Request only the minimum information needed. If you only need to identify one specific
          response, don't request disclosure of all raters for the participant.
        </TipCallout>

        <StepByStep steps={STEPS} title="Investigation Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Investigation Request Fields" 
        />

        <WarningCallout title="Legal Considerations">
          Investigation disclosures may have legal implications. Consult with Legal before proceeding,
          especially for safety concerns, legal requirements, or potential litigation matters.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

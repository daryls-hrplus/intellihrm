import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Users, UserCheck, Clock, AlertTriangle } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Configure and manage peer nomination workflows for 360 feedback',
  'Process manager approval queues efficiently',
  'Handle nomination conflicts and edge cases',
  'Monitor nomination progress and deadline compliance',
  'Troubleshoot common nomination issues'
];

const NOMINATION_DIAGRAM = `
flowchart TD
    subgraph Employee["Employee Self-Nomination"]
        A[Cycle Active] --> B[Employee Opens Nomination]
        B --> C[Search & Select Peers]
        C --> D{Min/Max Check}
        D -->|Below Min| E[Must Add More]
        E --> C
        D -->|At Max| F[Cannot Add More]
        D -->|Within Range| G[Submit Nominations]
    end
    
    subgraph Manager["Manager Approval"]
        G --> H[Manager Queue]
        H --> I[Review Nomination]
        I --> J{Decision}
        J -->|Approve| K[Create Feedback Request]
        J -->|Reject| L[Notify Employee]
        L --> M{Deadline Passed?}
        M -->|No| N[Employee Resubmits]
        N --> I
        M -->|Yes| O[Final Rejection]
    end
    
    subgraph HR["HR Override"]
        I --> P[HR Can Override]
        P --> K
    end
    
    subgraph System["System Processing"]
        K --> Q[Rater Notified]
        Q --> R[Ready for Feedback]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style R fill:#10b981,stroke:#059669,color:#fff
    style L fill:#f59e0b,stroke:#d97706
`;

const NOMINATION_STATUSES = [
  { status: 'draft', description: 'Employee has started but not submitted nominations', color: 'secondary' },
  { status: 'pending', description: 'Awaiting manager approval', color: 'default' },
  { status: 'approved', description: 'Manager approved - feedback request created', color: 'default' },
  { status: 'rejected', description: 'Manager rejected - employee can resubmit if before deadline', color: 'destructive' },
  { status: 'expired', description: 'Nomination window closed without completion', color: 'outline' }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'uuid',
    description: 'Unique identifier for the nomination',
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
    name: 'nominator_id',
    required: true,
    type: 'uuid',
    description: 'Employee who is nominating peers (the feedback recipient)',
    defaultValue: '—',
    validation: 'Must be cycle participant'
  },
  {
    name: 'nominee_id',
    required: true,
    type: 'uuid',
    description: 'The peer being nominated to provide feedback',
    defaultValue: '—',
    validation: 'Must be active employee, cannot be self'
  },
  {
    name: 'relationship_type',
    required: true,
    type: 'enum',
    description: 'Type of working relationship',
    defaultValue: 'peer',
    validation: 'peer | cross_functional | project_team | other'
  },
  {
    name: 'justification',
    required: false,
    type: 'text',
    description: 'Reason for nominating this peer',
    defaultValue: '—',
    validation: 'Max 500 characters'
  },
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current nomination status',
    defaultValue: 'pending',
    validation: 'draft | pending | approved | rejected | expired'
  },
  {
    name: 'manager_decision_at',
    required: false,
    type: 'timestamp',
    description: 'When manager made approval decision',
    defaultValue: '—',
    validation: 'Set on approve/reject'
  },
  {
    name: 'manager_decision_by',
    required: false,
    type: 'uuid',
    description: 'Manager who made the decision',
    defaultValue: '—',
    validation: 'References profiles.id'
  },
  {
    name: 'rejection_reason',
    required: false,
    type: 'text',
    description: 'Why nomination was rejected',
    defaultValue: '—',
    validation: 'Required if status is rejected'
  },
  {
    name: 'nomination_deadline',
    required: true,
    type: 'timestamp',
    description: 'Deadline for this nomination to be completed',
    defaultValue: 'From cycle settings',
    validation: 'Inherited from cycle.nomination_window_end'
  }
];

const EMPLOYEE_STEPS: Step[] = [
  {
    title: 'Access Nomination Interface',
    description: 'Employee opens their 360 feedback nomination page.',
    substeps: [
      'Employee receives notification that cycle is active',
      'Navigate to My Performance → 360 Feedback → Current Cycle',
      'Click "Nominate Peers" button',
      'View any previously saved draft nominations'
    ],
    expectedResult: 'Nomination interface opens with peer search and current selections'
  },
  {
    title: 'Search and Select Peers',
    description: 'Employee identifies colleagues to provide feedback.',
    substeps: [
      'Use search box to find colleagues by name or department',
      'System filters out ineligible nominees (self, already selected)',
      'Click "Add" to include peer in nomination list',
      'Select relationship type for each nominee',
      'Optionally add justification for nomination'
    ],
    expectedResult: 'Peers added to nomination list with relationship context'
  },
  {
    title: 'Validate and Submit',
    description: 'Employee reviews and submits nominations for approval.',
    substeps: [
      'Verify minimum peer count is met (typically 3)',
      'Verify maximum is not exceeded (typically 5)',
      'Review all nominees and relationships',
      'Click "Submit for Approval"',
      'Nominations sent to manager queue'
    ],
    expectedResult: 'Nominations submitted, status changes to Pending'
  }
];

const MANAGER_STEPS: Step[] = [
  {
    title: 'Access Approval Queue',
    description: 'Manager reviews pending peer nominations.',
    substeps: [
      'Navigate to My Team → 360 Feedback → Nomination Approvals',
      'View list of pending nominations by team member',
      'See nominee name, relationship type, and any justification',
      'Note deadline for approval'
    ],
    expectedResult: 'Approval queue displays pending nominations with context'
  },
  {
    title: 'Review Individual Nominations',
    description: 'Evaluate each nomination for appropriateness.',
    substeps: [
      'Consider working relationship strength',
      'Check for potential conflicts of interest',
      'Verify nominee has sufficient exposure to provide feedback',
      'Review any justification provided by employee'
    ],
    expectedResult: 'Understanding of whether each nomination is appropriate'
  },
  {
    title: 'Approve or Reject',
    description: 'Make decision on each nomination.',
    substeps: [
      'Click "Approve" for valid nominations',
      'Click "Reject" for inappropriate nominations',
      'If rejecting, provide constructive reason',
      'Process all nominations before deadline',
      'Approved nominations automatically create feedback requests'
    ],
    expectedResult: 'All nominations processed, requests created for approved peers'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Employee cannot find colleague in peer search',
    cause: 'Colleague may be in different company, inactive, or already at max nomination limit',
    solution: 'Verify colleague is active employee in same company. Check if they are already nominated by another participant.'
  },
  {
    issue: 'Manager approval queue is empty but employees submitted nominations',
    cause: 'Manager may not be the correct reporting manager for those employees',
    solution: 'Verify manager-employee relationships in Workforce data. Check if skip-level approval is required.'
  },
  {
    issue: 'Nomination deadline passed but employee did not complete',
    cause: 'Employee may not have been aware of deadline or was unable to identify peers',
    solution: 'HR can manually assign peers if cycle settings allow, or employee proceeds without peer feedback.'
  },
  {
    issue: 'Rejected nomination not appearing for employee to resubmit',
    cause: 'Nomination deadline may have passed, preventing resubmission',
    solution: 'If within deadline, check notification delivery. If past deadline, HR can extend or manually assign.'
  }
];

export function WorkflowPeerNomination() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.4</Badge>
          <Badge variant="secondary">~14 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
          <Badge variant="secondary">Manager</Badge>
          <Badge variant="secondary">Employee</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Peer Nomination Workflows
        </CardTitle>
        <CardDescription>
          Self-nomination, manager approval, and HR validation processes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Current Cycle', 'Nominate Peers']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Peer Nomination & Approval Workflow"
          description="Complete flow from employee nomination through manager approval to feedback request creation"
          diagram={NOMINATION_DIAGRAM}
        />

        {/* Nomination Statuses */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Nomination Status Definitions
          </h4>
          <div className="flex flex-wrap gap-2">
            {NOMINATION_STATUSES.map((item) => (
              <div key={item.status} className="flex items-center gap-2 border rounded-lg p-3">
                <Badge variant={item.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
                  {item.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Relationship Context">
          Encourage employees to provide brief justifications for each nomination. This helps managers
          understand the working relationship and makes approval decisions faster and more informed.
        </TipCallout>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <UserCheck className="h-4 w-4" />
              Employee Nomination Process
            </h4>
            <StepByStep steps={EMPLOYEE_STEPS} title="" />
          </div>

          <div>
            <h4 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <UserCheck className="h-4 w-4" />
              Manager Approval Process
            </h4>
            <StepByStep steps={MANAGER_STEPS} title="" />
          </div>
        </div>

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Database Fields (peer_nominations table)" 
        />

        <WarningCallout title="Deadline Enforcement">
          Nominations not approved by the deadline cannot be processed. Ensure managers are aware of
          approval deadlines and have reminders configured appropriately.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

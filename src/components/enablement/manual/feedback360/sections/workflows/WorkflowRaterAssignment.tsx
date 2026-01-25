import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Link, UserMinus, CheckCircle, XCircle } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand how feedback requests are created from nominations and assignments',
  'Manage mandatory vs optional rater assignments',
  'Handle rater declines and reassignments',
  'Monitor request status and identify coverage gaps',
  'Configure rater-type-specific question sets'
];

const ASSIGNMENT_DIAGRAM = `
flowchart TD
    subgraph Sources["Request Sources"]
        A[Approved Peer Nomination] --> D[Create Request]
        B[Auto-Assigned Manager] --> D
        C[Auto-Assigned Direct Reports] --> D
        E[HR Manual Assignment] --> D
    end
    
    subgraph Request["Request Processing"]
        D --> F[Request Created]
        F --> G[Rater Notified]
        G --> H{Rater Response}
        H -->|Accept/Start| I[Started]
        H -->|Decline| J[Declined]
        H -->|No Response| K[Pending]
    end
    
    subgraph Decline["Decline Handling"]
        J --> L{Is Mandatory?}
        L -->|Yes| M[HR Reassign Required]
        L -->|No| N[Gap Documented]
        M --> D
    end
    
    subgraph Completion["Completion"]
        I --> O[In Progress]
        O --> P[Submitted]
        P --> Q[Included in Results]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style Q fill:#10b981,stroke:#059669,color:#fff
    style J fill:#f59e0b,stroke:#d97706
`;

const RATER_TYPES = [
  { type: 'Self', source: 'Auto-assigned', mandatory: 'Configurable', description: 'Participant self-assessment' },
  { type: 'Manager', source: 'Auto-assigned from org chart', mandatory: 'Typically Yes', description: 'Direct manager feedback' },
  { type: 'Direct Reports', source: 'Auto-assigned from org chart', mandatory: 'Configurable', description: 'Upward feedback from team members' },
  { type: 'Peers', source: 'From approved nominations', mandatory: 'No', description: 'Lateral feedback from colleagues' },
  { type: 'Skip-Level', source: 'HR assignment', mandatory: 'Optional', description: 'Manager\'s manager feedback' },
  { type: 'External', source: 'HR invitation', mandatory: 'No', description: 'Customer/vendor feedback' }
];

const REQUEST_STATUSES = [
  { status: 'pending', description: 'Request created, awaiting rater action', color: 'secondary' },
  { status: 'started', description: 'Rater has opened feedback form', color: 'default' },
  { status: 'in_progress', description: 'Rater has saved partial response', color: 'default' },
  { status: 'submitted', description: 'Feedback completed and submitted', color: 'default' },
  { status: 'declined', description: 'Rater declined to provide feedback', color: 'destructive' },
  { status: 'expired', description: 'Deadline passed without submission', color: 'outline' }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'uuid',
    description: 'Unique identifier for the feedback request',
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
    description: 'Employee receiving feedback (from review_participants)',
    defaultValue: '—',
    validation: 'Must be cycle participant'
  },
  {
    name: 'rater_id',
    required: true,
    type: 'uuid',
    description: 'Person providing feedback',
    defaultValue: '—',
    validation: 'Must be active employee or have external_email'
  },
  {
    name: 'rater_type',
    required: true,
    type: 'enum',
    description: 'Category of rater relationship',
    defaultValue: '—',
    validation: 'self | manager | direct_report | peer | skip_level | external'
  },
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current request status',
    defaultValue: 'pending',
    validation: 'pending | started | in_progress | submitted | declined | expired'
  },
  {
    name: 'is_mandatory',
    required: true,
    type: 'boolean',
    description: 'Whether this rater is required for results',
    defaultValue: 'Varies by type',
    validation: '—'
  },
  {
    name: 'due_date',
    required: true,
    type: 'date',
    description: 'Deadline for this specific request',
    defaultValue: 'cycle.end_date',
    validation: 'Must be within cycle window'
  },
  {
    name: 'started_at',
    required: false,
    type: 'timestamp',
    description: 'When rater first opened the form',
    defaultValue: '—',
    validation: 'Set on first access'
  },
  {
    name: 'submitted_at',
    required: false,
    type: 'timestamp',
    description: 'When feedback was submitted',
    defaultValue: '—',
    validation: 'Set on submission'
  },
  {
    name: 'declined_at',
    required: false,
    type: 'timestamp',
    description: 'When rater declined the request',
    defaultValue: '—',
    validation: 'Set on decline'
  },
  {
    name: 'decline_reason',
    required: false,
    type: 'text',
    description: 'Reason provided for declining',
    defaultValue: '—',
    validation: 'Max 500 characters'
  },
  {
    name: 'last_reminder_sent_at',
    required: false,
    type: 'timestamp',
    description: 'When last reminder was sent',
    defaultValue: '—',
    validation: '—'
  },
  {
    name: 'reminder_count',
    required: true,
    type: 'integer',
    description: 'Number of reminders sent',
    defaultValue: '0',
    validation: 'Incremented on each reminder'
  }
];

const STEPS: Step[] = [
  {
    title: 'Understand Request Sources',
    description: 'Requests are created from multiple sources automatically and manually.',
    substeps: [
      'Self: Auto-created when participant enrolled (if self-assessment enabled)',
      'Manager: Auto-created from org chart reporting relationship',
      'Direct Reports: Auto-created for all employees reporting to participant',
      'Peers: Created when manager approves peer nomination',
      'External: Created when HR sends external rater invitation'
    ],
    expectedResult: 'Understanding of how each rater type gets assigned'
  },
  {
    title: 'Monitor Request Coverage',
    description: 'Review rater assignments for all participants.',
    substeps: [
      'Navigate to cycle details → "Rater Assignments" tab',
      'Filter by participant to see their rater coverage',
      'Check for participants with missing mandatory raters',
      'Identify participants below minimum peer threshold',
      'Review overall completion statistics by rater type'
    ],
    expectedResult: 'Clear view of coverage gaps and completion status'
  },
  {
    title: 'Handle Declined Requests',
    description: 'Process rater declines and determine next steps.',
    substeps: [
      'View declined requests in the "Declined" filter',
      'Review decline reason provided by rater',
      'For mandatory raters: Identify replacement and reassign',
      'For optional raters: Document gap, no action required',
      'Send reassignment notification to new rater'
    ],
    expectedResult: 'All mandatory rater gaps addressed, optional gaps documented'
  },
  {
    title: 'Create Manual Assignments',
    description: 'Add raters that were not captured through automated processes.',
    substeps: [
      'Select participant from the list',
      'Click "Add Rater" button',
      'Search for employee or enter external email',
      'Select rater type and set mandatory flag',
      'Optionally customize due date',
      'Confirm - notification sent to rater'
    ],
    expectedResult: 'New request created and rater notified'
  },
  {
    title: 'Configure Question Assignment',
    description: 'Verify rater-type-specific questions are assigned.',
    substeps: [
      'Navigate to cycle settings → "Questions" tab',
      'Review question assignment by rater type',
      'Some questions may only be for manager (e.g., promotability)',
      'Some questions may exclude self (e.g., objective rating)',
      'Verify all rater types have appropriate question coverage'
    ],
    expectedResult: 'Each rater type sees relevant questions only'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Manager request not auto-created',
    cause: 'Participant may not have manager assigned in org chart, or manager is inactive',
    solution: 'Verify manager relationship in Workforce → Employees. Update org chart if needed, then manually create request.'
  },
  {
    issue: 'Direct reports showing as zero despite participant having team',
    cause: 'Team members may be excluded by eligibility rules or in different cycle',
    solution: 'Check eligibility settings. Team members must be active employees but not necessarily cycle participants.'
  },
  {
    issue: 'Rater cannot access feedback form',
    cause: 'Request status may be expired, or rater lacks system access',
    solution: 'Check request status. If expired, HR can extend deadline. Verify rater has active system account.'
  },
  {
    issue: 'Duplicate requests for same rater-participant pair',
    cause: 'May occur if peer nomination and manual assignment both create requests',
    solution: 'System should prevent duplicates. If found, mark one as invalid and use the active request.'
  }
];

export function WorkflowRaterAssignment() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.5</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5 text-primary" />
          Rater Assignment & Requests
        </CardTitle>
        <CardDescription>
          Creating feedback requests, managing mandatory vs optional raters, and handling declines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Rater Assignments']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Rater Assignment & Request Lifecycle"
          description="From request creation through completion or decline handling"
          diagram={ASSIGNMENT_DIAGRAM}
        />

        {/* Rater Types */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Rater Types & Sources</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Type</th>
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Mandatory</th>
                  <th className="text-left p-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {RATER_TYPES.map((rater, index) => (
                  <tr key={rater.type} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{rater.type}</td>
                    <td className="p-3 text-muted-foreground">{rater.source}</td>
                    <td className="p-3">{rater.mandatory}</td>
                    <td className="p-3 text-muted-foreground">{rater.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Statuses */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Request Status Definitions</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {REQUEST_STATUSES.map((item) => (
              <div key={item.status} className="flex items-center gap-2 border rounded-lg p-3">
                <Badge variant={item.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
                  {item.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Decline Threshold Monitoring">
          Monitor decline rates by rater type. High decline rates for peers may indicate survey fatigue
          or unclear expectations. Consider reducing requests per rater or improving communication.
        </TipCallout>

        <StepByStep steps={STEPS} title="Operational Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Database Fields (feedback_360_requests table)" 
        />

        <WarningCallout title="Mandatory Rater Coverage">
          If a mandatory rater (typically manager) declines, results may be incomplete. Always have a
          reassignment plan in place, such as skip-level manager or HR Partner assignment.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

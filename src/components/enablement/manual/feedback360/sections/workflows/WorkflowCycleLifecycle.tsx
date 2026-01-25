import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { RotateCcw, Clock, User, Settings } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand the complete 360 feedback cycle lifecycle from draft to closure',
  'Identify triggers that advance cycles between status states',
  'Configure appropriate permissions for each lifecycle stage',
  'Handle rollback scenarios and deadline extensions appropriately',
  'Monitor cycle health through status-based dashboards'
];

const LIFECYCLE_DIAGRAM = `
flowchart TD
    subgraph Creation["Cycle Creation"]
        A[Draft] -->|"HR launches cycle"| B[Active]
    end
    
    subgraph Collection["Feedback Collection"]
        B -->|"First response submitted"| C[In Progress]
        C -->|"Collecting feedback"| C
    end
    
    subgraph Processing["Results Processing"]
        C -->|"Deadline reached OR all complete"| D[Completed]
        D -->|"Results processed"| E[Ready for Release]
    end
    
    subgraph Closure["Cycle Closure"]
        E -->|"Results released"| F[Released]
        F -->|"HR closes cycle"| G[Closed]
    end
    
    subgraph Exceptions["Exception Handling"]
        B -->|"Same-day cancel"| H[Cancelled]
        C -->|"Extension granted"| C
        D -->|"Reopen for late submissions"| C
    end
    
    style A fill:#f1f5f9,stroke:#64748b
    style B fill:#dbeafe,stroke:#3b82f6
    style C fill:#fef3c7,stroke:#f59e0b
    style D fill:#d1fae5,stroke:#10b981
    style E fill:#e0e7ff,stroke:#6366f1
    style F fill:#cffafe,stroke:#06b6d4
    style G fill:#e2e8f0,stroke:#475569
    style H fill:#fee2e2,stroke:#ef4444
`;

const STATUS_DEFINITIONS = [
  {
    status: 'Draft',
    description: 'Cycle is being configured. Participants and settings can be modified freely.',
    permissions: 'HR Admin, HR Partner',
    allowedActions: 'Edit settings, add/remove participants, configure questions, launch',
    color: 'secondary'
  },
  {
    status: 'Active',
    description: 'Cycle is launched. Nominations are open (if enabled). Awaiting first response.',
    permissions: 'HR Admin, HR Partner',
    allowedActions: 'Monitor nominations, send reminders, extend deadlines',
    color: 'default'
  },
  {
    status: 'In Progress',
    description: 'Feedback collection is underway. At least one response has been submitted.',
    permissions: 'HR Admin, HR Partner',
    allowedActions: 'Monitor completion, send reminders, manage external raters',
    color: 'default'
  },
  {
    status: 'Completed',
    description: 'Feedback window has closed. Responses are locked for processing.',
    permissions: 'HR Admin',
    allowedActions: 'Process results, review aggregated data, generate reports',
    color: 'default'
  },
  {
    status: 'Ready for Release',
    description: 'Results have been processed and are awaiting approval for release.',
    permissions: 'HR Admin, HR Director',
    allowedActions: 'Preview reports, approve release, configure visibility',
    color: 'default'
  },
  {
    status: 'Released',
    description: 'Results have been shared with participants per visibility rules.',
    permissions: 'HR Admin, HR Director',
    allowedActions: 'Monitor report access, handle investigations, close cycle',
    color: 'default'
  },
  {
    status: 'Closed',
    description: 'Cycle is archived. No further actions allowed. Data retained per policy.',
    permissions: 'Read-only for authorized users',
    allowedActions: 'View historical data, run trend analysis',
    color: 'outline'
  },
  {
    status: 'Cancelled',
    description: 'Cycle was terminated before completion. All data discarded.',
    permissions: 'HR Admin only',
    allowedActions: 'None - terminal state',
    color: 'destructive'
  }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current lifecycle state of the cycle',
    defaultValue: 'draft',
    validation: 'Valid transitions only (see diagram)'
  },
  {
    name: 'activated_at',
    required: false,
    type: 'timestamp',
    description: 'When the cycle was launched (Draft → Active)',
    defaultValue: 'null',
    validation: 'Set automatically on launch'
  },
  {
    name: 'activated_by',
    required: false,
    type: 'uuid',
    description: 'User who launched the cycle',
    defaultValue: 'null',
    validation: 'References profiles.id'
  },
  {
    name: 'completed_at',
    required: false,
    type: 'timestamp',
    description: 'When all feedback collection ended',
    defaultValue: 'null',
    validation: 'Set when status → Completed'
  },
  {
    name: 'results_released_at',
    required: false,
    type: 'timestamp',
    description: 'When results were made available to participants',
    defaultValue: 'null',
    validation: 'Set on release action'
  },
  {
    name: 'results_released_by',
    required: false,
    type: 'uuid',
    description: 'User who released the results',
    defaultValue: 'null',
    validation: 'References profiles.id'
  },
  {
    name: 'is_locked',
    required: true,
    type: 'boolean',
    description: 'Whether cycle configuration is frozen',
    defaultValue: 'false',
    validation: 'true when status is not Draft'
  },
  {
    name: 'closed_at',
    required: false,
    type: 'timestamp',
    description: 'When the cycle was archived',
    defaultValue: 'null',
    validation: 'Set when status → Closed'
  }
];

const STEPS: Step[] = [
  {
    title: 'Understand Status Triggers',
    description: 'Each status transition is triggered by specific actions or system events.',
    substeps: [
      'Draft → Active: HR Admin clicks "Launch Cycle" button',
      'Active → In Progress: System detects first response submission',
      'In Progress → Completed: End date reached OR all mandatory responses submitted',
      'Completed → Ready for Release: Results processing job completes',
      'Ready for Release → Released: HR approves and triggers release',
      'Released → Closed: HR Admin clicks "Close Cycle" after retention period'
    ],
    expectedResult: 'Cycle progresses automatically with manual intervention only at key decision points'
  },
  {
    title: 'Monitor Cycle Health',
    description: 'Use the dashboard to track cycle status and identify issues early.',
    substeps: [
      'Navigate to Performance → 360 Feedback → Cycles',
      'Filter by Active or In Progress status',
      'Review completion percentage and days remaining',
      'Identify participants with pending responses',
      'Check for nomination approval backlogs'
    ],
    expectedResult: 'Dashboard shows real-time cycle health with actionable alerts'
  },
  {
    title: 'Handle Deadline Extensions',
    description: 'Extend feedback windows when business needs require flexibility.',
    substeps: [
      'Open the cycle details page',
      'Click "Extend Deadline" in the actions menu',
      'Set new end date (must be future)',
      'Optionally add reason for extension',
      'Confirm - participants are notified automatically'
    ],
    expectedResult: 'End date updated, cycle remains In Progress, reminder schedule adjusted'
  },
  {
    title: 'Process Rollback Requests',
    description: 'Handle requests to revert status or reopen feedback collection.',
    substeps: [
      'Review rollback request justification',
      'Check data integrity implications',
      'For Completed → In Progress: Click "Reopen for Late Submissions"',
      'Set new deadline for late submissions',
      'Document reason in audit trail'
    ],
    expectedResult: 'Cycle status reverted with full audit trail of the change'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Cycle stuck in Active status with no submissions',
    cause: 'Rater assignments may not have been created, or notification delivery failed',
    solution: 'Check feedback_360_requests table for pending requests. Verify notification logs. Resend invitations if needed.'
  },
  {
    issue: 'Cannot extend deadline after cycle completed',
    cause: 'Status has progressed beyond In Progress',
    solution: 'Use "Reopen for Late Submissions" to revert to In Progress first, then extend deadline.'
  },
  {
    issue: 'Results not appearing after deadline',
    cause: 'Results processing job may have failed or is still running',
    solution: 'Check signal_processing_status field. If "pending", wait for job completion. If "failed", contact support.'
  },
  {
    issue: 'Cycle accidentally launched with incomplete configuration',
    cause: 'Launch action was taken before all settings were verified',
    solution: 'If within same day and no responses submitted, cycle can be cancelled. Otherwise, proceed and communicate adjustments.'
  }
];

export function WorkflowCycleLifecycle() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.1</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-primary" />
          Cycle Lifecycle Management
        </CardTitle>
        <CardDescription>
          Understanding status progression, triggers, and exception handling for 360 feedback cycles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', 'Manage']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="360 Feedback Cycle Lifecycle"
          description="Complete status progression from creation to closure, including exception handling paths"
          diagram={LIFECYCLE_DIAGRAM}
        />

        {/* Status Definitions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Status Definitions
          </h4>
          <div className="grid gap-3">
            {STATUS_DEFINITIONS.map((status) => (
              <div key={status.status} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={status.color as 'default' | 'secondary' | 'destructive' | 'outline'}>
                    {status.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{status.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Permissions:</span>
                    <span className="text-muted-foreground ml-2">{status.permissions}</span>
                  </div>
                  <div>
                    <span className="font-medium">Allowed Actions:</span>
                    <span className="text-muted-foreground ml-2">{status.allowedActions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Automatic Status Progression">
          The system automatically advances status based on events (first submission, deadline reached).
          Manual intervention is only required at decision points: launching, releasing results, and closing.
        </TipCallout>

        <StepByStep steps={STEPS} title="Operational Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Database Fields (feedback_360_cycles table)" 
        />

        <WarningCallout title="Cancellation is Permanent">
          Cancelling a cycle discards all collected responses and cannot be undone. Only cancel if the
          cycle was created in error and no valuable feedback has been submitted.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

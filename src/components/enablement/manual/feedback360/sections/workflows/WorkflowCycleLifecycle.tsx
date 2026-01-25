import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout, FutureCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { RefreshCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Understand the complete 360 feedback cycle lifecycle',
  'Know the current 3-status model and transition rules',
  'Recognize key timestamps and their significance',
  'Plan cycle phases with realistic timelines',
  'Distinguish between current capabilities and planned enhancements'
];

/**
 * IMPORTANT: This reflects the ACTUAL database implementation
 * Database currently supports 3 status values: draft, active, completed
 */
const LIFECYCLE_DIAGRAM = `
flowchart TD
    subgraph Current["Current Implementation"]
        A[Draft] -->|Launch Cycle| B[Active]
        B -->|Close Collection| C[Completed]
    end
    
    subgraph DraftPhase["Draft Phase"]
        A --> D1[Configure Settings]
        A --> D2[Assign Participants]
        A --> D3[Set Questionnaire]
        A --> D4[Define Timelines]
    end
    
    subgraph ActivePhase["Active Phase"]
        B --> E1[Collect Nominations]
        B --> E2[Approve Raters]
        B --> E3[Collect Feedback]
        B --> E4[Monitor Progress]
        B --> E5[Send Reminders]
    end
    
    subgraph CompletedPhase["Completed Phase"]
        C --> F1[Process Results]
        C --> F2[Generate Reports]
        C --> F3[Release Results]
        C --> F4[Track Engagement]
    end
    
    style A fill:#64748b,stroke:#475569,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#10b981,stroke:#059669,color:#fff
`;

/**
 * These are the ACTUAL statuses supported in the database
 */
const STATUS_DEFINITIONS = [
  { 
    status: 'draft', 
    displayName: 'Draft',
    description: 'Cycle is being configured. All settings, participants, and questionnaires can be modified.',
    allowedActions: ['Edit settings', 'Add/remove participants', 'Configure questionnaire', 'Launch cycle'],
    nextStatus: 'active',
    color: 'bg-slate-100 text-slate-800'
  },
  { 
    status: 'active', 
    displayName: 'Active',
    description: 'Cycle is live. Nominations, rater assignments, and feedback collection are in progress.',
    allowedActions: ['Monitor progress', 'Send reminders', 'Manage rater assignments', 'Close collection'],
    nextStatus: 'completed',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    status: 'completed', 
    displayName: 'Completed',
    description: 'Feedback collection is closed. Results are being processed and can be released to participants.',
    allowedActions: ['Process results', 'Generate reports', 'Release results', 'View analytics'],
    nextStatus: null,
    color: 'bg-green-100 text-green-800'
  }
];

/**
 * Fields that ACTUALLY exist in the database
 * Based on review_cycles and feedback_360_cycles tables
 */
const FIELDS: FieldDefinition[] = [
  {
    name: 'status',
    required: true,
    type: 'enum',
    description: 'Current lifecycle status of the cycle',
    defaultValue: 'draft',
    validation: 'draft | active | completed'
  },
  {
    name: 'start_date',
    required: true,
    type: 'date',
    description: 'When the cycle becomes active for feedback collection',
    defaultValue: '—',
    validation: 'Must be current or future date'
  },
  {
    name: 'end_date',
    required: true,
    type: 'date',
    description: 'Deadline for all feedback submissions',
    defaultValue: '—',
    validation: 'Must be after start_date'
  },
  {
    name: 'nomination_end_date',
    required: false,
    type: 'date',
    description: 'Deadline for peer nominations (if enabled)',
    defaultValue: '—',
    validation: 'Between start_date and end_date'
  },
  {
    name: 'results_released_at',
    required: false,
    type: 'timestamp',
    description: 'When results were made available to participants',
    defaultValue: '—',
    validation: 'Set when HR releases results'
  },
  {
    name: 'results_released_by',
    required: false,
    type: 'uuid',
    description: 'User who triggered the results release',
    defaultValue: '—',
    validation: 'References profiles.id'
  },
  {
    name: 'visibility_rules',
    required: false,
    type: 'jsonb',
    description: 'Configuration for what each role can see in results',
    defaultValue: 'Standard configuration',
    validation: 'Valid visibility schema'
  },
  {
    name: 'created_at',
    required: true,
    type: 'timestamp',
    description: 'When the cycle was first created',
    defaultValue: 'now()',
    validation: 'Auto-generated'
  },
  {
    name: 'updated_at',
    required: true,
    type: 'timestamp',
    description: 'Last modification timestamp',
    defaultValue: 'now()',
    validation: 'Auto-updated on changes'
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
          <RefreshCcw className="h-5 w-5 text-primary" />
          Cycle Lifecycle Management
        </CardTitle>
        <CardDescription>
          Understanding status transitions, key timestamps, and lifecycle phases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="360 Feedback Cycle Lifecycle"
          description="Current implementation: 3-status model (Draft → Active → Completed)"
          diagram={LIFECYCLE_DIAGRAM}
        />

        {/* Status Definitions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Cycle Status Definitions</h4>
          <div className="space-y-3">
            {STATUS_DEFINITIONS.map((def) => (
              <div key={def.status} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <Badge className={def.color}>{def.displayName}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">status = '{def.status}'</span>
                </div>
                <p className="text-sm text-muted-foreground">{def.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {def.allowedActions.map((action) => (
                    <Badge key={action} variant="outline" className="text-xs">
                      {action}
                    </Badge>
                  ))}
                </div>
                {def.nextStatus && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Next status:</span> {def.nextStatus}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Status Transition Best Practices">
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Review all participant assignments before launching (Draft → Active)</li>
            <li>Ensure adequate response rates before closing collection (Active → Completed)</li>
            <li>Allow 2-3 days buffer after deadline before processing results</li>
          </ul>
        </TipCallout>

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Cycle Database Fields" 
        />

        <FutureCallout title="Planned Lifecycle Enhancements">
          <p className="mb-2">The following lifecycle tracking fields are planned for future implementation:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="text-xs bg-muted px-1 rounded">activated_at</code> - Timestamp when cycle was launched</li>
            <li><code className="text-xs bg-muted px-1 rounded">activated_by</code> - User who launched the cycle</li>
            <li><code className="text-xs bg-muted px-1 rounded">closed_at</code> - Timestamp when collection was closed</li>
            <li><code className="text-xs bg-muted px-1 rounded">is_locked</code> - Prevent accidental modifications</li>
          </ul>
          <p className="mt-2 text-xs">These fields will provide enhanced audit trail and lifecycle tracking.</p>
        </FutureCallout>

        <WarningCallout title="Irreversible Transitions">
          Status transitions are forward-only. Once a cycle moves from Draft to Active,
          it cannot return to Draft. Plan your configuration thoroughly before launching.
        </WarningCallout>

        {/* Timeline Planning Guide */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Recommended Timeline Planning</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Phase</th>
                  <th className="text-left p-3 font-medium">Typical Duration</th>
                  <th className="text-left p-3 font-medium">Key Activities</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-medium">Draft</td>
                  <td className="p-3">1-2 weeks</td>
                  <td className="p-3">Configure settings, finalize participants, test questionnaire</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-3 font-medium">Active - Nominations</td>
                  <td className="p-3">1-2 weeks</td>
                  <td className="p-3">Participants nominate peers, managers approve</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Active - Collection</td>
                  <td className="p-3">2-4 weeks</td>
                  <td className="p-3">Raters provide feedback, HR monitors progress</td>
                </tr>
                <tr className="border-t bg-muted/30">
                  <td className="p-3 font-medium">Completed - Processing</td>
                  <td className="p-3">3-5 days</td>
                  <td className="p-3">Generate reports, HR review, prepare for release</td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">Completed - Release</td>
                  <td className="p-3">Ongoing</td>
                  <td className="p-3">Staged release, support conversations, track engagement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

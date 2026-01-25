import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { BarChart3, Eye, Users, AlertTriangle } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Navigate and interpret the Response Monitoring Dashboard',
  'Track completion rates by rater type and participant',
  'Identify at-risk submissions requiring intervention',
  'Use bulk selection for efficient reminder sending',
  'Generate monitoring reports for stakeholder updates'
];

const MONITORING_DIAGRAM = `
flowchart TD
    subgraph Dashboard["Response Monitoring Dashboard"]
        A[Overall Completion %] --> B[By Rater Type]
        A --> C[By Participant]
        A --> D[By Department]
    end
    
    subgraph Analysis["Drill-Down Analysis"]
        B --> E[Self: 95%]
        B --> F[Manager: 88%]
        B --> G[Peer: 72%]
        B --> H[Direct Report: 78%]
        
        C --> I[Per-Participant View]
        I --> J[Rater Status List]
    end
    
    subgraph Actions["Intervention Actions"]
        G --> K[Identify Low Completion]
        K --> L[Bulk Select Pending]
        L --> M[Send Reminders]
        
        J --> N[Individual Follow-up]
        N --> O[Extend Deadline]
        N --> P[Reassign Rater]
    end
    
    subgraph Reporting["Status Reporting"]
        A --> Q[Export Progress Report]
        Q --> R[Stakeholder Update]
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style M fill:#10b981,stroke:#059669,color:#fff
    style K fill:#f59e0b,stroke:#d97706
`;

const COMPLETION_THRESHOLDS = [
  { range: '90-100%', status: 'Excellent', color: 'bg-green-500', action: 'On track, minimal intervention needed' },
  { range: '75-89%', status: 'Good', color: 'bg-blue-500', action: 'Standard reminders, monitor closely' },
  { range: '60-74%', status: 'At Risk', color: 'bg-yellow-500', action: 'Intensive follow-up, consider escalation' },
  { range: 'Below 60%', status: 'Critical', color: 'bg-red-500', action: 'Immediate intervention, deadline extension may be needed' }
];

const METRICS_FIELDS: FieldDefinition[] = [
  {
    name: 'total_requests',
    required: true,
    type: 'integer',
    description: 'Total feedback requests created for cycle',
    defaultValue: '—',
    validation: 'Calculated field'
  },
  {
    name: 'pending_count',
    required: true,
    type: 'integer',
    description: 'Requests not yet started',
    defaultValue: '—',
    validation: 'Status = pending'
  },
  {
    name: 'started_count',
    required: true,
    type: 'integer',
    description: 'Requests opened but not submitted',
    defaultValue: '—',
    validation: 'Status = started or in_progress'
  },
  {
    name: 'submitted_count',
    required: true,
    type: 'integer',
    description: 'Requests successfully completed',
    defaultValue: '—',
    validation: 'Status = submitted'
  },
  {
    name: 'declined_count',
    required: true,
    type: 'integer',
    description: 'Requests declined by raters',
    defaultValue: '—',
    validation: 'Status = declined'
  },
  {
    name: 'completion_rate',
    required: true,
    type: 'decimal',
    description: 'Percentage of requests submitted',
    defaultValue: '—',
    validation: 'submitted_count / (total_requests - declined_count)'
  },
  {
    name: 'avg_response_time_hours',
    required: false,
    type: 'decimal',
    description: 'Average time from request creation to submission',
    defaultValue: '—',
    validation: 'Calculated from timestamps'
  },
  {
    name: 'days_remaining',
    required: true,
    type: 'integer',
    description: 'Days until cycle end date',
    defaultValue: '—',
    validation: 'Calculated from cycle.end_date'
  }
];

const STEPS: Step[] = [
  {
    title: 'Access Monitoring Dashboard',
    description: 'Open the response monitoring interface for your cycle.',
    substeps: [
      'Navigate to Performance → 360 Feedback → Cycles',
      'Select the active cycle',
      'Click "Response Monitoring" tab',
      'Dashboard loads with real-time data'
    ],
    expectedResult: 'Dashboard displays overall completion metrics and breakdowns'
  },
  {
    title: 'Review Overall Progress',
    description: 'Assess cycle-wide completion status.',
    substeps: [
      'View overall completion percentage prominently displayed',
      'Check days remaining until deadline',
      'Compare current rate to expected trajectory',
      'Note any significant gaps vs target (80%+)'
    ],
    expectedResult: 'Clear understanding of overall cycle health'
  },
  {
    title: 'Analyze by Rater Type',
    description: 'Identify which rater categories need attention.',
    substeps: [
      'View completion breakdown by rater type',
      'Self-assessments typically complete first (90%+)',
      'Manager feedback usually second (85-90%)',
      'Peer and Direct Report may lag (70-80%)',
      'Identify lowest completion category for focus'
    ],
    expectedResult: 'Prioritized list of rater types requiring intervention'
  },
  {
    title: 'Drill Down to Participants',
    description: 'Identify specific participants with coverage gaps.',
    substeps: [
      'Switch to "By Participant" view',
      'Sort by completion percentage ascending',
      'Identify participants with incomplete mandatory raters',
      'Click participant to see individual rater status',
      'Note any patterns (department, manager, etc.)'
    ],
    expectedResult: 'List of participants requiring specific attention'
  },
  {
    title: 'Take Bulk Actions',
    description: 'Send reminders to multiple pending raters efficiently.',
    substeps: [
      'Use filter to show "Pending" or "Started" requests',
      'Select multiple raters using checkboxes',
      'Click "Send Reminder" for bulk action',
      'Customize reminder message if needed',
      'Confirm send - system tracks reminder count'
    ],
    expectedResult: 'Reminders sent, dashboard updates last_reminder_sent'
  },
  {
    title: 'Generate Progress Report',
    description: 'Create reports for stakeholder updates.',
    substeps: [
      'Click "Export" button on dashboard',
      'Select report format (PDF, Excel)',
      'Choose data to include (summary, details, trends)',
      'Generate and download report',
      'Share with stakeholders for visibility'
    ],
    expectedResult: 'Formatted progress report ready for distribution'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Dashboard showing stale data',
    cause: 'Data may be cached or query not refreshing',
    solution: 'Click refresh button on dashboard. If issue persists, check database sync status.'
  },
  {
    issue: 'Completion percentage lower than expected',
    cause: 'Large number of new participants added recently, or high decline rate',
    solution: 'Check when participants were enrolled. Review decline rate - may indicate process issue.'
  },
  {
    issue: 'Cannot send reminders to some raters',
    cause: 'Raters may have already submitted or maximum reminders reached',
    solution: 'Check individual request status. System limits reminders to prevent harassment (default: 3 max).'
  },
  {
    issue: 'Participant shows 0% completion but feedback was provided',
    cause: 'Feedback may be saved as draft, not submitted',
    solution: 'Check request status - "started" or "in_progress" means draft. Rater needs to click Submit.'
  }
];

export function WorkflowResponseMonitoring() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.8</Badge>
          <Badge variant="secondary">~12 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
          <Badge variant="secondary">HR Partner</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Response Monitoring
        </CardTitle>
        <CardDescription>
          Tracking completion rates, identifying at-risk submissions, and managing bulk reminders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Response Monitoring']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Response Monitoring & Intervention Flow"
          description="Dashboard views, analysis, and intervention actions"
          diagram={MONITORING_DIAGRAM}
        />

        {/* Completion Thresholds */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Completion Thresholds & Actions
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Completion Range</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {COMPLETION_THRESHOLDS.map((threshold, index) => (
                  <tr key={threshold.range} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{threshold.range}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${threshold.color}`} />
                        {threshold.status}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{threshold.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Early Intervention">
          Don't wait until the deadline approaches. Monitor daily during the first week to identify
          patterns early. Early intervention significantly improves final completion rates.
        </TipCallout>

        <StepByStep steps={STEPS} title="Monitoring Procedures" />

        <FieldReferenceTable 
          fields={METRICS_FIELDS} 
          title="Monitoring Metrics (Calculated)" 
        />

        <WarningCallout title="Target Completion Rate">
          Industry benchmark is 80%+ completion for meaningful 360 results. Below 70% may indicate
          process issues that should be addressed before next cycle.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

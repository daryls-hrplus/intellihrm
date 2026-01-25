import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationPath } from '../../../NavigationPath';
import { TipCallout, WarningCallout } from '../../../components/Callout';
import { WorkflowDiagram } from '../../../components/WorkflowDiagram';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { LearningObjectives } from '../../../../workforce-manual/sections/lifecycle-workflows/LearningObjectives';
import { Unlock, Eye, Mail, Calendar } from 'lucide-react';

const LEARNING_OBJECTIVES = [
  'Configure results release settings and visibility rules',
  'Execute staged release to different stakeholder groups',
  'Manage notification workflows during release',
  'Handle pre-release preview and HR approval processes',
  'Monitor access and engagement post-release'
];

const RELEASE_DIAGRAM = `
flowchart TD
    subgraph Preparation["Release Preparation"]
        A[Results Processing Complete] --> B[HR Reviews Results]
        B --> C{Approval Required?}
        C -->|Yes| D[HR Director Approval]
        C -->|No| E[Ready for Release]
        D --> E
    end
    
    subgraph Staged["Staged Release"]
        E --> F{Release Strategy}
        F -->|Simultaneous| G[Release to All]
        F -->|Staged| H[Release to Managers]
        H --> I[Wait Period]
        I --> J[Release to Employees]
    end
    
    subgraph Notification["Notification"]
        G --> K[Send Release Notifications]
        J --> K
        K --> L[Email with Access Link]
        L --> M[In-App Notification]
    end
    
    subgraph Access["Access Control"]
        M --> N[Employee Views Own Report]
        M --> O[Manager Views Team Reports]
        M --> P[HR Views All Reports]
        N --> Q[Track Report Access]
        O --> Q
        P --> Q
    end
    
    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style K fill:#10b981,stroke:#059669,color:#fff
`;

const VISIBILITY_LEVELS = [
  { audience: 'Employee', access: 'Own report only', content: 'Individual scores, comments (anonymized), development suggestions' },
  { audience: 'Manager', access: 'Direct reports\' reports', content: 'Team member scores, trends, coaching recommendations' },
  { audience: 'HR Partner', access: 'Business unit reports', content: 'All scores, rater details (for investigation), analytics' },
  { audience: 'HR Admin', access: 'All reports', content: 'Full access including rater identity for investigations' },
  { audience: 'Executive', access: 'Aggregate dashboards', content: 'Department/company trends, no individual details' }
];

const FIELDS: FieldDefinition[] = [
  {
    name: 'results_released_at',
    required: false,
    type: 'timestamp',
    description: 'When results were made available',
    defaultValue: '—',
    validation: 'Set on release action'
  },
  {
    name: 'results_released_by',
    required: false,
    type: 'uuid',
    description: 'User who triggered the release',
    defaultValue: '—',
    validation: 'References profiles.id'
  },
  {
    name: 'auto_release_on_close',
    required: true,
    type: 'boolean',
    description: 'Automatically release when processing completes',
    defaultValue: 'false',
    validation: '—'
  },
  {
    name: 'release_delay_days',
    required: false,
    type: 'integer',
    description: 'Days after processing before auto-release',
    defaultValue: '0',
    validation: '0-30 days'
  },
  {
    name: 'require_hr_approval',
    required: true,
    type: 'boolean',
    description: 'HR Director must approve before release',
    defaultValue: 'true',
    validation: '—'
  },
  {
    name: 'notify_on_release',
    required: true,
    type: 'boolean',
    description: 'Send email notifications when results available',
    defaultValue: 'true',
    validation: '—'
  },
  {
    name: 'manager_preview_hours',
    required: false,
    type: 'integer',
    description: 'Hours managers see results before employees',
    defaultValue: '0',
    validation: '0-168 (up to 7 days)'
  },
  {
    name: 'results_visibility_rules',
    required: true,
    type: 'jsonb',
    description: 'Configuration for what each role can see',
    defaultValue: 'Standard configuration',
    validation: 'Valid visibility schema'
  }
];

const STEPS: Step[] = [
  {
    title: 'Configure Release Settings',
    description: 'Set up release parameters during cycle configuration.',
    substeps: [
      'Navigate to cycle settings → "Release" section',
      'Choose release strategy: Manual, Auto after processing, Scheduled date',
      'If staged, set manager_preview_hours',
      'Enable/disable HR approval requirement',
      'Configure notification preferences',
      'Save settings'
    ],
    expectedResult: 'Release settings configured for cycle'
  },
  {
    title: 'Preview Results (HR)',
    description: 'Review results before releasing to participants.',
    substeps: [
      'Navigate to cycle → "Results Preview"',
      'View sample individual reports',
      'Check for any data quality issues',
      'Review aggregate statistics',
      'Verify anonymity is properly maintained',
      'Document any concerns'
    ],
    expectedResult: 'HR has validated results are appropriate for release'
  },
  {
    title: 'Obtain Approval (if required)',
    description: 'Get HR Director sign-off before release.',
    substeps: [
      'Click "Request Release Approval"',
      'System routes to configured approver',
      'Approver reviews summary and sample reports',
      'Approver clicks "Approve for Release" or "Reject"',
      'If rejected, feedback provided for resolution'
    ],
    expectedResult: 'Release approved in system, ready to execute'
  },
  {
    title: 'Execute Release',
    description: 'Make results available to stakeholders.',
    substeps: [
      'Click "Release Results" button',
      'Confirm release action in dialog',
      'System updates status to "Released"',
      'Visibility rules take effect immediately',
      'For staged release, managers notified first'
    ],
    expectedResult: 'Results accessible per visibility configuration'
  },
  {
    title: 'Send Notifications',
    description: 'Inform participants their results are available.',
    substeps: [
      'System sends notification emails automatically (if enabled)',
      'Email includes: cycle name, access link, context',
      'In-app notifications appear for web users',
      'Track notification delivery status',
      'Follow up on any delivery failures'
    ],
    expectedResult: 'All participants notified of result availability'
  },
  {
    title: 'Monitor Engagement',
    description: 'Track who has accessed their results.',
    substeps: [
      'Navigate to cycle → "Access Analytics"',
      'View report access rates by stakeholder group',
      'Identify participants who haven\'t viewed results',
      'Send reminders to non-viewers if appropriate',
      'Monitor for any access issues or concerns'
    ],
    expectedResult: 'Visibility into engagement with results'
  }
];

const TROUBLESHOOTING: TroubleshootingItem[] = [
  {
    issue: 'Release button disabled',
    cause: 'Processing not complete, or approval pending',
    solution: 'Check signal_processing_status. If complete, verify require_hr_approval setting and get approval if needed.'
  },
  {
    issue: 'Employee cannot see their results after release',
    cause: 'May not have met minimum response threshold, or visibility rule issue',
    solution: 'Check if employee has report generated. Review visibility_rules configuration. Verify employee status in cycle.'
  },
  {
    issue: 'Manager sees wrong team members',
    cause: 'Reporting relationships may have changed since cycle started',
    solution: 'System uses reporting relationship at release time. May need to adjust access manually for transitional cases.'
  },
  {
    issue: 'Notification emails not received',
    cause: 'Email delivery issues or notification settings disabled',
    solution: 'Check notify_on_release setting. Verify email addresses. Check delivery logs for failures.'
  }
];

export function WorkflowResultsRelease() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">Section 3.11</Badge>
          <Badge variant="secondary">~14 min read</Badge>
          <Badge variant="secondary">HR Admin</Badge>
          <Badge variant="secondary">HR Director</Badge>
        </div>
        <CardTitle className="flex items-center gap-2">
          <Unlock className="h-5 w-5 text-primary" />
          Results Release Management
        </CardTitle>
        <CardDescription>
          Staged release, visibility rules, notifications, and access monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', '360 Feedback', 'Cycles', '[Cycle Name]', 'Release Results']} />
        
        <LearningObjectives items={LEARNING_OBJECTIVES} />

        <WorkflowDiagram
          title="Results Release Workflow"
          description="From processing completion through staged release and notification"
          diagram={RELEASE_DIAGRAM}
        />

        {/* Visibility Levels */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visibility Levels by Audience
          </h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Audience</th>
                  <th className="text-left p-3 font-medium">Access Scope</th>
                  <th className="text-left p-3 font-medium">Content Visible</th>
                </tr>
              </thead>
              <tbody>
                {VISIBILITY_LEVELS.map((level, index) => (
                  <tr key={level.audience} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{level.audience}</td>
                    <td className="p-3 text-muted-foreground">{level.access}</td>
                    <td className="p-3">{level.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <TipCallout title="Staged Release Benefits">
          Releasing to managers 24-48 hours before employees allows managers to prepare for conversations.
          They can review results, identify key discussion points, and schedule follow-up meetings.
        </TipCallout>

        <StepByStep steps={STEPS} title="Release Procedures" />

        <FieldReferenceTable 
          fields={FIELDS} 
          title="Release Configuration Fields" 
        />

        <WarningCallout title="Release is Irreversible">
          Once results are released, participants have access. While you can update visibility rules,
          the initial release notification creates awareness. Plan release timing carefully.
        </WarningCallout>

        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}

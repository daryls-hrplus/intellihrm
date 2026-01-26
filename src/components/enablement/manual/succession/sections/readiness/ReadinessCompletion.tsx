// Section 4.8: Assessment Completion & Candidate Update
// Finalization, audit trail, candidate profile sync

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IntegrationCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  InfoFeatureCard,
  StepByStep,
} from '../../../components';
import { Step } from '../../../components/StepByStep';
import { 
  CheckCircle2, 
  Users,
  Database,
  Shield,
  Bell,
  FileCheck,
  Clock,
  AlertTriangle
} from 'lucide-react';

const completionSteps: Step[] = [
  {
    title: 'All Required Assessors Submit',
    description: 'System monitors submission status against assessor type requirements.',
    substeps: [
      'Each assessor type marked is_required = true must submit',
      'Optional assessor types (is_required = false) do not block completion',
      'System checks submitted_at is not null for all required types'
    ],
    expectedResult: 'All required assessor responses have submitted_at timestamps.'
  },
  {
    title: 'System Calculates Overall Score',
    description: 'The calculateOverallScore function aggregates all submitted responses.',
    substeps: [
      'Weighted average computed per Section 4.7 algorithm',
      'Multi-assessor aggregation applied if multiple types rated same indicator',
      'Score rounded to 2 decimal places (e.g., 78.45%)'
    ],
    expectedResult: 'overall_score field populated on readiness_assessment_events record.'
  },
  {
    title: 'Band Assignment',
    description: 'Overall score mapped to readiness band using threshold lookup.',
    substeps: [
      'System queries readiness_rating_bands for company',
      'Finds band where score falls within min/max range',
      'Assigns rating_label to readiness_band field'
    ],
    expectedResult: 'readiness_band field set (e.g., "Ready in 1-3 Years").'
  },
  {
    title: 'Event Status Updated to Completed',
    description: 'Assessment event transitions to final status.',
    substeps: [
      'status = "completed"',
      'completed_at = now()',
      'Event becomes read-only (no further edits)'
    ],
    expectedResult: 'Event record shows completed status with timestamp.'
  },
  {
    title: 'Succession Candidate Profile Updated',
    description: 'The succession_candidates table is synchronized with assessment results.',
    substeps: [
      'latest_readiness_score = overall_score',
      'latest_readiness_band = readiness_band',
      'readiness_assessed_at = completed_at'
    ],
    expectedResult: 'Candidate profile reflects current readiness status.'
  },
  {
    title: 'Notifications Dispatched',
    description: 'System notifies stakeholders of assessment completion.',
    substeps: [
      'HR Partner who initiated receives completion notification',
      'Manager receives summary if configured',
      'Succession Plan owner notified of candidate update'
    ],
    expectedResult: 'Email/push notifications delivered per notification settings.'
  }
];

export function ReadinessCompletion() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the system workflow that triggers on all required assessors completing",
          "Trace the data flow from event completion to succession candidate profile update",
          "Verify audit trail requirements for compliance",
          "Configure notification triggers for assessment completion"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Technical Reference">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          src/hooks/succession/useReadinessAssessment.ts → completeAssessmentEvent()
        </code>
      </InfoCallout>

      {/* Step-by-Step Completion Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Assessment Completion Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={completionSteps} />
        </CardContent>
      </Card>

      {/* Data Synchronization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Candidate Profile Synchronization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            On completion, the system updates the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_candidates</code> 
            table with assessment results:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Candidate Field</th>
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">latest_readiness_score</td>
                  <td className="py-3 px-4">events.overall_score</td>
                  <td className="py-3 px-4">Numeric score (0-100) from weighted calculation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">latest_readiness_band</td>
                  <td className="py-3 px-4">events.readiness_band</td>
                  <td className="py-3 px-4">Text label (e.g., "Ready Now", "Ready in 1-3 Years")</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">readiness_assessed_at</td>
                  <td className="py-3 px-4">events.completed_at</td>
                  <td className="py-3 px-4">Timestamp of most recent completed assessment</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Data Flow Diagram */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">
{`readiness_assessment_events (completed)
├── overall_score: 78.45
├── readiness_band: "Ready in 1-3 Years"
└── completed_at: 2024-01-15T14:30:00Z
         │
         ▼ (Sync on completion)
succession_candidates
├── latest_readiness_score: 78.45
├── latest_readiness_band: "Ready in 1-3 Years"
└── readiness_assessed_at: 2024-01-15T14:30:00Z`}
            </pre>
          </div>

          <IntegrationCallout>
            <strong>Impact:</strong> Updated candidate data immediately reflects in Succession Plan 
            views, Bench Strength reports, and Nine-Box placements. Changes are visible to all 
            stakeholders with candidate view permissions.
          </IntegrationCallout>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Audit Trail Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Every readiness assessment creates a complete audit trail for compliance:
          </p>

          <FeatureCardGrid columns={3}>
            <PrimaryFeatureCard
              icon={Users}
              title="Assessor Attribution"
              description="Each response records assessor_id and assessor_type, creating accountability for every rating."
            />
            <SuccessFeatureCard
              icon={Clock}
              title="Timestamp Tracking"
              description="created_at (draft), submitted_at (final), and completed_at provide full timeline visibility."
            />
            <InfoFeatureCard
              icon={FileCheck}
              title="Historical Retention"
              description="Previous assessment events are retained indefinitely. New assessments do not delete history."
            />
          </FeatureCardGrid>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Audit Element</th>
                  <th className="text-left py-3 px-4 font-medium">Table</th>
                  <th className="text-left py-3 px-4 font-medium">Field(s)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Who initiated</td>
                  <td className="py-3 px-4 font-mono text-xs">readiness_assessment_events</td>
                  <td className="py-3 px-4 font-mono text-xs">initiated_by, created_at</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Who rated each indicator</td>
                  <td className="py-3 px-4 font-mono text-xs">readiness_assessment_responses</td>
                  <td className="py-3 px-4 font-mono text-xs">assessor_id, assessor_type</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">When ratings submitted</td>
                  <td className="py-3 px-4 font-mono text-xs">readiness_assessment_responses</td>
                  <td className="py-3 px-4 font-mono text-xs">submitted_at</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Final score calculation</td>
                  <td className="py-3 px-4 font-mono text-xs">readiness_assessment_events</td>
                  <td className="py-3 px-4 font-mono text-xs">overall_score, readiness_band</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Completion timestamp</td>
                  <td className="py-3 px-4 font-mono text-xs">readiness_assessment_events</td>
                  <td className="py-3 px-4 font-mono text-xs">completed_at, status</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historical Assessment Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Historical Assessment Retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The system retains all historical assessments for trend analysis and audit purposes:
          </p>

          <FeatureCardGrid columns={2}>
            <InfoFeatureCard
              icon={Database}
              title="All Events Retained"
              description="New assessments create new event records. Previous events remain with their original scores and bands intact."
            />
            <PrimaryFeatureCard
              icon={FileCheck}
              title="Latest Only on Candidate"
              description="The succession_candidates table shows only the most recent assessment. Historical data is accessible via event history queries."
            />
          </FeatureCardGrid>

          <WarningCallout>
            <strong>Important:</strong> To view assessment history for a candidate, query 
            <code className="mx-1 text-xs bg-muted px-1 py-0.5 rounded">readiness_assessment_events</code> 
            filtered by candidate_id and ordered by completed_at DESC. This provides the full 
            timeline of all assessments conducted.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Notification Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Triggers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Assessment completion triggers the following notifications:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium">Notification</th>
                  <th className="text-left py-3 px-4 font-medium">Channel</th>
                  <th className="text-left py-3 px-4 font-medium">Configurable</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">HR Partner (Initiator)</td>
                  <td className="py-3 px-4">Assessment completed with score summary</td>
                  <td className="py-3 px-4">Email, HR Hub Bell</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Direct Manager</td>
                  <td className="py-3 px-4">Team member assessment complete</td>
                  <td className="py-3 px-4">Email, MSS Bell</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Succession Plan Owner</td>
                  <td className="py-3 px-4">Candidate readiness updated</td>
                  <td className="py-3 px-4">Email</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Candidate (Optional)</td>
                  <td className="py-3 px-4">Assessment feedback available</td>
                  <td className="py-3 px-4">Email, ESS Bell</td>
                  <td className="py-3 px-4"><Badge variant="outline">If enabled</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>

          <InfoCallout title="Configuration Path">
            <code className="text-xs bg-muted px-2 py-1 rounded">
              Admin → Notifications → Succession → Assessment Complete
            </code>
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <p className="font-medium text-sm">Issue: Assessment stuck at "in_progress" status</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cause:</strong> A required assessor has not submitted their responses.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Solution:</strong> Check succession_assessor_types for is_required = true entries. 
                Query responses to find which assessor_type is missing submissions. Follow up with 
                the missing assessor or manually complete the event if override is permitted.
              </p>
            </div>

            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <p className="font-medium text-sm">Issue: Candidate profile not updated after completion</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cause:</strong> The candidate_id on the event may not match an active succession_candidates record.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Solution:</strong> Verify the candidate exists in succession_candidates and is 
                linked to the correct succession plan. The sync only updates active candidates.
              </p>
            </div>

            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <p className="font-medium text-sm">Issue: Score shows 0% despite responses</p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Cause:</strong> Responses may be drafts (submitted_at = null) rather than final submissions.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Solution:</strong> Query readiness_assessment_responses and check submitted_at values. 
                Only responses with non-null submitted_at are included in score calculation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Assessment Completion">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Set due dates on events to drive timely assessor completion</li>
          <li>Monitor pending assessments weekly to identify stuck events</li>
          <li>Use HR Hub dashboards to track completion rates by department</li>
          <li>Archive historical assessments annually for reporting but never delete</li>
          <li>Validate candidate profile updates after each cycle to ensure sync integrity</li>
        </ul>
      </TipCallout>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users2, Clock, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { LearningObjectives, InfoCallout, WarningCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const TALENT_POOL_ISSUES = [
  {
    id: 'TPL-001',
    symptom: 'Candidate not appearing in talent pool nominations list',
    severity: 'High',
    cause: 'Employee doesn\'t meet pool entry criteria (JSONB conditions), or already has active membership in the pool.',
    resolution: [
      'Review pool entry_criteria JSONB definition',
      'Verify employee meets all criteria conditions',
      'Check talent_pool_members for existing active membership',
      'Adjust criteria or manually nominate if edge case'
    ],
    prevention: 'Document criteria logic in pool description. Test criteria with sample employees before launch.',
    crossRef: 'See Section 5.3 for Criteria-Based Pool Creation.'
  },
  {
    id: 'TPL-002',
    symptom: 'Pool member status stuck in "pending" after nomination',
    severity: 'High',
    cause: 'Approval workflow not configured or approver unavailable. Status lifecycle requires HR review action.',
    resolution: [
      'Check talent pool requires_approval flag setting',
      'Navigate to HR Hub > Pending Approvals',
      'Assign backup approver if primary unavailable',
      'Manually update status if workflow bypassed'
    ],
    prevention: 'Configure backup approvers for pool workflows. Set SLA alerts for pending nominations.',
    crossRef: 'See Section 5.5 for HR Review Workflow.'
  },
  {
    id: 'TPL-003',
    symptom: 'Graduation workflow not executing for ready pool member',
    severity: 'Medium',
    cause: 'Graduation criteria not met or automatic graduation disabled. Manual graduation may be required.',
    resolution: [
      'Verify member meets graduation_criteria JSONB conditions',
      'Check pool has auto_graduate = true if expected',
      'Manually graduate through pool member actions',
      'Document graduation reason for audit'
    ],
    prevention: 'Define clear graduation criteria during pool setup. Review members quarterly for graduation eligibility.',
    crossRef: 'See Section 5.6 for Pool Member Lifecycle.'
  },
  {
    id: 'TPL-004',
    symptom: 'Development plan not linked to succession gap',
    severity: 'Medium',
    cause: 'succession_gap_development_links record not created. Gap-to-plan linking requires explicit action.',
    resolution: [
      'Navigate to candidate development plan section',
      'Click "Link to Gap" action for relevant gap',
      'Select IDP item or learning course to link',
      'Verify link appears in gap tracking'
    ],
    prevention: 'Include gap linking in standard development plan workflow. Train HR on gap-to-development process.',
    crossRef: 'See Section 8.3 for Gap-to-Development Linking.'
  },
  {
    id: 'TPL-005',
    symptom: 'Succession plan priority ranking not displaying correctly',
    severity: 'Medium',
    cause: 'Candidate ranking field not set or multiple candidates have same rank. Ranking requires explicit ordering.',
    resolution: [
      'Navigate to succession plan candidate list',
      'Edit each candidate to set unique ranking value',
      'Use 1 = highest priority convention',
      'Save and refresh plan view'
    ],
    prevention: 'Enforce ranking during candidate addition. Use drag-and-drop reordering UI if available.',
    crossRef: 'See Section 6.5 for Candidate Nomination & Ranking.'
  },
  {
    id: 'TPL-006',
    symptom: 'Key position not showing any candidates despite nominations',
    severity: 'High',
    cause: 'Succession plan not linked to position, or plan status is draft. Active plan required for candidate display.',
    resolution: [
      'Verify succession_plans.position_id matches key position',
      'Check plan status is active (not draft or archived)',
      'Confirm candidates have status = active in succession_candidates',
      'Create plan if none exists for position'
    ],
    prevention: 'Create succession plan immediately after key position identification. Monitor coverage dashboard.',
    crossRef: 'See Section 6.4 for Succession Plan Creation.'
  },
  {
    id: 'TPL-007',
    symptom: 'Bench strength showing 0% coverage despite candidates existing',
    severity: 'High',
    cause: 'Candidates don\'t meet "Ready Now" criteria, or coverage calculation uses strict readiness filter.',
    resolution: [
      'Verify candidate readiness bands (Ready Now = 100%, 1-2 Years = 75%, etc.)',
      'Review bench strength formula from Section 10.3',
      'Check coverage_score calculation settings',
      'Adjust readiness assessment to update candidate bands'
    ],
    prevention: 'Understand bench strength formula before interpreting. Focus on accelerating readiness for key positions.',
    crossRef: 'See Section 10.3 for Bench Strength Analysis.'
  },
  {
    id: 'TPL-008',
    symptom: 'Evidence collection failing silently for candidate',
    severity: 'Medium',
    cause: 'Evidence capture trigger not configured or source data unavailable. Check succession_candidate_evidence table.',
    resolution: [
      'Verify nine_box_evidence_sources has recent entries',
      'Check talent_signal_snapshots for candidate',
      'Manually create evidence record if trigger failed',
      'Review trigger configuration for evidence capture'
    ],
    prevention: 'Test evidence capture during pilot phase. Include evidence validation in assessment completion.',
    crossRef: 'See Section 6.9 for Candidate Evidence Collection.'
  },
  {
    id: 'TPL-009',
    symptom: 'Review packet not generating for HR approval',
    severity: 'Medium',
    cause: 'talent_pool_review_packets record not created. Packet generation may require manual trigger.',
    resolution: [
      'Navigate to pool member pending approval',
      'Click "Generate Review Packet" action',
      'Verify packet includes evidence and recommendations',
      'Route to HR for decision'
    ],
    prevention: 'Automate packet generation on nomination. Include packet requirement in approval workflow.',
    crossRef: 'See Section 5.5 for HR Review Workflow.'
  },
  {
    id: 'TPL-010',
    symptom: 'Confidence indicators (Bias Risk, Data Freshness) missing from review',
    severity: 'Low',
    cause: 'Signal snapshot data incomplete or confidence calculation not running. Optional feature may be disabled.',
    resolution: [
      'Verify talent_signal_snapshots has recent data for member',
      'Check confidence_score calculation in snapshot',
      'Enable confidence indicators in pool configuration',
      'Refresh member data to populate indicators'
    ],
    prevention: 'Enable confidence indicators during pool setup. Train HR on interpreting confidence levels.',
    crossRef: 'See Section 5.5 for evidence-based decision support.'
  },
  {
    id: 'TPL-011',
    symptom: 'Values promotion check failing for ready candidate',
    severity: 'High',
    cause: 'Candidate has values assessment below threshold, or values integration not configured.',
    resolution: [
      'Review candidate\'s latest values assessment score',
      'Check values_met_threshold configuration in succession settings',
      'Navigate to ValuesPromotionCheck component for details',
      'Work with manager on values development if genuinely failing'
    ],
    prevention: 'Include values assessment in readiness criteria. Communicate values expectations early in development.',
    crossRef: 'See Section 6.5 for Values Promotion Check.'
  },
];

const MEMBER_STATUS_LIFECYCLE = [
  { status: 'nominated', description: 'Initial nomination pending review', next: 'approved or rejected' },
  { status: 'approved', description: 'HR approved for pool entry', next: 'active' },
  { status: 'rejected', description: 'HR rejected nomination', next: 'Terminal' },
  { status: 'active', description: 'Active pool member', next: 'graduated or removed' },
  { status: 'graduated', description: 'Successfully transitioned to role', next: 'Terminal' },
  { status: 'removed', description: 'Removed from pool', next: 'Terminal' },
];

export function TalentPoolSuccessionIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-5" data-manual-anchor="sec-11-5" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, HR Partner</span>
          </div>
          <h3 className="text-xl font-semibold">11.5 Talent Pool & Succession Plan Issues</h3>
          <p className="text-muted-foreground mt-1">
            Pool membership, candidate ranking, development linking, bench strength, and evidence collection troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Troubleshoot pool nomination and member status lifecycle issues',
          'Resolve succession plan candidate visibility and ranking problems',
          'Diagnose bench strength calculation discrepancies',
          'Fix development plan and gap linking failures',
          'Understand talent pool member status state machine'
        ]}
      />

      {/* Status Lifecycle Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Pool Member Status Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MEMBER_STATUS_LIFECYCLE.map((state) => (
              <div key={state.status} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <Badge variant="outline" className="font-mono w-24 justify-center">{state.status}</Badge>
                <span className="text-sm flex-1">{state.description}</span>
                <span className="text-xs text-muted-foreground">→ {state.next}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-orange-600" />
            Detailed Issue Resolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {TALENT_POOL_ISSUES.map((issue) => (
              <AccordionItem key={issue.id} value={issue.id} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`h-4 w-4 flex-shrink-0 ${issue.severity === 'High' ? 'text-destructive' : issue.severity === 'Medium' ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <Badge variant="outline" className="font-mono">{issue.id}</Badge>
                    <span className="text-sm font-medium">{issue.symptom}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4 pl-6">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Root Cause</span>
                      <p className="text-sm mt-1">{issue.cause}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resolution Steps</span>
                      <ol className="list-decimal list-inside text-sm mt-1 space-y-1">
                        {issue.resolution.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Prevention</span>
                        <p className="text-sm mt-1">{issue.prevention}</p>
                      </div>
                    </div>
                    {issue.crossRef && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        📖 {issue.crossRef}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <WarningCallout title="Database Constraint">
        The talent_pool_members.member_status field has a CHECK constraint enforcing valid values: 
        nominated, approved, rejected, active, graduated, removed. Attempting to set other values will fail.
      </WarningCallout>

      <InfoCallout title="Bench Strength Formula">
        Coverage Score = (Ready Now candidates × 1.0) + (1-2 Years × 0.75) + (3-5 Years × 0.5) / Target coverage. 
        A position with 1 Ready Now candidate = 100% coverage if target is 1.
      </InfoCallout>
    </div>
  );
}

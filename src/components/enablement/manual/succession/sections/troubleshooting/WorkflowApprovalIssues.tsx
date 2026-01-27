import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { LearningObjectives, InfoCallout, TipCallout } from '../../../components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const WORKFLOW_ISSUES = [
  {
    id: 'WKF-001',
    symptom: 'Transaction not appearing in approval queue',
    severity: 'High',
    cause: 'Transaction type not configured for company, or workflow template inactive. Queue filters may exclude transaction.',
    resolution: [
      'Navigate to HR Hub > Workflow Settings',
      'Verify transaction type exists (e.g., SUCCESSION_READINESS_APPROVAL)',
      'Check workflow_templates.is_active = true',
      'Confirm company_transaction_workflow_settings has entry'
    ],
    prevention: 'Include all succession transaction types in implementation checklist. Test each type before go-live.',
    crossRef: 'See Section 6.10 for Workflow & Approval Configuration.'
  },
  {
    id: 'WKF-002',
    symptom: 'Workflow stuck in "pending" state indefinitely',
    severity: 'High',
    cause: 'Approver unavailable (terminated, on leave) or approval step misconfigured. No backup approver assigned.',
    resolution: [
      'Identify stuck workflow in pending_approvals table',
      'Check current approver status (active employee)',
      'Reassign to backup approver via HR Hub',
      'Configure backup approvers for future workflows'
    ],
    prevention: 'Always configure backup approvers. Set SLA alerts for pending items > 48 hours.',
    crossRef: 'See Section 9.10 for HR Hub Workflow Integration.'
  },
  {
    id: 'WKF-003',
    symptom: 'Approver not receiving email notifications',
    severity: 'Medium',
    cause: 'Notification preferences disabled or email template not configured. SMTP delivery may be failing.',
    resolution: [
      'Check approver notification_preferences in profile',
      'Verify email templates exist for workflow events',
      'Check notification_log for delivery errors',
      'Test SMTP configuration with sample notification'
    ],
    prevention: 'Enable notifications by default for approvers. Monitor notification delivery metrics.',
    crossRef: 'See Section 9.10 for notification configuration.'
  },
  {
    id: 'WKF-004',
    symptom: 'Bulk approval not processing all selected items',
    severity: 'Medium',
    cause: 'Some items have different approval requirements or approver lacks permission for subset. Mixed transaction types.',
    resolution: [
      'Verify all selected items have same transaction type',
      'Confirm approver has permission for all items',
      'Process items in batches by type if needed',
      'Check for validation errors on individual items'
    ],
    prevention: 'Validate bulk selection before approval. Group items by transaction type for bulk actions.',
    crossRef: 'See Section 9.10 for bulk approval procedures.'
  },
  {
    id: 'WKF-005',
    symptom: 'Transaction type not recognized by workflow engine',
    severity: 'High',
    cause: 'Transaction type code mismatch or not registered in system. Custom types require explicit registration.',
    resolution: [
      'Verify transaction_type matches system enum values',
      'Standard types: SUCCESSION_READINESS_APPROVAL, PERF_SUCCESSION_APPROVAL',
      'Register custom types if using non-standard codes',
      'Restart workflow engine cache if needed'
    ],
    prevention: 'Use standard transaction type codes. Document any custom types in implementation guide.',
    crossRef: 'See Section 6.10 for transaction type configuration.'
  },
  {
    id: 'WKF-006',
    symptom: 'SLA escalation not triggering despite breach',
    severity: 'Medium',
    cause: 'SLA configuration missing or escalation job not running. Time zone differences may affect calculation.',
    resolution: [
      'Verify SLA hours configured for transaction type',
      'Check escalation_job is enabled and running',
      'Confirm time zone settings for SLA calculation',
      'Manually escalate if job failed'
    ],
    prevention: 'Configure SLAs during workflow setup. Monitor escalation job execution logs.',
    crossRef: 'See Section 11.10 for SLA configuration.'
  },
  {
    id: 'WKF-007',
    symptom: 'Completed workflow not updating source record',
    severity: 'High',
    cause: 'Post-approval action not configured or trigger failing. Integration rule may be inactive.',
    resolution: [
      'Check workflow_templates.post_approval_action configuration',
      'Verify integration rule for workflow completion exists',
      'Check appraisal_integration_log for execution errors',
      'Manually update source record if integration failed'
    ],
    prevention: 'Test full workflow lifecycle including post-approval updates. Monitor integration logs.',
    crossRef: 'See Section 9.11 for Integration Execution & Audit.'
  },
  {
    id: 'WKF-008',
    symptom: 'Multi-level approval chain skipping levels',
    severity: 'Medium',
    cause: 'Approver at skipped level same as previous, or auto-approve rules triggered. Chain logic may have condition.',
    resolution: [
      'Review approval chain configuration for conditional skips',
      'Check if auto-approve rules match scenario',
      'Verify each level has distinct approver',
      'Disable auto-approve if strict chain required'
    ],
    prevention: 'Document approval chain logic explicitly. Test multi-level scenarios during UAT.',
    crossRef: 'See Section 6.10 for approval chain configuration.'
  },
];

const TRANSACTION_TYPES = [
  { code: 'SUCCESSION_READINESS_APPROVAL', description: 'Readiness assessment completion requiring HR sign-off' },
  { code: 'PERF_SUCCESSION_APPROVAL', description: 'Succession plan updates requiring executive approval' },
  { code: 'TALENT_POOL_NOMINATION', description: 'Pool member nomination pending HR review' },
  { code: 'FLIGHT_RISK_ESCALATION', description: 'Critical flight risk requiring immediate attention' },
];

export function WorkflowApprovalIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-11-6" data-manual-anchor="sec-11-6" className="scroll-mt-32">
        <div className="border-l-4 border-orange-500 pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~10 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, HR Partner</span>
          </div>
          <h3 className="text-xl font-semibold">11.6 Workflow & Approval Issues</h3>
          <p className="text-muted-foreground mt-1">
            Pending approvals, workflow configuration, transaction types, SLA escalation, and chain logic troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Troubleshoot transactions not appearing in approval queues',
          'Resolve stuck workflow and approver availability issues',
          'Fix notification delivery and bulk approval failures',
          'Configure SLA escalation for time-sensitive approvals',
          'Understand succession-specific transaction types'
        ]}
      />

      {/* Transaction Types Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-orange-600" />
            Succession Transaction Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TRANSACTION_TYPES.map((type) => (
              <div key={type.code} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <Badge variant="outline" className="font-mono text-xs">{type.code}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{type.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {WORKFLOW_ISSUES.map((issue) => (
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

      <TipCallout title="Backup Approvers">
        Always configure at least one backup approver for each workflow level. This prevents stuck workflows 
        when primary approvers are unavailable due to leave, termination, or role changes.
      </TipCallout>

      <InfoCallout title="SLA Best Practice">
        Configure SLAs based on business criticality: Succession readiness approvals = 48 hours, 
        Flight risk escalations = 24 hours, Pool nominations = 72 hours. Monitor SLA compliance weekly.
      </InfoCallout>
    </div>
  );
}

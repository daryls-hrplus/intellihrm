import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const COMPLIANCE_ISSUES = [
  {
    id: 'CMP-001',
    symptom: 'Compliance rule not auto-assigning to target audience',
    severity: 'High',
    cause: 'Target audience criteria not matching employees, or assignment job not running, or rule is inactive.',
    resolution: [
      'Verify compliance training rule is_active = true',
      'Review target_audience criteria (department, role, location)',
      'Check assignment job is enabled and running on schedule',
      'Test criteria with a sample employee who should match',
      'Manually run assignment job to trigger immediate assignment'
    ],
    prevention: 'Test target audience criteria before activating rules. Monitor assignment job health.'
  },
  {
    id: 'CMP-002',
    symptom: 'Exemption request not visible to approver',
    severity: 'High',
    cause: 'Approver not configured in workflow, or request in wrong status, or permission issue.',
    resolution: [
      'Verify exemption workflow approvers are configured',
      'Check request status is "pending_approval"',
      'Confirm approver has exemption approval permission',
      'Check if request is in correct workflow stage',
      'Manually route request to correct approver if needed'
    ],
    prevention: 'Configure exemption workflows during compliance setup. Test approval flow.'
  },
  {
    id: 'CMP-003',
    symptom: 'Grace period not extending due date correctly',
    severity: 'Medium',
    cause: 'Grace period not configured for training type, or calculation using wrong base date.',
    resolution: [
      'Verify grace_period_days is set on compliance rule',
      'Check grace period calculation: due_date = original_due + grace_days',
      'Confirm grace period applies to the specific exemption type',
      'Review extension history in compliance_audit_log',
      'Manually update due date if grace period should apply'
    ],
    prevention: 'Configure grace periods during rule setup. Document grace period policies.'
  },
  {
    id: 'CMP-004',
    symptom: 'Escalation notification not sending to manager',
    severity: 'High',
    cause: 'Escalation rule not configured, manager email missing, or notification template inactive.',
    resolution: [
      'Verify escalation tier is configured for the overdue stage',
      'Check manager has valid email address in profile',
      'Confirm escalation notification template is active',
      'Review escalation job logs for delivery failures',
      'Manually send escalation notification as workaround'
    ],
    prevention: 'Configure all escalation tiers. Test notifications with sample overdue scenarios.'
  },
  {
    id: 'CMP-005',
    symptom: 'Compliance dashboard showing incorrect completion counts',
    severity: 'High',
    cause: 'Status aggregation query stale, or assignment/completion records mismatched, or cache issue.',
    resolution: [
      'Refresh dashboard data using force refresh option',
      'Verify completion records in compliance_training_assignments',
      'Check for any orphaned or duplicate assignment records',
      'Compare dashboard counts with direct database query',
      'Clear analytics cache and regenerate metrics'
    ],
    prevention: 'Schedule regular dashboard data refresh. Monitor data quality metrics.'
  },
  {
    id: 'CMP-006',
    symptom: 'Recertification not creating new assignment when certification expires',
    severity: 'High',
    cause: 'Recertification job not running, rule doesnt have recertification enabled, or grace period active.',
    resolution: [
      'Verify requires_recertification = true on compliance rule',
      'Check recertification job is running on schedule',
      'Confirm previous assignment is in "expired" status',
      'Check if grace period is still active (may delay new assignment)',
      'Manually create recertification assignment if needed'
    ],
    prevention: 'Enable recertification during rule setup. Monitor certification expiry dates.'
  },
  {
    id: 'CMP-007',
    symptom: 'HSE training completion not syncing to safety module',
    severity: 'High',
    cause: 'Integration trigger not configured, or safety module sync disabled, or data mapping error.',
    resolution: [
      'Verify HSE integration is enabled in compliance settings',
      'Check integration sync job is running',
      'Review integration logs for sync failures',
      'Verify data field mapping between L&D and safety module',
      'Manually trigger sync for specific completion'
    ],
    prevention: 'Configure and test HSE integration before go-live. Monitor sync job health.'
  },
  {
    id: 'CMP-008',
    symptom: 'Regulatory body filter not working in compliance reports',
    severity: 'Medium',
    cause: 'Regulatory body not linked to training records, or filter query incorrect.',
    resolution: [
      'Verify regulatory_body_id is populated on compliance rules',
      'Check filter parameter is being passed correctly',
      'Test filter with known regulatory body records',
      'Review filter query logic in report definition'
    ],
    prevention: 'Link regulatory bodies during rule configuration. Test report filters.'
  },
  {
    id: 'CMP-009',
    symptom: 'Audit export missing required compliance fields',
    severity: 'High',
    cause: 'Export template outdated, field mapping incorrect, or new fields not added to export.',
    resolution: [
      'Review export template field configuration',
      'Add missing fields to export column mapping',
      'Verify field names match database column names',
      'Test export with sample data to verify all fields',
      'Update export template version'
    ],
    prevention: 'Review export templates when adding new compliance fields. Maintain export documentation.'
  },
  {
    id: 'CMP-010',
    symptom: 'Non-compliance flag not triggering HR intervention workflow',
    severity: 'High',
    cause: 'Intervention workflow not configured, flag threshold not met, or workflow trigger disabled.',
    resolution: [
      'Verify non-compliance intervention workflow exists',
      'Check flag threshold (e.g., 30+ days overdue)',
      'Confirm workflow trigger is enabled for non-compliance',
      'Review workflow execution logs for failures',
      'Manually trigger intervention workflow if needed'
    ],
    prevention: 'Configure intervention workflows during compliance setup. Test trigger thresholds.'
  },
  {
    id: 'CMP-011',
    symptom: 'Mobile completion not recording compliance status correctly',
    severity: 'High',
    cause: 'Mobile app sync delayed, completion event not firing, or status update failed.',
    resolution: [
      'Check mobile app sync status and last sync time',
      'Verify completion event was sent from mobile app',
      'Check for any sync errors in mobile app logs',
      'Force sync from mobile app settings',
      'If data exists locally, manual extraction may be needed'
    ],
    prevention: 'Enable automatic sync on mobile completion. Communicate sync requirements to users.'
  },
  {
    id: 'CMP-012',
    symptom: 'Evidence package attachment failing to upload',
    severity: 'Medium',
    cause: 'File size exceeds limit, file type not allowed, or storage quota exceeded.',
    resolution: [
      'Check file size against upload limit (typically 10MB)',
      'Verify file type is in allowed list (PDF, images, docs)',
      'Check storage quota for compliance evidence bucket',
      'Compress file or split into smaller parts',
      'Contact admin if storage quota needs increase'
    ],
    prevention: 'Communicate file size and type requirements. Monitor storage usage.'
  },
];

const QUICK_REFERENCE = [
  { id: 'CMP-001', symptom: 'Rule not auto-assigning', severity: 'High' },
  { id: 'CMP-004', symptom: 'Escalation not sending', severity: 'High' },
  { id: 'CMP-005', symptom: 'Dashboard counts incorrect', severity: 'High' },
  { id: 'CMP-006', symptom: 'Recertification not triggering', severity: 'High' },
  { id: 'CMP-010', symptom: 'HR intervention not triggering', severity: 'High' },
];

export function LndComplianceTrainingIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-7" data-manual-anchor="sec-9-7" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin, Compliance Officer</span>
          </div>
          <h3 className="text-xl font-semibold">9.7 Compliance Training Issues</h3>
          <p className="text-muted-foreground mt-1">
            Assignment rules, exemptions, escalations, recertification, HSE sync, and audit reporting troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose compliance rule assignment and targeting failures',
          'Troubleshoot exemption workflow and approval issues',
          'Resolve escalation notification and intervention triggers',
          'Fix recertification cycle and HSE integration problems',
          'Address compliance reporting and audit export issues'
        ]}
      />

      <WarningCallout title="Compliance Risk">
        Compliance training issues may have regulatory implications. Prioritize CMP-001 (assignment), 
        CMP-006 (recertification), and CMP-010 (intervention) as they directly impact compliance status.
      </WarningCallout>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Compliance Issues Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Issue ID</th>
                  <th className="text-left py-2 font-medium">Symptom</th>
                  <th className="text-left py-2 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-2">
                      <Badge variant="outline" className="font-mono">{item.id}</Badge>
                    </td>
                    <td className="py-2">{item.symptom}</td>
                    <td className="py-2">
                      <Badge variant="destructive">{item.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Issue Resolution (12 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {COMPLIANCE_ISSUES.map((issue) => (
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="Compliance Audit Trail">
        All compliance changes are logged in compliance_audit_log. Use this table to investigate 
        timing of assignments, completions, and status changes for regulatory audits.
      </TipCallout>
    </div>
  );
}

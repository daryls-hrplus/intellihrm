import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout, WarningCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const INTEGRATION_ISSUES = [
  {
    id: 'INT-001',
    symptom: 'Onboarding auto-enrollment not triggering for new hires',
    severity: 'High',
    cause: 'Onboarding task not linked to training course, or trigger function disabled, or job mapping missing.',
    resolution: [
      'Verify onboarding task has training_course_id populated',
      'Check if trigger_onboarding_training_enrollment function is enabled',
      'Verify new hire job/department matches enrollment criteria',
      'Test with a sample onboarding task completion',
      'Review onboarding integration logs for errors'
    ],
    prevention: 'Configure onboarding-to-training links during onboarding setup. Test with sample hires.'
  },
  {
    id: 'INT-002',
    symptom: 'Appraisal training action not creating training request',
    severity: 'High',
    cause: 'Appraisal integration orchestrator not running, action type not configured, or mapping error.',
    resolution: [
      'Verify appraisal-integration-orchestrator edge function is deployed',
      'Check appraisal action has training_action_type configured',
      'Review appraisal_integration_log for execution status',
      'Verify action type is in allowed list (create_request, auto_enroll)',
      'Manually trigger integration for affected appraisals'
    ],
    prevention: 'Test appraisal-to-training flow before go-live. Monitor integration health dashboard.'
  },
  {
    id: 'INT-003',
    symptom: 'Competency/skill not updating after course completion',
    severity: 'High',
    cause: 'Competency-course mapping missing, skill update trigger disabled, or proficiency level incorrect.',
    resolution: [
      'Verify course is mapped in competency_course_mappings table',
      'Check competency update trigger is enabled',
      'Verify target proficiency level in mapping',
      'Review employee skill record before and after completion',
      'Manually update skill if mapping should have applied'
    ],
    prevention: 'Map competencies during course creation. Test skill update flow.'
  },
  {
    id: 'INT-004',
    symptom: 'Career path requirement not linking to learning path',
    severity: 'Medium',
    cause: 'Learning path not assigned as career requirement, or path ID mismatch, or career module not integrated.',
    resolution: [
      'Verify career path requirement references correct learning path',
      'Check learning path exists and is active',
      'Review career-learning integration configuration',
      'Test with sample career path progression'
    ],
    prevention: 'Link learning paths during career path setup. Validate path references.'
  },
  {
    id: 'INT-005',
    symptom: 'Workflow approval notification not sending',
    severity: 'High',
    cause: 'Notification template not configured, workflow stage missing notification, or email delivery failed.',
    resolution: [
      'Verify workflow stage has notification template assigned',
      'Check notification template is active and valid',
      'Review approver email address validity',
      'Check email delivery logs for failures',
      'Manually send notification as workaround'
    ],
    prevention: 'Configure notifications for all workflow stages. Test notification delivery.'
  },
  {
    id: 'INT-006',
    symptom: 'Calendar sync failing for scheduled training sessions',
    severity: 'Medium',
    cause: 'Calendar integration not authorized, sync token expired, or calendar API error.',
    resolution: [
      'Verify calendar integration is authorized (Google/Outlook)',
      'Check if OAuth token needs refresh',
      'Review calendar API error response',
      'Reauthorize calendar integration if needed',
      'Manually add events as workaround'
    ],
    prevention: 'Use service account for calendar integration. Implement token refresh automation.'
  },
  {
    id: 'INT-007',
    symptom: 'External LMS SSO authentication failing',
    severity: 'High',
    cause: 'SSO configuration incorrect, certificate expired, or provider endpoint changed.',
    resolution: [
      'Verify SSO/SAML configuration settings',
      'Check if SSL certificate is valid and not expired',
      'Confirm identity provider metadata is current',
      'Test SSO with a sample user account',
      'Contact external LMS provider if their endpoint changed'
    ],
    prevention: 'Monitor certificate expiry. Document SSO configuration for troubleshooting.'
  },
  {
    id: 'INT-008',
    symptom: 'Virtual classroom meeting link not generating',
    severity: 'High',
    cause: 'Virtual classroom integration not configured, API credentials invalid, or provider service down.',
    resolution: [
      'Verify virtual classroom provider is configured (Teams/Zoom/Meet)',
      'Check API credentials are valid and not expired',
      'Test meeting creation with provider API directly',
      'Check provider service status page',
      'Manually create meeting and add link as workaround'
    ],
    prevention: 'Test virtual classroom integration before session scheduling. Monitor API health.'
  },
  {
    id: 'INT-009',
    symptom: 'API rate limiting causing data sync failures',
    severity: 'Medium',
    cause: 'Too many API calls in short period, rate limit exceeded, or no retry logic implemented.',
    resolution: [
      'Review API call volume and rate limit thresholds',
      'Implement exponential backoff retry logic',
      'Batch API calls to reduce request count',
      'Request rate limit increase if justified',
      'Schedule large syncs during off-peak hours'
    ],
    prevention: 'Design integrations with rate limits in mind. Implement proper retry handling.'
  },
  {
    id: 'INT-010',
    symptom: 'Integration audit log not capturing events',
    severity: 'Medium',
    cause: 'Audit logging disabled, log table not accessible, or logging trigger failed.',
    resolution: [
      'Verify audit logging is enabled in integration settings',
      'Check appraisal_integration_log table accessibility',
      'Review logging trigger function for errors',
      'Enable debug logging for troubleshooting',
      'Check for storage quota issues'
    ],
    prevention: 'Enable audit logging during integration setup. Monitor log volume and retention.'
  },
  {
    id: 'INT-011',
    symptom: 'Cross-module data refresh timing mismatch',
    severity: 'Medium',
    cause: 'Different refresh schedules, cache invalidation not coordinated, or eventual consistency delay.',
    resolution: [
      'Review refresh schedules for each module',
      'Implement coordinated cache invalidation',
      'Add delay or polling for dependent data',
      'Force refresh when data consistency is critical',
      'Document expected sync delays for users'
    ],
    prevention: 'Align refresh schedules across modules. Document consistency expectations.'
  },
  {
    id: 'INT-012',
    symptom: 'Webhook delivery failing to external system',
    severity: 'High',
    cause: 'Webhook endpoint unreachable, authentication failed, or payload format rejected.',
    resolution: [
      'Verify webhook endpoint URL is correct and accessible',
      'Check authentication credentials if required',
      'Review webhook delivery logs for error response',
      'Test endpoint with sample payload using curl',
      'Contact external system owner for endpoint issues'
    ],
    prevention: 'Test webhook endpoints before enabling. Implement webhook retry with backoff.'
  },
];

const QUICK_REFERENCE = [
  { id: 'INT-001', symptom: 'Onboarding enrollment not triggering', severity: 'High' },
  { id: 'INT-002', symptom: 'Appraisal training action failing', severity: 'High' },
  { id: 'INT-003', symptom: 'Skill not updating on completion', severity: 'High' },
  { id: 'INT-007', symptom: 'SSO authentication failing', severity: 'High' },
  { id: 'INT-008', symptom: 'Meeting link not generating', severity: 'High' },
  { id: 'INT-012', symptom: 'Webhook delivery failing', severity: 'High' },
];

export function LndIntegrationSyncIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-9" data-manual-anchor="sec-9-9" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.9 Integration & Sync Issues</h3>
          <p className="text-muted-foreground mt-1">
            Onboarding, appraisals, competencies, workflows, SSO, virtual classrooms, and webhook troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose HR lifecycle integration failures (onboarding, appraisals)',
          'Troubleshoot competency sync and skill update issues',
          'Resolve SSO and external LMS authentication problems',
          'Fix virtual classroom integration and meeting generation failures',
          'Address webhook delivery and API rate limiting issues'
        ]}
      />

      <WarningCallout title="Integration Criticality">
        Integration failures can block cross-module workflows. Prioritize INT-001 (onboarding) and 
        INT-002 (appraisals) as they directly impact employee development lifecycle.
      </WarningCallout>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Integration Issues Quick Reference
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
            {INTEGRATION_ISSUES.map((issue) => (
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

      <TipCallout title="Integration Monitoring">
        Use the appraisal_integration_log table to monitor integration health. Query for status='failed' 
        to identify issues: <code className="text-xs bg-muted px-1 rounded">SELECT * FROM appraisal_integration_log WHERE status='failed'</code>
      </TipCallout>
    </div>
  );
}

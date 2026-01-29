import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bug, 
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  TroubleshootingSection,
  type TroubleshootingItem
} from '@/components/enablement/manual/components';

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Onboarding task created but no enrollment appeared',
    cause: 'training_course_id not set, course not published, duplicate enrollment, or trigger missing',
    solution: 'Verify task has training_course_id, check course is_published = true, check lms_enrollments for existing enrollment'
  },
  {
    issue: 'Appraisal finalized but no training action created',
    cause: 'No active rule with target_module = training, conditions not met, or edge function error',
    solution: 'Verify rule is_active = true, check appraisal_integration_log for execution record, review edge function logs'
  },
  {
    issue: 'Integration log shows "failed" status',
    cause: 'Course not found/inactive, employee record issue, database constraint, or network timeout',
    solution: 'Check error_message field in log, verify course exists and employee has valid company_id'
  },
  {
    issue: 'Competency not updated after course completion',
    cause: 'No competency_course_mapping, current proficiency already higher, or trigger not firing',
    solution: 'Verify mapping exists in competency_course_mappings, check current proficiency in employee_skill_assessments'
  },
  {
    issue: 'Workflow approval stuck in pending',
    cause: 'Approver not assigned, user inactive, notification not delivered, or escalation not configured',
    solution: 'Check workflow_instances for current step, verify approver assignment, check notification logs'
  },
  {
    issue: 'Calendar sync not creating events',
    cause: 'OAuth token expired, API rate limit, session not virtual, or API permissions missing',
    solution: 'Re-authenticate calendar integration, check API quota, verify delivery_method = virtual'
  },
  {
    issue: 'External training not counting toward compliance',
    cause: 'Verification pending, course type not mapped, dates outside period, or skills not matching',
    solution: 'Ensure HR has verified record (status = verified), check compliance rule matching and date alignment'
  },
  {
    issue: 'Notifications not being sent',
    cause: 'Event type disabled, email provider error, invalid email, or edge function not running',
    solution: 'Check reminder_event_types config, verify email provider settings, test with known-good email'
  }
];

export function LndIntegrationTroubleshooting() {
  return (
    <section id="sec-8-12" data-manual-anchor="sec-8-12" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bug className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.12 Integration Troubleshooting</h3>
          <p className="text-sm text-muted-foreground">
            Common integration failures and resolution steps
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Diagnose common integration failures using audit logs',
        'Resolve onboarding, appraisal, and competency sync issues',
        'Fix workflow and notification delivery problems',
        'Escalate complex issues to technical support'
      ]} />

      <TroubleshootingSection items={troubleshootingItems} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Diagnostic Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Before Escalating to Support</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Checked <code>appraisal_integration_log</code> for execution record</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Verified integration rule exists and is_active = true</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Confirmed target course/record exists and is active</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Reviewed error_message if action_result = failed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Tested with a different employee/course to isolate issue</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Checked edge function logs for runtime errors</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Common Error Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive">Error</Badge>
                <code className="text-xs">Course not found or inactive</code>
              </div>
              <p className="text-sm text-muted-foreground">
                The course_id in the rule or mapping doesn't exist or is_published = false.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive">Error</Badge>
                <code className="text-xs">Duplicate enrollment exists</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee is already enrolled in this course. No action needed.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive">Error</Badge>
                <code className="text-xs">No matching competency mapping</code>
              </div>
              <p className="text-sm text-muted-foreground">
                Gap-based enrollment requested but no course mapped to the competency.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive">Error</Badge>
                <code className="text-xs">Workflow template not found</code>
              </div>
              <p className="text-sm text-muted-foreground">
                The workflow template for training requests is not configured or inactive.
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="destructive">Error</Badge>
                <code className="text-xs">API timeout: external service</code>
              </div>
              <p className="text-sm text-muted-foreground">
                External LMS or calendar API didn't respond. Will retry automatically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support Escalation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Level 1: Self-Service</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check documentation</li>
                <li>• Review audit logs</li>
                <li>• Verify configuration</li>
              </ul>
              <Badge variant="outline" className="mt-3">0-2 hours</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Level 2: Admin Support</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Platform admin review</li>
                <li>• Database queries</li>
                <li>• Configuration fix</li>
              </ul>
              <Badge variant="secondary" className="mt-3">2-24 hours</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Level 3: Technical</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Edge function debugging</li>
                <li>• Database migration</li>
                <li>• Code fix required</li>
              </ul>
              <Badge variant="destructive" className="mt-3">24-72 hours</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Pro Tip:</strong> Most integration issues are configuration-related, not bugs. 
        Always verify the rule, mapping, or workflow exists and is active before escalating.
      </TipCallout>

      <InfoCallout>
        For general L&D troubleshooting (non-integration issues), refer to <strong>Chapter 9: 
        Troubleshooting & Best Practices</strong>.
      </InfoCallout>
    </section>
  );
}

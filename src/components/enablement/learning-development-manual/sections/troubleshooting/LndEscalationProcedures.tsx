import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, Clock, HelpCircle, CheckCircle, AlertTriangle, Mail, Phone, Database, Code } from 'lucide-react';
import { LearningObjectives, TipCallout, InfoCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SUPPORT_TIERS = [
  {
    tier: 'L1',
    name: 'Self-Service',
    scope: 'Documentation, FAQs, in-app guidance',
    sla: 'Immediate',
    examples: ['How-to questions', 'Configuration clarification', 'Report interpretation']
  },
  {
    tier: 'L2',
    name: 'L&D Admin',
    scope: 'Configuration changes, data corrections, workflow adjustments',
    sla: '4 hours',
    examples: ['Enrollment corrections', 'Progress adjustments', 'Template updates']
  },
  {
    tier: 'L3',
    name: 'IT Support',
    scope: 'Integration failures, performance issues, access control',
    sla: '8 hours',
    examples: ['SSO failures', 'API errors', 'Database issues']
  },
  {
    tier: 'L4',
    name: 'Vendor/Development',
    scope: 'Product defects, feature requests, complex data recovery',
    sla: '24-72 hours',
    examples: ['Software bugs', 'SCORM compatibility', 'Data migration']
  }
];

const SLA_TARGETS = [
  { severity: 'Critical', response: '1 hour', resolution: '4 hours', description: 'System down, data loss risk' },
  { severity: 'High', response: '2 hours', resolution: '8 hours', description: 'Major feature broken, workaround available' },
  { severity: 'Medium', response: '4 hours', resolution: '24 hours', description: 'Feature impaired, limited impact' },
  { severity: 'Low', response: '8 hours', resolution: '72 hours', description: 'Minor issue, cosmetic or enhancement' }
];

const ESCALATION_CHECKLIST = [
  'Issue ID from Chapter 9 troubleshooting sections',
  'Steps to reproduce the issue',
  'Expected vs. actual behavior',
  'Screenshots or screen recording',
  'Browser console logs (if applicable)',
  'Affected user count and business impact',
  'Attempted resolution steps already taken'
];

const FAQS = [
  {
    question: 'How do I reset a user\'s course progress?',
    answer: 'Navigate to Admin > Enrollments, find the enrollment, click Reset Progress. This clears lesson/module progress but preserves the enrollment record. Use with caution as this action is logged but not reversible.'
  },
  {
    question: 'Why can\'t employees see a course in the catalog?',
    answer: 'Check: (1) Course status is "Published", (2) Enrollment window is currently open, (3) No target audience restrictions excluding them, (4) Course is not in a hidden category.'
  },
  {
    question: 'How do I extend a compliance training deadline?',
    answer: 'Navigate to Compliance > Assignments, select the assignment, click "Extend Deadline". Document the reason as this is audit-logged. For bulk extensions, use the exemption workflow.'
  },
  {
    question: 'How do I troubleshoot SCORM tracking issues?',
    answer: 'Check lms_scorm_tracking for latest statements. Verify SCORM package sends correct cmi.core.lesson_status. Test in incognito mode. See PRG-004 for detailed steps.'
  },
  {
    question: 'Why is the AI recommendation not showing any courses?',
    answer: 'User needs: (1) Completed skill profile, (2) At least 10 courses in catalog, (3) AI recommendations enabled in company settings. See AIA-001 for details.'
  },
  {
    question: 'How do I manually award a certificate?',
    answer: 'Navigate to Admin > Certificates > Award Certificate. Select employee and certificate template. Manual awards are logged with your user ID for audit purposes.'
  },
  {
    question: 'Why is the enrollment count different in reports vs. dashboard?',
    answer: 'Reports may include cancelled/withdrawn enrollments. Dashboard typically shows active only. Check filter settings on both views. See PER-003 for duplicate detection.'
  },
  {
    question: 'How do I configure a new compliance training rule?',
    answer: 'Navigate to Compliance > Rules > Create Rule. Define target audience criteria, recertification period, and escalation tiers. Test with a pilot group before full rollout.'
  },
  {
    question: 'Can I import external training records in bulk?',
    answer: 'Yes. Navigate to Training > External Training > Import. Use the provided CSV template. Validate data before import. See VND-007 for common import issues.'
  },
  {
    question: 'How do I troubleshoot workflow approval stuck in pending?',
    answer: 'Check: (1) Approver is assigned and active, (2) Notification was sent, (3) Approval deadline not passed. Reassign or escalate if needed. See VND-004 for details.'
  },
  {
    question: 'Why is the virtual classroom link not generating?',
    answer: 'Verify: (1) Virtual classroom integration is configured, (2) API credentials are valid, (3) Provider service is operational. See INT-008 for troubleshooting steps.'
  },
  {
    question: 'How do I regenerate a certificate PDF?',
    answer: 'Navigate to employee\'s training history, find the certificate, click "Regenerate PDF". If template was updated, regeneration uses the current template version.'
  },
  {
    question: 'What happens when a learning path course is archived?',
    answer: 'Enrolled learners retain access until completion. New enrollments to the path will skip the archived course. Consider creating a new path version instead of archiving.'
  },
  {
    question: 'How do I troubleshoot slow analytics dashboard?',
    answer: 'Add date range filters (default to last 30 days), check for missing database indexes, consider materialized views for complex queries. See PER-002 for optimization steps.'
  },
  {
    question: 'Can I change a quiz passing score after learners have attempted?',
    answer: 'Yes, but existing attempts are not retroactively re-evaluated. Document the change and consider if re-attempts should be allowed for those who failed under the old score.'
  },
  {
    question: 'How do I add a new regulatory body for compliance tracking?',
    answer: 'Navigate to Admin > Reference Data > Regulatory Bodies. Add the body with country and industry codes. Link to compliance rules requiring this body\'s certification.'
  },
  {
    question: 'Why is the budget not deducting after training request approval?',
    answer: 'Verify: (1) Budget is linked to the request, (2) Budget period covers request date, (3) Sufficient balance exists. See VND-010 for resolution steps.'
  },
  {
    question: 'How do I configure multi-company vendor sharing?',
    answer: 'Set vendor scope to "Multi-Company" and specify allowed company IDs. Volume discounts can be configured per tier. See Section 3.11 for detailed setup.'
  },
  {
    question: 'What\'s the difference between "Cancelled" and "Withdrawn" enrollment status?',
    answer: 'Cancelled = admin/system action before training started. Withdrawn = learner/manager action after training started. Both are preserved in history for audit.'
  },
  {
    question: 'How do I enable AI governance logging for ISO 42001 compliance?',
    answer: 'Navigate to Admin > AI Settings > Governance. Enable explainability logging. All AI recommendations and decisions will be logged to ai_explainability_logs. See AIA-008.'
  }
];

export function LndEscalationProcedures() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-12" data-manual-anchor="sec-9-12" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>All Roles</span>
          </div>
          <h3 className="text-xl font-semibold">9.12 Escalation Procedures & FAQs</h3>
          <p className="text-muted-foreground mt-1">
            Tiered support model, SLA targets, escalation checklist, and frequently asked questions
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand the 4-tier support model (L1-L4) and when to use each',
          'Apply SLA targets based on issue severity',
          'Prepare complete escalation documentation',
          'Find answers to common L&D administration questions',
          'Identify appropriate support contacts by issue type'
        ]}
      />

      {/* Support Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            Tiered Support Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {SUPPORT_TIERS.map((tier) => (
              <div key={tier.tier} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary">{tier.tier}</Badge>
                  <span className="font-medium">{tier.name}</span>
                  <Badge variant="outline" className="ml-auto">{tier.sla}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{tier.scope}</p>
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> {tier.examples.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SLA Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            SLA Targets by Severity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Severity</th>
                  <th className="text-left py-2 font-medium">Response</th>
                  <th className="text-left py-2 font-medium">Resolution</th>
                  <th className="text-left py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {SLA_TARGETS.map((sla) => (
                  <tr key={sla.severity} className="border-b last:border-0">
                    <td className="py-2">
                      <Badge variant={sla.severity === 'Critical' ? 'destructive' : sla.severity === 'High' ? 'destructive' : sla.severity === 'Medium' ? 'default' : 'secondary'}>
                        {sla.severity}
                      </Badge>
                    </td>
                    <td className="py-2">{sla.response}</td>
                    <td className="py-2">{sla.resolution}</td>
                    <td className="py-2 text-muted-foreground">{sla.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Escalation Documentation Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Before escalating any issue, ensure you have documented:
          </p>
          <ul className="space-y-2">
            {ESCALATION_CHECKLIST.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <InfoCallout title="Escalation Reduces Resolution Time">
        Complete documentation reduces resolution time by 40%. Include all checklist items even if 
        some seem obvious—support teams work from the information provided.
      </InfoCallout>

      {/* Support Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Support Contact Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                L&D Administration
              </h4>
              <p className="text-sm text-muted-foreground">
                Enrollments, progress, certificates, compliance
              </p>
              <p className="text-sm font-mono mt-2">lnd-support@company.com</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical Issues
              </h4>
              <p className="text-sm text-muted-foreground">
                System outage, data loss, security incidents
              </p>
              <p className="text-sm font-mono mt-2">it-critical@company.com</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Integration Support
              </h4>
              <p className="text-sm text-muted-foreground">
                SSO, API, external system connections
              </p>
              <p className="text-sm font-mono mt-2">integrations@company.com</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Vendor/Product
              </h4>
              <p className="text-sm text-muted-foreground">
                Product defects, feature requests, SCORM issues
              </p>
              <p className="text-sm font-mono mt-2">Via support portal ticket</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions (20 FAQs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <TipCallout title="Self-Service First">
        80% of L&D questions can be answered from this manual. Use the symptom-to-section matrix in 
        Section 9.1 to quickly find relevant troubleshooting guidance before escalating.
      </TipCallout>

      {/* Diagnostic Query Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            SQL Diagnostic Query Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            These queries help diagnose common L&D data issues. Run in Cloud View → Run SQL (read-only recommended).
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Find Orphan Courses (No Modules)</span>
                <Badge variant="outline" className="ml-auto">Section 9.2</Badge>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`SELECT id, title, status FROM lms_courses 
WHERE id NOT IN (SELECT DISTINCT course_id FROM lms_modules WHERE course_id IS NOT NULL);`}
              </pre>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Find Progress Mismatches</span>
                <Badge variant="outline" className="ml-auto">Section 9.4</Badge>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`SELECT e.id, e.user_id, e.course_id, e.progress_percentage,
  (SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL) * 100.0 / NULLIF(COUNT(*), 0)
   FROM lms_lesson_progress lp 
   JOIN lms_lessons l ON lp.lesson_id = l.id 
   JOIN lms_modules m ON l.module_id = m.id 
   WHERE m.course_id = e.course_id AND lp.user_id = e.user_id) as calculated
FROM lms_enrollments e
WHERE e.status = 'in_progress';`}
              </pre>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm">Find Overdue Compliance Assignments</span>
                <Badge variant="outline" className="ml-auto">Section 9.7</Badge>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`SELECT cta.id, cta.employee_id, ct.name, cta.due_date, cta.status
FROM compliance_training_assignments cta
JOIN compliance_training ct ON cta.compliance_training_id = ct.id
WHERE cta.due_date < NOW() AND cta.status NOT IN ('completed', 'exempted')
ORDER BY cta.due_date LIMIT 50;`}
              </pre>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-red-600" />
                <span className="font-medium text-sm">Find At-Risk Learners Without Intervention</span>
                <Badge variant="outline" className="ml-auto">Section 9.10</Badge>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`SELECT crp.id, crp.employee_id, crp.enrollment_id, crp.risk_level, crp.risk_score
FROM completion_risk_predictions crp
WHERE crp.risk_level = 'high' 
  AND crp.id NOT IN (SELECT prediction_id FROM risk_interventions WHERE prediction_id IS NOT NULL)
ORDER BY crp.predicted_at DESC LIMIT 50;`}
              </pre>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">Find Orphan Enrollments (No Progress Records)</span>
                <Badge variant="outline" className="ml-auto">Section 9.14</Badge>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`SELECT e.id, e.user_id, e.course_id, e.enrolled_at, e.status
FROM lms_enrollments e
WHERE e.status = 'in_progress' 
  AND NOT EXISTS (
    SELECT 1 FROM lms_lesson_progress lp 
    JOIN lms_lessons l ON lp.lesson_id = l.id
    JOIN lms_modules m ON l.module_id = m.id
    WHERE m.course_id = e.course_id AND lp.user_id = e.user_id
  )
ORDER BY e.enrolled_at DESC LIMIT 50;`}
              </pre>
            </div>
          </div>

          <InfoCallout title="Query Safety">
            Always use <code className="bg-muted px-1 rounded">LIMIT</code> clauses and run queries in read-only mode. 
            For production databases, coordinate with IT before running diagnostic queries during peak hours.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ENROLLMENT_ISSUES = [
  {
    id: 'ENR-001',
    symptom: 'Course not visible in training catalog',
    severity: 'High',
    cause: 'Course status is not "Published", enrollment dates are outside current window, or course is restricted to specific audiences.',
    resolution: [
      'Verify course status = "Published" in Admin > LMS Management',
      'Check enrollment_opens_at and enrollment_closes_at dates',
      'Review target_audience restrictions if configured',
      'Verify course visibility settings (public vs. restricted)',
      'Clear browser cache and refresh catalog'
    ],
    prevention: 'Use the course visibility checklist before publishing. Set enrollment windows with buffer time.'
  },
  {
    id: 'ENR-002',
    symptom: 'Self-enrollment button disabled or missing',
    severity: 'Medium',
    cause: 'Course allow_self_enrollment is false, enrollment window closed, or max capacity reached.',
    resolution: [
      'Navigate to course settings and verify allow_self_enrollment = true',
      'Check if enrollment window is currently open',
      'Verify max_enrollment limit has not been reached',
      'If capacity-based, check waitlist settings',
      'Review any role-based restrictions on self-enrollment'
    ],
    prevention: 'Configure self-enrollment settings during course creation. Monitor enrollment capacity.'
  },
  {
    id: 'ENR-003',
    symptom: 'Manager unable to assign team members to course',
    severity: 'High',
    cause: 'Manager does not have team assignment permission, or employees already enrolled, or course not accepting assignments.',
    resolution: [
      'Verify manager has "Assign Training" permission in role settings',
      'Check if employees are already enrolled (cannot re-enroll)',
      'Verify course accepts manager assignments (not self-enroll only)',
      'Check manager-employee reporting relationship is correct',
      'Try enrolling one employee at a time to identify specific failures'
    ],
    prevention: 'Grant team assignment permissions during manager onboarding. Document enrollment rules.'
  },
  {
    id: 'ENR-004',
    symptom: 'Enrollment dates not enforcing restrictions',
    severity: 'Medium',
    cause: 'enrollment_opens_at and enrollment_closes_at not configured, or admin override is enabled.',
    resolution: [
      'Navigate to course settings and set enrollment window dates',
      'Verify date format is correct and in correct timezone',
      'Check if admin override is allowing enrollments outside window',
      'Test with a non-admin user to verify enforcement'
    ],
    prevention: 'Always configure enrollment windows during course setup. Use calendar view to verify dates.'
  },
  {
    id: 'ENR-005',
    symptom: 'Max enrollment limit not blocking new registrations',
    severity: 'Medium',
    cause: 'max_enrollment not set or is null, or waitlist is absorbing overflow, or cancellations freeing spots.',
    resolution: [
      'Navigate to course settings and verify max_enrollment value is set',
      'Check if waitlist is configured (may allow over-enrollment to waitlist)',
      'Review recent cancellations that may have freed spots',
      'Verify enrollment count query is accurate'
    ],
    prevention: 'Set max_enrollment during course creation. Configure waitlist behavior explicitly.'
  },
  {
    id: 'ENR-006',
    symptom: 'Waitlist not triggering enrollment on cancellation',
    severity: 'Medium',
    cause: 'Waitlist processing job not running, or waitlist_priority not configured, or notification failure.',
    resolution: [
      'Verify waitlist processing background job is enabled',
      'Check waitlist_priority values for correct ordering',
      'Manually trigger waitlist processing for the course',
      'Verify notification settings for waitlist promotions'
    ],
    prevention: 'Enable automatic waitlist processing. Configure email notifications for waitlist changes.'
  },
  {
    id: 'ENR-007',
    symptom: 'Prerequisite check failing for users who completed prerequisite',
    severity: 'High',
    cause: 'Prerequisite enrollment status is not "completed", or different course version, or data sync delay.',
    resolution: [
      'Verify prerequisite course enrollment status = "completed"',
      'Check if prerequisite is a different version of the course',
      'Wait for data sync if completion was recent (up to 15 min)',
      'Force refresh user enrollment data',
      'Manually verify completion in lms_enrollments table'
    ],
    prevention: 'Use prerequisite course IDs not names. Test prerequisite chains before go-live.'
  },
  {
    id: 'ENR-008',
    symptom: 'Employee seeing "Access Denied" for enrolled course',
    severity: 'High',
    cause: 'Enrollment status is not "enrolled" or "in_progress", or course visibility changed, or permissions issue.',
    resolution: [
      'Verify enrollment status in lms_enrollments (should be enrolled/in_progress)',
      'Check if course status changed after enrollment',
      'Verify user role has course access permissions',
      'Check if course was moved to restricted category',
      'Review any recent permission changes for the user'
    ],
    prevention: 'Notify enrolled users before changing course visibility. Use grace period for access changes.'
  },
  {
    id: 'ENR-009',
    symptom: 'Learning path enrollment not creating individual course enrollments',
    severity: 'High',
    cause: 'Auto-enrollment for first course is disabled, or course enrollment failed, or path configuration error.',
    resolution: [
      'Verify learning path auto_enroll_first_course setting',
      'Check if first course in path accepts enrollments',
      'Manually enroll user in first course as workaround',
      'Review learning_path_enrollments and lms_enrollments tables',
      'Check for any enrollment errors in system logs'
    ],
    prevention: 'Enable auto-enrollment for learning path first courses. Test path enrollment flow before release.'
  },
  {
    id: 'ENR-010',
    symptom: 'Bulk enrollment CSV import failing with validation errors',
    severity: 'Medium',
    cause: 'CSV format incorrect, employee IDs not found, or course codes invalid, or duplicate records.',
    resolution: [
      'Download and review the error report from import job',
      'Verify CSV column headers match expected format',
      'Validate employee IDs exist in the system',
      'Check course codes are valid and courses accept enrollment',
      'Remove duplicate employee-course combinations'
    ],
    prevention: 'Use the CSV template provided in the import wizard. Validate data before uploading.'
  },
  {
    id: 'ENR-011',
    symptom: 'Cancelled enrollment still showing in training history',
    severity: 'Low',
    cause: 'Cancelled enrollments are preserved in history by design, or view filter not excluding cancelled status.',
    resolution: [
      'Verify enrollment status is "cancelled" not "enrolled"',
      'Check training history view filter settings',
      'This is expected behavior - cancelled records are retained for audit',
      'If user should not have access, verify course access is revoked'
    ],
    prevention: 'Communicate that cancelled enrollments remain in history. Use filters to exclude from active views.'
  },
  {
    id: 'ENR-012',
    symptom: 'Enrollment confirmation email not sending',
    severity: 'Medium',
    cause: 'Email template not configured, notification disabled, or email delivery failure.',
    resolution: [
      'Verify enrollment notification template exists and is active',
      'Check user email address is valid and not bouncing',
      'Review notification settings for the course/enrollment type',
      'Check email delivery logs for failures',
      'Manually resend enrollment confirmation from enrollment details'
    ],
    prevention: 'Configure enrollment email templates during LMS setup. Test email delivery before go-live.'
  },
];

const QUICK_REFERENCE = [
  { id: 'ENR-001', symptom: 'Course not visible in catalog', severity: 'High' },
  { id: 'ENR-003', symptom: 'Manager cannot assign team', severity: 'High' },
  { id: 'ENR-007', symptom: 'Prerequisite check failing', severity: 'High' },
  { id: 'ENR-008', symptom: 'Access Denied for enrolled course', severity: 'High' },
  { id: 'ENR-009', symptom: 'Learning path not enrolling', severity: 'High' },
];

export function LndEnrollmentAccessIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-3" data-manual-anchor="sec-9-3" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~12 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin, Manager</span>
          </div>
          <h3 className="text-xl font-semibold">9.3 Enrollment & Access Issues</h3>
          <p className="text-muted-foreground mt-1">
            Self-enrollment, manager assignment, catalog visibility, waitlists, and access control troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose course visibility and catalog access issues',
          'Troubleshoot self-enrollment and manager assignment problems',
          'Resolve prerequisite enforcement and learning path enrollment failures',
          'Fix waitlist processing and bulk enrollment import issues',
          'Address access denied errors for enrolled users'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Enrollment Issues Quick Reference
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
                      <Badge variant={item.severity === 'High' ? 'destructive' : 'default'}>
                        {item.severity}
                      </Badge>
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
            {ENROLLMENT_ISSUES.map((issue) => (
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

      <TipCallout title="Enrollment Diagnostics">
        Use the Enrollment Diagnostics query in Section 4.6 to quickly identify enrollment status mismatches. 
        Filter by enrollment_source to distinguish self-enrollments from manager assignments.
      </TipCallout>
    </div>
  );
}

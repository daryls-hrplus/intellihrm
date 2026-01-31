import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle } from 'lucide-react';

const ERROR_CODE_GROUPS = [
  {
    prefix: 'LMS',
    name: 'Setup & Configuration',
    description: 'Errors related to course, module, lesson, and SCORM configuration',
    codes: [
      { code: 'LMS-001', message: 'Category not found', severity: 'Medium', cause: 'Referenced category_id does not exist', resolution: 'Verify category exists in lms_categories' },
      { code: 'LMS-002', message: 'Course code already exists', severity: 'Medium', cause: 'Duplicate course code in same company', resolution: 'Use unique course code or update existing' },
      { code: 'LMS-003', message: 'Module order conflict', severity: 'Low', cause: 'Duplicate display_order in same course', resolution: 'Reorder modules with unique sequence numbers' },
      { code: 'LMS-004', message: 'SCORM package invalid', severity: 'High', cause: 'Package missing imsmanifest.xml or corrupted', resolution: 'Re-export SCORM package from authoring tool' },
      { code: 'LMS-005', message: 'Prerequisite cycle detected', severity: 'High', cause: 'Circular prerequisite chain', resolution: 'Remove one prerequisite to break cycle' },
    ]
  },
  {
    prefix: 'ENR',
    name: 'Enrollment & Access',
    description: 'Errors during course enrollment and learner access',
    codes: [
      { code: 'ENR-001', message: 'Enrollment capacity exceeded', severity: 'Medium', cause: 'max_enrollments limit reached', resolution: 'Add learner to waitlist or increase capacity' },
      { code: 'ENR-002', message: 'Prerequisites not met', severity: 'Medium', cause: 'Required courses not completed', resolution: 'Complete prerequisite courses first' },
      { code: 'ENR-003', message: 'Enrollment window closed', severity: 'Low', cause: 'Current date outside enrollment_open/close_at', resolution: 'Wait for next enrollment period or admin override' },
      { code: 'ENR-004', message: 'Self-enrollment disabled', severity: 'Low', cause: 'allow_self_enrollment = false', resolution: 'Request manager or admin enrollment' },
      { code: 'ENR-005', message: 'Duplicate enrollment', severity: 'Low', cause: 'Active enrollment already exists', resolution: 'Continue existing enrollment' },
    ]
  },
  {
    prefix: 'PRG',
    name: 'Progress Tracking',
    description: 'Errors in lesson completion and progress calculation',
    codes: [
      { code: 'PRG-001', message: 'Progress sync failed', severity: 'High', cause: 'Database connection timeout', resolution: 'Retry lesson completion; check network' },
      { code: 'PRG-002', message: 'SCORM communication error', severity: 'High', cause: 'API calls blocked or LMS API unavailable', resolution: 'Check browser console; allow third-party cookies' },
      { code: 'PRG-003', message: 'Progress percentage mismatch', severity: 'Medium', cause: 'Calculated vs stored progress differs', resolution: 'Run progress recalculation job' },
      { code: 'PRG-004', message: 'Module unlock failed', severity: 'Medium', cause: 'Previous module not marked complete', resolution: 'Complete all lessons in previous module' },
    ]
  },
  {
    prefix: 'QIZ',
    name: 'Quiz & Assessment',
    description: 'Errors in quiz attempts, scoring, and AI generation',
    codes: [
      { code: 'QIZ-001', message: 'Quiz time expired', severity: 'Medium', cause: 'time_limit_minutes exceeded', resolution: 'Submit new attempt if retakes allowed' },
      { code: 'QIZ-002', message: 'Maximum attempts reached', severity: 'Medium', cause: 'max_attempts limit hit', resolution: 'Request admin reset or manager override' },
      { code: 'QIZ-003', message: 'Scoring calculation error', severity: 'High', cause: 'Question weights do not sum to 100', resolution: 'Adjust question weights in quiz config' },
      { code: 'QIZ-004', message: 'AI quiz generation failed', severity: 'Medium', cause: 'Insufficient source content', resolution: 'Provide more lesson content for AI to analyze' },
    ]
  },
  {
    prefix: 'CRT',
    name: 'Certificate & Credential',
    description: 'Errors in certificate generation and verification',
    codes: [
      { code: 'CRT-001', message: 'Certificate generation failed', severity: 'High', cause: 'Template missing or PDF render error', resolution: 'Check template configuration; retry generation' },
      { code: 'CRT-002', message: 'Certificate number conflict', severity: 'Medium', cause: 'Duplicate certificate_number generated', resolution: 'Regenerate with unique number' },
      { code: 'CRT-003', message: 'Verification code invalid', severity: 'Low', cause: 'Certificate not found or expired', resolution: 'Confirm certificate ID and expiry date' },
    ]
  },
  {
    prefix: 'CMP',
    name: 'Compliance Training',
    description: 'Errors in mandatory training and compliance rules',
    codes: [
      { code: 'CMP-001', message: 'Assignment rule mismatch', severity: 'High', cause: 'Target audience criteria not met', resolution: 'Review target_criteria JSON configuration' },
      { code: 'CMP-002', message: 'Escalation trigger failed', severity: 'High', cause: 'Notification template missing', resolution: 'Configure escalation notification template' },
      { code: 'CMP-003', message: 'Exemption rejected', severity: 'Medium', cause: 'Missing required justification', resolution: 'Provide exemption reason and documentation' },
    ]
  },
  {
    prefix: 'VND',
    name: 'Vendor & External',
    description: 'Errors with external vendors and training records',
    codes: [
      { code: 'VND-001', message: 'Vendor session conflict', severity: 'Medium', cause: 'Overlapping session times', resolution: 'Adjust session schedule or location' },
      { code: 'VND-002', message: 'Cost allocation failed', severity: 'Medium', cause: 'Budget not configured or exhausted', resolution: 'Allocate budget or request increase' },
      { code: 'VND-003', message: 'External record validation error', severity: 'Low', cause: 'Required fields missing', resolution: 'Complete all mandatory fields' },
    ]
  },
  {
    prefix: 'INT',
    name: 'Integration & Sync',
    description: 'Errors in cross-module integration and external systems',
    codes: [
      { code: 'INT-001', message: 'Onboarding trigger failed', severity: 'High', cause: 'Training course_id invalid', resolution: 'Verify training_course_id in onboarding_tasks' },
      { code: 'INT-002', message: 'Appraisal integration timeout', severity: 'High', cause: 'Edge function execution exceeded limit', resolution: 'Check function logs; optimize query' },
      { code: 'INT-003', message: 'SSO authentication failed', severity: 'High', cause: 'SAML configuration mismatch', resolution: 'Verify SSO provider settings' },
    ]
  },
  {
    prefix: 'AIA',
    name: 'AI & Automation',
    description: 'Errors in AI recommendations and adaptive learning',
    codes: [
      { code: 'AIA-001', message: 'Recommendation engine unavailable', severity: 'High', cause: 'AI service timeout or rate limit', resolution: 'Retry after backoff; check API quotas' },
      { code: 'AIA-002', message: 'Risk prediction failed', severity: 'Medium', cause: 'Insufficient learner data', resolution: 'Wait for more progress data points' },
      { code: 'AIA-003', message: 'Adaptive path not triggered', severity: 'Medium', cause: 'Rule conditions not met', resolution: 'Review adaptive_path_rules configuration' },
    ]
  },
  {
    prefix: 'ACC',
    name: 'Accessibility & Mobile',
    description: 'Errors related to accessibility and mobile experience',
    codes: [
      { code: 'ACC-001', message: 'Screen reader incompatibility', severity: 'High', cause: 'Missing ARIA labels', resolution: 'Add accessibility attributes to content' },
      { code: 'ACC-002', message: 'Mobile sync failed', severity: 'Medium', cause: 'Offline data corruption', resolution: 'Clear cache and re-download content' },
    ]
  },
  {
    prefix: 'DMC',
    name: 'Data Management',
    description: 'Errors in data privacy and retention',
    codes: [
      { code: 'DMC-001', message: 'GDPR export incomplete', severity: 'High', cause: 'Missing table joins', resolution: 'Verify export includes all L&D tables' },
      { code: 'DMC-002', message: 'Retention policy violation', severity: 'High', cause: 'Data not anonymized after period', resolution: 'Run data anonymization job manually' },
    ]
  }
];

const getSeverityBadge = (severity: string) => {
  if (severity === 'High') return <Badge variant="destructive">{severity}</Badge>;
  if (severity === 'Medium') return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">{severity}</Badge>;
  return <Badge variant="secondary">{severity}</Badge>;
};

export function LndErrorCodes() {
  const totalCodes = ERROR_CODE_GROUPS.reduce((acc, group) => acc + group.codes.length, 0);

  return (
    <section id="app-g" data-manual-anchor="app-g" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Appendix G: Error Codes & Diagnostic Messages</h2>
          <p className="text-muted-foreground">{totalCodes}+ error codes across {ERROR_CODE_GROUPS.length} categories with causes and resolutions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Error Code Prefixes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ERROR_CODE_GROUPS.map(group => (
              <Badge key={group.prefix} variant="outline" className="text-sm">
                {group.prefix}-XXX: {group.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-2">
        {ERROR_CODE_GROUPS.map(group => (
          <AccordionItem key={group.prefix} value={group.prefix} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="font-mono">{group.prefix}</Badge>
                <span className="font-semibold">{group.name}</span>
                <span className="text-sm text-muted-foreground">({group.codes.length} codes)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Code</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-24">Severity</TableHead>
                    <TableHead>Cause</TableHead>
                    <TableHead>Resolution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.codes.map(error => (
                    <TableRow key={error.code}>
                      <TableCell className="font-mono font-semibold text-primary">{error.code}</TableCell>
                      <TableCell>{error.message}</TableCell>
                      <TableCell>{getSeverityBadge(error.severity)}</TableCell>
                      <TableCell className="text-sm">{error.cause}</TableCell>
                      <TableCell className="text-sm">{error.resolution}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

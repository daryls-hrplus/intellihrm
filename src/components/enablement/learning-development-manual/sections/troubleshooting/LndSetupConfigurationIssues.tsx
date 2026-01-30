import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { LearningObjectives, TipCallout } from '../../../manual/components';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const SETUP_ISSUES = [
  {
    id: 'LMS-001',
    symptom: 'Category not appearing in course creation dropdown',
    severity: 'Medium',
    cause: 'Category is_active is false, or company_id scope is incorrect for multi-tenant environments.',
    resolution: [
      'Navigate to Admin > LMS Management > Categories',
      'Verify the category exists and is_active = true',
      'Check company_id matches the target company or is null for global',
      'Refresh the course creation form to reload category list'
    ],
    prevention: 'Always verify category status after creation. Use the category management validation checklist.'
  },
  {
    id: 'LMS-002',
    symptom: 'Course stuck in "Draft" status, cannot publish',
    severity: 'High',
    cause: 'Course is missing required fields (description, duration, thumbnail) or has no modules/lessons assigned.',
    resolution: [
      'Navigate to Admin > LMS Management > Courses',
      'Edit the course and check for validation errors',
      'Ensure at least one module with one lesson exists',
      'Fill all required fields: title, description, category, duration',
      'Click Publish to change status to "Published"'
    ],
    prevention: 'Use the course creation checklist. Enable preview validation before publishing.'
  },
  {
    id: 'LMS-003',
    symptom: 'Module display order not updating after drag-and-drop',
    severity: 'Low',
    cause: 'order_index values have duplicates or the database update failed due to constraint violation.',
    resolution: [
      'Check browser console for any API errors',
      'Navigate to module management and verify order_index values',
      'Manually reorder using the arrow buttons instead of drag-and-drop',
      'If issue persists, refresh the page and try again'
    ],
    prevention: 'Use sequential numbering (10, 20, 30) to allow insertion without conflicts.'
  },
  {
    id: 'LMS-004',
    symptom: 'Lesson content not saving or showing blank',
    severity: 'High',
    cause: 'Content exceeds maximum field length, contains unsupported HTML, or network timeout during save.',
    resolution: [
      'Check browser console for save operation errors',
      'Reduce content size if exceeding 64KB limit',
      'Remove unsupported HTML tags or embedded scripts',
      'Retry save operation on stable network connection',
      'If using rich text, switch to plain text and gradually add formatting'
    ],
    prevention: 'Save content incrementally. Avoid pasting directly from Word/Google Docs without cleaning HTML.'
  },
  {
    id: 'LMS-005',
    symptom: 'Quiz not linked to course/module after creation',
    severity: 'Medium',
    cause: 'Quiz created without specifying course_id or module_id, or created from standalone quiz builder.',
    resolution: [
      'Navigate to Admin > LMS Management > Quizzes',
      'Edit the orphan quiz and select the target course/module',
      'Save changes and verify quiz appears in course structure',
      'Alternatively, create quiz from within the course/module editor'
    ],
    prevention: 'Always create quizzes from within course/module context rather than standalone quiz builder.'
  },
  {
    id: 'LMS-006',
    symptom: 'Learning path courses not in correct sequence',
    severity: 'Medium',
    cause: 'order_index values in learning_path_courses table are incorrect or were not set during path creation.',
    resolution: [
      'Navigate to Training > Learning Paths',
      'Edit the learning path and use the reorder interface',
      'Drag courses to correct sequence and save',
      'Verify sequence in path preview mode'
    ],
    prevention: 'Set course sequence during initial path creation. Test path flow before assigning to learners.'
  },
  {
    id: 'LMS-007',
    symptom: 'Prerequisite course not enforcing completion check',
    severity: 'High',
    cause: 'Prerequisite relationship not created, or prerequisite course status is not "Published", or enforcement is disabled.',
    resolution: [
      'Navigate to course settings > Prerequisites tab',
      'Verify prerequisite course is linked correctly',
      'Check prerequisite course status is "Published"',
      'Enable "Enforce Prerequisites" toggle if disabled',
      'Test with a user who has not completed the prerequisite'
    ],
    prevention: 'Test prerequisite enforcement with a test account before releasing to production users.'
  },
  {
    id: 'LMS-008',
    symptom: 'SCORM package upload failing validation',
    severity: 'High',
    cause: 'Package is not valid SCORM 1.2/2004, manifest is missing or malformed, or file exceeds size limit.',
    resolution: [
      'Verify package is a valid .zip file containing imsmanifest.xml',
      'Check SCORM version compatibility (1.2 or 2004 supported)',
      'Ensure file size is under the configured limit (default 500MB)',
      'Use a SCORM validator tool to check package structure',
      'Re-export from authoring tool with correct SCORM settings'
    ],
    prevention: 'Always validate SCORM packages with tools like SCORM Cloud before uploading.'
  },
  {
    id: 'LMS-009',
    symptom: 'xAPI statements not recording in LRS',
    severity: 'High',
    cause: 'xAPI endpoint not configured, authentication credentials invalid, or statement format is incorrect.',
    resolution: [
      'Navigate to Admin > LMS Settings > xAPI Configuration',
      'Verify LRS endpoint URL is correct',
      'Test authentication credentials with LRS provider',
      'Check browser console for statement submission errors',
      'Validate statement format against xAPI specification'
    ],
    prevention: 'Test xAPI integration with a simple statement before deploying content. Enable statement logging for debugging.'
  },
  {
    id: 'LMS-010',
    symptom: 'Certificate template variables not rendering',
    severity: 'Medium',
    cause: 'Placeholder syntax incorrect, variable name misspelled, or data not available at generation time.',
    resolution: [
      'Verify placeholder syntax: {employee_name}, {course_title}, {completion_date}',
      'Check available variables in certificate template documentation',
      'Test with a sample certificate generation',
      'Ensure all required data exists for the employee/course combination'
    ],
    prevention: 'Use the variable picker in template editor. Preview templates before activating.'
  },
  {
    id: 'LMS-011',
    symptom: 'Instructor profile not available for session assignment',
    severity: 'Low',
    cause: 'Instructor is_active is false, or instructor not linked to the correct company, or missing instructor role.',
    resolution: [
      'Navigate to Admin > LMS Management > Instructors',
      'Verify instructor record exists and is_active = true',
      'Check company_id matches or instructor is marked as shared',
      'Verify user has instructor role assigned in user management'
    ],
    prevention: 'Maintain an instructor qualification registry. Review instructor status quarterly.'
  },
  {
    id: 'LMS-012',
    symptom: 'Budget allocation not reflecting in department spending',
    severity: 'Medium',
    cause: 'Allocation not linked to correct cost center, or fiscal year mismatch, or allocation not approved.',
    resolution: [
      'Navigate to Training > Budgets > Allocations',
      'Verify allocation is linked to correct department/cost center',
      'Check fiscal year matches current period',
      'Ensure allocation status is "Approved" not "Pending"'
    ],
    prevention: 'Configure budget allocations at fiscal year start. Use allocation approval workflow.'
  },
  {
    id: 'LMS-013',
    symptom: 'Evaluation form questions not displaying after course completion',
    severity: 'Medium',
    cause: 'Evaluation form not linked to course, or form is inactive, or trigger timing misconfigured.',
    resolution: [
      'Navigate to Admin > LMS Management > Evaluations',
      'Verify evaluation form is linked to the course',
      'Check form status is "Active"',
      'Verify trigger_on_completion is enabled for the form',
      'Test with a sample completion event'
    ],
    prevention: 'Link evaluation forms during course creation. Test evaluation flow before go-live.'
  },
  {
    id: 'LMS-014',
    symptom: 'Badge criteria not triggering award after achievement',
    severity: 'Low',
    cause: 'Badge criteria not matching actual completion data, or badge is inactive, or award job not running.',
    resolution: [
      'Navigate to Admin > LMS Management > Badges',
      'Verify badge is_active = true',
      'Check badge criteria matches achievable conditions',
      'Verify the badge award background job is running',
      'Manually trigger badge check for test user'
    ],
    prevention: 'Test badge criteria with a sample user before enabling. Monitor badge award logs.'
  },
  {
    id: 'LMS-015',
    symptom: 'Company L&D settings not inheriting to subsidiaries',
    severity: 'High',
    cause: 'Company parent hierarchy not configured, or inheritance flag not enabled, or settings override exists.',
    resolution: [
      'Navigate to Admin > Company Management',
      'Verify subsidiary company_parent_id is set correctly',
      'Check inheritance flags in L&D settings',
      'Remove any local overrides that block inheritance',
      'Refresh subsidiary settings cache'
    ],
    prevention: 'Configure company hierarchy before L&D setup. Document inheritance rules in implementation guide.'
  },
];

const QUICK_REFERENCE = [
  { id: 'LMS-001', symptom: 'Category missing from dropdown', severity: 'Medium' },
  { id: 'LMS-002', symptom: 'Course stuck in Draft', severity: 'High' },
  { id: 'LMS-004', symptom: 'Lesson content not saving', severity: 'High' },
  { id: 'LMS-007', symptom: 'Prerequisite not enforcing', severity: 'High' },
  { id: 'LMS-008', symptom: 'SCORM upload failing', severity: 'High' },
  { id: 'LMS-009', symptom: 'xAPI not recording', severity: 'High' },
  { id: 'LMS-015', symptom: 'Settings not inheriting', severity: 'High' },
];

export function LndSetupConfigurationIssues() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-9-2" data-manual-anchor="sec-9-2" className="scroll-mt-32">
        <div className="border-l-4 border-primary pl-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            <span>~15 min read</span>
            <span className="mx-2">•</span>
            <span>Admin, L&D Admin, Consultant</span>
          </div>
          <h3 className="text-xl font-semibold">9.2 Setup & Configuration Issues</h3>
          <p className="text-muted-foreground mt-1">
            Categories, courses, modules, lessons, quizzes, SCORM/xAPI, certificates, and company settings troubleshooting
          </p>
        </div>
      </section>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Diagnose and resolve category and course configuration errors',
          'Troubleshoot SCORM/xAPI package upload and tracking issues',
          'Fix learning path sequencing and prerequisite enforcement problems',
          'Resolve certificate template and badge configuration issues',
          'Configure multi-company L&D settings inheritance correctly'
        ]}
      />

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Setup Issues Quick Reference
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
                      <Badge variant={item.severity === 'High' ? 'destructive' : item.severity === 'Medium' ? 'default' : 'secondary'}>
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
          <CardTitle>Detailed Issue Resolution (15 Issues)</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {SETUP_ISSUES.map((issue) => (
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

      <TipCallout title="Configuration Validation">
        Run the pre-go-live configuration validation checklist from Section 2.1 before launching courses. 
        This catches 80% of setup issues before they impact learners.
      </TipCallout>
    </div>
  );
}

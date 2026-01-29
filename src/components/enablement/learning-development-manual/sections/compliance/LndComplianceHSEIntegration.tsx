import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, ArrowLeftRight, Database, Workflow } from 'lucide-react';

export function LndComplianceHSEIntegration() {
  return (
    <section id="sec-5-20" data-manual-anchor="sec-5-20" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Shield className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.20 HSE Training Integration</h2>
          <p className="text-sm text-muted-foreground">
            Bidirectional Health, Safety & Environment module integration
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure bidirectional sync between HSE and LMS modules</li>
            <li>Link HSE safety requirements to LMS courses via lms_course_id</li>
            <li>Auto-assign training based on applicable_departments and applicable_positions</li>
            <li>Sync completion status between hse_training_records and lms_enrollments</li>
            <li>Track certification expiry across both systems with frequency_months</li>
          </ul>
        </CardContent>
      </Card>

      {/* Integration Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">HSE ↔ LMS Integration Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                     HSE ↔ LMS BIDIRECTIONAL INTEGRATION                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   HSE Module                                     LMS Module                      │
│   ┌─────────────────────────────┐                ┌─────────────────────────────┐│
│   │ hse_safety_training         │                │ lms_courses                 ││
│   │ ─────────────────────────── │                │ ─────────────────────────── ││
│   │ id                          │                │ id                          ││
│   │ title                       │                │ title                       ││
│   │ training_type               │                │ course_type                 ││
│   │ is_mandatory                │                │ is_compliance               ││
│   │ frequency_months            │   ────FK────▶  │ validity_months             ││
│   │ applicable_departments[]    │                │ target_audience             ││
│   │ applicable_positions[]      │                │                             ││
│   │ lms_course_id ──────────────┼────────────────┤ (linked course)             ││
│   │ duration_hours              │                │ estimated_duration          ││
│   └─────────────────────────────┘                └─────────────────────────────┘│
│              │                                              │                    │
│              │ creates                                      │ creates            │
│              ▼                                              ▼                    │
│   ┌─────────────────────────────┐                ┌─────────────────────────────┐│
│   │ hse_training_records        │   ◀── SYNC ──▶ │ lms_enrollments             ││
│   │ ─────────────────────────── │                │ ─────────────────────────── ││
│   │ id                          │                │ id                          ││
│   │ training_id (FK)            │                │ course_id (FK)              ││
│   │ employee_id                 │◀──────────────▶│ employee_id                 ││
│   │ training_date               │                │ enrolled_at                 ││
│   │ expiry_date                 │◀──────────────▶│ expires_at                  ││
│   │ status                      │◀──────────────▶│ status                      ││
│   │ score                       │                │ final_score                 ││
│   │ certificate_number          │◀──────────────▶│ certificate_id              ││
│   │ pass_mark                   │                │ passing_score               ││
│   └─────────────────────────────┘                └─────────────────────────────┘│
│                                                                                  │
│   Sync Direction:                                                                │
│   ├── HSE → LMS: When HSE training requirement created with lms_course_id       │
│   │              system auto-creates lms_enrollments for matching employees      │
│   │                                                                              │
│   └── LMS → HSE: When lms_enrollment status = 'completed'                       │
│                  system updates hse_training_records with completion data        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* HSE Safety Training Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-4 w-4" />
            hse_safety_training Field Reference (17 Fields)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>LMS Mapping</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">id</TableCell>
                <TableCell>UUID PK</TableCell>
                <TableCell>Unique identifier</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">company_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Multi-tenant isolation</TableCell>
                <TableCell>lms_courses.company_id</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">training_type</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>induction, refresher, specialized, certification</TableCell>
                <TableCell>lms_courses.course_type</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Training requirement name</TableCell>
                <TableCell>lms_courses.title</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">code</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Unique code (HSE-FORK-001)</TableCell>
                <TableCell>lms_courses.course_code</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">is_mandatory</TableCell>
                <TableCell>BOOLEAN</TableCell>
                <TableCell>Required for role/department</TableCell>
                <TableCell>lms_courses.is_compliance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">frequency_months</TableCell>
                <TableCell>INT</TableCell>
                <TableCell>Recertification frequency</TableCell>
                <TableCell>lms_courses.validity_months</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs font-bold">lms_course_id</TableCell>
                <TableCell className="font-bold">UUID FK</TableCell>
                <TableCell className="font-bold">Links to LMS course</TableCell>
                <TableCell className="font-bold">lms_courses.id</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">applicable_departments</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>Target departments for auto-assign</TableCell>
                <TableCell>Enrollment filter</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">applicable_positions</TableCell>
                <TableCell>UUID[]</TableCell>
                <TableCell>Target job positions</TableCell>
                <TableCell>Enrollment filter</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* HSE Training Records Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">hse_training_records Field Reference (15 Fields)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>LMS Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">id</TableCell>
                <TableCell>UUID PK</TableCell>
                <TableCell>Unique record</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">training_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Reference to hse_safety_training</TableCell>
                <TableCell>Via lms_course_id link</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">employee_id</TableCell>
                <TableCell>UUID FK</TableCell>
                <TableCell>Trained employee</TableCell>
                <TableCell>lms_enrollments.employee_id</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">training_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>Completion date</TableCell>
                <TableCell>← lms_enrollments.completed_at</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">expiry_date</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>Certification expiry</TableCell>
                <TableCell>← Calculated from frequency_months</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">status</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>scheduled, in_progress, completed, expired, failed</TableCell>
                <TableCell>← lms_enrollments.status</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">score</TableCell>
                <TableCell>DECIMAL</TableCell>
                <TableCell>Assessment score</TableCell>
                <TableCell>← lms_enrollments.final_score</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">certificate_number</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Certificate ID issued</TableCell>
                <TableCell>← certifications.certificate_number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">trainer_name</TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Instructor name</TableCell>
                <TableCell>← lms_sessions.instructor_id</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuration Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Configuration Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 1</Badge>
              <div>
                <p className="font-medium">Create LMS Course</p>
                <p className="text-sm text-muted-foreground">Admin → LMS Management → Courses → Create (e.g., "Forklift Safety Certification")</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 2</Badge>
              <div>
                <p className="font-medium">Create HSE Training Requirement</p>
                <p className="text-sm text-muted-foreground">HSE → Safety Training → Create Requirement</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 3</Badge>
              <div>
                <p className="font-medium">Link to LMS Course</p>
                <p className="text-sm text-muted-foreground">Set lms_course_id to the created course</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 4</Badge>
              <div>
                <p className="font-medium">Define Target Audience</p>
                <p className="text-sm text-muted-foreground">Set applicable_departments[] and applicable_positions[]</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline" className="shrink-0">Step 5</Badge>
              <div>
                <p className="font-medium">Set Recertification Cycle</p>
                <p className="text-sm text-muted-foreground">Configure frequency_months (e.g., 12 for annual, 36 for 3-year cert)</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Result:</p>
            <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
              <li>✓ Employees matching criteria auto-assigned to LMS course</li>
              <li>✓ LMS enrollment created with source = 'hse'</li>
              <li>✓ Completion syncs back to hse_training_records</li>
              <li>✓ Expiry tracked in both systems</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Sync Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sync Event Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Target Action</TableHead>
                <TableHead>Notification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>HSE Requirement Created</TableCell>
                <TableCell>hse_safety_training INSERT</TableCell>
                <TableCell>Create lms_enrollments for matching employees</TableCell>
                <TableCell>Employee: Training assigned</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>LMS Course Completed</TableCell>
                <TableCell>lms_enrollments.status = 'completed'</TableCell>
                <TableCell>Update hse_training_records with completion</TableCell>
                <TableCell>HSE Officer: Training completed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>New Employee Hired</TableCell>
                <TableCell>profiles INSERT matching dept/position</TableCell>
                <TableCell>Auto-enroll in required HSE-linked courses</TableCell>
                <TableCell>Employee: Required training assigned</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Role/Dept Change</TableCell>
                <TableCell>profiles UPDATE</TableCell>
                <TableCell>Evaluate new HSE requirements, assign/remove</TableCell>
                <TableCell>Employee: Training requirements updated</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Certification Expiring</TableCell>
                <TableCell>Daily scheduler (30/14/7 days)</TableCell>
                <TableCell>Create recertification enrollment</TableCell>
                <TableCell>Employee + Manager: Cert expiring</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FolderTree, CheckCircle2, AlertCircle, HardHat } from 'lucide-react';

export function LndComplianceCategories() {
  return (
    <section id="sec-5-2" data-manual-anchor="sec-5-2" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <FolderTree className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.2 Compliance Training Categories</h2>
          <p className="text-muted-foreground">Mandatory, recommended, role-based, and HSE-linked training types</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Distinguish between mandatory, recommended, and role-based compliance categories</li>
            <li>Configure category-specific enforcement rules and escalation policies</li>
            <li>Link HSE safety training requirements to L&D compliance tracking</li>
            <li>Apply appropriate targeting rules for each category type</li>
          </ul>
        </CardContent>
      </Card>

      {/* Category Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compliance Training Category Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Enforcement</TableHead>
                <TableHead>Targeting</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Mandatory</Badge>
                  </div>
                </TableCell>
                <TableCell>Required for employment</TableCell>
                <TableCell>All employees or by role/dept</TableCell>
                <TableCell>Manager → HR → Executive</TableCell>
                <TableCell>Anti-Harassment, Code of Conduct</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                </TableCell>
                <TableCell>Suggested, not enforced</TableCell>
                <TableCell>Based on competency gaps</TableCell>
                <TableCell>Reminders only</TableCell>
                <TableCell>Leadership Development, Soft Skills</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500">Role-Based</Badge>
                  </div>
                </TableCell>
                <TableCell>Required for specific roles</TableCell>
                <TableCell>Job position, department</TableCell>
                <TableCell>Role-specific chain</TableCell>
                <TableCell>Manager Training, Finance Compliance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-500">
                      <HardHat className="h-3 w-3 mr-1" />
                      HSE-Linked
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>Safety-critical, strictly enforced</TableCell>
                <TableCell>Work location, hazard exposure</TableCell>
                <TableCell>HSE → Manager → HR</TableCell>
                <TableCell>Forklift Cert, Confined Space Entry</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">New Hire</Badge>
                  </div>
                </TableCell>
                <TableCell>Required within probation</TableCell>
                <TableCell>All new employees</TableCell>
                <TableCell>Onboarding → HR</TableCell>
                <TableCell>Orientation, IT Security</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500">Regulatory</Badge>
                  </div>
                </TableCell>
                <TableCell>Legally mandated</TableCell>
                <TableCell>By jurisdiction/industry</TableCell>
                <TableCell>Legal → Executive</TableCell>
                <TableCell>OSHA 10/30, AML, GDPR</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Configuration Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Configuration Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Training → Compliance → Manage Rules → Add New

Step 1: Define Category
├── Select category type (Mandatory, Recommended, Role-Based, HSE-Linked)
├── Enter rule name and description
└── Set regulatory_body reference if applicable

Step 2: Link Training Content
├── Select course from lms_courses
├── OR link to hse_safety_training requirement
└── Set completion requirements (passing score, assessments)

Step 3: Configure Targeting
├── Target by Department:    target_departments = [dept_id_1, dept_id_2]
├── Target by Position:      target_positions = [pos_id_1, pos_id_2]
├── Target by Location:      target_locations = [loc_id_1, loc_id_2]
├── Target by Employment:    target_employment_types = ['permanent', 'contractor']
└── Combine targets with AND/OR logic

Step 4: Set Frequency & Deadlines
├── frequency_type:          one_time | annual | biannual | quarterly | custom
├── frequency_months:        Custom interval (e.g., 18 for every 18 months)
├── initial_due_days:        Days from hire date for first completion
└── grace_period_days:       Days allowed after due date

Step 5: Configure Enforcement
├── is_mandatory:            true = enforced with escalation
├── escalation_enabled:      Activate tiered notifications
└── non_compliance_action:   flag_record | block_system_access | require_manager_approval`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* HSE-Linked Category Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardHat className="h-5 w-5 text-amber-500" />
            HSE-Linked Category Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            HSE-linked compliance training connects health and safety requirements to the LMS through 
            the <code className="bg-muted px-1 rounded">hse_safety_training</code> table.
          </p>

          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    HSE-LINKED CATEGORY DATA FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   compliance_training (L&D)              hse_safety_training (HSE)          │
│   ┌────────────────────────┐             ┌────────────────────────┐         │
│   │ name: "Forklift Safety"│             │ title: "Forklift Cert" │         │
│   │ category: HSE-Linked   │◀───────────▶│ training_type: cert    │         │
│   │ course_id: UUID        │             │ lms_course_id: UUID    │         │
│   │ is_mandatory: true     │             │ is_mandatory: true     │         │
│   │ frequency_months: 36   │             │ frequency_months: 36   │         │
│   └────────────────────────┘             └────────────────────────┘         │
│                                                                              │
│   When hse_safety_training.lms_course_id is set:                            │
│   ├── Training appears in L&D compliance dashboards                         │
│   ├── Assignments sync between both systems                                 │
│   ├── Completion updates both hse_training_records AND lms_enrollments     │
│   └── Expiry notifications sent from both L&D and HSE modules              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-amber-600 mb-2">Best Practice</h4>
            <p className="text-sm">
              For safety-critical training, configure the requirement in <strong>HSE → Safety Training</strong> first, 
              then link the LMS course. This ensures proper incident integration and OSHA reporting. 
              The L&D compliance view will automatically reflect the HSE requirement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Target Audience Configuration Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Targeting Method</TableHead>
                <TableHead>Database Field</TableHead>
                <TableHead>Logic</TableHead>
                <TableHead>Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">All Employees</TableCell>
                <TableCell className="font-mono text-xs">target_all = true</TableCell>
                <TableCell>Universal</TableCell>
                <TableCell>Code of Conduct, Anti-Harassment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">By Department</TableCell>
                <TableCell className="font-mono text-xs">target_departments[]</TableCell>
                <TableCell>OR (any match)</TableCell>
                <TableCell>Finance Compliance, IT Security</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">By Position</TableCell>
                <TableCell className="font-mono text-xs">target_positions[]</TableCell>
                <TableCell>OR (any match)</TableCell>
                <TableCell>Manager Training, Supervisor Safety</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">By Location</TableCell>
                <TableCell className="font-mono text-xs">target_locations[]</TableCell>
                <TableCell>OR (any match)</TableCell>
                <TableCell>Site-specific safety, Regional regulations</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">By Employment Type</TableCell>
                <TableCell className="font-mono text-xs">target_employment_types[]</TableCell>
                <TableCell>OR (any match)</TableCell>
                <TableCell>Contractor safety, Temp worker orientation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Combined (AND)</TableCell>
                <TableCell className="font-mono text-xs">Multiple fields set</TableCell>
                <TableCell>AND (all must match)</TableCell>
                <TableCell>Finance Managers at HQ only</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notification Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Category-Specific Notification Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Recipients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Badge variant="destructive">Mandatory</Badge></TableCell>
                <TableCell className="font-mono text-xs">COMPLIANCE_TRAINING_ASSIGNED</TableCell>
                <TableCell>Assignment created</TableCell>
                <TableCell>Employee</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Mandatory</Badge></TableCell>
                <TableCell className="font-mono text-xs">COMPLIANCE_TRAINING_DUE</TableCell>
                <TableCell>7 days before due date</TableCell>
                <TableCell>Employee, Manager</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge variant="destructive">Mandatory</Badge></TableCell>
                <TableCell className="font-mono text-xs">COMPLIANCE_TRAINING_OVERDUE</TableCell>
                <TableCell>Due date passed</TableCell>
                <TableCell>Employee, Manager, HR</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">HSE-Linked</Badge></TableCell>
                <TableCell className="font-mono text-xs">HSE_TRAINING_EXPIRING</TableCell>
                <TableCell>30 days before expiry</TableCell>
                <TableCell>Employee, HSE Officer</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-amber-500">HSE-Linked</Badge></TableCell>
                <TableCell className="font-mono text-xs">HSE_CERTIFICATION_EXPIRED</TableCell>
                <TableCell>Certification expired</TableCell>
                <TableCell>Employee, Manager, HSE, HR</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Badge className="bg-green-500">New Hire</Badge></TableCell>
                <TableCell className="font-mono text-xs">ONBOARDING_TRAINING_REMINDER</TableCell>
                <TableCell>Probation deadline approaching</TableCell>
                <TableCell>Employee, Onboarding Coordinator</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Category Distribution Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">45%</div>
              <div className="text-sm text-muted-foreground">Mandatory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">25%</div>
              <div className="text-sm text-muted-foreground">Role-Based</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">20%</div>
              <div className="text-sm text-muted-foreground">HSE-Linked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">10%</div>
              <div className="text-sm text-muted-foreground">Recommended</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

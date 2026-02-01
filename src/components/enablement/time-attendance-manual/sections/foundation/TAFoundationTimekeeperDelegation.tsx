import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, UserCog, Users, GraduationCap, Shield,
  ArrowRight, UserCheck
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  InfoCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationTimekeeperDelegation() {
  const learningObjectives = [
    'Assign timekeeper responsibilities to designated users',
    'Configure delegation scope (department, location, team)',
    'Set timekeeper permissions and approval authority',
    'Manage temporary timekeeper assignments during absences',
    'Audit timekeeper actions and approvals'
  ];

  const timekeeperAssignmentFields: FieldDefinition[] = [
    { name: 'assignment_id', required: true, type: 'uuid', description: 'Unique assignment record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'timekeeper_id', required: true, type: 'uuid', description: 'User designated as timekeeper', defaultValue: '—', validation: 'Must reference valid user' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'scope_type', required: true, type: 'enum', description: 'What the timekeeper manages', defaultValue: 'department', validation: 'department, location, team, employee_list' },
    { name: 'scope_id', required: false, type: 'uuid', description: 'ID of department/location/team', defaultValue: 'null', validation: 'Based on scope_type' },
    { name: 'employee_list', required: false, type: 'jsonb', description: 'Specific employee IDs if scope=employee_list', defaultValue: '[]', validation: 'Array of UUIDs' },
    { name: 'can_view_punches', required: false, type: 'boolean', description: 'View time clock entries', defaultValue: 'true', validation: 'Read access' },
    { name: 'can_edit_punches', required: false, type: 'boolean', description: 'Correct/add punches', defaultValue: 'true', validation: 'Write access' },
    { name: 'can_approve_timesheets', required: false, type: 'boolean', description: 'Approve for payroll', defaultValue: 'true', validation: 'Approval authority' },
    { name: 'can_approve_overtime', required: false, type: 'boolean', description: 'Approve OT requests', defaultValue: 'false', validation: 'OT approval' },
    { name: 'can_manage_schedules', required: false, type: 'boolean', description: 'Create/modify schedules', defaultValue: 'false', validation: 'Scheduling access' },
    { name: 'effective_date', required: true, type: 'date', description: 'When assignment starts', defaultValue: 'now()', validation: 'Start date' },
    { name: 'end_date', required: false, type: 'date', description: 'When assignment ends', defaultValue: 'null', validation: 'For temporary delegation' },
    { name: 'delegated_by', required: false, type: 'uuid', description: 'Manager who delegated', defaultValue: 'null', validation: 'Audit trail' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Assignment is in effect', defaultValue: 'true', validation: 'Deactivate to revoke' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Timekeeper Scope Enforcement',
      enforcement: 'System',
      description: 'Timekeepers can only view/edit/approve records for employees within their assigned scope. Out-of-scope access is denied.'
    },
    {
      rule: 'Cannot Self-Approve',
      enforcement: 'System',
      description: 'Timekeepers cannot approve their own timesheets. Their records must be approved by their manager or another timekeeper.'
    },
    {
      rule: 'Multiple Timekeepers Allowed',
      enforcement: 'System',
      description: 'Multiple timekeepers can be assigned overlapping scopes. Any assigned timekeeper can perform allowed actions.'
    },
    {
      rule: 'Temporary Delegation Expiry',
      enforcement: 'System',
      description: 'Assignments with end_date automatically deactivate at midnight on the end date. No manual intervention needed.'
    },
    {
      rule: 'Action Audit Logging',
      enforcement: 'System',
      description: 'All timekeeper actions (edits, approvals) are logged with the timekeeper ID, timestamp, and before/after values.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Timekeeper Management',
      description: 'Access timekeeper delegation from the T&A admin menu.',
      notes: ['Time & Attendance → Setup → Timekeeper Assignments']
    },
    {
      title: 'Select Timekeeper User',
      description: 'Choose the user who will serve as timekeeper.',
      notes: ['User must have Time Admin or similar role']
    },
    {
      title: 'Define Scope',
      description: 'Choose what the timekeeper manages: department, location, team, or specific employees.',
      notes: ['Department is most common']
    },
    {
      title: 'Set Permissions',
      description: 'Enable/disable specific capabilities: view, edit, approve timesheets, approve OT, manage schedules.',
      notes: ['Start with minimal permissions, expand as needed']
    },
    {
      title: 'Set Effective Dates',
      description: 'For permanent assignment, leave end_date empty. For vacation coverage, set both dates.',
      notes: ['Temporary assignments auto-expire']
    },
    {
      title: 'Notify Timekeeper',
      description: 'System sends email notification to the new timekeeper with their responsibilities.',
      notes: ['Include training resources link']
    }
  ];

  return (
    <Card id="ta-sec-2-13" data-manual-anchor="ta-sec-2-13" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.13</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>7 min read</span>
        </div>
        <CardTitle className="text-2xl">Timekeeper Delegation</CardTitle>
        <CardDescription>
          Assigning time administrators, delegation scope, and approval authority
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Is Timekeeper Delegation?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Timekeeper delegation allows organizations to distribute time management 
                responsibilities. Instead of a single central administrator handling all 
                time corrections and approvals, designated timekeepers can manage their 
                assigned scope (department, location, or team). This reduces bottlenecks, 
                enables faster corrections, and puts decision-making closer to the work.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Timekeeper Assignment Interface"
          caption="Timekeeper delegation showing scope assignment and permission configuration"
        />

        {/* Delegation Model */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Timekeeper Delegation Model
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="font-medium">HR Time Admin</div>
                <div className="text-xs text-muted-foreground">Full system access</div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                  <UserCog className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <div className="font-medium text-sm">Sales Timekeeper</div>
                  <div className="text-xs text-muted-foreground">Sales Dept scope</div>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <UserCog className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="font-medium text-sm">Factory Timekeeper</div>
                  <div className="text-xs text-muted-foreground">Factory Location scope</div>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                  <UserCog className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <div className="font-medium text-sm">Field Timekeeper</div>
                  <div className="text-xs text-muted-foreground">Field Team scope</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="p-4 bg-muted border rounded-lg text-center">
                <UserCheck className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <div className="font-medium">Employees</div>
                <div className="text-xs text-muted-foreground">Managed by their timekeeper</div>
              </div>
            </div>
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={timekeeperAssignmentFields}
          title="timekeeper_assignments Table Fields"
        />

        {/* Permission Matrix */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Common Permission Profiles
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Profile</th>
                  <th className="text-center p-3 font-medium">View</th>
                  <th className="text-center p-3 font-medium">Edit</th>
                  <th className="text-center p-3 font-medium">Approve TS</th>
                  <th className="text-center p-3 font-medium">Approve OT</th>
                  <th className="text-center p-3 font-medium">Schedules</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { profile: 'Basic Timekeeper', view: '✓', edit: '✓', approve: '✓', ot: '—', schedule: '—' },
                  { profile: 'Senior Timekeeper', view: '✓', edit: '✓', approve: '✓', ot: '✓', schedule: '—' },
                  { profile: 'Scheduling Lead', view: '✓', edit: '—', approve: '—', ot: '—', schedule: '✓' },
                  { profile: 'Full Timekeeper', view: '✓', edit: '✓', approve: '✓', ot: '✓', schedule: '✓' },
                  { profile: 'View Only', view: '✓', edit: '—', approve: '—', ot: '—', schedule: '—' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.profile}</td>
                    <td className="p-3 text-center">{row.view}</td>
                    <td className="p-3 text-center">{row.edit}</td>
                    <td className="p-3 text-center">{row.approve}</td>
                    <td className="p-3 text-center">{row.ot}</td>
                    <td className="p-3 text-center">{row.schedule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Business Rules */}
        <BusinessRules rules={businessRules} />

        {/* Configuration Steps */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Step-by-Step Configuration
          </h3>
          <StepByStep steps={configurationSteps} />
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>Vacation Coverage:</strong> Use temporary delegation when a timekeeper goes 
          on leave. Create a time-bound assignment for their backup that automatically expires 
          when the primary timekeeper returns.
        </InfoCallout>

        {/* Warning */}
        <WarningCallout>
          <strong>Overlapping Assignments:</strong> When multiple timekeepers have overlapping 
          scope, any of them can approve records. This is useful for backup but can cause 
          confusion. Document primary vs. backup responsibilities clearly.
        </WarningCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Minimum Timekeepers:</strong> For business continuity, assign at least two 
          timekeepers per scope. This ensures time processing continues during individual 
          absences and distributes the workload.
        </TipCallout>
      </CardContent>
    </Card>
  );
}

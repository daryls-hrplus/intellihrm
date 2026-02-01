import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Users, GraduationCap, Link2, Settings,
  CheckCircle, ArrowRight
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationPolicyAssignments() {
  const learningObjectives = [
    'Assign attendance policies to individual employees or groups',
    'Configure policy inheritance hierarchy (location → department → job → employee)',
    'Override inherited policies for specific employees',
    'Understand effective policy resolution logic',
    'Audit policy assignments and changes'
  ];

  const policyAssignmentFields: FieldDefinition[] = [
    { name: 'assignment_id', required: true, type: 'uuid', description: 'Unique assignment record', defaultValue: 'Auto-generated', validation: 'UUID v4' },
    { name: 'policy_id', required: true, type: 'uuid', description: 'Attendance policy being assigned', defaultValue: '—', validation: 'Must reference valid policy' },
    { name: 'employee_id', required: false, type: 'uuid', description: 'Direct employee assignment', defaultValue: 'null', validation: 'Employee-level override' },
    { name: 'department_id', required: false, type: 'uuid', description: 'Department-level assignment', defaultValue: 'null', validation: 'All employees in department' },
    { name: 'location_id', required: false, type: 'uuid', description: 'Location-level assignment', defaultValue: 'null', validation: 'All employees at location' },
    { name: 'job_id', required: false, type: 'uuid', description: 'Job/position-level assignment', defaultValue: 'null', validation: 'All employees in job' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company for data isolation', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'priority', required: false, type: 'integer', description: 'Assignment priority (higher wins)', defaultValue: '0', validation: '0-100' },
    { name: 'effective_date', required: true, type: 'date', description: 'When assignment takes effect', defaultValue: 'now()', validation: 'Cannot be in the past' },
    { name: 'end_date', required: false, type: 'date', description: 'When assignment expires', defaultValue: 'null', validation: 'Must be after effective_date' },
    { name: 'assigned_by', required: false, type: 'uuid', description: 'User who created assignment', defaultValue: 'current_user', validation: 'Audit trail' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether assignment is in effect', defaultValue: 'true', validation: 'true/false' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Assignment Priority Resolution',
      enforcement: 'System',
      description: 'When multiple policies apply, the system uses priority order: Employee > Job > Department > Location > Company default. Higher priority number wins within the same level.'
    },
    {
      rule: 'Effective Dating',
      enforcement: 'System',
      description: 'Policy assignments only affect time entries on or after the effective_date. Historical data retains original policy.'
    },
    {
      rule: 'Single Active Policy',
      enforcement: 'System',
      description: 'Each employee has exactly one active policy at any point in time. The resolution logic determines which policy applies.'
    },
    {
      rule: 'Audit Trail Required',
      enforcement: 'Policy',
      description: 'All policy assignment changes are logged with who made the change and when for compliance auditing.'
    },
    {
      rule: 'Bulk Assignment Validation',
      enforcement: 'System',
      description: 'When assigning to department/location, system validates all affected employees and reports any conflicts.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Policy Assignments',
      description: 'Access the policy assignment screen from the T&A setup menu.',
      notes: ['Time & Attendance → Setup → Policy Assignments']
    },
    {
      title: 'Choose Assignment Level',
      description: 'Select whether to assign at company, location, department, job, or employee level.',
      notes: ['Start with broader levels, override at specific levels as needed']
    },
    {
      title: 'Select Target and Policy',
      description: 'Choose the target entity (e.g., "Sales Department") and the policy to assign.',
      notes: ['Preview affected employees before saving']
    },
    {
      title: 'Set Effective Date',
      description: 'Choose when the assignment takes effect. Defaults to immediate.',
      notes: ['Future-dated assignments appear in pending queue']
    },
    {
      title: 'Review and Confirm',
      description: 'Verify the assignment details and affected employee count before saving.',
      notes: ['System shows any override conflicts']
    },
    {
      title: 'Verify Employee Policies',
      description: 'Check individual employees to confirm the correct policy is now active.',
      notes: ['Use the "Effective Policy" column in employee list']
    }
  ];

  return (
    <Card id="ta-sec-2-3" data-manual-anchor="ta-sec-2-3" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>8 min read</span>
        </div>
        <CardTitle className="text-2xl">Policy Assignments</CardTitle>
        <CardDescription>
          Assigning attendance policies to employees, departments, locations, and job positions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">How Policy Assignment Works</h3>
              <p className="text-muted-foreground leading-relaxed">
                Policy assignment connects attendance policies (created in Section 2.2) to 
                employees. Instead of assigning policies one employee at a time, you can 
                assign at various organizational levels—company, location, department, or job. 
                The system uses inheritance to determine each employee's effective policy, 
                with more specific assignments overriding broader ones.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Policy Assignment Interface"
          caption="Policy assignment screen showing hierarchy levels and affected employees preview"
        />

        {/* Inheritance Hierarchy */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Policy Inheritance Hierarchy
          </h3>
          <div className="p-6 bg-muted/30 border rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="p-3 bg-muted border rounded-lg text-center min-w-[120px]">
                <div className="font-medium">Company Default</div>
                <div className="text-xs text-muted-foreground">Lowest priority</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center min-w-[120px]">
                <div className="font-medium">Location</div>
                <div className="text-xs text-muted-foreground">Overrides company</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center min-w-[120px]">
                <div className="font-medium">Department</div>
                <div className="text-xs text-muted-foreground">Overrides location</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center min-w-[120px]">
                <div className="font-medium">Job Position</div>
                <div className="text-xs text-muted-foreground">Overrides department</div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center min-w-[120px]">
                <div className="font-medium">Employee</div>
                <div className="text-xs text-muted-foreground">Highest priority</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              The most specific assignment always wins. Employee-level assignments override all inherited policies.
            </p>
          </div>
        </div>

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={policyAssignmentFields}
          title="employee_attendance_policies Table Fields"
        />

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

        {/* Assignment Examples */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Common Assignment Scenarios
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Scenario</th>
                  <th className="text-left p-3 font-medium">Assignment Level</th>
                  <th className="text-left p-3 font-medium">Policy</th>
                  <th className="text-left p-3 font-medium">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { scenario: 'All employees same policy', level: 'Company', policy: 'Standard Office', effect: 'Everyone uses same rules' },
                  { scenario: 'Factory vs. office', level: 'Location', policy: 'Factory Shift / Standard Office', effect: 'Location-specific rounding' },
                  { scenario: 'Executive flex time', level: 'Job', policy: 'Executive Flex', effect: 'Executives skip strict clock-in' },
                  { scenario: 'Single exception', level: 'Employee', policy: 'Custom Override', effect: 'One person different from team' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.scenario}</td>
                    <td className="p-3 text-muted-foreground">{row.level}</td>
                    <td className="p-3 text-muted-foreground">{row.policy}</td>
                    <td className="p-3 text-muted-foreground">{row.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <InfoCallout>
          <strong>Effective Policy View:</strong> Use the Employee Profile → Time & Attendance tab 
          to see which policy is currently active for any employee and how it was resolved 
          (inherited from which level or directly assigned).
        </InfoCallout>

        {/* Tip */}
        <TipCallout>
          <strong>Best Practice:</strong> Start with a company-wide default policy, then add 
          location or department overrides as needed. Use employee-level assignments sparingly—
          they create maintenance overhead and can be forgotten during reorganizations.
        </TipCallout>
      </CardContent>
    </Card>
  );
}

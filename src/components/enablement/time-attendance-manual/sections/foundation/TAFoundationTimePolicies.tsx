import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Settings, CheckCircle, GraduationCap,
  Timer, Shield, Scale, FileText
} from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  BusinessRules,
  TipCallout,
  ComplianceCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function TAFoundationTimePolicies() {
  const learningObjectives = [
    'Configure attendance policies with rounding and grace periods',
    'Set up overtime thresholds aligned with labor laws',
    'Define break policies and automatic deduction rules',
    'Configure early/late tolerance windows',
    'Assign policies to employee groups or locations'
  ];

  const attendancePolicyFields: FieldDefinition[] = [
    { name: 'policy_name', required: true, type: 'text', description: 'Unique policy identifier', defaultValue: '—', validation: 'Max 100 characters' },
    { name: 'company_id', required: true, type: 'uuid', description: 'Company this policy belongs to', defaultValue: '—', validation: 'Must reference valid company' },
    { name: 'rounding_method', required: true, type: 'enum', description: 'How clock punches are rounded', defaultValue: 'nearest', validation: 'nearest, up, down, none' },
    { name: 'rounding_interval_minutes', required: true, type: 'integer', description: 'Rounding increment in minutes', defaultValue: '15', validation: '1, 5, 6, 10, 15, 30' },
    { name: 'grace_period_minutes', required: false, type: 'integer', description: 'Minutes before marking late', defaultValue: '5', validation: '0-60 minutes' },
    { name: 'early_clock_in_minutes', required: false, type: 'integer', description: 'How early employees can clock in', defaultValue: '15', validation: '0-120 minutes' },
    { name: 'late_tolerance_minutes', required: false, type: 'integer', description: 'Late arrival tolerance before exception', defaultValue: '5', validation: '0-30 minutes' },
    { name: 'auto_clock_out_hours', required: false, type: 'decimal', description: 'Auto-terminate shift after hours', defaultValue: '12', validation: '1-24 hours' },
    { name: 'daily_ot_threshold_hours', required: false, type: 'decimal', description: 'Daily overtime threshold', defaultValue: '8', validation: '0-24 hours' },
    { name: 'weekly_ot_threshold_hours', required: false, type: 'decimal', description: 'Weekly overtime threshold', defaultValue: '40', validation: '0-168 hours' },
    { name: 'require_break_tracking', required: false, type: 'boolean', description: 'Whether breaks must be clocked', defaultValue: 'false', validation: 'true/false' },
    { name: 'auto_deduct_break_minutes', required: false, type: 'integer', description: 'Auto-deducted break time', defaultValue: '30', validation: '0-120 minutes' },
    { name: 'break_deduct_after_hours', required: false, type: 'decimal', description: 'Apply break deduction after X hours', defaultValue: '6', validation: '0-12 hours' },
    { name: 'is_default', required: false, type: 'boolean', description: 'Default policy for new employees', defaultValue: 'false', validation: 'One per company' },
    { name: 'is_active', required: false, type: 'boolean', description: 'Whether policy is currently active', defaultValue: 'true', validation: 'true/false' }
  ];

  const businessRules: BusinessRule[] = [
    {
      rule: 'Rounding Neutrality',
      enforcement: 'System',
      description: 'Rounding rules must be applied consistently to both clock-in and clock-out times. Labor law requires rounding to be neutral over time.'
    },
    {
      rule: 'Grace Period Application',
      enforcement: 'System',
      description: 'Grace period only applies to clock-in time. Clock-out rounding is applied independently.'
    },
    {
      rule: 'Overtime Threshold Calculation',
      enforcement: 'System',
      description: 'Daily overtime is calculated before weekly overtime. Hours that qualify for daily OT are counted toward weekly regular hours.'
    },
    {
      rule: 'Break Auto-Deduction',
      enforcement: 'Policy',
      description: 'Automatic break deduction only applies when breaks are not tracked. If require_break_tracking is enabled, actual break time is used.'
    },
    {
      rule: 'Policy Effective Dating',
      enforcement: 'System',
      description: 'Policy changes only affect future time entries. Historical records retain the policy rules in effect at the time of the punch.'
    }
  ];

  const configurationSteps = [
    {
      title: 'Navigate to Attendance Policies',
      description: 'Access the policy configuration from the Time & Attendance setup menu.',
      notes: ['Time & Attendance → Setup → Attendance Policies']
    },
    {
      title: 'Create New Policy',
      description: 'Click "Add Policy" and enter a descriptive name (e.g., "Standard Office Hours", "Shift Workers", "Field Staff").',
      notes: ['Use clear naming that indicates the target employee group']
    },
    {
      title: 'Configure Rounding Rules',
      description: 'Select the rounding method and interval. "Nearest 15" is most common for compliance.',
      notes: ['Consult with legal/HR for jurisdiction-specific requirements']
    },
    {
      title: 'Set Overtime Thresholds',
      description: 'Define daily and weekly overtime hours based on local labor law. Caribbean/African jurisdictions vary.',
      notes: ['Daily: 8-10 hours typical', 'Weekly: 40-48 hours typical']
    },
    {
      title: 'Configure Break Rules',
      description: 'Choose between tracked breaks (employees clock in/out) or automatic deduction.',
      notes: ['Auto-deduction is simpler but less accurate for compliance audits']
    },
    {
      title: 'Assign to Employees',
      description: 'Associate the policy with specific locations, departments, or employee groups.',
      notes: ['Employees inherit policy from their primary assignment']
    }
  ];

  return (
    <Card id="ta-sec-2-2" data-manual-anchor="ta-sec-2-2" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 2.2</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">Time Policies Configuration</CardTitle>
        <CardDescription>
          Rounding rules, grace periods, overtime thresholds, and break policies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Learning Objectives */}
        <LearningObjectives objectives={learningObjectives} />

        {/* Conceptual Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">What Are Attendance Policies?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Attendance policies define the rules for how clock punches are processed, including 
                rounding intervals, grace periods for late arrivals, overtime calculations, and break 
                deductions. Each employee is assigned to one policy, which governs all their time 
                entries. Policies ensure consistent treatment of time data across the organization 
                while allowing flexibility for different work arrangements.
              </p>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <ScreenshotPlaceholder
          alt="Attendance Policy Configuration Screen"
          caption="Attendance policy setup showing rounding, overtime, and break configuration options"
        />

        {/* Field Reference Table */}
        <FieldReferenceTable 
          fields={attendancePolicyFields}
          title="attendance_policies Table Fields"
        />

        {/* Rounding Methods Explained */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Rounding Methods Explained
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                method: 'Nearest',
                description: 'Rounds to the closest interval. 8:07 → 8:00, 8:08 → 8:15',
                useCase: 'Most balanced approach, commonly used for compliance',
                color: 'green'
              },
              {
                method: 'Up (Always Round Up)',
                description: 'Always rounds up. 8:01 → 8:15. Favors employees.',
                useCase: 'Generous policy, may increase labor costs',
                color: 'blue'
              },
              {
                method: 'Down (Always Round Down)',
                description: 'Always rounds down. 8:14 → 8:00. Favors employer.',
                useCase: 'Not recommended - may violate labor laws',
                color: 'amber'
              },
              {
                method: 'None',
                description: 'No rounding - exact punch times used.',
                useCase: 'Most accurate, but creates complex calculations',
                color: 'purple'
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">{item.method}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <p className="text-xs text-muted-foreground italic">Use case: {item.useCase}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Warning */}
        <ComplianceCallout>
          <strong>Labor Law Compliance:</strong> Many jurisdictions require that rounding policies 
          be "neutral" over time—neither systematically favoring nor penalizing employees. The 
          "Nearest" rounding method is generally safest for compliance. Consult local labor law 
          before implementing "Up" or "Down" rounding.
        </ComplianceCallout>

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

        {/* Policy Assignment Hierarchy */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Policy Assignment Hierarchy
          </h3>
          <div className="p-4 bg-muted/30 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-4">
              When multiple policies could apply, the system uses this priority order:
            </p>
            <ol className="space-y-2">
              {[
                { level: '1st', source: 'Employee-specific override', desc: 'Directly assigned to the employee' },
                { level: '2nd', source: 'Job position policy', desc: 'Linked to the employee\'s job/position' },
                { level: '3rd', source: 'Department policy', desc: 'Inherited from department assignment' },
                { level: '4th', source: 'Location policy', desc: 'Inherited from primary work location' },
                { level: '5th', source: 'Company default', desc: 'Default policy marked is_default=true' }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0">{item.level}</Badge>
                  <div>
                    <span className="font-medium">{item.source}</span>
                    <span className="text-muted-foreground ml-1">– {item.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Tip */}
        <TipCallout>
          <strong>Best Practice:</strong> Create separate policies for distinct work patterns 
          (office vs. field staff, shift vs. flex workers). This makes it easier to maintain 
          compliance and audit time calculations by employee type.
        </TipCallout>

        {/* Common Configurations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Common Policy Configurations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Policy Type</th>
                  <th className="text-left p-3 font-medium">Rounding</th>
                  <th className="text-left p-3 font-medium">Grace</th>
                  <th className="text-left p-3 font-medium">Daily OT</th>
                  <th className="text-left p-3 font-medium">Weekly OT</th>
                  <th className="text-left p-3 font-medium">Break</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { type: 'Standard Office', rounding: 'Nearest 15', grace: '5 min', daily: '8 hrs', weekly: '40 hrs', break: 'Auto 30 min' },
                  { type: 'Factory Shift', rounding: 'Nearest 6', grace: '3 min', daily: '8 hrs', weekly: '40 hrs', break: 'Tracked' },
                  { type: 'Field Staff', rounding: 'None', grace: '15 min', daily: '10 hrs', weekly: '40 hrs', break: 'Auto 60 min' },
                  { type: 'Flex Workers', rounding: 'Nearest 15', grace: '30 min', daily: 'None', weekly: '40 hrs', break: 'None' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.type}</td>
                    <td className="p-3 text-muted-foreground">{row.rounding}</td>
                    <td className="p-3 text-muted-foreground">{row.grace}</td>
                    <td className="p-3 text-muted-foreground">{row.daily}</td>
                    <td className="p-3 text-muted-foreground">{row.weekly}</td>
                    <td className="p-3 text-muted-foreground">{row.break}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Bell, Users, Building2 } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndSetupCompliance() {
  const learningObjectives = [
    'Configure mandatory training rules for compliance requirements',
    'Set up recertification periods and reminders',
    'Target training by department, position, or employee group',
    'Manage compliance assignments and exemptions'
  ];

  const complianceFields: FieldDefinition[] = [
    {
      name: 'company_id',
      required: true,
      type: 'uuid',
      description: 'Company scope for compliance rule'
    },
    {
      name: 'name',
      required: true,
      type: 'text',
      description: 'Compliance rule name for identification',
      validation: '3-200 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Rule description explaining requirement basis',
      validation: 'Maximum 1000 characters'
    },
    {
      name: 'course_id',
      required: true,
      type: 'uuid',
      description: 'Reference to required course'
    },
    {
      name: 'is_mandatory',
      required: true,
      type: 'boolean',
      description: 'Enforced completion requirement',
      defaultValue: 'true'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Rule active status',
      defaultValue: 'true'
    },
    {
      name: 'frequency_months',
      required: false,
      type: 'number',
      description: 'Recertification period in months (null = one-time)',
      validation: 'Integer > 0'
    },
    {
      name: 'grace_period_days',
      required: false,
      type: 'number',
      description: 'Days allowed after due date before escalation',
      defaultValue: '30',
      validation: 'Integer >= 0'
    },
    {
      name: 'reminder_days_before',
      required: false,
      type: 'number',
      description: 'Days before due date to send reminder',
      defaultValue: '14',
      validation: 'Integer > 0'
    },
    {
      name: 'applies_to_all',
      required: false,
      type: 'boolean',
      description: 'Apply to all employees in company',
      defaultValue: 'false'
    },
    {
      name: 'target_departments',
      required: false,
      type: 'uuid[]',
      description: 'Specific departments (if not applies_to_all)',
      defaultValue: '[]'
    },
    {
      name: 'target_positions',
      required: false,
      type: 'uuid[]',
      description: 'Specific positions/job titles (if not applies_to_all)',
      defaultValue: '[]'
    },
    {
      name: 'effective_date',
      required: false,
      type: 'date',
      description: 'Date rule becomes active',
      defaultValue: 'Current date'
    },
    {
      name: 'expiry_date',
      required: false,
      type: 'date',
      description: 'Date rule expires (null = no expiry)'
    }
  ];

  const commonComplianceRules = [
    {
      rule: 'Safety Training',
      frequency: 'Annual (12 months)',
      target: 'All employees',
      regulation: 'OSHA, local safety laws',
      grace: '30 days'
    },
    {
      rule: 'Data Privacy (GDPR)',
      frequency: 'Every 2 years (24 months)',
      target: 'All employees handling personal data',
      regulation: 'GDPR, data protection laws',
      grace: '14 days'
    },
    {
      rule: 'Anti-Harassment',
      frequency: 'Annual (12 months)',
      target: 'All employees',
      regulation: 'Employment law, company policy',
      grace: '30 days'
    },
    {
      rule: 'Anti-Money Laundering',
      frequency: 'Annual (12 months)',
      target: 'Finance, compliance teams',
      regulation: 'Financial regulations',
      grace: '14 days'
    },
    {
      rule: 'Fire Safety',
      frequency: 'Annual (12 months)',
      target: 'All employees',
      regulation: 'Fire safety regulations',
      grace: '30 days'
    }
  ];

  const createRuleSteps: Step[] = [
    {
      title: 'Navigate to Compliance Management',
      description: 'Go to Training → Compliance from the main navigation.',
      expectedResult: 'Compliance rules list displays'
    },
    {
      title: 'Click Create Compliance Rule',
      description: 'Click "Add Rule" to create a new compliance requirement.',
      expectedResult: 'Rule creation form opens'
    },
    {
      title: 'Enter Rule Name',
      description: 'Create a clear, descriptive name for the compliance rule.',
      substeps: [
        '"Annual Safety Training Requirement"',
        '"GDPR Data Protection Certification"',
        '"Mandatory Anti-Harassment Training"'
      ]
    },
    {
      title: 'Add Description',
      description: 'Explain the regulatory or policy basis for this requirement.',
      notes: ['Reference specific regulations or company policies']
    },
    {
      title: 'Select Required Course',
      description: 'Choose the course that satisfies this compliance requirement.',
      expectedResult: 'Course linked to compliance rule'
    },
    {
      title: 'Configure Recertification',
      description: 'Set the frequency for required recertification.',
      substeps: [
        'Annual: 12 months',
        'Bi-annual: 24 months',
        'One-time: Leave frequency_months empty'
      ]
    },
    {
      title: 'Set Grace Period',
      description: 'Configure days allowed after due date before escalation.',
      notes: [
        '30 days typical for annual training',
        '14 days for critical compliance',
        '0 days for zero-tolerance requirements'
      ]
    },
    {
      title: 'Configure Reminders',
      description: 'Set when reminders are sent before due date.',
      substeps: [
        'First reminder: 30 days before',
        'Second reminder: 14 days before',
        'Final reminder: 7 days before'
      ]
    },
    {
      title: 'Define Target Audience',
      description: 'Specify who must complete this training.',
      substeps: [
        'All employees: Enable applies_to_all',
        'Specific departments: Select target_departments',
        'Specific positions: Select target_positions',
        'Combination: Use both department and position filters'
      ]
    },
    {
      title: 'Set Effective Date',
      description: 'Configure when the rule becomes active.',
      notes: ['Allow time for initial assignments to be created']
    },
    {
      title: 'Save and Activate',
      description: 'Save the rule with is_active = true to begin assignments.',
      expectedResult: 'Rule active, assignments created for matching employees'
    }
  ];

  const ruleExamples: ExampleConfig[] = [
    {
      title: 'Annual Safety Training',
      context: 'OSHA-mandated safety training for all employees',
      values: [
        { field: 'Name', value: 'Annual Workplace Safety Training' },
        { field: 'Course', value: 'Workplace Safety Fundamentals' },
        { field: 'Frequency', value: '12 months' },
        { field: 'Grace Period', value: '30 days' },
        { field: 'Reminder', value: '14 days before' },
        { field: 'Target', value: 'All employees' }
      ],
      outcome: 'All employees assigned annually, reminders sent 14 days before due'
    },
    {
      title: 'GDPR for IT Staff',
      context: 'Data protection training for employees with system access',
      values: [
        { field: 'Name', value: 'GDPR Data Protection Certification' },
        { field: 'Course', value: 'GDPR Compliance Training' },
        { field: 'Frequency', value: '24 months' },
        { field: 'Grace Period', value: '14 days' },
        { field: 'Reminder', value: '30 days before' },
        { field: 'Target', value: 'IT Department' }
      ],
      outcome: 'IT staff recertified every 2 years with strict grace period'
    },
    {
      title: 'Manager Anti-Harassment',
      context: 'Enhanced training for people managers',
      values: [
        { field: 'Name', value: 'Manager Anti-Harassment Training' },
        { field: 'Course', value: 'Preventing Workplace Harassment (Managers)' },
        { field: 'Frequency', value: '12 months' },
        { field: 'Grace Period', value: '14 days' },
        { field: 'Reminder', value: '21 days before' },
        { field: 'Target', value: 'Manager positions' }
      ],
      outcome: 'All managers complete enhanced training annually'
    }
  ];

  const complianceRules: BusinessRule[] = [
    {
      rule: 'Assignments auto-created for matching employees',
      enforcement: 'System',
      description: 'When rule activates, assignments are created for all employees matching target criteria.'
    },
    {
      rule: 'New employees receive applicable assignments',
      enforcement: 'System',
      description: 'Employees added to target departments/positions automatically receive pending assignments.'
    },
    {
      rule: 'Completion resets recertification clock',
      enforcement: 'System',
      description: 'Successful course completion sets next due date based on frequency_months from completion date.'
    },
    {
      rule: 'Grace period expiry triggers escalation',
      enforcement: 'System',
      description: 'Overdue assignments (past grace period) flagged for manager and HR escalation.'
    },
    {
      rule: 'Exemptions require documented approval',
      enforcement: 'Policy',
      description: 'Employees may be exempted from specific rules with documented reason and approval.'
    },
    {
      rule: 'Inactive rules stop new assignments',
      enforcement: 'System',
      description: 'Deactivating a rule stops new assignments but existing pending assignments remain.'
    }
  ];

  return (
    <section id="sec-2-8" data-manual-anchor="sec-2-8" className="space-y-6">
      <h2 className="text-2xl font-bold">2.8 Compliance Training Rules</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Compliance training rules automate mandatory training assignments based on regulatory 
        requirements, company policies, and role-specific needs. Rules handle assignment 
        creation, recertification scheduling, reminders, and escalation for overdue training.
      </p>

      <WarningCallout title="Regulatory Responsibility">
        Compliance training rules help automate regulatory requirements but do not replace 
        legal review. Consult with legal/compliance teams to verify training frequencies, 
        grace periods, and audience targeting meet all applicable regulations.
      </WarningCallout>

      {/* Common Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Common Compliance Training Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Training</TableHead>
                  <TableHead className="font-medium">Frequency</TableHead>
                  <TableHead className="font-medium">Target Audience</TableHead>
                  <TableHead className="font-medium">Regulation Basis</TableHead>
                  <TableHead className="font-medium">Grace Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commonComplianceRules.map((rule, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rule.rule}</TableCell>
                    <TableCell>{rule.frequency}</TableCell>
                    <TableCell className="text-sm">{rule.target}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{rule.regulation}</TableCell>
                    <TableCell>{rule.grace}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={complianceFields} 
        title="compliance_training Table Schema" 
      />

      {/* Assignment Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Compliance Assignment Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-2 text-sm">
            <div className="p-3 border rounded-lg text-center">
              <Badge variant="secondary">Assigned</Badge>
              <div className="text-xs text-muted-foreground mt-2">
                Rule creates assignment
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Badge variant="outline">Reminder</Badge>
              <div className="text-xs text-muted-foreground mt-2">
                Notifications sent
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Badge variant="destructive">Due</Badge>
              <div className="text-xs text-muted-foreground mt-2">
                Deadline reached
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Badge variant="destructive">Overdue</Badge>
              <div className="text-xs text-muted-foreground mt-2">
                Grace period active
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-green-50 dark:bg-green-950/20">
              <Badge className="bg-green-600">Complete</Badge>
              <div className="text-xs text-muted-foreground mt-2">
                Next cycle scheduled
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={createRuleSteps} 
        title="Creating a Compliance Rule" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.8.1: Compliance Rule Configuration"
        alt="Compliance rule creation form with targeting options"
      />

      <ConfigurationExample 
        examples={ruleExamples}
        title="Compliance Rule Examples"
      />

      <BusinessRules 
        rules={complianceRules}
        title="Compliance Rule Business Rules"
      />

      <TipCallout title="Compliance Management Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Start reminders early (30 days) for busy employees</li>
          <li>• Use reasonable grace periods — too short causes escalation fatigue</li>
          <li>• Review compliance reports monthly for trends</li>
          <li>• Document exemptions with clear business justification</li>
          <li>• Test new rules with a pilot group before company-wide rollout</li>
          <li>• Coordinate with HR on escalation procedures</li>
        </ul>
      </TipCallout>
    </section>
  );
}

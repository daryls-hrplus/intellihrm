import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Building2, Mail, Phone } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function LndSetupInstructors() {
  const learningObjectives = [
    'Register internal and external instructors',
    'Configure instructor profiles and specializations',
    'Set up hourly rates for budget tracking',
    'Manage instructor availability and assignments'
  ];

  const instructorFields: FieldDefinition[] = [
    {
      name: 'company_id',
      required: true,
      type: 'uuid',
      description: 'Company association for instructor'
    },
    {
      name: 'name',
      required: true,
      type: 'text',
      description: 'Full name of instructor',
      validation: '2-200 characters'
    },
    {
      name: 'instructor_type',
      required: true,
      type: 'enum',
      description: 'Internal employee or external contractor',
      defaultValue: 'internal',
      validation: 'internal or external'
    },
    {
      name: 'employee_id',
      required: false,
      type: 'uuid',
      description: 'Link to employee profile (for internal instructors)'
    },
    {
      name: 'email',
      required: false,
      type: 'email',
      description: 'Contact email address',
      validation: 'Valid email format'
    },
    {
      name: 'phone',
      required: false,
      type: 'text',
      description: 'Contact phone number'
    },
    {
      name: 'bio',
      required: false,
      type: 'text',
      description: 'Instructor biography and credentials',
      validation: 'Maximum 2000 characters'
    },
    {
      name: 'specializations',
      required: false,
      type: 'text[]',
      description: 'Areas of expertise and certifications',
      defaultValue: '[]'
    },
    {
      name: 'hourly_rate',
      required: false,
      type: 'number',
      description: 'Cost per hour for budget tracking',
      validation: 'Decimal >= 0'
    },
    {
      name: 'currency',
      required: false,
      type: 'text',
      description: 'Currency for hourly rate',
      defaultValue: 'USD'
    },
    {
      name: 'max_hours_per_week',
      required: false,
      type: 'number',
      description: 'Maximum available hours per week',
      validation: 'Integer > 0'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Instructor availability status',
      defaultValue: 'true'
    }
  ];

  const createInstructorSteps: Step[] = [
    {
      title: 'Navigate to Instructor Management',
      description: 'Go to Training → Instructors from the main navigation.',
      expectedResult: 'Instructor list displays'
    },
    {
      title: 'Click Add Instructor',
      description: 'Click "Add Instructor" to create a new instructor profile.',
      expectedResult: 'Instructor creation form opens'
    },
    {
      title: 'Select Instructor Type',
      description: 'Choose whether instructor is internal employee or external contractor.',
      notes: [
        'Internal: Existing employee who also delivers training',
        'External: Consultant, vendor, or contractor'
      ]
    },
    {
      title: 'Enter Name',
      description: 'Enter the instructor\'s full name.',
      expectedResult: 'Name field populated'
    },
    {
      title: 'Link Employee (Internal)',
      description: 'For internal instructors, link to their employee profile.',
      notes: ['Enables automatic contact info sync and reporting'],
      expectedResult: 'Employee linked, contact info auto-populated'
    },
    {
      title: 'Add Contact Information',
      description: 'Enter email and phone for communication.',
      substeps: [
        'Email for scheduling and notifications',
        'Phone for urgent coordination'
      ]
    },
    {
      title: 'Write Biography',
      description: 'Add instructor credentials, experience, and teaching style.',
      notes: ['Bio displayed to learners for instructor-led sessions']
    },
    {
      title: 'Add Specializations',
      description: 'Tag expertise areas for matching to courses.',
      substeps: [
        'Technical skills: "Excel", "Python", "Project Management"',
        'Soft skills: "Leadership", "Communication", "Team Building"',
        'Certifications: "PMP", "SHRM", "Six Sigma"'
      ]
    },
    {
      title: 'Set Hourly Rate',
      description: 'Configure cost rate for budget tracking.',
      notes: [
        'Internal: May use loaded cost or $0',
        'External: Contract or market rate'
      ]
    },
    {
      title: 'Save Instructor',
      description: 'Save the instructor profile.',
      expectedResult: 'Instructor available for session assignments'
    }
  ];

  const instructorExamples: ExampleConfig[] = [
    {
      title: 'Internal Subject Matter Expert',
      context: 'Senior employee who delivers technical training',
      values: [
        { field: 'Type', value: 'internal' },
        { field: 'Name', value: 'Sarah Johnson' },
        { field: 'Employee Link', value: 'Linked to employee profile' },
        { field: 'Specializations', value: 'Excel, Data Analysis, Financial Modeling' },
        { field: 'Hourly Rate', value: '$0 (internal cost)' },
        { field: 'Max Hours/Week', value: '8 hours' }
      ],
      outcome: 'Internal expert available for up to 8 hours weekly training'
    },
    {
      title: 'External Leadership Consultant',
      context: 'Contractor providing executive coaching and leadership workshops',
      values: [
        { field: 'Type', value: 'external' },
        { field: 'Name', value: 'Dr. Michael Chen' },
        { field: 'Email', value: 'mchen@consultingfirm.com' },
        { field: 'Specializations', value: 'Leadership, Executive Coaching, Change Management' },
        { field: 'Hourly Rate', value: '$250 USD' },
        { field: 'Max Hours/Week', value: '20 hours' }
      ],
      outcome: 'External consultant with tracked costs for budget management'
    }
  ];

  const instructorRules: BusinessRule[] = [
    {
      rule: 'Internal instructors should link to employee',
      enforcement: 'Advisory',
      description: 'Linking enables automatic contact sync and consolidated reporting.'
    },
    {
      rule: 'Hourly rate used for budget calculations',
      enforcement: 'System',
      description: 'Session costs calculated as hours × hourly_rate and applied to training budgets.'
    },
    {
      rule: 'Inactive instructors excluded from assignments',
      enforcement: 'System',
      description: 'Instructors with is_active = false cannot be assigned to new sessions.'
    },
    {
      rule: 'Specializations enable smart matching',
      enforcement: 'Advisory',
      description: 'Well-tagged specializations help match instructors to appropriate courses.'
    }
  ];

  return (
    <section id="sec-2-9" data-manual-anchor="sec-2-9" className="space-y-6">
      <h2 className="text-2xl font-bold">2.9 Instructors</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Instructor management enables tracking of both internal subject matter experts and 
        external training providers. Instructor profiles support session assignment, 
        capacity planning, and cost tracking for budget management.
      </p>

      {/* Instructor Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Instructor Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Internal Instructors</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Existing employees with teaching duties</li>
                <li>• Subject matter experts sharing knowledge</li>
                <li>• Managers conducting team training</li>
                <li>• Can link to employee profile</li>
                <li>• Often $0 hourly rate (internal cost)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold">External Instructors</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Professional trainers and consultants</li>
                <li>• Vendor-provided training specialists</li>
                <li>• Contractors for specialized topics</li>
                <li>• Independent contact information</li>
                <li>• Hourly rate for budget tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={instructorFields} 
        title="training_instructors Table Schema" 
      />

      <StepByStep 
        steps={createInstructorSteps} 
        title="Adding an Instructor" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.9.1: Instructor Profile Management"
        alt="Instructor creation form with specializations and rate configuration"
      />

      <ConfigurationExample 
        examples={instructorExamples}
        title="Instructor Configuration Examples"
      />

      <BusinessRules 
        rules={instructorRules}
        title="Instructor Management Business Rules"
      />

      <TipCallout title="Instructor Management Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Keep specialization tags consistent across instructors</li>
          <li>• Update availability regularly for accurate capacity planning</li>
          <li>• Document certifications in bio for learner confidence</li>
          <li>• Set realistic max hours to prevent over-assignment</li>
          <li>• Review instructor feedback to identify top performers</li>
        </ul>
      </TipCallout>
    </section>
  );
}

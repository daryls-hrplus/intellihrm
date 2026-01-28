import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, ArrowRight, CheckCircle } from 'lucide-react';
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

export function LndSetupLearningPaths() {
  const learningObjectives = [
    'Create structured learning journeys for role-based development',
    'Configure course sequences with prerequisites',
    'Set up mandatory vs. optional path courses',
    'Manage path enrollments and progress tracking'
  ];

  const pathFields: FieldDefinition[] = [
    {
      name: 'code',
      required: true,
      type: 'text',
      description: 'Unique learning path identifier',
      validation: '2-50 characters, alphanumeric with hyphens'
    },
    {
      name: 'name',
      required: true,
      type: 'text',
      description: 'Path display name shown to learners',
      validation: '3-200 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Path overview, objectives, and target audience',
      validation: 'Maximum 2000 characters'
    },
    {
      name: 'company_id',
      required: true,
      type: 'uuid',
      description: 'Company association for the learning path'
    },
    {
      name: 'estimated_duration_hours',
      required: false,
      type: 'number',
      description: 'Total estimated hours to complete all courses',
      validation: 'Decimal > 0'
    },
    {
      name: 'target_audience',
      required: false,
      type: 'text',
      description: 'Description of intended learners (roles, levels)',
      validation: 'Maximum 500 characters'
    },
    {
      name: 'thumbnail_url',
      required: false,
      type: 'url',
      description: 'Path card image for catalog display'
    },
    {
      name: 'is_mandatory',
      required: false,
      type: 'boolean',
      description: 'Marks path as required for assigned employees',
      defaultValue: 'false'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Controls path visibility in catalog',
      defaultValue: 'true'
    }
  ];

  const pathCourseFields: FieldDefinition[] = [
    {
      name: 'learning_path_id',
      required: true,
      type: 'uuid',
      description: 'Reference to parent learning path'
    },
    {
      name: 'course_id',
      required: true,
      type: 'uuid',
      description: 'Reference to course in the path'
    },
    {
      name: 'sequence_order',
      required: true,
      type: 'number',
      description: 'Position of course in the learning path',
      validation: 'Integer >= 0'
    },
    {
      name: 'is_required',
      required: false,
      type: 'boolean',
      description: 'Whether course must be completed for path completion',
      defaultValue: 'true'
    }
  ];

  const createPathSteps: Step[] = [
    {
      title: 'Navigate to Learning Paths',
      description: 'Go to Training → Learning Paths from the main navigation.',
      expectedResult: 'Learning paths list displays'
    },
    {
      title: 'Click Create Learning Path',
      description: 'Click the "Create Path" button to start a new learning path.',
      expectedResult: 'Path creation form opens'
    },
    {
      title: 'Enter Path Code',
      description: 'Create a unique identifier for reporting and tracking.',
      substeps: [
        'Use role-based prefixes: MGR-PATH, SALES-PATH, IT-PATH',
        'Include level indicators: ONBOARD, ADVANCED, EXPERT'
      ]
    },
    {
      title: 'Enter Path Name',
      description: 'Write a descriptive name that communicates the learning journey.',
      substeps: [
        '"New Manager Development Program"',
        '"IT Security Specialist Track"',
        '"Sales Excellence Pathway"'
      ]
    },
    {
      title: 'Write Description',
      description: 'Explain the path objectives, outcomes, and who should enroll.',
      notes: ['Include time commitment and prerequisites if applicable']
    },
    {
      title: 'Set Target Audience',
      description: 'Specify the intended learner profile.',
      substeps: [
        'Job levels (Junior, Senior, Manager)',
        'Departments or functions',
        'Career aspirations or goals'
      ]
    },
    {
      title: 'Estimate Total Duration',
      description: 'Calculate total hours from all included courses.',
      notes: ['Sum of all course durations plus 10-20% buffer']
    },
    {
      title: 'Save Path',
      description: 'Save the path before adding courses.',
      expectedResult: 'Path created, ready for course assignment'
    },
    {
      title: 'Add Courses to Path',
      description: 'Click "Manage Courses" to add courses in sequence.',
      substeps: [
        'Select courses from available list',
        'Set sequence order (1, 2, 3...)',
        'Mark required vs. optional courses'
      ],
      expectedResult: 'Courses appear in path outline'
    },
    {
      title: 'Review and Activate',
      description: 'Review the complete path and set is_active = true.',
      expectedResult: 'Path appears in catalog for enrollment'
    }
  ];

  const pathExamples: ExampleConfig[] = [
    {
      title: 'New Manager Development',
      context: 'Structured program for employees transitioning to management roles',
      values: [
        { field: 'Code', value: 'MGR-DEV-001' },
        { field: 'Name', value: 'New Manager Development Program' },
        { field: 'Duration', value: '12 hours' },
        { field: 'Target Audience', value: 'Newly promoted or aspiring managers' },
        { field: 'Courses', value: '4 required + 2 optional' }
      ],
      outcome: 'Clear pathway for management transition with measurable milestones'
    },
    {
      title: 'IT Security Certification Track',
      context: 'Technical certification pathway for IT security professionals',
      values: [
        { field: 'Code', value: 'IT-SEC-CERT' },
        { field: 'Name', value: 'IT Security Specialist Certification' },
        { field: 'Duration', value: '20 hours' },
        { field: 'Target Audience', value: 'IT professionals in security roles' },
        { field: 'Courses', value: '6 required courses' }
      ],
      outcome: 'Formal certification pathway with progressive skill building'
    },
    {
      title: 'Sales Onboarding Journey',
      context: 'Complete onboarding program for new sales team members',
      values: [
        { field: 'Code', value: 'SALES-ONBOARD' },
        { field: 'Name', value: 'Sales Team Onboarding' },
        { field: 'Duration', value: '8 hours' },
        { field: 'Target Audience', value: 'New sales hires' },
        { field: 'Courses', value: '5 required courses' },
        { field: 'Mandatory', value: 'true' }
      ],
      outcome: 'Structured onboarding ensuring consistent sales training'
    }
  ];

  const pathRules: BusinessRule[] = [
    {
      rule: 'Path completion requires all required courses',
      enforcement: 'System',
      description: 'Learners must complete all courses marked is_required = true to achieve path completion status.'
    },
    {
      rule: 'Course sequence is advisory only',
      enforcement: 'Advisory',
      description: 'Sequence order suggests progression but does not enforce prerequisites. Use course-level prerequisites for strict ordering.'
    },
    {
      rule: 'Path enrollment auto-enrolls in courses',
      enforcement: 'System',
      description: 'When a learner enrolls in a path, they are automatically enrolled in all path courses.'
    },
    {
      rule: 'Inactive paths hide from catalog',
      enforcement: 'System',
      description: 'Paths with is_active = false are hidden from learner catalog but existing enrollments continue.'
    },
    {
      rule: 'Path duration should match course total',
      enforcement: 'Policy',
      description: 'Keep estimated_duration_hours accurate by summing course durations. Inaccurate estimates frustrate learners.'
    }
  ];

  return (
    <section id="sec-2-6" data-manual-anchor="sec-2-6" className="space-y-6">
      <h2 className="text-2xl font-bold">2.6 Learning Paths</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Learning paths group related courses into structured journeys that guide learners 
        through progressive skill development. Paths are ideal for role-based training, 
        certification programs, and comprehensive onboarding experiences.
      </p>

      {/* Path Structure Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Learning Path Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-3 border rounded-lg bg-muted/50 text-center">
              <div className="text-sm font-medium">Course 1</div>
              <div className="text-xs text-muted-foreground">Foundation</div>
              <Badge variant="destructive" className="text-xs mt-1">Required</Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg bg-muted/50 text-center">
              <div className="text-sm font-medium">Course 2</div>
              <div className="text-xs text-muted-foreground">Core Skills</div>
              <Badge variant="destructive" className="text-xs mt-1">Required</Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg bg-muted/50 text-center">
              <div className="text-sm font-medium">Course 3</div>
              <div className="text-xs text-muted-foreground">Advanced</div>
              <Badge variant="destructive" className="text-xs mt-1">Required</Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg bg-muted/50 text-center">
              <div className="text-sm font-medium">Course 4</div>
              <div className="text-xs text-muted-foreground">Elective</div>
              <Badge variant="secondary" className="text-xs mt-1">Optional</Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg bg-green-100 dark:bg-green-950 text-center">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
              <div className="text-sm font-medium text-green-700 dark:text-green-400">Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={pathFields} 
        title="learning_paths Table Schema" 
      />

      <FieldReferenceTable 
        fields={pathCourseFields} 
        title="learning_path_courses Table Schema" 
      />

      <StepByStep 
        steps={createPathSteps} 
        title="Creating a Learning Path" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.6.1: Learning Path Configuration"
        alt="Learning path builder showing course sequence and settings"
      />

      <ConfigurationExample 
        examples={pathExamples}
        title="Learning Path Examples"
      />

      <BusinessRules 
        rules={pathRules}
        title="Learning Path Business Rules"
      />

      <TipCallout title="Learning Path Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Limit paths to 4-8 courses for optimal completion rates</li>
          <li>• Mark 60-80% of courses as required; leave room for electives</li>
          <li>• Start with foundational content and progress to advanced topics</li>
          <li>• Include a final assessment or capstone project</li>
          <li>• Provide certificates upon path completion for recognition</li>
          <li>• Review path completion data quarterly to optimize content</li>
        </ul>
      </TipCallout>
    </section>
  );
}

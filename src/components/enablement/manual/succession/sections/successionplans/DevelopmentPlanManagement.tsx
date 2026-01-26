import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  GraduationCap, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  Plus,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';

export function DevelopmentPlanManagement() {
  const developmentPlanFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'candidate_id', required: true, type: 'UUID', description: 'Reference to succession candidate', validation: 'Must be valid candidate' },
    { name: 'title', required: true, type: 'Text', description: 'Development activity title', validation: 'Required, max 200 chars' },
    { name: 'description', required: false, type: 'Text', description: 'Detailed description of the activity' },
    { name: 'development_type', required: true, type: 'Text', description: 'Category of development activity', defaultValue: 'training', validation: 'training, project, mentoring, assignment, other' },
    { name: 'target_date', required: false, type: 'Date', description: 'Target completion date' },
    { name: 'completion_date', required: false, type: 'Date', description: 'Actual completion date' },
    { name: 'status', required: true, type: 'Text', description: 'Current status of the activity', defaultValue: 'not_started', validation: 'not_started, in_progress, completed, cancelled' },
    { name: 'progress', required: false, type: 'Integer', description: 'Completion percentage (0-100)', defaultValue: '0', validation: '0-100' },
    { name: 'notes', required: false, type: 'Text', description: 'Progress notes and comments' },
    { name: 'created_by', required: false, type: 'UUID', description: 'User who created the plan' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const developmentTypes = [
    { type: 'Training', description: 'Formal learning courses, certifications, workshops', examples: 'Leadership program, MBA sponsorship, technical certification' },
    { type: 'Project', description: 'Stretch assignments and special projects', examples: 'Lead M&A integration, new product launch, process improvement initiative' },
    { type: 'Mentoring', description: 'Formal mentoring relationships', examples: 'Executive mentor pairing, peer coaching, external coach engagement' },
    { type: 'Assignment', description: 'Role changes or rotations', examples: 'International assignment, cross-functional rotation, acting/interim role' },
    { type: 'Other', description: 'Custom development activities', examples: 'Board observation, industry conference, executive networking' }
  ];

  const createDevelopmentPlanSteps: Step[] = [
    {
      title: 'Navigate to Candidate Development',
      description: 'Access the candidate\'s development plans.',
      substeps: [
        'Go to Performance → Succession → Succession Plans',
        'Click on the succession plan containing the candidate',
        'Click on the candidate to open their profile',
        'Navigate to the "Development Plans" tab'
      ],
      expectedResult: 'Candidate development plans page is displayed'
    },
    {
      title: 'Add Development Activity',
      description: 'Create a new development plan item.',
      substeps: [
        'Click "Add Development Activity" or the + button',
        'Enter a descriptive Title for the activity',
        'Add a Description explaining the activity and expected outcomes'
      ],
      expectedResult: 'Development activity form is open'
    },
    {
      title: 'Select Development Type',
      description: 'Categorize the development activity.',
      substeps: [
        'Choose from: Training, Project, Mentoring, Assignment, Other',
        'Select the type that best fits the activity',
        'This categorization helps with reporting and resource planning'
      ],
      expectedResult: 'Development type is selected'
    },
    {
      title: 'Set Target Date',
      description: 'Define the expected completion timeline.',
      substeps: [
        'Set the Target Date for completion',
        'Consider the succession plan target date',
        'Align with organizational development cycles'
      ],
      expectedResult: 'Target date is set'
    },
    {
      title: 'Save Development Plan',
      description: 'Save the development activity.',
      substeps: [
        'Review all entered information',
        'Click "Save" to create the activity',
        'Activity appears in the candidate\'s development list'
      ],
      expectedResult: 'Development activity is saved with "Not Started" status'
    }
  ];

  const updateProgressSteps: Step[] = [
    {
      title: 'Open Development Activity',
      description: 'Access the development activity to update.',
      substeps: [
        'Navigate to the candidate\'s development plans',
        'Click on the activity to open the detail view'
      ],
      expectedResult: 'Development activity detail is displayed'
    },
    {
      title: 'Update Status',
      description: 'Change the activity status as appropriate.',
      substeps: [
        'Update Status: Not Started → In Progress → Completed',
        'Or mark as Cancelled if no longer relevant'
      ],
      expectedResult: 'Status is updated'
    },
    {
      title: 'Update Progress Percentage',
      description: 'Set the completion progress.',
      substeps: [
        'Adjust the Progress slider or enter percentage (0-100)',
        '100% should align with Completed status'
      ],
      expectedResult: 'Progress percentage is updated'
    },
    {
      title: 'Add Progress Notes',
      description: 'Document progress and outcomes.',
      substeps: [
        'Add notes describing progress, achievements, or issues',
        'Include dates of significant milestones',
        'Note any changes to scope or timeline'
      ],
      expectedResult: 'Progress notes are documented'
    },
    {
      title: 'Set Completion Date',
      description: 'Record actual completion when finished.',
      substeps: [
        'When status is Completed, set the Completion Date',
        'This enables accurate reporting on development timelines'
      ],
      expectedResult: 'Completion date is recorded'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Candidate required', enforcement: 'System', description: 'Development plans must be linked to a succession candidate.' },
    { rule: 'Title required', enforcement: 'System', description: 'Each development activity must have a title.' },
    { rule: 'Valid type', enforcement: 'System', description: 'Development type must be one of the predefined categories.' },
    { rule: 'Progress range', enforcement: 'System', description: 'Progress must be between 0 and 100.' },
    { rule: 'Status transitions', enforcement: 'Policy', description: 'Recommended: not_started → in_progress → completed. Can skip to cancelled from any state.' },
    { rule: 'Completion date', enforcement: 'Policy', description: 'Completion date should be set when status changes to completed.' },
    { rule: 'Audit trail', enforcement: 'System', description: 'All changes are logged with timestamp and user.' }
  ];

  return (
    <section id="sec-6-7" data-manual-anchor="sec-6-7" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.7 Development Plan Management</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create and track development activities for succession candidates
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Create development plans for succession candidates',
          'Categorize development activities by type (training, project, mentoring, etc.)',
          'Track progress and update development status',
          'Document outcomes and completion dates'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Candidate</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Development Plans</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Development Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-primary" />
            Development Activity Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Development activities are categorized by type to enable targeted planning and reporting.
          </p>

          <div className="space-y-3">
            {developmentTypes.map((item) => (
              <div key={item.type} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                <p className="text-xs"><span className="font-medium">Examples:</span> {item.examples}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            succession_development_plans Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={developmentPlanFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step: Create */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-primary" />
            Create Development Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={createDevelopmentPlanSteps} title="" />
        </CardContent>
      </Card>

      {/* Step-by-Step: Update Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Update Development Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={updateProgressSteps} title="" />
        </CardContent>
      </Card>

      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Development Progress Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each development activity shows status, progress, and timeline.
          </p>

          {/* Simulated Progress Card */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-sm">Executive Leadership Program</h5>
                  <Badge variant="outline" className="mt-1 text-xs">Training</Badge>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">In Progress</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Target: Dec 2024</span>
                  <span>Started: Jun 2024</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Development Planning Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Align development activities with identified gaps from readiness assessment',
              'Include a mix of development types: 70% experience, 20% exposure, 10% education',
              'Set realistic timelines considering workload and organizational constraints',
              'Review progress monthly and adjust plans as needed',
              'Document specific outcomes, not just completion status',
              'Link development to succession plan target date'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Industry Context */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-4">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Industry Benchmark:</strong> The 70-20-10 development model suggests: 
              70% from challenging experiences (projects, assignments), 20% from developmental 
              relationships (mentoring, coaching), and 10% from formal education (training, courses).
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

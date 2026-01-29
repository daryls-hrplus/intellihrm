import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  ArrowRight, 
  Database,
  Code,
  CheckCircle2
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  StepByStep,
  FieldReferenceTable,
  type Step,
  type FieldDefinition
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

const onboardingTaskFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique task identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'employee_id', required: true, type: 'UUID', description: 'Employee assigned the task', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'training_course_id', required: false, type: 'UUID', description: 'Linked training course for auto-enrollment', defaultValue: 'null', validation: 'References lms_courses.id' },
  { name: 'task_type', required: true, type: 'text', description: 'Type of onboarding task', defaultValue: '—', validation: 'training, document, form, meeting' },
  { name: 'status', required: true, type: 'text', description: 'Task completion status', defaultValue: 'pending', validation: 'pending, in_progress, completed' },
  { name: 'due_date', required: false, type: 'date', description: 'Task deadline', defaultValue: 'null', validation: 'Future date' }
];

const configSteps: Step[] = [
  {
    title: 'Navigate to Onboarding Task Templates',
    description: 'Go to Onboarding → Setup → Task Templates to configure training-linked tasks.',
    notes: ['Requires Admin or HR Partner role'],
    expectedResult: 'Task template list displays'
  },
  {
    title: 'Create or Edit Training Task',
    description: 'Create a new task template with task_type = "training" or edit an existing one.',
    notes: [
      'Set a descriptive task name (e.g., "Complete Safety Training")',
      'Specify due_days_from_start for deadline calculation'
    ]
  },
  {
    title: 'Link Training Course',
    description: 'In the task configuration, select the training_course_id from the course dropdown.',
    notes: [
      'Only published courses appear in the dropdown',
      'Ensure the course is appropriate for new hires'
    ],
    expectedResult: 'Course linked to onboarding task template'
  },
  {
    title: 'Assign Template to Onboarding Plan',
    description: 'Add the task template to the appropriate onboarding plan(s) for job families or locations.',
    notes: ['Multiple plans can use the same template']
  },
  {
    title: 'Test with Sample Onboarding',
    description: 'Create a test onboarding record and verify auto-enrollment triggers.',
    expectedResult: 'Employee appears in course enrollment list when task is assigned'
  }
];

export function LndIntegrationOnboarding() {
  return (
    <section id="sec-8-2" data-manual-anchor="sec-8-2" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.2 Onboarding Integration</h3>
          <p className="text-sm text-muted-foreground">
            Auto-enroll new hires in training via onboarding task triggers
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure onboarding tasks with linked training courses',
        'Understand the trigger_onboarding_training_enrollment PostgreSQL function',
        'Track training enrollments with source_type = "onboarding"',
        'Troubleshoot common onboarding integration issues'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: Onboarding → Training
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Trigger</p>
                <p className="font-medium">Onboarding Task</p>
                <Badge variant="outline" className="mt-1">training_course_id set</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Function</p>
                <p className="font-medium">trigger_onboarding_training_enrollment</p>
                <Badge variant="outline" className="mt-1">PostgreSQL trigger</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Result</p>
                <p className="font-medium">LMS Enrollment</p>
                <Badge variant="outline" className="mt-1">lms_enrollments</Badge>
              </div>
            </div>
          </div>

          <InfoCallout>
            The integration is implemented as a PostgreSQL trigger that fires when an onboarding 
            task with a <code>training_course_id</code> is inserted. This ensures zero-latency 
            enrollment without edge function overhead.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            PostgreSQL Trigger Function
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>trigger_onboarding_training_enrollment</code> function handles automatic enrollment:
          </p>

          <div className="p-4 border rounded-lg bg-muted/30 font-mono text-xs overflow-x-auto">
            <pre>{`CREATE OR REPLACE FUNCTION trigger_onboarding_training_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if training_course_id is set
  IF NEW.training_course_id IS NOT NULL THEN
    INSERT INTO lms_enrollments (
      user_id,
      course_id,
      company_id,
      status,
      enrolled_by,
      source_type,
      source_reference_id
    ) VALUES (
      NEW.employee_id,
      NEW.training_course_id,
      (SELECT company_id FROM profiles WHERE id = NEW.employee_id),
      'enrolled',
      NEW.assigned_by,
      'onboarding',
      NEW.id
    )
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`}</pre>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Key Behaviors
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Fires on INSERT to onboarding_tasks</li>
                <li>• Only triggers when training_course_id is set</li>
                <li>• Uses ON CONFLICT to prevent duplicates</li>
                <li>• Sets source_type = 'onboarding' for traceability</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                Source Tracking
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• source_type: 'onboarding'</li>
                <li>• source_reference_id: onboarding_tasks.id</li>
                <li>• enrolled_by: assigned_by from task</li>
                <li>• Enables full audit trail</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={onboardingTaskFields} 
        title="onboarding_tasks Table (Key Training Fields)" 
      />

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <ScreenshotPlaceholder 
        title="Onboarding Task Configuration"
        description="Shows the task template form with training_course_id dropdown"
      />

      <TipCallout>
        <strong>Best Practice:</strong> Create a dedicated "New Hire Training" category in your course 
        catalog to easily identify courses suitable for onboarding integration. This simplifies 
        configuration and reporting.
      </TipCallout>

      <Card>
        <CardHeader>
          <CardTitle>Common Integration Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Compliance Training</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Auto-enroll all new hires in mandatory compliance courses (safety, ethics, harassment prevention).
              </p>
              <Badge variant="secondary">Day 1-5 typically</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Role-Specific Training</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Use job family-specific onboarding plans to enroll in role-appropriate technical training.
              </p>
              <Badge variant="secondary">Week 1-4 typically</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Systems Training</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Enroll in ERP, CRM, or internal systems training based on department assignment.
              </p>
              <Badge variant="secondary">Week 2-6 typically</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Manager Orientation</h4>
              <p className="text-sm text-muted-foreground mb-2">
                New managers auto-enrolled in people leadership and HR systems training.
              </p>
              <Badge variant="secondary">Month 1-3 typically</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <InfoCallout>
        For complete onboarding configuration, refer to the <strong>Workforce Administrator Manual, 
        Chapter 6</strong>, which documents the full onboarding workflow and task template setup.
      </InfoCallout>
    </section>
  );
}

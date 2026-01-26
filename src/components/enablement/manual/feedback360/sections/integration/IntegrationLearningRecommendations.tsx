import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Search,
  ClipboardList
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout,
  FieldReferenceTable,
  BusinessRules,
  StepByStep,
  type FieldDefinition,
  type BusinessRule,
  type Step 
} from '@/components/enablement/manual/components';

const skillGapFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the skill gap record',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'employee_id',
    required: true,
    type: 'UUID',
    description: 'Employee with the identified skill gap',
    defaultValue: '—',
    validation: 'Must reference valid profiles.id'
  },
  {
    name: 'skill_id',
    required: false,
    type: 'UUID',
    description: 'Reference to competency/skill taxonomy',
    defaultValue: 'null',
    validation: 'Links to competencies table'
  },
  {
    name: 'source',
    required: true,
    type: 'text',
    description: 'Origin of gap identification',
    defaultValue: '—',
    validation: 'Enum: feedback_360, appraisal, self_assessment, manager'
  },
  {
    name: 'source_reference_id',
    required: false,
    type: 'UUID',
    description: 'Reference to source record (e.g., theme ID)',
    defaultValue: 'null',
    validation: 'For traceability'
  },
  {
    name: 'gap_score',
    required: false,
    type: 'numeric(3,2)',
    description: 'Magnitude of the gap (0-5 scale)',
    defaultValue: 'null',
    validation: 'Higher = larger gap'
  },
  {
    name: 'recommended_training',
    required: false,
    type: 'text',
    description: 'AI-suggested training category or topic',
    defaultValue: 'null',
    validation: 'Free-text recommendation'
  },
  {
    name: 'recommended_course_id',
    required: false,
    type: 'UUID',
    description: 'Specific course recommendation',
    defaultValue: 'null',
    validation: 'Links to training_courses if matched'
  },
  {
    name: 'status',
    required: true,
    type: 'text',
    description: 'Current status of gap remediation',
    defaultValue: 'identified',
    validation: 'Enum: identified, in_progress, addressed, dismissed'
  }
];

const courseMatchingFields: FieldDefinition[] = [
  {
    name: 'competency_id',
    required: true,
    type: 'UUID',
    description: 'Competency that the course develops',
    defaultValue: '—',
    validation: 'Links to competencies table'
  },
  {
    name: 'course_id',
    required: true,
    type: 'UUID',
    description: 'Training course that addresses the competency',
    defaultValue: '—',
    validation: 'Links to training_courses table'
  },
  {
    name: 'relevance_score',
    required: false,
    type: 'numeric(3,2)',
    description: 'How well the course matches the competency (0-1)',
    defaultValue: '1.0',
    validation: 'Used for prioritization'
  },
  {
    name: 'is_primary',
    required: false,
    type: 'boolean',
    description: 'Whether this is the primary course for this competency',
    defaultValue: 'false',
    validation: 'Only one primary per competency'
  }
];

const recommendationSteps: Step[] = [
  {
    title: '360 Cycle Completes',
    description: 'Feedback collected and processed, development themes generated.',
    notes: ['Themes identify specific competency gaps']
  },
  {
    title: 'Gap Detection',
    description: 'AI analyzes themes to identify skill/competency gaps.',
    notes: ['Maps theme text to competency taxonomy', 'Calculates gap score based on feedback severity']
  },
  {
    title: 'Course Matching',
    description: 'System queries competency_course_mappings for relevant training.',
    notes: ['Prioritizes by relevance_score', 'Considers employee learning history']
  },
  {
    title: 'Recommendation Generation',
    description: 'Creates employee_skill_gaps records with course recommendations.',
    notes: ['Multiple courses may be suggested per gap']
  },
  {
    title: 'Manager Review',
    description: 'Manager reviews and approves learning recommendations.',
    notes: ['Can modify or dismiss recommendations', 'Approval triggers training request']
  },
  {
    title: 'Enrollment',
    description: 'Approved recommendations create training requests in L&D module.',
    notes: ['Source tracked as "feedback_360"', 'Progress reflected back to skill gap status']
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Gap detection requires confirmed themes',
    enforcement: 'System',
    description: 'Only manager-confirmed development themes trigger gap creation'
  },
  {
    rule: 'Course matching requires competency taxonomy',
    enforcement: 'System',
    description: 'Themes must map to competencies in competency_course_mappings for course suggestions'
  },
  {
    rule: 'Manager approval before enrollment',
    enforcement: 'Policy',
    description: 'Automated course enrollment requires manager approval step'
  },
  {
    rule: 'One active gap per competency per employee',
    enforcement: 'System',
    description: 'New gap for same competency updates existing rather than duplicating'
  },
  {
    rule: 'Course completion updates gap status',
    enforcement: 'System',
    description: 'Training completion marks skill gap as "addressed"'
  }
];

export function IntegrationLearningRecommendations() {
  return (
    <section id="sec-7-6" data-manual-anchor="sec-7-6" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.6 Learning Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Skill gap detection and AI-powered course matching from 360 feedback
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand how 360 themes translate to skill gaps',
        'Configure competency-to-course mappings for recommendations',
        'Manage the manager approval workflow for learning recommendations',
        'Track learning progress back to original 360 feedback'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Gap-to-Course Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The system uses AI to connect 360 feedback insights directly to relevant training:
          </p>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="text-center flex-1">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Development Theme</p>
              <p className="text-xs text-muted-foreground">"Improve communication"</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center flex-1">
              <Search className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Competency Match</p>
              <p className="text-xs text-muted-foreground">"Communication Skills"</p>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center flex-1">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Course Recommendation</p>
              <p className="text-xs text-muted-foreground">"Effective Communication 101"</p>
            </div>
          </div>

          <InfoCallout>
            The matching algorithm considers the employee's current skill level, learning history, 
            and course availability to prioritize the most relevant recommendations.
          </InfoCallout>
        </CardContent>
      </Card>

      <StepByStep steps={recommendationSteps} title="Learning Recommendation Flow" />

      <FieldReferenceTable 
        fields={skillGapFields} 
        title="employee_skill_gaps Table Fields" 
      />

      <FieldReferenceTable 
        fields={courseMatchingFields} 
        title="competency_course_mappings Table Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Manager Approval Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Managers review AI-generated learning recommendations before enrollment:
          </p>

          <div className="p-4 border rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">John Smith - Learning Recommendations</p>
                <p className="text-sm text-muted-foreground">From: Q4 2024 360 Feedback</p>
              </div>
              <Badge variant="outline">3 Pending</Badge>
            </div>
            
            <div className="space-y-3">
              {[
                { gap: 'Communication Skills', course: 'Effective Communication 101', priority: 'High' },
                { gap: 'Project Management', course: 'PM Fundamentals', priority: 'Medium' },
                { gap: 'Strategic Thinking', course: 'Strategic Leadership', priority: 'Low' }
              ].map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background rounded border">
                  <div>
                    <p className="text-sm font-medium">{rec.gap}</p>
                    <p className="text-xs text-muted-foreground">Recommended: {rec.course}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="cursor-pointer hover:bg-green-100">Approve</Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-red-100">Dismiss</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <TipCallout>
            Bulk actions are available: "Approve All High Priority" or "Dismiss Low Priority" 
            streamline the review process for managers with multiple team members.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Tracking & Remeasurement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Learning progress is tracked back to the original 360 feedback:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Course Completion</p>
                <p className="text-sm text-muted-foreground">
                  employee_skill_gaps.status updates to "addressed" when linked 
                  training_enrollments.status = "completed".
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Next Cycle Comparison</p>
                <p className="text-sm text-muted-foreground">
                  Subsequent 360 cycles can measure improvement in previously 
                  identified gap areas via remeasurement questions.
                </p>
              </div>
            </div>
          </div>

          <WarningCallout>
            Course recommendations are only as good as the competency_course_mappings configuration. 
            Ensure your training catalog is properly mapped to competencies before enabling 
            auto-recommendations.
          </WarningCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  ArrowRight, 
  Link2,
  BookOpen,
  Target
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

const trainingRequestFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'employee_id', required: true, type: 'UUID', description: 'Employee for training', defaultValue: '—', validation: 'References profiles.id' },
  { name: 'course_id', required: false, type: 'UUID', description: 'Specific course if known', defaultValue: 'null', validation: 'References training_courses.id' },
  { name: 'request_type', required: true, type: 'text', description: 'Type of request', defaultValue: '—', validation: 'auto_enroll, recommendation, gap_based' },
  { name: 'source_type', required: true, type: 'text', description: 'What triggered the request', defaultValue: '—', validation: 'succession, appraisal, 360_feedback, competency' },
  { name: 'source_reference_id', required: false, type: 'UUID', description: 'ID of source record', defaultValue: 'null', validation: 'e.g., succession_candidate.id' },
  { name: 'priority', required: false, type: 'text', description: 'Request priority level', defaultValue: 'normal', validation: 'low, normal, high, critical' },
  { name: 'status', required: true, type: 'text', description: 'Current request status', defaultValue: 'pending', validation: 'pending, approved, enrolled, completed, cancelled' },
  { name: 'gap_id', required: false, type: 'UUID', description: 'Related competency gap', defaultValue: 'null', validation: 'References employee_skill_gaps.id' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Request creation time', defaultValue: 'now()', validation: 'Auto-set' }
];

const configSteps: Step[] = [
  {
    title: 'Configure Competency-Course Mappings',
    description: 'Navigate to Learning → Setup → Competency Mappings to link competencies to relevant courses.',
    notes: [
      'Map each competency to 1-5 recommended courses',
      'Set proficiency level requirements for each mapping'
    ],
    expectedResult: 'Competency gaps can auto-suggest relevant courses'
  },
  {
    title: 'Create Integration Rule for Gap-Based Training',
    description: 'Set up rule to create training requests when succession gaps are identified.',
    notes: [
      'Trigger: readiness_assessment_completed',
      'Condition: gap_severity >= medium',
      'Action: create_request with source_type=succession'
    ]
  },
  {
    title: 'Enable Auto-Enrollment for Critical Gaps',
    description: 'Configure rules that automatically enroll candidates in required training.',
    notes: [
      'Use action_type: auto_enroll for critical skill gaps',
      'Ensure course availability is checked before enrollment'
    ]
  },
  {
    title: 'Link to Development Plans',
    description: 'Configure succession_gap_development_links to connect gaps with IDP items and courses.',
    notes: ['Use linked_learning_id to reference training_courses'],
    expectedResult: 'Gaps visible in development plan with linked learning activities'
  },
  {
    title: 'Test Gap-to-Training Flow',
    description: 'Complete a readiness assessment with identified gaps and verify training request creation.',
    expectedResult: 'Training request appears in employee learning dashboard with succession source'
  }
];

export function IntegrationLearningDevelopment() {
  return (
    <section id="sec-9-7" data-manual-anchor="sec-9-7" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <GraduationCap className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.7 Learning & Development Integration</h3>
          <p className="text-sm text-muted-foreground">
            Connect succession gaps to training courses and development activities
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure competency-course mappings for gap-based recommendations',
        'Set up automatic training request creation from succession gaps',
        'Enable auto-enrollment for critical development needs',
        'Track development activity progress for succession candidates'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Data Flow: Succession → Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium">Succession Gaps</p>
                <Badge variant="outline" className="mt-1">readiness_assessment</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Mapping</p>
                <p className="font-medium">Competency Courses</p>
                <Badge variant="outline" className="mt-1">competency_course_mappings</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-medium">Training Request</p>
                <Badge variant="outline" className="mt-1">training_requests</Badge>
              </div>
            </div>
          </div>

          <InfoCallout>
            The integration uses <code>competency_course_mappings</code> to automatically suggest relevant 
            training when succession gaps are identified. Requests are created with <code>source_type='succession'</code> 
            for traceability.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Gap-to-Development Linking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The <code>succession_gap_development_links</code> table connects identified gaps with development activities:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Link Type</th>
                  <th className="text-left py-2 px-3">Target Table</th>
                  <th className="text-left py-2 px-3">Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">IDP Goal</td>
                  <td className="py-2 px-3"><code>linked_idp_item_id</code> → idp_items</td>
                  <td className="py-2 px-3">Development goals in employee IDP</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Training Course</td>
                  <td className="py-2 px-3"><code>linked_learning_id</code> → training_courses</td>
                  <td className="py-2 px-3">Formal training enrollment</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Mentorship</td>
                  <td className="py-2 px-3"><code>linked_mentorship_id</code> → mentorship_pairings</td>
                  <td className="py-2 px-3">Mentoring relationship assignment</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <h4 className="font-medium mb-2">Gap Severity Levels</h4>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="p-2 border rounded bg-background">
                <Badge variant="outline">Low</Badge>
                <p className="text-xs mt-1">Recommend</p>
              </div>
              <div className="p-2 border rounded bg-background">
                <Badge variant="secondary">Medium</Badge>
                <p className="text-xs mt-1">Request</p>
              </div>
              <div className="p-2 border rounded bg-background">
                <Badge className="bg-amber-500">High</Badge>
                <p className="text-xs mt-1">Priority</p>
              </div>
              <div className="p-2 border rounded bg-background">
                <Badge variant="destructive">Critical</Badge>
                <p className="text-xs mt-1">Auto-Enroll</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={trainingRequestFields} 
        title="training_requests Table (Key Integration Fields)" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Path Enrollment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Succession candidates can be enrolled in structured learning paths based on their target role:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Leadership Pipeline</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Executive Communication</li>
                <li>• Strategic Planning</li>
                <li>• Financial Acumen</li>
                <li>• Change Management</li>
              </ul>
              <Badge variant="secondary" className="mt-3">6-12 months</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Management Foundations</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• People Leadership</li>
                <li>• Performance Management</li>
                <li>• Coaching Skills</li>
                <li>• Decision Making</li>
              </ul>
              <Badge variant="secondary" className="mt-3">3-6 months</Badge>
            </div>
          </div>

          <TipCallout>
            Configure integration rules to automatically enroll "Ready in 1-2 Years" candidates in 
            appropriate leadership development paths. Use <code>action_config.learning_path_id</code> 
            to specify the target path.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Development Activity Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Track candidate development progress through the <code>succession_development_plans</code> table:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Development Type</th>
                  <th className="text-left py-2 px-3">Progress Tracking</th>
                  <th className="text-left py-2 px-3">Completion Criteria</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">training</Badge></td>
                  <td className="py-2 px-3">Synced from training_enrollments</td>
                  <td className="py-2 px-3">Course completion + assessment pass</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">project</Badge></td>
                  <td className="py-2 px-3">Manual milestone updates</td>
                  <td className="py-2 px-3">Manager sign-off on deliverables</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">mentoring</Badge></td>
                  <td className="py-2 px-3">Session count from mentorship_sessions</td>
                  <td className="py-2 px-3">Minimum sessions + goal achievement</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">assignment</Badge></td>
                  <td className="py-2 px-3">Duration tracking + outcomes</td>
                  <td className="py-2 px-3">Rotation completion + evaluation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <InfoCallout>
        For comprehensive L&D configuration, refer to the <strong>Learning & Development Administrator Manual</strong>, 
        which covers course management, learning paths, and competency-based development in detail.
      </InfoCallout>
    </section>
  );
}

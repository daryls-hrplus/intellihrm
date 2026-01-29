import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowRight, 
  TrendingUp,
  Target,
  BookOpen
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  FieldReferenceTable,
  type FieldDefinition
} from '@/components/enablement/manual/components';
import { ScreenshotPlaceholder } from '@/components/enablement/shared/ScreenshotPlaceholder';

const idpGoalFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique goal identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'idp_id', required: true, type: 'UUID', description: 'Parent development plan', defaultValue: '—', validation: 'References individual_development_plans.id' },
  { name: 'goal_title', required: true, type: 'text', description: 'Development goal name', defaultValue: '—', validation: 'Required' },
  { name: 'development_type', required: true, type: 'text', description: 'Type of development activity', defaultValue: 'training', validation: 'training, project, mentoring, assignment, reading' },
  { name: 'linked_course_id', required: false, type: 'UUID', description: 'Linked training course', defaultValue: 'null', validation: 'References lms_courses.id' },
  { name: 'linked_learning_path_id', required: false, type: 'UUID', description: 'Linked learning path', defaultValue: 'null', validation: 'References learning_paths.id' },
  { name: 'target_completion_date', required: false, type: 'date', description: 'Goal deadline', defaultValue: 'null', validation: 'Future date' },
  { name: 'status', required: true, type: 'text', description: 'Goal status', defaultValue: 'not_started', validation: 'not_started, in_progress, completed, cancelled' }
];

export function LndIntegrationSuccessionCareer() {
  return (
    <section id="sec-8-5" data-manual-anchor="sec-8-5" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.5 Succession & Career Development</h3>
          <p className="text-sm text-muted-foreground">
            Connect succession planning, career paths, and individual development plans to training
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand how succession readiness gaps trigger training recommendations',
        'Link career path steps to learning paths for progression requirements',
        'Configure IDP goals with linked training courses',
        'Track development activity completion for succession candidates'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Succession Planning Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Succession candidates can be automatically enrolled in development programs based on 
            readiness assessments and identified skill gaps.
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="font-medium">Readiness Gap</p>
                <Badge variant="outline" className="mt-1">succession_candidates</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Link</p>
                <p className="font-medium">Gap-Course Mapping</p>
                <Badge variant="outline" className="mt-1">competency_course_mappings</Badge>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="text-center p-3 bg-background rounded-lg border">
                <p className="text-xs text-muted-foreground">Result</p>
                <p className="font-medium">Training Request</p>
                <Badge variant="outline" className="mt-1">source_type: succession</Badge>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <Badge className="mb-2">Ready Now</Badge>
              <p className="text-sm text-muted-foreground">
                Executive leadership courses, transition coaching
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="secondary" className="mb-2">Ready 1-2 Years</Badge>
              <p className="text-sm text-muted-foreground">
                Management development, strategic planning courses
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <Badge variant="outline" className="mb-2">Ready 3+ Years</Badge>
              <p className="text-sm text-muted-foreground">
                Foundational leadership, technical depth courses
              </p>
            </div>
          </div>

          <InfoCallout>
            For detailed succession planning integration rules, refer to the <strong>Succession 
            Planning Administrator Manual, Chapter 9.7</strong>, which documents the complete 
            gap-to-training workflow.
          </InfoCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Career Path Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Career paths can define learning requirements for progression between roles.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Career Path Step</th>
                  <th className="text-left py-2 px-3">Learning Requirement</th>
                  <th className="text-left py-2 px-3">Validation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Analyst → Senior Analyst</td>
                  <td className="py-2 px-3">Advanced Analytics Learning Path</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline">Path Completion Required</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Senior → Lead</td>
                  <td className="py-2 px-3">Leadership Fundamentals Course</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline">Course + Assessment</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-medium">Lead → Manager</td>
                  <td className="py-2 px-3">People Management Certification</td>
                  <td className="py-2 px-3">
                    <Badge variant="outline">Certification Required</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
            <h4 className="font-medium mb-2">career_path_steps Configuration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The <code>requirements</code> JSON field in career_path_steps can specify:
            </p>
            <div className="text-xs font-mono bg-muted/50 p-2 rounded">
              {`{
  "learning_paths": ["uuid-1", "uuid-2"],
  "courses": ["uuid-3"],
  "certifications": ["certification-code"],
  "competency_levels": { "leadership": 3, "technical": 4 }
}`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Individual Development Plans (IDP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            IDPs connect employee development goals to specific training activities.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Development Types</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">training</Badge>
                  <span>Formal courses and certifications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">project</Badge>
                  <span>Stretch assignments and projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">mentoring</Badge>
                  <span>Mentorship relationships</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">assignment</Badge>
                  <span>Job rotations and secondments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">reading</Badge>
                  <span>Self-study materials</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Training Link Fields</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <code>linked_course_id</code> → single course</li>
                <li>• <code>linked_learning_path_id</code> → learning path</li>
                <li>• Status syncs from lms_enrollments</li>
                <li>• Completion triggers IDP goal update</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={idpGoalFields} 
        title="idp_goals Table (Training-Related Fields)" 
      />

      <ScreenshotPlaceholder 
        title="IDP Goal with Training Link"
        description="Shows an IDP goal form with course/learning path selection dropdown"
      />

      <Card>
        <CardHeader>
          <CardTitle>Development Activity Progress Sync</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Development Type</th>
                  <th className="text-left py-2 px-3">Progress Source</th>
                  <th className="text-left py-2 px-3">Completion Trigger</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">training</Badge></td>
                  <td className="py-2 px-3">lms_enrollments.progress_percentage</td>
                  <td className="py-2 px-3">status = 'completed'</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">project</Badge></td>
                  <td className="py-2 px-3">Manual milestone updates</td>
                  <td className="py-2 px-3">Manager sign-off</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">mentoring</Badge></td>
                  <td className="py-2 px-3">mentorship_sessions count</td>
                  <td className="py-2 px-3">Minimum sessions + goals achieved</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Integration Tip:</strong> When creating succession candidate development plans, 
        use the "Add from Gap" feature to automatically suggest courses mapped to identified 
        competency gaps via competency_course_mappings.
      </TipCallout>

      <InfoCallout>
        For complete IDP configuration, refer to the <strong>Workforce Administrator Manual</strong>. 
        For succession readiness assessments, see the <strong>Succession Planning Administrator Manual, 
        Chapter 5</strong>.
      </InfoCallout>
    </section>
  );
}

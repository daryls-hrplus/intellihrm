import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Puzzle, 
  ArrowRight, 
  ArrowLeftRight,
  Database,
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

const competencyMappingFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique mapping identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'competency_id', required: true, type: 'UUID', description: 'Linked competency', defaultValue: '—', validation: 'References competencies.id' },
  { name: 'course_id', required: true, type: 'UUID', description: 'Linked training course', defaultValue: '—', validation: 'References lms_courses.id' },
  { name: 'proficiency_level', required: false, type: 'integer', description: 'Target proficiency (1-5)', defaultValue: '3', validation: '1-5 scale' },
  { name: 'min_gap_level', required: false, type: 'integer', description: 'Minimum gap to trigger recommendation', defaultValue: '2', validation: '1-5 scale' },
  { name: 'is_primary', required: false, type: 'boolean', description: 'Primary course for this competency', defaultValue: 'false', validation: 'true/false' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company scope', defaultValue: '—', validation: 'References companies.id' },
  { name: 'is_active', required: false, type: 'boolean', description: 'Mapping active status', defaultValue: 'true', validation: 'true/false' }
];

const configSteps: Step[] = [
  {
    title: 'Navigate to Competency Mappings',
    description: 'Go to Learning → Setup → Competency Mappings to configure course-competency links.',
    notes: ['Requires Admin or L&D Admin role'],
    expectedResult: 'Competency mapping list displays'
  },
  {
    title: 'Select Competency',
    description: 'Choose a competency from the competency framework dropdown.',
    notes: [
      'Competencies must be active in the Workforce module',
      'Consider skill categories for organized mapping'
    ]
  },
  {
    title: 'Link Training Courses',
    description: 'Add one or more courses that develop this competency.',
    notes: [
      'Set proficiency_level to indicate target skill level',
      'Mark one course as is_primary for gap recommendations'
    ],
    expectedResult: 'Courses linked to competency'
  },
  {
    title: 'Configure Gap Threshold',
    description: 'Set min_gap_level to control when courses are recommended for gaps.',
    notes: [
      'Gap level 1 = minor gap, 5 = critical gap',
      'Typical threshold: 2 (moderate gap)'
    ]
  },
  {
    title: 'Enable Bidirectional Sync',
    description: 'Verify that course completions will update employee_skill_assessments.',
    notes: [
      'Sync happens via lms_enrollments completion trigger',
      'Only updates if proficiency_level is higher than current'
    ],
    expectedResult: 'Completing course updates skill proficiency'
  }
];

export function LndIntegrationCompetency() {
  return (
    <section id="sec-8-4" data-manual-anchor="sec-8-4" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Puzzle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.4 Competency Framework Sync</h3>
          <p className="text-sm text-muted-foreground">
            Bidirectional updates between training completion and skill proficiency
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Configure competency_course_mappings for gap-based recommendations',
        'Understand bidirectional sync: courses ↔ skills',
        'Set proficiency levels and gap thresholds for automated suggestions',
        'Track skill development from training completions'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Bidirectional Data Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-green-600" />
                Skill Gap → Course Recommendation
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Skill gap identified in employee_skill_gaps</li>
                <li>2. System queries competency_course_mappings</li>
                <li>3. Courses with matching competency_id returned</li>
                <li>4. Filtered by min_gap_level threshold</li>
                <li>5. Primary course prioritized in recommendations</li>
              </ol>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-blue-600 rotate-180" />
                Course Completion → Skill Update
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Employee completes course (lms_enrollments)</li>
                <li>2. System queries competency_course_mappings</li>
                <li>3. Linked competencies identified</li>
                <li>4. employee_skill_assessments updated</li>
                <li>5. Proficiency set to mapping's proficiency_level</li>
              </ol>
            </div>
          </div>

          <InfoCallout>
            The bidirectional sync ensures that training investments directly improve measurable 
            skill metrics, enabling true ROI tracking and closing the development feedback loop.
          </InfoCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={competencyMappingFields} 
        title="competency_course_mappings Table" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Related Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Input Tables
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>competencies</code> - Competency definitions</li>
                <li>• <code>employee_skill_gaps</code> - Identified gaps</li>
                <li>• <code>employee_skill_assessments</code> - Current levels</li>
                <li>• <code>lms_courses</code> - Available courses</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                Output Tables
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <code>employee_skill_assessments</code> - Updated proficiency</li>
                <li>• <code>training_requests</code> - Gap-based requests</li>
                <li>• <code>lms_enrollments</code> - Auto-enrollments</li>
                <li>• <code>ai_recommendations</code> - Course suggestions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={configSteps} title="Configuration Procedure" />

      <ScreenshotPlaceholder 
        title="Competency-Course Mapping"
        description="Shows the mapping interface with competency dropdown, course selection, and proficiency settings"
      />

      <Card>
        <CardHeader>
          <CardTitle>Gap Level Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            <div className="p-3 border rounded-lg">
              <Badge variant="outline" className="mb-2">1</Badge>
              <p className="font-medium">Minor</p>
              <p className="text-xs text-muted-foreground">Self-study sufficient</p>
            </div>
            <div className="p-3 border rounded-lg">
              <Badge variant="secondary" className="mb-2">2</Badge>
              <p className="font-medium">Moderate</p>
              <p className="text-xs text-muted-foreground">Course recommended</p>
            </div>
            <div className="p-3 border rounded-lg">
              <Badge className="bg-amber-500 mb-2">3</Badge>
              <p className="font-medium">Significant</p>
              <p className="text-xs text-muted-foreground">Course required</p>
            </div>
            <div className="p-3 border rounded-lg">
              <Badge className="bg-orange-500 mb-2">4</Badge>
              <p className="font-medium">Major</p>
              <p className="text-xs text-muted-foreground">Learning path needed</p>
            </div>
            <div className="p-3 border rounded-lg">
              <Badge variant="destructive" className="mb-2">5</Badge>
              <p className="font-medium">Critical</p>
              <p className="text-xs text-muted-foreground">Immediate intervention</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Best Practice:</strong> Map each competency to 2-3 courses at different levels. 
        Use <code>proficiency_level</code> to indicate which course develops which level (e.g., 
        "Excel Basics" → level 2, "Excel Advanced" → level 4).
      </TipCallout>

      <InfoCallout>
        For AI-powered competency gap detection and course recommendations, refer to 
        <strong>Chapter 6: AI-Powered Learning Intelligence</strong>, Section 6.3.
      </InfoCallout>
    </section>
  );
}

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

// Corrected schema based on actual database
const competencyMappingFields: FieldDefinition[] = [
  { name: 'id', required: true, type: 'UUID', description: 'Unique mapping identifier', defaultValue: 'gen_random_uuid()', validation: 'Auto-generated' },
  { name: 'competency_id', required: true, type: 'UUID', description: 'Linked competency', defaultValue: '—', validation: 'References competencies.id' },
  { name: 'course_id', required: false, type: 'UUID', description: 'Linked internal course', defaultValue: 'null', validation: 'References lms_courses.id' },
  { name: 'vendor_course_id', required: false, type: 'UUID', description: 'Linked vendor course', defaultValue: 'null', validation: 'References vendor_courses.id' },
  { name: 'is_mandatory', required: false, type: 'boolean', description: 'Required for competency development', defaultValue: 'false', validation: 'true/false' },
  { name: 'notes', required: false, type: 'text', description: 'Additional context for mapping', defaultValue: 'null', validation: 'Free text' },
  { name: 'company_id', required: true, type: 'UUID', description: 'Company scope', defaultValue: '—', validation: 'References companies.id' },
  { name: 'created_at', required: true, type: 'timestamptz', description: 'Record creation timestamp', defaultValue: 'now()', validation: 'Auto-set' }
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
      'Link internal courses via course_id',
      'Link vendor courses via vendor_course_id',
      'Mark critical courses as is_mandatory'
    ],
    expectedResult: 'Courses linked to competency'
  },
  {
    title: 'Add Context Notes',
    description: 'Use the notes field to document mapping rationale.',
    notes: [
      'Explain why this course develops the competency',
      'Note any prerequisites or sequencing'
    ]
  },
  {
    title: 'Verify Bidirectional Sync',
    description: 'Confirm that course completions will update employee skill assessments.',
    notes: [
      'Sync happens via enrollment completion trigger',
      'Check employee_skill_assessments after course completion'
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
        'Link both internal and vendor courses to competencies',
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
                <li>4. Mandatory courses prioritized (is_mandatory = true)</li>
                <li>5. Both internal and vendor courses included</li>
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
                <li>5. Gap status recalculated</li>
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
                <li>• <code>lms_courses</code> - Internal courses</li>
                <li>• <code>vendor_courses</code> - External vendor courses</li>
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
        description="Shows the mapping interface with competency dropdown, course selection, and mandatory flag"
      />

      <Card>
        <CardHeader>
          <CardTitle>Course Type Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Internal Courses (course_id)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Courses hosted in your LMS with full progress tracking.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time completion detection</li>
                <li>• Quiz scores tracked</li>
                <li>• Certificates auto-issued</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Vendor Courses (vendor_course_id)</h4>
              <p className="text-sm text-muted-foreground mb-2">
                External courses from training providers.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manual or SSO completion sync</li>
                <li>• Budget tracking enabled</li>
                <li>• External certificate upload</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Best Practice:</strong> Map each competency to 2-3 courses at different levels. 
        Mark the foundational course as <code>is_mandatory = true</code> to prioritize it in 
        gap-based recommendations.
      </TipCallout>

      <InfoCallout>
        For AI-powered competency gap detection and course recommendations, refer to 
        <strong>Chapter 6: AI-Powered Learning Intelligence</strong>, Section 6.3.
      </InfoCallout>
    </section>
  );
}

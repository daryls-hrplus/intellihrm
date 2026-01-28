import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zap, Link2 } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function LndSetupCompetencyMapping() {
  const learningObjectives = [
    'Link courses to the competency framework',
    'Configure gap-based course recommendations',
    'Enable AI-driven learning suggestions',
    'Understand competency-course integration workflow'
  ];

  const mappingFields: FieldDefinition[] = [
    {
      name: 'company_id',
      required: false,
      type: 'uuid',
      description: 'Company-specific mapping (null = global)',
      defaultValue: 'null'
    },
    {
      name: 'competency_id',
      required: true,
      type: 'uuid',
      description: 'Reference to competency from performance module'
    },
    {
      name: 'course_id',
      required: true,
      type: 'uuid',
      description: 'Reference to course that develops this competency'
    },
    {
      name: 'proficiency_level_target',
      required: false,
      type: 'number',
      description: 'Target proficiency level this course helps achieve (1-5)',
      defaultValue: 'null',
      validation: '1-5'
    },
    {
      name: 'is_mandatory',
      required: false,
      type: 'boolean',
      description: 'Auto-assign course when competency gap detected',
      defaultValue: 'false'
    },
    {
      name: 'min_gap_level',
      required: false,
      type: 'number',
      description: 'Minimum gap size to trigger recommendation (1-5)',
      defaultValue: '1',
      validation: '1-5'
    },
    {
      name: 'notes',
      required: false,
      type: 'text',
      description: 'Mapping rationale or administrator notes'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Controls whether mapping is used for recommendations',
      defaultValue: 'true'
    }
  ];

  const createMappingSteps: Step[] = [
    {
      title: 'Navigate to Course Competencies',
      description: 'Go to Training → Course Competencies from the main navigation.',
      expectedResult: 'Competency mapping interface displays'
    },
    {
      title: 'Select Course to Map',
      description: 'Choose a course from the course list or search by title.',
      expectedResult: 'Course details and current mappings shown'
    },
    {
      title: 'Click Add Competency Mapping',
      description: 'Open the mapping dialog to link a competency.',
      expectedResult: 'Competency selection dialog opens'
    },
    {
      title: 'Select Competency',
      description: 'Choose the competency this course helps develop.',
      substeps: [
        'Filter by competency category if needed',
        'Select from active competencies only',
        'Review competency description for accuracy'
      ],
      notes: ['Competencies must be configured in Performance module first']
    },
    {
      title: 'Set Target Proficiency Level',
      description: 'Indicate what proficiency level this course helps achieve.',
      substeps: [
        'Level 1-2: Awareness, basic understanding',
        'Level 3: Working knowledge, can apply',
        'Level 4-5: Advanced, can teach others'
      ]
    },
    {
      title: 'Configure Gap Trigger',
      description: 'Set minimum gap level that triggers course recommendation.',
      notes: [
        'Gap = Required Level - Current Level',
        'min_gap_level = 1: Recommend for any gap',
        'min_gap_level = 2: Only recommend for significant gaps'
      ]
    },
    {
      title: 'Set Mandatory Flag (Optional)',
      description: 'Enable to auto-enroll employees when gap is detected.',
      notes: ['Use cautiously — auto-enrollment can create training overload']
    },
    {
      title: 'Save Mapping',
      description: 'Save the competency-course mapping.',
      expectedResult: 'Mapping active for gap-based recommendations'
    }
  ];

  const mappingExamples: ExampleConfig[] = [
    {
      title: 'Leadership Competency Development',
      context: 'Course develops leadership competency for managers',
      values: [
        { field: 'Competency', value: 'Leadership & People Management' },
        { field: 'Course', value: 'Effective Team Leadership' },
        { field: 'Target Level', value: '3 (Working Knowledge)' },
        { field: 'Min Gap', value: '1' },
        { field: 'Mandatory', value: 'false' }
      ],
      outcome: 'Course recommended when any leadership gap exists'
    },
    {
      title: 'Technical Skill Remediation',
      context: 'Mandatory course for significant skill gaps',
      values: [
        { field: 'Competency', value: 'Data Analysis' },
        { field: 'Course', value: 'Excel for Business Analysis' },
        { field: 'Target Level', value: '2 (Basic)' },
        { field: 'Min Gap', value: '2' },
        { field: 'Mandatory', value: 'true' }
      ],
      outcome: 'Auto-enrolled when gap of 2+ levels detected'
    },
    {
      title: 'Communication Skills',
      context: 'Soft skill development for all employees',
      values: [
        { field: 'Competency', value: 'Communication' },
        { field: 'Course', value: 'Professional Communication Skills' },
        { field: 'Target Level', value: '3' },
        { field: 'Min Gap', value: '1' },
        { field: 'Mandatory', value: 'false' }
      ],
      outcome: 'Suggested in development plans when gap exists'
    }
  ];

  const mappingRules: BusinessRule[] = [
    {
      rule: 'Competency must exist in Performance module',
      enforcement: 'System',
      description: 'Mappings can only reference active competencies defined in the competency framework.'
    },
    {
      rule: 'One course can map to multiple competencies',
      enforcement: 'System',
      description: 'Courses often develop multiple competencies. Create separate mappings for each.'
    },
    {
      rule: 'Gap detection uses latest assessment',
      enforcement: 'System',
      description: 'Recommendations based on most recent appraisal or competency assessment data.'
    },
    {
      rule: 'Mandatory mappings require manager approval',
      enforcement: 'Policy',
      description: 'Auto-enrolled courses from mandatory mappings should notify manager for awareness.'
    },
    {
      rule: 'Inactive mappings excluded from recommendations',
      enforcement: 'System',
      description: 'Set is_active = false to temporarily disable mapping without deleting.'
    }
  ];

  return (
    <section id="sec-2-7" data-manual-anchor="sec-2-7" className="space-y-6">
      <h2 className="text-2xl font-bold">2.7 Competency Mapping</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Competency mapping connects courses to the competency framework, enabling intelligent 
        learning recommendations based on identified skill gaps. This integration bridges 
        performance management and learning development for targeted employee growth.
      </p>

      <InfoCallout title="Prerequisites">
        Competency mapping requires the Performance module competency framework to be 
        configured first. Navigate to Performance → Competencies to verify competencies 
        are defined before creating mappings.
      </InfoCallout>

      {/* Integration Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Competency-Course Integration Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 border rounded-lg text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="font-medium">1. Gap Identified</div>
              <div className="text-muted-foreground text-xs mt-1">
                Appraisal reveals competency gap
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <div className="font-medium">2. AI Matching</div>
              <div className="text-muted-foreground text-xs mt-1">
                System finds mapped courses
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <Badge className="mx-auto mb-2">Recommended</Badge>
              <div className="font-medium">3. Recommendation</div>
              <div className="text-muted-foreground text-xs mt-1">
                Course appears in dev plan
              </div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-green-50 dark:bg-green-950/20">
              <div className="font-medium text-green-700 dark:text-green-400">4. Completion</div>
              <div className="text-muted-foreground text-xs mt-1">
                Progress tracked, gap reduced
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={mappingFields} 
        title="competency_course_mappings Table Schema" 
      />

      <StepByStep 
        steps={createMappingSteps} 
        title="Creating a Competency-Course Mapping" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.7.1: Competency Mapping Interface"
        alt="Interface showing course-competency mappings with gap settings"
      />

      <ConfigurationExample 
        examples={mappingExamples}
        title="Mapping Configuration Examples"
      />

      <BusinessRules 
        rules={mappingRules}
        title="Competency Mapping Business Rules"
      />

      <TipCallout title="Mapping Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Map each course to 1-3 primary competencies it develops</li>
          <li>• Use mandatory mapping sparingly to avoid training overload</li>
          <li>• Review mappings when competency framework changes</li>
          <li>• Set realistic target levels — one course rarely takes someone from 1 to 5</li>
          <li>• Include learning path courses in competency mappings for comprehensive development</li>
        </ul>
      </TipCallout>
    </section>
  );
}

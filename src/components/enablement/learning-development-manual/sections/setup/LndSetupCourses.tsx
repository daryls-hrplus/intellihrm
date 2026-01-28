import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  WarningCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndSetupCourses() {
  const learningObjectives = [
    'Create courses with comprehensive metadata configuration',
    'Configure difficulty levels, duration, and passing scores',
    'Set up mandatory vs. optional course designations',
    'Understand the course publishing workflow',
    'Configure course prerequisites and enrollment settings'
  ];

  const courseFields: FieldDefinition[] = [
    {
      name: 'code',
      required: true,
      type: 'text',
      description: 'Unique course identifier used in reports, certificates, and integrations',
      validation: '2-50 characters, alphanumeric with hyphens'
    },
    {
      name: 'title',
      required: true,
      type: 'text',
      description: 'Course title displayed to learners in catalog and enrollments',
      validation: '3-200 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Course overview, objectives, and target audience description',
      validation: 'Maximum 2000 characters, supports rich text'
    },
    {
      name: 'category_id',
      required: false,
      type: 'uuid',
      description: 'Reference to course category for catalog organization',
      defaultValue: 'null (uncategorized)'
    },
    {
      name: 'company_id',
      required: false,
      type: 'uuid',
      description: 'Company-specific course visibility (null = global/shared course)',
      defaultValue: 'null'
    },
    {
      name: 'difficulty_level',
      required: true,
      type: 'enum',
      description: 'Course complexity level: beginner, intermediate, or advanced',
      defaultValue: 'beginner',
      validation: 'One of: beginner, intermediate, advanced'
    },
    {
      name: 'duration_minutes',
      required: false,
      type: 'number',
      description: 'Estimated total completion time in minutes',
      validation: 'Integer > 0'
    },
    {
      name: 'passing_score',
      required: false,
      type: 'number',
      description: 'Minimum percentage score required for course completion',
      defaultValue: '70',
      validation: '0-100 (0 = completion only, no assessment required)'
    },
    {
      name: 'thumbnail_url',
      required: false,
      type: 'url',
      description: 'Course card image URL displayed in catalog',
      validation: 'Valid URL, recommended 16:9 aspect ratio, min 400x225px'
    },
    {
      name: 'certificate_template_id',
      required: false,
      type: 'uuid',
      description: 'Certificate template to generate upon successful completion',
      defaultValue: 'null (no certificate)'
    },
    {
      name: 'is_published',
      required: true,
      type: 'boolean',
      description: 'Controls course visibility in public catalog',
      defaultValue: 'false'
    },
    {
      name: 'is_mandatory',
      required: true,
      type: 'boolean',
      description: 'Flags course as required training (affects compliance reporting)',
      defaultValue: 'false'
    },
    {
      name: 'allow_self_enrollment',
      required: false,
      type: 'boolean',
      description: 'Allows employees to enroll without manager approval',
      defaultValue: 'true'
    },
    {
      name: 'max_enrollments',
      required: false,
      type: 'number',
      description: 'Maximum number of active enrollments (null = unlimited)',
      defaultValue: 'null'
    },
    {
      name: 'enrollment_start_date',
      required: false,
      type: 'date',
      description: 'Date when self-enrollment opens',
      defaultValue: 'null (immediate)'
    },
    {
      name: 'enrollment_end_date',
      required: false,
      type: 'date',
      description: 'Date when self-enrollment closes',
      defaultValue: 'null (no end date)'
    },
    {
      name: 'created_by',
      required: true,
      type: 'uuid',
      description: 'User ID of course creator',
      defaultValue: 'Current authenticated user'
    }
  ];

  const difficultyLevels = [
    {
      level: 'Beginner',
      targetAudience: 'New employees, role transitions, no prior knowledge required',
      typicalDuration: '< 60 minutes',
      prerequisites: 'None',
      assessmentStyle: 'Basic recall, simple multiple choice',
      examples: 'Company orientation, basic tool introductions, policy awareness'
    },
    {
      level: 'Intermediate',
      targetAudience: 'Experienced staff, skill development, foundational knowledge expected',
      typicalDuration: '1-3 hours',
      prerequisites: 'Related beginner course or equivalent experience',
      assessmentStyle: 'Application-based, scenario questions',
      examples: 'Advanced software features, process optimization, team leadership'
    },
    {
      level: 'Advanced',
      targetAudience: 'Subject matter experts, specialists, significant prior experience',
      typicalDuration: '3+ hours',
      prerequisites: 'Intermediate courses, certification, or demonstrated competency',
      assessmentStyle: 'Complex scenarios, case studies, practical demonstrations',
      examples: 'Expert certifications, strategic planning, specialized technical skills'
    }
  ];

  const createCourseSteps: Step[] = [
    {
      title: 'Navigate to Course Management',
      description: 'Go to Admin → LMS Management and select the Courses tab.',
      expectedResult: 'Course list displays with existing courses and Add Course button'
    },
    {
      title: 'Click Add Course',
      description: 'Click the "Add Course" button to open the course creation form.',
      expectedResult: 'Course creation dialog opens with empty fields'
    },
    {
      title: 'Enter Course Code',
      description: 'Enter a unique, descriptive course code that follows your naming convention.',
      substeps: [
        'Use department prefix: HR-101, IT-201, SALES-301',
        'Include version numbers for updated courses: GDPR-2024',
        'Keep codes memorable and sortable'
      ],
      notes: [
        'Course codes appear on certificates and reports',
        'Cannot be changed after course has enrollments'
      ],
      expectedResult: 'Code field validated as unique'
    },
    {
      title: 'Enter Course Title',
      description: 'Write a clear, descriptive title that communicates course content and value.',
      substeps: [
        'Start with action verb or topic: "Introduction to...", "Mastering...", "Advanced..."',
        'Include target outcome when possible',
        'Keep under 60 characters for display consistency'
      ]
    },
    {
      title: 'Write Course Description',
      description: 'Create a compelling description that explains objectives, audience, and outcomes.',
      substeps: [
        'Start with 1-2 sentence overview',
        'List 3-5 learning objectives',
        'Identify target audience',
        'Mention prerequisites if any',
        'Note estimated completion time'
      ]
    },
    {
      title: 'Select Category',
      description: 'Assign the course to an appropriate category for catalog organization.',
      notes: ['Categories must be created first (see Section 2.2)']
    },
    {
      title: 'Set Difficulty Level',
      description: 'Choose the appropriate difficulty based on target audience and content complexity.',
      expectedResult: 'Difficulty badge will display on course card'
    },
    {
      title: 'Enter Duration',
      description: 'Estimate total completion time based on content length and assessment time.',
      notes: [
        'Include time for all modules, lessons, and quizzes',
        'Add 10-20% buffer for reading and note-taking',
        'Duration helps learners plan their time'
      ]
    },
    {
      title: 'Configure Passing Score',
      description: 'Set the minimum score required for successful completion.',
      substeps: [
        '70% - Standard for most courses',
        '80% - Recommended for compliance/safety',
        '85-90% - Required for certifications',
        '0% - Completion-only, no assessment'
      ]
    },
    {
      title: 'Set Mandatory Flag',
      description: 'Enable if this course is required training for compliance or policy reasons.',
      notes: [
        'Mandatory courses appear in compliance dashboards',
        'Can be auto-assigned via compliance rules'
      ]
    },
    {
      title: 'Configure Enrollment Settings',
      description: 'Set self-enrollment permissions and any enrollment date restrictions.',
      substeps: [
        'Enable self-enrollment for optional training',
        'Disable for manager-assigned only courses',
        'Set date ranges for time-limited offerings'
      ]
    },
    {
      title: 'Upload Thumbnail (Optional)',
      description: 'Add a course card image to improve visual appeal in the catalog.',
      notes: [
        'Recommended: 400x225px (16:9 ratio)',
        'Use consistent branding across courses'
      ]
    },
    {
      title: 'Save as Draft',
      description: 'Save the course with is_published = false to continue adding content.',
      expectedResult: 'Course saved and visible in admin course list with "Draft" status'
    }
  ];

  const courseExamples: ExampleConfig[] = [
    {
      title: 'New Employee Orientation',
      context: 'Mandatory onboarding course for all new hires',
      values: [
        { field: 'Code', value: 'ONBOARD-001' },
        { field: 'Title', value: 'New Employee Orientation' },
        { field: 'Difficulty', value: 'beginner' },
        { field: 'Duration', value: '90 minutes' },
        { field: 'Passing Score', value: '80%' },
        { field: 'Mandatory', value: 'true' },
        { field: 'Self-Enrollment', value: 'false' }
      ],
      outcome: 'Auto-assigned to new employees, appears in compliance dashboard, manager-assigned only'
    },
    {
      title: 'Data Privacy Fundamentals',
      context: 'GDPR compliance training for all staff handling personal data',
      values: [
        { field: 'Code', value: 'GDPR-101' },
        { field: 'Title', value: 'Data Privacy Fundamentals (GDPR)' },
        { field: 'Difficulty', value: 'intermediate' },
        { field: 'Duration', value: '45 minutes' },
        { field: 'Passing Score', value: '85%' },
        { field: 'Mandatory', value: 'true' },
        { field: 'Certificate Template', value: 'compliance-cert' }
      ],
      outcome: 'Higher pass threshold for compliance, certificate issued on completion'
    },
    {
      title: 'Project Management Skills',
      context: 'Optional professional development for team leads',
      values: [
        { field: 'Code', value: 'PM-201' },
        { field: 'Title', value: 'Project Management Fundamentals' },
        { field: 'Difficulty', value: 'intermediate' },
        { field: 'Duration', value: '180 minutes' },
        { field: 'Passing Score', value: '70%' },
        { field: 'Mandatory', value: 'false' },
        { field: 'Self-Enrollment', value: 'true' }
      ],
      outcome: 'Available in catalog for self-enrollment, supports career development'
    }
  ];

  const courseRules: BusinessRule[] = [
    {
      rule: 'Course codes must be unique system-wide',
      enforcement: 'System',
      description: 'Duplicate codes rejected at save. Codes are case-insensitive for uniqueness.'
    },
    {
      rule: 'Unpublished courses hidden from catalog',
      enforcement: 'System',
      description: 'Courses with is_published = false only visible to administrators. Draft courses cannot receive enrollments.'
    },
    {
      rule: 'Published courses with enrollments cannot be deleted',
      enforcement: 'System',
      description: 'Courses with active or completed enrollments must be archived (is_active = false) rather than deleted.'
    },
    {
      rule: 'Mandatory courses must have passing score > 0',
      enforcement: 'Policy',
      description: 'For audit and compliance purposes, mandatory training should include assessment with minimum passing criteria.'
    },
    {
      rule: 'Company-specific courses visible only to company employees',
      enforcement: 'System',
      description: 'Courses with company_id set only appear in catalog for employees of that company.'
    },
    {
      rule: 'Course code immutable after first enrollment',
      enforcement: 'System',
      description: 'To maintain audit trail integrity, course codes cannot be modified once any learner has enrolled.'
    }
  ];

  return (
    <section id="sec-2-3" data-manual-anchor="sec-2-3" className="space-y-6">
      <h2 className="text-2xl font-bold">2.3 Course Creation & Structure</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Courses are the primary containers for learning content. A well-structured course 
        includes clear objectives, organized modules, engaging lessons, and appropriate 
        assessments. This section covers course-level configuration; content (modules/lessons) 
        is covered in Section 2.4.
      </p>

      <FieldReferenceTable 
        fields={courseFields} 
        title="lms_courses Table Schema" 
      />

      {/* Difficulty Level Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Difficulty Level Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium">Level</TableHead>
                  <TableHead className="font-medium">Target Audience</TableHead>
                  <TableHead className="font-medium">Duration</TableHead>
                  <TableHead className="font-medium">Prerequisites</TableHead>
                  <TableHead className="font-medium">Examples</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {difficultyLevels.map((level, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge 
                        variant={level.level === 'Beginner' ? 'secondary' : level.level === 'Intermediate' ? 'default' : 'destructive'}
                      >
                        {level.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{level.targetAudience}</TableCell>
                    <TableCell className="text-sm">{level.typicalDuration}</TableCell>
                    <TableCell className="text-sm">{level.prerequisites}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{level.examples}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={createCourseSteps} 
        title="Creating a New Course" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.3.1: Course Creation Form"
        alt="Course creation interface showing all configuration fields"
      />

      <ConfigurationExample 
        examples={courseExamples}
        title="Course Configuration Examples"
      />

      <WarningCallout title="Publishing Workflow">
        Do not publish courses until modules and lessons are complete. Published courses 
        appear immediately in the catalog and can receive enrollments. Use the "Preview" 
        feature to review course content before publishing.
      </WarningCallout>

      <BusinessRules 
        rules={courseRules}
        title="Course Business Rules"
      />

      {/* Course Lifecycle States */}
      <Card>
        <CardHeader>
          <CardTitle>Course Lifecycle States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div>
                <div className="font-medium">Draft</div>
                <div className="text-xs text-muted-foreground">Content in development</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <div>
                <div className="font-medium">In Review</div>
                <div className="text-xs text-muted-foreground">Pending approval</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div>
                <div className="font-medium">Published</div>
                <div className="text-xs text-muted-foreground">Live in catalog</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <div>
                <div className="font-medium">Archived</div>
                <div className="text-xs text-muted-foreground">Hidden, enrollments retained</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout title="Course Design Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Keep course duration between 30-120 minutes for optimal completion rates</li>
          <li>• Break longer content into multiple related courses</li>
          <li>• Use clear, outcome-focused titles ("Master Excel Pivot Tables" vs "Excel Training")</li>
          <li>• Write descriptions that answer "What will I learn?" and "Why does this matter?"</li>
          <li>• Set realistic duration estimates — underestimating frustrates learners</li>
        </ul>
      </TipCallout>
    </section>
  );
}

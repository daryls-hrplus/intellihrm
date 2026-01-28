import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, FileText, Video, FileDown, HelpCircle, Package } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function LndSetupModulesLessons() {
  const learningObjectives = [
    'Understand the Course → Module → Lesson hierarchy',
    'Create logically organized module structures',
    'Configure different lesson content types (text, video, document, quiz, SCORM)',
    'Set proper display ordering and sequencing',
    'Manage module and lesson publishing states'
  ];

  const moduleFields: FieldDefinition[] = [
    {
      name: 'course_id',
      required: true,
      type: 'uuid',
      description: 'Reference to parent course'
    },
    {
      name: 'title',
      required: true,
      type: 'text',
      description: 'Module title displayed to learners',
      validation: '3-200 characters'
    },
    {
      name: 'description',
      required: false,
      type: 'text',
      description: 'Module overview explaining what learners will cover',
      validation: 'Maximum 1000 characters'
    },
    {
      name: 'display_order',
      required: true,
      type: 'number',
      description: 'Sequence position within the course',
      defaultValue: '0',
      validation: 'Integer >= 0'
    },
    {
      name: 'is_published',
      required: true,
      type: 'boolean',
      description: 'Controls module visibility to learners',
      defaultValue: 'false'
    },
    {
      name: 'duration_minutes',
      required: false,
      type: 'number',
      description: 'Estimated module completion time (auto-calculated from lessons)',
      validation: 'Integer > 0'
    }
  ];

  const lessonFields: FieldDefinition[] = [
    {
      name: 'module_id',
      required: true,
      type: 'uuid',
      description: 'Reference to parent module'
    },
    {
      name: 'title',
      required: true,
      type: 'text',
      description: 'Lesson title displayed in course outline',
      validation: '3-200 characters'
    },
    {
      name: 'content_type',
      required: true,
      type: 'enum',
      description: 'Type of lesson content: text, video, document, quiz, scorm',
      defaultValue: 'text',
      validation: 'One of: text, video, document, quiz, scorm'
    },
    {
      name: 'content',
      required: false,
      type: 'text',
      description: 'Rich text content (for text content type)',
      validation: 'Markdown/HTML supported'
    },
    {
      name: 'video_url',
      required: false,
      type: 'url',
      description: 'Video URL (for video content type)',
      validation: 'YouTube, Vimeo, or direct video URL'
    },
    {
      name: 'document_url',
      required: false,
      type: 'url',
      description: 'Document URL (for document content type)',
      validation: 'PDF, Word, or other downloadable format'
    },
    {
      name: 'quiz_id',
      required: false,
      type: 'uuid',
      description: 'Reference to quiz (for quiz content type)'
    },
    {
      name: 'scorm_package_id',
      required: false,
      type: 'uuid',
      description: 'Reference to SCORM package (for scorm content type)'
    },
    {
      name: 'duration_minutes',
      required: false,
      type: 'number',
      description: 'Estimated lesson completion time',
      validation: 'Integer > 0'
    },
    {
      name: 'display_order',
      required: true,
      type: 'number',
      description: 'Sequence position within the module',
      defaultValue: '0'
    },
    {
      name: 'is_published',
      required: true,
      type: 'boolean',
      description: 'Controls lesson visibility to learners',
      defaultValue: 'false'
    },
    {
      name: 'is_required',
      required: false,
      type: 'boolean',
      description: 'Marks lesson as mandatory for module completion',
      defaultValue: 'true'
    }
  ];

  const contentTypes = [
    {
      type: 'text',
      icon: FileText,
      useCase: 'Explanatory content, policies, procedures, concept explanations',
      bestPractices: 'Use headers and bullet points; keep under 1000 words per lesson; include key takeaways',
      supported: 'Markdown, basic HTML, embedded images'
    },
    {
      type: 'video',
      icon: Video,
      useCase: 'Demonstrations, presentations, interviews, recorded training sessions',
      bestPractices: '5-10 minute segments; include captions; use professional lighting/audio',
      supported: 'YouTube, Vimeo, direct MP4/WebM URLs'
    },
    {
      type: 'document',
      icon: FileDown,
      useCase: 'Reference materials, procedures, templates, downloadable resources',
      bestPractices: 'PDF format for consistency; version control documents; keep file sizes reasonable',
      supported: 'PDF, Word, Excel, PowerPoint'
    },
    {
      type: 'quiz',
      icon: HelpCircle,
      useCase: 'Knowledge checks, assessments, certification tests',
      bestPractices: '5-10 questions for knowledge checks; clear question wording; include explanations',
      supported: 'Multiple choice, true/false, multi-select'
    },
    {
      type: 'scorm',
      icon: Package,
      useCase: 'Third-party eLearning content, interactive simulations, legacy content',
      bestPractices: 'SCORM 1.2 or 2004; test in staging first; verify tracking works',
      supported: 'SCORM 1.2, SCORM 2004 3rd/4th edition'
    }
  ];

  const createModuleSteps: Step[] = [
    {
      title: 'Open Course for Editing',
      description: 'Navigate to Admin → LMS Management → Courses and click on the target course.',
      expectedResult: 'Course detail view opens with Modules tab visible'
    },
    {
      title: 'Navigate to Modules Tab',
      description: 'Click the "Modules" tab to view existing modules and add new ones.',
      expectedResult: 'Module list displays (empty for new courses)'
    },
    {
      title: 'Click Add Module',
      description: 'Click "Add Module" button to create a new module.',
      expectedResult: 'Module creation form opens'
    },
    {
      title: 'Enter Module Title',
      description: 'Write a clear, descriptive title that indicates the module\'s learning focus.',
      substeps: [
        'Use numbered prefixes for sequence: "Module 1: Introduction"',
        'Keep titles concise but descriptive',
        'Indicate the topic or skill covered'
      ]
    },
    {
      title: 'Add Module Description',
      description: 'Write a brief overview of what learners will accomplish in this module.',
      notes: ['Description helps learners understand module scope and objectives']
    },
    {
      title: 'Set Display Order',
      description: 'Enter the sequence number for this module within the course.',
      substeps: [
        'Use increments of 10 (10, 20, 30) for flexibility',
        'Order should follow logical learning progression',
        'Foundational content comes before advanced topics'
      ]
    },
    {
      title: 'Save Module',
      description: 'Save the module (leave unpublished initially to add lessons).',
      expectedResult: 'Module appears in module list, ready for lessons'
    }
  ];

  const createLessonSteps: Step[] = [
    {
      title: 'Open Module for Editing',
      description: 'From the course modules list, click on the target module.',
      expectedResult: 'Module detail view opens with Lessons tab'
    },
    {
      title: 'Click Add Lesson',
      description: 'Click "Add Lesson" to create a new lesson within this module.',
      expectedResult: 'Lesson creation form opens'
    },
    {
      title: 'Enter Lesson Title',
      description: 'Write a specific, actionable title for the lesson.',
      substeps: [
        'Start with action verbs: "Understanding...", "Configuring...", "Practicing..."',
        'Be specific about the learning outcome',
        'Keep titles scannable in course outline'
      ]
    },
    {
      title: 'Select Content Type',
      description: 'Choose the appropriate content type based on the learning objective.',
      notes: [
        'Text: Best for concepts and procedures',
        'Video: Best for demonstrations',
        'Document: Best for reference materials',
        'Quiz: Best for knowledge validation',
        'SCORM: Best for interactive external content'
      ]
    },
    {
      title: 'Add Content',
      description: 'Populate the content field based on the selected type.',
      substeps: [
        'Text: Enter markdown/rich text content',
        'Video: Paste video URL (YouTube/Vimeo/direct)',
        'Document: Upload or link to document',
        'Quiz: Select from created quizzes',
        'SCORM: Select uploaded SCORM package'
      ]
    },
    {
      title: 'Set Duration Estimate',
      description: 'Enter the estimated completion time in minutes.',
      notes: [
        'Text: ~1 min per 200 words',
        'Video: actual video length + 20%',
        'Quiz: 2-3 min per question'
      ]
    },
    {
      title: 'Configure Required Status',
      description: 'Mark lesson as required or optional for module completion.',
      notes: ['Optional lessons good for supplementary/reference content']
    },
    {
      title: 'Save Lesson',
      description: 'Save the lesson and repeat for remaining lessons in the module.',
      expectedResult: 'Lesson appears in module lesson list'
    }
  ];

  const moduleRules: BusinessRule[] = [
    {
      rule: 'Modules require at least one lesson',
      enforcement: 'Advisory',
      description: 'Empty modules provide no learning value. Add at least one lesson before publishing.'
    },
    {
      rule: 'Module order determines learner navigation',
      enforcement: 'System',
      description: 'Modules appear to learners in display_order sequence. Ensure logical progression.'
    },
    {
      rule: 'Unpublished modules hidden from learners',
      enforcement: 'System',
      description: 'Learners only see modules with is_published = true. Use for staged content releases.'
    },
    {
      rule: 'Module completion requires all required lessons',
      enforcement: 'System',
      description: 'Learners must complete all lessons marked is_required = true to complete the module.'
    }
  ];

  return (
    <section id="sec-2-4" data-manual-anchor="sec-2-4" className="space-y-6">
      <h2 className="text-2xl font-bold">2.4 Modules & Lessons</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Modules and lessons form the content structure within courses. Modules group related 
        lessons into logical learning units, while lessons deliver the actual content. 
        A well-structured course typically has 3-5 modules, each containing 2-5 lessons.
      </p>

      {/* Hierarchy Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Course Content Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm bg-muted p-4 rounded-lg">
            <div className="text-primary font-bold">Course (GDPR-101: Data Privacy Fundamentals)</div>
            <div className="ml-4 border-l-2 border-muted-foreground/30 pl-4 mt-2 space-y-2">
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">├── Module 1: Introduction to GDPR</div>
                <div className="ml-4 text-muted-foreground">
                  <div>├── Lesson 1.1: What is GDPR? <Badge variant="secondary" className="ml-2 text-xs">video</Badge></div>
                  <div>├── Lesson 1.2: Key Principles <Badge variant="secondary" className="ml-2 text-xs">text</Badge></div>
                  <div>└── Lesson 1.3: Knowledge Check <Badge variant="secondary" className="ml-2 text-xs">quiz</Badge></div>
                </div>
              </div>
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">├── Module 2: Data Subject Rights</div>
                <div className="ml-4 text-muted-foreground">
                  <div>├── Lesson 2.1: Overview <Badge variant="secondary" className="ml-2 text-xs">video</Badge></div>
                  <div>├── Lesson 2.2: Practical Examples <Badge variant="secondary" className="ml-2 text-xs">text</Badge></div>
                  <div>└── Lesson 2.3: Reference Guide <Badge variant="secondary" className="ml-2 text-xs">document</Badge></div>
                </div>
              </div>
              <div>
                <div className="text-blue-600 dark:text-blue-400 font-semibold">└── Module 3: Final Assessment</div>
                <div className="ml-4 text-muted-foreground">
                  <div>└── Lesson 3.1: Certification Exam <Badge variant="secondary" className="ml-2 text-xs">quiz</Badge></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={moduleFields} 
        title="lms_modules Table Schema" 
      />

      <FieldReferenceTable 
        fields={lessonFields} 
        title="lms_lessons Table Schema" 
      />

      {/* Content Type Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Content Type Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-medium w-28">Type</TableHead>
                  <TableHead className="font-medium">Use Case</TableHead>
                  <TableHead className="font-medium">Best Practices</TableHead>
                  <TableHead className="font-medium">Supported Formats</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentTypes.map((ct, index) => {
                  const Icon = ct.icon;
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{ct.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{ct.useCase}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ct.bestPractices}</TableCell>
                      <TableCell className="text-sm">{ct.supported}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={createModuleSteps} 
        title="Creating a Module" 
      />

      <StepByStep 
        steps={createLessonSteps} 
        title="Creating a Lesson" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.4.1: Module and Lesson Management Interface"
        alt="Course structure view showing modules with nested lessons"
      />

      <BusinessRules 
        rules={moduleRules}
        title="Module & Lesson Business Rules"
      />

      <InfoCallout title="Duration Calculation">
        Course total duration is automatically calculated from the sum of all lesson durations. 
        Module duration is calculated from its lessons. Keep duration estimates accurate to 
        help learners plan their time effectively.
      </InfoCallout>

      <TipCallout title="Content Structure Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Limit modules to 3-5 per course for manageable chunks</li>
          <li>• Keep lessons focused on single concepts (5-15 minutes each)</li>
          <li>• Start each module with an overview, end with a knowledge check</li>
          <li>• Mix content types to maintain engagement (video → text → quiz)</li>
          <li>• Use consistent naming conventions across all courses</li>
          <li>• Include optional "deep dive" lessons for advanced learners</li>
        </ul>
      </TipCallout>
    </section>
  );
}

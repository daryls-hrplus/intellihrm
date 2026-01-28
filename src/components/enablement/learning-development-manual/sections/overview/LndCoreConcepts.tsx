import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Layers,
  ArrowRight,
  GraduationCap,
  FileText,
  Award,
  CheckCircle2,
  Users,
  Shield,
  Gamepad2,
  Building,
  Settings,
  PlayCircle,
  ClipboardCheck,
  Target,
  Zap,
  Database
} from 'lucide-react';
import { InfoCallout, TipCallout } from '@/components/enablement/manual/components/Callout';

export function LndCoreConcepts() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-1-2" data-manual-anchor="sec-1-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <BookOpen className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1.2 Core Concepts & Terminology</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                12 min read
              </Badge>
              <Badge variant="secondary" className="text-xs">Foundation</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Understanding L&D terminology is essential for effective system configuration. This section covers 
          30+ key concepts organized by domain, establishing a shared vocabulary for administrators, HR partners, 
          and implementation consultants.
        </p>

        {/* Hierarchical Concept Flows */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            Hierarchical Concept Flows
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Course Hierarchy */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  Course Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded">
                    <p className="font-semibold text-sm">Category</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-emerald-200 dark:bg-emerald-800/50 rounded">
                    <p className="font-semibold text-sm">Course</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-emerald-300 dark:bg-emerald-700/50 rounded">
                    <p className="font-semibold text-sm">Module</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-emerald-400 dark:bg-emerald-600/50 rounded">
                    <p className="font-semibold text-sm">Lesson</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  3-tier content structure aligned with enterprise LMS standards
                </p>
              </CardContent>
            </Card>

            {/* Enrollment Lifecycle */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                  Enrollment Lifecycle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                    <p className="font-semibold text-sm">Enrolled</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-blue-200 dark:bg-blue-800/50 rounded">
                    <p className="font-semibold text-sm">In Progress</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-blue-300 dark:bg-blue-700/50 rounded">
                    <p className="font-semibold text-sm">Completed</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-blue-400 dark:bg-blue-600/50 rounded">
                    <p className="font-semibold text-sm">Certified</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Tracks learner progress from enrollment to certification
                </p>
              </CardContent>
            </Card>

            {/* Learning Path Flow */}
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Learning Path Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center p-2 bg-purple-100 dark:bg-purple-900/50 rounded">
                    <p className="font-semibold text-sm">Path</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-purple-200 dark:bg-purple-800/50 rounded">
                    <p className="font-semibold text-sm">Milestone</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-purple-300 dark:bg-purple-700/50 rounded">
                    <p className="font-semibold text-sm">Courses</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-purple-400 dark:bg-purple-600/50 rounded">
                    <p className="font-semibold text-sm">Complete</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Structured journeys for skill development and career progression
                </p>
              </CardContent>
            </Card>

            {/* Compliance Framework */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-600" />
                  Compliance Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center p-2 bg-red-100 dark:bg-red-900/50 rounded">
                    <p className="font-semibold text-sm">Rule</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-red-200 dark:bg-red-800/50 rounded">
                    <p className="font-semibold text-sm">Assign</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-red-300 dark:bg-red-700/50 rounded">
                    <p className="font-semibold text-sm">Due Date</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center p-2 bg-red-400 dark:bg-red-600/50 rounded">
                    <p className="font-semibold text-sm">Recertify</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Mandatory training with automated recertification cycles
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Terminology by Domain */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            Terminology by Domain
          </h3>

          {/* Core LMS Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                Core LMS
                <Badge variant="outline" className="ml-2">8 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Course', def: 'A structured learning experience with defined objectives, modules, and assessments', table: 'lms_courses' },
                  { term: 'Module', def: 'A logical grouping of lessons within a course, representing a topic or skill area', table: 'lms_modules' },
                  { term: 'Lesson', def: 'The smallest unit of content—video, document, quiz, or interactive element', table: 'lms_lessons' },
                  { term: 'Category', def: 'Organizational grouping for courses (e.g., Compliance, Leadership, Technical)', table: 'lms_categories' },
                  { term: 'Enrollment', def: 'Registration of a learner for a specific course with tracking enabled', table: 'lms_enrollments' },
                  { term: 'Progress', def: 'Percentage or status of course/lesson completion for a learner', table: 'lms_lesson_progress' },
                  { term: 'Completion', def: 'Status indicating all required lessons and assessments are finished', table: 'lms_enrollments' },
                  { term: 'Certificate', def: 'Digital credential issued upon course completion', table: 'lms_certificates' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Learning Paths
                <Badge variant="outline" className="ml-2">4 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Learning Path', def: 'A curated sequence of courses designed to develop specific skills or competencies', table: 'learning_paths' },
                  { term: 'Prerequisite', def: 'Course or milestone required before accessing subsequent content', table: 'lms_course_prerequisites' },
                  { term: 'Milestone', def: 'Checkpoint within a learning path marking significant progress', table: 'learning_path_courses' },
                  { term: 'Path Enrollment', def: 'Registration for an entire learning path with progress tracking', table: 'learning_path_enrollments' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-blue-600" />
                Assessment
                <Badge variant="outline" className="ml-2">5 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Quiz', def: 'Assessment with questions to evaluate learner comprehension', table: 'lms_quizzes' },
                  { term: 'Question Type', def: 'Format of quiz question: multiple choice, true/false, fill-in-blank, etc.', table: 'lms_quiz_questions' },
                  { term: 'Passing Score', def: 'Minimum percentage required to pass a quiz or assessment', table: 'lms_quizzes' },
                  { term: 'Attempt', def: 'A single instance of taking a quiz with recorded answers and score', table: 'lms_quiz_attempts' },
                  { term: 'Retake Policy', def: 'Rules governing how many times a quiz can be retaken', table: 'lms_quizzes' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Compliance
                <Badge variant="outline" className="ml-2">4 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Mandatory Training', def: 'Required training for regulatory or policy compliance', table: 'compliance_training' },
                  { term: 'Recertification', def: 'Periodic re-completion of training to maintain compliance', table: 'compliance_training' },
                  { term: 'Grace Period', def: 'Time allowed after expiry before compliance status is revoked', table: 'compliance_training' },
                  { term: 'Compliance Assignment', def: 'Record linking employee to required training with due date', table: 'compliance_training_assignments' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SCORM/xAPI Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-600" />
                SCORM/xAPI Standards
                <Badge variant="outline" className="ml-2">4 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'SCORM Package', def: 'Standardized eLearning content package (SCORM 1.2 / 2004)', table: 'lms_scorm_packages' },
                  { term: 'xAPI Statement', def: 'Activity tracking record following Experience API specification', table: 'lms_xapi_statements' },
                  { term: 'CMI Data Model', def: 'SCORM runtime data model for learner progress and scoring', table: 'lms_scorm_tracking' },
                  { term: 'Completion Criteria', def: 'Rules determining when SCORM content is marked complete', table: 'lms_scorm_packages' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gamification Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gamepad2 className="h-4 w-4 text-purple-600" />
                Gamification
                <Badge variant="outline" className="ml-2">5 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Badge', def: 'Visual achievement award for completing courses or milestones', table: 'lms_badges' },
                  { term: 'Points', def: 'Numeric score accumulated through learning activities', table: 'lms_user_points' },
                  { term: 'Leaderboard', def: 'Ranking display comparing learner points or achievements', table: 'lms_leaderboards' },
                  { term: 'Achievement', def: 'Recognition for specific accomplishments in the LMS', table: 'lms_user_badges' },
                  { term: 'Point Transaction', def: 'Record of points earned or spent with source details', table: 'lms_point_transactions' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agency Management Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="h-4 w-4 text-cyan-600" />
                Agency Management
                <Badge variant="outline" className="ml-2">4 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Training Agency', def: 'External provider offering courses, certifications, or sessions', table: 'training_agencies' },
                  { term: 'Agency Course', def: 'Course offered by an external training provider', table: 'training_agency_courses' },
                  { term: 'Delivery Method', def: 'Format of training: In-person, Online, VILT, Blended, OJT', table: 'training_delivery_methods' },
                  { term: 'Session', def: 'Scheduled instance of a course with dates, times, and capacity', table: 'training_agency_courses' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operations Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                Operations
                <Badge variant="outline" className="ml-2">5 terms</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { term: 'Training Request', def: 'Employee-initiated or manager-assigned request for training', table: 'training_requests' },
                  { term: 'Approval Workflow', def: 'Multi-step process for request review and authorization', table: 'training_request_approvals' },
                  { term: 'Budget', def: 'Allocated funds for training by department, company, or period', table: 'training_budgets' },
                  { term: 'Cost Type', def: 'Classification of training costs: direct, indirect, support', table: 'training_cost_types' },
                  { term: 'Instructor', def: 'Internal or external trainer assigned to deliver courses', table: 'training_instructors' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.term}</p>
                      <Badge variant="outline" className="text-xs font-mono">{item.table}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Industry Alignment */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
            Industry Standards Alignment
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-600" />
                  SCORM Support
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• SCORM 1.2 (legacy content)</li>
                  <li>• SCORM 2004 (3rd/4th edition)</li>
                  <li>• xAPI (Tin Can) statements</li>
                  <li>• CMI data model compliance</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Enterprise LMS Patterns
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• 3-tier content hierarchy</li>
                  <li>• Competency-course mapping</li>
                  <li>• Learning path journeys</li>
                  <li>• Compliance automation</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="pt-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  HR Integration
                </h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• Workforce data sync</li>
                  <li>• Appraisal triggers</li>
                  <li>• Onboarding integration</li>
                  <li>• Succession linkage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <TipCallout title="Terminology Tip">
          When communicating with stakeholders, use business-friendly terms (Course, Training Path, Certificate) 
          rather than technical names (lms_courses, learning_paths, lms_certificates). The system supports 
          both conventions.
        </TipCallout>
      </section>
    </div>
  );
}

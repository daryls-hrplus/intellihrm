import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Clock, 
  Layers,
  ArrowRight,
  Table,
  GraduationCap,
  Target,
  Shield,
  Gamepad2,
  FileText,
  MessageSquare,
  Settings,
  Zap,
  Building,
  Users,
  Link2,
  Award
} from 'lucide-react';
import { InfoCallout, WarningCallout, TipCallout } from '@/components/enablement/manual/components/Callout';

export function LndArchitecture() {
  const domains = [
    {
      name: 'Core LMS',
      icon: GraduationCap,
      color: 'emerald',
      tableCount: 18,
      tables: [
        { name: 'lms_categories', purpose: 'Course organization groups', keyFields: 'name, code, parent_id, company_id' },
        { name: 'lms_courses', purpose: 'Course definitions', keyFields: 'title, description, category_id, duration_hours, thumbnail_url' },
        { name: 'lms_modules', purpose: 'Course module groupings', keyFields: 'title, course_id, order_index, duration_minutes' },
        { name: 'lms_lessons', purpose: 'Individual lesson content', keyFields: 'title, module_id, content_type, content_url, duration_minutes' },
        { name: 'lms_enrollments', purpose: 'Learner course registrations', keyFields: 'user_id, course_id, status, enrolled_at, completed_at' },
        { name: 'lms_lesson_progress', purpose: 'Per-lesson completion tracking', keyFields: 'enrollment_id, lesson_id, status, progress_percentage' },
        { name: 'lms_quizzes', purpose: 'Quiz configurations', keyFields: 'title, lesson_id, passing_score, time_limit_minutes, max_attempts' },
        { name: 'lms_quiz_questions', purpose: 'Quiz question bank', keyFields: 'quiz_id, question_text, question_type, options, correct_answer' },
        { name: 'lms_quiz_attempts', purpose: 'Quiz attempt records', keyFields: 'quiz_id, user_id, score, passed, attempt_number' },
        { name: 'lms_certificates', purpose: 'Issued certificates', keyFields: 'enrollment_id, certificate_number, issued_at, expires_at' },
        { name: 'lms_course_prerequisites', purpose: 'Course prerequisite rules', keyFields: 'course_id, prerequisite_course_id' },
        { name: 'lms_course_reviews', purpose: 'Course ratings and feedback', keyFields: 'course_id, user_id, rating, review_text' },
      ],
    },
    {
      name: 'Learning Paths',
      icon: Target,
      color: 'purple',
      tableCount: 3,
      tables: [
        { name: 'learning_paths', purpose: 'Curated course sequences', keyFields: 'title, description, skill_level, estimated_hours' },
        { name: 'learning_path_courses', purpose: 'Path-course relationships', keyFields: 'learning_path_id, course_id, order_index, is_required' },
        { name: 'learning_path_enrollments', purpose: 'Path enrollment tracking', keyFields: 'learning_path_id, user_id, status, progress_percentage' },
      ],
    },
    {
      name: 'Compliance',
      icon: Shield,
      color: 'red',
      tableCount: 4,
      tables: [
        { name: 'compliance_training', purpose: 'Mandatory training rules', keyFields: 'course_id, target_audience, recertification_months, grace_period_days' },
        { name: 'compliance_training_assignments', purpose: 'Employee compliance records', keyFields: 'compliance_training_id, user_id, due_date, completed_at, status' },
        { name: 'compliance_items', purpose: 'Compliance requirement definitions', keyFields: 'name, category, jurisdiction, frequency' },
        { name: 'compliance_document_templates', purpose: 'Certificate templates', keyFields: 'name, content, format, variables' },
      ],
    },
    {
      name: 'Training Operations',
      icon: Settings,
      color: 'amber',
      tableCount: 18,
      tables: [
        { name: 'training_requests', purpose: 'Training request records', keyFields: 'employee_id, course_id, request_type, status, requested_at' },
        { name: 'training_request_approvals', purpose: 'Approval workflow steps', keyFields: 'request_id, approver_id, status, comments, decided_at' },
        { name: 'training_budgets', purpose: 'Department/company budgets', keyFields: 'company_id, department_id, fiscal_year, allocated_amount, spent_amount' },
        { name: 'training_instructors', purpose: 'Instructor profiles', keyFields: 'name, email, instructor_type, specializations, is_active' },
        { name: 'training_evaluations', purpose: 'Post-training feedback', keyFields: 'enrollment_id, overall_rating, feedback_text, submitted_at' },
        { name: 'training_evaluation_responses', purpose: 'Evaluation question answers', keyFields: 'evaluation_id, question_id, response_value' },
        { name: 'training_programs', purpose: 'Training program definitions', keyFields: 'name, description, program_type, target_audience' },
        { name: 'training_needs', purpose: 'Identified training needs', keyFields: 'employee_id, skill_id, priority, source, status' },
        { name: 'training_needs_analysis', purpose: 'TNA batch records', keyFields: 'company_id, analysis_period, methodology, findings' },
        { name: 'training_analytics', purpose: 'Aggregated training metrics', keyFields: 'company_id, metric_type, metric_value, period' },
        { name: 'training_certificate_templates', purpose: 'Certificate design templates', keyFields: 'name, html_template, variables, company_id' },
        { name: 'external_training_records', purpose: 'External training history', keyFields: 'employee_id, course_name, provider, completion_date, duration_hours' },
      ],
    },
    {
      name: 'SCORM/xAPI',
      icon: FileText,
      color: 'cyan',
      tableCount: 3,
      tables: [
        { name: 'lms_scorm_packages', purpose: 'SCORM content packages', keyFields: 'course_id, version, package_url, completion_criteria' },
        { name: 'lms_scorm_tracking', purpose: 'SCORM runtime data', keyFields: 'enrollment_id, package_id, cmi_data, completion_status' },
        { name: 'lms_xapi_statements', purpose: 'xAPI learning records', keyFields: 'actor, verb, object, result, timestamp' },
      ],
    },
    {
      name: 'Gamification',
      icon: Gamepad2,
      color: 'pink',
      tableCount: 5,
      tables: [
        { name: 'lms_badges', purpose: 'Badge definitions', keyFields: 'name, description, image_url, criteria, points_value' },
        { name: 'lms_user_badges', purpose: 'Earned badges', keyFields: 'user_id, badge_id, earned_at, source_enrollment_id' },
        { name: 'lms_user_points', purpose: 'User point balances', keyFields: 'user_id, total_points, level, last_updated' },
        { name: 'lms_point_transactions', purpose: 'Point history', keyFields: 'user_id, points, transaction_type, source, created_at' },
        { name: 'lms_leaderboards', purpose: 'Ranking configurations', keyFields: 'name, scope, ranking_type, time_period' },
      ],
    },
    {
      name: 'Discussion & Social',
      icon: MessageSquare,
      color: 'blue',
      tableCount: 5,
      tables: [
        { name: 'lms_discussion_forums', purpose: 'Course discussion areas', keyFields: 'course_id, title, description, is_active' },
        { name: 'lms_discussion_threads', purpose: 'Forum thread posts', keyFields: 'forum_id, user_id, title, content, created_at' },
        { name: 'lms_discussion_replies', purpose: 'Thread replies', keyFields: 'thread_id, user_id, content, created_at' },
        { name: 'lms_bookmarks', purpose: 'User content bookmarks', keyFields: 'user_id, lesson_id, notes, created_at' },
        { name: 'lms_notes', purpose: 'Lesson notes', keyFields: 'user_id, lesson_id, content, timestamp' },
      ],
    },
    {
      name: 'Competency Integration',
      icon: Award,
      color: 'orange',
      tableCount: 2,
      tables: [
        { name: 'course_competencies', purpose: 'Course-skill mapping', keyFields: 'course_id, competency_id, proficiency_level' },
        { name: 'course_instructors', purpose: 'Course-instructor assignment', keyFields: 'course_id, instructor_id, role' },
      ],
    },
    {
      name: 'Interactive Training',
      icon: Zap,
      color: 'indigo',
      tableCount: 7,
      tables: [
        { name: 'training_content', purpose: 'Interactive content items', keyFields: 'training_id, content_type, sequence, media_url' },
        { name: 'training_content_progress', purpose: 'Interactive progress', keyFields: 'user_id, content_id, status, score' },
        { name: 'training_branch_rules', purpose: 'Branching scenario rules', keyFields: 'content_id, condition, next_content_id' },
        { name: 'training_quiz_questions', purpose: 'Interactive quiz items', keyFields: 'training_id, question_text, question_type' },
        { name: 'training_quiz_attempts', purpose: 'Interactive quiz results', keyFields: 'user_id, training_id, score, completed_at' },
        { name: 'training_modules', purpose: 'Interactive module structure', keyFields: 'training_id, title, order_index' },
        { name: 'training_enrollments', purpose: 'Interactive enrollment', keyFields: 'user_id, training_id, status' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section id="sec-1-4" data-manual-anchor="sec-1-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Database className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1.4 System Architecture</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                20 min read
              </Badge>
              <Badge variant="secondary" className="text-xs">Technical</Badge>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          The L&D module comprises <strong>63 database tables</strong> organized across <strong>9 functional domains</strong>. 
          This architecture supports the complete training lifecycle from course creation through certification and compliance tracking.
        </p>

        {/* ER Diagram ASCII */}
        <Card className="mb-8 overflow-x-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-600" />
              Data Model Overview (63 Tables)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────────────────────┐
│                    LEARNING & DEVELOPMENT DATA MODEL (63 Tables)                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   CORE LMS (18 tables):                                                             │
│   ┌───────────────┐     ┌───────────────┐     ┌───────────────┐                    │
│   │ lms_categories│◄────│  lms_courses  │────►│  lms_modules  │                    │
│   │               │     │               │     │               │                    │
│   │ • name        │     │ • title       │     │ • title       │                    │
│   │ • code        │     │ • category_id │     │ • course_id   │                    │
│   │ • parent_id   │     │ • duration    │     │ • order_index │                    │
│   └───────────────┘     └───────┬───────┘     └───────┬───────┘                    │
│                                 │                     │                             │
│                        ┌────────▼────────┐   ┌────────▼────────┐                   │
│                        │ lms_enrollments │   │  lms_lessons    │                   │
│                        │                 │   │                 │                   │
│                        │ • user_id       │   │ • title         │                   │
│                        │ • course_id     │   │ • module_id     │                   │
│                        │ • status        │   │ • content_type  │                   │
│                        │ • completed_at  │   │ • content_url   │                   │
│                        └────────┬────────┘   └────────┬────────┘                   │
│                                 │                     │                             │
│                        ┌────────▼────────┐   ┌────────▼────────┐                   │
│                        │ lms_lesson_     │   │   lms_quizzes   │                   │
│                        │ progress        │   │                 │                   │
│                        │ • enrollment_id │   │ • lesson_id     │                   │
│                        │ • lesson_id     │   │ • passing_score │                   │
│                        │ • status        │   │ • max_attempts  │                   │
│                        └─────────────────┘   └────────┬────────┘                   │
│                                                       │                             │
│                                              ┌────────▼────────┐                   │
│                                              │ lms_quiz_       │                   │
│                                              │ questions       │                   │
│                                              │ • question_text │                   │
│                                              │ • question_type │                   │
│                                              └────────┬────────┘                   │
│                                              ┌────────▼────────┐                   │
│                                              │ lms_quiz_       │                   │
│                                              │ attempts        │                   │
│                                              │ • score         │                   │
│                                              │ • passed        │                   │
│                                              └─────────────────┘                   │
│                                                                                     │
│   LEARNING PATHS (3):            COMPLIANCE (4):           GAMIFICATION (5):       │
│   ┌───────────────┐             ┌───────────────┐         ┌───────────────┐        │
│   │ learning_paths│             │ compliance_   │         │  lms_badges   │        │
│   │ • title       │             │ training      │         │ • name        │        │
│   │ • skill_level │             │ • course_id   │         │ • points      │        │
│   └───────┬───────┘             │ • recert_mo   │         └───────┬───────┘        │
│   ┌───────▼───────┐             └───────┬───────┘         ┌───────▼───────┐        │
│   │ learning_path_│             ┌───────▼───────┐         │ lms_user_     │        │
│   │ courses       │             │ compliance_   │         │ badges        │        │
│   └───────┬───────┘             │ assignments   │         └───────────────┘        │
│   ┌───────▼───────┐             └───────────────┘         ┌───────────────┐        │
│   │ learning_path_│                                       │ lms_user_     │        │
│   │ enrollments   │                                       │ points        │        │
│   └───────────────┘                                       └───────────────┘        │
│                                                                                     │
│   TRAINING OPERATIONS (18):      SCORM/xAPI (3):          DISCUSSION (5):          │
│   training_requests              lms_scorm_packages       lms_discussion_forums    │
│   training_request_approvals     lms_scorm_tracking       lms_discussion_threads   │
│   training_budgets               lms_xapi_statements      lms_discussion_replies   │
│   training_instructors                                    lms_bookmarks            │
│   training_evaluations                                    lms_notes                │
│   training_programs                                                                 │
│   external_training_records                                                         │
│                                                                                     │
│   COMPETENCY (2):                INTERACTIVE (7):                                   │
│   course_competencies            training_content, training_modules                 │
│   course_instructors             training_content_progress, training_branch_rules   │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </CardContent>
        </Card>

        {/* Domain Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-600" />
            Domain Summary
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {domains.map((domain, idx) => (
              <Card key={idx} className={`text-center border-${domain.color}-200 dark:border-${domain.color}-800`}>
                <CardContent className="pt-4 pb-3">
                  <domain.icon className={`h-6 w-6 mx-auto mb-2 text-${domain.color}-600`} />
                  <p className="font-semibold text-sm">{domain.name}</p>
                  <Badge variant="outline" className="mt-1">{domain.tableCount} tables</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Domain Tables */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Table className="h-5 w-5 text-emerald-600" />
            Domain Table Reference
          </h3>

          {domains.slice(0, 5).map((domain, idx) => (
            <Card key={idx} className={`border-${domain.color}-200 dark:border-${domain.color}-800`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <domain.icon className={`h-4 w-4 text-${domain.color}-600`} />
                  {domain.name}
                  <Badge variant="outline" className="ml-2">{domain.tableCount} tables</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Table</th>
                        <th className="text-left p-2 font-semibold">Purpose</th>
                        <th className="text-left p-2 font-semibold">Key Fields</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domain.tables.slice(0, 8).map((table, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="p-2 font-mono text-xs">{table.name}</td>
                          <td className="p-2 text-muted-foreground">{table.purpose}</td>
                          <td className="p-2 text-xs text-muted-foreground">{table.keyFields}</td>
                        </tr>
                      ))}
                      {domain.tables.length > 8 && (
                        <tr>
                          <td colSpan={3} className="p-2 text-xs text-muted-foreground italic">
                            +{domain.tables.length - 8} more tables...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Flow Architecture */}
        <div className="mt-8 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-emerald-600" />
            Data Flow Architecture
          </h3>
          
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {[
                  { layer: 'Foundation Layer', color: 'gray', items: ['profiles (employees)', 'departments', 'jobs', 'companies'] },
                  { layer: 'Content Layer', color: 'emerald', items: ['lms_categories', 'lms_courses', 'lms_modules', 'lms_lessons'] },
                  { layer: 'Engagement Layer', color: 'blue', items: ['lms_enrollments', 'lms_lesson_progress', 'lms_quiz_attempts', 'lms_certificates'] },
                  { layer: 'Operations Layer', color: 'amber', items: ['training_requests', 'training_budgets', 'compliance_assignments', 'training_evaluations'] },
                  { layer: 'Intelligence Layer', color: 'purple', items: ['training_analytics', 'training_needs', 'AI recommendations', 'gap analysis'] },
                ].map((layer, idx) => (
                  <div key={idx} className={`p-3 bg-${layer.color}-50 dark:bg-${layer.color}-950/30 rounded-lg border-l-4 border-${layer.color}-500`}>
                    <p className={`font-semibold text-${layer.color}-700 dark:text-${layer.color}-400`}>{layer.layer}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {layer.items.map((item, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-mono">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Dependencies */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-emerald-600" />
            Cross-Module Dependencies
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { module: 'Workforce', icon: Users, desc: 'Employee profiles, manager hierarchy, department structure', required: true },
              { module: 'Performance', icon: Award, desc: 'Competency framework, skill definitions, gap analysis', required: false },
              { module: 'Onboarding', icon: Zap, desc: 'Auto-enrollment triggers for new hires', required: false },
              { module: 'Appraisals', icon: Target, desc: 'Training triggers from performance ratings', required: false },
            ].map((dep, idx) => (
              <Card key={idx}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <dep.icon className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{dep.module} Module</p>
                        <Badge variant={dep.required ? 'default' : 'outline'} className="text-xs">
                          {dep.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{dep.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <WarningCallout title="Implementation Note">
          The <strong>Workforce module must be configured before L&D</strong>. Employee records, departments, 
          and manager hierarchy are required for enrollments, team training views, and approval workflows.
        </WarningCallout>

        <TipCallout title="Performance Optimization">
          For large organizations (10,000+ employees), consider enabling database indexes on frequently queried 
          columns: <code>lms_enrollments.user_id</code>, <code>lms_lesson_progress.enrollment_id</code>, 
          and <code>compliance_training_assignments.due_date</code>.
        </TipCallout>
      </section>
    </div>
  );
}

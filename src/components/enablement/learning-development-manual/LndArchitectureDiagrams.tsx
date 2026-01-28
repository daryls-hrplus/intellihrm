import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Database, Layers, BookOpen, Award, Users, Calendar, BarChart3, Link2, Gamepad2, MessageSquare, ClipboardCheck } from 'lucide-react';

export function LndArchitectureDiagrams() {
  return (
    <div className="space-y-8" id="diagrams" data-manual-anchor="diagrams">
      <section>
        <h2 className="text-2xl font-bold mb-4">Appendix B: Architecture Diagrams</h2>
        <p className="text-muted-foreground mb-6">
          Complete database architecture reference for the Learning & Development module. 
          The L&D module comprises <strong>69 database tables</strong> organized across 10 functional domains.
        </p>
      </section>

      {/* Course Content Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Course Content Hierarchy
          </CardTitle>
          <CardDescription>Core content structure: Categories → Courses → Modules → Lessons</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────┐
│                      lms_categories                          │
│    (code, name, description, icon, display_order, company_id)│
└─────────────────────┬────────────────────────────────────────┘
                      │ 1:N
┌─────────────────────▼────────────────────────────────────────┐
│                       lms_courses                            │
│    (code, title, description, difficulty_level, duration)    │
│    (passing_score, is_mandatory, is_published, thumbnail)    │
│    (allow_self_enrollment, max_enrollments, enrollment_dates)│
└─────────────────────┬────────────────────────────────────────┘
                      │ 1:N
┌─────────────────────▼────────────────────────────────────────┐
│                       lms_modules                            │
│         (title, description, display_order, is_published)    │
└─────────────────────┬────────────────────────────────────────┘
                      │ 1:N
┌─────────────────────▼────────────────────────────────────────┐
│                       lms_lessons                            │
│  (title, content_type, content, video_url, document_url)     │
│  (duration_minutes, display_order, is_published, quiz_id)    │
└─────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      {/* Database Table Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Database Table Inventory (69 Tables)
          </CardTitle>
          <CardDescription>Complete list of all L&D database tables organized by domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core LMS Tables */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Core LMS (20 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_categories</TableCell>
                  <TableCell>Course groupings for catalog organization</TableCell>
                  <TableCell>code, name, icon, display_order, company_id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_courses</TableCell>
                  <TableCell>Main course records</TableCell>
                  <TableCell>code, title, difficulty_level, passing_score, allow_self_enrollment, max_enrollments</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_modules</TableCell>
                  <TableCell>Course modules/chapters</TableCell>
                  <TableCell>course_id, title, display_order</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_lessons</TableCell>
                  <TableCell>Individual lesson content</TableCell>
                  <TableCell>module_id, content_type, content</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_enrollments</TableCell>
                  <TableCell>Learner course enrollments</TableCell>
                  <TableCell>user_id, course_id, status, enrolled_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_lesson_progress</TableCell>
                  <TableCell>Lesson completion tracking</TableCell>
                  <TableCell>user_id, lesson_id, completed_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_course_reviews</TableCell>
                  <TableCell>Learner course ratings/reviews</TableCell>
                  <TableCell>user_id, course_id, rating, review_text</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_review_helpful</TableCell>
                  <TableCell>Review voting (helpful/not helpful)</TableCell>
                  <TableCell>review_id, user_id, is_helpful</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_quizzes</TableCell>
                  <TableCell>Quiz/assessment definitions</TableCell>
                  <TableCell>course_id, passing_score, time_limit, shuffle_options, show_explanations, allow_review</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_quiz_questions</TableCell>
                  <TableCell>Quiz questions</TableCell>
                  <TableCell>quiz_id, question_type, options, correct_answer</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_quiz_attempts</TableCell>
                  <TableCell>Quiz attempt records</TableCell>
                  <TableCell>user_id, quiz_id, score, passed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_certificates</TableCell>
                  <TableCell>Issued certificates</TableCell>
                  <TableCell>user_id, course_id, issued_at, expires_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_bookmarks</TableCell>
                  <TableCell>Learner course bookmarks</TableCell>
                  <TableCell>user_id, course_id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_course_tags</TableCell>
                  <TableCell>Course tag assignments</TableCell>
                  <TableCell>course_id, tag</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_notifications</TableCell>
                  <TableCell>Training notifications</TableCell>
                  <TableCell>user_id, type, message, is_read</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_announcements</TableCell>
                  <TableCell>Course announcements</TableCell>
                  <TableCell>course_id, title, content, publish_date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_course_prerequisites</TableCell>
                  <TableCell>Course prerequisite links</TableCell>
                  <TableCell>course_id, prerequisite_course_id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_waitlist</TableCell>
                  <TableCell>Session waitlist entries</TableCell>
                  <TableCell>user_id, session_id, position, added_at</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Learning Paths */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Learning Paths (3 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">learning_paths</TableCell>
                  <TableCell>Learning path definitions</TableCell>
                  <TableCell>code, name, target_audience, is_mandatory</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">learning_path_courses</TableCell>
                  <TableCell>Courses within paths</TableCell>
                  <TableCell>learning_path_id, course_id, sequence_order</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">learning_path_enrollments</TableCell>
                  <TableCell>Path enrollment records</TableCell>
                  <TableCell>user_id, learning_path_id, status</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Training Operations */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Training Operations (18 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_requests</TableCell>
                  <TableCell>Employee training requests</TableCell>
                  <TableCell>employee_id, course_id, status, source_type</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_budgets</TableCell>
                  <TableCell>Departmental training budgets</TableCell>
                  <TableCell>department_id, fiscal_year, allocated_amount</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_instructors</TableCell>
                  <TableCell>Instructor profiles</TableCell>
                  <TableCell>name, instructor_type, specializations</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_evaluations</TableCell>
                  <TableCell>Post-training evaluation forms</TableCell>
                  <TableCell>name, evaluation_level, questions</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_evaluation_responses</TableCell>
                  <TableCell>Completed evaluations</TableCell>
                  <TableCell>evaluation_id, user_id, responses</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_agencies</TableCell>
                  <TableCell>External training providers</TableCell>
                  <TableCell>name, contact_info, rating</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_agency_courses</TableCell>
                  <TableCell>Agency course offerings</TableCell>
                  <TableCell>agency_id, course_name, cost</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_sessions</TableCell>
                  <TableCell>ILT session scheduling</TableCell>
                  <TableCell>course_id, instructor_id, start_time, capacity</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_session_attendees</TableCell>
                  <TableCell>Session attendance records</TableCell>
                  <TableCell>session_id, user_id, attendance_status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_certificate_templates</TableCell>
                  <TableCell>Certificate template designs</TableCell>
                  <TableCell>name, template_html, is_default</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_quiz_options</TableCell>
                  <TableCell>Quiz answer choices</TableCell>
                  <TableCell>question_id, option_text, is_correct</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_quiz_answers</TableCell>
                  <TableCell>Submitted quiz answers</TableCell>
                  <TableCell>attempt_id, question_id, selected_option</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_remediation</TableCell>
                  <TableCell>Remedial training rules</TableCell>
                  <TableCell>trigger_condition, remediation_course_id, is_active</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_topics</TableCell>
                  <TableCell>Topic definitions for tagging</TableCell>
                  <TableCell>name, description, parent_topic_id</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_content_topics</TableCell>
                  <TableCell>Topic assignments to content</TableCell>
                  <TableCell>content_id, topic_id, content_type</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_module_progress</TableCell>
                  <TableCell>Module-level progress tracking</TableCell>
                  <TableCell>user_id, module_id, started_at, completed_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">external_training_records</TableCell>
                  <TableCell>External training completions</TableCell>
                  <TableCell>employee_id, training_name, provider_name, certificate_url</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">course_instructors</TableCell>
                  <TableCell>Course-instructor assignments</TableCell>
                  <TableCell>course_id, instructor_id, role</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Compliance Training */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Compliance Training (4 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">compliance_training</TableCell>
                  <TableCell>Mandatory training rules</TableCell>
                  <TableCell>course_id, frequency_months, target_departments</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">compliance_training_assignments</TableCell>
                  <TableCell>Individual compliance assignments</TableCell>
                  <TableCell>employee_id, compliance_training_id, due_date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">compliance_training_exemptions</TableCell>
                  <TableCell>Exemption records</TableCell>
                  <TableCell>employee_id, compliance_training_id, reason</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_remediation</TableCell>
                  <TableCell>Remedial training rules</TableCell>
                  <TableCell>trigger_condition, remediation_course_id</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* SCORM/xAPI */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              SCORM/xAPI Integration (3 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_scorm_packages</TableCell>
                  <TableCell>Uploaded SCORM packages</TableCell>
                  <TableCell>course_id, package_url, scorm_version</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_scorm_tracking</TableCell>
                  <TableCell>SCORM runtime data</TableCell>
                  <TableCell>user_id, package_id, cmi_data, completion_status</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_xapi_statements</TableCell>
                  <TableCell>xAPI/Tin Can statements</TableCell>
                  <TableCell>actor, verb, object, context, timestamp</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Gamification */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Gamification (5 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_badges</TableCell>
                  <TableCell>Badge definitions</TableCell>
                  <TableCell>name, badge_type, criteria, points</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_user_badges</TableCell>
                  <TableCell>Awarded badges</TableCell>
                  <TableCell>user_id, badge_id, earned_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_points</TableCell>
                  <TableCell>Point transactions</TableCell>
                  <TableCell>user_id, points, source, earned_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_leaderboards</TableCell>
                  <TableCell>Leaderboard definitions</TableCell>
                  <TableCell>name, scope, calculation_method</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_achievements</TableCell>
                  <TableCell>Achievement milestones</TableCell>
                  <TableCell>name, criteria, reward_badge_id</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Discussion & Social */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussion & Social Learning (5 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_discussion_forums</TableCell>
                  <TableCell>Course discussion forums</TableCell>
                  <TableCell>course_id, title, is_moderated</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_discussion_threads</TableCell>
                  <TableCell>Forum discussion threads</TableCell>
                  <TableCell>forum_id, user_id, title, content</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_discussion_replies</TableCell>
                  <TableCell>Thread replies</TableCell>
                  <TableCell>thread_id, user_id, content</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_mentorship_programs</TableCell>
                  <TableCell>Mentorship program definitions</TableCell>
                  <TableCell>name, duration_months, matching_criteria</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_mentor_assignments</TableCell>
                  <TableCell>Mentor-mentee pairings</TableCell>
                  <TableCell>mentor_id, mentee_id, program_id, status</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Competency Integration */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Competency Integration (2 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">competency_course_mappings</TableCell>
                  <TableCell>Course-competency links</TableCell>
                  <TableCell>competency_id, course_id, is_mandatory</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">training_skill_requirements</TableCell>
                  <TableCell>Course skill prerequisites</TableCell>
                  <TableCell>course_id, skill_id, required_level</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Interactive Training */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Interactive & Virtual Training (4 tables)
            </h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Key Fields</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_virtual_classrooms</TableCell>
                  <TableCell>Virtual classroom sessions</TableCell>
                  <TableCell>course_id, platform, meeting_url, scheduled_at</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_virtual_attendance</TableCell>
                  <TableCell>Virtual session attendance</TableCell>
                  <TableCell>classroom_id, user_id, join_time, duration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_simulations</TableCell>
                  <TableCell>Training simulations</TableCell>
                  <TableCell>course_id, simulation_type, config</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">lms_simulation_results</TableCell>
                  <TableCell>Simulation attempt results</TableCell>
                  <TableCell>simulation_id, user_id, score, feedback</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment & Progress Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Enrollment & Progress Tracking Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Employee   │────▶│  lms_enrollments │────▶│ lms_lesson_progress│
│  (profiles)  │     │   (status)       │     │   (completed_at)   │
└──────────────┘     └────────┬─────────┘     └──────────┬─────────┘
                              │                          │
                              ▼                          ▼
                    ┌─────────────────┐       ┌───────────────────┐
                    │ lms_quiz_attempts│       │  lms_certificates  │
                    │ (score, passed)  │       │ (issued_at, expires)│
                    └─────────────────┘       └───────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      {/* Compliance Assignment Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-red-600" />
            Compliance Training Assignment Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌────────────────────┐     ┌─────────────────────────────┐
│ compliance_training │────▶│compliance_training_assignments│
│  (rules, frequency) │     │   (employee_id, due_date)    │
└─────────┬──────────┘     └──────────────┬──────────────┘
          │                               │
          │                               ▼
          │                    ┌─────────────────────┐
          │                    │   lms_enrollments   │
          │                    │  (auto-created)     │
          │                    └──────────┬──────────┘
          │                               │
          ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────┐
│compliance_training_      │    │  lms_certificates   │
│exemptions (if applicable)│    │  (recertification)  │
└─────────────────────────┘    └─────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      {/* Training Request Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            Training Request Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌───────────────────┐     ┌────────────────────┐     ┌──────────────────┐
│ Employee Request  │────▶│  Manager Approval  │────▶│   HR Approval    │
│ (training_requests)│     │   (status update)  │     │ (if cost > limit)│
└───────────────────┘     └─────────┬──────────┘     └────────┬─────────┘
                                    │                         │
                                    ▼                         ▼
                          ┌─────────────────┐       ┌─────────────────┐
                          │ training_budgets│       │ lms_enrollments │
                          │ (deduct amount) │       │  (auto-enroll)  │
                          └─────────────────┘       └─────────────────┘

Source Types:
├── gap_analysis      ─ From competency gap detection
├── appraisal         ─ From performance review
├── self_service      ─ Employee self-request
├── onboarding        ─ New hire training plan
├── manager_assigned  ─ Manager direct assignment
└── compliance        ─ Mandatory compliance rule
          `}</pre>
        </CardContent>
      </Card>

      {/* Integration Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-teal-600" />
            Cross-Module Integration Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">{`
┌─────────────────────────────────────────────────────────────────┐
│                        INTEGRATION MAP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                              ┌─────────────┐   │
│  │  WORKFORCE  │──────profiles, departments──▶│    L&D      │   │
│  │   MODULE    │◀────training_history────────│   MODULE    │   │
│  └─────────────┘                              └──────┬──────┘   │
│                                                      │          │
│  ┌─────────────┐                                     │          │
│  │ PERFORMANCE │◀────competency gaps, goals─────────┤          │
│  │   MODULE    │──────training recommendations──────▶│          │
│  └─────────────┘                                     │          │
│                                                      │          │
│  ┌─────────────┐                                     │          │
│  │ ONBOARDING  │──────auto-enrollment triggers──────▶│          │
│  │   MODULE    │◀────completion notifications───────┤          │
│  └─────────────┘                                     │          │
│                                                      │          │
│  ┌─────────────┐                                     │          │
│  │  HR HUB     │──────approval workflows────────────▶│          │
│  │   MODULE    │◀────budget tracking────────────────┤          │
│  └─────────────┘                                     │          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          `}</pre>
        </CardContent>
      </Card>

      {/* Table Count Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Database Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">56</div>
              <div className="text-sm text-muted-foreground">Total Tables</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-3xl font-bold text-green-600">10</div>
              <div className="text-sm text-muted-foreground">Functional Domains</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">5</div>
              <div className="text-sm text-muted-foreground">Cross-Module Links</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">3</div>
              <div className="text-sm text-muted-foreground">Integration Standards</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

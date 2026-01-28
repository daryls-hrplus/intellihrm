import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, BookOpen, Database, Calendar, ArrowRightLeft } from 'lucide-react';

export function LndOverviewSection() {
  return (
    <div className="space-y-8">
      {/* Section 1.1 */}
      <section id="sec-1-1" data-manual-anchor="sec-1-1">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-600" />
          1.1 Introduction to Learning & Development
        </h2>
        <p className="text-muted-foreground mb-4">
          The Learning & Development module in Intelli HRM provides a comprehensive Learning Management System (LMS) 
          for delivering, tracking, and managing employee training. This manual covers configuration, operations, 
          compliance tracking, and AI-powered learning recommendations.
        </p>
        <Card className="mb-4">
          <CardHeader><CardTitle className="text-base">Strategic Value</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <p className="font-medium text-emerald-700">24% Higher Profit Margins</p>
              <p className="text-sm text-muted-foreground">Organizations with structured L&D programs (ATD Research)</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <p className="font-medium text-blue-700">94% Employee Retention</p>
              <p className="text-sm text-muted-foreground">Companies investing in employee development (LinkedIn)</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 1.2 */}
      <section id="sec-1-2" data-manual-anchor="sec-1-2">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-600" />
          1.2 Core Concepts & Terminology
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { term: 'Course', desc: 'A structured learning experience with modules and lessons' },
            { term: 'Learning Path', desc: 'A curated sequence of courses for skill development' },
            { term: 'SCORM', desc: 'eLearning standard for content packaging and tracking' },
            { term: 'Enrollment', desc: 'Registering a learner for a course' },
            { term: 'Competency Mapping', desc: 'Linking courses to skills for gap-based recommendations' },
            { term: 'Compliance Training', desc: 'Mandatory training for regulatory requirements' },
          ].map(item => (
            <Card key={item.term} className="p-4">
              <p className="font-semibold">{item.term}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 1.3 */}
      <section id="sec-1-3" data-manual-anchor="sec-1-3">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-emerald-600" />
          1.3 User Personas & Journeys
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { role: 'Employee', journey: 'Browse catalog → Enroll → Complete lessons → Take quiz → Earn certificate' },
            { role: 'Manager', journey: 'View team progress → Assign training → Monitor compliance → Approve requests' },
            { role: 'L&D Admin', journey: 'Create courses → Configure quizzes → Track analytics → Manage compliance' },
          ].map(p => (
            <Card key={p.role} className="p-4">
              <Badge variant="outline" className="mb-2">{p.role}</Badge>
              <p className="text-sm text-muted-foreground">{p.journey}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 1.4 */}
      <section id="sec-1-4" data-manual-anchor="sec-1-4">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-emerald-600" />
          1.4 System Architecture
        </h2>
        <p className="text-muted-foreground mb-4">
          The L&D module spans 62+ database tables across 9 domains: Core LMS, Learning Paths, Compliance, 
          Training Operations, SCORM/xAPI, Gamification, Competency Integration, Agency Management, and Analytics.
        </p>
        <Card className="p-4 bg-muted/50">
          <p className="font-mono text-sm">
            lms_courses → lms_modules → lms_lessons → lms_enrollments → lms_lesson_progress
          </p>
        </Card>
      </section>

      {/* Section 1.5 */}
      <section id="sec-1-5" data-manual-anchor="sec-1-5">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-emerald-600" />
          1.5 L&D Calendar & Planning Cycle
        </h2>
        <p className="text-muted-foreground">
          Annual training planning aligns with organizational goals. Q1: Needs analysis, Q2-Q3: Delivery, 
          Q4: Evaluation. Compliance training follows regulatory calendars with recertification tracking.
        </p>
      </section>

      {/* Section 1.6 */}
      <section id="sec-1-6" data-manual-anchor="sec-1-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-6 w-6 text-emerald-600" />
          1.6 Legacy Migration Guide
        </h2>
        <p className="text-muted-foreground">
          Migrating from HRplus Training? Key mappings: Training Types → lms_categories, Training Courses → lms_courses, 
          Training Staff → training_instructors. See Appendix C for complete field mapping.
        </p>
      </section>
    </div>
  );
}

import { BookOpen, GraduationCap, Award, BarChart3, Users, Video, Gamepad2, MessageCircle, ShieldCheck, UserCheck, Settings, Brain, ClipboardCheck, FileText } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const LearningCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={BookOpen}
      title="Learning & Development"
      tagline="Transform training from cost center to competitive advantage"
      overview="A complete LMS with SCORM/xAPI support, AI-powered personalization, gamification, and competency-aligned learning paths. From compliance training to leadership development, from content authoring to certification tracking—every learning moment is captured, measured, and connected to business outcomes."
      accentColor="bg-violet-500/10 text-violet-600"
      badge="130+ Capabilities"
      id="learning"
    >
      <ValueStoryHeader
        challenge="Training is expensive, inconsistent, and impossible to measure. Classroom sessions pull employees away from work, e-learning courses sit incomplete, and compliance deadlines slip through the cracks. Without a unified learning platform, organizations can't develop their people, maintain certifications, or build the skills needed for tomorrow."
        promise="HRplus Learning & Development transforms training from a cost center to a competitive advantage. A complete LMS with SCORM/xAPI support, AI-powered personalization, gamification, and competency-aligned learning paths ensures every learning moment is captured, measured, and connected to business outcomes."
        outcomes={[
          { metric: "85%+", label: "Training Completion", description: "Gamification + personalization" },
          { metric: "40%", label: "Faster Time-to-Competency", description: "AI-optimized learning paths" },
          { metric: "100%", label: "Compliance Completion", description: "Automated assignments + escalation" },
          { metric: "Measurable", label: "Training ROI", description: "Skills → performance correlation" },
        ]}
        personas={[
          { role: "Employee", value: "Learning fits my schedule and my career goals" },
          { role: "Manager", value: "I see exactly how training impacts my team's performance" },
          { role: "L&D Admin", value: "One platform for all training—from authoring to analytics" },
          { role: "Compliance", value: "Every certification tracked, every deadline met" },
        ]}
      />

      <CapabilityCategory title="Course Management" icon={GraduationCap}>
        <li>Course creation and publishing workflows with approval routing</li>
        <li>Course versioning and revision history tracking</li>
        <li>Multi-format content support (video, PDF, SCORM, xAPI)</li>
        <li>Course categorization, tagging, and search optimization</li>
        <li>Course duplication and templates for rapid creation</li>
        <li>Pricing and enrollment rules for external training</li>
        <li>Featured course management and catalog configuration</li>
        <li>Course archiving and sunset workflows</li>
      </CapabilityCategory>

      <CapabilityCategory title="SCORM & xAPI Integration" icon={FileText}>
        <li>SCORM 1.2 and 2004 package import and validation</li>
        <li>xAPI (Tin Can) statement collection and reporting</li>
        <li>Learning experience tracking across platforms</li>
        <li>External LRS integration for cross-system learning</li>
        <li>Package testing and preview before publishing</li>
        <li>Completion and score synchronization</li>
        <li>Offline SCORM support with sync on reconnect</li>
      </CapabilityCategory>

      <CapabilityCategory title="Content Authoring" icon={FileText}>
        <li>Built-in WYSIWYG content editor</li>
        <li>Multimedia content creation (video, audio, images)</li>
        <li>Interactive module builder with branching logic</li>
        <li>Topic-based content organization</li>
        <li>Content reuse and linking across courses</li>
        <li>AI-assisted content generation and enhancement</li>
        <li>Template library for common training types</li>
      </CapabilityCategory>

      <CapabilityCategory title="Module & Lesson Structure" icon={Settings}>
        <li>Module-based course organization with drag-and-drop</li>
        <li>Lesson sequencing and dependency configuration</li>
        <li>Lesson progress tracking with completion criteria</li>
        <li>Estimated duration configuration per lesson</li>
        <li>Multiple lesson types (video, text, interactive, quiz)</li>
        <li>Downloadable resources and attachments</li>
        <li>Prerequisite enforcement between modules</li>
      </CapabilityCategory>

      <CapabilityCategory title="Quiz & Assessments" icon={ClipboardCheck}>
        <li>Quiz creation with shared question banks</li>
        <li>Multiple question types (MCQ, true/false, matching, fill-in-blank)</li>
        <li>Randomized question selection from pools</li>
        <li>Attempt limits and time restriction configuration</li>
        <li>Passing score and grading configuration</li>
        <li>Immediate and delayed feedback options</li>
        <li>Question analytics and difficulty tracking</li>
        <li>Proctoring integration for high-stakes assessments</li>
      </CapabilityCategory>

      <CapabilityCategory title="Learning Paths" icon={Award}>
        <li>Career-aligned learning path configuration</li>
        <li>Prerequisite and dependency management</li>
        <li>Sequential and parallel completion options</li>
        <li>Path enrollment and progress tracking</li>
        <li>Certification-linked learning paths</li>
        <li>AI-recommended path adjustments based on progress</li>
        <li>Role-based curriculum auto-assignment</li>
        <li>Learning path templates for common career tracks</li>
      </CapabilityCategory>

      <CapabilityCategory title="Gamification & Engagement" icon={Gamepad2}>
        <li>Points system configuration by activity type</li>
        <li>Badge creation, design, and awarding rules</li>
        <li>Leaderboards by team, department, and company</li>
        <li>Achievement tracking and milestone celebrations</li>
        <li>Point transactions and redemption history</li>
        <li>Gamification analytics and engagement metrics</li>
        <li>Social sharing of achievements</li>
      </CapabilityCategory>

      <CapabilityCategory title="Social Learning" icon={MessageCircle}>
        <li>Discussion forums per course with moderation</li>
        <li>Threaded discussions and reply notifications</li>
        <li>Peer learning communities and study groups</li>
        <li>Expert Q&A channels and office hours</li>
        <li>Content bookmarking and personal notes</li>
        <li>Course reviews, ratings, and helpful votes</li>
        <li>Social feeds and learning activity sharing</li>
      </CapabilityCategory>

      <CapabilityCategory title="Certification & Compliance" icon={ShieldCheck}>
        <li>Certification program configuration and management</li>
        <li>Expiry and renewal tracking with auto-reminders</li>
        <li>Mandatory training auto-assignment by role</li>
        <li>Compliance deadline automation with escalation</li>
        <li>Recertification requirements and tracking</li>
        <li>Certificate template design and customization</li>
        <li>Digital credential generation and verification</li>
        <li>External certification integration</li>
      </CapabilityCategory>

      <CapabilityCategory title="Instructor Management" icon={UserCheck}>
        <li>Instructor profile management and qualifications</li>
        <li>Course instructor assignments and scheduling</li>
        <li>Instructor availability and calendar integration</li>
        <li>Instructor ratings, feedback, and performance</li>
        <li>External trainer registration and onboarding</li>
        <li>Train-the-trainer program tracking</li>
        <li>Instructor workload balancing</li>
      </CapabilityCategory>

      <CapabilityCategory title="Training Administration" icon={Settings}>
        <li>Training program and session configuration</li>
        <li>Training request and approval workflows</li>
        <li>Budget allocation and tracking by department</li>
        <li>Enrollment management with waitlist handling</li>
        <li>Calendar integration and session scheduling</li>
        <li>Session capacity and venue management</li>
        <li>Virtual classroom integration (Zoom, Teams)</li>
        <li>Attendance tracking and no-show management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Training Needs & Skills" icon={Brain}>
        <li>Training needs analysis (TNA) framework</li>
        <li>Skill gap identification by role and individual</li>
        <li>Needs-to-course mapping and recommendations</li>
        <li>Remediation tracking and follow-up</li>
        <li>Competency-to-course linking</li>
        <li>Development recommendations from performance data</li>
        <li>Skills inventory with proficiency levels</li>
      </CapabilityCategory>

      <CapabilityCategory title="Evaluations & Effectiveness" icon={ClipboardCheck}>
        <li>Post-training evaluation forms (Level 1-4 Kirkpatrick)</li>
        <li>Reaction evaluations with satisfaction scoring</li>
        <li>Learning assessments with knowledge checks</li>
        <li>Behavior change tracking post-training</li>
        <li>Results and ROI calculation tools</li>
        <li>Evaluation response tracking and analytics</li>
        <li>Training effectiveness scoring and trending</li>
      </CapabilityCategory>

      <CapabilityCategory title="Learning Analytics" icon={BarChart3}>
        <li>Completion and progress dashboards by cohort</li>
        <li>Training hours reporting by employee/department</li>
        <li>Skill development tracking and trending</li>
        <li>Compliance status monitoring and alerts</li>
        <li>Training cost analysis and budget tracking</li>
        <li>AI-generated insights and recommendations</li>
        <li>Predictive learning analytics (completion likelihood)</li>
        <li>Engagement metrics and drop-off analysis</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Skill gap analysis based on role requirements and career goals</AICapability>
        <AICapability type="prescriptive">Personalized course recommendations from performance data</AICapability>
        <AICapability type="automated">Learning path auto-generation based on career aspirations</AICapability>
        <AICapability type="predictive">Completion prediction with intervention alerts for at-risk learners</AICapability>
        <AICapability type="conversational">Natural language search across all learning content</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Goals & Performance", description: "Skill development aligned to performance goals" },
          { module: "Succession Planning", description: "Leadership development program tracking" },
          { module: "Onboarding", description: "New hire learning assignments and tracking" },
          { module: "Competency Framework", description: "Competency-to-course alignment" },
          { module: "Certification", description: "Credential tracking and renewal automation" },
        ]}
      />
    </ModuleCapabilityCard>
  );
};

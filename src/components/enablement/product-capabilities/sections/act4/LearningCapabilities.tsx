import { BookOpen, GraduationCap, Award, BarChart3, Users, Video, Gamepad2, MessageCircle, ShieldCheck, UserCheck, Settings, Brain, ClipboardCheck, FileText } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const LearningCapabilities = () => {
  const outcomes = [
    { metric: "85%+", label: "Training Completion", description: "Gamification + personalization" },
    { metric: "40%", label: "Faster Time-to-Competency", description: "AI-optimized learning paths" },
    { metric: "100%", label: "Compliance Completion", description: "Automated assignments + escalation" },
    { metric: "Measurable", label: "Training ROI", description: "Skills → performance correlation" },
  ];

  const personas = [
    { role: "Employee", value: "Learning fits my schedule and my career goals" },
    { role: "Manager", value: "I see exactly how training impacts my team's performance" },
    { role: "L&D Admin", value: "One platform for all training—from authoring to analytics" },
    { role: "Compliance", value: "Every certification tracked, every deadline met" },
  ];

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
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Training is expensive, inconsistent, and impossible to measure. Classroom sessions pull employees away from work, e-learning courses sit incomplete, and compliance deadlines slip through the cracks. Without a unified learning platform, organizations can't develop their people, maintain certifications, or build the skills needed for tomorrow."
          promise="HRplus Learning & Development transforms training from a cost center to a competitive advantage. A complete LMS with SCORM/xAPI support, AI-powered personalization, gamification, and competency-aligned learning paths ensures every learning moment is captured, measured, and connected to business outcomes."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Course Management" icon={GraduationCap}>
            <CapabilityItem>Course creation and publishing workflows with approval routing</CapabilityItem>
            <CapabilityItem>Course versioning and revision history tracking</CapabilityItem>
            <CapabilityItem>Multi-format content support (video, PDF, SCORM, xAPI)</CapabilityItem>
            <CapabilityItem>Course categorization, tagging, and search optimization</CapabilityItem>
            <CapabilityItem>Course duplication and templates for rapid creation</CapabilityItem>
            <CapabilityItem>Pricing and enrollment rules for external training</CapabilityItem>
            <CapabilityItem>Featured course management and catalog configuration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="SCORM & xAPI Integration" icon={FileText}>
            <CapabilityItem>SCORM 1.2 and 2004 package import and validation</CapabilityItem>
            <CapabilityItem>xAPI (Tin Can) statement collection and reporting</CapabilityItem>
            <CapabilityItem>Learning experience tracking across platforms</CapabilityItem>
            <CapabilityItem>External LRS integration for cross-system learning</CapabilityItem>
            <CapabilityItem>Package testing and preview before publishing</CapabilityItem>
            <CapabilityItem>Completion and score synchronization</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Content Authoring" icon={FileText}>
            <CapabilityItem>Built-in WYSIWYG content editor</CapabilityItem>
            <CapabilityItem>Multimedia content creation (video, audio, images)</CapabilityItem>
            <CapabilityItem>Interactive module builder with branching logic</CapabilityItem>
            <CapabilityItem>Topic-based content organization</CapabilityItem>
            <CapabilityItem>Content reuse and linking across courses</CapabilityItem>
            <CapabilityItem>AI-assisted content generation and enhancement</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Module & Lesson Structure" icon={Settings}>
            <CapabilityItem>Module-based course organization with drag-and-drop</CapabilityItem>
            <CapabilityItem>Lesson sequencing and dependency configuration</CapabilityItem>
            <CapabilityItem>Lesson progress tracking with completion criteria</CapabilityItem>
            <CapabilityItem>Estimated duration configuration per lesson</CapabilityItem>
            <CapabilityItem>Multiple lesson types (video, text, interactive, quiz)</CapabilityItem>
            <CapabilityItem>Downloadable resources and attachments</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Quiz & Assessments" icon={ClipboardCheck}>
            <CapabilityItem>Quiz creation with shared question banks</CapabilityItem>
            <CapabilityItem>Multiple question types (MCQ, true/false, matching, fill-in-blank)</CapabilityItem>
            <CapabilityItem>Randomized question selection from pools</CapabilityItem>
            <CapabilityItem>Attempt limits and time restriction configuration</CapabilityItem>
            <CapabilityItem>Passing score and grading configuration</CapabilityItem>
            <CapabilityItem>Immediate and delayed feedback options</CapabilityItem>
            <CapabilityItem>Question analytics and difficulty tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Learning Paths" icon={Award}>
            <CapabilityItem>Career-aligned learning path configuration</CapabilityItem>
            <CapabilityItem>Prerequisite and dependency management</CapabilityItem>
            <CapabilityItem>Sequential and parallel completion options</CapabilityItem>
            <CapabilityItem>Path enrollment and progress tracking</CapabilityItem>
            <CapabilityItem>Certification-linked learning paths</CapabilityItem>
            <CapabilityItem>AI-recommended path adjustments based on progress</CapabilityItem>
            <CapabilityItem>Role-based curriculum auto-assignment</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Gamification & Engagement" icon={Gamepad2}>
            <CapabilityItem>Points system configuration by activity type</CapabilityItem>
            <CapabilityItem>Badge creation, design, and awarding rules</CapabilityItem>
            <CapabilityItem>Leaderboards by team, department, and company</CapabilityItem>
            <CapabilityItem>Achievement tracking and milestone celebrations</CapabilityItem>
            <CapabilityItem>Point transactions and redemption history</CapabilityItem>
            <CapabilityItem>Gamification analytics and engagement metrics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Social Learning" icon={MessageCircle}>
            <CapabilityItem>Discussion forums per course with moderation</CapabilityItem>
            <CapabilityItem>Threaded discussions and reply notifications</CapabilityItem>
            <CapabilityItem>Peer learning communities and study groups</CapabilityItem>
            <CapabilityItem>Expert Q&A channels and office hours</CapabilityItem>
            <CapabilityItem>Content bookmarking and personal notes</CapabilityItem>
            <CapabilityItem>Course reviews, ratings, and helpful votes</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Certification & Compliance" icon={ShieldCheck}>
            <CapabilityItem>Certification program configuration and management</CapabilityItem>
            <CapabilityItem>Expiry and renewal tracking with auto-reminders</CapabilityItem>
            <CapabilityItem>Mandatory training auto-assignment by role</CapabilityItem>
            <CapabilityItem>Compliance deadline automation with escalation</CapabilityItem>
            <CapabilityItem>Recertification requirements and tracking</CapabilityItem>
            <CapabilityItem>Certificate template design and customization</CapabilityItem>
            <CapabilityItem>Digital credential generation and verification</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Instructor Management" icon={UserCheck}>
            <CapabilityItem>Instructor profile management and qualifications</CapabilityItem>
            <CapabilityItem>Course instructor assignments and scheduling</CapabilityItem>
            <CapabilityItem>Instructor availability and calendar integration</CapabilityItem>
            <CapabilityItem>Instructor ratings, feedback, and performance</CapabilityItem>
            <CapabilityItem>External trainer registration and onboarding</CapabilityItem>
            <CapabilityItem>Train-the-trainer program tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Training Administration" icon={Settings}>
            <CapabilityItem>Training program and session configuration</CapabilityItem>
            <CapabilityItem>Training request and approval workflows</CapabilityItem>
            <CapabilityItem>Budget allocation and tracking by department</CapabilityItem>
            <CapabilityItem>Enrollment management with waitlist handling</CapabilityItem>
            <CapabilityItem>Calendar integration and session scheduling</CapabilityItem>
            <CapabilityItem>Session capacity and venue management</CapabilityItem>
            <CapabilityItem>Virtual classroom integration (Zoom, Teams)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Training Needs & Skills" icon={Brain}>
            <CapabilityItem>Training needs analysis (TNA) framework</CapabilityItem>
            <CapabilityItem>Skill gap identification by role and individual</CapabilityItem>
            <CapabilityItem>Needs-to-course mapping and recommendations</CapabilityItem>
            <CapabilityItem>Remediation tracking and follow-up</CapabilityItem>
            <CapabilityItem>Competency-to-course linking</CapabilityItem>
            <CapabilityItem>Development recommendations from performance data</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Evaluations & Effectiveness" icon={ClipboardCheck}>
            <CapabilityItem>Post-training evaluation forms (Level 1-4 Kirkpatrick)</CapabilityItem>
            <CapabilityItem>Reaction evaluations with satisfaction scoring</CapabilityItem>
            <CapabilityItem>Learning assessments with knowledge checks</CapabilityItem>
            <CapabilityItem>Behavior change tracking post-training</CapabilityItem>
            <CapabilityItem>Results and ROI calculation tools</CapabilityItem>
            <CapabilityItem>Training effectiveness scoring and trending</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Learning Analytics" icon={BarChart3}>
            <CapabilityItem>Completion and progress dashboards by cohort</CapabilityItem>
            <CapabilityItem>Training hours reporting by employee/department</CapabilityItem>
            <CapabilityItem>Skill development tracking and trending</CapabilityItem>
            <CapabilityItem>Compliance status monitoring and alerts</CapabilityItem>
            <CapabilityItem>Training cost analysis and budget tracking</CapabilityItem>
            <CapabilityItem>AI-generated insights and recommendations</CapabilityItem>
            <CapabilityItem>Predictive learning analytics (completion likelihood)</CapabilityItem>
          </CapabilityCategory>
        </div>

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
      </div>
    </ModuleCapabilityCard>
  );
};

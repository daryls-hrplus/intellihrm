import { BookOpen, GraduationCap, Award, BarChart3, Users, Video } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const LearningCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={BookOpen}
      title="Learning & Development"
      tagline="Build capabilities with an intelligent LMS"
      overview="Deliver engaging learning experiences across your organization with our comprehensive learning management system. Support multiple content formats, track certifications, and align development with business objectives."
      accentColor="purple"
    >
      <CapabilityCategory title="Course Management" icon={GraduationCap}>
        <li>SCORM 1.2/2004 and xAPI (Tin Can) content support</li>
        <li>Built-in content authoring with multimedia support</li>
        <li>Course versioning and prerequisite management</li>
        <li>Content library with reusable learning objects</li>
        <li>Assessment creation with question banks</li>
      </CapabilityCategory>

      <CapabilityCategory title="Learning Paths" icon={Award}>
        <li>Career-based learning path configuration</li>
        <li>Certification programs with renewal tracking</li>
        <li>Compliance training tracks with deadlines</li>
        <li>Role-based curriculum assignment</li>
        <li>Sequential and parallel path options</li>
      </CapabilityCategory>

      <CapabilityCategory title="Delivery Methods" icon={Video}>
        <li>Instructor-led training (ILT) scheduling</li>
        <li>Virtual classroom integration (Zoom, Teams)</li>
        <li>Self-paced online learning modules</li>
        <li>Blended learning program support</li>
        <li>Mobile learning with offline access</li>
      </CapabilityCategory>

      <CapabilityCategory title="Compliance Training" icon={Users}>
        <li>Mandatory training assignment automation</li>
        <li>Deadline tracking with escalation alerts</li>
        <li>Completion certificates and badges</li>
        <li>Audit-ready compliance reports</li>
        <li>Re-certification workflow management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Learning Analytics" icon={BarChart3}>
        <li>Course completion rates and trends</li>
        <li>Learning effectiveness assessments</li>
        <li>Time-to-competency tracking</li>
        <li>Training hours per employee metrics</li>
        <li>ROI analysis for learning investments</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Skill gap analysis based on role requirements</AICapability>
        <AICapability type="prescriptive">Personalized course recommendations</AICapability>
        <AICapability type="automated">Learning path auto-generation from career goals</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Talent Management", description: "Skill development aligned to performance goals" },
          { module: "Succession Planning", description: "Leadership development program tracking" },
          { module: "Recruitment", description: "Onboarding learning assignments" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};

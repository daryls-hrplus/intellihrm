import { Route, Target, Heart, Brain, BarChart3 } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const CareerDevelopmentCapabilities = () => {
  const outcomes = [
    { metric: "85%+", label: "IDP Completion", description: "Guided development planning" },
    { metric: "60%+", label: "Internal Mobility", description: "Career paths drive retention" },
    { metric: "3x", label: "Mentorship Engagement", description: "AI-matched pairings" },
    { metric: "Measurable", label: "Development ROI", description: "Skills → career progression" },
  ];

  const personas = [
    { role: "Employee", value: "I can see my career path and know exactly what to develop" },
    { role: "Manager", value: "I guide my team's growth with data-driven development plans" },
    { role: "HR Partner", value: "Career development is systematic, not ad hoc" },
    { role: "L&D Admin", value: "Development themes connect learning to career outcomes" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Route}
      title="Career Development"
      tagline="Light the path from where you are to where you want to be"
      overview="A comprehensive Career Hub that empowers employees to own their growth journey. From career path visualization and individual development plans to AI-powered mentorship matching and development theme generation from 360 feedback—every career conversation becomes a catalyst for meaningful progression."
      accentColor="bg-teal-500/10 text-teal-600"
      badge="45+ Capabilities"
      id="career-development"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Employees leave when they can't see a future. Career conversations happen once a year—if at all. Development plans gather dust in spreadsheets. Mentorship is informal and inconsistent. Without a systematic approach to career growth, organizations lose their best people to competitors who offer clearer paths forward."
          promise="Intelli HRM Career Development transforms career growth from aspiration to action. A comprehensive Career Hub empowers employees to visualize their path, build targeted development plans, connect with AI-matched mentors, and receive personalized development themes generated from real performance data. Every career conversation becomes a catalyst for meaningful progression."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Career Paths & Progression" icon={Route}>
            <CapabilityItem>Career path configuration and visualization</CapabilityItem>
            <CapabilityItem>Path step definition with skill and experience requirements</CapabilityItem>
            <CapabilityItem>Skill requirement mapping per career step</CapabilityItem>
            <CapabilityItem>Experience milestone tracking and validation</CapabilityItem>
            <CapabilityItem>Lateral move opportunity identification</CapabilityItem>
            <CapabilityItem>Career aspiration capture from employees</CapabilityItem>
            <CapabilityItem>Career ladder templates by function and level</CapabilityItem>
            <CapabilityItem>ESS career path viewing with personal progress tracking</CapabilityItem>
            <CapabilityItem>Career path assignment and enrollment management</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Individual Development Plans" icon={Target}>
            <CapabilityItem>IDP creation with structured templates</CapabilityItem>
            <CapabilityItem>Development goal setting with timelines and milestones</CapabilityItem>
            <CapabilityItem>Activity tracking with status and progress monitoring</CapabilityItem>
            <CapabilityItem>Feedback linkage to development areas</CapabilityItem>
            <CapabilityItem>Manager collaboration and co-ownership workflows</CapabilityItem>
            <CapabilityItem>Learning course linkage to IDP goals</CapabilityItem>
            <CapabilityItem>IDP approval workflows with HR oversight</CapabilityItem>
            <CapabilityItem>Development activity completion tracking</CapabilityItem>
            <CapabilityItem>Personal career plan with succession readiness view</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Mentorship Programs" icon={Heart}>
            <CapabilityItem>Mentorship program configuration and lifecycle management</CapabilityItem>
            <CapabilityItem>Mentor-mentee pairing workflows with matching criteria</CapabilityItem>
            <CapabilityItem>AI-assisted matching based on skills, goals, and chemistry</CapabilityItem>
            <CapabilityItem>Session scheduling, tracking, and notes capture</CapabilityItem>
            <CapabilityItem>Goal-based mentoring with milestone definitions</CapabilityItem>
            <CapabilityItem>Mentorship effectiveness metrics and satisfaction tracking</CapabilityItem>
            <CapabilityItem>Mentor pool management with availability and expertise</CapabilityItem>
            <CapabilityItem>Mentorship approval workflows</CapabilityItem>
            <CapabilityItem>L&D-administered mentorship program oversight</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Development Themes & AI" icon={Brain}>
            <CapabilityItem>AI development theme generation from 360 feedback data</CapabilityItem>
            <CapabilityItem>Career conversation tracking and documentation</CapabilityItem>
            <CapabilityItem>Skill gap remediation planning with resource matching</CapabilityItem>
            <CapabilityItem>Development resource matching to identified gaps</CapabilityItem>
            <CapabilityItem>Progress milestone tracking across themes</CapabilityItem>
            <CapabilityItem>Career goal alignment with organizational succession needs</CapabilityItem>
            <CapabilityItem>Personalized development recommendations from performance data</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Career Analytics" icon={BarChart3}>
            <CapabilityItem>Career progression tracking and trending</CapabilityItem>
            <CapabilityItem>Path completion rates by function and level</CapabilityItem>
            <CapabilityItem>Mentorship program effectiveness dashboards</CapabilityItem>
            <CapabilityItem>Development investment ROI analysis</CapabilityItem>
            <CapabilityItem>Career mobility pattern analysis</CapabilityItem>
            <CapabilityItem>IDP completion and quality metrics</CapabilityItem>
            <CapabilityItem>Skills development velocity tracking</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Career trajectory prediction based on skills and performance patterns</AICapability>
          <AICapability type="prescriptive">Personalized development theme generation from 360 feedback</AICapability>
          <AICapability type="automated">AI-powered mentor matching based on skills, goals, and compatibility</AICapability>
          <AICapability type="prescriptive">Skill gap remediation recommendations with learning resources</AICapability>
          <AICapability type="predictive">Career path feasibility scoring based on current capabilities</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Succession Planning", description: "Career readiness feeds succession pipelines" },
            { module: "Learning & Development", description: "Development plans link to training courses" },
            { module: "Performance", description: "Performance data drives development themes" },
            { module: "360 Feedback", description: "Feedback generates AI development themes" },
            { module: "Goals Management", description: "Career goals align with performance objectives" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};

import { Target, Users, MessageSquare, TrendingUp, BarChart3, Award } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const TalentCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={Target}
      title="Talent Management"
      tagline="Transform performance from annual event to continuous culture"
      overview="Comprehensive talent management spanning goals, appraisals, 360 feedback, and continuous recognition. Drive performance excellence through aligned objectives and meaningful feedback."
      accentColor="purple"
    >
      <CapabilityCategory title="Goals Management" icon={Target}>
        <li>SMART and OKR goal frameworks</li>
        <li>Cascading goals with alignment visualization</li>
        <li>Goal weighting and priority setting</li>
        <li>Progress tracking with milestones</li>
        <li>Team and organizational goal dashboards</li>
        <li>Goal library with templates</li>
      </CapabilityCategory>

      <CapabilityCategory title="Performance Appraisals" icon={Award}>
        <li>Configurable review cycles and templates</li>
        <li>Self-assessment and manager evaluation</li>
        <li>Competency-based rating scales</li>
        <li>Multi-section reviews with weighting</li>
        <li>Comments and evidence attachments</li>
        <li>Digital signature and acknowledgment</li>
      </CapabilityCategory>

      <CapabilityCategory title="360 Multi-Rater Feedback" icon={Users}>
        <li>Peer, upward, and external rater selection</li>
        <li>Anonymity controls and thresholds</li>
        <li>Customizable questionnaires</li>
        <li>Aggregated feedback reports</li>
        <li>Rater response tracking</li>
        <li>Development action generation</li>
      </CapabilityCategory>

      <CapabilityCategory title="Continuous Feedback" icon={MessageSquare}>
        <li>Real-time recognition and appreciation</li>
        <li>Pulse surveys and quick check-ins</li>
        <li>Feedback request workflows</li>
        <li>Achievement and milestone logging</li>
        <li>Manager coaching prompts</li>
        <li>Peer-to-peer feedback channels</li>
      </CapabilityCategory>

      <CapabilityCategory title="Calibration & Development" icon={TrendingUp}>
        <li>Calibration session management</li>
        <li>9-Box talent matrix integration</li>
        <li>Rating distribution curves</li>
        <li>Individual Development Plans (IDP)</li>
        <li>Performance Improvement Plans (PIP)</li>
        <li>Manager coaching tools</li>
      </CapabilityCategory>

      <CapabilityCategory title="Performance Analytics" icon={BarChart3}>
        <li>Goal completion and alignment metrics</li>
        <li>Rating distribution analysis</li>
        <li>Performance trend tracking</li>
        <li>Feedback frequency dashboards</li>
        <li>Engagement correlation insights</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Goal achievement likelihood scoring</AICapability>
        <AICapability type="prescriptive">AI-suggested objectives based on role and strategy</AICapability>
        <AICapability type="automated">Bias detection in ratings and feedback</AICapability>
        <AICapability type="conversational">Comment quality analysis and coaching</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Compensation", description: "Performance-based pay recommendations" },
          { module: "Succession Planning", description: "High-performer identification" },
          { module: "Learning", description: "Development gap-based training" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};

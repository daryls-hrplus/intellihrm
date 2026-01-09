import { Crown, Users, TrendingUp, Target, BarChart3, Shuffle } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const SuccessionCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={Crown}
      title="Succession Planning"
      tagline="Identify, develop, and retain future leaders"
      overview="Ensure business continuity through proactive succession planning. Identify critical positions, build talent pipelines, and develop future leaders with data-driven insights."
      accentColor="purple"
    >
      <CapabilityCategory title="Critical Position Management" icon={Target}>
        <li>Critical position identification and tagging</li>
        <li>Vacancy risk assessment scoring</li>
        <li>Business impact analysis</li>
        <li>Position criticality matrix</li>
        <li>Coverage gap reporting</li>
      </CapabilityCategory>

      <CapabilityCategory title="Talent Identification" icon={Users}>
        <li>9-Box talent matrix placement</li>
        <li>Readiness assessment frameworks</li>
        <li>Flight risk indicators</li>
        <li>High-potential designation</li>
        <li>Talent review sessions</li>
        <li>Multi-rater readiness input</li>
      </CapabilityCategory>

      <CapabilityCategory title="Succession Pools" icon={Shuffle}>
        <li>Talent pool creation and management</li>
        <li>Successor nomination workflows</li>
        <li>Development tracking per nominee</li>
        <li>Pipeline strength metrics</li>
        <li>Succession depth analysis</li>
      </CapabilityCategory>

      <CapabilityCategory title="Career Pathing" icon={TrendingUp}>
        <li>Career ladder visualization</li>
        <li>Skill requirement mapping</li>
        <li>Experience milestone tracking</li>
        <li>Lateral move recommendations</li>
        <li>Career aspiration capture</li>
      </CapabilityCategory>

      <CapabilityCategory title="Leadership Development" icon={Crown}>
        <li>High-potential program management</li>
        <li>Mentoring relationship tracking</li>
        <li>Stretch assignment management</li>
        <li>Executive coaching integration</li>
        <li>Leadership competency development</li>
      </CapabilityCategory>

      <CapabilityCategory title="Succession Analytics" icon={BarChart3}>
        <li>Bench strength by position/department</li>
        <li>Diversity in pipeline metrics</li>
        <li>Readiness progression tracking</li>
        <li>Time-to-readiness forecasting</li>
        <li>Internal fill rate analysis</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Flight risk prediction for key talent</AICapability>
        <AICapability type="prescriptive">AI-matched successor recommendations</AICapability>
        <AICapability type="automated">Readiness scoring based on performance data</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Talent Management", description: "Performance data for readiness assessment" },
          { module: "Learning", description: "Development program enrollment" },
          { module: "Workforce", description: "Position and org structure data" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};

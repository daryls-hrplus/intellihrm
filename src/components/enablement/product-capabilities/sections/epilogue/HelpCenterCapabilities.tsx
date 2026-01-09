import { HelpCircle, Book, Ticket, MessageCircle, BarChart3, Search } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const HelpCenterCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={HelpCircle}
      title="Help Center"
      tagline="Self-service support that reduces HR burden"
      overview="Empower employees and managers with instant access to knowledge, guided workflows, and intelligent support. Reduce HR ticket volume through comprehensive self-service capabilities."
      accentColor="indigo"
    >
      <CapabilityCategory title="Knowledge Base" icon={Book}>
        <li>Searchable article library</li>
        <li>FAQ management with categories</li>
        <li>Policy document linking</li>
        <li>Multimedia content support (video, images)</li>
        <li>Article versioning and updates</li>
        <li>Role-based content visibility</li>
      </CapabilityCategory>

      <CapabilityCategory title="Support Ticketing" icon={Ticket}>
        <li>Multi-channel ticket creation</li>
        <li>Automatic categorization and routing</li>
        <li>Priority and SLA management</li>
        <li>Ticket status tracking</li>
        <li>Internal notes and collaboration</li>
        <li>Escalation workflows</li>
      </CapabilityCategory>

      <CapabilityCategory title="Self-Service Tools" icon={Search}>
        <li>Guided workflow wizards</li>
        <li>Interactive troubleshooting</li>
        <li>Video tutorial library</li>
        <li>Step-by-step how-to guides</li>
        <li>Common task shortcuts</li>
      </CapabilityCategory>

      <CapabilityCategory title="AI Assistant" icon={MessageCircle}>
        <li>Conversational chatbot interface</li>
        <li>Policy-aware question answering</li>
        <li>Context-sensitive help suggestions</li>
        <li>Automatic article recommendations</li>
        <li>Human escalation when needed</li>
      </CapabilityCategory>

      <CapabilityCategory title="Support Analytics" icon={BarChart3}>
        <li>Ticket deflection rate tracking</li>
        <li>Resolution time metrics</li>
        <li>Customer satisfaction (CSAT) scores</li>
        <li>Top inquiry trending</li>
        <li>Knowledge gap identification</li>
        <li>Agent performance dashboards</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Trending inquiry forecasting</AICapability>
        <AICapability type="prescriptive">Article suggestions based on user context</AICapability>
        <AICapability type="automated">Ticket auto-categorization and routing</AICapability>
        <AICapability type="conversational">Natural language policy Q&A</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "HR Hub", description: "Policy and document library access" },
          { module: "All Modules", description: "Context-aware help from any screen" },
          { module: "Learning", description: "Training recommendations for knowledge gaps" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};

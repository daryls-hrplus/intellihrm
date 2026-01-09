import { HelpCircle, FileText, MessageSquare, Bell, BookOpen, Search } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export function HRHubCapabilities() {
  return (
    <ModuleCapabilityCard
      id="hr-hub"
      icon={HelpCircle}
      title="HR Hub"
      tagline="The central nervous system of your HR operations"
      overview="Unified hub for policies, documents, knowledge management, and company communications. Single source of truth for HR operations."
      accentColor="bg-purple-500/10 text-purple-500"
      badge="40+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Policy Management" icon={FileText}>
            <CapabilityItem>Policy creation and versioning</CapabilityItem>
            <CapabilityItem>Acknowledgment tracking</CapabilityItem>
            <CapabilityItem>Compliance alerts and reminders</CapabilityItem>
            <CapabilityItem>Policy distribution workflows</CapabilityItem>
            <CapabilityItem>Multi-language policy support</CapabilityItem>
            <CapabilityItem>Regulatory update notifications</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Document Library" icon={BookOpen}>
            <CapabilityItem>Template management and generation</CapabilityItem>
            <CapabilityItem>Employee document vault</CapabilityItem>
            <CapabilityItem>Letter template builder</CapabilityItem>
            <CapabilityItem>Document expiry tracking</CapabilityItem>
            <CapabilityItem>Bulk document generation</CapabilityItem>
            <CapabilityItem>Digital signature integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Knowledge Base" icon={Search}>
            <CapabilityItem>FAQ management and organization</CapabilityItem>
            <CapabilityItem>AI-powered search</CapabilityItem>
            <CapabilityItem>Ticket deflection analytics</CapabilityItem>
            <CapabilityItem>Help article workflows</CapabilityItem>
            <CapabilityItem>Category and tag management</CapabilityItem>
            <CapabilityItem>Content freshness tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Communications" icon={Bell}>
            <CapabilityItem>Company announcements</CapabilityItem>
            <CapabilityItem>Targeted messaging by group</CapabilityItem>
            <CapabilityItem>Notification center</CapabilityItem>
            <CapabilityItem>Read receipt tracking</CapabilityItem>
            <CapabilityItem>Scheduled communications</CapabilityItem>
            <CapabilityItem>Multi-channel delivery</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="conversational">Intelligent policy search and Q&A</AICapability>
          <AICapability type="automated">Auto-ticket categorization and routing</AICapability>
          <AICapability type="prescriptive">Content suggestions based on user queries</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Help Center", description: "Published KB articles", bidirectional: true },
            { module: "ESS", description: "Policy acknowledgments and documents" },
            { module: "Onboarding", description: "Required policy completions" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}

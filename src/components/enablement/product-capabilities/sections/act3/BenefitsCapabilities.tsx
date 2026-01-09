import { Gift, Users, FileText, Heart, DollarSign, Settings } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";

export function BenefitsCapabilities() {
  return (
    <ModuleCapabilityCard
      id="benefits"
      icon={Gift}
      title="Benefits Administration"
      tagline="Comprehensive benefits from enrollment to claims"
      overview="Full lifecycle benefits management including plan configuration, open enrollment, life events, claims processing, and cost analysis."
      accentColor="bg-amber-500/10 text-amber-500"
      badge="45+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Plan Configuration" icon={Settings}>
            <CapabilityItem>Health, life, and pension plans</CapabilityItem>
            <CapabilityItem>Voluntary benefit options</CapabilityItem>
            <CapabilityItem>Multi-tier coverage structures</CapabilityItem>
            <CapabilityItem>Contribution rules and formulas</CapabilityItem>
            <CapabilityItem>Dependent eligibility rules</CapabilityItem>
            <CapabilityItem>Plan versioning and renewals</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Enrollment Management" icon={Users}>
            <CapabilityItem>Open enrollment campaigns</CapabilityItem>
            <CapabilityItem>Life event processing</CapabilityItem>
            <CapabilityItem>Eligibility rule enforcement</CapabilityItem>
            <CapabilityItem>Waiting period management</CapabilityItem>
            <CapabilityItem>Evidence of insurability</CapabilityItem>
            <CapabilityItem>Enrollment confirmations</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Claims Processing" icon={FileText}>
            <CapabilityItem>Claim submission portal</CapabilityItem>
            <CapabilityItem>Adjudication workflows</CapabilityItem>
            <CapabilityItem>Payment tracking</CapabilityItem>
            <CapabilityItem>Appeals management</CapabilityItem>
            <CapabilityItem>EOB generation</CapabilityItem>
            <CapabilityItem>Claim history and reporting</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Cost & Analytics" icon={DollarSign}>
            <CapabilityItem>Utilization analysis</CapabilityItem>
            <CapabilityItem>Cost trend reporting</CapabilityItem>
            <CapabilityItem>Provider rate management</CapabilityItem>
            <CapabilityItem>Renewal forecasting</CapabilityItem>
            <CapabilityItem>Employee cost modeling</CapabilityItem>
            <CapabilityItem>Compliance reporting</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean health scheme integration, African pension requirements, regional statutory benefit compliance
        </RegionalBadge>

        <AIFeatureHighlight compact>
          <AICapability type="prescriptive">Personalized plan recommendations</AICapability>
          <AICapability type="predictive">Cost and utilization predictions</AICapability>
          <AICapability type="analytics">Optimization opportunities identification</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Deduction calculations and contributions" },
            { module: "Workforce", description: "Dependent and eligibility data" },
            { module: "ESS", description: "Self-service enrollment and claims" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}

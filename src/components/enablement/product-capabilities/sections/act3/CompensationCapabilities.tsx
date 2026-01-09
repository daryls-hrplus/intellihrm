import { DollarSign, TrendingUp, BarChart3, Scale, Award, Calculator } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export function CompensationCapabilities() {
  return (
    <ModuleCapabilityCard
      id="compensation"
      icon={TrendingUp}
      title="Compensation"
      tagline="Strategic compensation planning with market intelligence"
      overview="Comprehensive compensation management including salary structures, planning cycles, market benchmarking, and pay equity analysis."
      accentColor="bg-amber-500/10 text-amber-500"
      badge="25+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Salary Structures" icon={DollarSign}>
            <CapabilityItem>Grade and band configuration</CapabilityItem>
            <CapabilityItem>Salary ranges with min/mid/max</CapabilityItem>
            <CapabilityItem>Geographic differentials</CapabilityItem>
            <CapabilityItem>Multi-currency handling</CapabilityItem>
            <CapabilityItem>Spinal point systems</CapabilityItem>
            <CapabilityItem>Job family alignment</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Planning Cycles" icon={Calculator}>
            <CapabilityItem>Merit increase planning</CapabilityItem>
            <CapabilityItem>Bonus cycle management</CapabilityItem>
            <CapabilityItem>Equity grant planning</CapabilityItem>
            <CapabilityItem>Budget controls and limits</CapabilityItem>
            <CapabilityItem>Manager worksheets</CapabilityItem>
            <CapabilityItem>Approval workflows</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Market Analysis" icon={BarChart3}>
            <CapabilityItem>Compa-ratio calculations</CapabilityItem>
            <CapabilityItem>Quartile positioning</CapabilityItem>
            <CapabilityItem>Market benchmark comparison</CapabilityItem>
            <CapabilityItem>Salary survey integration</CapabilityItem>
            <CapabilityItem>Competitive analysis</CapabilityItem>
            <CapabilityItem>Market movement tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Pay Equity & Rewards" icon={Scale}>
            <CapabilityItem>Pay equity analysis</CapabilityItem>
            <CapabilityItem>Gender pay gap reporting</CapabilityItem>
            <CapabilityItem>Total rewards statements</CapabilityItem>
            <CapabilityItem>Benefit valuation</CapabilityItem>
            <CapabilityItem>Comprehensive view dashboards</CapabilityItem>
            <CapabilityItem>Minimum wage compliance</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight compact>
          <AICapability type="prescriptive">Market-based adjustment recommendations</AICapability>
          <AICapability type="analytics">Pay equity risk identification</AICapability>
          <AICapability type="predictive">Budget optimization scenarios</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Salary changes and effective dates" },
            { module: "Performance", description: "Rating-based increase guidelines" },
            { module: "Recruitment", description: "Offer salary benchmarking" },
            { module: "Budgeting", description: "Position cost planning" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}

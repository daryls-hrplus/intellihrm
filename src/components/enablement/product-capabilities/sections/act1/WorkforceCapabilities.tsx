import { Users, Building2, Briefcase, GitBranch, Clock, FileText } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";

export function WorkforceCapabilities() {
  return (
    <ModuleCapabilityCard
      id="workforce"
      icon={Users}
      title="Workforce Management"
      tagline="The complete employee record, from hire to retire"
      overview="Comprehensive employee master data, organization structure, position management, and workforce analytics. The core of your HR operations."
      accentColor="bg-blue-500/10 text-blue-500"
      badge="100+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Employee Master Data" icon={Users}>
            <CapabilityItem>16+ configurable data tabs</CapabilityItem>
            <CapabilityItem>100+ standard fields with custom field support</CapabilityItem>
            <CapabilityItem>Document attachments and expiry tracking</CapabilityItem>
            <CapabilityItem>Employment history and transactions</CapabilityItem>
            <CapabilityItem>Government ID management (TRN, NIS, etc.)</CapabilityItem>
            <CapabilityItem>Dependent and emergency contact tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Organization Structure" icon={Building2}>
            <CapabilityItem>Interactive org charts with date filtering</CapabilityItem>
            <CapabilityItem>Department and division hierarchies</CapabilityItem>
            <CapabilityItem>Cost center management</CapabilityItem>
            <CapabilityItem>Location and site configuration</CapabilityItem>
            <CapabilityItem>Reporting relationship management</CapabilityItem>
            <CapabilityItem>Org change tracking and history</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Position Management" icon={Briefcase}>
            <CapabilityItem>Job catalog with job families</CapabilityItem>
            <CapabilityItem>Position budgeting and control</CapabilityItem>
            <CapabilityItem>Vacancy tracking and reporting</CapabilityItem>
            <CapabilityItem>Competency and skill requirements</CapabilityItem>
            <CapabilityItem>Headcount planning and requests</CapabilityItem>
            <CapabilityItem>Position history and incumbents</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Lifecycle & Transactions" icon={GitBranch}>
            <CapabilityItem>Promotions and transfers</CapabilityItem>
            <CapabilityItem>Terminations with exit workflows</CapabilityItem>
            <CapabilityItem>Rehire processing</CapabilityItem>
            <CapabilityItem>Mass update capabilities</CapabilityItem>
            <CapabilityItem>Onboarding checklists and tasks</CapabilityItem>
            <CapabilityItem>Offboarding and clearance</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean statutory IDs (TRN, NIS, NHT), African national ID formats, multi-country employment support
        </RegionalBadge>

        <AIFeatureHighlight>
          <AICapability type="predictive">Attrition risk scoring and alerts</AICapability>
          <AICapability type="analytics">Monte Carlo workforce forecasting</AICapability>
          <AICapability type="prescriptive">Org structure optimization recommendations</AICapability>
          <AICapability type="automated">Probation tracking and alerts</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Payroll", description: "Employee compensation and banking data", bidirectional: true },
            { module: "Time & Attendance", description: "Schedule assignments and time records" },
            { module: "Performance", description: "Manager relationships and goal owners" },
            { module: "Succession", description: "9-Box placement and career paths" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}

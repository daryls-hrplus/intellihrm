import { Package, Laptop, ClipboardList, BarChart3, Settings } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export const CompanyPropertyCapabilities = () => {
  return (
    <ModuleCapabilityCard
      icon={Package}
      title="Company Property"
      tagline="Track and manage all employee-assigned assets"
      overview="Comprehensive asset management from assignment to return. Track company property throughout the employee lifecycle and maintain accurate inventory records."
      accentColor="red"
    >
      <CapabilityCategory title="Asset Registry" icon={ClipboardList}>
        <li>Complete asset inventory management</li>
        <li>Asset categorization and tagging</li>
        <li>Depreciation tracking</li>
        <li>Maintenance schedule management</li>
        <li>Asset lifecycle tracking</li>
        <li>Barcode/QR code integration</li>
      </CapabilityCategory>

      <CapabilityCategory title="Asset Assignment" icon={Laptop}>
        <li>Employee asset issuance workflows</li>
        <li>Return tracking and verification</li>
        <li>Condition reporting at issue/return</li>
        <li>Digital acknowledgment signatures</li>
        <li>Asset transfer between employees</li>
        <li>Temporary assignment management</li>
      </CapabilityCategory>

      <CapabilityCategory title="Lifecycle Integration" icon={Settings}>
        <li>Onboarding asset provisioning automation</li>
        <li>Offboarding return checklist integration</li>
        <li>Department-based standard kits</li>
        <li>Cost center allocation</li>
        <li>Budget impact tracking</li>
      </CapabilityCategory>

      <CapabilityCategory title="Asset Analytics" icon={BarChart3}>
        <li>Asset utilization reports</li>
        <li>Lifecycle cost analysis</li>
        <li>Replacement planning forecasts</li>
        <li>Loss and damage tracking</li>
        <li>Vendor performance metrics</li>
      </CapabilityCategory>

      <AIFeatureHighlight>
        <AICapability type="predictive">Maintenance need predictions based on usage patterns</AICapability>
        <AICapability type="prescriptive">Optimal replacement timing recommendations</AICapability>
        <AICapability type="automated">Utilization optimization suggestions</AICapability>
      </AIFeatureHighlight>

      <ModuleIntegrations
        integrations={[
          { module: "Workforce", description: "Employee data and department assignment" },
          { module: "Employee Relations", description: "Offboarding clearance checklist" },
          { module: "Payroll", description: "Asset deduction for non-return" }
        ]}
      />
    </ModuleCapabilityCard>
  );
};

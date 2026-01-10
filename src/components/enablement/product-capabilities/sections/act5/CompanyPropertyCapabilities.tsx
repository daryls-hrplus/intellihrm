import { 
  Package, Laptop, ClipboardList, BarChart3, Settings, 
  FolderKanban, ArrowRightLeft, FileQuestion, Wrench, DollarSign
} from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { ValueStoryHeader } from "../../components/ValueStoryHeader";

export const CompanyPropertyCapabilities = () => {
  const outcomes = [
    { metric: "98%+", label: "Asset Recovery Rate", description: "Offboarding integration" },
    { metric: "30%+", label: "Extended Asset Life", description: "Proactive maintenance" },
    { metric: "100%", label: "Assignment Tracking", description: "Complete visibility" },
    { metric: "Accurate", label: "Depreciation Tracking", description: "Financial compliance" },
  ];

  const personas = [
    { role: "Employee", value: "I know what I'm responsible for and can request what I need" },
    { role: "Manager", value: "I see my team's assets and can approve requests" },
    { role: "IT/Facilities", value: "Complete inventory visibility and maintenance scheduling" },
    { role: "Finance", value: "Accurate depreciation and cost tracking" },
  ];

  return (
    <ModuleCapabilityCard
      icon={Package}
      title="Company Property"
      tagline="Track and manage all employee-assigned assets"
      overview="Comprehensive asset management from assignment to return. From purchase to disposal, from maintenance scheduling to depreciation tracking—every asset is tracked, maintained, and accounted for. Onboarding provisions the right equipment automatically. Offboarding ensures complete recovery. AI predicts maintenance needs and optimizes replacement timing."
      accentColor="bg-red-500/10 text-red-600"
      badge="65+ Capabilities"
      id="company-property"
    >
      <div className="space-y-6">
        <ValueStoryHeader
          challenge="Company assets disappear. Laptops go missing during offboarding. Equipment maintenance is forgotten until failures occur. IT can't track who has what. Finance can't account for depreciation. Without asset visibility, organizations lose money, face compliance issues, and create security vulnerabilities."
          promise="Intelli HRM Company Property provides complete asset lifecycle visibility. From purchase to disposal, from assignment to return—every asset is tracked, maintained, and accounted for. Onboarding provisions the right equipment automatically. Offboarding ensures complete recovery. AI predicts maintenance needs and optimizes replacement timing."
          outcomes={outcomes}
          personas={personas}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Asset Registry" icon={ClipboardList}>
            <CapabilityItem>Complete asset inventory management</CapabilityItem>
            <CapabilityItem>Asset categorization and tagging</CapabilityItem>
            <CapabilityItem>Serial number and asset tag tracking</CapabilityItem>
            <CapabilityItem>Model and manufacturer records</CapabilityItem>
            <CapabilityItem>Warranty tracking and alerts</CapabilityItem>
            <CapabilityItem>Specifications and documentation</CapabilityItem>
            <CapabilityItem>Asset location tracking</CapabilityItem>
            <CapabilityItem>QR code/barcode generation</CapabilityItem>
            <CapabilityItem>Bulk import capabilities</CapabilityItem>
            <CapabilityItem>Asset photo and documentation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Asset Categories" icon={FolderKanban}>
            <CapabilityItem>Category configuration and hierarchy</CapabilityItem>
            <CapabilityItem>Depreciation rules by category</CapabilityItem>
            <CapabilityItem>Standard specifications per category</CapabilityItem>
            <CapabilityItem>Default assignment rules</CapabilityItem>
            <CapabilityItem>Category-based reporting</CapabilityItem>
            <CapabilityItem>Active/inactive status</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Asset Assignment" icon={Laptop}>
            <CapabilityItem>Employee asset issuance workflows</CapabilityItem>
            <CapabilityItem>Condition reporting at issue</CapabilityItem>
            <CapabilityItem>Digital acknowledgment signatures</CapabilityItem>
            <CapabilityItem>Expected return date tracking</CapabilityItem>
            <CapabilityItem>Asset transfer between employees</CapabilityItem>
            <CapabilityItem>Temporary assignment management</CapabilityItem>
            <CapabilityItem>Bulk assignment capabilities</CapabilityItem>
            <CapabilityItem>Assignment history tracking</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Asset Requests" icon={FileQuestion}>
            <CapabilityItem>Employee request submission</CapabilityItem>
            <CapabilityItem>Request type configuration</CapabilityItem>
            <CapabilityItem>Priority classification</CapabilityItem>
            <CapabilityItem>Business justification capture</CapabilityItem>
            <CapabilityItem>Approval workflow routing</CapabilityItem>
            <CapabilityItem>Request status tracking</CapabilityItem>
            <CapabilityItem>Fulfillment tracking</CapabilityItem>
            <CapabilityItem>Request analytics</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Asset Return" icon={ArrowRightLeft}>
            <CapabilityItem>Return initiation and scheduling</CapabilityItem>
            <CapabilityItem>Condition assessment at return</CapabilityItem>
            <CapabilityItem>Damage documentation</CapabilityItem>
            <CapabilityItem>Verification workflows</CapabilityItem>
            <CapabilityItem>Refurbishment tracking</CapabilityItem>
            <CapabilityItem>Reissue preparation</CapabilityItem>
            <CapabilityItem>Return acknowledgment</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Maintenance Management" icon={Wrench}>
            <CapabilityItem>Maintenance type configuration</CapabilityItem>
            <CapabilityItem>Scheduled maintenance calendar</CapabilityItem>
            <CapabilityItem>Maintenance request workflows</CapabilityItem>
            <CapabilityItem>Vendor assignment and tracking</CapabilityItem>
            <CapabilityItem>Cost tracking by maintenance</CapabilityItem>
            <CapabilityItem>Completion verification</CapabilityItem>
            <CapabilityItem>Maintenance history</CapabilityItem>
            <CapabilityItem>Preventive maintenance automation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Lifecycle Integration" icon={Settings}>
            <CapabilityItem>Onboarding asset provisioning automation</CapabilityItem>
            <CapabilityItem>Role-based standard equipment kits</CapabilityItem>
            <CapabilityItem>Offboarding return checklist integration</CapabilityItem>
            <CapabilityItem>Department-based default assignments</CapabilityItem>
            <CapabilityItem>Position change asset updates</CapabilityItem>
            <CapabilityItem>Termination asset recovery</CapabilityItem>
            <CapabilityItem>System access correlation</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Financial Tracking" icon={DollarSign}>
            <CapabilityItem>Purchase cost recording</CapabilityItem>
            <CapabilityItem>Depreciation calculation</CapabilityItem>
            <CapabilityItem>Current value tracking</CapabilityItem>
            <CapabilityItem>Cost center allocation</CapabilityItem>
            <CapabilityItem>Budget impact analysis</CapabilityItem>
            <CapabilityItem>Asset disposal value</CapabilityItem>
            <CapabilityItem>Write-off processing</CapabilityItem>
            <CapabilityItem>Financial reporting integration</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Vendor Management" icon={Package}>
            <CapabilityItem>Vendor registry</CapabilityItem>
            <CapabilityItem>Purchase tracking by vendor</CapabilityItem>
            <CapabilityItem>Maintenance vendor assignments</CapabilityItem>
            <CapabilityItem>Vendor performance metrics</CapabilityItem>
            <CapabilityItem>Contract tracking</CapabilityItem>
            <CapabilityItem>Warranty claim processing</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Asset Analytics" icon={BarChart3}>
            <CapabilityItem>Asset utilization reports</CapabilityItem>
            <CapabilityItem>Lifecycle cost analysis</CapabilityItem>
            <CapabilityItem>Replacement planning forecasts</CapabilityItem>
            <CapabilityItem>Loss and damage tracking</CapabilityItem>
            <CapabilityItem>Assignment distribution</CapabilityItem>
            <CapabilityItem>Category-based analytics</CapabilityItem>
            <CapabilityItem>AI-powered insights</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Maintenance need predictions based on usage patterns</AICapability>
          <AICapability type="prescriptive">Optimal replacement timing recommendations</AICapability>
          <AICapability type="automated">Utilization optimization suggestions</AICapability>
          <AICapability type="predictive">Asset failure prediction</AICapability>
          <AICapability type="prescriptive">Budget forecasting for replacements</AICapability>
          <AICapability type="automated">Anomaly detection in assignments</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Workforce", description: "Employee data and department assignment" },
            { module: "Employee Relations", description: "Offboarding clearance checklist" },
            { module: "Payroll", description: "Asset deduction for non-return" },
            { module: "Onboarding", description: "New hire equipment provisioning" },
            { module: "Finance", description: "Depreciation and GL integration" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
};

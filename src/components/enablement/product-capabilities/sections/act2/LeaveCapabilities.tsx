import { Calendar, Clock, Settings, BarChart3, Users, FileText } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";
import { RegionalBadge } from "../../components/RegionalBadge";

export function LeaveCapabilities() {
  return (
    <ModuleCapabilityCard
      id="leave"
      icon={Calendar}
      title="Leave Management"
      tagline="Flexible leave policies for every scenario"
      overview="Comprehensive leave administration with configurable types, accrual rules, self-service requests, and compliance tracking."
      accentColor="bg-emerald-500/10 text-emerald-500"
      badge="35+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="Leave Types & Rules" icon={Settings}>
            <CapabilityItem>30+ configurable leave types</CapabilityItem>
            <CapabilityItem>Carry-forward and expiry rules</CapabilityItem>
            <CapabilityItem>Accrual calculation engines</CapabilityItem>
            <CapabilityItem>Service-based entitlements</CapabilityItem>
            <CapabilityItem>Pro-ration for mid-year joins</CapabilityItem>
            <CapabilityItem>Leave encashment policies</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Request & Approval" icon={Users}>
            <CapabilityItem>Self-service leave requests</CapabilityItem>
            <CapabilityItem>Multi-level approval workflows</CapabilityItem>
            <CapabilityItem>Delegation during absence</CapabilityItem>
            <CapabilityItem>Escalation rules</CapabilityItem>
            <CapabilityItem>Bulk approval actions</CapabilityItem>
            <CapabilityItem>Request cancellation handling</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Balance & Tracking" icon={Clock}>
            <CapabilityItem>Real-time balance display</CapabilityItem>
            <CapabilityItem>Future balance projections</CapabilityItem>
            <CapabilityItem>Entitlement summaries</CapabilityItem>
            <CapabilityItem>Accrual history and logs</CapabilityItem>
            <CapabilityItem>Year-end processing</CapabilityItem>
            <CapabilityItem>Balance adjustments</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Calendar & Compliance" icon={Calendar}>
            <CapabilityItem>Team absence calendar</CapabilityItem>
            <CapabilityItem>Blackout period configuration</CapabilityItem>
            <CapabilityItem>Coverage requirements</CapabilityItem>
            <CapabilityItem>Public holiday calendars</CapabilityItem>
            <CapabilityItem>Conflict detection</CapabilityItem>
            <CapabilityItem>Statutory leave compliance</CapabilityItem>
          </CapabilityCategory>
        </div>

        <RegionalBadge regions={["Caribbean", "Africa"]}>
          Caribbean statutory leave (vacation, sick, maternity/paternity by country), African public holidays, regional labor law compliance
        </RegionalBadge>

        <AIFeatureHighlight compact>
          <AICapability type="predictive">Staffing impact predictions from leave patterns</AICapability>
          <AICapability type="automated">Optimal approval routing based on coverage</AICapability>
          <AICapability type="analytics">Absence pattern detection and reporting</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "Time & Attendance", description: "Absence records and time tracking" },
            { module: "Payroll", description: "Leave pay calculations" },
            { module: "Workforce", description: "Coverage and staffing levels" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}

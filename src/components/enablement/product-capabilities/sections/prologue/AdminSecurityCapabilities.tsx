import { Shield, Users, Lock, Eye, Settings, FileText, AlertTriangle } from "lucide-react";
import { ModuleCapabilityCard } from "../../components/ModuleCapabilityCard";
import { CapabilityCategory, CapabilityItem } from "../../components/CapabilityCategory";
import { AIFeatureHighlight, AICapability } from "../../components/AIFeatureHighlight";
import { ModuleIntegrations } from "../../components/IntegrationPoint";

export function AdminSecurityCapabilities() {
  return (
    <ModuleCapabilityCard
      id="admin-security"
      icon={Shield}
      title="Admin & Security"
      tagline="Enterprise-grade security that scales with you"
      overview="Foundation for all platform operations with comprehensive user management, role-based access control, and full audit capabilities."
      accentColor="bg-red-500/10 text-red-500"
      badge="45+ Capabilities"
    >
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <CapabilityCategory title="User Management" icon={Users}>
            <CapabilityItem>User creation and provisioning</CapabilityItem>
            <CapabilityItem>Bulk user import/export</CapabilityItem>
            <CapabilityItem>Delegation matrix configuration</CapabilityItem>
            <CapabilityItem>Access expiry and auto-deactivation</CapabilityItem>
            <CapabilityItem>Password policies and enforcement</CapabilityItem>
            <CapabilityItem>Multi-factor authentication (MFA)</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Role-Based Access" icon={Lock}>
            <CapabilityItem>Granular permission management</CapabilityItem>
            <CapabilityItem>Function-level security controls</CapabilityItem>
            <CapabilityItem>PII field protection</CapabilityItem>
            <CapabilityItem>Role inheritance hierarchies</CapabilityItem>
            <CapabilityItem>Custom role creation</CapabilityItem>
            <CapabilityItem>Module-level access control</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="Audit & Compliance" icon={Eye}>
            <CapabilityItem>Complete activity logging</CapabilityItem>
            <CapabilityItem>Security audit reports</CapabilityItem>
            <CapabilityItem>GDPR compliance controls</CapabilityItem>
            <CapabilityItem>Data retention policies</CapabilityItem>
            <CapabilityItem>Investigation request tracking</CapabilityItem>
            <CapabilityItem>Compliance dashboards</CapabilityItem>
          </CapabilityCategory>

          <CapabilityCategory title="System Configuration" icon={Settings}>
            <CapabilityItem>Business rules engine</CapabilityItem>
            <CapabilityItem>Lookup values management</CapabilityItem>
            <CapabilityItem>Document type configuration</CapabilityItem>
            <CapabilityItem>Workflow template builder</CapabilityItem>
            <CapabilityItem>Custom field definitions</CapabilityItem>
            <CapabilityItem>Company settings management</CapabilityItem>
          </CapabilityCategory>
        </div>

        <AIFeatureHighlight>
          <AICapability type="predictive">Anomaly detection in access patterns</AICapability>
          <AICapability type="analytics">Security risk scoring and alerts</AICapability>
          <AICapability type="automated">Suspicious activity flagging</AICapability>
        </AIFeatureHighlight>

        <ModuleIntegrations
          integrations={[
            { module: "All Modules", description: "Central authentication and authorization", bidirectional: true },
            { module: "Payroll", description: "Sensitive data access controls" },
            { module: "HR Hub", description: "Policy enforcement integration" },
          ]}
        />
      </div>
    </ModuleCapabilityCard>
  );
}
